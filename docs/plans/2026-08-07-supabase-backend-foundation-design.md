# 阿柑少年 Supabase 后端基础设计

日期：2026-08-07

## 背景与目标

当前官网是部署于 Vercel 的 Vite + React SPA，并通过 Vercel Functions 处理少量表单提交。项目尚未接入认证、数据库或 Supabase。

本次建设保留现有 Vite 架构，以最小改动引入 Supabase Auth、PostgreSQL、Storage、迁移、类型和测试，逐步形成用户系统、人物库、身份标签、RBAC、Field Notes、媒体和订阅后端。现有页面与 Google Form 接口保持不变。

## 总体架构

采用分阶段混合架构：

- 浏览器使用 `@supabase/supabase-js` 处理登录、公开读取和用户自己的数据，只使用 publishable key。
- PostgreSQL RLS、约束、触发器和权限函数是最终安全边界。
- 管理和其他高风险操作通过 Vercel Functions 与事务型 RPC 完成。
- secret/service key 仅允许出现在可信服务器环境，不进入 Vite 客户端 bundle。
- 数据库结构全部由 `supabase/migrations/` 管理，初始化数据由 `supabase/seed.sql` 管理。
- 本地 reset、seed、安全测试和 advisors 通过后，才把迁移应用到云端项目。

由于 2026 年 Supabase 新项目默认不再自动向 Data API 暴露新表，迁移将显式授予 `anon`、`authenticated` 所需的最小权限，并为所有暴露表启用 RLS。

## 数据模型

V1 建立以下 18 张核心表：

### 账号与人物

- `profiles`：注册账号的站内资料，以 `auth.users.id` 为主键。
- `people`：现实人物，可不关联账号；`user_id` 可空且唯一。

### 身份标签

- `identity_labels`：管理员维护的动态人物身份。
- `person_identity_labels`：人物与身份的多对多关系，支持主身份、有效期和可见性。

### RBAC

- `roles`：系统角色和自定义角色。
- `permissions`：代码定义的固定权限键。
- `role_permissions`：角色包含的权限。
- `user_roles`：账号拥有的角色，支持过期时间。

### Field Notes

- `topics`：动态、可分层的内容主题。
- `field_notes`：田野笔记与发布工作流。
- `field_note_authors`：文章与人物的多作者关系。
- `field_note_topics`：文章与主题的多对多关系。
- `field_note_revisions`：文章内容快照与版本号。

### 媒体

- `media_assets`：Storage 对象的数据库元数据。
- `field_note_media`：文章与媒体素材的关联及排序。

### 订阅和审计

- `subscribers`：可独立于账号存在的邮件订阅者。
- `subscription_preferences`：订阅类别和渠道偏好。
- `private.audit_logs`：不可由普通 Data API 直接访问的敏感操作记录。

账号 ID 使用 UUID；单库业务实体优先使用 `bigint generated always as identity`，关联表采用组合主键。时间统一使用 `timestamptz`，可演进状态使用带 `CHECK` 约束的 `text`。所有外键、RLS 所有权字段和常用筛选列建立索引。

## 认证与权限

注册触发器在同一事务中创建 Profile 并授予 `member` 角色。若触发器失败，注册也失败，避免出现无 Profile 的半成品账号。

`private.has_permission(permission_key)` 按以下关系统一授权：

```text
auth.uid()
  -> user_roles
  -> roles
  -> role_permissions
  -> permissions
```

函数忽略停用角色和已过期的用户角色。身份标签不参与系统权限。

权限表只允许迁移和 Seed 定义权限键。普通管理员可以创建自定义角色并组合已有权限，但不能创造任意 permission key。

`super_admin` 是不可删除的系统角色。只有 super admin 能授予或撤销该角色、修改高风险权限和系统角色；数据库阻止撤销最后一个 super admin。第一个 super admin 通过仅数据库管理员可执行的一次性引导函数创建。

## RLS 与数据边界

所有 `public` 表启用 RLS，并显式配置最小表级权限：

