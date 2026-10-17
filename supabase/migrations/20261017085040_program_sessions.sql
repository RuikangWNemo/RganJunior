-- Admin-managed program products and sessions. No changes to existing applications.
insert into public.permissions(permission_key, description, is_sensitive)
values ('programs.manage', 'Create, edit and publish program sessions and product categories', true)
on conflict (permission_key) do nothing;
insert into public.roles(slug, name, description)
values ('program_editor', '营期编辑', '维护项目分类、营期和招募回顾资料')
on conflict (lower(slug)) do nothing;
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.slug = 'program_editor' and p.permission_key = 'programs.manage'
on conflict do nothing;

create table public.program_products (
  id uuid primary key default gen_random_uuid(),
  program_id text not null check (program_id in ('life-experience-camp','life-co-creation-camp','action-group','public-projects')),
  name_zh text not null check (length(trim(name_zh)) between 1 and 100),
  name_en text not null default '' check (length(name_en) <= 160),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  unique(program_id, name_zh)
);
create table public.program_sessions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.program_products(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 100),
  title_zh text not null check (length(trim(title_zh)) between 1 and 160),
  title_en text not null default '' check (length(title_en) <= 240),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  phase text not null default 'upcoming' check (phase in ('upcoming','past')),
  registration_state text not null default 'interest' check (registration_state in ('interest','open','closed')),
  starts_on date,
  ends_on date,
  date_label_zh text not null default '',
  date_label_en text not null default '',
  location_zh text not null default '',
  location_en text not null default '',
  description_zh text not null default '',
  description_en text not null default '',
  highlights_zh text[] not null default '{}',
  highlights_en text[] not null default '{}',
  photos jsonb not null default '[]' check (jsonb_typeof(photos) = 'array' and jsonb_array_length(photos) <= 8),
  links jsonb not null default '[]' check (jsonb_typeof(links) = 'array' and jsonb_array_length(links) <= 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on),
  check (phase <> 'past' or registration_state = 'closed'),
  check (status <> 'published' or (length(trim(location_zh)) > 0 and (starts_on is not null or length(trim(date_label_zh)) > 0)))
);
-- Keep shared links stable even when editing through a direct API client.
create function private.validate_program_session()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.slug <> old.slug then
    raise exception 'Session URLs cannot change after creation';
  end if;
  if exists (
    select 1 from jsonb_array_elements(new.photos) p
    where jsonb_typeof(p) <> 'object' or coalesce(p->>'src','') !~ '^(/images/[A-Za-z0-9_/.-]+|[A-Za-z0-9_-]+/[A-Za-z0-9_.-]+)$'
      or length(trim(coalesce(p->>'alt_zh',''))) = 0
  ) then raise exception 'Invalid session photo'; end if;
  if exists (
    select 1 from jsonb_array_elements(new.links) l
    where jsonb_typeof(l) <> 'object' or coalesce(l->>'kind','') not in ('recruitment','registration','review','reference')
      or length(trim(coalesce(l->>'label_zh',''))) = 0
      or coalesce(l->>'href','') !~ '^(/[^/[:space:]\\]|https://[^[:space:]\\])'
      or l->>'href' ~ '[[:space:]\\]'
  ) then raise exception 'Invalid session link'; end if;
  if new.status = 'published' and new.registration_state = 'open'
    and not exists(select 1 from jsonb_array_elements(new.links) l where l->>'kind' = 'registration') then
    raise exception 'Open registration requires a registration link';
  end if;
  return new;
end;
$$;
revoke all on function private.validate_program_session() from public, anon, authenticated;
create trigger program_sessions_validate before insert or update on public.program_sessions
for each row execute function private.validate_program_session();

