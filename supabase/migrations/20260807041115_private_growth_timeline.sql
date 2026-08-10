-- Natural names, explicit registration time, and a private growth timeline.

alter table public.people
  add column nature_name text;

alter table public.profiles
  add column registered_at timestamptz;

update public.profiles p
set registered_at = coalesce(u.created_at, p.created_at)
from auth.users u
where u.id = p.user_id;

update public.profiles
set registered_at = created_at
where registered_at is null;

alter table public.profiles
  alter column registered_at set not null;

create or replace function private.protect_profile_system_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id
     or new.created_at is distinct from old.created_at
     or new.registered_at is distinct from old.registered_at then
    raise exception using
      errcode = '42501',
      message = 'PROFILE_SYSTEM_FIELDS_IMMUTABLE';
  end if;
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_roles integer;
begin
  insert into public.profiles (user_id, display_name, registered_at)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    coalesce(new.created_at, statement_timestamp())
  );

  insert into public.user_roles (user_id, role_id, assigned_by)
  select new.id, r.id, null
  from public.roles r
  where r.slug = 'member' and r.is_active;

  get diagnostics inserted_roles = row_count;
  if inserted_roles <> 1 then
    raise exception using errcode = '23514', message = 'MEMBER_ROLE_NOT_CONFIGURED';
  end if;

  update public.subscribers
  set user_id = new.id
  where user_id is null
    and lower(email) = lower(new.email);
  return new;
end;
$$;

create or replace function private.protect_media_asset_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  can_manage_any boolean := private.has_permission('media.manage_any');
  can_manage_impact boolean := private.has_permission('impact.manage');
begin
  if tg_op = 'INSERT' then
    if caller is not null then
      new.uploaded_by = caller;

      if new.storage_bucket = 'private-impact' then
        if not (can_manage_impact or can_manage_any) then
          raise exception using errcode = '42501', message = 'IMPACT_MEDIA_NOT_ALLOWED';
        end if;
        new.owner_user_id = null;
        new.visibility = 'private';
      elsif not can_manage_any then
        new.owner_user_id = caller;
        if new.storage_bucket = 'public-media' or new.visibility = 'public' then
          raise exception using errcode = '42501', message = 'MEDIA_PUBLICATION_NOT_ALLOWED';
        end if;
      end if;
    end if;
    return new;
  end if;

  if new.id is distinct from old.id
     or new.storage_bucket is distinct from old.storage_bucket
     or new.storage_path is distinct from old.storage_path
     or new.uploaded_by is distinct from old.uploaded_by
     or new.created_at is distinct from old.created_at then
    raise exception using errcode = '42501', message = 'MEDIA_SYSTEM_FIELDS_IMMUTABLE';
  end if;

  if caller is not null then
    if old.storage_bucket = 'private-impact' then
      if not (can_manage_impact or can_manage_any)
         or new.owner_user_id is not null
         or new.visibility <> 'private' then
        raise exception using errcode = '42501', message = 'IMPACT_MEDIA_NOT_ALLOWED';
      end if;
    elsif not can_manage_any then
      if new.owner_user_id is distinct from old.owner_user_id
         or new.visibility = 'public'
         or new.storage_bucket = 'public-media' then
        raise exception using errcode = '42501', message = 'MEDIA_PUBLICATION_NOT_ALLOWED';
      end if;
    end if;
  end if;
  return new;
end;
$$;

create table private.growth_records (
  id bigint generated always as identity primary key,
  person_id bigint not null references public.people(id) on delete restrict,
  observed_at timestamptz not null,
  observed_timezone text not null default 'Asia/Shanghai',
  title text,
  note text not null,
  recorded_by uuid not null references auth.users(id) on delete restrict default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint growth_records_note_not_blank_check check (length(trim(note)) > 0),
  constraint growth_records_timezone_length_check check (
    length(observed_timezone) between 1 and 80
  )
);

create index growth_records_person_timeline_idx
  on private.growth_records (person_id, observed_at desc, id desc)
  where archived_at is null;
