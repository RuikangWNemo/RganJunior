# 阿柑少年长期社群平台设计

日期：2026-08-07

## 产品定义

阿柑少年网页平台不是在官网外附加几个会员功能，而是一套长期的“内容 + 身份 + 社区 + 共练”数字社区。

平台只有两个基础层级：

```text
普通注册用户
→ 认识阿柑少年、建立账号、完善资料、阅读公开内容、申请加入

正式社群成员
→ 创作、认识伙伴、参加共练、使用消息和其他内部功能
```

申请未通过不会删除账号。用户继续作为普通注册用户使用公开功能，并可在允许时重新申请。

长期核心入口是 People / Stories / Practice，即“人 · 故事 · 共练”。

## 实施原则

采用完整架构、分阶段连续落地：

1. Identity + Membership + Publishing + People。
2. Practice。
3. Messages + Moderation + Realtime。

所有阶段共用同一套 Supabase Auth、Profile、Person、RBAC、Storage、Audit 和通知体系，不建立重复用户或内容系统。所有数据库变更只应用到托管项目 `rganjunior`，不启动或配置本机 Supabase。

## 路由与入口

公共官网保留：首页、关于、项目、故事、加入我们。新增顶级菜单“进入社群”。

```text
/community/login          登录
/community/register       注册
/community/recovery       找回账号
/community/onboarding     完善资料
/community/apply          申请加入
/community/application    申请进度

/community                社群首页
/community/stories        文章
/community/people         伙伴
/community/practice       共练
/community/messages       消息
/community/me             我的主页
/community/settings       账号与隐私设置

/admin                    管理后台
```

统一的 community destination resolver 根据状态跳转：

- 未登录：登录页。
- 已注册但 onboarding 未完成：完善资料。
- 已完成资料但未申请：申请页。
- 申请处理中：申请进度。
- 正式成员：社群首页。

管理员从社群内进入后台，不把 `/admin` 作为普通用户的默认落点。

## 吉祥物社群入口

首页大吉祥物完成开场后出现“点我进入阿柑少年社群吧！”气泡。Hover、键盘聚焦或手机触碰时，吉祥物轻微靠近、光环展开、气泡增强；点击后使用统一 destination resolver。

页面下滑后，顶部阿柑少年 Logo 偶尔显示短气泡。未登录文案引导登录，已登录文案可显示“回来看看伙伴们吧”或“今晚有人在共练”。气泡不得持续闪烁、遮挡导航或抢夺焦点。

顶部 Logo 点击进入社群；导航中的“首页”继续提供返回官网首页的标准入口。`prefers-reduced-motion` 下禁用自动循环和漂浮，只保留静态提示、焦点样式与点击能力。

## 身份、角色与权限

Auth、人物身份和授权角色继续分离：

- `auth.users`：登录账号。
- `profiles`：账号设置、username、注册时间和 onboarding 状态。
- `people`：可展示的人物档案。
- `identity_labels`：家长、营员、导师、伙伴等关系身份。
- `roles` / `permissions`：数据库能力。

现有系统角色进行语义迁移：

```text
member       → registered_user
contributor  → community_member
新增         → facilitator
保留         → editor / admin / super_admin
```

角色权限组合：

- `registered_user`：维护本人资料、头像、隐私设置、提交入群申请。
- `community_member`：注册用户能力 + 写文章、伙伴、共练、消息。
- `facilitator`：成员能力 + 创建和主持共练。
- `editor`：管理和发布全部文章。
- `admin`：用户、申请、内容、治理和普通角色管理。
- `super_admin`：敏感权限和系统管理。

角色只是权限组合，公开身份标签不产生后台权限。

## 资料模型

### Profiles

扩展 `public.profiles`：

- `username`
- `registered_at`
- `onboarding_completed_at`
- `preferred_language`
- `timezone`
- 账号级状态和必要设置

### People

扩展 `public.people`：

- `name_zh`
- `name_en`
- `display_name`
- `nature_name`
- `avatar_media_id`
- `bio`
- `city` / `region` / `country`
- `profile_visibility`: `private` / `members` / `public`
- `show_real_name`

Onboarding 在同一事务中保留唯一 username、更新 Profile、创建或更新 linked Person、设置隐私偏好并标记完成。

普通注册用户可以预览和维护自己的主页，但默认不进入伙伴目录。只有正式成员且可见性允许的档案进入 People。

### User Settings

建立 `public.user_settings`：

- `allow_messages`
- `profile_visibility`
- `show_real_name`
- 通知偏好
- 可选无障碍偏好

## 年龄分流与未成年人资料

注册第一步只问年龄范围：

```text
under_14
age_14_17
adult_18_plus
```

年龄段和未成年人安全资料位于未暴露的 private schema，不进入公开主页。

### 已满 18 岁

