# WebP 正式发布记录

正式站：https://www.rganjunior.org

应用提交：`836cd70b90711425e422b62ace7f00a6c68e7d23`；最低发布基线：`d3675c5`，已完整包含其六个栏目改名文件，以及 `a8cb91b` 的三类称呼、小橘子和联合邀请信双头像。

部署：`dpl_8pctJRcZpLFNGrRjCjyHVo3sA6Vx`，已正式 promote，Vercel READY。团队 `rganjuniors-projects` 为 Hobby，没有升级套餐或增加图片处理服务。

129 张公开图片映射、315 个静态 WebP 候选；默认候选合计约从 92.50 MB 降到 20.30 MB。该数字不是页面提速比例。图片生成、Node 24 生产构建均在本机完成，仅上传 `.vercel/output`，平台确认使用 prebuilt。

331 项测试、app/backend/API 类型检查通过；lint 0 errors、9 个既有 warnings；本机构建通过。全部候选均解码检查，上传的 11 份关键 HTML/脚本/CSS/图片逐字节匹配。

正式浏览器核验：项目页五张 WebP 正常解码；“社区故事”导航存在；联合邀请信两张头像及五个 WebP 图片节点存在；加入页守护团/合作伙伴名称与三个小橘子存在，抽查 console error 为 0。另一发布任务独立确认社区故事导航、页面与浏览器标题，以及七篇文章。未把这些抽查宣称为全部后台业务验收。

首次本地 Vercel pull 中两项公开浏览器配置为空，失败构建未发布；复用已发布基线的本机公开 URL 和 publishable/anon 参数后重建，未复制服务端 Secret 或修改远端配置。首次 CLI promote 团队范围校验失败，域名未切；核实真实项目/team.id 后显式 `--scope rganjuniors-projects`，最终成功。

保留原图，不改数据库、OSS或共享 ECS，不推送 GitHub。主目录保留所有并行任务修改。独立发布源码保存在 `/Users/hw/.codex/worktrees/webp-release/rgan-junior-roots-main`；后续发布应从此应用提交或其后代精确合并，避免回退 WebP 与已确认文字。

上一正式部署：`dpl_J7j8K4td3nu8YKMumUddHqVqFyZg`，可作为已知回退版本。改名专用预部署 `dpl_FtCu3FRhDbqJcQU2Li5hqyNSqJ97` 与先前 WebP 预部署 `dpl_BCmNdQwsjxuuU4fCDui3F7jsw4Ak` 未被 promote。

详见 publication.json。截图位于 outputs/image-loading-audit-2026-10-14/webp-production.jpg。
