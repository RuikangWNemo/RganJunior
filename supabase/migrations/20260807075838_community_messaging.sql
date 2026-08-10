-- Youth-aware direct messaging, blocks, reports, and Realtime publication.

create table public.direct_conversations (
  id uuid primary key default gen_random_uuid(),
  direct_key text not null unique,
  status text not null default 'active',
  created_by uuid not null references auth.users(id) on delete restrict,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint direct_conversations_key_check check (
    direct_key ~ '^[0-9a-f-]{36}:[0-9a-f-]{36}$'
  ),
  constraint direct_conversations_status_check check (
    status in ('active', 'locked', 'archived')
  )
);

create index direct_conversations_last_message_idx
  on public.direct_conversations (last_message_at desc nulls last, id);
create index direct_conversations_created_by_idx
  on public.direct_conversations (created_by, created_at desc);

create table public.conversation_participants (
  conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  last_read_at timestamptz,
  muted_at timestamptz,
  primary key (conversation_id, user_id)
);

create index conversation_participants_user_idx
  on public.conversation_participants (user_id, joined_at desc, conversation_id);

create table public.direct_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete restrict,
  body text not null,
  status text not null default 'sent',
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  constraint direct_messages_body_check check (
    length(trim(body)) between 1 and 5000
  ),
  constraint direct_messages_status_check check (
    status in ('sent', 'edited', 'deleted')
  ),
  constraint direct_messages_deleted_check check (
    status <> 'deleted' or deleted_at is not null
  )
);

create index direct_messages_conversation_idx
  on public.direct_messages (conversation_id, id desc);
create index direct_messages_sender_idx
  on public.direct_messages (sender_user_id, created_at desc);

create table public.member_blocks (
  blocker_user_id uuid not null references auth.users(id) on delete cascade,
  blocked_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_user_id, blocked_user_id),
  constraint member_blocks_not_self check (blocker_user_id <> blocked_user_id)
);

create index member_blocks_blocked_idx
  on public.member_blocks (blocked_user_id, blocker_user_id);

create table public.community_reports (
  id bigint generated always as identity primary key,
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  reported_user_id uuid not null references auth.users(id) on delete restrict,
  message_id bigint references public.direct_messages(id) on delete set null,
  category text not null,
  details text,
  status text not null default 'open',
  assigned_to uuid references auth.users(id) on delete set null,
  resolution_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_reports_category_check check (
    category in ('harassment', 'unsafe_contact', 'spam', 'privacy', 'self_harm', 'other')
  ),
  constraint community_reports_status_check check (
    status in ('open', 'under_review', 'resolved', 'dismissed')
  ),
  constraint community_reports_resolution_check check (
    status not in ('resolved', 'dismissed')
    or (resolved_at is not null and length(trim(resolution_note)) > 0)
  )
);

create index community_reports_queue_idx
  on public.community_reports (status, created_at, id)
  where status in ('open', 'under_review');
create index community_reports_reporter_idx
  on public.community_reports (reporter_user_id, created_at desc);
create index community_reports_reported_idx
  on public.community_reports (reported_user_id, created_at desc);
create index community_reports_assigned_idx
  on public.community_reports (assigned_to, created_at desc)
  where assigned_to is not null;

create trigger direct_conversations_set_updated_at
before update on public.direct_conversations
for each row execute function private.set_updated_at();
create trigger community_reports_set_updated_at
before update on public.community_reports
for each row execute function private.set_updated_at();

create trigger member_blocks_audit_changes
after insert or delete on public.member_blocks
for each row execute function private.audit_row_change('member_block');
create trigger community_reports_audit_changes
after insert or update on public.community_reports
for each row execute function private.audit_row_change('community_report');

alter table public.direct_conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.direct_messages enable row level security;
alter table public.member_blocks enable row level security;
alter table public.community_reports enable row level security;

revoke all on public.direct_conversations from public, anon, authenticated;
revoke all on public.conversation_participants from public, anon, authenticated;
revoke all on public.direct_messages from public, anon, authenticated;
revoke all on public.member_blocks from public, anon, authenticated;
revoke all on public.community_reports from public, anon, authenticated;

grant select on public.direct_conversations to authenticated;
grant select on public.conversation_participants to authenticated;
grant select on public.direct_messages to authenticated;
grant select on public.member_blocks to authenticated;
grant select on public.community_reports to authenticated;

