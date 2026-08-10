-- Media metadata and Supabase Storage authorization.
create table public.media_assets (
  id bigint generated always as identity primary key,
  owner_user_id uuid references auth.users(id) on delete set null,
  uploaded_by uuid references auth.users(id) on delete set null default auth.uid(),
  storage_bucket text not null
    check (storage_bucket in (
      'avatars', 'field-notes', 'member-media', 'public-media', 'private-impact'
    )),
  storage_path text not null,
  media_type text not null
    check (media_type in ('image', 'video', 'audio', 'document', 'other')),
  mime_type text not null,
  file_size bigint not null check (file_size >= 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  caption text,
  alt_text text,
  taken_at timestamptz,
  visibility text not null default 'private'
    check (visibility in ('public', 'members', 'private')),
  status text not null default 'active'
    check (status in ('active', 'archived', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_path),
  constraint media_assets_storage_path_check check (
    storage_path <> ''
    and storage_path !~ '(^|/)\.\.(/|$)'
  )
);

create index media_assets_owner_created_idx
  on public.media_assets (owner_user_id, created_at desc, id desc)
  where owner_user_id is not null;
create index media_assets_uploaded_by_idx
  on public.media_assets (uploaded_by, created_at desc)
  where uploaded_by is not null;
create index media_assets_public_idx
  on public.media_assets (created_at desc, id desc)
  where visibility = 'public' and status = 'active';

create table public.field_note_media (
  field_note_id bigint not null references public.field_notes(id) on delete cascade,
  media_asset_id bigint not null references public.media_assets(id) on delete restrict,
  sort_order integer not null default 0 check (sort_order >= 0),
  usage_role text not null default 'inline'
    check (usage_role in ('cover', 'inline', 'gallery', 'attachment')),
  primary key (field_note_id, media_asset_id)
);

create index field_note_media_asset_idx
  on public.field_note_media (media_asset_id, field_note_id);
create index field_note_media_order_idx
  on public.field_note_media (field_note_id, sort_order, media_asset_id);

alter table public.profiles
  add constraint profiles_avatar_media_id_fkey
  foreign key (avatar_media_id) references public.media_assets(id) on delete set null;

alter table public.people
  add constraint people_avatar_media_id_fkey
  foreign key (avatar_media_id) references public.media_assets(id) on delete set null;

alter table public.field_notes
  add constraint field_notes_cover_media_id_fkey
  foreign key (cover_media_id) references public.media_assets(id) on delete set null;

create index profiles_avatar_media_id_idx
  on public.profiles (avatar_media_id)
  where avatar_media_id is not null;
create index people_avatar_media_id_idx
  on public.people (avatar_media_id)
  where avatar_media_id is not null;
create index field_notes_cover_media_id_idx
  on public.field_notes (cover_media_id)
  where cover_media_id is not null;

create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function private.set_updated_at();

create or replace function private.protect_media_asset_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  can_manage_any boolean := private.has_permission('media.manage_any');
begin
  if tg_op = 'INSERT' then
    if caller is not null then
      new.uploaded_by = caller;
      if not can_manage_any then
        new.owner_user_id = caller;
        if new.storage_bucket in ('public-media', 'private-impact')
           or new.visibility = 'public' then
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

  if caller is not null and not can_manage_any then
    if new.owner_user_id is distinct from old.owner_user_id
       or new.visibility = 'public'
       or new.storage_bucket in ('public-media', 'private-impact') then
      raise exception using errcode = '42501', message = 'MEDIA_PUBLICATION_NOT_ALLOWED';
    end if;
  end if;
  return new;
end;
$$;

create trigger media_assets_protect_fields
before insert or update on public.media_assets
for each row execute function private.protect_media_asset_fields();

create or replace function private.can_read_media_asset(check_media_asset_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.media_assets ma
    where ma.id = check_media_asset_id
      and ma.status = 'active'
      and (
        ma.visibility = 'public'
        or ma.owner_user_id = (select auth.uid())
        or private.has_permission('media.manage_any')
        or (
          ma.storage_bucket = 'private-impact'
          and (
            private.has_permission('impact.read')
            or private.has_permission('impact.manage')
          )
        )
        or exists (
          select 1
          from public.field_note_media fnm
          where fnm.media_asset_id = ma.id
            and private.can_read_field_note(fnm.field_note_id)
        )
      )
  );
$$;

create or replace function private.can_read_storage_object(
  check_bucket text,
  check_path text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select check_bucket = 'public-media'
    or exists (
      select 1
      from public.media_assets ma
      where ma.storage_bucket = check_bucket
        and ma.storage_path = check_path
        and private.can_read_media_asset(ma.id)
    );
$$;

revoke all on function private.can_read_media_asset(bigint) from public, anon, authenticated;
revoke all on function private.can_read_storage_object(text, text) from public, anon, authenticated;
grant execute on function private.can_read_media_asset(bigint) to anon, authenticated;
grant execute on function private.can_read_storage_object(text, text) to anon, authenticated;

create or replace function private.validate_profile_avatar()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.avatar_media_id is not null
     and not exists (
       select 1
       from public.media_assets ma
       where ma.id = new.avatar_media_id
         and ma.status = 'active'
         and ma.storage_bucket = 'avatars'
         and ma.owner_user_id = new.user_id
     ) then
    raise exception using errcode = '42501', message = 'INVALID_PROFILE_AVATAR';
  end if;
  return new;
end;
$$;

create trigger profiles_validate_avatar
before insert or update of avatar_media_id on public.profiles
for each row execute function private.validate_profile_avatar();

create or replace function private.validate_people_avatar()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.avatar_media_id is not null
     and not exists (
       select 1
       from public.media_assets ma
       where ma.id = new.avatar_media_id
         and ma.status = 'active'
         and (
           ma.storage_bucket = 'public-media'
           or private.has_permission('media.manage_any')
         )
     ) then
    raise exception using errcode = '42501', message = 'INVALID_PERSON_AVATAR';
  end if;
  return new;
end;
$$;

create trigger people_validate_avatar
before insert or update of avatar_media_id on public.people
for each row execute function private.validate_people_avatar();

create or replace function private.validate_field_note_cover()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.cover_media_id is not null
     and not exists (
       select 1
       from public.media_assets ma
       where ma.id = new.cover_media_id
         and ma.status = 'active'
         and (
           ma.owner_user_id = (select auth.uid())
           or private.has_permission('media.manage_any')
         )
     ) then
    raise exception using errcode = '42501', message = 'INVALID_FIELD_NOTE_COVER';
  end if;
  return new;
end;
$$;

create trigger field_notes_validate_cover
before insert or update of cover_media_id on public.field_notes
for each row execute function private.validate_field_note_cover();

create or replace function private.validate_field_note_media()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.media_assets ma
    where ma.id = new.media_asset_id
      and ma.status = 'active'
      and (
        ma.owner_user_id = (select auth.uid())
        or private.has_permission('media.manage_any')
      )
  ) then
    raise exception using errcode = '42501', message = 'FIELD_NOTE_MEDIA_NOT_OWNED';
  end if;
  return new;
end;
$$;

create trigger field_note_media_validate
before insert or update on public.field_note_media
for each row execute function private.validate_field_note_media();

create trigger media_assets_audit_visibility_changes
after update on public.media_assets
for each row
when (
  old.visibility is distinct from new.visibility
  or old.status is distinct from new.status
)
execute function private.audit_row_change('media_asset');

alter table public.media_assets enable row level security;
alter table public.field_note_media enable row level security;

revoke all on public.media_assets from anon, authenticated;
revoke all on public.field_note_media from anon, authenticated;

grant select on public.media_assets to anon, authenticated;
grant insert, update, delete on public.media_assets to authenticated;
grant select on public.field_note_media to anon, authenticated;
grant insert, update, delete on public.field_note_media to authenticated;
grant usage, select on sequence public.media_assets_id_seq to authenticated;

create policy media_assets_select_visible
on public.media_assets for select
to anon, authenticated
using (private.can_read_media_asset(id));

create policy media_assets_insert_authorized
on public.media_assets for insert
to authenticated
with check (
  (
    owner_user_id = (select auth.uid())
    and uploaded_by = (select auth.uid())
    and visibility <> 'public'
    and storage_bucket not in ('public-media', 'private-impact')
    and private.has_permission('media.upload')
  )
  or private.has_permission('media.manage_any')
  or (
    storage_bucket = 'private-impact'
    and private.has_permission('impact.manage')
  )
);

create policy media_assets_update_authorized
on public.media_assets for update
to authenticated
using (
  (
    owner_user_id = (select auth.uid())
    and private.has_permission('media.manage_own')
  )
  or private.has_permission('media.manage_any')
  or (
    storage_bucket = 'private-impact'
    and private.has_permission('impact.manage')
  )
)
with check (
  (
    owner_user_id = (select auth.uid())
    and visibility <> 'public'
    and storage_bucket not in ('public-media', 'private-impact')
    and private.has_permission('media.manage_own')
  )
  or private.has_permission('media.manage_any')
  or (
    storage_bucket = 'private-impact'
    and private.has_permission('impact.manage')
  )
);

create policy media_assets_delete_authorized
on public.media_assets for delete
to authenticated
using (
  (
    owner_user_id = (select auth.uid())
    and private.has_permission('media.manage_own')
  )
  or private.has_permission('media.manage_any')
  or (
    storage_bucket = 'private-impact'
    and private.has_permission('impact.manage')
  )
);

create policy field_note_media_select_visible
on public.field_note_media for select
to anon, authenticated
using (private.can_read_field_note(field_note_id));

create policy field_note_media_insert_authorized
on public.field_note_media for insert
to authenticated
with check (private.can_edit_field_note(field_note_id));

create policy field_note_media_update_authorized
on public.field_note_media for update
to authenticated
using (private.can_edit_field_note(field_note_id))
with check (private.can_edit_field_note(field_note_id));

create policy field_note_media_delete_authorized
on public.field_note_media for delete
to authenticated
using (private.can_edit_field_note(field_note_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('field-notes', 'field-notes', false, 26214400, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']),
  ('member-media', 'member-media', false, 26214400, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']),
  ('public-media', 'public-media', true, 52428800, null),
  ('private-impact', 'private-impact', false, 52428800, null)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy storage_objects_select_visible
on storage.objects for select
to anon, authenticated
using (private.can_read_storage_object(bucket_id, name));

create policy storage_objects_insert_authorized
on storage.objects for insert
to authenticated
with check (
  (
    bucket_id in ('avatars', 'field-notes', 'member-media')
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and private.has_permission('media.upload')
  )
  or (
    bucket_id = 'public-media'
    and private.has_permission('media.manage_any')
  )
  or (
    bucket_id = 'private-impact'
    and private.has_permission('impact.manage')
  )
);

create policy storage_objects_update_authorized
on storage.objects for update
to authenticated
using (
  (
    bucket_id in ('avatars', 'field-notes', 'member-media')
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and private.has_permission('media.manage_own')
  )
  or private.has_permission('media.manage_any')
  or (
    bucket_id = 'private-impact'
    and private.has_permission('impact.manage')
  )
)
with check (
  (
    bucket_id in ('avatars', 'field-notes', 'member-media')
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and private.has_permission('media.manage_own')
  )
  or private.has_permission('media.manage_any')
  or (
    bucket_id = 'private-impact'
    and private.has_permission('impact.manage')
  )
);

create policy storage_objects_delete_authorized
on storage.objects for delete
to authenticated
using (
  (
    bucket_id in ('avatars', 'field-notes', 'member-media')
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and private.has_permission('media.manage_own')
  )
  or private.has_permission('media.manage_any')
  or (
    bucket_id = 'private-impact'
    and private.has_permission('impact.manage')
  )
);

comment on table public.media_assets is
  'Application metadata for Supabase Storage objects; object access is enforced separately.';
