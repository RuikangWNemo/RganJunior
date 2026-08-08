# 阿柑少年社群独立入口与注册页重设计实施计划

日期：2026-08-07
依据：`docs/plans/2026-08-07-community-entry-auth-redesign-design.md`

## 实施边界

- 保留现有线上 Supabase 数据库、Auth、年龄分流、监护人确认和权限逻辑。
- 当前所有环境继续使用同一站点；社区正式入口为 `/community`。
- 入口在新窗口打开，但社区页面视觉上脱离官网壳层。
- 不修改用户的无关工作树内容。

## 1. 集中式社区入口

新增 `src/lib/communityEntry.ts`：

- 默认根据当前 `window.location.origin` 生成 `/community`。
- 支持可选的 `VITE_COMMUNITY_ORIGIN`，为未来子域名迁移预留覆盖能力。
- 规范化尾部斜杠，避免出现重复路径。
- 提供纯函数测试，覆盖同站点、显式 origin 和无浏览器环境。

同步扩展 `src/vite-env.d.ts` 与 `.env.example`，但本阶段不要求配置该变量。

## 2. 主站入口重构

修改 `src/components/Navbar.tsx`：

- 删除 `navItems` 中的 `/community`。
- 删除社区菜单的 active-state 特判。
- Logo 恢复为 `<Link to="/">`，移除其社区提示气泡和定时状态。
- 在桌面导航操作区增加独立 `<a target="_blank">` CTA。
- 在移动抽屉中把社区 CTA 放在菜单列表之外的独立底部区域。

修改 `src/components/home/HeroMascotStage.tsx`：

- 用共享 URL helper 和安全新窗口 anchor 替换内部 Router Link。
- 保留吉祥物引导气泡、焦点状态与 reduced-motion 行为。

更新 `src/components/Navbar.test.tsx`，验证菜单移除、Logo 首页链接及独立 CTA 的 href/target/rel。

## 3. 社区独立壳层

修改 `src/components/Layout.tsx`：

- `location.pathname.startsWith('/community')` 时渲染社区分支。
- 社区分支保留 BrandHead 和路由过渡，但不挂载 public Navbar、Footer、MascotCompanion、SmoothScrollDamping 或 TargetCursor。
- 公共网站分支保持现有行为不变。

确保 `/community` 继续通过已有守卫解析未登录、onboarding、申请、监护人与成员状态。

## 4. 登录／注册门户重做

重写 `src/pages/community/CommunityAuth.tsx` 的视图状态，保留现有 service 调用：

- 独立社区品牌栏：品牌、Community、语言和返回官网。
- 编辑式内容区：核心主张、两级身份、青少年保护与成员边界。
- 聚焦操作面板：登录／注册为主切换；Magic Link／找回密码为辅助操作。
- 注册增加本地 `signupStep`：年龄范围先行，再进入邮箱与密码。
- 选择未成年人年龄后显示对应监护人流程说明。
- 错误和成功反馈维持页面内呈现。
- 桌面使用不对称编辑式网格；手机按自然阅读顺序单列。

新增 `src/pages/community/CommunityAuth.test.tsx`，覆盖：

- 默认登录态。
- 注册第一步不显示邮箱和密码。
- 选择年龄并继续后显示账号字段。
- 返回年龄步骤。
- Magic Link 和密码恢复辅助模式。

## 5. 验证

1. 运行入口 helper、Navbar 和 CommunityAuth 的聚焦测试。
2. 运行完整 Vitest 测试。
3. 运行相关 TypeScript、ESLint 和 Vite production build。
4. 浏览器验证桌面／手机：首页入口、导航入口、新窗口属性、社区独立壳层、登录与注册两步流程。
5. 记录现有无关警告或失败，不把它们混入本次改动。
