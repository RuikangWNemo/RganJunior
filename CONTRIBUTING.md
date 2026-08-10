# 参与 RganJunior 开发

RganJunior 当前采用双人互审工作流。完整规范见 [双人协作规范](docs/collaboration/two-person-workflow.md)。

## 最短流程

1. 使用 GitHub Issue 模板创建任务并确认验收条件。
2. 从最新 `main` 创建短分支。
3. 完成修改和本地验证。
4. 尽早建立 Draft Pull Request。
5. 由另一名协作者审查并批准。
6. CI 和 Vercel Preview 通过后 Squash Merge。
7. 确认生产部署成功，关闭 Issue。

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

## 安全和隐私

- 不提交 `.env.local`、密码、Token、数据库备份或真实用户数据。
- 不在 Issue、PR、日志或截图中展示未脱敏的个人信息。
- 数据库结构和权限变化必须通过 `supabase/migrations/`。
- 新增环境变量时同步更新 `.env.example`，真实值只保存到平台 Secret。
