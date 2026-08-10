# RganJunior 双人协作规范

本规范适用于当前两人开发团队。目标是让流程足够简单，同时保证生产代码、数据库和用户数据安全。

## 1. 基本原则

1. `main` 是唯一长期分支，也是生产部署基线。
2. 常规变更禁止直接提交到 `main`。
3. 每项工作使用一个 Issue、一条短分支和一个 Pull Request。
4. 一人实现，另一人审查；角色按任务轮换。
5. GitHub 是任务、决策和验收记录的唯一事实来源。微信或口头决定要补写到 Issue/PR。
6. 优先完成和审查已有工作，再开启新任务。

## 2. 两个角色

每个任务只有两个角色：

- **实现者**：确认范围、编写代码或内容、完成自测、维护 PR 描述。
- **审查者**：检查需求、代码、界面、数据风险和验证结果，决定批准或要求修改。

仓库管理员负责平台设置和紧急处理；Collaborator 使用 Write 权限参与日常开发。两个人都必须开启 GitHub 2FA，不共享账号。

## 3. 工作状态和在制品限制

使用五个状态：

```text
Backlog -> Ready -> In progress -> Review -> Done
```

- 每个人同时最多负责一个主要 `In progress` 任务。
- 可以额外处理一个小型修复，但不得阻塞对方的 Review。
- 对方发出 Review 请求后，原则上一个工作日内响应。
- 阻塞超过一个工作日，在 Issue 中说明原因和需要的帮助。

## 4. 创建 Issue

开发前使用工作任务或缺陷模板创建 Issue。Issue 必须包含：

- 要解决的问题和目标；
- 明确、可验证的验收条件；
- 修改范围和不在范围内的内容；
- 是否涉及 UI、数据库、权限、环境变量或个人信息；
- 负责人和依赖项。

两人先对验收条件达成一致，再把状态改为 `Ready`。

## 5. 创建分支

从最新 `main` 创建短分支：

```bash
git switch main
git pull --ff-only
git switch -c feat/123-short-name
```

分支命名：

```text
feat/<issue>-<name>       新功能
fix/<issue>-<name>        缺陷修复
content/<issue>-<name>    文案或内容
db/<issue>-<name>         数据库变更
chore/<issue>-<name>      工程维护
```

不要多人共同开发同一条功能分支。如果必须交接，在 PR 中写清当前状态、剩余工作和验证结果。

## 6. 提交规范

提交信息使用以下前缀：

```text
feat: add community profile editing
fix: prevent duplicate application submission
content: update summer camp story
db: add story visibility policy
test: cover guardian approval flow
docs: document the release process
chore: align the Node runtime
```

要求：

- 一个提交表达一个完整意图；
- 不夹带无关格式化或重构；
- 不提交 `.env.local`、Token、密码、数据库备份或真实用户数据；
- 大图、视频和设计源文件先压缩或放到合适的对象存储，不直接扩张 Git 仓库。

## 7. 开发中同步

开始当天工作前同步 `main`。如果 `main` 在开发期间有更新，可以使用 GitHub 的 **Update branch**，或在本地执行：

```bash
git fetch origin
git rebase origin/main
```

已经推送过并完成 rebase 时，只允许对自己的功能分支使用：

```bash
git push --force-with-lease
```

禁止对 `main` 使用 force push。

## 8. 本地验证

提交 Pull Request 前运行：

```bash
npm ci
npm run lint
npm run typecheck
npm run typecheck:app
npm test
npm run build
```

测试失败时不要把失败项描述为“无关”后直接合并。应修复，或在 PR 中给出证据并由另一人明确同意后单独建立跟踪 Issue。

## 9. Pull Request

开始实现后尽早建立 Draft PR，以便暴露范围和冲突。准备审查时完成 PR 模板，并将 Draft 转为 Ready for review。

Pull Request 应当：

- 关联 Issue，例如 `Closes #123`；
- 解释为什么修改，而不只是列出文件；
- 明确不在本次范围内的内容；
- 提供测试结果；
- UI 变更提供桌面和移动截图；
- 数据库、环境变量和权限变更写出影响及回退方法；
- 尽量保持单一目的和可审查规模。

## 10. 审查清单

审查者至少检查：

1. 是否满足 Issue 验收条件；
2. 是否包含无关修改；
3. 失败、空状态、权限拒绝和异常路径是否合理；
4. 是否新增或泄露秘密；
5. 是否在 Issue、截图、日志中暴露真实个人信息；
6. UI 是否在 Vercel Preview 的桌面和移动端可用；
7. 数据库迁移是否向后兼容，RLS/权限是否经过测试；
8. 回退方案是否实际可执行；
9. CI 是否全部通过。

