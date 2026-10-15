# 排版、美式英语与并行版本合并

用户报告 Story 底部标题与按钮重叠、Field Notes 英文说明超出，并要求排查相同错误；随后要求核对 worktree、补齐 `programs` 美式拼写，并和另一个工作中的 thread 协调版本。

统一源码提交：`706729a928b700bbe86149b4e668454e28d4ff59`，发布分支 `codex/guardian-coming-soon-2026-10-12`，父提交 `2aafeeb`。守护团任务负责应用核对过的补丁并维护其发布文档，本任务唯一负责最终部署和 promote，杜绝并行切换域名。1053 份源码与隔离构建副本完全一致。

部署：`dpl_Aq7DqdV4YfcMF2fGxafFZ6BDKhQn`，https://rgan-junior-roots-main-n6br35ant-rganjuniors-projects.vercel.app 。已 promote 成功，随后 inspect 确认正式域名 https://www.rganjunior.org 指向该部署。

## 原因与修复

- Story 标题被强制 nowrap：1280px 时文字约 931px，容器只有 557px，侵入按钮列。改为可收缩的双列网格、标题自然换行、按钮自身可换行且图标不被挤压；小屏保持上下排列。
- Field Notes 固定 22rem 的侧栏说明强制 nowrap，1280px 时产生约 133px 页面横向溢出。移除禁止换行规则，为列和子项设置可收缩宽度；精选标题与浏览入口可分行。两个列表共用修复。
- 扩展检查修复首页英文首屏、发起人引言、加入标题和营地统计，以及 Impact 标题/说明、Join 提示固定宽度。中文 Story、Programs 标题、首页文字及 Join 提示在窄屏下的同类问题同时修复。保持正常换行，不通过裁切隐藏问题。
- `Our programmes`、`View all programmes` 和其他可见 `programme(s)` 统一为 `program(s)`；同时补齐实际查到的 `organising`、`practise`、`travelled` 等美式拼写，并使用 `en-US` 日期。已有图片文件名和 URL 不变，避免破坏资源引用。

主工作区中已做过的其他语义翻译和界面改动没有整体带入这次发布；这次发布的是经过源码清单核对的布局与美式拼写补丁。没有宣称所有待确认翻译已经发布。

## 验证证据

- `browser-checks.json`：8 个公开页面 × 中英文 × 1440/1024/768/390px，共 64 组检查。记录正文和标题自身宽度、页面横向宽度、Story 标题与按钮位置关系。已过滤有意横向滑动的轮播、无障碍隐藏说明等，不代表所有交互和动态数据都已验收。
- `built-browser-checks.json`：实际生产构建另做 18 组英文页面检查，全部通过。浏览器确认 `Our programs` 与 `View all programs`，后者链接为 `/programs`。
- 10 个相关测试文件共 48 项通过；应用 TypeScript 检查及改动 TS/TSX 文件 ESLint 通过。没有为 CSS class 名称写实现镜像测试。
- 使用 Node 24.19 在本机运行完整 `vercel build --prod` 成功。先前 Node 20 的试构建已替换，未用于最终发布。没有在共享 ECS 或 GitHub 上构建。
- `source-parity.json`：统一发布提交与本机构建源码逐个 Git 对象哈希相同。
- `upload-checks.json`：上传后 CSS、包含 `Our programs` 的脚本、卓霏照片与本机成品逐字节一致。Vercel 输出确认使用 `.vercel/output` prebuilt 产物。
- 正式站再次核验：Story 标题与按钮分离并实际点击进入 `/programs`；Field Notes 说明在侧栏内换行；首页 `Our programs` 和 `View all programs` 均存在，旧 programmes 文字为 0，实际点击进入 `/programs`；文章链接保留 7 条。390px Story 与 Field Notes 无检测到的越界。截图为 `live-story.png`、`live-field-notes.png`，结构化结果为 `publication.json`。
- 原有 7 篇公开文章、作者功能和 15 项守护团均保留。未改数据库、服务端密钥、共享 ECS 或 OSS。

可复现补丁：`release-source.patch`；20 个变更文件内容：`release-source.tar.gz`；哈希清单：`release-source-manifest.json`。没有打包 `.env`、认证凭据、node_modules 或 Vercel 函数环境。

UI Skills CLI 的 npm wrapper 缺失 runtime lib，替换入口后又遇到 npm 镜像域名解析失败；没有安装新依赖，使用已读取的 baseline-ui 规范完成修复和浏览器检查。

守护团thread独立线上验收已回传通过：15项，超超第2、卓霏第14且唯一、guardian-09保留；点击卓霏详情与旧guardian-08别名均显示同一已加载的upright图，照片目视端正居中，浏览器error日志0。对方独占维护guardian发布文档与统一发布标签，没有另行deploy/promote。
