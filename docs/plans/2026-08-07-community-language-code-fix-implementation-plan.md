# 社群资料 INVALID_LANGUAGE 修复实施计划

日期：2026-08-07
依据：`docs/plans/2026-08-07-community-language-code-fix-design.md`

## 实施范围

只修复社区资料完善语言值，不修改 Supabase schema、RPC、约束或线上数据。

## 修改

1. 在 `src/services/community-profile/index.ts` 中把 `CommunityOnboardingInput.language` 从 `'zh-CN' | 'en'` 改为 `'zh' | 'en'`。
2. 在 `src/pages/community/CommunityOnboarding.tsx` 中直接提交 `LanguageContext.lang`，删除 `zh -> zh-CN` 的错误转换。
3. 新增 `src/pages/community/CommunityOnboarding.test.tsx`：
   - 中文界面提交 `language: 'zh'`。
   - 英文界面提交 `language: 'en'`。
   - 成功后刷新社群状态并进入 smart entry。

## 验证

- 运行 CommunityOnboarding 聚焦测试。
- 运行相关 ESLint。
- 运行完整 Vitest 与 Vite production build。
- 确认变更中没有 Supabase migration 文件。
