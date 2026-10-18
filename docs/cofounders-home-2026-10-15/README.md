# 共同发起人及首页文案更新 · 2026-10-15

> 历史发布记录：2026-10-18 用户确认该团队称“共创伙伴 / Co-creators”，本页中的 Co-founders 不再是当前约定。见 [版本排查](../version-audit-2026-10-18.md)。

- 关于页顺序：发起人 → 共同发起人（张天时、Rosie Chen、Ruby Huang）→ 营地伙伴 → 守护团。
- 恢复三人独立卡片，复用已公开的照片、简介与资料链接；在营地伙伴区域不重复展示。
- Home 页 Nate 照片旁英文标题及无障碍名称统一为 “What began as one young person's growth has gradually become collective actions.”。
- 应用提交：`7093ae0e11b55708bf7f26265080989bf351f6ea`，已推送 main。
- 生产部署：`dpl_HrthdL9RLgRzZ5a2A5k3WwFwjQ4h`，READY；正式域名 https://www.rganjunior.org。
- 前一可回退部署：`dpl_37s3icpFjMTBYJ4ZNBwo7ngVqNyG`。

## 验证

相关 3 个测试文件、17 项测试通过；应用类型检查和修改文件 ESLint 通过。本机执行 `vercel build --prod`，确认同项目公开配置与 12 个函数；仅上传预构建成品。GitHub 不构建部署，没有 ECS 操作。

本机和正式站分别验证中英文 × 1440 / 390px：首页英文可见文案及无障碍名称、关于页四个分组顺序、三位共同发起人的照片与链接、无重复营地卡片、无横向溢出和页面脚本错误；手机端另外打开三人的中英文资料页。

暂存部署和正式域名均验证 9 份关键资源 SHA-256 与本机成品一致；公开汇总 API、方法限制与旧文章 308 跳转正常。浏览器测试屏蔽统计采集，没有提交账号、邮件或业务表单，没有数据库与 OSS 修改。