- 匿名用户只能读取 Published + Public Field Notes、公开 People、公开且启用的 Identity Labels、启用的 Topics 及其公开关联。
- 登录用户只能读取和修改自己的 Profile、媒体、订阅信息和有权访问的草稿。
- Contributor 可以创建文章、编辑自己的可编辑稿件并投稿，但不能批准或发布。
- Editor、Admin 和自定义角色的能力完全由 permission 决定。
- RBAC、身份分配、主题管理和内容状态转换通过受控函数完成，不能直接修改关联表绕过审计。
- `profiles` 默认不对匿名用户公开；官网人物资料统一来自 `people`。
- `private.audit_logs` 和内部授权函数位于未暴露的 `private` schema。

授权函数固定空 `search_path`，默认撤销 `PUBLIC` 执行权限，只向必要数据库角色授予执行权。函数内部不使用用户可编辑的 `user_metadata` 参与授权。

## Field Notes 工作流

允许的主要状态转换为：

```text
draft
  -> submitted
  -> in_review
  -> changes_requested
  -> submitted
  -> approved
  -> published
  -> archived
```

转换函数同时验证当前用户、权限、文章所有权和允许的前置状态。数据库触发器阻止直接篡改 `status`、`created_by` 和系统时间字段。重要内容修改自动产生递增且每篇文章唯一的 revision。

状态转换、角色分配、身份分配、Topic 管理、公开性调整和管理员资料修改均在事务中写入 Audit Log；审计写入失败时敏感操作整体回滚。

## Storage

创建以下 bucket：

- `avatars`
- `field-notes`
- `member-media`
- `public-media`
- `private-impact`

只有 `public-media` 是 public bucket。其他 bucket 通过 `storage.objects` RLS 控制读取、上传、更新和删除。用户对象路径以用户 UUID 为首段，策略同时校验路径所有权和 `media_assets` 记录。公开人物素材放入 `public-media`；普通用户上传不会自动变成官网公开素材。

## 服务层与数据流

新增以下代码边界：

```text
supabase/
  migrations/
  tests/database/
  config.toml
  seed.sql

src/lib/supabase/
  client.ts
  database.types.ts

src/services/
  auth/
  profiles/
  people/
  permissions/
  field-notes/
  media/
  subscriptions/

api/_lib/
  auth.ts
  supabase.ts
```

React 组件只调用 service，不复制 Supabase 查询和权限判断。Vercel Functions 先验证用户 JWT，再以用户身份检查 permission；只有明确需要后台密钥的操作才建立 server-only client。

统一错误模型提供稳定错误码，不向客户端返回数据库内部信息。多表写入和审计使用数据库事务。

## 迁移组织

迁移按以下依赖顺序拆分：

1. 基础 schema、通用函数与扩展。
2. Profiles、People 和身份标签。
3. RBAC、授权函数、引导规则和 Audit Log。
4. Topics、Field Notes、作者、主题和 revisions。
5. Media、Storage buckets 和对象策略。
6. Subscribers 和 subscription preferences。

Seed 提供系统角色、固定权限、默认身份标签和默认 Topics。类型在最终 schema 上生成并提交。

## 测试与验收

数据库测试覆盖：

- 注册自动创建 Profile 和 member role。
- 匿名公开读取与未发布内容隔离。
- 用户不能修改他人 Profile。
- 用户不能给自己添加 admin role。
- Contributor 不能直接发布。
- Editor 不能越权授予 super admin。
- 私有 Storage 对象不能通过猜测路径读取。
- `created_by` 不可伪造。
- 普通 Admin 不能扩大自身权限。
- 完整 Draft、Review、Changes Requested、Approve、Publish 流程。
- 管理操作产生不可删除的 Audit Log。

最终验证顺序为：数据库 reset、seed、数据库测试、Supabase advisors、TypeScript 类型生成、现有测试、lint 和 production build。

## 实施边界

本阶段不迁移 Next.js，不大规模修改 UI，不建立 Impact Phase 2 表，不替换现有 Google Form 流程。现有工作区修改均予以保留；后端接入优先新增文件，避免与正在进行的前端工作发生冲突。
