# 统一版本发布完成 · 2026-10-15

- 正式站：[www.rganjunior.org](https://www.rganjunior.org)，[Impact](https://www.rganjunior.org/impact)。
- 应用源码：[`bee96c4`](https://github.com/RuikangWNemo/RganJunior/commit/bee96c421605dfd28a8bcd9c3310df34bb9ecc99)，已推送 `main` 和 `codex/unified-website-2026-10-15`。
- 正式标签：`release/2026-10-15-unified-website`。
- Vercel 部署：`dpl_GCrgP3N6uEWaUkPSJhC86W7eMksv`，状态 READY，Production，Vite，Node.js 24。
- 上传方式：本机 `vercel build --prod` → `vercel deploy --prebuilt --prod --skip-domain` → 核验 → `vercel promote`。服务端记录使用 `.vercel/output` 成品，未运行远端应用构建。
- [GitHub CI 成功](https://github.com/RuikangWNemo/RganJunior/actions/runs/38702600790)：仅 lint、类型检查与测试，生产构建及 Deploy Hook 已移除；Vercel Git 自动部署已关闭。

## 源码与 worktree

1. `3cfb501` 保存本地全部应用源码、公开图片、测试和设计记录；环境文件、构建目录、私人输出与归档不入库。
2. `9b76069` 合入此前正式版本 `3cff9c7` 的完整历史，其中已包含图片发布分支 `873ac7a`。20 项已知冲突使用已经包含线上功能、经用户本地验收的最新版本；合并后应用源码与快照完全相同，仅补入历史文档。
3. `bee96c4` 复用原统计函数承载公开汇总，保留 `/api/impact/visits` 与四字段白名单/方法权限，最终函数数为 12，符合当前 Hobby 套餐。数据库不再变更。
4. 主目录现在使用 `main`。两个失效临时 worktree 记录已清理；两个有效旧发布目录的依赖和构建成品已清理，源码、分支和忽略的配置保留为历史参考。没有删除旧分支、强推或丢弃远端提交。

## 验证结果

- 97 个测试文件，372 项测试通过；应用与后端/API 类型检查通过；lint 0 错误、9 条既有 Fast Refresh 警告。
- 本机构建成功。构建后的 1,238 份源码校验一致，见 verified-source-manifest.json。
- 本地与正式站分别检查 44 组页面：中英文、1440/390px，覆盖首页、关于、伙伴名录、守护团、项目、社区故事及文章、Impact 及成果页、加入页、登录入口。正式站无页面 JS 错误或横向溢出。
- 真实汇总 API 返回预期四字段；核验时累计 133 会话 / 603 PV，始于 2026-08-16。POST 汇总和 GET 采集均返回 405。自动化浏览屏蔽采集写入，未提交业务表单或执行账号写入测试。
- 暂存生产部署与正式域名均核对 index.html、主 JS/CSS、About、Actions、Impact、ParticipantDirectory 共 7 份资源，SHA-256 与本机成品逐字一致。旧文章入口返回 308，并保留查询参数。
- Vercel 近 20 分钟的 error 日志查询（上限 50）返回 3 条 Node DEP0169 `url.parse()` 运行时弃用提示，相关请求均成功返回 202；原始日志仅保留本机，摘要见 runtime-observation.json。此结果不代表全部历史请求或后台流程均重新验收。

截图和原始构建/运行日志保留本机；本目录的版本、哈希、接口和浏览器 JSON 记录入库，不上传环境文件、认证数据或原始私有日志。

## 回退

上一正式应用 `f7a1ff0`、部署 `dpl_pQgBAicRoRRq9knbZ27knfihdZKD` 已记录，标签 `release/2026-10-15-before-unified` 已推送。需要回退时先核对兼容性，再 promote 上一已验证部署；不要在 ECS/GitHub 构建，不自动回滚生产数据库。
