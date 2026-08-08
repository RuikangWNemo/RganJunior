# 社区文章高级协作编辑器实施计划

日期：2026-08-08
依据：`docs/plans/2026-08-08-community-collaborative-editor-design.md`

## 实施边界

- 使用 BlockNote Core、Yjs、Hocuspocus v4 和开源依赖，不接入 BlockNote XL 或付费托管协作服务。
- 保留现有 Supabase Auth、Membership、RBAC、文章审核状态和媒体服务。
- 保留 `field_notes.content` 和旧修订字段，所有结构化内容均以向后兼容方式增加。
- 公开文章只使用已批准的服务端快照，不加载编辑器协作代码。
- 当前工作树包含大量既有改动；只修改本功能所需文件，任何提交都必须显式列出文件。
- 生产实时协作需要 Redis 与服务器密钥；缺少外部资源时，代码和本地单实例验证可以完成，但不能宣称生产多实例协作已上线。

## 1. 固定依赖与共享文档模型

### 依赖

使用 `npm view` 核对兼容版本后固定安装：

- `@blocknote/core`
- `@blocknote/react`
- `@blocknote/mantine`
- `@blocknote/server-util`
- `@hocuspocus/server`
- `@hocuspocus/provider`
- `@hocuspocus/provider-react`
- `@hocuspocus/extension-database`
- `@hocuspocus/extension-redis`
- `yjs`
- `y-indexeddb`
- `sanitize-html` 及其类型

Hocuspocus、provider 和扩展保持同一主版本。提交 `package-lock.json`，不使用浮动未锁定依赖。

### 共享模型

新增 `src/lib/field-note-document/`：

- `schema.ts`：客户端与服务端共同使用的 BlockNote schema 和 schema version。
- `legacy.ts`：纯文本到段落块的幂等转换。
- `snapshot.ts`：blocks/YDoc 到 JSON、纯文本和安全 HTML 的转换。
- `types.ts`：内容快照、编辑权限、保存状态和发布视图模型。

先为纯文本转换、空内容、嵌套块纯文本提取、危险链接/HTML 清理和 YDoc 往返增加 Vitest。

## 2. 数据库与权限基础

### 创建 migration

先运行 `supabase migration new community_collaborative_editor`，使用 CLI 生成规范文件名，再填写 SQL。

`field_notes` 增加：

- `content_json jsonb`
- `content_html text`
- `content_schema_version smallint`
- `collaboration_mode text not null default 'invite_only'`

`field_note_revisions` 增加：

- `content_json_snapshot jsonb`
- `content_html_snapshot text`
- `content_schema_version smallint`
- `source text`，区分自动检查点、手动保存、提交、审核和恢复

新增公开但受 RLS 保护的业务表：

- `field_note_collaborators`
- `field_note_share_links`
- `field_note_comments`
- `field_note_comment_events`

新增私有表：

- `private.field_note_collab_documents`
  - `field_note_id` 主键
  - `yjs_state bytea`
  - `schema_version`
  - `updated_at`

### 权限函数

扩展或增加：

- active Membership 判断。
- 文章所有者、指定协作者和 staff 的读取/编辑/评论权限。
- 链接令牌哈希验证；链接只放宽邀请要求，不放宽 Membership 和文章状态。
- 服务端专用协作授权函数，显式撤销 `PUBLIC/anon/authenticated`，只授予 `service_role`。
- 原子检查点函数：保存标题、摘要、JSON、纯文本、HTML、schema version，并按需要创建修订。
- 恢复版本函数：从旧修订创建新修订，不能删除历史。

### 现有触发器调整

- 将 JSON/HTML/schema 纳入正文变更保护。
- 停止协作自动保存触发“每次更新一个修订”；修订改由检查点函数控制。
- 保持状态时间戳、发布字段限制和系统字段不可变。
- 提交审核必须验证非空结构化快照已经成功物化。

### RLS 与 grant

- 所有 `public` 新表显式启用 RLS。
- 明确 `GRANT`，不依赖 Data API 自动暴露。
- 协作者只能读取相关成员的最小公开资料。
- 分享令牌哈希不允许普通客户端直接读取。
- 私有 Yjs 表不授予 browser roles；仅服务端专用函数或 secret client 访问。

### 数据库测试

新增 pgTAP 覆盖：

- 所有者、邀请成员、链接成员、过期链接、撤销链接、非 active Membership、匿名、审核者和管理员矩阵。
- 草稿、审核中、退回、发布、归档的读/写/评论权限。
- 分享令牌不可直接读取。
- 检查点修订数量不会随自动保存无限增长。
- 提交前快照验证、恢复为新版本、公开只读取 published snapshot。
- RLS、函数执行权限和私有表不可见性。

