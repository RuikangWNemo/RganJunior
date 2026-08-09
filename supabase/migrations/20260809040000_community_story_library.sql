-- Community story library: primary categories, author tags, trash, and public square metadata.

create table public.article_categories (
  id bigint generated always as identity primary key,
  slug text not null,
  name_zh text not null,
  name_en text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint article_categories_slug_format_check check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint article_categories_name_zh_check check (
    char_length(btrim(name_zh)) between 1 and 80
  ),
  constraint article_categories_name_en_check check (
    name_en is null or char_length(btrim(name_en)) between 1 and 120
  )
);

create unique index article_categories_slug_lower_uidx
  on public.article_categories (lower(slug));
create unique index article_categories_name_zh_lower_uidx
  on public.article_categories (lower(btrim(name_zh)));
create index article_categories_active_sort_idx
  on public.article_categories (sort_order, id)
  where is_active;
create index article_categories_created_by_idx
  on public.article_categories (created_by)
  where created_by is not null;

create trigger article_categories_set_updated_at
before update on public.article_categories
for each row execute function private.set_updated_at();

create or replace function private.protect_article_category_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  new.slug = lower(btrim(new.slug));
  new.name_zh = btrim(new.name_zh);
  new.name_en = nullif(btrim(new.name_en), '');
  if tg_op = 'INSERT' then
    if caller is not null then
      new.created_by = caller;
    end if;
    return new;
  end if;
  if new.id is distinct from old.id
     or new.created_by is distinct from old.created_by
     or new.created_at is distinct from old.created_at then
    raise exception using errcode = '42501', message = 'ARTICLE_CATEGORY_SYSTEM_FIELDS_IMMUTABLE';
  end if;
  return new;
end;
$$;

create trigger article_categories_protect_fields
before insert or update on public.article_categories
for each row execute function private.protect_article_category_fields();

create trigger article_categories_audit_changes
after insert or update or delete on public.article_categories
for each row execute function private.audit_row_change('article_category');

insert into public.article_categories (slug, name_zh, name_en, sort_order, created_by)
values
  ('people-stories', '人物故事', 'People Stories', 10, null),
  ('local-practice', '在地实践', 'Local Practice', 20, null),
  ('youth-action', '青年行动', 'Youth Action', 30, null),
  ('nature-observation', '自然观察', 'Nature Observation', 40, null),
  ('program-notes', '项目记录', 'Program Notes', 50, null);

alter table public.field_notes
  add column category_id bigint references public.article_categories(id) on delete restrict;

create index field_notes_category_published_idx
  on public.field_notes (category_id, published_at desc, id desc)
  where status = 'published';

alter table public.article_categories enable row level security;
revoke all on public.article_categories from anon, authenticated;
grant select on public.article_categories to anon, authenticated;
grant insert, update on public.article_categories to authenticated;
grant usage, select on sequence public.article_categories_id_seq to authenticated;

create policy article_categories_select_active
on public.article_categories for select
to anon, authenticated
using (is_active);

create policy article_categories_select_authorized
on public.article_categories for select
to authenticated
using (private.has_permission('topics.manage'));

create policy article_categories_insert_authorized
on public.article_categories for insert
to authenticated
with check (private.has_permission('topics.manage'));

create policy article_categories_update_authorized
on public.article_categories for update
to authenticated
using (private.has_permission('topics.manage'))
with check (private.has_permission('topics.manage'));

create or replace function private.link_field_note_owner_as_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.field_note_authors (field_note_id, person_id, author_order, contribution_role)
  select new.id, p.id, 0, 'author'
  from public.people p
  where p.user_id = new.created_by
  order by p.id
  limit 1
  on conflict (field_note_id, person_id) do nothing;
  return null;
end;
$$;

revoke all on function private.link_field_note_owner_as_author()
  from public, anon, authenticated;

create trigger field_notes_link_owner_as_author
after insert on public.field_notes
for each row execute function private.link_field_note_owner_as_author();

insert into public.field_note_authors (field_note_id, person_id, author_order, contribution_role)
select fn.id, p.id, 0, 'author'
from public.field_notes fn
join public.people p on p.user_id = fn.created_by
where not exists (
  select 1
  from public.field_note_authors fna
  where fna.field_note_id = fn.id
)
on conflict (field_note_id, person_id) do nothing;

create or replace function private.enforce_field_note_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  transition_allowed boolean := false;
  body_changed boolean := false;
  metadata_changed boolean := false;
