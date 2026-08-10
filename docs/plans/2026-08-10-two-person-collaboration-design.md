# RganJunior 双人协作设计

日期：2026-08-10
状态：已确认

## 背景

RganJunior 当前由两个人协作开发。仓库同时包含公共网站、Community 应用、Vercel Functions、Supabase 数据库迁移与权限策略，因此协作流程既要保持轻量，也必须保护生产分支、生产数据和平台密钥。

## 目标

- 两个人可以并行工作而不互相覆盖。
- 每次生产变更都有另一人复核。
- `main` 始终对应可部署的生产基线。
- Pull Request 自动执行代码检查、测试和构建。
- 数据库、环境变量和用户隐私变更获得额外审查。
- 所有重要决策留在 GitHub Issue 或 Pull Request 中。

## 不采用的方案

- 暂不建立长期 `develop` 分支，避免双人团队维护两个长期基线。
- 暂不要求迁移到 GitHub Organization；个人仓库加一名 Collaborator 足够使用。需要机构化所有权或团队扩大时再迁移。
- 暂不在 CI 中运行 `supabase:test:remote`，因为当前命令使用已链接的远程项目，CI 不应接触生产数据库。
- 暂不引入复杂项目管理工具；GitHub Issue、Pull Request 和五个状态足够管理工作。

## 核心决策

1. `main` 是唯一长期分支和生产分支。
2. 所有常规工作从 Issue 开始，使用短期功能分支和 Pull Request。
3. 一人实现，另一人审查；至少一名非作者批准后才能合并。
4. 使用 Squash Merge，合并后删除功能分支。
5. GitHub Actions 在 Pull Request 和 `main` push 上运行 lint、类型检查、测试和构建。
6. 数据库变更只通过迁移文件进入仓库，先在 Staging 验证，再发布到 Production。
7. 两人各自最多保持一个主要开发任务，优先审查对方的 Pull Request。
8. 生产故障允许管理员紧急绕过，但必须留下 Issue、验证记录，并在 24 小时内补做复核。

## 工作流

```text
Backlog -> Ready -> In progress -> Review -> Done
              |           |          |
            Issue       分支/PR     main/生产
```

每项任务对应一个 Issue、一条短分支和一个 Pull Request。Issue 记录目标和验收条件，Pull Request 记录实现、验证结果、风险与回退方案。

## 交付文件

- `CONTRIBUTING.md`：贡献入口和最短操作说明。
- `docs/collaboration/two-person-workflow.md`：完整双人工作规范。
- `.github/ISSUE_TEMPLATE/task.yml`：功能、内容和维护任务模板。
- `.github/ISSUE_TEMPLATE/bug.yml`：缺陷报告模板。
- `.github/pull_request_template.md`：Pull Request 检查清单。
- `.github/CODEOWNERS`：当前仓库负责人；第二位 GitHub 用户名确定后补入。
- `.github/workflows/ci.yml`：不使用生产秘密的基础 CI。

## 成功标准

- 没有人直接向 `main` 提交常规变更。
- 每个已合并 Pull Request 都关联 Issue、通过 CI，并获得另一人批准。
- Vercel Preview 在合并前完成界面验证。
- 数据库变更包含迁移、类型更新、Staging 验证和回退说明。
- Issue、Pull Request、截图和日志中不出现秘密或真实敏感用户数据。