完成后更新 `src/lib/supabase/database.types.ts`，再运行 backend/app typecheck。

## 3. Hocuspocus 协作服务

新增共享服务器模块 `api/_lib/field-note-collaboration/`：

- `authorization.ts`：`auth.getUser(jwt)`、文章名解析、服务端权限 RPC 和只读判定。
- `persistence.ts`：Hocuspocus Database extension 与 Supabase `bytea` 往返。
- `materialize.ts`：`ServerBlockNoteEditor.yDocToBlocks`、纯文本和 sanitized full HTML。
- `server.ts`：Hocuspocus v4 配置、Redis 扩展、存储防抖、限流和日志。
- `documents.ts`：统一文档名格式，例如 `field-note:<id>`，拒绝任意表名/路径输入。

### 身份验证

`onAuthenticate`：

1. 验证 Supabase JWT。
2. 验证 document name 和文章存在性。
3. 验证 active Membership、协作者/链接/staff 权限和状态。
4. 返回最小用户 context；无正文写权限时设置 `connection.readOnly = true`。

不信任 `user_metadata`、客户端角色、客户端用户名或前端 permission 数组。

### 持久化和物化

- Database extension 原样读取/保存 Yjs `Uint8Array`。
- 首次无 Yjs 状态时，仅一次性把 legacy `content` 或 `content_json` 转为 YDoc。
- 防抖存储保存二进制主状态；自动物化只更新搜索/恢复快照，不创建人工修订。
- 手动保存、提交和恢复通过显式检查点完成。

### 运行入口

- `api/community/field-note-collaboration.ts`：Vercel Node WebSocket 入口。
- `scripts/community-collaboration-server.ts`：本地单实例入口。
- `vercel.json`：只为协作函数配置最长允许 duration，不影响普通 API 和 SPA rewrite。
- `package.json`：增加本地协作启动命令。

环境变量：

- `VITE_COMMUNITY_COLLAB_URL`
- `COMMUNITY_COLLAB_REDIS_URL`
- `COMMUNITY_COLLAB_INSTANCE_NAME`
- 继续使用现有 server-only `SUPABASE_SECRET_KEY`

无 Redis 时只允许显式的 development/test 单实例模式；production 缺少 Redis 时启动失败，避免假装支持多实例。

### 服务端测试

- 无 token、过期 token、错误文档名、无 Membership、撤销权限和只读连接。
- legacy 初始化只发生一次。
- Database extension 原样返回 binary。
- 存储防抖与关闭 flush。
- 两个服务实例通过 Redis 测试容器或替代测试适配器同步；如果本地环境不能运行 Redis，记录为生产外部验证项。

## 4. 安全评论、分享与版本 API

新增 Vercel HTTP endpoints：

- 文章编辑访问上下文。
- 邀请/撤销协作者。
- 创建、轮换、撤销分享链接。
- RESTYjsThreadStore 评论写入。
- 列出修订、创建检查点、恢复修订。

所有 endpoint：

- 使用现有 `requireUser` bearer-token 验证。
- 对变更操作限流并写审计事件。
- 返回稳定错误码，不泄露分享令牌哈希或无权限文章是否存在。
- 分享链接创建时只返回一次原始 token；存储前使用 SHA-256 或 keyed hash。

### 评论

- 客户端使用 BlockNote `RESTYjsThreadStore`。
- REST endpoint 验证“可评论”权限以及 comment/thread ownership。
- endpoint 通过 Hocuspocus `openDirectConnection` 更新 YDoc 的 `threads` map，使评论经过 Redis/WebSocket 实时传播。
- 同步写入 `field_note_comments` 业务读模型和不可变 comment event，支持通知与审计。
- 正文只读的审核阶段仍可评论，但无法提交普通正文 Yjs update。

为每个 endpoint 增加 Vitest：方法限制、无 token、权限拒绝、成功、撤销和服务不可用。

## 5. 前端协作生命周期

### 路由与加载

- 将 `CommunityStoryEditor` 改为 `React.lazy` 路由，编辑器依赖只在写作页面下载。
- 新建文章先创建最小 draft 获得稳定 note id，再进入 `/community/stories/:id/edit`。
- 编辑页面使用 note-scoped access API，不再下载全部“我的文章”后查找。

### Provider 管理

新增 `CommunityFieldNoteCollaborationProvider`：

- 创建 Y.Doc。
- 使用 `@hocuspocus/provider-react` 管理 WebSocket 和房间生命周期。
- 使用 session access token 函数，支持 token refresh 后重连。
- 使用 `y-indexeddb` 存储本地副本。
- 暴露连接、同步、只读、未持久化、离线恢复和 awareness 状态。

连接拒绝且本地存在未同步内容时，提供导出/复制恢复内容，不自动覆盖受保护文章。

