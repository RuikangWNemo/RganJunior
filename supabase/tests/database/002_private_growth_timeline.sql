begin;

create or replace function pg_temp.assert_true(test_condition boolean, test_label text)
returns void
language plpgsql
as $$
begin
  if not coalesce(test_condition, false) then
    raise exception 'TEST_FAILED: %', test_label;
  end if;
end;
$$;

create or replace function pg_temp.expect_error(test_sql text, test_label text)
returns void
language plpgsql
as $$
begin
  begin
    execute test_sql;
  exception when others then
    return;
  end;
  raise exception 'TEST_FAILED: expected error: %', test_label;
end;
$$;

create or replace function pg_temp.authenticate_as(test_user_id uuid, test_email text)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claim.sub', test_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config(
    'request.jwt.claims',
    jsonb_build_object(
      'sub', test_user_id,
      'role', 'authenticated',
      'email', test_email
    )::text,
    true
  );
end;
$$;

-- Registration creates an immutable profile registration timestamp.
insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'growth-member@test.rgan', '', now(),
    '{"provider":"email"}', '{"display_name":"Growth Member","age_band":"adult_18_plus"}',
    '2025-04-05 06:07:08+00', now()
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'growth-reader@test.rgan', '', now(),
    '{"provider":"email"}', '{"display_name":"Growth Reader","age_band":"adult_18_plus"}', now(), now()
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'growth-manager@test.rgan', '', now(),
    '{"provider":"email"}', '{"display_name":"Growth Manager","age_band":"adult_18_plus"}', now(), now()
  );

select pg_temp.assert_true(
  (
    select registered_at = '2025-04-05 06:07:08+00'::timestamptz
    from public.profiles
    where user_id = '20000000-0000-0000-0000-000000000001'
  ),
  'registered_at is copied from auth.users.created_at'
);

-- Natural names are optional and intentionally non-unique.
insert into public.people (slug, display_name, nature_name, is_public, status)
values
  ('growth-person-test', 'Growth Person', '小叶', false, 'active'),
  ('growth-person-same-nature-test', 'Another Person', '小叶', false, 'active'),
  ('growth-person-null-nature-test', 'No Nature Name', null, false, 'active');

select set_config(
  'test.growth_person_id',
  (select id::text from public.people where slug = 'growth-person-test'),
  true
);

select pg_temp.assert_true(
  (select count(*) from public.people where nature_name = '小叶') = 2
  and (select count(*) from public.people where nature_name is null) >= 1,
  'nature_name is nullable and not unique'
);

-- Test-only roles isolate read from manage capability.
insert into public.roles (slug, name, description, is_system)
values
  ('growth_test_reader', 'Growth Test Reader', 'Transaction-only test role', false),
  ('growth_test_manager', 'Growth Test Manager', 'Transaction-only test role', false);

insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
join public.permissions p on p.permission_key = 'impact.read'
where r.slug = 'growth_test_reader';

insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
join public.permissions p on p.permission_key in ('impact.read', 'impact.manage')
where r.slug = 'growth_test_manager';

insert into public.user_roles (user_id, role_id, assigned_by)
select '20000000-0000-0000-0000-000000000002', id, null
from public.roles where slug = 'growth_test_reader';

insert into public.user_roles (user_id, role_id, assigned_by)
select '20000000-0000-0000-0000-000000000003', id, null
from public.roles where slug = 'growth_test_manager';

-- An ordinary member cannot read or write the private timeline.
set local role authenticated;
select pg_temp.authenticate_as(
  '20000000-0000-0000-0000-000000000001',
  'growth-member@test.rgan'
);

select pg_temp.expect_error(
  format(
    'select count(*) from public.list_growth_records(%s)',
    current_setting('test.growth_person_id')
  ),
  'member cannot list private growth records'
);
select pg_temp.expect_error(
  format(
    $$select public.create_growth_record(%s, now(), 'Asia/Shanghai', null, 'Denied')$$,
    current_setting('test.growth_person_id')
  ),
  'member cannot create private growth records'
);
select pg_temp.expect_error(
  'select count(*) from private.growth_records',
  'authenticated users cannot directly query the private growth table'
);
select pg_temp.assert_true(
  not private.valid_growth_storage_path(
    format(
      '20000000-0000-0000-0000-000000000001/%s/hidden.webp',
      current_setting('test.growth_person_id')
    )
  ),
  'member cannot use the path guard to discover a private person ID'
);
select pg_temp.expect_error(
  $$update public.profiles
    set registered_at = registered_at + interval '1 day'
    where user_id = '20000000-0000-0000-0000-000000000001'$$,
  'registered_at cannot be changed by the profile owner'
);

