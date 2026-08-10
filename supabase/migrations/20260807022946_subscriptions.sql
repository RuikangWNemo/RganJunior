-- Email subscribers and per-channel subscription preferences.
create table public.subscribers (
  id bigint generated always as identity primary key,
  user_id uuid unique references auth.users(id) on delete set null,
  email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'unsubscribed', 'bounced')),
  preferred_language text not null default 'zh'
    check (preferred_language in ('zh', 'en')),
  subscribed_at timestamptz not null default now(),
  verified_at timestamptz,
  unsubscribed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint subscribers_email_shape_check check (
    length(email) between 3 and 320
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  )
);

create unique index subscribers_email_lower_uidx on public.subscribers (lower(email));
create index subscribers_status_created_idx
  on public.subscribers (status, subscribed_at desc, id desc);

create table public.subscription_preferences (
  subscriber_id bigint not null references public.subscribers(id) on delete cascade,
  category text not null
    check (category in (
      'field_notes', 'nate_updates', 'activities', 'project_updates',
      'impact_report', 'newsletter'
    )),
  email_enabled boolean not null default true,
  web_push_enabled boolean not null default false,
  in_app_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (subscriber_id, category)
);

create index subscription_preferences_category_idx
  on public.subscription_preferences (category, subscriber_id)
  where email_enabled or web_push_enabled or in_app_enabled;

create trigger subscribers_set_updated_at
before update on public.subscribers
for each row execute function private.set_updated_at();

create trigger subscription_preferences_set_updated_at
before update on public.subscription_preferences
for each row execute function private.set_updated_at();

create or replace function private.current_auth_email()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select lower(u.email)
  from auth.users u
  where u.id = (select auth.uid());
$$;

revoke all on function private.current_auth_email() from public, anon, authenticated;
grant execute on function private.current_auth_email() to authenticated;

create or replace function private.protect_subscriber_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  manager boolean := private.has_permission('subscriptions.manage');
  confirmed_at timestamptz;
begin
  if tg_op = 'INSERT' then
    new.email = lower(trim(new.email));
    if caller is not null and not manager then
      select u.email_confirmed_at into confirmed_at
      from auth.users u where u.id = caller;
      new.user_id = caller;
      new.email = private.current_auth_email();
      new.status = case when confirmed_at is null then 'pending' else 'active' end;
      new.verified_at = confirmed_at;
      new.unsubscribed_at = null;
    end if;
    return new;
  end if;

  if new.id is distinct from old.id
     or new.subscribed_at is distinct from old.subscribed_at then
    raise exception using errcode = '42501', message = 'SUBSCRIBER_SYSTEM_FIELDS_IMMUTABLE';
  end if;

  new.email = lower(trim(new.email));
  if caller is not null and not manager then
    if old.user_id is distinct from caller
       or new.user_id is distinct from old.user_id
       or new.email is distinct from old.email
       or new.verified_at is distinct from old.verified_at then
      raise exception using errcode = '42501', message = 'SUBSCRIBER_FIELDS_NOT_ALLOWED';
    end if;
    if new.status not in ('active', 'unsubscribed') then
      raise exception using errcode = '42501', message = 'SUBSCRIBER_STATUS_NOT_ALLOWED';
    end if;
  end if;

  if new.status = 'unsubscribed' and old.status <> 'unsubscribed' then
    new.unsubscribed_at = statement_timestamp();
  elsif new.status = 'active' then
    new.unsubscribed_at = null;
  end if;
  return new;
end;
$$;

create trigger subscribers_protect_fields
before insert or update on public.subscribers
for each row execute function private.protect_subscriber_fields();

