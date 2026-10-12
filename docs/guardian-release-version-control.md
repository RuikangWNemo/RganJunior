# 团队资料临时发布与本地整理版本

日期：2026-10-12

## 本地整理版

- 分支：`codex/local-refinement-2026-10-12`
- 整理快照：`d615b6d`；守护团分组合并：`0992ec8`
- 目录：`/Users/hw/Documents/RganJunior/Website/rgan-junior-roots-main`
- 保留已有“影响”“加入我们”、导航等优化，以及原始成员资料占位，供后续整理。

## 临时发布版

- 分支：`codex/guardian-coming-soon-2026-10-12`
- 应用提交：`fcfac79`（包含 `a68d255`、`082a48a`）
- 目录：`/Users/hw/.codex/worktrees/rgan-guardian-release/rgan-junior-roots-main`
- 基线：原生产提交 `1f3857091baf9169e1106a61c14cb6e3fd1553b3`。
- 支持团队、家长守护团已统一为“守护团 / Guardian Circle”，原有 15 张成员照片均保留；移除该区域的“麦昆塔教育”表述，继续显示敬请期待 / Coming soon。
- 青少年共创伙伴：保留真实姓名、照片和故事入口，移除问号和未填写的身份、标题，显示资料整理说明。
- 已发布部署：`https://rgan-junior-roots-main-ciewzuwcu-rganjuniors-projects.vercel.app`
- 部署编号：`dpl_9W3EqeyckdQHmY4PtaYz1QuNrJAp`
- 发布标签：`release/2026-10-12-guardian-circle`
- 正式域名：`https://www.rganjunior.org`
- 上一生产部署：`dpl_D6kgRk4otDLDWymfun7i9wXngCAX`；更早生产部署：`dpl_FrK8HjnV7jNPHQ7AMvjwYciJq5az`。旧发布标签仍保留。
- 当前状态：已切换正式域名并完成中英文浏览器检查。团队区域问号占位为 0，中文版有 18 处“敬请期待”，当前视口无横向溢出，浏览器错误日志为 0。
- 验证：11 项相关测试、应用类型检查、局部 ESLint 检查及本机完整 Vercel 生产构建通过。部署含 12 个原有函数；当前部署的 About 页面脚本与本机构建逐字一致；合并后的守护团包含 15 张照片，正式站仅有“发起人”“青少年共创伙伴”“守护团”三个团队标题。此次验证覆盖团队页面展示，不代表全部后台业务流程已重新验证。

## 后续发布约定

在本地整理分支继续完善资料；就绪后比较两条分支，只将确认发布的内容放入新的发布版本。不要直接用本地工作目录覆盖正式环境。

所有构建在本机完成，只上传已验证的 `.vercel/output` 成品，使用 `vercel deploy --prebuilt --prod --skip-domain`，检查后再 `vercel promote`。不在共享 ECS 或 GitHub 上构建或部署。此次没有操作共享 ECS、数据库或 OSS。

这两条分支目前只保存在本机。仓库仍保留旧的 GitHub 构建与 Deploy Hook 配置；任何未来 Git 推送前，必须先将 CI 限制为代码检查、关闭远程构建与自动部署，并在本机完成该版本构建验证。不得直接触发旧 Deploy Hook。
