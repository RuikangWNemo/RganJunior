# 初始版本核对

- 主目录：codex/local-refinement-2026-10-12，HEAD 14dd0a5，包含多项未提交本地完善。
- 原正式发布目录：codex/guardian-coming-soon-2026-10-12，HEAD 3cff9c7，工作区干净；应用提交 f7a1ff0，已包含图片优化与故事导航发布历史。
- 图片发布目录：codex/webp-release-2026-10-14，HEAD 873ac7a，工作区干净，是 3cff9c7 的祖先。
- 两个 /private/tmp 临时 worktree 目录已经不存在，分支和提交仍在 Git 中；只清理失效记录。
- 初次全套本地测试通过；准确数量见测试日志。
- 现有 CI 仍含生产构建，Deploy production 仍调用远端 Hook；推送前必须改为仅代码检查及本机预构建发布。

已完成合并：3cfb501 保存本地快照，9b76069 合入 3cff9c7 的已发布历史；20 项已知冲突全部采用已包含线上功能、经本地验收的最新版本。合并结果与快照的应用源码完全相同，只增加正式版独有的邀请信设计文档和合并记录。旧图片分支 873ac7a 已在此历史内。

Vercel 通过现有 CLI 认证核验正式部署为 dpl_pQgBAicRoRRq9knbZ27knfihdZKD，团队为 team_m8mJMqy11hl8TnkDgj306E3F，项目为 prj_nGgGhvcbTdwv64yYh7LKn7tfNH0p。Git 实际 dry-run 成功，gh 自身旧 token 失效不影响 Git 凭据。

本机首次 Vercel 生产预构建成功，页面 44 组桌面/手机中英文检查无横向溢出、无 JS 错误。发现生成 13 个函数，而当前团队 Hobby 套餐对这类函数限制为 12：[官方说明](https://vercel.com/docs/functions/runtimes)。因此将公开汇总 handler 移至 api/_lib，并通过已有 analytics 函数加受限路由分派承载。公开 URL 仍为 /api/impact/visits，GET/POST 的方法限制由原汇总 handler 保持，采集 POST 的验证、限流和权限逻辑保留。没有新增数据库或私密配置变更。
