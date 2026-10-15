# 团队资料临时发布与本地整理版本

更新：2026-10-15（本地完善与已上线历史已统一并发布）

## 当前唯一正式版本

- 主目录已切换到 `main`，与 GitHub 主分支对齐。应用提交 `bee96c4`；正式标签 `release/2026-10-15-unified-website`。
- 正式部署 `dpl_GCrgP3N6uEWaUkPSJhC86W7eMksv`，域名 `https://www.rganjunior.org`。源码、预构建上传和正式域名资源哈希一致。
- 包含已上线的文章、导航、图片优化、守护团资料及本地新增的营地伙伴名录、共创方向、加入说明和 Impact 改版/真实累计访问。
- 上一可回退应用 `f7a1ff0`，部署 `dpl_pQgBAicRoRRq9knbZ27knfihdZKD`，标签 `release/2026-10-15-before-unified`。
- 两个旧发布 worktree 的源码、分支和环境文件继续保留作为历史参考，可重建的依赖和构建输出已清理；两个目录已不存在的临时 worktree 记录已移除。后续开发、发布从最新 `main` 开始，不从旧发布目录覆盖正式站。
- 372 项测试、两组类型检查、代码 lint、GitHub CI、本机 Vercel 生产预构建、44 组正式站浏览器检查通过。完整证据见 [统一发布记录](unified-release-2026-10-15/verification.md)。

以下各日期条目保留历史背景；其中的“当前”仅指对应发布当时。

## 本地整理版

- 分支：`codex/local-refinement-2026-10-12`
- 整理快照：`d615b6d`；守护团分组合并：`0992ec8`；统一轮播与名录：`2321118`；三位成员照片与姓名：`f406aa4`；新增卓霏与恢复超超：`9707a98`；卓霏去重与调正：`d8bab9e`
- 目录：`/Users/hw/Documents/RganJunior/Website/rgan-junior-roots-main`
- 保留已有“影响”“加入我们”、导航等优化，以及原始成员资料占位，供后续整理。

## 临时发布版

- 分支：`codex/guardian-coming-soon-2026-10-12`
- 当前正式应用提交：`629614c`（基于 `0ae0b4c`，补齐457条可配对英文修正及五位作者头像）；历史统一提交：`706729a`（包含 `2aafeeb`、 `a4b8a9a`、`307a37d`、 `a86ad2a`、 `57586a8`、`fcfac79`、`a68d255`、`082a48a`）
- 目录：`/Users/hw/.codex/worktrees/rgan-guardian-release/rgan-junior-roots-main`
- 基线：原生产提交 `1f3857091baf9169e1106a61c14cb6e3fd1553b3`。
- 支持团队、家长守护团已统一为“守护团 / Guardian Circle”，保留贺超超，卓霏替换原 `guardian-08` 而非新增重复项，共 15 张照片使用同一份名单，统一轮播、不分组；移除该区域的“麦昆塔教育”表述，未完善资料继续显示敬请期待 / Coming soon。
- 新增全部成员页 `/about/guardians` 与个人详情页 `/about/guardians/:memberId`；照片和详情入口可点击；悬停暂停轮播，避免点击时照片移走。
- 青少年共创伙伴：保留真实姓名、照片和故事入口，移除问号和未填写的身份、标题，显示资料整理说明。
- 守护团单独预构建部署（已被并行文章发布覆盖，非最终正式版本）：`https://rgan-junior-roots-main-n1afu92i1-rganjuniors-projects.vercel.app`
- 守护团与文章合并预部署（尚未切换正式）：`dpl_6LXsvcN2iiNDsiTD5dcRkzuwF5MS`，`https://rgan-junior-roots-main-dbnrs9x5m-rganjuniors-projects.vercel.app`
- 历史统一部署：`dpl_Aq7DqdV4YfcMF2fGxafFZ6BDKhQn`，`https://rgan-junior-roots-main-n6br35ant-rganjuniors-projects.vercel.app`。已包含卓霏去重、文章功能及英文布局修正。
- 最终发布标签：`release/2026-10-14-guardian-layout-unified`（指向 `706729a`）。
- 正式域名：`https://www.rganjunior.org`
- 上一生产部署：`dpl_ubWZJydKxZoR2JjsnwNw382R4X9Y`（文章发布版）；此前部署：`dpl_5jDmAtpdSTSACncjGZNGS9fnWjgC`（标签 `release/2026-10-14-guardian-roster`）；此前部署：`dpl_qmzkkvryLsvxrkjhmChyE9j5p7rm`（标签 `release/2026-10-13-guardian-portraits`）；此前部署：`dpl_4xr2Ymeg1dxW6mGe13BvkCjH6TKB`（标签 `release/2026-10-12-guardian-directory`）；此前部署：`dpl_9W3EqeyckdQHmY4PtaYz1QuNrJAp`（标签 `release/2026-10-12-guardian-circle`）；更早生产部署：`dpl_D6kgRk4otDLDWymfun7i9wXngCAX`、`dpl_FrK8HjnV7jNPHQ7AMvjwYciJq5az`。旧发布标签仍保留。
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

