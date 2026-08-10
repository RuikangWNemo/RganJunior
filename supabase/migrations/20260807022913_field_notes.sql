-- Field Notes content model, workflow, and revision history.
create table public.topics (
  id bigint generated always as identity primary key,
  slug text not null,
  name_zh text not null,
  name_en text,
  description text,
  parent_id bigint references public.topics(id) on delete set null,
  icon text,
  color text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint topics_slug_format_check check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint topics_color_check check (
    color is null or color ~ '^#[0-9A-Fa-f]{6}$'
  ),
  constraint topics_not_own_parent_check check (parent_id is null or parent_id <> id)
);

create unique index topics_slug_lower_uidx on public.topics (lower(slug));
create index topics_parent_sort_idx on public.topics (parent_id, sort_order, id);
create index topics_active_sort_idx
  on public.topics (sort_order, id)
  where is_active and archived_at is null;
create index topics_created_by_idx on public.topics (created_by) where created_by is not null;

create table public.field_notes (
  id bigint generated always as identity primary key,
  slug text not null,
  title text not null,
  subtitle text,
  excerpt text,
  content text not null default '',
  language text not null default 'zh' check (language in ('zh', 'en')),
  translation_of_id bigint references public.field_notes(id) on delete set null,
  cover_media_id bigint,
  status text not null default 'draft'
    check (status in (
      'draft', 'submitted', 'in_review', 'changes_requested',
      'approved', 'published', 'archived'
    )),
  visibility text not null default 'private'
    check (visibility in ('public', 'members', 'private')),
  created_by uuid not null references auth.users(id) on delete restrict default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  featured boolean not null default false,
  seo_title text,
  seo_description text,
  constraint field_notes_slug_format_check check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint field_notes_translation_not_self_check check (
    translation_of_id is null or translation_of_id <> id
  )
);

create unique index field_notes_slug_lower_uidx on public.field_notes (lower(slug));
create index field_notes_created_by_status_idx
  on public.field_notes (created_by, status, updated_at desc);
create index field_notes_translation_idx
  on public.field_notes (translation_of_id)
  where translation_of_id is not null;
create index field_notes_public_published_idx
  on public.field_notes (published_at desc, id desc)
  where status = 'published' and visibility = 'public';
create index field_notes_review_queue_idx
  on public.field_notes (status, submitted_at, id)
  where status in ('submitted', 'in_review', 'changes_requested', 'approved');

create table public.field_note_authors (
  field_note_id bigint not null references public.field_notes(id) on delete cascade,
  person_id bigint not null references public.people(id) on delete restrict,
  author_order integer not null default 0 check (author_order >= 0),
  contribution_role text,
  primary key (field_note_id, person_id)
);

create index field_note_authors_person_idx
  on public.field_note_authors (person_id, field_note_id);
create index field_note_authors_order_idx
  on public.field_note_authors (field_note_id, author_order, person_id);

create table public.field_note_topics (
  field_note_id bigint not null references public.field_notes(id) on delete cascade,
  topic_id bigint not null references public.topics(id) on delete restrict,
  primary key (field_note_id, topic_id)
);

create index field_note_topics_topic_idx
  on public.field_note_topics (topic_id, field_note_id);

create table public.field_note_revisions (
  id bigint generated always as identity primary key,
  field_note_id bigint not null references public.field_notes(id) on delete cascade,
  revision_number integer not null check (revision_number > 0),
  title_snapshot text not null,
  content_snapshot text not null,
  changed_by uuid references auth.users(id) on delete set null,
  change_note text,
  created_at timestamptz not null default now(),
  unique (field_note_id, revision_number)
);

create index field_note_revisions_note_created_idx
  on public.field_note_revisions (field_note_id, created_at desc, id desc);
create index field_note_revisions_changed_by_idx
  on public.field_note_revisions (changed_by)
  where changed_by is not null;

create trigger topics_set_updated_at
before update on public.topics
for each row execute function private.set_updated_at();

create trigger field_notes_set_updated_at
before update on public.field_notes
for each row execute function private.set_updated_at();

create or replace function private.protect_topic_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if tg_op = 'INSERT' then
    if caller is not null then
      new.created_by = caller;
    end if;
    return new;
  end if;
  if new.id is distinct from old.id
     or new.created_by is distinct from old.created_by
     or new.created_at is distinct from old.created_at then
    raise exception using errcode = '42501', message = 'TOPIC_SYSTEM_FIELDS_IMMUTABLE';
  end if;
  return new;
end;
$$;

create trigger topics_protect_fields
before insert or update on public.topics
for each row execute function private.protect_topic_fields();

create or replace function private.can_read_field_note(check_field_note_id bigint)
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
          (select auth.uid()) is not null
          and fn.status = 'published'
          and fn.visibility = 'members'
        )
        or fn.created_by = (select auth.uid())
        or private.has_permission('field_notes.edit_any')
        or private.has_permission('field_notes.review')
        or private.has_permission('field_notes.approve')
        or private.has_permission('field_notes.publish')
        or private.has_permission('field_notes.archive')
      )
  );
$$;

create or replace function private.can_edit_field_note(check_field_note_id bigint)
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
          fn.created_by = (select auth.uid())
          and fn.status in ('draft', 'changes_requested')
          and private.has_permission('field_notes.edit_own')
        )
        or private.has_permission('field_notes.edit_any')
      )
  );
$$;