create or replace function private.is_conversation_participant(
  target_conversation_id uuid,
  target_user_id uuid
)
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = target_conversation_id
      and cp.user_id = target_user_id
      and cp.left_at is null
  );
$$;

revoke all on function private.is_conversation_participant(uuid, uuid)
  from public, anon, authenticated;
grant execute on function private.is_conversation_participant(uuid, uuid)
  to authenticated;

create policy direct_conversations_select_participant
on public.direct_conversations for select to authenticated
using (private.is_conversation_participant(id, (select auth.uid())));

create policy conversation_participants_select_conversation
on public.conversation_participants for select to authenticated
using (private.is_conversation_participant(conversation_id, (select auth.uid())));

create policy direct_messages_select_participant
on public.direct_messages for select to authenticated
using (private.is_conversation_participant(conversation_id, (select auth.uid())));

create policy member_blocks_select_own
on public.member_blocks for select to authenticated
using (blocker_user_id = (select auth.uid()));

create policy community_reports_select_authorized
on public.community_reports for select to authenticated
using (
  reporter_user_id = (select auth.uid())
  or private.has_permission('messages.moderate')
  or private.has_permission('moderation.manage')
);

create or replace function private.create_direct_conversation(target_user_id uuid)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  caller uuid := (select auth.uid());
  conversation_key text;
  created_conversation_id uuid;
begin
  if caller is null
     or caller = target_user_id
     or not private.user_has_permission(caller, 'messages.use')
     or not private.has_active_membership(caller)
     or not private.user_has_permission(target_user_id, 'messages.use')
     or not private.has_active_membership(target_user_id) then
    raise exception using errcode = '42501', message = 'MESSAGE_CONTACT_NOT_ALLOWED';
  end if;
  if not exists (
    select 1 from public.user_settings us
    where us.user_id = target_user_id and us.allow_messages
  ) then
    raise exception using errcode = '42501', message = 'MESSAGE_CONTACT_NOT_ALLOWED';
  end if;
  if exists (
    select 1 from public.member_blocks mb
    where (mb.blocker_user_id = caller and mb.blocked_user_id = target_user_id)
       or (mb.blocker_user_id = target_user_id and mb.blocked_user_id = caller)
  ) then
    raise exception using errcode = '42501', message = 'MESSAGE_CONTACT_NOT_ALLOWED';
  end if;

  conversation_key := least(caller::text, target_user_id::text)
    || ':' || greatest(caller::text, target_user_id::text);
  insert into public.direct_conversations (direct_key, created_by)
  values (conversation_key, caller)
  on conflict (direct_key) do update set status = 'active'
  returning id into created_conversation_id;

  insert into public.conversation_participants (conversation_id, user_id)
  values (created_conversation_id, caller), (created_conversation_id, target_user_id)
  on conflict (conversation_id, user_id) do update set left_at = null;
  return created_conversation_id;
end;
$$;

create or replace function private.list_direct_conversations()
returns table (
  conversation_id uuid,
  other_user_id uuid,
  other_person_slug text,
  other_display_name text,
  other_nature_name text,
  other_avatar_media_id bigint,
  conversation_status text,
  last_message_body text,
  last_message_at timestamptz,
  unread_count bigint,
  muted boolean
)
language plpgsql stable security definer set search_path = '' as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null
     or not private.user_has_permission(caller, 'messages.use')
     or not private.has_active_membership(caller) then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  return query
  select
    dc.id,
    other_cp.user_id,
    pe.slug,
    pe.display_name,
    pe.nature_name,
    pe.avatar_media_id,
    dc.status,
    case when last_message.status = 'deleted' then null else last_message.body end,
    last_message.created_at,
    (
      select count(*) from public.direct_messages unread
      where unread.conversation_id = dc.id
        and unread.sender_user_id <> caller
        and (
          self_cp.last_read_at is null
          or unread.created_at > self_cp.last_read_at
        )
    ),
    self_cp.muted_at is not null
  from public.direct_conversations dc
  join public.conversation_participants self_cp
    on self_cp.conversation_id = dc.id and self_cp.user_id = caller and self_cp.left_at is null
  join public.conversation_participants other_cp
    on other_cp.conversation_id = dc.id and other_cp.user_id <> caller and other_cp.left_at is null
  left join public.people pe on pe.user_id = other_cp.user_id
  left join lateral (
    select dm.* from public.direct_messages dm
    where dm.conversation_id = dc.id
    order by dm.id desc limit 1
  ) last_message on true
  order by coalesce(dc.last_message_at, dc.created_at) desc, dc.id;
