# 阿柑少年认证邮件生产系统设计

## 目标与边界

为现有 `rganjunior.org` 项目增加完整、可回滚的生产认证邮件投递层。Supabase Auth 继续生成并验证 OTP、Magic Link、注册确认、密码重置、邮箱变更与重新认证凭据；Vercel Function 只验证 Supabase Send Email Hook、选择品牌模板并调用 Resend；Resend 负责真实互联网投递。

第一阶段以 Resend Free 为运行边界，预计认证邮件峰值不超过每天 100 封。超过或接近免费额度必须在运营日志和部署文档中明确体现，不把额度不足伪装成发送成功。

不搭建 SMTP Server、VPS、Postal、Postfix、Mailcow 或 Mailu，也不重构现有社区、profiles、people、RLS 与登录状态体系。

## 方案选择

采用以下方案：

```text
Supabase Auth
  -> signed HTTP Send Email Hook
  -> https://www.rganjunior.org/api/auth/send-email
  -> Vercel Function
  -> React Email
  -> Resend
  -> no-reply@auth.rganjunior.org
```

未选择 Supabase Custom SMTP，是因为 HTTP Hook 更适合 action 分发、双语文案、Secure Email Change 双邮件处理和严格的服务端模板控制。未选择 Supabase 默认邮件，因为其品牌、投递和免费方案限制不适合作为生产通道。

`auth.rganjunior.org` 专用于 Authentication 与 Security 邮件，以便与未来的 Newsletter 或 Campaign 投递信誉分离。营销邮件不得使用该子域。

## 现有项目适配

项目是 Vite 5、React 18、React Router 6 与根目录 Vercel Functions，不是 Next.js。新增接口使用 `api/auth/send-email.tsx`，不创建 `src/app` 或 Next.js Route Handler。

现有认证界面已经提供邮箱密码登录、Magic Link、邮箱验证码、注册确认、密码重置、邮箱变更和认证回调。实现保持增量：只把验证码重发倒计时由 30 秒调整为 60 秒，并补充必要测试，不重写登录页面。

项目实际部署和脚本使用 npm 与 `package-lock.json`。新增依赖使用精确版本并更新 `package-lock.json`，不升级 Next.js、React、Vite 或其他无关依赖。仓库中的旧 `bun.lockb` 不作为本功能的安装依据，也不在本任务中删除。

## 代码组织

```text
api/
  auth/send-email.ts
  _lib/auth-email/
    config.ts
    schema.ts
    supabase-hook.ts
    dispatch.ts
    urls.ts
    logging.ts

emails/
  components/
    EmailLayout.tsx
    EmailLogo.tsx
    VerificationCode.tsx
    EmailButton.tsx
    EmailFooter.tsx
  auth/
    SignInCodeEmail.tsx
    SignupEmail.tsx
    MagicLinkEmail.tsx
    PasswordResetEmail.tsx
    InviteEmail.tsx
    EmailChangeEmail.tsx
    ReauthenticationEmail.tsx
    SecurityNotificationEmail.tsx
  previews/
  copy.ts
  types.ts

tests/auth-email/
docs/auth-email.md
```

如实际类型检查或 React Email CLI 需要，可增加独立 TypeScript 配置；不把邮件专用 JSX 配置扩散到无关客户端代码。

## 请求与发送数据流

1. 只接受 `POST`，其他方法返回 `405` 并设置 `Allow: POST`。
2. 检查所有 server-only 环境变量。
3. 读取原始请求文本，不先调用 JSON body parser。
4. 读取 Standard Webhooks headers。
5. 将 Supabase Dashboard 生成的 `v1,whsec_...` secret 按当前官方规范规范化，再交给 `standardwebhooks` 验签。
6. 只有验签通过后才解析和校验 payload。
7. 根据 `email_action_type`、可信收件人字段和 locale 构建模板 props。
8. 由服务端映射生成 Subject、HTML、纯文本、From 与 To。
9. 调用 Resend，并检查 `data` 与 `error`。
10. 成功返回 `200 {}`；签名失败返回 `401`；payload 错误返回 `400`；provider 失败返回合适的 `500/502` Hook error shape。