```text
注册 → 完善资料 → 申请 → 管理员审核 → 正式成员
```

### 14–17 岁

```text
注册 → 完善资料 → 申请 → 监护人知情确认 → 管理员审核 → 正式成员
```

监护人确认是阿柑少年的内部安全政策，并作为消息、发布和共练的成员准入条件。

### 未满 14 岁

```text
基础账号 → 年龄分流 → 最小必要监护人资料 → 监护人确认
→ 才开放完整资料 → 申请 → 管理员审核 → 正式成员
```

取得同意前仅保存 Auth 账号、年龄段、监护人姓名/关系/手机号、可选邮箱、同意请求和必要安全日志。username、姓名、头像、自然名、简介、地区、公开主页及社群功能全部锁定。

## 监护人知情协议

建立版本化法律文档和不可变同意证据：

- `legal_documents`
- `private.guardian_consent_requests`
- `private.guardian_consents`
- `private.minor_identity_verifications`

知情协议说明：

- 收集、存储和使用资料的目的、方法与范围；
- 个人主页、文章图片、伙伴目录、共练和成员消息；
- 存储地点、期限和删除方式；
- 安全措施；
- 拒绝或撤回同意的影响；
- 查询、更正、删除、投诉和举报渠道。

监护人确认页要求：

1. 声明本人是父母或其他监护人。
2. 确认已阅读青少年隐私与社区说明。
3. 明确同意加入阿柑少年社群。
4. 通过一次手机验证码。

系统保存协议版本、内容摘要、确认时间、验证方式、手机号后四位和验证结果。令牌只保存哈希，单次使用、有限有效期并限制尝试次数。协议发生实质变化时要求重新确认；撤回同意后立即暂停未成年人的成员、发布和消息能力。

手机 OTP 只证明对手机号的控制，不单独证明监护关系或真实身份。第一阶段由管理员完成必要人工核验，只保存核验状态、方式、时间和审核人，不默认保存完整证件号码。规模扩大后再接合规实名服务。正式协议文本上线前需要法律顾问审阅。

## 入群申请与正式成员资格

建立：

- `community_applications`
- `community_application_events`
- `community_memberships`

内部状态：

```text
draft
pending_guardian
submitted
under_review
more_info_requested
approved
rejected
withdrawn
```

用户端简化显示为尚未申请、等待监护人、等待审核、需要补充、已成为成员、本次未通过。

批准 RPC 在单一事务内锁定申请、校验资料和同意、创建 Membership、授予 `community_member`、激活主页、写入通知和审计。重复审批幂等；并发审批只有一个成功。拒绝不删除账号或资料，允许将来重新申请。

Membership 独立记录批准人、申请来源、加入时间、状态、暂停或退出时间。Role 提供技术权限，Membership 保留业务事实，两者由受控事务保持一致。

## 管理后台

```text
/admin
├── Overview
├── People / Users / Memberships
├── Applications / Guardian Consent
├── Stories / Drafts / Reports
├── Practice / Hosts / Attendance
├── Messages / Reports / Blocks
├── Roles / Permissions
└── Audit / Settings
```

管理员可以查看用户、处理申请、要求补充、批准或拒绝、暂停/恢复成员资格、设置身份标签、管理普通角色权限、处理文章与举报。

监护人联系方式、年龄资料和核验信息只对具有敏感审核权限的管理员开放。提权、敏感资料访问、审核和治理操作全部审计。最后一位 Super Admin 继续受到数据库保护。

## Stories

复用现有 Field Notes 数据模型和工作流，不建立重复 articles 系统：

```text
draft → submitted → in_review → changes_requested
      → approved → published → archived
```

正式成员创建草稿、编辑本人文章、上传压缩图片、设置封面和标签、提交审核。默认成员不能直接公开发布；可信作者可获得 `field_notes.publish_own`。Editor 管理和发布全部文章，Admin 可以归档、下架与处理举报。

图片在浏览器预处理方向、尺寸和质量后上传。头像、文章图和封面使用不同限制；Storage 保存压缩后文件，数据库保留媒体元数据和关联。

## People

伙伴目录只列出 active Membership 且可见性允许的成员。公开页面只返回允许公开的字段，成员视图可以增加身份标签、参与项目和共练记录。

未成年人不显示精确年龄、学校、联系方式或监护人资料。用户名路由为 `/community/people/:username`。拉黑后双方不再出现在互动建议中。

## Practice

建立：

- `practice_spaces`
- `practice_sessions`
- `practice_participants`
- `practice_checkins`

正式成员查看、加入、退出、查看参与伙伴和完成 check-in。Facilitator 创建、排期、主持和结束共练。

共享计时以数据库 `starts_at` / `ends_at` 为准，客户端计算倒计时；Realtime 只同步开始、暂停、结束和参与状态，不每秒广播计时。