begin
  if tg_op = 'INSERT' then
    if caller is not null then
      new.created_by = caller;
      if new.status <> 'draft' then
        raise exception using errcode = '42501', message = 'FIELD_NOTE_MUST_START_AS_DRAFT';
      end if;
      new.submitted_at = null;
      new.reviewed_at = null;
      new.approved_at = null;
      new.published_at = null;
      new.archived_at = null;
    end if;
    return new;
  end if;

  if new.id is distinct from old.id
     or new.created_by is distinct from old.created_by
     or new.created_at is distinct from old.created_at then
    raise exception using errcode = '42501', message = 'FIELD_NOTE_SYSTEM_FIELDS_IMMUTABLE';
  end if;

  if caller is null then
    return new;
  end if;

  body_changed := new.title is distinct from old.title
    or new.subtitle is distinct from old.subtitle
    or new.excerpt is distinct from old.excerpt
    or new.content is distinct from old.content
    or new.content_json is distinct from old.content_json
    or new.content_html is distinct from old.content_html
    or new.content_schema_version is distinct from old.content_schema_version
    or new.language is distinct from old.language
    or new.translation_of_id is distinct from old.translation_of_id
    or new.seo_title is distinct from old.seo_title
    or new.seo_description is distinct from old.seo_description;

  metadata_changed := new.visibility is distinct from old.visibility
    or new.category_id is distinct from old.category_id;

  if new.featured is distinct from old.featured
     and not private.has_permission('field_notes.publish') then
    raise exception using errcode = '42501', message = 'FIELD_NOTE_PUBLICATION_FIELDS_NOT_ALLOWED';
  end if;

  if metadata_changed
     and not private.user_can_edit_field_note_row(old.id, caller)
     and not private.has_permission('field_notes.publish') then
    raise exception using errcode = '42501', message = 'FIELD_NOTE_METADATA_NOT_ALLOWED';
  end if;

  if new.collaboration_mode is distinct from old.collaboration_mode
     and not private.user_can_manage_field_note_collaboration(old.id, caller) then
    raise exception using errcode = '42501', message = 'FIELD_NOTE_COLLABORATION_MODE_NOT_ALLOWED';
  end if;

  if body_changed and not private.user_can_edit_field_note_row(old.id, caller) then
    raise exception using errcode = '42501', message = 'FIELD_NOTE_EDIT_NOT_ALLOWED';
  end if;

  new.submitted_at = old.submitted_at;
  new.reviewed_at = old.reviewed_at;
  new.approved_at = old.approved_at;
  new.published_at = old.published_at;
  new.archived_at = old.archived_at;

  if new.status is distinct from old.status then
    transition_allowed :=
      (
        old.status in ('draft', 'changes_requested')
        and new.status = 'submitted'
        and old.created_by = caller
        and private.has_permission('field_notes.submit')
      )
      or (
        old.status = 'draft'
        and new.status = 'archived'
        and old.created_by = caller
        and private.has_active_membership(caller)
        and private.has_permission('field_notes.edit_own')
      )
      or (
        old.status = 'archived'
        and new.status = 'draft'
        and old.created_by = caller
        and private.has_active_membership(caller)
        and private.has_permission('field_notes.edit_own')
      )
      or (
        old.status = 'submitted'
        and new.status = 'in_review'
        and private.has_permission('field_notes.review')
      )
      or (
        old.status = 'in_review'
        and new.status = 'changes_requested'
        and private.has_permission('field_notes.review')
      )
      or (
        old.status = 'in_review'
        and new.status = 'approved'
        and private.has_permission('field_notes.approve')
      )
      or (
        old.status = 'approved'
        and new.status = 'published'
        and private.has_permission('field_notes.publish')
      )
      or (
        old.status <> 'archived'
        and new.status = 'archived'
        and private.has_permission('field_notes.archive')
      );

    if not transition_allowed then
      raise exception using errcode = '42501', message = 'FIELD_NOTE_TRANSITION_NOT_ALLOWED';
    end if;

    if new.status = 'submitted' then
      if new.category_id is null or not exists (
        select 1
        from public.article_categories ac
        where ac.id = new.category_id
          and ac.is_active
      ) then
        raise exception using errcode = '22023', message = 'FIELD_NOTE_CATEGORY_REQUIRED';
      end if;
      new.submitted_at = statement_timestamp();
    elsif new.status in ('in_review', 'changes_requested') then
      new.reviewed_at = statement_timestamp();
    elsif new.status = 'approved' then
      new.approved_at = statement_timestamp();
    elsif new.status = 'published' then
      new.published_at = statement_timestamp();
    elsif new.status = 'archived' then
      new.archived_at = statement_timestamp();
    elsif old.status = 'archived' and new.status = 'draft' then
      new.archived_at = null;
    end if;
  end if;

  return new;
end;
$$;

drop policy field_notes_update_authorized on public.field_notes;
create policy field_notes_update_authorized
on public.field_notes for update
to authenticated
using (
  private.can_edit_field_note(id)
  or (
    created_by = (select auth.uid())
    and status = 'archived'
    and private.has_permission('field_notes.edit_own')
  )
  or private.has_permission('field_notes.submit')
  or private.has_permission('field_notes.review')
  or private.has_permission('field_notes.approve')
  or private.has_permission('field_notes.publish')
  or private.has_permission('field_notes.archive')
)
with check (
  created_by = (select auth.uid())
  or private.has_permission('field_notes.edit_any')
  or private.has_permission('field_notes.review')
  or private.has_permission('field_notes.approve')
  or private.has_permission('field_notes.publish')
  or private.has_permission('field_notes.archive')
);

