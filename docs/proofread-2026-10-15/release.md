# 校对与优化发布 · 2026-10-15

## 范围与本机验证

- 落实校对表 63 项反馈，删除加入页“与我们同行 / Walk with us”，完善中英文、移动端首页按钮、身份弹窗和双语姓名输入。
- 修正累计访问统计的旧测试；98 个文件、375 项测试通过。前端、API、后端类型检查通过；Lint 无错误，9 条既有 Fast Refresh 警告。
- 使用 Node.js 24，在本机执行 `vercel build --prod`，12 个函数。Git 自动部署保持关闭，GitHub 只检查源码；没有 ECS 操作。
- Vercel pull 返回空的 Supabase 公开配置；当前线上主脚本也没有连接值。沿用此前已验证发布产物中的同项目公开 URL 与 publishable key，核对项目为 `sronjswselrxewaqfcar` 后注入本机构建。未修改远端服务端密钥。成品确认包含该项目配置且不包含测试域名。
- 源码 SHA-256 清单见 release-source-manifest.json。发布前核对源码与成品，上传时只用 `.vercel/output`。

## 发布与回退

- 目标项目：`rgan-junior-roots-main`，`prj_nGgGhvcbTdwv64yYh7LKn7tfNH0p`。
- 生产域名：<https://www.rganjunior.org>。
- 上一部署：`dpl_577vj5qWeCfEeTiKa8RaiZLBu3zM`，对应应用提交 `ccba5a7`。这是本次发布前的回退目标；其中公开前端配置缺失的问题已如上记录。
- 上传、资源字节核对、正式域名切换及线上浏览器结果在完成后补充于此。

数据库、OSS 未变更。浏览器检查屏蔽统计采集，不提交账号、邮件或业务表单；不将公开页面验证等同于全部后台流程验收。
