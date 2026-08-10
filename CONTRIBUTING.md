# 参与 RganJunior 开发

RganJunior 当前采用双人互审工作流。完整规范见 [双人协作规范](docs/collaboration/two-person-workflow.md)，Preview、生产部署、数据库迁移、环境变量和回滚操作统一见 [完整生产发布手册](docs/collaboration/production-release-runbook.md)。

## 最短流程

1. 使用 GitHub Issue 模板创建任务并确认验收条件。
2. 从最新 `main` 创建短分支。
3. 完成修改和本地验证。
4. 尽早建立 Draft Pull Request。
5. 由另一名协作者审查并批准。
6. CI 和 Vercel Preview 通过后 Squash Merge。
7. 合并后等待 `main` CI 和 Deploy Hook，由发布者确认 Vercel Production 为 Ready。
8. 按发布手册完成生产冒烟测试，记录结果并关闭 Issue。

## 分支

```text
feat/<issue>-<name>
fix/<issue>-<name>
content/<issue>-<name>
db/<issue>-<name>
chore/<issue>-<name>
```

常规修改禁止直接提交到 `main`。

## 验证

```bash
npm ci
npm run lint
npm run typecheck
npm run typecheck:app
npm test
npm run build
```

数据库测试只能针对 Staging 项目运行。执行 `npm run supabase:test:remote` 前必须确认 Supabase CLI 没有链接 Production。

## 发布

- 普通生产发布只走 `PR -> main CI -> Deploy production -> Vercel Deploy Hook`。
- 合作者不需要 Vercel 项目席位，也不需要管理员重复或冒充提交。
- GitHub 部署 Job 成功只表示 Vercel 已接受请求；必须继续确认 Production Deployment 为 Ready。
- 手动重建、Rollback、Promote、Supabase Production Migration 和 Secret 轮换只由管理员执行。
- 数据库变更拆成兼容 Migration PR、应用启用 PR，以及必要时的清理 PR。

执行任何生产操作前阅读 [完整生产发布手册](docs/collaboration/production-release-runbook.md)。

## 安全和隐私

- 不提交 `.env.local`、密码、Token、数据库备份或真实用户数据。
- 不在 Issue、PR、日志或截图中展示未脱敏的个人信息。
- 数据库结构和权限变化必须通过 `supabase/migrations/`。
- 新增环境变量时同步更新 `.env.example`，真实值只保存到平台 Secret。
