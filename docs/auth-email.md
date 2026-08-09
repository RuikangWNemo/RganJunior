# 阿柑少年认证邮件运维指南

## Architecture

```text
Browser / rganjunior.org
  -> Supabase Auth
  -> signed Send Email HTTP Hook
  -> https://www.rganjunior.org/api/auth/send-email
  -> Vercel Function
  -> React Email HTML + plain text
  -> Resend
  -> no-reply@auth.rganjunior.org
```

Supabase 仍然负责用户、OTP、Token、Session、JWT 与 Refresh Token。Vercel Function 不创建认证凭据，也不提供任意邮件发送 API。Resend 只负责投递。

## Environment Variables

Production Vercel Functions 需要：

```text
RESEND_API_KEY
SUPABASE_SEND_EMAIL_HOOK_SECRET
AUTH_EMAIL_FROM
SUPABASE_URL
COMMUNITY_PUBLIC_URL
```

推荐非敏感值：

```text
AUTH_EMAIL_FROM=阿柑少年 <no-reply@auth.rganjunior.org>
COMMUNITY_PUBLIC_URL=https://www.rganjunior.org
```

`RESEND_API_KEY` 与 `SUPABASE_SEND_EMAIL_HOOK_SECRET` 只能放在 server-side environment。不要使用 `VITE_` 或 `NEXT_PUBLIC_` 前缀，不要提交真实值。

Production API key 默认只添加到 Vercel Production。若 Preview 确实需要发送邮件，应使用独立的 Resend test key/domain。

## Local Development

安装依赖：

```bash
npm install
```

启动邮件预览：

```bash
npm run email:dev
```

预览目录是 `api/_lib/auth-email/emails/`，包含登录验证码、Signup、Magic Link、Recovery、Invite、Email Change 与 Reauthentication 示例。预览使用虚构 Token 和邮箱，不会调用 Resend。

运行认证邮件测试：

```bash
npm test -- api/_lib/auth-email tests/api/auth-send-email.test.ts tests/auth-email
```

## Templates

模板位于 `api/_lib/auth-email/emails/auth/`，公共邮件组件位于 `api/_lib/auth-email/emails/components/`。中文和英文 Subject、Preview 与正文集中在 `api/_lib/auth-email/emails/copy.ts`。

支持的 action：

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

未知 action 会返回 payload error，不会猜测或发送错误模板。

语言选择顺序：`app_metadata.locale`、`user_metadata.locale`、`zh-CN`。`user_metadata` 只用作显示偏好，不参与权限、收件人或安全流程。

## Resend Setup

1. 在 Resend Dashboard 打开 **Domains**。
2. 添加 `auth.rganjunior.org`，不要添加根域作为认证发信域。
3. 保持 Open Tracking 和 Click Tracking 关闭。
4. 等待 Resend 生成该域名的真实 DNS records。
5. 复制 Dashboard 返回的 SPF、DKIM 和 Return-Path/MX records；不要从示例猜值。
6. 验证 Domain 状态为 `verified` 后创建只允许发送所需权限的 API key。
7. 把 API key 写入 Vercel Production 的 `RESEND_API_KEY`。

Resend 官方域名文档：<https://resend.com/docs/dashboard/domains/introduction>

## Cloudflare DNS

在 Cloudflare 中为 `auth.rganjunior.org` 添加 Resend Dashboard 实际显示的记录：

- DKIM record
- SPF TXT record
- Return-Path / MX record
- Resend 额外要求的验证记录（如有）

邮件验证用的 CNAME/MX 记录按 Resend Cloudflare 指南保持 **DNS only**，不要开启橙云代理。不要在同一个 hostname 创建两条 `v=spf1` TXT；若该 hostname 已有 SPF，应先合并而不是并列。

初期 DMARC 建议：

```text
Host: _dmarc.auth.rganjunior.org
Type: TXT
Value: v=DMARC1; p=none; pct=100;
```

先观察 SPF/DKIM 对齐、退信和投诉，再单独评估 `quarantine` 或 `reject`。不要修改根域现有邮件 DNS，除非已经核对全部现有发送方。

Resend Cloudflare 指南：<https://resend.com/docs/knowledge-base/cloudflare>

## Vercel Setup

在项目的 Production Environment 添加：

```text
RESEND_API_KEY
SUPABASE_SEND_EMAIL_HOOK_SECRET
AUTH_EMAIL_FROM
SUPABASE_URL
COMMUNITY_PUBLIC_URL
```

先部署代码，但暂时不要启用 Supabase Hook。部署后确认：

- `GET /api/auth/send-email` 返回 `405`；
- 未签名 `POST` 返回 `401`；
- Function 日志不包含 Token、OTP、Hash、Secret 或完整邮箱；
- Production Function 使用 Node 24。

## Supabase Hook Setup

