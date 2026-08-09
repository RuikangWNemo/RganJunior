-- Keep privileged story metadata writes out of the exposed public schema.
-- Public RPCs remain stable SECURITY INVOKER wrappers; the private functions
-- retain the existing caller and row-level authorization checks.

create or replace function private.find_or_create_field_note_tag(
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

revoke all on function private.find_or_create_field_note_tag(text, text)
  from public, anon, authenticated;
grant execute on function private.find_or_create_field_note_tag(text, text)
  to authenticated;

create or replace function public.find_or_create_field_note_tag(
  tag_name_zh text,
  tag_name_en text default null
)
returns public.topics
language sql
security invoker
set search_path = ''
as $$
  select private.find_or_create_field_note_tag(tag_name_zh, tag_name_en);
$$;

revoke all on function public.find_or_create_field_note_tag(text, text)
  from public, anon, authenticated;
grant execute on function public.find_or_create_field_note_tag(text, text)
  to authenticated;

create or replace function private.save_field_note_metadata(
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

revoke all on function private.save_field_note_metadata(bigint, bigint, bigint[], text)
  from public, anon, authenticated;
grant execute on function private.save_field_note_metadata(bigint, bigint, bigint[], text)
  to authenticated;

create or replace function public.save_field_note_metadata(
  target_field_note_id bigint,
  target_category_id bigint,
  target_topic_ids bigint[] default '{}'::bigint[],
  target_visibility text default 'private'
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.save_field_note_metadata(
    target_field_note_id,
    target_category_id,
    target_topic_ids,
    target_visibility
  );
$$;

revoke all on function public.save_field_note_metadata(bigint, bigint, bigint[], text)
  from public, anon, authenticated;
grant execute on function public.save_field_note_metadata(bigint, bigint, bigint[], text)
  to authenticated;

-- Avoid duplicate permissive SELECT policies for authenticated users while
-- preserving anonymous access to active category labels.
drop policy if exists article_categories_select_active on public.article_categories;
drop policy if exists article_categories_select_authorized on public.article_categories;

create policy article_categories_select_anon_active
on public.article_categories for select
to anon
using (is_active);

create policy article_categories_select_authenticated
on public.article_categories for select
to authenticated
using (
  is_active
  or private.has_permission('topics.manage')
);

comment on function public.find_or_create_field_note_tag(text, text) is
  'Invoker wrapper for the private, permission-checked Field Note tag writer.';
comment on function public.save_field_note_metadata(bigint, bigint, bigint[], text) is
  'Invoker wrapper for the private, owner-authorized Field Note metadata writer.';