## 10 月 14 日卓霏去重与照片调正

- 用户确认原位置前两格的单人照片与新增卓霏是同一人。用新照片替换原 `guardian-08`，移除末尾重复条目；卓霏现在第14位，总数15，贺超超仍在第2位，其余顺序保留。
- 详情使用 `/about/guardians/zhuo-fei`；旧 `/about/guardians/guardian-08` 作为别名继续打开同一份资料。
- 使用内置 imagegen 工具生成调正、居中的4:5照片，文件为 `public/images/about/guardians/zhuo-fei-20261014-upright.png`；原始PNG继续保留。此次为 AI 图像编辑，不能视为无像素变化的机械旋转。
- 编辑提示词：仅修正轻微倾斜并裁为自然端正、居中的4:5肖像，保留头部、肩膀和躯干；保留人物身份、五官、年龄、皮肤纹理、笑容、眼镜、头发、黑色外套与标识、光线及雪山田野背景；不美化、不改表情、不替换背景、不增加物体、无边框。
- 发布提交 `a4b8a9a`，本地同步提交 `d8bab9e`。17项相关测试、应用类型检查、局部ESLint与本机完整Vercel生产构建通过；更换最终照片路径后，详情相关6项测试再次通过。
- 本机浏览器检查15项名录、卓霏原位置及唯一性、照片端正居中和点击详情；上传后名单脚本、详情脚本及照片与本机构建逐字一致。无共享ECS、数据库或OSS操作。

## 并行发布合并记录

- 线上复核发现文章任务稍后部署了 `dpl_ubWZJydKxZoR2JjsnwNw382R4X9Y`（`no3kfoynw`），其基线仍为 `307a37d`，所以覆盖了卓霏去重修正。未通过手工域名映射强行回退文章版本。
- 将文章发布清单中的59个文件逐一校验SHA-256后纳入隔离发布分支，保持已上线文章、作者功能和图片；同时保留本次卓霏修正。文章已上线的公开客户端配置也沿用，未修改服务端密钥或云端数据。
- 后续发布应从最新正式部署的合并源代码开始，避免不同任务分别从旧基线发布。

## 单一发布者协调

- 用户在任务 `01a133d0-2f7d-7252-991c-5a3debb0e07c` 明确授权两个任务协同处理版本冲突。
- 统一源码基线：`2aafeeb`，守护团修正加当前线上文章功能。最终已发布源码：`706729a928b700bbe86149b4e668454e28d4ff59`，已合并布局任务提供的20文件补丁，逐一SHA256与其发布清单一致，发布工作区干净。合并版55项相关测试、类型检查、本机生产构建通过；5份上传脚本/照片逐字一致。
- 由文章/英文布局任务唯一负责加入布局与美式 programs 修正，并完成最终本机构建和正式 promote。本守护团任务不再执行 promote，只负责守护团核验及版本记录。
- 预部署 `dpl_6LXsvcN2iiNDsiTD5dcRkzuwF5MS` 未包含随后进行的英文布局补丁，不应直接上线。
- 公开构建配置必须沿用文章正式版的两项 VITE_SUPABASE 值，避免空环境值造成公开文章查询失效；不改服务端私密配置。

