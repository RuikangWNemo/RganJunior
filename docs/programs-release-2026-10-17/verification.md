# 白屏修复与营期管理联合发布（2026-10-17）

## 已上线

- 正式网站：https://www.rganjunior.org 。最终应用提交 `49aeb4f42df9ea85a111ccb1338b3bf667d55e9d`；部署 `dpl_A6ivCPYYoBKzAKmhgBUkgaHB6ZBL`，READY、production、prebuilt。正式域名 inspect 已确认指向此部署。
- 营期入口：https://www.rganjunior.org/community/admin/programs 。超级管理员可使用；其他工作人员由超级管理员在会员与授权分配「营期编辑」。未给任何新用户增加权限。
- 数据库迁移已通过 Supabase MCP 应用，实际版本为 `20261017085040_program_sessions`；本地文件已同步版本，防止后续重复迁移。
- 4 个主题分类、1 条已公开历史共创营，2 张现有照片、3 条原始招募／回顾链接。未编造未来排期或确切历史日期。

## 验证

- 本机 Node 24：105 个测试文件、406 项测试通过；应用／API／后端类型检查通过；Lint 0 错误、11 条 Fast Refresh 提示。最终提交 GitHub CI 通过，仅检查源码，不构建部署。
- 本机生产 Vercel build 完成，12 个函数；只上传 `.vercel/output`，再 promote 同一生产成品。源码逐文件与提交比对；产物 SHA-256 在 release.json。
- 暂存 HTML 和主脚本逐字节与本机一致；最终正式域名 HTML 与本机一致。正式营期详情在浏览器读取真实 Supabase 数据，图片均加载成功。
- 数据库：两张业务表 RLS 开启；program-media 为私有桶（10 MB；JPG/PNG/WebP）；匿名无插入权限；现有超级管理员的营期草稿写入、匿名草稿隐藏、发布后公开读取均通过真实数据库事务验证，事务最后回滚，验证记录残留为 0。
- 正式中文首页→项目→浏览器后退：首页恢复、scrollY=0、main opacity=1；前进后四个项目均显示营期组件。中英切换和 390px 手机营期详情无横向溢出，两张图片正常。
- 原始营地邀请链接实际打开已发布文章。未登录访问营期后台转到登录页面，未泄露管理表单。当前浏览器无登录的管理员会话。
- 白屏慢加载与文件下载失败恢复路径已在本机生产成品测试，详见 ../white-screen-fix-2026-10-17/verification.md；无 Windows 实机，不能视为所有 Windows 浏览器完全验证。
- 生产管理员真实登录后的上传→发布→撤回完整 UI 流程尚未实测；本地 UI 流程与真实数据库权限分别已验证，不能混称为生产端到端验收。

## 发布中发现并处理的问题

首次部署因 Vercel pull 未返回 sensitive 类型的公开 Supabase 配置，浏览器无法读取活动；发现后立即恢复上一稳定部署。随后仅获取公开浏览器配置、修复本机配置，增加生产 prebuild 非空／项目校验，重新本机构建，用真实数据浏览器验证后再次发布。旧失败部署未作为回退目标。

## 回退与保留

- 网站回退目标：`dpl_1jzaJt4xNuuHoX7g9bDryjGpnniF`。新增迁移兼容旧版；网站回退时保留营期表和照片，勿删除数据库或存储内容。
- 工作区原有未提交字体改动继续留在 src/index.css，未混入这次发布。
- 未访问共享 ECS，未在 ECS 或 GitHub 构建、部署；未操作 Lholho 或 OSS。
- CLI 在准备目录时自动建立的空临时 Vercel 项目已核实零部署并清理，正式项目未被删除。