审查意见分为：

- **必须修改**：正确性、安全、隐私、数据、验收条件问题；
- **建议修改**：可读性和非阻塞优化；
- **问题**：需要作者解释，不默认阻塞。

作者处理每条意见后回复处理结果，不直接隐藏讨论。所有对话解决后才能合并。

## 11. 合并和发布

常规合并条件：

- 至少一名非作者批准；
- GitHub Actions 全部通过；
- Vercel Preview 验证完成；
- 所有审查对话已解决；
- 数据库/环境变量步骤已完成或有明确发布顺序。

使用 **Squash and merge**。合并后，`main` CI 成功才会由 GitHub Actions 调用 Vercel Deploy Hook。GitHub 部署 Job 成功只表示 Vercel 接受了构建请求；发布者仍须确认 Vercel Production 为 **Ready** 并完成生产冒烟测试，再将 Issue 关闭为 `Done`。

`main` 的 Vercel Git 自动部署已关闭，非 `main` 分支的 Preview 保持开启。合作者无需 Vercel 项目席位，也禁止管理员通过重复或冒充提交改变 Git 作者。标准发布、手动重建、数据库顺序、回滚和故障处理统一遵循 [完整生产发布手册](production-release-runbook.md)。

## 12. 数据库和 Supabase

数据库变更必须：

1. 创建 `supabase/migrations/*`；
2. 禁止只在 Supabase Dashboard 修改生产结构；
3. 更新并提交 `src/lib/supabase/database.types.ts`；
4. 在明确确认的 Staging 项目运行数据库测试；
5. 在 PR 中记录迁移顺序、兼容性和回退方案；
6. 获得另一人明确批准后才能进入 Production。

当前 `npm run supabase:test:remote` 会访问已链接的远程项目，不纳入公共 CI。执行前必须确认 CLI 链接的是 Staging，而不是 Production。

Production Migration 由管理员单人串行执行，必须先运行 `supabase db push --dry-run`；Production 永远不使用 `--include-seed`。数据库和应用发布使用“扩展—启用—清理”多 PR 顺序，详见 [完整生产发布手册](production-release-runbook.md#6-数据库变更的发布链路)。

破坏性数据库变更使用“扩展—迁移—清理”方式：先增加兼容结构，部署兼容代码，最后在单独 PR 中移除旧结构。

## 13. 环境变量和外部服务

- Local 和 Vercel Preview 应使用开发或 Staging 配置，不得使用 Production 服务端 Secret。
- Production 使用独立的 Supabase、Resend 和 Redis 配置。
- Production Secret 只由仓库/平台管理员维护。
- 变量名称和占位符写入 `.env.example`，真实值只保存在平台 Secret 中。
- 新增变量时，PR 必须写明 Local、Preview、Production 三个环境的配置要求。
- 不在聊天、Issue、PR、截图或日志中发送 Secret。

## 14. 紧急修复

生产不可用或存在正在利用的安全问题时，可以缩短流程，但仍应优先创建小型 PR。

如果另一人无法及时响应，仓库管理员可以紧急合并，但必须：

1. 建立带时间线的 Incident Issue；
2. 完成与风险相称的本地验证；
3. 记录部署和回退结果；
4. 在 24 小时内由另一人补做审查；
5. 必要时提交后续修复 PR。

紧急通道不能用于普通截止日期或内容更新。

## 15. Definition of Done

任务只有满足以下条件才算完成：

- Issue 验收条件全部满足；
- 代码、测试、文档和迁移完整；
- CI 通过；
- Preview 已验证；
- 另一人批准；
- 已合并到 `main`；
- 生产部署成功；
- 没有遗漏的秘密、隐私或数据风险；
- 后续工作已建立独立 Issue。

## 16. GitHub 仓库设置

在 `main` 的 Ruleset 或 Branch protection 中启用：

- Require a pull request before merging；
- Require 1 approval；
- Require approval of the most recent reviewable push；
- Require conversation resolution；
- Require status check：`CI / Validate`；
- Block force pushes；
- Block deletions；
- 只启用 Squash Merge。

`@RuikangWNemo` 和 `@gps-china` 已列入 `.github/CODEOWNERS`，`@gps-china` 已接受仓库邀请。启用 **Require review from Code Owners** 后，两人按任务轮换作者与审查者。
