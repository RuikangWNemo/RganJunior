# 正式环境认证回调地址修复实施计划

## 目标

保证正式环境中的注册确认、Magic Link 和密码重置邮件都回到 `https://www.rganjunior.org`，本地开发仍可使用本地地址，并让托管 Supabase 配置与应用契约一致。

## 任务一：固定回调地址契约

文件：

- `src/lib/authRedirect.ts`
- `src/lib/authRedirect.test.ts`

步骤：

1. 先添加测试，覆盖生产模式、本地开发模式和路径组合。
2. 运行定向测试，确认测试在实现前失败。
3. 实现集中式 URL 解析函数，生产使用 `SITE_URL`，开发使用浏览器 origin。
4. 再次运行定向测试。

## 任务二：接入全部邮件认证流程

文件：

- `src/services/auth/index.ts`

步骤：

1. 删除服务内的直接字符串拼接。
2. 注册确认、Magic Link、密码重置统一调用新的 URL 解析函数。
3. 运行认证页面测试与应用类型检查。

## 任务三：同步本地配置说明

文件：

- `supabase/config.toml`
- `README.md`

步骤：

1. 在本地配置的 Redirect URLs 中列出认证与密码重置精确路径。
2. 在 README 记录托管项目必须使用的 Site URL 与 Redirect URLs。
3. 明确 `config.toml` 不会替代线上 Dashboard 配置。

## 任务四：更新托管 Supabase Auth 配置

1. 读取当前项目设置。
2. 把 Site URL 更新为 `https://www.rganjunior.org`。
3. 精确加入正式认证回调与密码重置地址。
4. 保留必要的本地开发地址，但不允许其成为默认 Site URL。
5. 重新读取或查看设置，确认保存成功。

## 任务五：验证与发布

1. 运行定向 Vitest。
2. 运行 `npm run typecheck:app`。
3. 运行 `npm run build`。
4. 只暂存本次相关文件，保留用户已有的跟踪文档改动。
5. 提交并推送当前发布分支。
6. 等待 Vercel 部署完成，检查正式回调页和生产资源。
7. 在不向真实用户发送测试邮件的前提下，验证生成逻辑与线上允许列表均不包含生产回退到 `localhost` 的路径。
