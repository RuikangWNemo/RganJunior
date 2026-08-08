# 行动页经营性产品实现计划

1. 建立行动产品的双语内容模型与集中联系方式配置，覆盖三个产品、营期方案、三个月行动节奏、公共议题和状态信息。
2. 重构 `/actions`，用 Nate 第一人称邀请、三产品概览和三个锚点章节完整替换活动档案。
3. 为桌面和手机导航增加“行动”次级菜单，支持当前章节状态和跨路由锚点跳转，同时保留工作区已有的 About 与发起人故事改动。
4. 新增 `/actions/inquiry` 页面和独立轻量意向表单，根据 `program` 参数预选产品并提供邮件兜底。
5. 新增 `/api/action-inquiry`，使用独立的 Google Form 环境变量、校验和可选通知 webhook。
6. 更新路由元信息、站点地图和页面外壳规则，保证新页面与现有站点一致。
7. 增加行动页、导航、意向页和接口的定向测试；运行完整测试、Lint 和生产构建。
8. 启动本地站点，在桌面与 390px 手机视口验证视觉、锚点、菜单、表单和横向溢出。

## 上线配置

当前直接咨询始终可通过 `contact@rganjunior.org` 使用。电话、微信号和微信二维码在 `src/lib/contact.ts` 集中配置。

轻量意向表单需要配置独立的 Google Form 环境变量：

- `ACTION_INQUIRY_GOOGLE_FORM_ACTION_URL`
- `ACTION_INQUIRY_GOOGLE_FORM_ENTRY_PROGRAM`
- `ACTION_INQUIRY_GOOGLE_FORM_ENTRY_NAME`
- `ACTION_INQUIRY_GOOGLE_FORM_ENTRY_PARTICIPANT_PROFILE`
- `ACTION_INQUIRY_GOOGLE_FORM_ENTRY_CITY`
- `ACTION_INQUIRY_GOOGLE_FORM_ENTRY_PREFERRED_TIME`
- `ACTION_INQUIRY_GOOGLE_FORM_ENTRY_PARTY_SIZE`
- `ACTION_INQUIRY_GOOGLE_FORM_ENTRY_CONTACT`
- `ACTION_INQUIRY_GOOGLE_FORM_ENTRY_QUESTION`
- `ACTION_INQUIRY_GOOGLE_FORM_ENTRY_SUBMITTED_AT`

语言、来源页面和通知能力为可选配置：

- `ACTION_INQUIRY_GOOGLE_FORM_ENTRY_LANGUAGE`
- `ACTION_INQUIRY_GOOGLE_FORM_ENTRY_PAGE`
- `ACTION_INQUIRY_NOTIFICATION_WEBHOOK_URL`
