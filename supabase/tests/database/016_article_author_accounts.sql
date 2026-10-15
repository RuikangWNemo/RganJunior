begin;

create function pg_temp.assert_true(condition boolean, label text) returns void language plpgsql as $$
begin if not coalesce(condition, false) then raise exception 'TEST_FAILED: %', label; end if; end; $$;
create function pg_temp.expect_error(statement text, label text) returns void language plpgsql as $$
begin begin execute statement; exception when others then return; end;
raise exception 'TEST_FAILED: expected error: %', label; end; $$;
create function pg_temp.authenticate(account uuid) returns void language plpgsql as $$
begin
perform set_config('request.jwt.claim.sub', account::text, true);
perform set_config('request.jwt.claim.role', 'authenticated', true);
perform set_config('request.jwt.claims', jsonb_build_object('sub',account,'role','authenticated')::text,true);
end; $$;
create function pg_temp.article(slug text, requires_account boolean default false) returns jsonb language sql as $$
select jsonb_build_object('slug',slug,'title','Authorship test '||slug,'authorSlug','test-orange','authorName','待注册橙子',
'requiresAccount',requires_account,'excerpt','A real author','content','Original text',
'contentHtml','<p>Original text</p>','contentJson','[{"type":"paragraph","content":"Original text"}]'::jsonb); $$;

