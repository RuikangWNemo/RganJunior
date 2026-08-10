# 社群资料 INVALID_LANGUAGE 修复设计

日期：2026-08-07

## 问题

注册用户进入资料完善页后，中文界面把语言提交为 `zh-CN`。线上 `complete_community_onboarding` RPC 与 `profiles.preferred_language` 只接受 `zh` 或 `en`，因此中文用户保存资料时收到 `INVALID_LANGUAGE`。

## 决策

采用前端与类型统一方案：

- 社群资料持久化语言只使用 `zh`、`en`。
- `CommunityOnboarding` 直接提交当前应用语言 `lang`。
- `CommunityOnboardingInput.language` 收窄为 `'zh' | 'en'`。
- 浏览器日期、数字等本地化仍可使用 `zh-CN`；显示 locale 与数据库语言代码职责分离。
- 不修改线上 Supabase RPC、约束或既有数据。

## 防回归

- 新增资料完善页测试，验证中文提交值为 `zh`。
- 验证英文提交值为 `en`。
- 保留数据库的严格校验，使未知语言代码继续失败，而不是静默写入脏数据。
- 运行聚焦测试、相关 lint、生产构建，并在本地连接当前线上 Supabase 配置验证页面不再产生 `INVALID_LANGUAGE`。