end;
$$;

create or replace function private.list_direct_messages(
  target_conversation_id uuid,
  page_size integer default 50,
  before_message_id bigint default null
)
returns table (
  id bigint,
  conversation_id uuid,
  sender_user_id uuid,
  body text,
  status text,
  created_at timestamptz,
  edited_at timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
declare caller uuid := (select auth.uid());
begin
  if caller is null or not private.is_conversation_participant(target_conversation_id, caller) then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  return query
  select dm.id, dm.conversation_id, dm.sender_user_id,
    case when dm.status = 'deleted' then '' else dm.body end,
    dm.status, dm.created_at, dm.edited_at
  from public.direct_messages dm
  where dm.conversation_id = target_conversation_id
    and (before_message_id is null or dm.id < before_message_id)
  order by dm.id desc
  limit least(greatest(coalesce(page_size, 50), 1), 100);
end;
$$;

create or replace function private.send_direct_message(
  target_conversation_id uuid,
  message_body text
)
returns bigint
language plpgsql security definer set search_path = '' as $$
declare
  caller uuid := (select auth.uid());
  message_id bigint;
begin
  if caller is null
     or not private.user_has_permission(caller, 'messages.use')
     or not private.has_active_membership(caller)
     or not private.is_conversation_participant(target_conversation_id, caller)
     or nullif(trim(message_body), '') is null
     or length(trim(message_body)) > 5000 then
    raise exception using errcode = '42501', message = 'MESSAGE_SEND_NOT_ALLOWED';
  end if;
  if not exists (
    select 1 from public.direct_conversations dc
    where dc.id = target_conversation_id and dc.status = 'active'
  ) then
    raise exception using errcode = '42501', message = 'MESSAGE_SEND_NOT_ALLOWED';
  end if;
  if exists (
    select 1
    from public.conversation_participants recipient
    left join public.user_settings us on us.user_id = recipient.user_id
    where recipient.conversation_id = target_conversation_id
      and recipient.user_id <> caller
      and recipient.left_at is null
      and (
        not private.has_active_membership(recipient.user_id)
        or not coalesce(us.allow_messages, false)
        or exists (
          select 1 from public.member_blocks mb
          where (mb.blocker_user_id = caller and mb.blocked_user_id = recipient.user_id)
             or (mb.blocker_user_id = recipient.user_id and mb.blocked_user_id = caller)
        )
      )
  ) then
    raise exception using errcode = '42501', message = 'MESSAGE_SEND_NOT_ALLOWED';
  end if;

  insert into public.direct_messages (conversation_id, sender_user_id, body)
  values (target_conversation_id, caller, trim(message_body))
  returning id into message_id;
  update public.direct_conversations
  set last_message_at = statement_timestamp()
  where id = target_conversation_id;
  return message_id;
end;
$$;

create or replace function private.mark_conversation_read(target_conversation_id uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare caller uuid := (select auth.uid());
begin
  update public.conversation_participants
  set last_read_at = statement_timestamp()
  where conversation_id = target_conversation_id and user_id = caller and left_at is null;
  if not found then raise exception using errcode = '22023', message = 'CONVERSATION_NOT_FOUND'; end if;
end;
$$;

create or replace function private.block_community_member(target_user_id uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare caller uuid := (select auth.uid());
declare conversation_key text;
begin
  if caller is null or caller = target_user_id or not private.has_active_membership(caller) then
    raise exception using errcode = '42501', message = 'BLOCK_NOT_ALLOWED';
  end if;
  insert into public.member_blocks (blocker_user_id, blocked_user_id)
  values (caller, target_user_id) on conflict do nothing;
  conversation_key := least(caller::text, target_user_id::text) || ':' || greatest(caller::text, target_user_id::text);
  update public.direct_conversations set status = 'locked' where direct_key = conversation_key;
end;
$$;

create or replace function private.unblock_community_member(target_user_id uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare caller uuid := (select auth.uid());
declare conversation_key text;
begin
  if caller is null then raise exception using errcode = '42501', message = 'AUTH_REQUIRED'; end if;
  delete from public.member_blocks where blocker_user_id = caller and blocked_user_id = target_user_id;
  conversation_key := least(caller::text, target_user_id::text) || ':' || greatest(caller::text, target_user_id::text);
  if not exists (
    select 1 from public.member_blocks mb
    where (mb.blocker_user_id = caller and mb.blocked_user_id = target_user_id)
       or (mb.blocker_user_id = target_user_id and mb.blocked_user_id = caller)
  ) then
    update public.direct_conversations set status = 'active' where direct_key = conversation_key;
  end if;
end;
$$;

create or replace function private.report_direct_message(
  target_message_id bigint,
  report_category text,
  report_details text default null
)
returns bigint
language plpgsql security definer set search_path = '' as $$
declare caller uuid := (select auth.uid());
declare message_row public.direct_messages%rowtype;
declare report_id bigint;
begin
  select * into message_row from public.direct_messages dm
  where dm.id = target_message_id for update;
  if caller is null or not found
     or message_row.sender_user_id = caller
     or not private.is_conversation_participant(message_row.conversation_id, caller) then
    raise exception using errcode = '42501', message = 'REPORT_NOT_ALLOWED';
  end if;
  if report_category not in ('harassment', 'unsafe_contact', 'spam', 'privacy', 'self_harm', 'other') then
    raise exception using errcode = '22023', message = 'INVALID_REPORT_CATEGORY';
  end if;
  insert into public.community_reports (
    reporter_user_id, reported_user_id, message_id, category, details
  ) values (
    caller, message_row.sender_user_id, message_row.id, report_category,
    nullif(trim(report_details), '')
  ) returning id into report_id;
  return report_id;
end;
$$;

create or replace function private.list_community_reports(
  page_size integer default 50,
  report_statuses text[] default array['open', 'under_review']::text[]
)
returns table (
  id bigint, reporter_user_id uuid, reported_user_id uuid, message_id bigint,
  category text, details text, status text, created_at timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
declare caller uuid := (select auth.uid());
begin
  if caller is null or not (
    private.user_has_permission(caller, 'messages.moderate')
    or private.user_has_permission(caller, 'moderation.manage')
  ) then raise exception using errcode = '42501', message = 'PERMISSION_DENIED'; end if;
  return query select cr.id, cr.reporter_user_id, cr.reported_user_id, cr.message_id,
    cr.category, cr.details, cr.status, cr.created_at
  from public.community_reports cr
  where cr.status = any(coalesce(report_statuses, array[]::text[]))
  order by cr.created_at, cr.id
  limit least(greatest(coalesce(page_size, 50), 1), 100);
end;
$$;

create or replace function private.resolve_community_report(
  target_report_id bigint,
  resolution_status text,
  target_resolution_note text
)
returns void
language plpgsql security definer set search_path = '' as $$
declare caller uuid := (select auth.uid());
begin
  if caller is null or not (
    private.user_has_permission(caller, 'messages.moderate')
    or private.user_has_permission(caller, 'moderation.manage')
  ) then raise exception using errcode = '42501', message = 'PERMISSION_DENIED'; end if;
  if resolution_status not in ('resolved', 'dismissed') or nullif(trim(target_resolution_note), '') is null then
    raise exception using errcode = '22023', message = 'INVALID_REPORT_RESOLUTION';
  end if;
  update public.community_reports
  set status = resolution_status, assigned_to = caller,
      resolution_note = trim(target_resolution_note), resolved_at = statement_timestamp()
  where id = target_report_id and status in ('open', 'under_review');
  if not found then raise exception using errcode = '22023', message = 'REPORT_NOT_RESOLVABLE'; end if;
end;
$$;

revoke all on function private.create_direct_conversation(uuid) from public, anon, authenticated;
revoke all on function private.list_direct_conversations() from public, anon, authenticated;
revoke all on function private.list_direct_messages(uuid, integer, bigint) from public, anon, authenticated;
revoke all on function private.send_direct_message(uuid, text) from public, anon, authenticated;
revoke all on function private.mark_conversation_read(uuid) from public, anon, authenticated;
revoke all on function private.block_community_member(uuid) from public, anon, authenticated;
revoke all on function private.unblock_community_member(uuid) from public, anon, authenticated;
revoke all on function private.report_direct_message(bigint, text, text) from public, anon, authenticated;
revoke all on function private.list_community_reports(integer, text[]) from public, anon, authenticated;
revoke all on function private.resolve_community_report(bigint, text, text) from public, anon, authenticated;
grant execute on function private.create_direct_conversation(uuid), private.list_direct_conversations(), private.list_direct_messages(uuid, integer, bigint), private.send_direct_message(uuid, text), private.mark_conversation_read(uuid), private.block_community_member(uuid), private.unblock_community_member(uuid), private.report_direct_message(bigint, text, text), private.list_community_reports(integer, text[]), private.resolve_community_report(bigint, text, text) to authenticated;

create function public.create_direct_conversation(target_user_id uuid) returns uuid language sql security invoker set search_path='' as $$ select private.create_direct_conversation(target_user_id); $$;
create function public.list_direct_conversations() returns table (conversation_id uuid, other_user_id uuid, other_person_slug text, other_display_name text, other_nature_name text, other_avatar_media_id bigint, conversation_status text, last_message_body text, last_message_at timestamptz, unread_count bigint, muted boolean) language sql stable security invoker set search_path='' as $$ select * from private.list_direct_conversations(); $$;
create function public.list_direct_messages(target_conversation_id uuid, page_size integer default 50, before_message_id bigint default null) returns table (id bigint, conversation_id uuid, sender_user_id uuid, body text, status text, created_at timestamptz, edited_at timestamptz) language sql stable security invoker set search_path='' as $$ select * from private.list_direct_messages(target_conversation_id, page_size, before_message_id); $$;
create function public.send_direct_message(target_conversation_id uuid, message_body text) returns bigint language sql security invoker set search_path='' as $$ select private.send_direct_message(target_conversation_id, message_body); $$;
create function public.mark_conversation_read(target_conversation_id uuid) returns void language sql security invoker set search_path='' as $$ select private.mark_conversation_read(target_conversation_id); $$;
create function public.block_community_member(target_user_id uuid) returns void language sql security invoker set search_path='' as $$ select private.block_community_member(target_user_id); $$;
create function public.unblock_community_member(target_user_id uuid) returns void language sql security invoker set search_path='' as $$ select private.unblock_community_member(target_user_id); $$;
create function public.report_direct_message(target_message_id bigint, report_category text, report_details text default null) returns bigint language sql security invoker set search_path='' as $$ select private.report_direct_message(target_message_id, report_category, report_details); $$;
create function public.list_community_reports(page_size integer default 50, report_statuses text[] default array['open','under_review']::text[]) returns table (id bigint, reporter_user_id uuid, reported_user_id uuid, message_id bigint, category text, details text, status text, created_at timestamptz) language sql stable security invoker set search_path='' as $$ select * from private.list_community_reports(page_size, report_statuses); $$;
create function public.resolve_community_report(target_report_id bigint, resolution_status text, target_resolution_note text) returns void language sql security invoker set search_path='' as $$ select private.resolve_community_report(target_report_id, resolution_status, target_resolution_note); $$;

revoke all on function public.create_direct_conversation(uuid), public.list_direct_conversations(), public.list_direct_messages(uuid, integer, bigint), public.send_direct_message(uuid, text), public.mark_conversation_read(uuid), public.block_community_member(uuid), public.unblock_community_member(uuid), public.report_direct_message(bigint, text, text), public.list_community_reports(integer, text[]), public.resolve_community_report(bigint, text, text) from public, anon;
grant execute on function public.create_direct_conversation(uuid), public.list_direct_conversations(), public.list_direct_messages(uuid, integer, bigint), public.send_direct_message(uuid, text), public.mark_conversation_read(uuid), public.block_community_member(uuid), public.unblock_community_member(uuid), public.report_direct_message(bigint, text, text), public.list_community_reports(integer, text[]), public.resolve_community_report(bigint, text, text) to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'direct_messages'
     ) then
    alter publication supabase_realtime add table public.direct_messages;
  end if;
end;
$$;

comment on table public.direct_messages is 'RLS-protected member messages; Realtime publication still respects participant authorization.';