insert into auth.users(id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values
('e6000000-0000-0000-0000-000000000001','authenticated','authenticated','author-admin@test.rgan','',now(),'{"provider":"email"}','{"display_name":"Operator","age_band":"adult_18_plus"}',now(),now()),
('e6000000-0000-0000-0000-000000000002','authenticated','authenticated','article-author@test.rgan','',now(),'{"provider":"email"}','{"display_name":"Nate Test","age_band":"adult_18_plus"}',now(),now()),
('e6000000-0000-0000-0000-000000000003','authenticated','authenticated','article-future@test.rgan','',now(),'{"provider":"email"}','{"display_name":"待注册橙子","age_band":"adult_18_plus"}',now(),now()),
('e6000000-0000-0000-0000-000000000004','authenticated','authenticated','article-outsider@test.rgan','',now(),'{"provider":"email"}','{"display_name":"待注册橙子","age_band":"adult_18_plus"}',now(),now()),
('e6000000-0000-0000-0000-000000000005','authenticated','authenticated','author-admin-two@test.rgan','',now(),'{"provider":"email"}','{"display_name":"Operator Two","age_band":"adult_18_plus"}',now(),now());
-- Onboarding creates the person record after auth registration in this project.
insert into public.people(user_id,slug,display_name,is_public)
select u.id,'test-article-person-'||right(u.id::text,12),u.raw_user_meta_data->>'display_name',true
from auth.users u where u.id in (
'e6000000-0000-0000-0000-000000000001','e6000000-0000-0000-0000-000000000002',
'e6000000-0000-0000-0000-000000000003','e6000000-0000-0000-0000-000000000004','e6000000-0000-0000-0000-000000000005');
insert into public.user_roles(user_id,role_id)
select u.id,r.id from auth.users u cross join public.roles r
where u.id in ('e6000000-0000-0000-0000-000000000001','e6000000-0000-0000-0000-000000000005') and r.slug='admin';
insert into public.user_roles(user_id,role_id)
select u.id,r.id from auth.users u cross join public.roles r
where u.id in ('e6000000-0000-0000-0000-000000000002','e6000000-0000-0000-0000-000000000003','e6000000-0000-0000-0000-000000000004') and r.slug='community_member';
insert into public.community_memberships(user_id,status,approved_by,approved_at,member_since)
select u.id,'active','e6000000-0000-0000-0000-000000000001',now(),current_date from auth.users u
where u.id in ('e6000000-0000-0000-0000-000000000002','e6000000-0000-0000-0000-000000000003','e6000000-0000-0000-0000-000000000004')
on conflict(user_id) do update set status='active';
select set_config('test.author_person_id',(select id::text from public.people where user_id='e6000000-0000-0000-0000-000000000002'),true);
select set_config('test.future_person_id',(select id::text from public.people where user_id='e6000000-0000-0000-0000-000000000003'),true);

set local role authenticated;
select pg_temp.authenticate('e6000000-0000-0000-0000-000000000001');
select pg_temp.expect_error($$select public.import_author_article(pg_temp.article('test-nate-no-account',true))$$,'Nate import requires selecting an existing account');
select set_config('test.nate_note_id',public.import_author_article(pg_temp.article('test-nate-linked',true),current_setting('test.author_person_id')::bigint)::text,true);
select set_config('test.pending_note_id',public.import_author_article(pg_temp.article('test-orange-letter'))::text,true);
select public.import_author_article(pg_temp.article('test-orange-second'));
select set_config('test.pending_person_id',(select person_id::text from public.field_note_authors where field_note_id=current_setting('test.pending_note_id')::bigint),true);
select pg_temp.assert_true((select count(*)=1 from public.field_note_authors where field_note_id=current_setting('test.nate_note_id')::bigint),'operator is not attributed as the real author');
select pg_temp.assert_true((select created_by='e6000000-0000-0000-0000-000000000001' from public.field_notes where id=current_setting('test.nate_note_id')::bigint),'operator remains recorded for provenance');
update public.field_notes set title='Edited draft' where id=current_setting('test.nate_note_id')::bigint;
select pg_temp.assert_true(public.import_author_article(pg_temp.article('test-nate-linked',true),current_setting('test.author_person_id')::bigint)=current_setting('test.nate_note_id')::bigint,'import retry returns same record');
select pg_temp.assert_true((select title='Edited draft' from public.field_notes where id=current_setting('test.nate_note_id')::bigint),'retry preserves editorial changes');

reset role;
set local role service_role;
select pg_temp.assert_true((select can_read and not coalesce(can_write,false) and not is_owner
  from public.authorize_field_note_collaboration_server('e6000000-0000-0000-0000-000000000002',current_setting('test.nate_note_id')::bigint)),
  'editor API recognizes attributed author read access without granting ownership');
select pg_temp.assert_true((select not can_read from public.authorize_field_note_collaboration_server(
  'e6000000-0000-0000-0000-000000000004',current_setting('test.nate_note_id')::bigint)),
  'editor API rejects unrelated account');
set local role authenticated;

select pg_temp.authenticate('e6000000-0000-0000-0000-000000000002');
select pg_temp.assert_true((select count(*)=1 from public.list_my_field_note_ids()),'author library includes operator-created draft');
select pg_temp.assert_true((select count(*)=1 from public.field_notes where id=current_setting('test.nate_note_id')::bigint),'author can read their private draft');
select pg_temp.expect_error($$select public.list_article_authors_admin()$$,'member cannot inspect admin author/account directory');
select pg_temp.expect_error($$select public.import_author_article(pg_temp.article('test-member-import'))$$,'member cannot import as an arbitrary author');
select pg_temp.expect_error($$select public.link_pending_article_author(current_setting('test.pending_person_id')::bigint,current_setting('test.author_person_id')::bigint)$$,'member cannot claim pending authors');
select pg_temp.expect_error($$update public.field_notes set title='Should not change' where id=current_setting('test.nate_note_id')::bigint$$,'attributed author cannot edit an operator-owned draft');
select pg_temp.assert_true((select title='Edited draft' from public.field_notes where id=current_setting('test.nate_note_id')::bigint),'attribution does not grant write access');
select pg_temp.authenticate('e6000000-0000-0000-0000-000000000003');
select pg_temp.assert_true((select count(*)=0 from public.list_my_field_note_ids()),'registration with same name does not claim pending stories');
select pg_temp.authenticate('e6000000-0000-0000-0000-000000000004');
select pg_temp.assert_true((select count(*)=0 from public.field_notes where id=current_setting('test.nate_note_id')::bigint),'unrelated member cannot read private author story');

select pg_temp.authenticate('e6000000-0000-0000-0000-000000000001');
select pg_temp.assert_true(public.link_pending_article_author(current_setting('test.pending_person_id')::bigint,current_setting('test.future_person_id')::bigint)=2,'admin links all existing articles for a verified registered author');
select pg_temp.expect_error($$select public.link_pending_article_author(current_setting('test.future_person_id')::bigint,current_setting('test.author_person_id')::bigint)$$,'existing registered author cannot be silently replaced through pending link');
select pg_temp.authenticate('e6000000-0000-0000-0000-000000000003');
select pg_temp.assert_true((select count(*)=2 from public.list_my_field_note_ids()),'future author sees both existing drafts after account association');
select pg_temp.authenticate('e6000000-0000-0000-0000-000000000004');
select pg_temp.assert_true((select count(*)=0 from public.list_my_field_note_ids()),'same-name other account still has no attributed articles');

select pg_temp.authenticate('e6000000-0000-0000-0000-000000000001');
select set_config('test.public_pending_note_id',public.import_author_article(pg_temp.article('test-orange-public-bylines'))::text,true);
select pg_temp.authenticate('e6000000-0000-0000-0000-000000000005');
update public.field_notes set status='submitted' where id=current_setting('test.nate_note_id')::bigint;
update public.field_notes set status='in_review' where id=current_setting('test.nate_note_id')::bigint;
update public.field_notes set status='approved' where id=current_setting('test.nate_note_id')::bigint;
update public.field_notes set status='published',visibility='public' where id=current_setting('test.nate_note_id')::bigint;
select pg_temp.assert_true((select status='published' and visibility='public' from public.field_notes where id=current_setting('test.nate_note_id')::bigint),'another administrator can submit and publish operator-created drafts');
update public.field_notes set status='submitted' where id=current_setting('test.public_pending_note_id')::bigint;
update public.field_notes set status='in_review' where id=current_setting('test.public_pending_note_id')::bigint;
update public.field_notes set status='approved' where id=current_setting('test.public_pending_note_id')::bigint;
update public.field_notes set status='published',visibility='public' where id=current_setting('test.public_pending_note_id')::bigint;
reset role;
select pg_temp.assert_true((select count(*)>=5 from private.audit_logs where entity_type='field_note_author'),'authorship import and association are audited');
set local role anon;
select set_config('request.jwt.claim.sub','',true);
select pg_temp.assert_true((select count(*)=2 from public.field_notes where slug like 'test-%'),'public sees published story only');
select pg_temp.assert_true((select count(*)=1 from public.list_published_field_note_authors(array[current_setting('test.public_pending_note_id')::bigint]) where display_name='待注册橙子'),'anonymous reader sees the byline of a published unregistered author');
select pg_temp.assert_true((select count(*)=0 from public.people where id=current_setting('test.pending_person_id')::bigint),'public byline does not expose the private author profile');
select pg_temp.assert_true((select count(*)=0 from public.list_published_field_note_authors(array[current_setting('test.pending_note_id')::bigint])),'private draft bylines remain hidden');
select pg_temp.expect_error($$select public.list_my_field_note_ids()$$,'anonymous caller cannot read personal article IDs');
select pg_temp.expect_error($$select public.import_author_article(pg_temp.article('test-anon-import'))$$,'anonymous caller cannot import');
rollback;