revoke all on function private.can_read_field_note(bigint) from public, anon, authenticated;
revoke all on function private.can_edit_field_note(bigint) from public, anon, authenticated;
grant execute on function private.can_read_field_note(bigint) to anon, authenticated;
grant execute on function private.can_edit_field_note(bigint) to authenticated;

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

  if body_changed and not (
    (
      old.created_by = caller
      and old.status in ('draft', 'changes_requested')
      and private.has_permission('field_notes.edit_own')
    )
    or (
      old.status <> 'archived'
      and private.has_permission('field_notes.edit_any')
    )
  ) then
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

create trigger field_notes_enforce_write
before insert or update on public.field_notes
for each row execute function private.enforce_field_note_write();

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
    changed_by
  ) values (
    new.id,
    next_revision,
    new.title,
    new.content,
    (select auth.uid())
  );
  return null;
end;
$$;

revoke all on function private.capture_field_note_revision() from public, anon, authenticated;

create trigger field_notes_capture_initial_revision
after insert on public.field_notes
for each row execute function private.capture_field_note_revision();

create trigger field_notes_capture_content_revision
after update on public.field_notes
for each row
when (
  old.title is distinct from new.title
  or old.content is distinct from new.content
)
execute function private.capture_field_note_revision();

create trigger topics_audit_changes
after insert or update or delete on public.topics
for each row execute function private.audit_row_change('topic');

create trigger field_notes_audit_workflow_changes
after update on public.field_notes
for each row
when (
  old.status is distinct from new.status
  or old.visibility is distinct from new.visibility
  or old.featured is distinct from new.featured
)
execute function private.audit_row_change('field_note');

alter table public.topics enable row level security;
alter table public.field_notes enable row level security;
alter table public.field_note_authors enable row level security;
alter table public.field_note_topics enable row level security;
alter table public.field_note_revisions enable row level security;

revoke all on public.topics from anon, authenticated;
revoke all on public.field_notes from anon, authenticated;
revoke all on public.field_note_authors from anon, authenticated;
revoke all on public.field_note_topics from anon, authenticated;
revoke all on public.field_note_revisions from anon, authenticated;

grant select on public.topics to anon, authenticated;
grant select on public.field_notes to anon, authenticated;
grant select on public.field_note_authors to anon, authenticated;
grant select on public.field_note_topics to anon, authenticated;
grant select on public.field_note_revisions to authenticated;

grant insert, update on public.topics to authenticated;
grant insert, update on public.field_notes to authenticated;
grant insert, update, delete on public.field_note_authors to authenticated;
grant insert, delete on public.field_note_topics to authenticated;

grant usage, select on sequence public.topics_id_seq to authenticated;
grant usage, select on sequence public.field_notes_id_seq to authenticated;

create policy topics_select_active
on public.topics for select
to anon, authenticated
using (is_active and archived_at is null);

create policy topics_select_authorized
on public.topics for select
to authenticated
using (private.has_permission('topics.manage'));

create policy topics_insert_authorized
on public.topics for insert
to authenticated
with check (private.has_permission('topics.manage'));

create policy topics_update_authorized
on public.topics for update
to authenticated
using (private.has_permission('topics.manage'))
with check (private.has_permission('topics.manage'));

create policy field_notes_select_visible
on public.field_notes for select
to anon, authenticated
using (private.can_read_field_note(id));

create policy field_notes_insert_authorized
on public.field_notes for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and status = 'draft'
  and private.has_permission('field_notes.create')
);

create policy field_notes_update_authorized
on public.field_notes for update
to authenticated
using (
  private.can_edit_field_note(id)
  or private.has_permission('field_notes.submit')
  or private.has_permission('field_notes.review')
  or private.has_permission('field_notes.approve')
  or private.has_permission('field_notes.publish')
  or private.has_permission('field_notes.archive')
)
with check (
  (
    created_by = (select auth.uid())
    and (
      private.has_permission('field_notes.edit_own')
      or private.has_permission('field_notes.submit')
    )
  )
  or private.has_permission('field_notes.edit_any')
  or private.has_permission('field_notes.review')
  or private.has_permission('field_notes.approve')
  or private.has_permission('field_notes.publish')
  or private.has_permission('field_notes.archive')
);

create policy field_note_authors_select_visible
on public.field_note_authors for select
to anon, authenticated
using (private.can_read_field_note(field_note_id));

create policy field_note_authors_insert_authorized
on public.field_note_authors for insert
to authenticated
with check (private.can_edit_field_note(field_note_id));

create policy field_note_authors_update_authorized
on public.field_note_authors for update
to authenticated
using (private.can_edit_field_note(field_note_id))
with check (private.can_edit_field_note(field_note_id));

create policy field_note_authors_delete_authorized
on public.field_note_authors for delete
to authenticated
using (private.can_edit_field_note(field_note_id));

create policy field_note_topics_select_visible
on public.field_note_topics for select
to anon, authenticated
using (private.can_read_field_note(field_note_id));

create policy field_note_topics_insert_authorized
on public.field_note_topics for insert
to authenticated
with check (private.can_edit_field_note(field_note_id));

create policy field_note_topics_delete_authorized
on public.field_note_topics for delete
to authenticated
using (private.can_edit_field_note(field_note_id));

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
        or private.has_permission('field_notes.edit_any')
        or private.has_permission('field_notes.review')
      )
  )
);

comment on table public.field_notes is
  'Workflow-controlled Field Notes; authors are real-world people, not auth accounts.';