## Messages

建立：

- `conversations`
- `conversation_members`
- `messages`
- `message_receipts`
- `blocks`

所有审核通过、状态正常的正式社群成员均可私聊，包括完成监护人同意和成员审核的未成年人。

普通注册用户、待审核/拒绝用户和社群外成年人不能查找成员、创建会话、发送消息或订阅私有频道。数据库在创建会话时校验双方 Membership、消息开关、拉黑关系和账号限制。

成员可以关闭新私聊、拉黑和举报。第一版伙伴信箱不支持文件/图片附件；第二版增加 Realtime 私有频道、已读和在线状态。Realtime 频道访问必须映射到 `conversation_members`，不能仅检查 `authenticated`。

## 社区治理、通知与活动

建立：

- `reports`
- `moderation_cases`
- `moderation_actions`
- `account_restrictions`
- `notifications`
- `activity_events`

管理员可以警告、隐藏内容、限制消息、暂停发布、暂停 Membership 或封禁账号。处置包含理由、执行人、期限和审计记录。

活动足迹只展示允许公开的加入、文章和共练事件。举报、私聊、审核、监护人和安全信息永不进入公开活动流。

## 安全边界

- 所有 exposed tables 显式 GRANT 并启用 RLS。
- `authenticated` 不等于 Membership；所有内部能力同时校验 active Membership 或具体 Permission。
- 敏感表位于 private schema，通过受控 RPC 访问。
- 公开 RPC 使用 `SECURITY INVOKER`；确需绕过 RLS 的实现位于 private schema，固定空 `search_path`，检查 `auth.uid()` 和 permission，并撤销默认 PUBLIC 执行权。
- 用户名登录由 Vercel 受信任端点私下解析 username → Auth email，浏览器不能查询他人邮箱。失败统一返回通用认证错误，并进行频率限制。
- 监护人令牌、验证码、登录、申请、会话创建和消息发送都需限速。
- Storage 路径包含 auth UID，并分别校验头像、文章、共练和私有媒体用途。
- 外部成年人即使猜中用户 ID 或会话 ID，也被 RLS 拒绝。

## 稳定错误码

```text
PROFILE_INCOMPLETE
GUARDIAN_CONSENT_REQUIRED
GUARDIAN_CONSENT_EXPIRED
APPLICATION_ALREADY_PENDING
APPLICATION_STATE_CONFLICT
MEMBERSHIP_REQUIRED
MEMBERSHIP_SUSPENDED
MESSAGES_DISABLED
USER_BLOCKED
MESSAGE_RATE_LIMITED
PERMISSION_DENIED
```

错误不得泄露邮箱、手机号、账号是否存在、监护人资料或审核内部备注。

## 验证策略

数据库线上事务测试覆盖：

- Anonymous、Registered、Minor Pending Consent、Member、Facilitator、Editor、Admin、Super Admin 权限矩阵。
- 未满 14 岁在同意前不能完善完整资料或使用社区功能。
- 14–17 岁在确认前不能获批。
- 监护人令牌单次使用、过期、重放和错误次数限制。
- 同一申请并发审批、重复审批和事务回滚。
- Membership 与 Role 一致性。
- 社群外成年人不能创建会话或订阅 Realtime。
- 关闭私聊、拉黑、举报和消息限速。
- 非会话成员不能读消息。
- 私有主页不会进入伙伴目录。
- 提权、审批和治理全部产生 Audit Log。
- 最后一位 Super Admin 不能被移除。

前端测试覆盖路由守卫、destination resolver、吉祥物鼠标/键盘/触摸交互、reduced motion、三档年龄流程、申请状态、后台决策、文章工作流、Practice timer 和消息权限提示。

每个迁移先在 hosted `rganjunior` 事务中试跑并回滚，再正式应用。每阶段完成后重新生成类型，运行 Supabase Security/Performance Advisors、后端/API 类型检查、lint、测试、构建和浏览器验收，并确认测试数据全部回滚。

## 参考依据

- Supabase Auth password login: https://supabase.com/docs/reference/javascript/auth-signinwithpassword
- Supabase Magic Link: https://supabase.com/docs/guides/auth/auth-email-passwordless
- Supabase Realtime Authorization: https://supabase.com/docs/guides/realtime/authorization
- 《中华人民共和国个人信息保护法》：https://www.npc.gov.cn/WZWSREL25wYy9jMi9jMzA4MzQvMjAyMTA4L3QyMDIxMDgyMF8zMTMwODguaHRtbD9yZWY9aW1i
- 《儿童个人信息网络保护规定》：https://www.cac.gov.cn/2019-08/23/c_1124913903.htm
- 《未成年人网络保护条例》：https://www.moe.gov.cn/jyb_xxgk/moe_1777/moe_1778/202310/t20231025_1087333.html