create index growth_records_recorded_by_idx
  on private.growth_records (recorded_by, created_at desc);

create table private.growth_record_media (
  growth_record_id bigint not null
    references private.growth_records(id) on delete cascade,
  media_asset_id bigint not null
    references public.media_assets(id) on delete restrict,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_primary boolean not null default false,
  caption text,
  attached_by uuid not null references auth.users(id) on delete restrict default auth.uid(),
  attached_at timestamptz not null default now(),
  primary key (growth_record_id, media_asset_id)
);

create index growth_record_media_asset_idx
  on private.growth_record_media (media_asset_id, growth_record_id);
create index growth_record_media_attached_by_idx
  on private.growth_record_media (attached_by, attached_at desc);
create unique index growth_record_media_one_primary_uidx
  on private.growth_record_media (growth_record_id)
  where is_primary;

create or replace function private.is_valid_timezone(timezone_name text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1
    from pg_catalog.pg_timezone_names tz
    where tz.name = timezone_name
  );
$$;

revoke all on function private.is_valid_timezone(text) from public, anon, authenticated;

create or replace function private.validate_growth_record()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.observed_at > statement_timestamp() + interval '5 minutes' then
    raise exception using errcode = '22023', message = 'INVALID_OBSERVED_AT';
  end if;
  if not private.is_valid_timezone(new.observed_timezone) then
    raise exception using errcode = '22023', message = 'INVALID_OBSERVED_TIMEZONE';
  end if;

  new.title = nullif(trim(new.title), '');
  new.note = trim(new.note);

  if tg_op = 'INSERT' then
    if (select auth.uid()) is not null then
      new.recorded_by = (select auth.uid());
    end if;
    return new;
  end if;

  if new.id is distinct from old.id
     or new.person_id is distinct from old.person_id
     or new.recorded_by is distinct from old.recorded_by
     or new.created_at is distinct from old.created_at then
    raise exception using errcode = '42501', message = 'GROWTH_RECORD_SYSTEM_FIELDS_IMMUTABLE';
  end if;
  return new;
end;
$$;

create trigger growth_records_set_updated_at
before update on private.growth_records
for each row execute function private.set_updated_at();

create trigger growth_records_validate
before insert or update on private.growth_records
for each row execute function private.validate_growth_record();

create or replace function private.validate_growth_record_media()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from private.growth_records gr
    where gr.id = new.growth_record_id
      and gr.archived_at is null
  ) then
    raise exception using errcode = '22023', message = 'GROWTH_RECORD_NOT_FOUND';
  end if;

  if not exists (
    select 1
    from public.media_assets ma
    where ma.id = new.media_asset_id
      and ma.storage_bucket = 'private-impact'
      and ma.media_type = 'image'
      and ma.visibility = 'private'
      and ma.status = 'active'
  ) then
    raise exception using errcode = '22023', message = 'INVALID_GROWTH_MEDIA';
  end if;

  if tg_op = 'INSERT' then
    if (select auth.uid()) is not null then
      new.attached_by = (select auth.uid());
      new.attached_at = statement_timestamp();
    end if;
  elsif new.growth_record_id is distinct from old.growth_record_id
     or new.media_asset_id is distinct from old.media_asset_id
     or new.attached_by is distinct from old.attached_by
     or new.attached_at is distinct from old.attached_at then
    raise exception using errcode = '42501', message = 'GROWTH_MEDIA_SYSTEM_FIELDS_IMMUTABLE';
  end if;

  if new.is_primary and exists (
    select 1
    from private.growth_record_media grm
    where grm.growth_record_id = new.growth_record_id
      and grm.is_primary
      and grm.media_asset_id <> new.media_asset_id
  ) then
    raise exception using errcode = '23505', message = 'GROWTH_RECORD_PRIMARY_MEDIA_EXISTS';
  end if;
  return new;
end;
$$;

create trigger growth_record_media_validate
before insert or update on private.growth_record_media
for each row execute function private.validate_growth_record_media();

create trigger growth_records_audit_changes
after insert or update on private.growth_records
for each row execute function private.audit_row_change('growth_record');

