# 正式环境认证回调地址修复设计

## 背景

阿柑少年社群的 Magic Link、注册确认和密码重置流程会向 Supabase Auth 传递回调地址。当前线上 Magic Link 会打开 `localhost`，说明生产回调地址没有在应用代码与 Supabase 托管项目之间形成一致、可验证的约束。

正式站点的唯一主域名确认为 `https://www.rganjunior.org`。认证邮件品牌化暂缓，本次只保证认证邮件中的链接可以顺利回到正式站点并完成登录或密码重置。

## 方案比较

### 方案一：只改 Supabase 托管配置

把 Site URL 与 Redirect URLs 改成正式地址。改动最快，但前端仍直接依赖浏览器当前 origin；未来从预览域名或错误别名发起认证时，可能再次生成非正式地址。

### 方案二：只改前端生产回调

生产构建固定生成正式域名，本地开发继续使用本地 origin。若 Supabase Redirect URLs 没有精确允许对应路径，Supabase 会忽略传入地址并回退到 Site URL，因此不能单独保证结果。

### 方案三：应用与托管配置双重约束（采用）

生产构建固定使用正式主域名，同时在托管 Supabase 项目中设置正式 Site URL，并精确允许认证回调和密码重置路径。代码测试固定这一契约，配置文档记录线上要求。

## 设计

### 应用侧

- 新增集中式认证回调地址解析函数。
- 开发模式继续使用 `window.location.origin`，保证本地调试可用。
- 生产模式始终以 `https://www.rganjunior.org` 为 origin。
- 注册确认、Magic Link 与密码重置全部复用同一函数，避免不同流程漂移。
- 使用 URL API 组合路径，避免重复斜杠或字符串拼接错误。

### Supabase 托管配置

- Site URL：`https://www.rganjunior.org`
- Redirect URLs 至少包含：
  - `https://www.rganjunior.org/community/auth/callback`
  - `https://www.rganjunior.org/community/reset-password`
- 本地开发地址可以继续留在允许列表，但不能作为 Site URL，也不能被生产构建生成。

仓库中的 `supabase/config.toml` 服务于本地 CLI，不用于替代托管项目的 Dashboard 配置；只补齐本地与正式回调路径示例，不把本地开发的 `site_url` 改成生产域名。

### 数据流

1. 用户在正式站点发起 Magic Link、注册确认或密码重置。
2. 应用生成 `https://www.rganjunior.org` 下的对应回调地址并传给 Supabase。
3. Supabase 在允许列表中匹配该精确地址，将其写入确认链接。
4. 用户点击邮件链接，Supabase 验证令牌后跳回正式站点。
5. 现有回调页读取 Supabase 返回的会话并继续社群登录流程。

### 错误处理与安全

- 不接受查询参数或用户输入覆盖生产 origin，避免开放重定向。
- 只允许 HTTPS 正式地址。
- 保留本地开发地址只用于开发，不将其设置为生产默认回退地址。
- 不改动 Supabase 密钥、会话策略、用户数据或数据库 schema。

## 验证与发布

- 单元测试验证开发和生产两种模式生成的 URL。
- 定向认证测试、TypeScript 检查和生产构建全部通过。
- 读取托管 Supabase 配置，确认 Site URL 与精确 Redirect URLs。
- 推送当前发布分支，等待 Vercel 新部署完成。
- 线上检查正式回调页面可访问，并在可安全执行的范围内验证 Magic Link 请求与跳转地址不再包含 `localhost`。
