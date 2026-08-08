# Public Website Design Direction v1

## Decision

阿柑少年公开网站采用「青年田野编辑体」作为长期视觉母体：以独立田野杂志为结构，以青年文化提供张力，以公共行动建立可信度，并让真实摄影成为主要内容。

## Scope

覆盖公开内容页面；不覆盖登录后社区、管理后台、认证流程和业务表单界面。

## Architecture

采用 Strangler Pattern。Legacy CSS 继续保证未迁移页面稳定；新系统按 Foundations → Primitives → Editorial Modules → Page Composition 建立。每迁移一个页面，都必须先冻结内容并通过视觉与内容回归，之后才能删除确认无引用的旧 selectors。

## Source of Truth

完整 v1 规范位于：

- [`docs/design-system/public-website-v1/README.md`](../design-system/public-website-v1/README.md)
- [`01-design-audit.md`](../design-system/public-website-v1/01-design-audit.md)
- [`02-design-principles.md`](../design-system/public-website-v1/02-design-principles.md)
- [`03-typography-system.md`](../design-system/public-website-v1/03-typography-system.md)
- [`04-color-palette.md`](../design-system/public-website-v1/04-color-palette.md)
- [`05-spacing-system.md`](../design-system/public-website-v1/05-spacing-system.md)
- [`06-content-module-library.md`](../design-system/public-website-v1/06-content-module-library.md)
- [`07-responsive-rules.md`](../design-system/public-website-v1/07-responsive-rules.md)

## Validation Gate

数值型 tokens 在标准 specimen 通过 1440px、820px 和 390px 三种画幅确认前保持 candidate 状态。正式页面迁移从 Programs 开始，但必须在 specimen 获得确认之后。