create trigger growth_record_media_audit_changes
after insert or update or delete on private.growth_record_media
for each row execute function private.audit_row_change('growth_record_media');

alter table private.growth_records enable row level security;
alter table private.growth_record_media enable row level security;

revoke all on private.growth_records from public, anon, authenticated;
revoke all on private.growth_record_media from public, anon, authenticated;

create policy growth_records_deny_data_api
on private.growth_records
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

create policy growth_record_media_deny_data_api
on private.growth_record_media
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

create or replace function private.valid_growth_storage_path(object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (storage.foldername(object_name))[1] = (select auth.uid())::text
    and (storage.foldername(object_name))[2] ~ '^[0-9]+$'
    and exists (
      select 1
      from public.people p
      where p.id::text = (storage.foldername(object_name))[2]
    );
$$;

revoke all on function private.valid_growth_storage_path(text)
  from public, anon, authenticated;
grant execute on function private.valid_growth_storage_path(text) to authenticated;

create policy private_impact_insert_path_guard
on storage.objects
as restrictive
for insert
to authenticated
with check (
  bucket_id <> 'private-impact'
  or private.valid_growth_storage_path(name)
);

create or replace function private.create_growth_record(
  target_person_id bigint,
  growth_observed_at timestamptz,
  growth_observed_timezone text,
  growth_title text,
  growth_note text
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  created_id bigint;
begin
  if caller is null or not private.user_has_permission(caller, 'impact.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if not exists (select 1 from public.people p where p.id = target_person_id) then
    raise exception using errcode = '22023', message = 'PERSON_NOT_FOUND';
  end if;

  insert into private.growth_records (
    person_id, observed_at, observed_timezone, title, note, recorded_by
  ) values (
    target_person_id,
    growth_observed_at,
    coalesce(nullif(trim(growth_observed_timezone), ''), 'Asia/Shanghai'),
    growth_title,
    growth_note,
    caller
  )
  returning id into created_id;
  return created_id;
end;
$$;

create or replace function private.list_growth_records(
  target_person_id bigint,
  page_size integer default 50,
  before_observed_at timestamptz default null,
  before_record_id bigint default null,
  include_archived boolean default false
)
returns table (
  id bigint,
  person_id bigint,
  observed_at timestamptz,
  observed_timezone text,
  title text,
  note text,
  recorded_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  archived_at timestamptz,
  media jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null or not (
    private.user_has_permission(caller, 'impact.read')
    or private.user_has_permission(caller, 'impact.manage')
  ) then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if not exists (select 1 from public.people p where p.id = target_person_id) then
    raise exception using errcode = '22023', message = 'PERSON_NOT_FOUND';
  end if;
  if (before_observed_at is null) <> (before_record_id is null) then
    raise exception using errcode = '22023', message = 'INVALID_GROWTH_CURSOR';
  end if;

  return query
  select
    gr.id,
    gr.person_id,
    gr.observed_at,
    gr.observed_timezone,
    gr.title,
    gr.note,
    gr.recorded_by,
    gr.created_at,
    gr.updated_at,
    gr.archived_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'media_asset_id', ma.id,
            'storage_bucket', ma.storage_bucket,
            'storage_path', ma.storage_path,
            'mime_type', ma.mime_type,
            'width', ma.width,
            'height', ma.height,
            'sort_order', grm.sort_order,
            'is_primary', grm.is_primary,
            'caption', grm.caption,
            'attached_at', grm.attached_at
          )
          order by grm.is_primary desc, grm.sort_order, ma.id
        )
        from private.growth_record_media grm
        join public.media_assets ma on ma.id = grm.media_asset_id
        where grm.growth_record_id = gr.id
      ),
      '[]'::jsonb
    ) as media
  from private.growth_records gr
  where gr.person_id = target_person_id
    and (include_archived or gr.archived_at is null)
    and (
      before_observed_at is null
      or (gr.observed_at, gr.id) < (before_observed_at, before_record_id)
    )
  order by gr.observed_at desc, gr.id desc
  limit least(greatest(coalesce(page_size, 50), 1), 100);