-- A reader can use the list RPC but cannot mutate records.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '20000000-0000-0000-0000-000000000002',
  'growth-reader@test.rgan'
);

select pg_temp.assert_true(
  (
    select count(*)
    from public.list_growth_records(
      current_setting('test.growth_person_id')::bigint
    )
  ) = 0,
  'impact.read can list the private timeline'
);
select pg_temp.expect_error(
  format(
    $$select public.create_growth_record(%s, now(), 'Asia/Shanghai', null, 'Denied')$$,
    current_setting('test.growth_person_id')
  ),
  'impact.read cannot create a growth record'
);

-- A manager can create, update, archive, upload metadata, and attach photos.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '20000000-0000-0000-0000-000000000003',
  'growth-manager@test.rgan'
);

select pg_temp.expect_error(
  format(
    $$select public.create_growth_record(%s, now() + interval '1 day', 'Asia/Shanghai', null, 'Future')$$,
    current_setting('test.growth_person_id')
  ),
  'observed_at cannot be materially in the future'
);
select pg_temp.expect_error(
  format(
    $$select public.create_growth_record(%s, now(), 'Mars/Olympus', null, 'Bad timezone')$$,
    current_setting('test.growth_person_id')
  ),
  'observed_timezone must be a real IANA timezone'
);

select set_config(
  'test.growth_record_id',
  public.create_growth_record(
    current_setting('test.growth_person_id')::bigint,
    '2025-07-08 02:03:04+00',
    'Asia/Shanghai',
    '第一次观察',
    '长出了两片新叶。'
  )::text,
  true
);

select public.update_growth_record(
  current_setting('test.growth_record_id')::bigint,
  '2025-07-09 03:04:05+00',
  'Asia/Shanghai',
  '第二次观察',
  '新叶已经舒展开。'
);

select pg_temp.assert_true(
  public.has_permission('impact.manage'),
  'manager test identity has impact.manage'
);

select pg_temp.expect_error(
  format(
    $$insert into storage.objects (bucket_id, name, owner, owner_id, metadata)
      values (
        'private-impact',
        'wrong-user/%s/invalid.webp',
        '20000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000003',
        '{"mimetype":"image/webp","size":100}'
      )$$,
    current_setting('test.growth_person_id')
  ),
  'private-impact object path must start with auth.uid'
);

insert into storage.objects (bucket_id, name, owner, owner_id, metadata)
values
  (
    'private-impact',
    format(
      '20000000-0000-0000-0000-000000000003/%s/photo-one.webp',
      current_setting('test.growth_person_id')
    ),
    '20000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000003',
    '{"mimetype":"image/webp","size":100}'
  ),
  (
    'private-impact',
    format(
      '20000000-0000-0000-0000-000000000003/%s/photo-two.webp',
      current_setting('test.growth_person_id')
    ),
    '20000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000003',
    '{"mimetype":"image/webp","size":120}'
  ),
  (
    'private-impact',
    format(
      '20000000-0000-0000-0000-000000000003/%s/not-a-photo.mp4',
      current_setting('test.growth_person_id')
    ),
    '20000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000003',
    '{"mimetype":"video/mp4","size":200}'
  );

insert into public.media_assets (
  owner_user_id, storage_bucket, storage_path, media_type,
  mime_type, file_size, visibility, status
)
values (
  '20000000-0000-0000-0000-000000000001',
  'private-impact',
  format(
    '20000000-0000-0000-0000-000000000003/%s/photo-one.webp',
    current_setting('test.growth_person_id')
  ),
  'image', 'image/webp', 100, 'public', 'active'
);
select set_config(
  'test.growth_media_one_id',
  (
    select id::text
    from public.media_assets
    where storage_path = format(
      '20000000-0000-0000-0000-000000000003/%s/photo-one.webp',
      current_setting('test.growth_person_id')
    )
  ),
  true
);

