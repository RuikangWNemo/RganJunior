# 首次加载性能优化实施计划

## Phase 1：可复现资源生成

1. 新增 `scripts/build-performance-assets.mjs`。
2. 脚本从首页、导航、页脚、品牌文案的明确文件清单提取非 ASCII 字符，调用 `pyftsubset` 生成 `public/fonts/qiaoqiaohua-critical-v1.woff2`。
3. 将完整字体改为版本化文件名 `qiaoqiaohua-handwriting-full-v1.woff2`，不改变字形内容。
4. 同一脚本用 `cwebp` 为首页现场轮播、项目、信念主图和发起人肖像生成 640px/1280px WebP 候选；原图保留为高分辨率来源。
5. 在 `package.json` 添加显式的资源再生成命令，但不把 FontTools/cwebp 加入生产构建依赖。
6. 用 FontTools 比较完整字体、关键子集的 cmap，并断言子集外测试字符只存在于完整字体回退中。

## Phase 2：字体和图片接入

1. 删除 `src/index.css` 的 Google Fonts `@import`。
2. 增加关键字体与完整字体两个 `@font-face`，关键字体排在完整字体前；更新全局 sans/serif 变量的系统后备。
3. 在 `index.html` 只 preload 关键字体。
4. 更新 `src/test/fontRouting.test.ts`，验证两级字体顺序、`font-display`、版本化路径和完整回退。
5. 扩展 `src/content/homepage.ts` 的图片类型，加入 `srcSet`/`sizes`，并为首页图片配置响应式候选。
6. 更新 `HomeFieldScene`、`HomePrograms`、`HomeBeliefs`、`HomeFounderStory`：首屏以下全部 lazy，轮播只挂载当前项与相邻项图片，保留尺寸和可访问文本。
7. 添加组件测试，断言隐藏轮播项不产生图片 `src`，活动项带响应式候选且不再 eager。

## Phase 3：路由拆包

1. 保留首页同步导入；将其余公共页面改为 `React.lazy`。
2. 新增 `src/pages/community/CommunityRoutes.tsx`，集中导入 AuthProvider、CommunityChrome、守卫和 Community 页面。
3. `App.tsx` 仅同步公共壳：首页、公用 providers、Layout 和最小路由工具；`/community/*` 动态导入 Community 入口。
4. 简化 `Layout.tsx` 为公共站点壳，Community 稳定壳移到 Community 入口。
5. 新增轻量 route fallback，保留最小高度且不引入图片/动画依赖。
6. 更新 Layout/App/Community 路由测试，覆盖首页、公共懒路由、Community 入口和现有重定向。

## Phase 4：缓存

1. 在 `vercel.json` 为 `/assets/*` 和 `/fonts/*` 添加一年 `immutable` 响应头。
2. 为 `/images/*`、`/stories/*`、`/brand/*` 添加 7 天浏览器缓存及 30 天 `stale-while-revalidate`。
3. 保持 `/index.html` 与 SPA HTML 的重新验证行为。
4. 添加配置测试或静态断言，防止 HTML 被意外 immutable 缓存。

## Phase 5：匿名 Core Web Vitals

1. 将 `websiteAnalyticsEventSchema` 改为严格判别联合：保留 page view/engagement，并新增 `web_vital`，只允许 LCP、CLS、INP、FCP、TTFB、受限数值、评级、导航类型和粗粒度网络类型。
2. 在 `WebsiteAnalyticsTracker` 使用 `PerformanceObserver` 收集指标；所有上报等待 page-view 请求完成，并在页面隐藏/卸载时通过现有 beacon 路径刷新。
3. 新增 Supabase migration：私有 Web Vitals 表、拒绝 Data API 的 RLS、service-role 写 RPC、permission-checked 聚合 RPC、90 天级联保留。
4. Collector 对 `web_vital` 调用独立 RPC，继续使用同源校验、Bot 过滤、HMAC IP 限速和匿名 session/view ID。
5. Admin API 并行读取现有流量 dashboard 与 Web Vitals 聚合，返回 p75、good ratio、sample count。
6. 在 Community analytics 页面增加性能区块，不显示单次访问明细。
7. 更新 schema、collector、tracker、service、dashboard、database types 和 SQL 回归测试。

## Phase 6：验证

1. 运行字体路由、首页组件、Layout/App、analytics lib/tracker/API/service/dashboard 的 focused Vitest。
2. 运行 app/API/backend TypeScript、targeted ESLint、完整 Vitest 与 `git diff --check`。
3. 生产构建并记录优化前后：首页初始 JS/CSS gzip、关键字体大小、首页 640/1280 图片总量。
4. 启动本地生产预览，在冷缓存下检查：首页当前文字不请求完整字体、子集外字符会请求完整字体、首屏以下图片不提前请求、Community 动态 chunk 只在访问 Community 时加载。
5. 部署后复查 Vercel 与 Cloudflare 最终缓存头；数据库 migration 与应用需按 migration-first 顺序发布。

## 回滚

- 字体问题：恢复原完整字体 `@font-face`，关键子集文件可保留但不引用。
- 图片问题：`src` 始终保留原图，删除 `srcset` 即可回滚。
- 路由问题：恢复静态 imports，不改变 URL 或数据库。
- RUM 问题：停止发送 `web_vital`，保留表不影响既有流量统计；必要时通过后续 migration 删除新 RPC/table。