end;
$$;

create or replace function private.update_growth_record(
  target_growth_record_id bigint,
  growth_observed_at timestamptz,
  growth_observed_timezone text,
  growth_title text,
  growth_note text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null or not private.user_has_permission(caller, 'impact.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  update private.growth_records gr
  set observed_at = growth_observed_at,
      observed_timezone = coalesce(
        nullif(trim(growth_observed_timezone), ''),
        'Asia/Shanghai'
      ),
      title = growth_title,
      note = growth_note
  where gr.id = target_growth_record_id
    and gr.archived_at is null;

  if not found then
    raise exception using errcode = '22023', message = 'GROWTH_RECORD_NOT_FOUND';
  end if;
end;
$$;

create or replace function private.archive_growth_record(target_growth_record_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null or not private.user_has_permission(caller, 'impact.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  update private.growth_records gr
  set archived_at = statement_timestamp()
  where gr.id = target_growth_record_id
    and gr.archived_at is null;

  if not found then
    raise exception using errcode = '22023', message = 'GROWTH_RECORD_NOT_FOUND';
  end if;
end;
$$;

create or replace function private.attach_growth_media(
  target_growth_record_id bigint,
  target_media_asset_id bigint,
  media_sort_order integer default 0,
  media_is_primary boolean default false,
  media_caption text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null or not private.user_has_permission(caller, 'impact.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if media_sort_order < 0 then
    raise exception using errcode = '22023', message = 'INVALID_MEDIA_SORT_ORDER';
  end if;
  if not exists (
    select 1 from private.growth_records gr
    where gr.id = target_growth_record_id and gr.archived_at is null
  ) then
    raise exception using errcode = '22023', message = 'GROWTH_RECORD_NOT_FOUND';
  end if;

  if media_is_primary then
    update private.growth_record_media grm
    set is_primary = false
    where grm.growth_record_id = target_growth_record_id
      and grm.is_primary;
  end if;

  insert into private.growth_record_media (
    growth_record_id,
    media_asset_id,
    sort_order,
    is_primary,
    caption,
    attached_by
  ) values (
    target_growth_record_id,
    target_media_asset_id,
    media_sort_order,
    media_is_primary,
    nullif(trim(media_caption), ''),
    caller
  )
  on conflict (growth_record_id, media_asset_id) do update
  set sort_order = excluded.sort_order,
      is_primary = excluded.is_primary,
      caption = excluded.caption;
end;
$$;

create or replace function private.remove_growth_media(
  target_growth_record_id bigint,
  target_media_asset_id bigint
)
returns table (
  media_asset_id bigint,
  storage_bucket text,
  storage_path text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  removed_bucket text;
  removed_path text;
begin
  if caller is null or not private.user_has_permission(caller, 'impact.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  select ma.storage_bucket, ma.storage_path
  into removed_bucket, removed_path
  from private.growth_record_media grm
  join public.media_assets ma on ma.id = grm.media_asset_id
  where grm.growth_record_id = target_growth_record_id
    and grm.media_asset_id = target_media_asset_id;

  if not found then
    raise exception using errcode = '22023', message = 'GROWTH_MEDIA_NOT_FOUND';
  end if;

  delete from private.growth_record_media grm
  where grm.growth_record_id = target_growth_record_id
    and grm.media_asset_id = target_media_asset_id;

  return query
  select target_media_asset_id, removed_bucket, removed_path;
end;
$$;

revoke all on function private.create_growth_record(bigint, timestamptz, text, text, text)
  from public, anon, authenticated;
revoke all on function private.list_growth_records(bigint, integer, timestamptz, bigint, boolean)
  from public, anon, authenticated;
revoke all on function private.update_growth_record(bigint, timestamptz, text, text, text)
  from public, anon, authenticated;
revoke all on function private.archive_growth_record(bigint)
  from public, anon, authenticated;
revoke all on function private.attach_growth_media(bigint, bigint, integer, boolean, text)
  from public, anon, authenticated;
revoke all on function private.remove_growth_media(bigint, bigint)
  from public, anon, authenticated;

grant execute on function private.create_growth_record(bigint, timestamptz, text, text, text)
  to authenticated;
grant execute on function private.list_growth_records(bigint, integer, timestamptz, bigint, boolean)
  to authenticated;
grant execute on function private.update_growth_record(bigint, timestamptz, text, text, text)
  to authenticated;
grant execute on function private.archive_growth_record(bigint)
  to authenticated;
grant execute on function private.attach_growth_media(bigint, bigint, integer, boolean, text)
  to authenticated;
grant execute on function private.remove_growth_media(bigint, bigint)
  to authenticated;

create function public.create_growth_record(
  target_person_id bigint,
  growth_observed_at timestamptz,
  growth_observed_timezone text,
  growth_title text,
  growth_note text
)
returns bigint
language sql
security invoker
set search_path = ''
as $$
  select private.create_growth_record(
    target_person_id,
    growth_observed_at,
    growth_observed_timezone,
    growth_title,
    growth_note
  );
$$;

create function public.list_growth_records(
  target_person_id bigint,
  page_size integer default 50,
  before_observed_at timestamptz default null,
  before_record_id bigint default null,
  include_archived boolean default false
)
returns table (
  id bigint,
  person_id bigint,
  observed_at timestamptz,
  observed_timezone text,
  title text,
  note text,
  recorded_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  archived_at timestamptz,
  media jsonb
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.list_growth_records(
    target_person_id,
    page_size,
    before_observed_at,
    before_record_id,
    include_archived
  );
$$;

create function public.update_growth_record(
  target_growth_record_id bigint,
  growth_observed_at timestamptz,
  growth_observed_timezone text,
  growth_title text,
  growth_note text
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.update_growth_record(
    target_growth_record_id,
    growth_observed_at,
    growth_observed_timezone,
    growth_title,
    growth_note
  );
$$;

create function public.archive_growth_record(target_growth_record_id bigint)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.archive_growth_record(target_growth_record_id);
$$;

create function public.attach_growth_media(
  target_growth_record_id bigint,
  target_media_asset_id bigint,
  media_sort_order integer default 0,
  media_is_primary boolean default false,
  media_caption text default null
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.attach_growth_media(
    target_growth_record_id,
    target_media_asset_id,
    media_sort_order,
    media_is_primary,
    media_caption
  );
$$;

create function public.remove_growth_media(
  target_growth_record_id bigint,
  target_media_asset_id bigint
)
returns table (
  media_asset_id bigint,
  storage_bucket text,
  storage_path text
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.remove_growth_media(
    target_growth_record_id,
    target_media_asset_id
  );
$$;

revoke all on function public.create_growth_record(bigint, timestamptz, text, text, text)
  from public, anon;
revoke all on function public.list_growth_records(bigint, integer, timestamptz, bigint, boolean)
  from public, anon;
revoke all on function public.update_growth_record(bigint, timestamptz, text, text, text)
  from public, anon;
revoke all on function public.archive_growth_record(bigint)
  from public, anon;
revoke all on function public.attach_growth_media(bigint, bigint, integer, boolean, text)
  from public, anon;
revoke all on function public.remove_growth_media(bigint, bigint)
  from public, anon;

grant execute on function public.create_growth_record(bigint, timestamptz, text, text, text)
  to authenticated;
grant execute on function public.list_growth_records(bigint, integer, timestamptz, bigint, boolean)
  to authenticated;
grant execute on function public.update_growth_record(bigint, timestamptz, text, text, text)
  to authenticated;
grant execute on function public.archive_growth_record(bigint)
  to authenticated;
grant execute on function public.attach_growth_media(bigint, bigint, integer, boolean, text)
  to authenticated;
grant execute on function public.remove_growth_media(bigint, bigint)
  to authenticated;

comment on column public.people.nature_name is
  'Nature-education name, independent from account username and legal name.';
comment on column public.profiles.registered_at is
  'Immutable account registration time copied from auth.users.created_at.';
comment on table private.growth_records is
  'Private, permission-gated growth observations for real-world people.';