Vercel Function 不查询数据库、不调用 AI、不读取 Storage，也不执行与发送无关的业务工作。目标 P95 小于 2 秒，并始终低于 Supabase HTTP Hook 的 5 秒执行限制。

## 安全模型

### 签名验证

签名验证使用 raw body 和 `standardwebhooks`。不自行设计 HMAC，也不接受仅有 JSON 内容但签名缺失或错误的请求。缺失签名、修改 payload、重放异常和错误 secret 都必须被测试。

### 非公开邮件 Relay

收件人只能来自已验签的 Supabase Hook payload。调用方不能指定任意 From、To、Subject、HTML、Reply-To 或 React 模板。未知 action 不发送邮件，并返回明确错误。

### Secret

`RESEND_API_KEY` 与 `SUPABASE_SEND_EMAIL_HOOK_SECRET` 仅允许 server side 使用，不得带 `NEXT_PUBLIC_` 或 `VITE_` 前缀，也不得进入日志、错误正文、客户端 bundle 或 Git。

### Redirect

Confirmation URL 由统一 helper 使用 token hash、action type 和经过校验的 redirect 构建。Production allowlist 只有：

- `https://www.rganjunior.org`
- `https://rganjunior.org`

第三方域、`javascript:`、非法 URL 与 Production 中的 Vercel Preview URL 均回退到 canonical URL。开发和 Preview 仅在显式非生产环境中允许受控 origin。

### Secure Email Change

字段映射严格遵循 Supabase 当前官方行为：

- 当前邮箱 `user.email`：使用 `token` 与 `token_hash_new`。
- 新邮箱 `user.new_email`：使用 `token_new` 与 `token_hash`。

Secure Email Change 关闭时，只向新邮箱发送 payload 实际存在的单组 token/hash。代码不根据 `_new` 后缀猜测收件人。双邮件分别使用独立幂等键，确保 Supabase 重试时不会重复发送已成功邮件。

### 日志

允许记录 action、Webhook ID、Resend ID、耗时、结果和脱敏邮箱。禁止记录 OTP、token、token hash、Magic Link、完整正文、Hook Secret、Resend API Key、JWT 和密码。

## action 与模板

第一阶段支持当前 Supabase Authentication 与 Security actions，并对未知未来值安全失败：

- `signup`
- `invite`
- `magiclink`
- `recovery`
- `email_change`
- `email`
- `reauthentication`
- `password_changed_notification`
- `email_changed_notification`
- `phone_changed_notification`
- `identity_linked_notification`
- `identity_unlinked_notification`
- `mfa_factor_enrolled_notification`
- `mfa_factor_unenrolled_notification`

Authentication 模板根据实际 payload 显示一个主要 CTA，并在适用时同时显示可复制 OTP。Security Notification 不添加不必要的 token 或登录链接。

## 国际化

首期支持 `zh-CN` 与 `en`，Subject 与模板正文使用同一份类型安全文案字典。

语言优先级：

1. `app_metadata.locale`
2. `user_metadata.locale`，仅作为低风险显示偏好
3. 默认 `zh-CN`

`user_metadata` 不得决定收件人、action、安全流程、角色或权限。

## 邮件视觉

整体视觉为年轻、自然、温暖、克制，并保持认证任务优先：

- 暖米白页面背景与暖白正文卡片；
- 约 580px 最大宽度，移动端 100% 宽度与 20–24px padding；
- 顶部使用邮件客户端兼容的官方 Logo PNG，并提供“阿柑少年”文字后备；
- 用 email-safe HTML 与内联样式实现轻量“柑橘圆点 + 叶片绿线”装饰；
- 品牌橙用于重点，深森林绿用于按钮和主要文字；
- OTP 是验证码邮件中最大、最易复制的内容；
- 每封邮件最多一个主 CTA；
- 同时生成 HTML 与纯文本版本。

不使用 GIF、视频、背景大图、外部字体、复杂 CSS、营销 Banner、社交按钮矩阵、Tracking Pixel、Open Tracking 或 Click Tracking。Logo 加载失败时，品牌名、验证码和操作仍完整可用。

## Resend 与 DNS

发件人默认值：

```text
阿柑少年 <no-reply@auth.rganjunior.org>
```