## 最终正式站核验

- 统一版本 `706729a` 已由唯一发布任务完成本机预构建上传和 promote；其发布证据保存在 `docs/layout-overflow-2026-10-14/`。1053份源码与其构建副本哈希一致。
- 守护团任务已独立打开正式站核验：名录恰好15项，贺超超第2、卓霏第14且仅一项、guardian-09第15；相关照片实际加载成功，目视检查卓霏照片端正居中。
- 实际点击卓霏卡片可进入新详情路径；旧 `guardian-08` 直达链接继续显示同一份卓霏资料和1122×1402的新照片。介绍仍为 Coming soon；本次页面浏览器error日志0。
- 核验范围为守护团名单、照片和个人导航；其他布局与文章页面由发布任务分别验证，不代表全部后台业务重新验收。本任务在统一发布约定后没有再次部署或 promote。

## 后续发布约定

在本地整理分支继续完善资料；就绪后比较两条分支，只将确认发布的内容放入新的发布版本。不要直接用本地工作目录覆盖正式环境。

所有构建在本机完成，只上传已验证的 `.vercel/output` 成品，使用 `vercel deploy --prebuilt --prod --skip-domain`，检查后再 `vercel promote`。不在共享 ECS 或 GitHub 上构建或部署。此次没有操作共享 ECS、数据库或 OSS。

这两条分支目前只保存在本机。仓库仍保留旧的 GitHub 构建与 Deploy Hook 配置；任何未来 Git 推送前，必须先将 CI 限制为代码检查、关闭远程构建与自动部署，并在本机完成该版本构建验证。不得直接触发旧 Deploy Hook。

## 10 月 14 日英文校正与田野笔记头像

- 当前正式部署：`dpl_3rT93CBPYK8oQkSNvjdgFeQbqsET`，应用提交 `629614c`，标签 `release/2026-10-14-English-author-portraits`。
- 正式域名已核验：英文主句及Life Immersion Camp更新、五位作者本人照片成功加载，橙子筛选正确，七篇文章保留。
- 上一正式部署：`dpl_NVzonfJkCY6KNWhyXfF2NVuJzNNV`，提交 `0ae0b4c`；可回退。
- 源码清单与验证见 `docs/translation-avatar-release-2026-10-14/`。本地整理版继续保留未发布页面优化，发布不运行远端构建或数据库写入。

## 10 月 14 日三类入口与联合邀请信

- 最新正式版应用提交 `a8cb91b`，部署 `dpl_J7j8K4td3nu8YKMumUddHqVqFyZg`，标签 `release/2026-10-14-join-roles-invitation`。
- 首页和加入页统一三类及小橘子；联合邀请信增加双头像、短人物入口名和专属列表卡片，正文保留完整署名和封面。
- 上一版本 `629614c` / `dpl_3rT93CBPYK8oQkSNvjdgFeQbqsET` 可用于回退。验证记录见 `docs/join-invitation-release-2026-10-14/`。
- 与图片优化任务协调后，仅本任务发布；主目录已精确合并本次增量并保留其未发布的图片优化。后续发布必须基于a8cb91b或更新版。

## 10 月 15 日社区故事路径与导航修复

- 应用提交 `f7a1ff0` 基于已发布WebP版本；正式部署 `dpl_pQgBAicRoRRq9knbZ27knfihdZKD`。
- 公开故事链接统一 `/community-stories`，旧 `/field-notes` 保留308及客户端后备跳转；语言切换重新定位悬停框，手机菜单默认折叠并按栏目展开。
- 335项测试、本机类型检查、lint（0错误）、本机预构建通过；发布核验记录见 `docs/navigation-release-2026-10-15/`。主目录精确合并并保留未发布整理，类型检查通过。
- 上一正式版 `836cd70` / `dpl_8pctJRcZpLFNGrRjCjyHVo3sA6Vx` 可回退。本次无远程构建、Git推送、ECS、OSS或数据库写入。