grant delete on public.field_notes to authenticated;

create policy field_notes_delete_owned_trash
on public.field_notes for delete
to authenticated
using (
  created_by = (select auth.uid())
  and status = 'archived'
  and private.has_active_membership((select auth.uid()))
  and private.has_permission('field_notes.edit_own')
);

create or replace function public.find_or_create_field_note_tag(
  tag_name_zh text,
  tag_name_en text default null
)
returns public.topics
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  normalized_zh text := btrim(tag_name_zh);
  normalized_en text := nullif(btrim(tag_name_en), '');
  result public.topics;
begin
  if caller is null
     or not private.has_active_membership(caller)
     or not private.user_has_permission(caller, 'field_notes.create') then
    raise exception using errcode = '42501', message = 'FIELD_NOTE_TAG_CREATE_NOT_ALLOWED';
  end if;
  if char_length(normalized_zh) < 1 or char_length(normalized_zh) > 40
     or (normalized_en is not null and char_length(normalized_en) > 80) then
    raise exception using errcode = '22023', message = 'INVALID_FIELD_NOTE_TAG';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(lower(normalized_zh), 0));
  select t.* into result
  from public.topics t
  where lower(btrim(t.name_zh)) = lower(normalized_zh)
    and t.archived_at is null
  order by t.is_active desc, t.id
  limit 1;

  if found then
    if not result.is_active then
      raise exception using errcode = '22023', message = 'FIELD_NOTE_TAG_INACTIVE';
    end if;
    return result;
  end if;

  insert into public.topics (
    slug,
    name_zh,
    name_en,
    sort_order,
    is_active,
    created_by
  ) values (
    'tag-' || substring(md5(lower(normalized_zh)) from 1 for 24),
    normalized_zh,
    normalized_en,
    1000,
    true,
    caller
  )
  returning * into result;
  return result;
end;
$$;

revoke all on function public.find_or_create_field_note_tag(text, text)
  from public, anon, authenticated;
grant execute on function public.find_or_create_field_note_tag(text, text)
  to authenticated;

create or replace function public.save_field_note_metadata(
  target_field_note_id bigint,
  target_category_id bigint,
  target_topic_ids bigint[] default '{}'::bigint[],
  target_visibility text default 'private'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  normalized_topic_ids bigint[] := array(
    select distinct topic_id
    from unnest(coalesce(target_topic_ids, '{}'::bigint[])) topic_id
    order by topic_id
  );
begin
  if caller is null
     or not private.user_can_edit_field_note_row(target_field_note_id, caller) then
    raise exception using errcode = '42501', message = 'FIELD_NOTE_METADATA_NOT_ALLOWED';
  end if;
  if target_visibility not in ('private', 'members', 'public') then
    raise exception using errcode = '22023', message = 'INVALID_FIELD_NOTE_VISIBILITY';
  end if;
  if target_category_id is not null and not exists (
    select 1
    from public.article_categories ac
    where ac.id = target_category_id
      and ac.is_active
  ) then
    raise exception using errcode = '22023', message = 'INVALID_FIELD_NOTE_CATEGORY';
  end if;
  if cardinality(normalized_topic_ids) > 12 then
    raise exception using errcode = '22023', message = 'TOO_MANY_FIELD_NOTE_TAGS';
  end if;
  if exists (
    select 1
    from unnest(normalized_topic_ids) topic_id
    left join public.topics t on t.id = topic_id
    where t.id is null or not t.is_active or t.archived_at is not null
  ) then
    raise exception using errcode = '22023', message = 'INVALID_FIELD_NOTE_TAG';
  end if;

  update public.field_notes
  set category_id = target_category_id,
      visibility = target_visibility
  where id = target_field_note_id;

  delete from public.field_note_topics
  where field_note_id = target_field_note_id
    and not (topic_id = any(normalized_topic_ids));

  insert into public.field_note_topics (field_note_id, topic_id)
  select target_field_note_id, topic_id
  from unnest(normalized_topic_ids) topic_id
  on conflict (field_note_id, topic_id) do nothing;
end;
$$;

revoke all on function public.save_field_note_metadata(bigint, bigint, bigint[], text)
  from public, anon, authenticated;
grant execute on function public.save_field_note_metadata(bigint, bigint, bigint[], text)
  to authenticated;

comment on table public.article_categories is
  'Administrator-maintained primary categories for community Field Notes.';
comment on function public.find_or_create_field_note_tag(text, text) is
  'Creates or reuses an active author-created Field Note tag for active community members.';
comment on function public.save_field_note_metadata(bigint, bigint, bigint[], text) is
  'Atomically saves editable Field Note category, tag relationships, and visibility.';
