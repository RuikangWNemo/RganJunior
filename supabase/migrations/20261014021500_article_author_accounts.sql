-- Authorship is a person/account association, independent from who entered a story.
set lock_timeout = '5s';
set statement_timeout = '60s';

create or replace function private.user_is_field_note_author(note_id bigint, account_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select account_id is not null and exists (
    select 1 from public.field_note_authors a
    join public.people p on p.id = a.person_id
    where a.field_note_id = note_id and p.user_id = account_id and p.status = 'active'
  );
$$;
revoke all on function private.user_is_field_note_author(bigint, uuid) from public, anon, authenticated;
grant execute on function private.user_is_field_note_author(bigint, uuid) to authenticated, service_role;

create or replace function private.user_can_read_field_note(check_field_note_id bigint, check_user_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.field_notes fn where fn.id = check_field_note_id and (
      (fn.status = 'published' and fn.visibility = 'public')
      or (fn.status = 'published' and fn.visibility = 'members' and private.has_active_membership(check_user_id))
      or fn.created_by = check_user_id
      or private.user_is_field_note_author(fn.id, check_user_id)
      or private.is_active_field_note_collaborator(fn.id, check_user_id)
      or private.user_has_permission(check_user_id, 'field_notes.edit_any')
      or private.user_has_permission(check_user_id, 'field_notes.review')
      or private.user_has_permission(check_user_id, 'field_notes.approve')
      or private.user_has_permission(check_user_id, 'field_notes.publish')
      or private.user_has_permission(check_user_id, 'field_notes.archive')
    )
  );
$$;

-- Invoker query retains RLS. No caller-supplied user ID can select another library.
create function public.list_my_field_note_ids()
returns table(id bigint) language sql stable security invoker set search_path = '' as $$
  select fn.id from public.field_notes fn
  where (select auth.uid()) is not null and (
    fn.created_by = (select auth.uid())
    or private.user_is_field_note_author(fn.id, (select auth.uid()))
  );
$$;
revoke all on function public.list_my_field_note_ids() from public, anon, authenticated;
grant execute on function public.list_my_field_note_ids() to authenticated;

create function private.list_article_authors_admin()
returns table(person_id bigint, slug text, display_name text, nature_name text, username text, has_account boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null or not private.has_permission('field_notes.edit_any')
     or not private.has_permission('people.manage') then
    raise exception using errcode = '42501', message = 'ARTICLE_AUTHORS_NOT_ALLOWED';
  end if;
  return query select p.id, p.slug, p.display_name, p.nature_name, pr.username, p.user_id is not null
  from public.people p left join public.profiles pr on pr.user_id = p.user_id
  where p.status = 'active' order by p.display_name, p.id;
end;
$$;
create function public.list_article_authors_admin()
returns table(person_id bigint, slug text, display_name text, nature_name text, username text, has_account boolean)
language sql stable security invoker set search_path = '' as $$ select * from private.list_article_authors_admin(); $$;
revoke all on function private.list_article_authors_admin() from public, anon, authenticated;
revoke all on function public.list_article_authors_admin() from public, anon, authenticated;
grant execute on function private.list_article_authors_admin() to authenticated;
grant execute on function public.list_article_authors_admin() to authenticated;

-- Import a draft and its real author atomically. A retry never overwrites edits.
create function private.import_author_article(article jsonb, author_person_id bigint default null)
returns bigint language plpgsql security definer set search_path = '' as $$
declare
  caller uuid := (select auth.uid());
  note_id bigint;
  person_id bigint := author_person_id;
  category bigint;
  source_slug text := article->>'slug';
  person_slug text := 'article-author-' || (article->>'authorSlug');
begin
  if caller is null or not private.has_permission('field_notes.edit_any')
     or not private.has_permission('field_notes.create') or not private.has_permission('people.manage') then
    raise exception using errcode = '42501', message = 'ARTICLE_IMPORT_NOT_ALLOWED';
  end if;
  if source_slug is null or source_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     or coalesce(length(btrim(article->>'title')), 0) = 0
     or coalesce(length(btrim(article->>'content')), 0) = 0
     or jsonb_typeof(article->'contentJson') is distinct from 'array'
     or coalesce(length(article->>'contentHtml'), 0) = 0 then
    raise exception using errcode = '22023', message = 'INVALID_ARTICLE_IMPORT';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('article-import:' || source_slug, 0));
  select fn.id into note_id from public.field_notes fn where fn.slug = source_slug;
  if found then return note_id; end if;
  if person_id is null then
    if coalesce((article->>'requiresAccount')::boolean, false) then
      raise exception using errcode = '22023', message = 'EXISTING_AUTHOR_ACCOUNT_REQUIRED';
    end if;
    if person_slug is null or person_slug !~ '^article-author-[a-z0-9]+(-[a-z0-9]+)*$'
       or coalesce(length(btrim(article->>'authorName')), 0) = 0 then
      raise exception using errcode = '22023', message = 'INVALID_ARTICLE_AUTHOR';
    end if;
    insert into public.people(slug, display_name, is_public)
    values (person_slug, article->>'authorName', true)
    on conflict (lower(slug)) do nothing;
    select p.id into person_id from public.people p where lower(p.slug) = person_slug and p.status = 'active';
  end if;
  if person_id is null or not exists(select 1 from public.people p where p.id = person_id and p.status = 'active'
     and (not coalesce((article->>'requiresAccount')::boolean, false) or p.user_id is not null)) then
    raise exception using errcode = '22023', message = 'INVALID_ARTICLE_AUTHOR';
  end if;
  select ac.id into category from public.article_categories ac where ac.slug = 'people-stories' and ac.is_active;
  if category is null then raise exception using errcode = '22023', message = 'ARTICLE_CATEGORY_MISSING'; end if;
  insert into public.field_notes(slug, title, excerpt, content, content_json, content_html, category_id, status, visibility, created_by)
  values(source_slug, article->>'title', article->>'excerpt', article->>'content', article->'contentJson', article->>'contentHtml', category, 'draft', 'private', caller)
  returning id into note_id;
  -- Remove the automatic attribution to the operator; retain created_by as audit provenance.
  delete from public.field_note_authors a where a.field_note_id = note_id;
  insert into public.field_note_authors(field_note_id, person_id, author_order, contribution_role)
  values(note_id, person_id, 0, 'author');
  return note_id;
end;
$$;
create function public.import_author_article(article jsonb, author_person_id bigint default null)
returns bigint language sql security invoker set search_path = '' as $$ select private.import_author_article(article, author_person_id); $$;
revoke all on function private.import_author_article(jsonb, bigint) from public, anon, authenticated;
revoke all on function public.import_author_article(jsonb, bigint) from public, anon, authenticated;
grant execute on function private.import_author_article(jsonb, bigint) to authenticated;
grant execute on function public.import_author_article(jsonb, bigint) to authenticated;

-- Registration creates a separate person record. After verifying identity, an
-- administrator moves only article attribution to that registered record.
-- No email/name matching, account merge, private-profile copying, or publication.
create function private.link_pending_article_author(source_person_id bigint, target_person_id bigint)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  affected integer;
begin
  if (select auth.uid()) is null or not private.has_permission('field_notes.edit_any')
     or not private.has_permission('people.manage') then
    raise exception using errcode = '42501', message = 'ARTICLE_AUTHOR_LINK_NOT_ALLOWED';
  end if;
  perform p.id from public.people p where p.id in (source_person_id, target_person_id) order by p.id for update;
  if source_person_id = target_person_id or not exists (
    select 1 from public.people p where p.id = source_person_id and p.user_id is null and p.status = 'active'
  ) or not exists (
    select 1 from public.people p where p.id = target_person_id and p.user_id is not null and p.status = 'active'
  ) then raise exception using errcode = '22023', message = 'INVALID_ARTICLE_AUTHOR_LINK'; end if;
  -- Serialize against edits to each affected note; conflicts preserve existing coauthors.
  perform fn.id from public.field_notes fn join public.field_note_authors a on a.field_note_id = fn.id
  where a.person_id = source_person_id order by fn.id for update of fn;
  insert into public.field_note_authors(field_note_id, person_id, author_order, contribution_role)
  select a.field_note_id, target_person_id, a.author_order, a.contribution_role
  from public.field_note_authors a where a.person_id = source_person_id
  on conflict(field_note_id, person_id) do nothing;
  delete from public.field_note_authors a where a.person_id = source_person_id;
  get diagnostics affected = row_count;
  return affected;
end;
$$;
create function public.link_pending_article_author(source_person_id bigint, target_person_id bigint)
returns integer language sql security invoker set search_path = '' as $$ select private.link_pending_article_author(source_person_id, target_person_id); $$;
revoke all on function private.link_pending_article_author(bigint, bigint) from public, anon, authenticated;
revoke all on function public.link_pending_article_author(bigint, bigint) from public, anon, authenticated;
grant execute on function private.link_pending_article_author(bigint, bigint) to authenticated;
grant execute on function public.link_pending_article_author(bigint, bigint) to authenticated;

create trigger field_note_authors_audit_changes after insert or update or delete on public.field_note_authors
for each row execute function private.audit_row_change('field_note_author');

-- Staff may submit the drafts they manage, including another operator’s import.
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
        and (old.created_by = caller or private.has_permission('field_notes.edit_any'))
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
