-- System roles are fixed; custom roles may be created later through controlled RPCs.
insert into public.roles (slug, name, description, is_system, is_active, created_by)
values
  ('registered_user', 'Registered User', 'Account holder who may complete a profile and apply to the community', true, true, null),
  ('community_member', 'Community Member', 'Approved Rgan Junior community member', true, true, null),
  ('facilitator', 'Facilitator', 'Community member who may create and host practice sessions', true, true, null),
  ('editor', 'Editor', 'Reviews and approves Field Notes', true, true, null),
  ('admin', 'Admin', 'Operates users, content, roles, and subscriptions', true, true, null),
  ('super_admin', 'Super Admin', 'Highest system authority with all permissions', true, true, null)
on conflict do nothing;

insert into public.permissions (permission_key, description, is_sensitive)
values
  ('users.read', 'Read registered user profiles', false),
  ('users.manage', 'Manage registered users and profiles', true),
  ('people.read', 'Read people records', false),
  ('people.manage', 'Manage people records', false),
  ('people.read_private', 'Read private person fields', true),
  ('identity_labels.manage', 'Manage identity labels', false),
  ('identity_assignments.manage', 'Assign identity labels to people', false),
  ('roles.read', 'Read roles and permissions', false),
  ('roles.manage', 'Create roles and configure role permissions', true),
  ('role_assignments.manage', 'Assign roles to user accounts', true),
  ('field_notes.create', 'Create Field Notes', false),
  ('field_notes.edit_own', 'Edit owned Field Notes', false),
  ('field_notes.edit_any', 'Edit any non-archived Field Note', false),
  ('field_notes.submit', 'Submit owned Field Notes for review', false),
  ('field_notes.review', 'Review Field Notes and request changes', false),
  ('field_notes.approve', 'Approve reviewed Field Notes', false),
  ('field_notes.publish', 'Publish approved Field Notes', false),
  ('field_notes.archive', 'Archive Field Notes', false),
  ('topics.manage', 'Manage Field Note topics', false),
  ('media.upload', 'Upload media', false),
  ('media.manage_own', 'Manage owned media', false),
  ('media.manage_any', 'Manage all media and public media', false),
  ('subscriptions.manage', 'Manage subscribers and preferences', false),
  ('impact.read', 'Read private Impact records and media', false),
  ('impact.manage', 'Manage Impact records and private media', false),
  ('audit.read', 'Read append-only audit logs', true),
  ('community.apply', 'Create and maintain the caller community application', false),
  ('memberships.read', 'Read active community member directory data', false),
  ('memberships.review', 'Review community membership applications', false),
  ('memberships.review_sensitive', 'Read minor, guardian, and identity-review data', true),
  ('memberships.manage', 'Suspend and restore community memberships', true),
  ('profiles.read_members', 'Read member-visible profile projections', false),
  ('messages.use', 'Use member-to-member messaging', false),
  ('messages.moderate', 'Moderate messages, blocks, and message reports', true),
  ('practice.read', 'Read member practice spaces and sessions', false),
  ('practice.join', 'Join and check in to practice sessions', false),
  ('practice.create', 'Create practice sessions', false),
  ('practice.host', 'Host and control practice sessions', false),
  ('moderation.manage', 'Manage community reports and restrictions', true),
  ('notifications.manage', 'Manage community notifications', false),
  ('field_notes.publish_own', 'Publish approved owned Field Notes', false)
on conflict (permission_key) do update
set description = excluded.description,
    is_sensitive = excluded.is_sensitive,
    updated_at = statement_timestamp();

-- Registered-user baseline: profile media and community application.
insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
join public.permissions p on p.permission_key in (
  'community.apply', 'media.upload', 'media.manage_own'
)
where r.slug = 'registered_user'
on conflict do nothing;

-- Approved community members receive publishing, People, Practice, and messaging.
insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
join public.permissions p on p.permission_key in (
  'community.apply',
  'memberships.read', 'profiles.read_members',
  'media.upload', 'media.manage_own',
  'field_notes.create', 'field_notes.edit_own', 'field_notes.submit',
  'messages.use',
  'practice.read', 'practice.join'
)
where r.slug = 'community_member'
on conflict do nothing;

-- Facilitators add scheduling and hosting to the member baseline.
insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
join public.permissions p on p.permission_key in (
  'community.apply',
  'memberships.read', 'profiles.read_members',
  'media.upload', 'media.manage_own',
  'field_notes.create', 'field_notes.edit_own', 'field_notes.submit',
  'messages.use',
  'practice.read', 'practice.join', 'practice.create', 'practice.host'
)
where r.slug = 'facilitator'
on conflict do nothing;

-- Editor can manage the review queue but cannot publish.
insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
join public.permissions p on p.permission_key in (
  'people.read',
  'community.apply', 'memberships.read', 'profiles.read_members',
  'media.upload', 'media.manage_own', 'media.manage_any',
  'field_notes.create', 'field_notes.edit_own', 'field_notes.edit_any',
  'field_notes.submit', 'field_notes.review', 'field_notes.approve',
  'topics.manage', 'messages.use', 'practice.read', 'practice.join'
)
where r.slug = 'editor'
on conflict do nothing;

-- Admin receives all currently defined permissions. Database guards still reserve
-- super_admin assignment, system role changes, and sensitive permission changes.
insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
cross join public.permissions p
where r.slug = 'admin'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
cross join public.permissions p
where r.slug = 'super_admin'
on conflict do nothing;

insert into public.identity_labels (
  slug, name_zh, name_en, description, sort_order, is_public, is_active, created_by
)
values
  ('founder', '创始人', 'Founder', '阿柑少年的创始或发起成员', 10, true, true, null),
  ('participant', '营员', 'Participant', '参与阿柑少年项目的青少年', 20, true, true, null),
  ('parent', '家长', 'Parent', '阿柑少年参与者的家长', 30, true, true, null),
  ('partner', '阿柑少年伙伴', 'Partner', '长期参与和支持项目的伙伴', 40, true, true, null),
  ('collaborator', '合作者', 'Collaborator', '共同开展项目的合作者', 50, true, true, null),
  ('mentor', '导师', 'Mentor', '提供专业陪伴与指导的导师', 60, true, true, null),
  ('volunteer', '志愿者', 'Volunteer', '参与志愿服务的人物', 70, true, true, null)
on conflict do nothing;

insert into public.topics (
  slug, name_zh, name_en, description, sort_order, is_active, created_by
)
values
  ('reflection', '生活随笔与反思', 'Reflection', '生活观察、随笔与个人反思', 10, true, null),
  ('camp-review', '共创营复盘与启发', 'Camp Review', '共创营过程、复盘与启发', 20, true, null),
  ('research', '研究内容与实验设计', 'Research', '研究内容、方法与实验设计', 30, true, null),
  ('ecology', '生态与 CSA', 'Ecology & CSA', '生态实践、农业与社区支持农业', 40, true, null),
  ('social-science', '社会科学', 'Social Science', '社会科学相关观察与研究', 50, true, null)
on conflict do nothing;
