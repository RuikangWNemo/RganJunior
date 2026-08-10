# 阿柑少年长期社群平台实施计划

日期：2026-08-07
依据：`docs/plans/2026-08-07-community-platform-design.md`

## 目标与顺序

在现有 Vite/React、Vercel Functions 和 hosted Supabase `rganjunior` 上连续完成：

1. Identity + Membership + Publishing + People。
2. Practice。
3. Messages + Moderation + Realtime。

数据库先于 UI 上线，每批迁移均先在线上事务内执行并回滚测试。禁止启动或配置本机 Supabase。

## 全局约束

- 保留现有官网路由、视觉语言和未提交用户改动。
- 扩展现有 `profiles`、`people`、RBAC、Field Notes、Storage 和 Audit，不建立平行用户/文章系统。
- `authenticated` 只表示登录；内部能力必须校验 active Membership 或具体 permission。
- 未成年人、监护人、申请内部备注和实名核验位于 private schema。
- 每个 exposed table 显式 GRANT、启用 RLS 并加入权限测试。
- 浏览器只使用 Supabase publishable key；secret key 仅允许存在于 Vercel 服务端环境。
- 所有用户可见文案中英双语；稳定错误码与数据库错误一一映射。
- 每阶段完成后重新生成 `src/lib/supabase/database.types.ts`。

## Phase 1A：身份、角色与成员资格数据库

### Migration 1：community_identity_foundation

创建文件：

- `supabase/migrations/<remote-version>_community_identity_foundation.sql`

变更：

1. 将 system role `member` 迁移为 `registered_user`。
2. 将 `contributor` 迁移为 `community_member`。
3. 新增 `facilitator`。
4. 扩展 permission keys：
   - `community.apply`
   - `memberships.read`
   - `memberships.review`
   - `memberships.review_sensitive`
   - `memberships.manage`
   - `profiles.read_members`
   - `messages.use`
   - `messages.moderate`
   - `practice.read`
   - `practice.join`
   - `practice.create`
   - `practice.host`
   - `moderation.manage`
   - `notifications.manage`
   - `field_notes.publish_own`
5. 更新 system role 默认权限映射。
6. 扩展 `profiles`：
   - `onboarding_completed_at`
   - `account_status`
7. 扩展 `people`：
   - `name_zh`
   - `name_en`
   - `profile_visibility`
   - `show_real_name`
8. 创建 `public.user_settings`。
9. 创建 `private.account_safety_profiles`，保存 `age_band`、未成年人状态与身份核验状态。
10. 更新 `private.handle_new_user()`：只创建最小 Profile、安全档案和 `registered_user` 角色；不信任 `raw_user_meta_data` 做授权判断。
11. 创建 onboarding RPC，在一个事务中保留 username、更新 Profile、创建/更新 linked Person、设置隐私并完成 onboarding。
12. 创建 community destination state RPC，返回 `signed_out` 以外的 onboarding/application/membership 状态。

索引与约束：

- username 继续使用 lower-case partial unique index。
- `people(user_id)` unique 保持账号到人物一对一。
- `account_status`、`age_band`、`profile_visibility` 使用 check constraints。
- 所有外键建立反向索引。

### Migration 2：community_membership_workflow

创建：

- `public.community_applications`
- `private.community_application_events`
- `public.community_memberships`
- membership/application 索引、唯一 active application 约束、更新时间触发器和审计触发器。

受控 RPC：

- `create_community_application`
- `submit_community_application`
- `get_my_community_application`
- `request_application_changes`
- `review_community_application`
- `withdraw_community_application`
- `list_membership_applications`
- `get_membership_application_detail`
- `suspend_community_membership`
- `restore_community_membership`

批准事务必须同时更新 Application、Membership、Role、Person visibility、Notification 和 Audit。

### Migration 3：guardian_consent

创建：

- `public.legal_documents`
- `private.guardian_consent_requests`
- `private.guardian_consents`
- `private.minor_identity_verifications`

功能：

- 三档年龄分流。
- under-14 consent 前 onboarding 数据最小化。
- 14–17 在 Membership 审批前要求确认。
- 版本化知情协议、内容摘要、拒绝与撤回。
- 一次性哈希链接、有效期、尝试次数和 OTP challenge 状态。
- OTP 只保存哈希；Audit 只保留手机号后四位。
- 实质性协议变更标记需要重新同意。
- 撤回同意自动暂停未成年 Membership 和内部权限。

公开/服务端接口：

- 公共 RPC 仅返回 consent request 的最小展示信息。
- OTP 发送与验证只通过 Vercel Function，数据库提供私有 challenge RPC。
- 服务端以 secret key 调用受控函数；不得直接向客户端返回 private rows。