1. 确认 **Authentication > Providers > Email** 仍为 Enabled。
2. 打开 **Authentication > Hooks**。
3. 选择 **Send Email** 与 **HTTP**。
4. URL 填写：

   ```text
   https://www.rganjunior.org/api/auth/send-email
   ```

5. 在 Dashboard 生成 Hook Secret。
6. 将同一个完整 secret（通常形如 `v1,whsec_...`）写入 Vercel Production 的 `SUPABASE_SEND_EMAIL_HOOK_SECRET`。
7. 重新部署或刷新 Function environment。
8. 使用 Supabase/Standard Webhooks 测试工具发送签名测试。
9. 确认 Endpoint 返回 `200 {}` 后再启用 Hook。

Email Provider 必须保持开启。Provider Enabled + Hook Enabled 时由 Hook 负责投递，SMTP 不参与；关闭 Email Provider 会关闭邮箱注册。

Supabase 官方文档：<https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook>

## Secure Email Change

Secure Email Change 开启时，必须发送两封邮件：

```text
当前邮箱 user.email
  -> token
  -> token_hash_new

新邮箱 user.new_email
  -> token_new
  -> token_hash
```

字段名因为兼容历史而反直觉。不要把 `_new` 自动理解为“给新邮箱”。该映射有单元测试保护。

Secure Email Change 关闭时，只给新邮箱发送 payload 实际提供的一组 token 与 `token_hash`。

## Production E2E

Hook 启用后依次测试：

1. 新邮箱 Signup，链接与验证码均可确认。
2. 邮箱 OTP 登录，正确 OTP 建立 Session。
3. 错误 OTP 登录失败。
4. Recovery 链接进入 `/community/reset-password` 并可更新密码。
5. Magic Link 只使用一次并建立 Session。
6. Secure Email Change 的当前邮箱和新邮箱均收到各自邮件并完成确认。

至少测试 Gmail 与一个中国大陆邮箱（QQ 或 163）。记录 Inbox/Spam、投递耗时，并检查原始邮件 Header：

```text
SPF: PASS
DKIM: PASS
DMARC: PASS
```

任何一个 FAIL 都需要先调查 DNS 或对齐问题，不能宣布生产投递完成。

## Logging and Privacy

允许日志字段：

- action
- Webhook ID
- Resend message ID
- success / failure
- duration
- 脱敏邮箱

禁止日志字段：

- OTP
- Token / Token Hash
- Magic Link
- 完整 HTML 或纯文本正文
- Hook Secret
- Resend API Key
- JWT / password

邮件发送使用基于 Webhook ID、action 和 recipient role 的哈希幂等键。Secure Email Change 的两封邮件使用不同 recipient role，重试不会重复发送已经成功的那一封。

## Troubleshooting

### `401 Invalid webhook signature`

- 确认 Vercel secret 与 Supabase Dashboard 完全相同；
- 保留完整 `v1,whsec_...` 值，不要手动再次编码；
- 确认请求 body 在验签前未被 JSON parser 重写；
- 检查 `webhook-id`、`webhook-timestamp`、`webhook-signature` 是否存在。

### `400 Invalid authentication email payload`

- 检查 Supabase action 是否在支持列表；
- 检查 email change 是否缺少 new email 或 token/hash pair；
- 对比当前 Supabase Send Email Hook schema，不要直接放宽校验。

### `502 Authentication email delivery failed`

- 检查 Resend Domain 是否 verified；
- 检查 API key 权限与 Production environment；
- 检查 Resend daily/monthly quota、suppression、bounce 与 provider status；
- 用 Webhook ID 和脱敏邮箱在 Vercel/Resend 日志中关联排查。

### 邮件进入 Spam

- 检查 SPF、DKIM、DMARC 和 From alignment；
- 确认没有启用 Open/Click Tracking；
- 检查发送量是否突然增长；
- 检查 Resend suppression 与 complaint；
- 保持认证子域只发送 Authentication/Security 邮件。

## Rollback

若生产邮件异常：

1. 在 Supabase **Authentication > Hooks** 关闭 Send Email Hook。
2. 保持 Email Provider 开启。
3. 临时恢复原 Custom SMTP 或已配置 provider。
4. 不删除 Vercel secrets、DNS 或旧 SMTP，直到问题定位完成。

关闭 Hook 是主要回滚开关，不需要回滚数据库，也不会修改 `auth.users`、Session、JWT 或 RLS。

## Security Checklist

- [ ] `RESEND_API_KEY` server only
- [ ] Hook secret server only
- [ ] Standard Webhooks raw-body signature verification
- [ ] No public email relay
- [ ] No user-controlled From/To/Subject/HTML
- [ ] Redirect allowlist
- [ ] Secure Email Change mapping tests
- [ ] No secrets or OTP in logs
- [ ] Open/Click Tracking disabled
- [ ] SPF/DKIM/DMARC verified
- [ ] Existing provider retained for rollback