## 6. BlockNote 文档工作台

将现有 `CommunityStoryEditor` 拆为：

- `CommunityDocumentWorkspace`
- `CommunityDocumentBar`
- `CommunityBlockEditor`
- `CommunityCollaborationStatus`
- `CommunityShareDialog`
- `CommunityRevisionPanel`
- `CommunityCommentPanel`

### 编辑区

- 标题和摘要内联位于正文上方。
- BlockNote 支持段落、H1–H3、列表、todo、折叠、引用、提示、分隔线、代码、表格、图片、音视频和文件。
- 启用 `/` 菜单、选择浮动工具栏、块侧菜单、拖拽、快捷键和 Markdown shortcuts。
- `uploadFile` 适配现有 `uploadOwnedMedia`，验证 MIME/体积并关联 field note media。
- `editable` 完全来自服务端 access 与连接状态。

### 文档栏

- 稳定返回 `/community/stories`。
- 显示文章状态、保存/离线/重连/失败状态。
- 显示协作者头像和在线人数。
- 提供分享、保存版本和提交审核。
- 提交按钮先等待 provider sync，再调用服务端强制检查点；成功后才转换文章状态。

### 评论、分享和历史

- BlockNote CommentsExtension + RESTYjsThreadStore。
- 分享弹窗管理邀请成员和链接模式，明确“链接仍需 active Membership”。
- 修订侧栏列出作者、时间、来源和预览；恢复前二次确认，恢复生成新版本。

### 双语与响应式

- 所有编辑器外层文案、状态、错误、面板和动作接入 `useCommunityUi`。
- BlockNote dictionary 跟随 `zh/en`，切换语言时安全重建 UI，不重建 YDoc。
- 桌面使用宽文档栏和侧面板；390px 使用紧凑顶栏、底部抽屉与表格内部滚动。
- 保证触控目标、focus-visible、reduced-motion 和可访问名称。

### 组件测试

测试时 mock BlockNote/provider，仅验证应用契约：

- 新建 draft 后跳转稳定 id。
- access loading/error/read-only。
- 保存状态和离线恢复提示。
- submit 必须在 checkpoint 成功后发生。
- 邀请/链接/撤销权限反馈。
- 中文/英文文案和 390px 结构类。

共享 schema、snapshot 与 provider lifecycle 另做不依赖 DOM 的单元测试。

## 7. 公开渲染和兼容

新增数据库公开文章 repository：

- 只查询 `status = published`、`visibility = public` 的批准快照。
- 映射标题、摘要、语言、发布时间、作者最小公开资料、主题、媒体和 `content_html/content_json`。
- 当前 local repository 继续作为已有样稿来源；同 slug 冲突时保留明确优先级并加测试。

更新 `/field-notes/:slug`：

- 先走统一 published repository。
- 本地结构化样稿继续使用现有 React block renderer。
- 数据库文章使用服务端已清理 HTML 或受控 BlockNote JSON 静态 renderer。
- 不加载 BlockNoteView、Yjs、Hocuspocus、评论或编辑器 CSS/JS。

旧文章首次编辑失败时保留只读/纯文本回退和可复制内容，不能将空文档覆盖原文。

## 8. 验证与上线门槛

### 自动验证

1. `npm run typecheck`
2. `npm run typecheck:app`
3. 聚焦 Vitest：文档模型、API、服务、编辑器、公开 renderer。
4. 相关 ESLint。
5. 完整 `npm test`。
6. `npm run build`。
7. pgTAP database tests。
8. `supabase db advisors` 或可用的 advisors connector。
9. `git diff --check` 与依赖/license 核对。

### 浏览器验收

- 两个独立账号/浏览器上下文打开同一文章，验证双向文字、光标、选区和 presence。
- 邀请成员、链接成员、非 active Membership、撤销成员、审核者逐一验证。
- 断网编辑、重连合并、服务函数到期重连和权限撤销恢复副本。
- 正文只读时评论仍可工作。
- 保存版本、恢复版本、提交审核、退回修改和发布快照。
- 公开文章页面网络资源中不包含编辑器/协作 bundle。
- 1440px 与 390px 截图和横向溢出探针。

### 生产配置

上线前必须确认：

- Supabase migration 已应用并通过 advisors。
- Vercel Fluid Compute/WebSocket 函数可用。
- Redis URL 已配置且 TLS/访问控制正确。
- `SUPABASE_SECRET_KEY` 仅存在服务端。
- `VITE_COMMUNITY_COLLAB_URL` 指向正确 wss endpoint。
- 双实例协作与重新部署后的重连通过验证。

如果这些外部条件尚未配置，最终交付必须明确区分“代码完成”“本地单实例验证完成”和“生产多实例上线完成”。
