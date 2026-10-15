# Impact 本地实施与验证

日期：2026-10-15。预览：http://127.0.0.1:5180/impact。

## 实现

- 六章：项目数据、成长故事、家庭观察、持续行动、网站访问、获奖与成果。
- About 与 Impact 共用 EditorialHero、EditorialChapterHeader；章节导航直接使用 EditorialSectionNav。完整成果页复用同一 Hero 的图文布局与导航，保留既有路由和成果锚点。
- 三篇现有文章按同样的图片、作者、标题、摘要、链接顺序呈现；家长寄语明确标注原有来源；持续行动保留计划与邀请的准确口径。
- 累计访问只含匿名会话数与 PV，不新增访客识别。公开 API 仅返回起点、更新时间、会话数、PV 四个字段，成功响应最多缓存 60 秒，失败不缓存、不返回假零值。
- SQL 在私有累计表中持久保存总数：事务内回填和安装 INSERT 触发器；重复事件、停留更新不重复累计；90 天明细清理和管理端报表日期不减少或重置总数。
- 路由过渡保留每一页自己的 location，防止退出页渲染新内容；减少动态效果模式使用静态容器。

## 已执行验证

1. 14 个 Vitest 文件，共 73 项通过，覆盖 Impact、成果、统计加载/失败/重试/真实零值、API 白名单与错误边界、共享导航、About、Programs、Navbar、SEO、路由容器、现有采集与管理统计接口。
2. npm run typecheck:app、npm run typecheck、本次源码 ESLint、本地 npm run build 通过。构建使用同项目已有本地发布产物中的公开 URL/publishable key；没有使用服务端 Secret。
3. 隔离的本地 PostgreSQL：使用原始 analytics 迁移和本次迁移，执行 supabase/tests/database/017_website_analytics_lifetime_totals.sql；空白数据库重建通过，迁移重放不重置，两个并发写入者新增 2 个会话 / 50 个 PV，累计结果准确。
4. 浏览器 13 组检查通过，证据见 browser-verification.json 及同目录截图：中英文 390/820/1440，六章点击/自动高亮/横向可见/重复点击，所有图片解码，档案跨页返回，两种动画模式。About/Programs 三尺寸无横向溢出，桌面标题字体、位置、尺寸和 Hero 高度与改造前数值一致。成功统计排版通过浏览器拦截响应检查；测试值取自此前只读核验的快照，页面和 API 没有写死这些数字。
5. 迁移前真实本地 /api/impact/visits 返回 503 / no-store，浏览器已验证此状态有重试提示、没有假数字，成长故事照常可读；键盘 Enter 章节导航与成果 hash 深链接也通过，见 browser-states.json。本地预览采集请求返回 ignored，测试浏览不写入生产统计。
6. 原始测试、类型检查、构建与本机真实 HTTP 响应日志已保存在同目录。隔离本地 PostgreSQL 测试进程已停止，预览继续运行。

## 获批迁移与真实数据验证

用户明确回复“批准，仅执行这项统计迁移”后，原生 apply_migration 执行成功；迁移版本为 20261015062209。本地迁移文件已对齐原生版本。没有绕过最初因缺少明确授权而收到的拒绝，也没有推送或部署网站。

迁移后只读核验通过：累计 132 会话、602 PV，与原始表计数完全一致；起点为 2026-08-16T13:34:41.652492Z，两个 INSERT 触发器启用。累计表 RLS 开启且不向 anon/authenticated 授予原表 SELECT，匿名 RPC 可读取相同四字段汇总。

真实本地 API 返回 200 与约定缓存头；1440 中文和 390 英文页面显示值均与各自真实响应一致，未使用浏览器拦截。见 live-verification.json、remote-migration-evidence.json、*-live-totals.png 和 impact-live-* 日志。没有向生产写测试事件。数据库汇总能力已安装，网站前端/API 尚未发布到生产站。

源文件：supabase/migrations/20261015062209_website_analytics_lifetime_totals.sql。迁移锁等待上限 3 秒、语句上限 20 秒。

安全顾问新增的 [RLS 无策略 INFO](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) 符合此私有累计表的设计：原表拒绝直接访问，仅由受限函数读取/更新；不为消除提示而放宽权限。顾问另报告现有 Auth 的[泄漏密码保护配置提醒](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)，本次未调整 Auth 配置。