## Phase 1B：Auth 与服务端接口

### Browser Auth 服务

修改：

- `src/services/auth/index.ts`

新增：

- email/password 注册与验证。
- `signInWithOtp({ shouldCreateUser: false })` Magic Link。
- `resetPasswordForEmail()`。
- recovery session 下 `updateUser({ password })`。
- 修改邮箱/密码前 `reauthenticate()`。
- Auth state subscription。

注册输入由 `displayName` 改为 `email + password + ageBand`。名字等资料进入 onboarding，under-14 consent 前不收集。

### Username Login

创建：

- `api/community/username-login.js`
- `api/_lib/supabase-secret.js`
- `src/services/community-auth/index.ts`

流程：

1. 接收 username/email + password。
2. 邮箱输入直接使用 password sign-in。
3. username 通过 secret-backed 私有查询解析 Auth email。
4. 使用 publishable Auth client执行 password sign-in。
5. 返回 session；所有失败使用同一错误。
6. 加入 IP + identifier 哈希限速，不记录明文密码。

### Guardian OTP Provider

创建：

- `api/community/guardian-consent-request.js`
- `api/community/guardian-consent-verify.js`
- `api/_lib/guardian-otp-provider.js`

Provider 使用适配器接口。生产发送必须配置受支持 SMS provider 凭证；未配置时返回 `GUARDIAN_OTP_NOT_CONFIGURED`，不得伪造成功。开发/测试使用注入的 fake provider，不写入线上真实验证码。

## Phase 1C：React 社群壳与入口

### 会话与路由守卫

创建：

- `src/contexts/AuthContext.tsx`
- `src/hooks/useCommunityDestination.ts`
- `src/components/community/CommunityRouteGuard.tsx`
- `src/components/community/CommunityLayout.tsx`
- `src/lib/communityRoutes.ts`

守卫层级：public auth、authenticated、onboarded、application、active member、permission、admin。

### 吉祥物与 Navbar

修改：

- `src/components/home/HeroMascotStage.tsx`
- `src/pages/Index.tsx`
- `src/components/Navbar.tsx`
- `src/components/Navbar.test.tsx`
- `src/index.css`

新增共享：

- `src/components/community/CommunityEntryBubble.tsx`

验收：

- 大吉祥物可点击、键盘操作、触摸操作。
- 气泡在 splash 后出现。
- Navbar Logo 按登录状态轮换短文案。
- 首页仍可通过“首页”菜单返回。
- reduced motion 无自动循环。

### Auth 页面

创建：

- `src/pages/community/CommunityLogin.tsx`
- `src/pages/community/CommunityRegister.tsx`
- `src/pages/community/CommunityRecovery.tsx`
- `src/pages/community/CommunityResetPassword.tsx`
- 对应测试文件。

### Onboarding / Application 页面

创建：

- `src/pages/community/CommunityOnboarding.tsx`
- `src/pages/community/CommunityApply.tsx`
- `src/pages/community/CommunityApplicationStatus.tsx`
- `src/pages/community/GuardianConsent.tsx`
- `src/services/community-profile/index.ts`
- `src/services/memberships/index.ts`
- `src/services/guardian-consent/index.ts`

## Phase 1D：People、Stories 与 Admin

### People

创建：

- `src/pages/community/CommunityPeople.tsx`
- `src/pages/community/CommunityPerson.tsx`
- `src/pages/community/CommunityMe.tsx`
- `src/pages/community/CommunitySettings.tsx`
- 扩展 `src/services/people/index.ts` 和 `src/services/profiles/index.ts`。

数据只通过安全 RPC 返回 public/member/self 三种投影，避免 `.select('*')` 暴露新敏感列。

### Stories

创建：

- `src/pages/community/CommunityStories.tsx`
- `src/pages/community/CommunityStoryEditor.tsx`
- `src/pages/community/CommunityMyStories.tsx`
- `src/components/community/story/*`
- 扩展 `src/services/field-notes/index.ts` 和 `src/services/media/index.ts`。

浏览器图片处理：

- 头像 512×512。
- 文章图最长边 2560px。
- 封面约 2000px。
- 自动纠正方向、压缩并输出 WebP/JPEG。
- 上传失败清理 Storage 对象和 metadata。

### Admin

创建：

- `src/components/admin/AdminLayout.tsx`
- `src/pages/admin/AdminOverview.tsx`
- `src/pages/admin/AdminUsers.tsx`
- `src/pages/admin/AdminApplications.tsx`
- `src/pages/admin/AdminApplicationDetail.tsx`
- `src/pages/admin/AdminStories.tsx`
- `src/pages/admin/AdminRoles.tsx`
- `src/pages/admin/AdminAudit.tsx`
- `src/services/admin/index.ts`

