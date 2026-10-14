# 团队资料临时发布与本地整理版本

更新：2026-10-14（新增卓霏，恢复贺超超）

## 本地整理版

- 分支：`codex/local-refinement-2026-10-12`
- 整理快照：`d615b6d`；守护团分组合并：`0992ec8`；统一轮播与名录：`2321118`；三位成员照片与姓名：`f406aa4`；新增卓霏与恢复超超：`9707a98`
- 目录：`/Users/hw/Documents/RganJunior/Website/rgan-junior-roots-main`
- 保留已有“影响”“加入我们”、导航等优化，以及原始成员资料占位，供后续整理。

## 临时发布版

- 分支：`codex/guardian-coming-soon-2026-10-12`
- 应用提交：`307a37d`（包含 `a86ad2a`、 `57586a8`、`fcfac79`、`a68d255`、`082a48a`）
- 目录：`/Users/hw/.codex/worktrees/rgan-guardian-release/rgan-junior-roots-main`
- 基线：原生产提交 `1f3857091baf9169e1106a61c14cb6e3fd1553b3`。
- 支持团队、家长守护团已统一为“守护团 / Guardian Circle”，恢复贺超超并新增卓霏，共 16 张照片使用同一份名单，统一轮播、不分组；移除该区域的“麦昆塔教育”表述，未完善资料继续显示敬请期待 / Coming soon。
- 新增全部成员页 `/about/guardians` 与个人详情页 `/about/guardians/:memberId`；照片和详情入口可点击；悬停暂停轮播，避免点击时照片移走。
- 青少年共创伙伴：保留真实姓名、照片和故事入口，移除问号和未填写的身份、标题，显示资料整理说明。
- 已发布部署：`https://rgan-junior-roots-main-a4j80iw8p-rganjuniors-projects.vercel.app`
- 部署编号：`dpl_5jDmAtpdSTSACncjGZNGS9fnWjgC`
- 发布标签：`release/2026-10-14-guardian-roster`
- 正式域名：`https://www.rganjunior.org`
- 上一生产部署：`dpl_qmzkkvryLsvxrkjhmChyE9j5p7rm`（标签 `release/2026-10-13-guardian-portraits`）；此前部署：`dpl_4xr2Ymeg1dxW6mGe13BvkCjH6TKB`（标签 `release/2026-10-12-guardian-directory`）；此前部署：`dpl_9W3EqeyckdQHmY4PtaYz1QuNrJAp`（标签 `release/2026-10-12-guardian-circle`）；更早生产部署：`dpl_D6kgRk4otDLDWymfun7i9wXngCAX`、`dpl_FrK8HjnV7jNPHQ7AMvjwYciJq5az`。旧发布标签仍保留。
- 10 月 12 日验证记录：已切换正式域名。正式站统一轮播有 14 张照片、14 个详情链接；全部成员页有 14 个条目；移除的姓名及照片未出现在展示区域，团队问号占位为 0。正式站名录 → 详情 → 返回名录 → 返回关于页 → 名录入口已核验，浏览器错误日志为 0。
- 10 月 12 日验证：18 项相关测试、应用类型检查、局部 ESLint 检查及本机完整 Vercel 生产构建通过。本机浏览器检查中英文、390px 手机端名录和详情无横向溢出，并验证轮播链接；上传后的 About 与 GuardianDirectory 脚本、详情直达页面与本机构建逐字一致。Vercel 日志确认使用 `.vercel/output` 预构建成品。此次验证覆盖团队展示与成员导航，不代表全部后台业务流程已重新验证。

## 10 月 13 日照片更新，10 月 14 日补充线上核验

- 木兰：上传照片 1，替换 `guardian-05`（原摊晾茶叶照片）；茶精灵：照片 2，替换 `guardian-02`（原戴帽子的照片）；大玉米：照片 3，替换 `guardian-03`（原蓝色上衣举手照片）。
- 保留 14 个条目、原顺序及原有详情链接。原图完整保存，未作 AI 重绘或像素调色；木兰卡片用 CSS 收紧构图，三人的详情页使用完整原图比例，介绍仍为敬请期待。
- 发布前：14 项相关测试、应用类型检查及局部 ESLint 通过；本机完整 Vercel 生产构建成功。此前磁盘不足导致的构建失败没有用于发布。部署使用预构建成品，上传后目录脚本与木兰图片和本机文件逐字一致，随后 promote 成功。
- 10 月 14 日：正式站显示正确的三组姓名、图片与原详情链接；实际打开大玉米详情并返回名录，图片加载成功、完整原图比例保留。本地此前已检查三张照片布局与木兰详情。这些检查不代表全部后台业务已验证。
- 原图和用户确认记录保存在 `docs/guardian-photo-review-2026-10-13/`。本地其他正在进行的修改不属于本次发布。

## 10 月 14 日新增卓霏与恢复超超

- 卓霏新增为 `/about/guardians/zhuo-fei`，采用用户重新上传的 PNG 原图。卡片为 4:5，取景位置 63% 50%，人物头部完整；详情展示完整 4:3 横图。未使用 AI 重绘。
- 贺超超恢复至赵璟之后，使用原照片 `/images/about/adult-support/adult-support-02.webp`，详情路径 `/about/guardians/he-chaochao`；两位介绍仍为敬请期待。
- 发布提交 `307a37d`；本地同步提交 `9707a98`。本地 About 测试只暂存本次补丁，其他任务修改保留未发布。
- 16 项相关测试、应用类型检查、局部 ESLint、本机完整生产构建通过；本机检查16条名录、照片加载、卓霏裁切和完整横图，以及超超详情。上传后目录脚本与卓霏原图和本机构建逐字一致，随后 promote 成功。
- 正式站名录已核验为16条，包含两位的详情链接，并实际打开卓霏详情。未重新验证全部后台业务。

## 后续发布约定

在本地整理分支继续完善资料；就绪后比较两条分支，只将确认发布的内容放入新的发布版本。不要直接用本地工作目录覆盖正式环境。

所有构建在本机完成，只上传已验证的 `.vercel/output` 成品，使用 `vercel deploy --prebuilt --prod --skip-domain`，检查后再 `vercel promote`。不在共享 ECS 或 GitHub 上构建或部署。此次没有操作共享 ECS、数据库或 OSS。

这两条分支目前只保存在本机。仓库仍保留旧的 GitHub 构建与 Deploy Hook 配置；任何未来 Git 推送前，必须先将 CI 限制为代码检查、关闭远程构建与自动部署，并在本机完成该版本构建验证。不得直接触发旧 Deploy Hook。
