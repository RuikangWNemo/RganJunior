# RganJunior 完整生产发布手册设计

日期：2026-08-10  
状态：已确认

## 背景

RganJunior 当前由两名 GitHub 协作者共同开发。GitHub、Vercel、Supabase、Resend 和 Redis 等服务共同构成生产链路，但平台权限并不完全对称：两人都能通过 Pull Request 贡献代码，Vercel Hobby 项目及生产 Secret 则由仓库管理员维护。

现有协作规则与 Deploy Hook 设计已经记录，但日常开发者仍需要一份从本地准备到生产验证、故障恢复的单一操作手册。该手册必须随仓库同步，确保协作者执行 `git pull` 后即可离线阅读，不依赖私人聊天记录。

## 决策

新增 `docs/collaboration/production-release-runbook.md`，作为生产发布流程的唯一事实来源，并从以下入口链接：

- `README.md`：项目首页入口；
- `CONTRIBUTING.md`：贡献者最短流程入口；
- `docs/collaboration/two-person-workflow.md`：双人协作规范中的发布章节。

不把全部内容继续堆入双人协作规范，也不按平台拆成多个零散文件。双人团队需要一份可顺序执行、可复制检查的发布手册。

## 内容范围

手册覆盖完整生产发布链路：

1. 角色、平台和权限边界；
2. 本地同步、分支、提交和验证；
3. Draft PR、CI、Vercel Preview 和双人审查；
4. Squash Merge 后的 `main` CI、Vercel Deploy Hook 与生产域名；
5. 管理员手动重建及其适用范围；
6. Supabase 迁移、类型生成、Staging 测试和 Production 顺序；
7. Vercel、Supabase、Resend、Redis 与 GitHub Actions Secret；
8. 发布后冒烟测试、日志检查和记录；
9. CI、Preview、Hook、生产构建和数据库失败的处理；
10. 应用回滚、数据库向前修复和紧急发布；
11. 可复制的发布与回退检查清单。

## 安全边界

- 文档只记录 Secret 的名称、用途、维护位置和轮换方法，不记录真实值。
- Deploy Hook URL 只存在于 GitHub Actions Secret `VERCEL_DEPLOY_HOOK_PRODUCTION` 和 Vercel 平台。
- 合作者保留真实 Git 作者身份，不使用管理员身份重复或伪造提交。
- 常规生产发布只能由合并到 `main` 且成功完成 CI 的提交触发。
- 手动生产重建只允许仓库管理员 `RuikangWNemo` 发起。
- Supabase 远程测试和数据库迁移必须先确认链接目标，禁止误用 Production 做开发测试。

## 成功标准

- 新协作者只查看仓库文档即可完成本地开发、PR 和 Preview 验证。
- 两名协作者都能明确判断谁可以执行生产操作，以及何时需要管理员介入。
- 每种正常、手动、失败和紧急发布路径都有可执行步骤和停止条件。
- 所有命令与当前仓库脚本、GitHub Actions 和 Vercel 配置一致。
- 文档中不出现 Hook URL、Token、密码或其他生产 Secret。