敏感资料按单独 permission 延迟加载。角色提权要求 reauthentication，并保留 before/after Audit。

## Phase 1E：数据库与前端验证

创建：

- `supabase/tests/database/003_community_identity_membership.sql`
- `supabase/tests/database/004_guardian_consent.sql`
- `supabase/tests/database/005_community_publishing_people.sql`

测试角色：Anonymous、Registered、Under14 Pending、14–17 Pending、Member、Facilitator、Editor、Admin、Super Admin。

必测：

- under-14 consent 前的数据最小化。
- guardian token expiry/replay/OTP attempts/revocation。
- application concurrency/idempotency。
- Membership 与 Role 一致。
- rejected account 保留。
- public/member/private profile projection。
- 普通 Member 文章审核流。
- admin 与敏感 reviewer 权限分离。
- Audit、最后 Super Admin、测试回滚。

前端验证：

- targeted tests。
- `npm run typecheck`。
- `npm run typecheck:app`，区分现有错误。
- `npm run lint`。
- `npm test`。
- `npm run build`。
- 桌面、390px 手机、键盘、reduced-motion 浏览器检查。

## Phase 2：Practice

### Migration

创建：

- `practice_spaces`
- `practice_sessions`
- `practice_participants`
- `practice_checkins`
- 状态约束、时间约束、容量约束、参与唯一约束、索引、RLS、Audit、RPC。

RPC：list/create/update/join/leave/start/finish/check-in。Facilitator 权限与 session ownership 双重校验。

### UI 与服务

创建：

- `src/services/practice/index.ts`
- `src/pages/community/CommunityPractice.tsx`
- `src/pages/community/PracticeSession.tsx`
- `src/pages/community/MyPractice.tsx`
- `src/pages/admin/AdminPractice.tsx`
- `src/components/community/practice/*`

共享计时以数据库时间为准。Realtime 仅同步状态和参与变化。

### Tests

- `supabase/tests/database/006_practice.sql`
- facilitator/member/admin 权限、容量、重复加入、时间、归档、通知与 Audit。

## Phase 3：Messages、治理与 Realtime

### Migration

创建：

- `conversations`
- `conversation_members`
- `messages`
- `message_receipts`
- `blocks`
- `reports`
- `moderation_cases`
- `moderation_actions`
- `account_restrictions`
- `notifications`
- `activity_events`

会话创建 RPC 校验双方 active Membership、allow_messages、Block 和 restriction。普通注册用户、待审用户和社群外成年人无权创建会话。

在 `realtime.messages` 上只创建 RLS policy，不修改 locked realtime schema。客户端使用 `private: true` channel；生产关闭 Realtime “Allow public access”。

### UI 与服务

创建：

- `src/services/messages/index.ts`
- `src/services/moderation/index.ts`
- `src/services/notifications/index.ts`
- `src/pages/community/CommunityMessages.tsx`
- `src/pages/community/Conversation.tsx`
- `src/pages/community/CommunityNotifications.tsx`
- `src/pages/admin/AdminReports.tsx`
- `src/pages/admin/AdminModerationCase.tsx`

第一批开放文本伙伴信箱、关闭私聊、Block、Report 和已读；随后启用 Realtime 新消息和 Presence。附件保持关闭，直到单独完成媒体安全设计。

### Tests

- `supabase/tests/database/007_messages_moderation.sql`
- 非成员、非会话成员、猜测 ID、关闭消息、Block、Report、Rate Limit、Restriction、Realtime topic authorization 和 Audit。

## 上线与回滚

每批：

1. 获取最新远端 migration 列表。
2. 创建 CLI migration 文件。
3. 在线事务 dry-run + rollback。
4. 运行新增与既有授权测试。
5. 使用 `apply_migration` 正式应用。
6. 将本地文件名对齐远端版本。
7. 运行 Security/Performance Advisors。
8. 重新生成类型并接入 service/UI。
9. 验证真实数据计数未被测试污染。

高风险能力通过 feature flag/route guard 分批开放。数据库迁移只做向后兼容添加与受控角色迁移；不删除历史数据。需要撤回功能时先关闭 UI 和权限，再通过新迁移修正，禁止对线上数据库做 destructive reset。

## 外部依赖与上线前必需配置

- Supabase Auth Site URL 和 redirect allowlist。
- 生产 SMTP；新 Free 项目若要自定义 Auth 邮件需自备 SMTP。
- SMS OTP provider 凭证与发送模板。
- Vercel secret Supabase key，仅服务端。
- Realtime private access 设置。
- 经法律顾问确认的青少年隐私、监护人知情协议和社区规则文本。
- 指定儿童个人信息保护与举报处理负责人。
