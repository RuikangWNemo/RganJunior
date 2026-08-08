-- BlockNote/Yjs collaborative editing, sharing, comments, and checkpoints.

alter table public.field_notes
  add column content_json jsonb,
  add column content_html text,
  add column content_schema_version smallint not null default 1,
  add column collaboration_mode text not null default 'invite_only';

alter table public.field_notes
  add constraint field_notes_content_json_check check (
    content_json is null or jsonb_typeof(content_json) = 'array'
  ),
  add constraint field_notes_content_schema_version_check check (
    content_schema_version > 0
  ),
  add constraint field_notes_collaboration_mode_check check (
    collaboration_mode in ('invite_only', 'members_with_link')
  );

alter table public.field_note_revisions
  add column content_json_snapshot jsonb,
  add column content_html_snapshot text,
  add column content_schema_version smallint not null default 1,
  add column source text not null default 'legacy';

alter table public.field_note_revisions
  add constraint field_note_revisions_content_json_check check (
    content_json_snapshot is null or jsonb_typeof(content_json_snapshot) = 'array'
  ),
  add constraint field_note_revisions_schema_version_check check (
    content_schema_version > 0
  ),
  add constraint field_note_revisions_source_check check (
    source in (
      'legacy', 'initial', 'automatic', 'manual', 'submitted',
      'changes_requested', 'approved', 'published', 'restored'
    )
  );

create table public.field_note_collaborators (
  field_note_id bigint not null
    references public.field_notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'editor',
  invited_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  primary key (field_note_id, user_id),
  constraint field_note_collaborators_role_check check (
    role in ('editor', 'commenter')
  ),
  constraint field_note_collaborators_revoke_check check (
    (revoked_at is null and revoked_by is null)
    or (revoked_at is not null and revoked_by is not null)
  )
);

create index field_note_collaborators_user_active_idx
  on public.field_note_collaborators (user_id, field_note_id)
  where revoked_at is null;

create table public.field_note_share_links (
  id bigint generated always as identity primary key,
  field_note_id bigint not null
    references public.field_notes(id) on delete cascade,
  token_hash text not null,
  permission text not null default 'edit',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  last_used_at timestamptz,
  constraint field_note_share_links_token_hash_check check (
    token_hash ~ '^[0-9a-f]{64}$'
  ),
  constraint field_note_share_links_permission_check check (
    permission = 'edit'
  ),
  constraint field_note_share_links_expiry_check check (
    expires_at is null or expires_at > created_at
  ),
  constraint field_note_share_links_revoke_check check (
    (revoked_at is null and revoked_by is null)
    or (revoked_at is not null and revoked_by is not null)
  )
);

create unique index field_note_share_links_token_hash_uidx
  on public.field_note_share_links (token_hash);
create unique index field_note_share_links_one_active_edit_idx
  on public.field_note_share_links (field_note_id, permission)
  where revoked_at is null;

create table public.field_note_comments (
  id text primary key,
  field_note_id bigint not null
    references public.field_notes(id) on delete cascade,
  thread_snapshot jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  constraint field_note_comments_id_check check (
    length(id) between 1 and 160
  ),
  constraint field_note_comments_snapshot_check check (
    jsonb_typeof(thread_snapshot) = 'object'
  ),
  constraint field_note_comments_resolved_check check (
    (resolved_at is null and resolved_by is null)
    or (resolved_at is not null and resolved_by is not null)
  )
);

create index field_note_comments_note_active_idx
  on public.field_note_comments (field_note_id, updated_at desc, id)
  where deleted_at is null;

