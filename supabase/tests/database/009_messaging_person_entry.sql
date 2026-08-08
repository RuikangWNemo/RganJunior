begin;

create or replace function pg_temp.assert_true(test_condition boolean, test_label text)
returns void language plpgsql as $$
begin if not coalesce(test_condition, false) then raise exception 'TEST_FAILED: %', test_label; end if; end;
$$;
create or replace function pg_temp.expect_error(test_sql text, test_label text)
returns void language plpgsql as $$
begin begin execute test_sql; exception when others then return; end; raise exception 'TEST_FAILED: expected error: %', test_label; end;
$$;
create or replace function pg_temp.authenticate_as(test_user_id uuid)
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', test_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', test_user_id, 'role', 'authenticated')::text, true);
end;
$$;

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('90000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'person-message-a@test.rgan', '', now(), '{"provider":"email"}', '{"age_band":"adult_18_plus"}', now(), now()),
  ('90000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'person-message-b@test.rgan', '', now(), '{"provider":"email"}', '{"age_band":"adult_18_plus"}', now(), now()),
  ('90000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'person-message-out@test.rgan', '', now(), '{"provider":"email"}', '{"age_band":"adult_18_plus"}', now(), now());

insert into public.community_memberships (user_id, status, approved_by)
values
  ('90000000-0000-0000-0000-000000000001', 'active', '90000000-0000-0000-0000-000000000001'),
  ('90000000-0000-0000-0000-000000000002', 'active', '90000000-0000-0000-0000-000000000001');
insert into public.user_roles (user_id, role_id)
select members.user_id, r.id
from (values ('90000000-0000-0000-0000-000000000001'::uuid), ('90000000-0000-0000-0000-000000000002'::uuid)) members(user_id)
cross join public.roles r where r.slug = 'community_member';
insert into public.people (user_id, slug, display_name, is_public, profile_visibility, joined_at)
values
  ('90000000-0000-0000-0000-000000000001', 'person-message-a', '伙伴甲', true, 'public', current_date),
  ('90000000-0000-0000-0000-000000000002', 'person-message-b', '伙伴乙', true, 'public', current_date),
  ('90000000-0000-0000-0000-000000000003', 'person-message-out', '外部用户', false, 'private', null);

select set_config('test.person_message_b_id', (select id::text from public.people where slug = 'person-message-b'), true);
select set_config('test.person_message_out_id', (select id::text from public.people where slug = 'person-message-out'), true);

set local role authenticated;
select pg_temp.authenticate_as('90000000-0000-0000-0000-000000000001');
select pg_temp.assert_true(
  public.create_direct_conversation_with_person(current_setting('test.person_message_b_id')::bigint) is not null,
  'an active member can start from an active member safe Person id'
);
select pg_temp.expect_error(
  format(
    'select public.create_direct_conversation_with_person(%s)',
    current_setting('test.person_message_out_id')
  ),
  'a safe Person id cannot bypass the active Membership boundary'
);

rollback;
