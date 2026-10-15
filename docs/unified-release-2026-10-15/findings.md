# 初始版本核对

- 主目录：codex/local-refinement-2026-10-12，HEAD 14dd0a5，包含多项未提交本地完善。
- 原正式发布目录：codex/guardian-coming-soon-2026-10-12，HEAD 3cff9c7，工作区干净；应用提交 f7a1ff0，已包含图片优化与故事导航发布历史。
- 图片发布目录：codex/webp-release-2026-10-14，HEAD 873ac7a，工作区干净，是 3cff9c7 的祖先。
- 两个 /private/tmp 临时 worktree 目录已经不存在，分支和提交仍在 Git 中；只清理失效记录。
- 初次全套本地测试通过；准确数量见测试日志。
- 现有 CI 仍含生产构建，Deploy production 仍调用远端 Hook；推送前必须改为仅代码检查及本机预构建发布。