insert into public.media_assets (
  storage_bucket, storage_path, media_type,
  mime_type, file_size, visibility, status
)
values (
  'private-impact',
  format(
    '20000000-0000-0000-0000-000000000003/%s/photo-two.webp',
    current_setting('test.growth_person_id')
  ),
  'image', 'image/webp', 120, 'private', 'active'
);
select set_config(
  'test.growth_media_two_id',
  (
    select id::text
    from public.media_assets
    where storage_path = format(
      '20000000-0000-0000-0000-000000000003/%s/photo-two.webp',
      current_setting('test.growth_person_id')
    )
  ),
  true
);

insert into public.media_assets (
  storage_bucket, storage_path, media_type,
  mime_type, file_size, visibility, status
)
values (
  'private-impact',
  format(
    '20000000-0000-0000-0000-000000000003/%s/not-a-photo.mp4',
    current_setting('test.growth_person_id')
  ),
  'video', 'video/mp4', 200, 'private', 'active'
);
select set_config(
  'test.growth_video_id',
  (
    select id::text
    from public.media_assets
    where storage_path = format(
      '20000000-0000-0000-0000-000000000003/%s/not-a-photo.mp4',
      current_setting('test.growth_person_id')
    )
  ),
  true
);

select pg_temp.assert_true(
  (
    select uploaded_by = '20000000-0000-0000-0000-000000000003'
      and owner_user_id is null
      and visibility = 'private'
    from public.media_assets
    where id = current_setting('test.growth_media_one_id')::bigint
  ),
  'private-impact media ownership and visibility are forced server-side'
);

select pg_temp.expect_error(
  format(
    'select public.attach_growth_media(%s, %s, 0, false, null)',
    current_setting('test.growth_record_id'),
    current_setting('test.growth_video_id')
  ),
  'only active images can be attached to growth records'
);

select public.attach_growth_media(
  current_setting('test.growth_record_id')::bigint,
  current_setting('test.growth_media_one_id')::bigint,
  10, true, '第一张照片'
);
select public.attach_growth_media(
  current_setting('test.growth_record_id')::bigint,
  current_setting('test.growth_media_two_id')::bigint,
  20, true, '第二张照片'
);

select pg_temp.assert_true(
  (
    select count(*)
    from public.list_growth_records(
      current_setting('test.growth_person_id')::bigint
    ) listed
    cross join lateral jsonb_array_elements(listed.media) item
    where (item ->> 'is_primary')::boolean
  ) = 1,
  'setting a new primary photo demotes the previous primary'
);
select set_config(
  'test.removed_growth_photo_path',
  (
    select storage_path
    from public.remove_growth_media(
      current_setting('test.growth_record_id')::bigint,
      current_setting('test.growth_media_one_id')::bigint
    )
  ),
  true
);
select pg_temp.assert_true(
  current_setting('test.removed_growth_photo_path') = format(
    '20000000-0000-0000-0000-000000000003/%s/photo-one.webp',
    current_setting('test.growth_person_id')
  )
  and (
    select jsonb_array_length(media)
    from public.list_growth_records(
      current_setting('test.growth_person_id')::bigint
    )
  ) = 1,
  'removing a photo detaches it and returns its private Storage path'
);
select pg_temp.assert_true(
  (
    select note
    from public.list_growth_records(
      current_setting('test.growth_person_id')::bigint
    )
  ) = '新叶已经舒展开。',
  'updated growth note is returned by the list RPC'
);

select public.archive_growth_record(
  current_setting('test.growth_record_id')::bigint
);
select pg_temp.assert_true(
  (
    select count(*)
    from public.list_growth_records(
      current_setting('test.growth_person_id')::bigint
    )
  ) = 0,
  'archived records are hidden by default'
);
select pg_temp.assert_true(
  (
    select count(*)
    from public.list_growth_records(
      current_setting('test.growth_person_id')::bigint,
      include_archived => true
    )
  ) = 1,
  'authorized users can explicitly include archived records'
);

reset role;
select pg_temp.assert_true(
  (
    select count(*)
    from private.audit_logs
    where entity_type in ('growth_record', 'growth_record_media')
      and actor_user_id = '20000000-0000-0000-0000-000000000003'
  ) >= 5,
  'growth record and photo changes create private audit entries'
);

rollback;
