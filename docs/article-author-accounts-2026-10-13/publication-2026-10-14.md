# 文章合并与正式发布

用户要求将已导入草稿与现有发起人文章合并并公开。四篇发起人故事复用稳定 slug，由数据库统一管理；营地回顾和橙子来信为两篇新增文章。原有邀请信继续展示，公开列表共 7 篇。六篇数据库文章均为 `published/public/featured`，其余 6 篇私密草稿与 6 篇私密归档保持原状态。未删除文章，未用导入内容覆盖管理员后续编辑。

正式地址：https://www.rganjunior.org/field-notes/all

部署：`dpl_ubWZJydKxZoR2JjsnwNw382R4X9Y`，对应 https://rgan-junior-roots-main-no3kfoynw-rganjuniors-projects.vercel.app 。CLI 提升成功，随后通过正式域名 inspect 确认指向本部署。上一部署为 `dpl_5jDmAtpdSTSACncjGZNGS9fnWjgC`。

## 发布范围与方式

从线上基线 `307a37d` 在 `/tmp/rgan-articles-publish-20261014` 创建隔离副本，加入文章作者管理、真实作者查询、公开署名补全、文章合并及旧链接跳转，以及两个新增图片目录。保留基线的首页、导航、守护人和英文原文，没有整体带入主工作区其他未发布改动。依赖 lockfile 与基线一致，复用本机已安装依赖，执行本机 `vercel build --prod`。上传命令为 `deploy --prebuilt --prod --skip-domain`，随后使用 `promote` 切换正式域名。Vercel 输出确认使用 `.vercel/output` 预构建制品。

本次拉取到本地的生产环境文件中 Supabase 配置为空，因此构建时显式注入正确的公开 Supabase URL 与启用的 publishable key；未获取或更换服务端密钥。生产运行时的私密环境设置沿用项目已有配置。独立部署地址受到 Vercel 保护，使用已有 CLI 身份读取应用壳及新增 WebP 图片，未修改保护设置。

源码差异与哈希见 `release-files-manifest-2026-10-14.json`，可复现补丁和新增素材见 `release-source-2026-10-14.tar.gz`。包内没有 `.env`、认证凭据、node_modules 或 Vercel 函数环境。

## 数据和权限

迁移版本已与云端对齐：`20261014021500_article_author_accounts`、`20261014025645_published_article_author_credits`。后一项只为公开文章返回署名字段，以免未注册作者因人物档案私密而丢失署名；不改变 People 资料的公开设置。

六篇均使用现有管理员授权上下文依次执行 `draft → submitted → in_review → approved → published`，同事务公开并设为精选。正文 MD5 与导入记录完全一致。Nate 现有帐号关联两篇；其余作者为待绑定档案，注册后由管理员核实身份并关联，不按昵称自动认领。

## 验证与限制

- 10 个相关测试文件共 42 项通过，应用和 API 类型检查通过，本机完整生产构建成功。
- 本机隔离 PostgreSQL 16 应用全部迁移和 seed 后，文章作者授权测试通过，包含匿名公开署名、私密人物资料不可读、私密草稿署名不可读。使用最小 Auth/Storage/Realtime 兼容对象，并非完整 Supabase 托管环境。测试实例已停止。
- 正式站浏览器确认公开列表 7 篇，Nate 两篇及其他作者署名正确，Nate 旧地址跳转统一文章地址，原有英文正文与原文链接保留。
- 六篇的 100 个图片引用均通过正式站 HEAD 检查并返回图片内容类型；浏览器抽查新文章封面与首屏正文图片。未声称所有图片都逐张滚动验收。
- Nate 真实帐号上下文的数据库查询已验证，未代替本人登录 UI 验收；未来作者仍需管理员绑定。旧数据库测试 010/013 的既有失败和范围见 verification.md。
- 构建、依赖和图片处理均在本机进行。未操作共享 ECS、Lholho 数据库或 OSS。

结构化发布结果：`publication-2026-10-14.json`；图片检查：`live-images-2026-10-14.json`；页面截图：`published-articles-2026-10-14.png`。