Resend Domain 使用 `auth.rganjunior.org`。Cloudflare DNS 只能采用 Resend Dashboard 实际生成的 SPF、DKIM、Return-Path/MX 等记录，不在代码或文档中猜值。需要代理开关时按 Resend Cloudflare 指南使用 DNS-only。

DMARC 初期使用 `_dmarc.auth.rganjunior.org` 与 `p=none`，观察稳定后再评估 `quarantine` 或 `reject`。不得在同一 hostname 创建多个 SPF TXT，也不得破坏根域现有 SPF。

Open Tracking 与 Click Tracking 对认证子域保持关闭，避免隐私收集和一次性认证链接改写。

## 环境变量

新增或复用以下变量名：

```text
RESEND_API_KEY
SUPABASE_SEND_EMAIL_HOOK_SECRET
AUTH_EMAIL_FROM
NEXT_PUBLIC_SITE_URL 或现有 canonical site 配置
SUPABASE_URL
```

当前项目已经有 `SUPABASE_URL`，且 canonical site 已由品牌配置与 `COMMUNITY_PUBLIC_URL` 表达。实现阶段应选择一个服务端 canonical source，避免再创建多个同义变量。`.env.example` 只包含空值或安全占位符。

## 测试

### Hook Security

- valid signature -> accepted
- invalid signature -> 401
- missing signature -> 401
- modified payload -> 401

### Dispatch

- Authentication 和 Security action 均映射到正确 Subject、模板与收件人
- 未知 action 不发送
- Resend provider 错误向 Supabase 返回失败
- 重试使用稳定且不泄露 token 的幂等键

### Email Change

- 当前邮箱映射 `token` + `token_hash_new`
- 新邮箱映射 `token_new` + `token_hash`
- 非 Secure Email Change 单邮件行为

### Redirect

- 根域与 `www` 允许
- 第三方域回退
- `javascript:` 拒绝
- Production Preview URL 不允许

### Logging

- 日志不包含 OTP、token、token hash、secret、完整邮箱或正文

### Rendering

- OTP 可复制，长度不被错误写死
- CTA、Logo alt 和纯文本存在
- 不包含 tracking 内容
- 中英文文案可渲染

### Repository Verification

- 相关 Vitest
- 全量 `npm test`
- `npm run typecheck`
- `npm run typecheck:app`
- `npm run lint`
- `npm run build`
- React Email 本地 preview

## 部署顺序

1. 实现代码、测试与文档，不启用 Supabase Hook。
2. 部署 Vercel Function。
3. 在 Resend 添加 `auth.rganjunior.org`。
4. 把 Resend 实际 DNS records 添加到 Cloudflare。
5. 确认 SPF、DKIM、Resend Domain 与 DMARC 状态。
6. 添加 Vercel Production secrets；生产 API key 默认不提供给 Preview。
7. 使用签名测试请求验证 Endpoint。
8. 保持 Supabase Email Provider 开启并启用 HTTP Send Email Hook。
9. 依次执行 Signup、OTP、错误 OTP、Recovery、Magic Link 与 Secure Email Change E2E。
10. 至少验证 Gmail 与一个中国大陆邮箱，并检查邮件 Header。

Resend Delivery Webhook 不进入第一阶段。第一阶段使用 Resend Dashboard 与脱敏 Function 日志观察投递；以后若增加 Webhook，必须先设计事件 ID 的持久化幂等策略。

## 回滚

生产投递异常时，在 Supabase Dashboard 关闭 Send Email Hook，临时回到已配置的 SMTP 或 Supabase provider。新系统稳定前不删除现有可工作配置。

## 完成标准

代码层完成不等于生产上线完成。最终汇报必须分别报告：

- 代码、测试、类型检查、Lint 与 Build 状态；
- Vercel deployment URL；
- Resend Domain、SPF、DKIM 与 DMARC 实际状态；
- Supabase Hook 是否启用；
- 各 Auth Flow E2E 结果；
- Gmail 与中国大陆邮箱投递结果；
- 尚需用户完成的 Dashboard 或 DNS 操作。

不能自动验证的外部配置必须标为 Manual Action，不得伪造成功。