create table public.field_note_comment_events (
  id bigint generated always as identity primary key,
  field_note_id bigint not null
    references public.field_notes(id) on delete cascade,
  thread_id text not null references public.field_note_comments(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint field_note_comment_events_type_check check (
    event_type in ('created', 'updated', 'replied', 'resolved', 'reopened', 'deleted', 'reacted')
  ),
  constraint field_note_comment_events_payload_check check (
    jsonb_typeof(event_payload) = 'object'
  )
);

create index field_note_comment_events_thread_idx
  on public.field_note_comment_events (thread_id, created_at, id);
create index field_note_comment_events_actor_idx
  on public.field_note_comment_events (actor_user_id, created_at desc)
  where actor_user_id is not null;

create table private.field_note_collab_documents (
  field_note_id bigint primary key
    references public.field_notes(id) on delete cascade,
  yjs_state bytea not null,
  schema_version smallint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint field_note_collab_documents_state_size_check check (
    octet_length(yjs_state) between 1 and 5242880
  ),
  constraint field_note_collab_documents_schema_version_check check (
    schema_version > 0
  )
);

create trigger field_note_collaborators_set_updated_at
before update on public.field_note_collaborators
for each row execute function private.set_updated_at();

create trigger field_note_comments_set_updated_at
before update on public.field_note_comments
for each row execute function private.set_updated_at();

create trigger field_note_collab_documents_set_updated_at
before update on private.field_note_collab_documents
for each row execute function private.set_updated_at();

create trigger field_note_collaborators_audit_changes
after insert or update or delete on public.field_note_collaborators
for each row execute function private.audit_row_change('field_note_collaborator');

create trigger field_note_share_links_audit_changes
after insert or update or delete on public.field_note_share_links
for each row execute function private.audit_row_change('field_note_share_link');

alter table public.field_note_collaborators enable row level security;
alter table public.field_note_share_links enable row level security;
alter table public.field_note_comments enable row level security;
alter table public.field_note_comment_events enable row level security;
alter table private.field_note_collab_documents enable row level security;

revoke all on public.field_note_collaborators from public, anon, authenticated;
revoke all on public.field_note_share_links from public, anon, authenticated;
revoke all on public.field_note_comments from public, anon, authenticated;
revoke all on public.field_note_comment_events from public, anon, authenticated;
revoke all on private.field_note_collab_documents from public, anon, authenticated;

grant select on public.field_note_collaborators to authenticated;
grant select, insert, update, delete on public.field_note_collaborators to service_role;
grant select, insert, update, delete on public.field_note_share_links to service_role;
grant select, insert, update, delete on public.field_note_comments to service_role;
grant select, insert on public.field_note_comment_events to service_role;
grant select, insert, update, delete on private.field_note_collab_documents to service_role;
grant usage, select on sequence public.field_note_share_links_id_seq to service_role;
grant usage, select on sequence public.field_note_comment_events_id_seq to service_role;

create or replace function private.is_active_field_note_collaborator(
  check_field_note_id bigint,
  check_user_id uuid,
  required_role text default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.field_note_collaborators c
    where c.field_note_id = check_field_note_id
      and c.user_id = check_user_id
      and c.revoked_at is null
      and (required_role is null or c.role = required_role)
      and private.has_active_membership(check_user_id)
  );
$$;

create or replace function private.user_can_read_field_note(
  check_field_note_id bigint,
  check_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.field_notes fn
    where fn.id = check_field_note_id
      and (
        (fn.status = 'published' and fn.visibility = 'public')
        or (
          fn.status = 'published'
          and fn.visibility = 'members'
          and private.has_active_membership(check_user_id)
        )
        or fn.created_by = check_user_id
        or private.is_active_field_note_collaborator(fn.id, check_user_id)
        or private.user_has_permission(check_user_id, 'field_notes.edit_any')
        or private.user_has_permission(check_user_id, 'field_notes.review')
        or private.user_has_permission(check_user_id, 'field_notes.approve')
        or private.user_has_permission(check_user_id, 'field_notes.publish')
        or private.user_has_permission(check_user_id, 'field_notes.archive')
      )
  );
$$;

create or replace function private.user_can_edit_field_note_row(
  check_field_note_id bigint,
  check_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.field_notes fn
    where fn.id = check_field_note_id
      and (
        (
          fn.created_by = check_user_id
          and fn.status in ('draft', 'changes_requested')
          and private.has_active_membership(check_user_id)
          and private.user_has_permission(check_user_id, 'field_notes.edit_own')
        )
        or (
          fn.status in ('draft', 'submitted', 'in_review', 'changes_requested')
          and private.user_has_permission(check_user_id, 'field_notes.edit_any')
        )
      )
  );
$$;

create or replace function private.user_can_manage_field_note_collaboration(
  check_field_note_id bigint,
  check_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.field_notes fn
    where fn.id = check_field_note_id
      and fn.status <> 'archived'
      and (
        (
          fn.created_by = check_user_id
          and private.has_active_membership(check_user_id)
          and private.user_has_permission(check_user_id, 'field_notes.edit_own')
        )
        or private.user_has_permission(check_user_id, 'field_notes.edit_any')
      )
  );
$$;

revoke all on function private.is_active_field_note_collaborator(bigint, uuid, text)
  from public, anon, authenticated;
revoke all on function private.user_can_read_field_note(bigint, uuid)
  from public, anon, authenticated;
revoke all on function private.user_can_edit_field_note_row(bigint, uuid)
  from public, anon, authenticated;
revoke all on function private.user_can_manage_field_note_collaboration(bigint, uuid)
  from public, anon, authenticated;

-- These helpers are referenced from RLS policies and the security-invoker
-- field-note write trigger. The private schema is not exposed through the
-- Data API, and only the minimum database roles receive EXECUTE.
grant execute on function private.is_active_field_note_collaborator(bigint, uuid, text)
  to authenticated, service_role;
grant execute on function private.user_can_edit_field_note_row(bigint, uuid)
  to authenticated, service_role;
grant execute on function private.user_can_manage_field_note_collaboration(bigint, uuid)
  to authenticated, service_role;

create or replace function private.can_read_field_note(check_field_note_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.user_can_read_field_note(
    check_field_note_id,
    (select auth.uid())
  );
$$;

create or replace function private.can_edit_field_note(check_field_note_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.user_can_edit_field_note_row(
    check_field_note_id,
    (select auth.uid())
  );
$$;

create policy field_note_collaborators_select_authorized
on public.field_note_collaborators for select
to authenticated
using (
  user_id = (select auth.uid())
  or invited_by = (select auth.uid())
  or exists (
    select 1
    from public.field_notes fn
    where fn.id = field_note_id
      and (
        fn.created_by = (select auth.uid())
        or private.has_permission('field_notes.edit_any')
        or private.has_permission('field_notes.review')
      )
  )
);

drop policy field_note_revisions_select_authorized
  on public.field_note_revisions;

create policy field_note_revisions_select_authorized
on public.field_note_revisions for select
to authenticated
using (
  exists (
    select 1
    from public.field_notes fn
    where fn.id = field_note_id
      and (
        fn.created_by = (select auth.uid())
        or private.is_active_field_note_collaborator(fn.id, (select auth.uid()))
        or private.has_permission('field_notes.edit_any')
        or private.has_permission('field_notes.review')
      )
  )
);

create or replace function private.enforce_field_note_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  transition_allowed boolean := false;
  body_changed boolean := false;
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

  if (
    new.visibility is distinct from old.visibility
    or new.featured is distinct from old.featured
  ) and not private.has_permission('field_notes.publish') then
    raise exception using errcode = '42501', message = 'FIELD_NOTE_PUBLICATION_FIELDS_NOT_ALLOWED';
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
      new.submitted_at = statement_timestamp();
    elsif new.status in ('in_review', 'changes_requested') then
      new.reviewed_at = statement_timestamp();
    elsif new.status = 'approved' then
      new.approved_at = statement_timestamp();
    elsif new.status = 'published' then
      new.published_at = statement_timestamp();
    elsif new.status = 'archived' then
      new.archived_at = statement_timestamp();
    end if;
  end if;

  return new;
end;
$$;

create or replace function private.capture_field_note_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_revision integer;
begin
  select coalesce(max(r.revision_number), 0) + 1
  into next_revision
  from public.field_note_revisions r
  where r.field_note_id = new.id;

  insert into public.field_note_revisions (
    field_note_id,
    revision_number,
    title_snapshot,
    content_snapshot,
    content_json_snapshot,
    content_html_snapshot,
    content_schema_version,
    source,
    changed_by
  ) values (
    new.id,
    next_revision,
    new.title,
    new.content,
    new.content_json,
    new.content_html,
    new.content_schema_version,
    'initial',
    (select auth.uid())
  );
  return null;
end;
$$;

drop trigger field_notes_capture_content_revision on public.field_notes;

create or replace function public.authorize_field_note_collaboration_server(
  target_user_id uuid,
  target_field_note_id bigint,
  candidate_share_token_hash text default null
)
returns table (
  field_note_id bigint,
  note_status text,
  collaboration_mode text,
  can_read boolean,
  can_write boolean,
  can_comment boolean,
  share_link_used boolean,
  collaborator_role text,
  title text,
  excerpt text,
  legacy_content text,
  content_json jsonb,
  content_schema_version smallint,
  user_display_name text,
  user_avatar_media_id bigint,
  can_manage_collaboration boolean,
  note_visibility text,
  note_language text,
  is_owner boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  note_record record;
  active_member boolean := false;
  active_collaborator_role text;
  valid_share_link boolean := false;
  staff_can_write boolean := false;
  staff_can_comment boolean := false;
begin
  if target_user_id is null then
    return;
  end if;

  select fn.* into note_record
  from public.field_notes fn
  where fn.id = target_field_note_id;
  if not found then
    return;
  end if;

  active_member := private.has_active_membership(target_user_id);

  select c.role into active_collaborator_role
  from public.field_note_collaborators c
  where c.field_note_id = target_field_note_id
    and c.user_id = target_user_id
    and c.revoked_at is null
    and active_member;

  if candidate_share_token_hash ~ '^[0-9a-f]{64}$'
     and note_record.collaboration_mode = 'members_with_link'
     and active_member then
    select exists (
      select 1
      from public.field_note_share_links sl
      where sl.field_note_id = target_field_note_id
        and sl.token_hash = candidate_share_token_hash
        and sl.permission = 'edit'
        and sl.revoked_at is null
        and (sl.expires_at is null or sl.expires_at > statement_timestamp())
    ) into valid_share_link;
  end if;

  staff_can_write := private.user_has_permission(target_user_id, 'field_notes.edit_any');
  staff_can_comment := staff_can_write
    or private.user_has_permission(target_user_id, 'field_notes.review')
    or private.user_has_permission(target_user_id, 'field_notes.approve');

  return query
  select
    note_record.id,
    note_record.status,
    note_record.collaboration_mode,
    (
      private.user_can_read_field_note(target_field_note_id, target_user_id)
      or valid_share_link
    ),
    (
      (
        note_record.status in ('draft', 'changes_requested')
        and active_member
        and (
          (
            note_record.created_by = target_user_id
            and private.user_has_permission(target_user_id, 'field_notes.edit_own')
          )
          or active_collaborator_role = 'editor'
          or valid_share_link
        )
      )
      or (
        note_record.status in ('draft', 'submitted', 'in_review', 'changes_requested')
        and staff_can_write
      )
    ),
    (
      note_record.status <> 'archived'
      and (
        (
          active_member
          and (
            note_record.created_by = target_user_id
            or active_collaborator_role in ('editor', 'commenter')
            or valid_share_link
          )
        )
        or staff_can_comment
      )
    ),
    valid_share_link,
    active_collaborator_role,
    note_record.title,
    note_record.excerpt,
    note_record.content,
    note_record.content_json,
    note_record.content_schema_version,
    coalesce(nullif(pe.nature_name, ''), nullif(pe.display_name, ''), nullif(p.display_name, ''), 'Community member'),
    coalesce(pe.avatar_media_id, p.avatar_media_id),
    private.user_can_manage_field_note_collaboration(target_field_note_id, target_user_id),
    note_record.visibility,
    note_record.language,
    note_record.created_by = target_user_id
  from public.profiles p
  left join public.people pe on pe.user_id = p.user_id
  where p.user_id = target_user_id;
end;
$$;

create or replace function public.load_field_note_collab_document_server(
  target_field_note_id bigint
)
returns table (yjs_state bytea, schema_version smallint)
language sql
stable
security definer
set search_path = ''
as $$
  select d.yjs_state, d.schema_version
  from private.field_note_collab_documents d
  where d.field_note_id = target_field_note_id;
$$;

create or replace function public.store_field_note_collab_document_server(
  target_field_note_id bigint,
  target_yjs_state bytea,
  target_schema_version smallint
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if target_yjs_state is null
     or octet_length(target_yjs_state) not between 1 and 5242880
     or target_schema_version <= 0 then
    raise exception using errcode = '22023', message = 'INVALID_FIELD_NOTE_COLLAB_DOCUMENT';
  end if;
  if not exists (
    select 1 from public.field_notes fn where fn.id = target_field_note_id
  ) then
    raise exception using errcode = 'P0002', message = 'FIELD_NOTE_NOT_FOUND';
  end if;

  insert into private.field_note_collab_documents (
    field_note_id,
    yjs_state,
    schema_version
  ) values (
    target_field_note_id,
    target_yjs_state,
    target_schema_version
  )
  on conflict (field_note_id) do update
  set yjs_state = excluded.yjs_state,
      schema_version = excluded.schema_version,
      updated_at = statement_timestamp();
end;
$$;

create or replace function public.load_field_note_collab_seed_server(
  target_field_note_id bigint
)
returns table (
  content_json jsonb,
  legacy_content text,
  schema_version smallint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    fn.content_json,
    fn.content,
    fn.content_schema_version
  from public.field_notes fn
  where fn.id = target_field_note_id;
$$;

create or replace function public.initialize_field_note_collab_document_server(
  target_field_note_id bigint,
  candidate_yjs_state bytea,
  candidate_schema_version smallint
)
returns table (yjs_state bytea, schema_version smallint)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if candidate_yjs_state is null
     or octet_length(candidate_yjs_state) not between 1 and 5242880
     or candidate_schema_version <= 0 then
    raise exception using errcode = '22023', message = 'INVALID_FIELD_NOTE_COLLAB_DOCUMENT';
  end if;
  if not exists (
    select 1 from public.field_notes fn where fn.id = target_field_note_id
  ) then
    raise exception using errcode = 'P0002', message = 'FIELD_NOTE_NOT_FOUND';
  end if;

  insert into private.field_note_collab_documents (
    field_note_id,
    yjs_state,
    schema_version
  ) values (
    target_field_note_id,
    candidate_yjs_state,
    candidate_schema_version
  )
  on conflict (field_note_id) do nothing;

  return query
  select d.yjs_state, d.schema_version
  from private.field_note_collab_documents d
  where d.field_note_id = target_field_note_id;
end;
$$;

create or replace function public.checkpoint_field_note_server(
  target_user_id uuid,
  target_field_note_id bigint,
  target_title text,
  target_excerpt text,
  target_content text,
  target_content_json jsonb,
  target_content_html text,
  target_schema_version smallint,
  target_source text default 'manual',
  target_change_note text default null,
  candidate_share_token_hash text default null,
  create_revision boolean default true
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  access_record record;
  next_revision integer;
  created_revision_id bigint;
begin
  if nullif(trim(target_title), '') is null
     or length(target_title) > 240
     or length(coalesce(target_excerpt, '')) > 2000
     or length(coalesce(target_content, '')) > 2000000
     or length(coalesce(target_content_html, '')) > 5000000
     or target_content_json is null
     or jsonb_typeof(target_content_json) <> 'array'
     or target_schema_version <= 0
     or target_source not in (
       'automatic', 'manual', 'submitted', 'changes_requested',
       'approved', 'published', 'restored'
     ) then
    raise exception using errcode = '22023', message = 'INVALID_FIELD_NOTE_CHECKPOINT';
  end if;
  if target_content_html ~* '<[[:space:]]*(script|iframe|object|embed)' then
    raise exception using errcode = '22023', message = 'UNSAFE_FIELD_NOTE_HTML';
  end if;

  perform 1
  from public.field_notes fn
  where fn.id = target_field_note_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'FIELD_NOTE_NOT_FOUND';
  end if;

  select * into access_record
  from public.authorize_field_note_collaboration_server(
    target_user_id,
    target_field_note_id,
    candidate_share_token_hash
  );
  if not found or not access_record.can_write then
    raise exception using errcode = '42501', message = 'FIELD_NOTE_EDIT_NOT_ALLOWED';
  end if;

  update public.field_notes
  set title = trim(target_title),
      excerpt = nullif(trim(coalesce(target_excerpt, '')), ''),
      content = coalesce(target_content, ''),
      content_json = target_content_json,
      content_html = target_content_html,
      content_schema_version = target_schema_version
  where id = target_field_note_id;

  if create_revision then
    select coalesce(max(r.revision_number), 0) + 1
    into next_revision
    from public.field_note_revisions r
    where r.field_note_id = target_field_note_id;

    insert into public.field_note_revisions (
      field_note_id,
      revision_number,
      title_snapshot,
      content_snapshot,
      content_json_snapshot,
      content_html_snapshot,
      content_schema_version,
      source,
      changed_by,
      change_note
    ) values (
      target_field_note_id,
      next_revision,
      trim(target_title),
      coalesce(target_content, ''),
      target_content_json,
      target_content_html,
      target_schema_version,
      target_source,
      target_user_id,
      nullif(trim(coalesce(target_change_note, '')), '')
    ) returning id into created_revision_id;
  end if;

  return created_revision_id;
end;
$$;

create or replace function public.materialize_field_note_server(
  target_field_note_id bigint,
  target_content text,
  target_content_json jsonb,
  target_content_html text,
  target_schema_version smallint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if length(coalesce(target_content, '')) > 2000000
     or length(coalesce(target_content_html, '')) > 5000000
     or target_content_json is null
     or jsonb_typeof(target_content_json) <> 'array'
     or target_schema_version <= 0 then
    raise exception using errcode = '22023', message = 'INVALID_FIELD_NOTE_MATERIALIZATION';
  end if;
  if target_content_html ~* '<[[:space:]]*(script|iframe|object|embed)' then
    raise exception using errcode = '22023', message = 'UNSAFE_FIELD_NOTE_HTML';
  end if;

  update public.field_notes
  set content = coalesce(target_content, ''),
      content_json = target_content_json,
      content_html = target_content_html,
      content_schema_version = target_schema_version
  where id = target_field_note_id
    and status in ('draft', 'submitted', 'in_review', 'changes_requested');

  return found;
end;
$$;

create or replace function public.invite_field_note_collaborator_server(
  actor_user_id uuid,
  target_field_note_id bigint,
  target_user_id uuid,
  target_role text default 'editor'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if actor_user_id is null
     or target_user_id is null
     or actor_user_id = target_user_id
     or target_role not in ('editor', 'commenter')
     or not private.user_can_manage_field_note_collaboration(target_field_note_id, actor_user_id)
     or not private.has_active_membership(target_user_id) then
    raise exception using errcode = '42501', message = 'FIELD_NOTE_COLLABORATOR_NOT_ALLOWED';
  end if;
  if exists (
    select 1 from public.field_notes fn
    where fn.id = target_field_note_id and fn.created_by = target_user_id
  ) then
    raise exception using errcode = '22023', message = 'FIELD_NOTE_OWNER_ALREADY_HAS_ACCESS';
  end if;

  insert into public.field_note_collaborators (
    field_note_id,
    user_id,
    role,
    invited_by
  ) values (
    target_field_note_id,
    target_user_id,
    target_role,
    actor_user_id
  )
  on conflict (field_note_id, user_id) do update
  set role = excluded.role,
      invited_by = excluded.invited_by,
      revoked_at = null,
      revoked_by = null,
      updated_at = statement_timestamp();
end;
$$;

create or replace function public.revoke_field_note_collaborator_server(
  actor_user_id uuid,
  target_field_note_id bigint,
  target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.user_can_manage_field_note_collaboration(target_field_note_id, actor_user_id) then
    raise exception using errcode = '42501', message = 'FIELD_NOTE_COLLABORATOR_NOT_ALLOWED';
  end if;

  update public.field_note_collaborators
  set revoked_at = statement_timestamp(),
      revoked_by = actor_user_id
  where field_note_id = target_field_note_id
    and user_id = target_user_id
    and revoked_at is null;
end;
$$;

create or replace function public.create_field_note_share_link_server(
  actor_user_id uuid,
  target_field_note_id bigint,
  target_token_hash text,
  target_expires_at timestamptz default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_link_id bigint;
begin
  if not private.user_can_manage_field_note_collaboration(target_field_note_id, actor_user_id)
     or target_token_hash !~ '^[0-9a-f]{64}$'
     or (target_expires_at is not null and target_expires_at <= statement_timestamp()) then
    raise exception using errcode = '42501', message = 'FIELD_NOTE_SHARE_LINK_NOT_ALLOWED';
  end if;

  update public.field_note_share_links
  set revoked_at = statement_timestamp(),
      revoked_by = actor_user_id
  where field_note_id = target_field_note_id
    and permission = 'edit'
    and revoked_at is null;

  insert into public.field_note_share_links (
    field_note_id,
    token_hash,
    permission,
    created_by,
    expires_at
  ) values (
    target_field_note_id,
    target_token_hash,
    'edit',
    actor_user_id,
    target_expires_at
  ) returning id into created_link_id;

  update public.field_notes
  set collaboration_mode = 'members_with_link'
  where id = target_field_note_id;

  return created_link_id;
end;
$$;

create or replace function public.revoke_field_note_share_link_server(
  actor_user_id uuid,
  target_field_note_id bigint
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.user_can_manage_field_note_collaboration(target_field_note_id, actor_user_id) then
    raise exception using errcode = '42501', message = 'FIELD_NOTE_SHARE_LINK_NOT_ALLOWED';
  end if;

  update public.field_note_share_links
  set revoked_at = statement_timestamp(),
      revoked_by = actor_user_id
  where field_note_id = target_field_note_id
    and permission = 'edit'
    and revoked_at is null;

  update public.field_notes
  set collaboration_mode = 'invite_only'
  where id = target_field_note_id;
end;
$$;

create or replace function public.record_field_note_comment_server(
  actor_user_id uuid,
  target_field_note_id bigint,
  target_thread_id text,
  target_thread_snapshot jsonb,
  target_event_type text,
  target_resolved boolean default false,
  candidate_share_token_hash text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  access_record record;
begin
  if length(coalesce(target_thread_id, '')) not between 1 and 160
     or target_thread_snapshot is null
     or jsonb_typeof(target_thread_snapshot) <> 'object'
     or target_event_type not in ('created', 'updated', 'replied', 'resolved', 'reopened', 'deleted', 'reacted') then
    raise exception using errcode = '22023', message = 'INVALID_FIELD_NOTE_COMMENT';
  end if;

  select * into access_record
  from public.authorize_field_note_collaboration_server(
    actor_user_id,
    target_field_note_id,
    candidate_share_token_hash
  );
  if not found or not access_record.can_comment then
    raise exception using errcode = '42501', message = 'FIELD_NOTE_COMMENT_NOT_ALLOWED';
  end if;

  insert into public.field_note_comments (
    id,
    field_note_id,
    thread_snapshot,
    created_by,
    resolved_at,
    resolved_by,
    deleted_at
  ) values (
    target_thread_id,
    target_field_note_id,
    target_thread_snapshot,
    actor_user_id,
    case when target_resolved then statement_timestamp() else null end,
    case when target_resolved then actor_user_id else null end,
    case when target_event_type = 'deleted' then statement_timestamp() else null end
  )
  on conflict (id) do update
  set thread_snapshot = excluded.thread_snapshot,
      resolved_at = excluded.resolved_at,
      resolved_by = excluded.resolved_by,
      deleted_at = excluded.deleted_at,
      updated_at = statement_timestamp();

  insert into public.field_note_comment_events (
    field_note_id,
    thread_id,
    actor_user_id,
    event_type,
    event_payload
  ) values (
    target_field_note_id,
    target_thread_id,
    actor_user_id,
    target_event_type,
    jsonb_build_object('resolved', target_resolved)
  );
end;
$$;

revoke all on function public.authorize_field_note_collaboration_server(uuid, bigint, text)
  from public, anon, authenticated;
revoke all on function public.load_field_note_collab_document_server(bigint)
  from public, anon, authenticated;
revoke all on function public.store_field_note_collab_document_server(bigint, bytea, smallint)
  from public, anon, authenticated;
revoke all on function public.load_field_note_collab_seed_server(bigint)
  from public, anon, authenticated;
revoke all on function public.initialize_field_note_collab_document_server(bigint, bytea, smallint)
  from public, anon, authenticated;
revoke all on function public.checkpoint_field_note_server(uuid, bigint, text, text, text, jsonb, text, smallint, text, text, text, boolean)
  from public, anon, authenticated;
revoke all on function public.materialize_field_note_server(bigint, text, jsonb, text, smallint)
  from public, anon, authenticated;
revoke all on function public.invite_field_note_collaborator_server(uuid, bigint, uuid, text)
  from public, anon, authenticated;
revoke all on function public.revoke_field_note_collaborator_server(uuid, bigint, uuid)
  from public, anon, authenticated;
revoke all on function public.create_field_note_share_link_server(uuid, bigint, text, timestamptz)
  from public, anon, authenticated;
revoke all on function public.revoke_field_note_share_link_server(uuid, bigint)
  from public, anon, authenticated;
revoke all on function public.record_field_note_comment_server(uuid, bigint, text, jsonb, text, boolean, text)
  from public, anon, authenticated;

grant execute on function public.authorize_field_note_collaboration_server(uuid, bigint, text)
  to service_role;
grant execute on function public.load_field_note_collab_document_server(bigint)
  to service_role;
grant execute on function public.store_field_note_collab_document_server(bigint, bytea, smallint)
  to service_role;
grant execute on function public.load_field_note_collab_seed_server(bigint)
  to service_role;
grant execute on function public.initialize_field_note_collab_document_server(bigint, bytea, smallint)
  to service_role;
grant execute on function public.checkpoint_field_note_server(uuid, bigint, text, text, text, jsonb, text, smallint, text, text, text, boolean)
  to service_role;
grant execute on function public.materialize_field_note_server(bigint, text, jsonb, text, smallint)
  to service_role;
grant execute on function public.invite_field_note_collaborator_server(uuid, bigint, uuid, text)
  to service_role;
grant execute on function public.revoke_field_note_collaborator_server(uuid, bigint, uuid)
  to service_role;
grant execute on function public.create_field_note_share_link_server(uuid, bigint, text, timestamptz)
  to service_role;
grant execute on function public.revoke_field_note_share_link_server(uuid, bigint)
  to service_role;
grant execute on function public.record_field_note_comment_server(uuid, bigint, text, jsonb, text, boolean, text)
  to service_role;

comment on table private.field_note_collab_documents is
  'Server-only canonical Yjs state for collaborative Field Notes.';
comment on table public.field_note_share_links is
  'Server-managed share links. Raw tokens are never stored, only SHA-256 hashes.';
comment on function public.authorize_field_note_collaboration_server(uuid, bigint, text) is
  'Service-role-only collaboration authorization. Link access never bypasses active Membership.';
