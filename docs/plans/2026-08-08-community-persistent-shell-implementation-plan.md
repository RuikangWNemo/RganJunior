# Community 固定骨架实施计划

日期：2026-08-08  
依据：`docs/plans/2026-08-08-community-persistent-shell-design.md`

## 实施边界

- 只修改 Community 路由外壳、共享 Community 加载状态、必要页面和对应测试。
- 保留官网现有路由动效。
- 不修改认证、权限、数据库或远端数据。

## 1. 固定 Community 路由外壳

- 调整 `Layout`，Community 路由使用不带 pathname key 的稳定主内容容器。
- 保留 `CommunityChrome` 跨 Community 路由挂载。
- 官网路由继续使用现有 `AnimatePresence` 与位移动画。
- Community pathname 变化时只重置内容滚动，不执行平滑位移。

## 2. 固定成员导航结构

- 保持 `CommunityShell` 的网格、侧栏和移动底栏挂载。
- 为 Outlet 内容增加稳定容器和仅 opacity 的短暂进入反馈。
- reduced-motion 下取消非必要过渡。

## 3. 建立布局匹配的共享骨架

- 扩展 `CommunityLoadingState`，支持适合列表、卡片和紧凑区域的骨架形态。
- 用骨架保留常见数据区的最小高度，避免通用一行提示被真实内容突然撑开。
- 在首页、文章、伙伴、共练、消息和设置中选择匹配的骨架形态。

## 4. 测试与验证

- 添加或更新 Layout、CommunityShell、CommunitySurface 测试。
- 运行 Community 聚焦测试与类型检查。
- 运行生产构建。
- 启动本地站点，在桌面与手机视口检查连续导航切换和加载完成后的布局稳定性。

