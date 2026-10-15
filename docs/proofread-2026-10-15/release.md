# 校对与优化发布 · 2026-10-15

## 范围与本机验证

- 落实校对表 63 项反馈，删除加入页“与我们同行 / Walk with us”，完善中英文、移动端首页按钮、身份弹窗和双语姓名输入。
- 修正累计访问统计的旧测试；98 个文件、376 项测试通过。前端、API、后端类型检查通过；Lint 无错误，9 条既有 Fast Refresh 警告。
- 使用 Node.js 24，在本机执行 `vercel build --prod`，12 个函数。Git 自动部署保持关闭，GitHub 只检查源码；没有 ECS 操作。
- Vercel pull 返回空的 Supabase 公开配置；当前线上主脚本也没有连接值。沿用此前已验证发布产物中的同项目公开 URL 与 publishable key，核对项目为 `sronjswselrxewaqfcar` 后注入本机构建。未修改远端服务端密钥。成品确认包含该项目配置且不包含测试域名。
- 源码 SHA-256 清单见 release-source-manifest.json。发布前核对源码与成品，上传时只用 `.vercel/output`。

## 发布与回退

- 目标项目：`rgan-junior-roots-main`，`prj_nGgGhvcbTdwv64yYh7LKn7tfNH0p`。
- 生产域名：<https://www.rganjunior.org>。
- 上一部署：`dpl_577vj5qWeCfEeTiKa8RaiZLBu3zM`，对应应用提交 `ccba5a7`。这是本次发布前的回退目标；其中公开前端配置缺失的问题已如上记录。
- 应用提交：`67b73e1d7f5c88218ee908550bf3ace80046ec9a`，已推送 `main`。
- 生产部署：`dpl_37s3icpFjMTBYJ4ZNBwo7ngVqNyG`，READY。先 `vercel deploy --prebuilt --prod --skip-domain`，核验暂存部署后将同一成品 `vercel promote`；正式域名再次查询确认该 ID。
- Vercel 发布日志明确使用 `.vercel/output` 预构建成品，没有远端应用构建。
- 本机与正式站各检查 12 页 × 中英文 × 1440 / 390px，共各 48 组；验证加入页删除文案、三个身份弹窗、首页按钮内容边界、CTB 论文题名及链接、注册前身份与年龄步骤、真实文章校对。页面脚本错误与横向溢出均为 0。
- 正式站另有 6 组累计访问检查（1440 / 768 / 390px × 双语），均显示真实 API 的累计 PV，保持单项指标，不把会话数当 PV。
- 暂存部署与正式域名的 index.html、主 JS/CSS 以及 About、Actions、Impact、ParticipantDirectory、JoinUs、ImpactAwards 共 9 份资源，SHA-256 均与本机一致；1,250 份源码与发布快照一致。
- 真实访问汇总 API 四字段通过；汇总 POST / 采集 GET 返回 405；两项旧文章链接返回 308 且保留查询参数。
- 验证结果见 local-real-browser.json、production-real-browser.json、production-impact-browser.json、staged-upload-verification.json 和 production-upload-verification.json。成品摘要见 artifact-summary.json。
- 后续发布必须先确认 VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY 非空并属于本项目，再本地构建与浏览器验证；不能把 pull 返回的空值直接发布。

数据库、OSS 未变更。浏览器检查屏蔽统计采集，不提交账号、邮件或业务表单；不将公开页面验证等同于全部后台流程验收。