create or replace function public.request_subscription(
  subscriber_email text,
  subscriber_language text default 'zh',
  requested_categories text[] default array['field_notes']::text[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(trim(subscriber_email));
  normalized_language text := lower(trim(subscriber_language));
  created_subscriber_id bigint;
begin
  if length(normalized_email) not between 3 and 320
     or normalized_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '22023', message = 'INVALID_EMAIL';
  end if;
  if normalized_language not in ('zh', 'en') then
    raise exception using errcode = '22023', message = 'INVALID_LANGUAGE';
  end if;
  if exists (
    select 1
    from unnest(coalesce(requested_categories, array[]::text[])) as category_value
    where category_value not in (
      'field_notes', 'nate_updates', 'activities', 'project_updates',
      'impact_report', 'newsletter'
    )
  ) then
    raise exception using errcode = '22023', message = 'INVALID_SUBSCRIPTION_CATEGORY';
  end if;

  insert into public.subscribers (email, preferred_language, status)
  values (normalized_email, normalized_language, 'pending')
  on conflict do nothing
  returning id into created_subscriber_id;

  -- Existing addresses intentionally return the same result without revealing state.
  if created_subscriber_id is null then
    return;
  end if;

  insert into public.subscription_preferences (subscriber_id, category)
  select created_subscriber_id, category_value
  from (
    select distinct category_value
    from unnest(
      case
        when cardinality(coalesce(requested_categories, array[]::text[])) = 0
          then array['field_notes']::text[]
        else requested_categories
      end
    ) as category_value
  ) requested;
end;
$$;

revoke all on function public.request_subscription(text, text, text[]) from public;
grant execute on function public.request_subscription(text, text, text[]) to anon, authenticated;

-- Link a pre-existing email-only subscriber when that email creates an account.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_roles integer;
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    )
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

alter table public.subscribers enable row level security;
alter table public.subscription_preferences enable row level security;

revoke all on public.subscribers from anon, authenticated;
revoke all on public.subscription_preferences from anon, authenticated;

grant select, insert, update on public.subscribers to authenticated;
grant select, insert, update, delete on public.subscription_preferences to authenticated;
grant usage, select on sequence public.subscribers_id_seq to authenticated;

create policy subscribers_select_own_or_manager
on public.subscribers for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.has_permission('subscriptions.manage')
);

create policy subscribers_insert_own_or_manager
on public.subscribers for insert
to authenticated
with check (
  (
    user_id = (select auth.uid())
    and lower(email) = private.current_auth_email()
  )
  or private.has_permission('subscriptions.manage')
);

create policy subscribers_update_own_or_manager
on public.subscribers for update
to authenticated
using (
  user_id = (select auth.uid())
  or private.has_permission('subscriptions.manage')
)
with check (
  user_id = (select auth.uid())
  or private.has_permission('subscriptions.manage')
);

create policy subscription_preferences_select_own_or_manager
on public.subscription_preferences for select
to authenticated
using (
  exists (
    select 1
    from public.subscribers s
    where s.id = subscriber_id
      and (
        s.user_id = (select auth.uid())
        or private.has_permission('subscriptions.manage')
      )
  )
);

create policy subscription_preferences_insert_own_or_manager
on public.subscription_preferences for insert
to authenticated
with check (
  exists (
    select 1
    from public.subscribers s
    where s.id = subscriber_id
      and (
        s.user_id = (select auth.uid())
        or private.has_permission('subscriptions.manage')
      )
  )
);

create policy subscription_preferences_update_own_or_manager
on public.subscription_preferences for update
to authenticated
using (
  exists (
    select 1
    from public.subscribers s
    where s.id = subscriber_id
      and (
        s.user_id = (select auth.uid())
        or private.has_permission('subscriptions.manage')
      )
  )
)
with check (
  exists (
    select 1
    from public.subscribers s
    where s.id = subscriber_id
      and (
        s.user_id = (select auth.uid())
        or private.has_permission('subscriptions.manage')
      )
  )
);

create policy subscription_preferences_delete_own_or_manager
on public.subscription_preferences for delete
to authenticated
using (
  exists (
    select 1
    from public.subscribers s
    where s.id = subscriber_id
      and (
        s.user_id = (select auth.uid())
        or private.has_permission('subscriptions.manage')
      )
  )
);

comment on function public.request_subscription(text, text, text[]) is
  'Privacy-preserving email subscription request; existing addresses are never disclosed.';