create index program_products_program_idx on public.program_products(program_id, sort_order);
create index program_sessions_product_idx on public.program_sessions(product_id, status, starts_on desc);
create index program_sessions_photos_idx on public.program_sessions using gin (photos);
create trigger program_products_updated before update on public.program_products for each row execute function private.set_updated_at();
create trigger program_sessions_updated before update on public.program_sessions for each row execute function private.set_updated_at();
create trigger program_products_audit after insert or update or delete on public.program_products for each row execute function private.audit_row_change('program_product');
create trigger program_sessions_audit after insert or update or delete on public.program_sessions for each row execute function private.audit_row_change('program_session');
alter table public.program_products enable row level security;
alter table public.program_sessions enable row level security;
revoke all on public.program_products, public.program_sessions from public, anon, authenticated;
grant select on public.program_products, public.program_sessions to anon, authenticated;
grant insert, update on public.program_products, public.program_sessions to authenticated;
create policy program_products_public on public.program_products for select to anon, authenticated using (is_active);
create policy program_products_admin on public.program_products for all to authenticated using ((select private.has_permission('programs.manage'))) with check ((select private.has_permission('programs.manage')));
create policy program_sessions_public on public.program_sessions for select to anon, authenticated using (
  status = 'published' and exists(select 1 from public.program_products p where p.id = product_id and p.is_active)
);
create policy program_sessions_admin on public.program_sessions for all to authenticated using ((select private.has_permission('programs.manage'))) with check ((select private.has_permission('programs.manage')));

-- Private photos: anonymous readers can sign only images attached to published sessions.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('program-media', 'program-media', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy program_media_public on storage.objects for select to anon, authenticated using (
  bucket_id = 'program-media' and exists (
    select 1 from public.program_sessions s where s.status = 'published'
      and s.photos @> jsonb_build_array(jsonb_build_object('src', name))
      and exists(select 1 from public.program_products p where p.id = s.product_id and p.is_active)
  )
);
create policy program_media_admin on storage.objects for all to authenticated using (
  bucket_id = 'program-media' and (select private.has_permission('programs.manage'))
) with check (bucket_id = 'program-media' and (select private.has_permission('programs.manage')));

insert into public.program_products(id,program_id,name_zh,name_en) values
('91000000-0000-4000-8000-000000000001','life-experience-camp','乡村生活体验','Village life'),
('91000000-0000-4000-8000-000000000002','life-co-creation-camp','自然与生活共创','Nature and shared living'),
('91000000-0000-4000-8000-000000000003','action-group','营后持续行动','Actions after camp'),
('91000000-0000-4000-8000-000000000004','public-projects','青少年议题研究','Youth research');
-- Existing published camp materials confirm season and places, not exact dates.
insert into public.program_sessions(product_id,slug,title_zh,title_en,status,phase,registration_state,date_label_zh,date_label_en,location_zh,location_en,description_zh,description_en,highlights_zh,highlights_en,photos,links)
values ('91000000-0000-4000-8000-000000000002','summer-life-co-creation-2026','2026 夏日生活共创营','Summer Life Co-creation Camp 2026','published','past','closed','2026 年夏天 · 5 天 4 夜','Summer 2026 · 5 days, 4 nights','南宝山 · 铁牛村','Nanbao Mountain · Tieniu Village','11 个孩子、10 个家庭，在共同生活中徒步、喝茶、运动、做饭和共创。','11 young people and 10 families shared five days of hiking, tea, sports, cooking, and creating together.',array['11 个孩子，10 个家庭','森林探索、采茶与共同做饭','把营地的相遇延续到日常'],array['11 young people and 10 families','Forest exploration, tea picking, and cooking together','Connections that continue after camp'],
'[{"src":"/images/programs/life-co-creation-camp-1280.webp","alt_zh":"伙伴们与共同创作的森林画卷合影","alt_en":"Participants with their shared forest artwork"},{"src":"/images/home/life-camp-02-forest-circle-1280.webp","alt_zh":"森林里的围坐交流","alt_en":"Sharing in the forest"}]',
'[{"kind":"recruitment","label_zh":"当时的营地邀请信","label_en":"Original camp invitation","href":"/community-stories/summer-co-creation-camp-invitation"},{"kind":"review","label_zh":"相信，然后看见：营地回顾","label_en":"Believe, then see: camp review","href":"/community-stories/believe-and-see-camp-review"},{"kind":"review","label_zh":"橙子的营地来信","label_en":"A letter from Orange","href":"/community-stories/chengzi-camp-letter"}]');
