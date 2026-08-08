# 04 · Color Palette

## 原则

保留现有橙、绿、米色方向，不重新发明品牌。Palette 的任务是合并接近值，并明确每个颜色在叙事中的职责。

以下为 specimen 使用的 v1 候选值。

## Foundation Palette

| Token | Value | Role |
| --- | --- | --- |
| `color-paper` | `#F7F4ED` | 全站默认纸张背景 |
| `color-warm-beige` | `#EDE8DE` | 次级 section、轻微层次变化 |
| `color-peach` | `#F6DAC5` | 青年感、项目入口、温暖叙事 |
| `color-sand` | `#D9C5A5` | 稍深的章节过渡与 grounding |
| `color-soft-green` | `#A9D5BD` | 自然、共同体、柔和绿色 section |
| `color-forest` | `#0A3D2B` | 深色 visual break、CTA、页尾 |
| `color-brand-orange` | `#EA6A2A` | 大标题、品牌强调、装饰线 |
| `color-action-orange` | `#C95520` | 小字号链接、按钮与可交互橙色 |
| `color-action-green` | `#006644` | 导航 active、主要绿色操作 |
| `color-ink` | `#292A27` | 主文字 |
| `color-ink-muted` | `#66625C` | 次级文字 |
| `color-border` | `#D9D3C8` | soft divider 与输入边界 |
| `color-on-dark` | `#F7F4ED` | 深绿背景上的文字 |

## Semantic Mapping

```text
--bg-primary      → color-paper
--bg-warm         → color-warm-beige
--bg-peach        → color-peach
--bg-sand         → color-sand
--bg-green        → color-soft-green
--bg-forest       → color-forest
--accent-orange   → color-brand-orange
--action-orange   → color-action-orange
--accent-green    → color-action-green
--text-primary    → color-ink
--text-secondary  → color-ink-muted
--border-soft     → color-border
--text-on-dark    → color-on-dark
```

页面和模块应使用 semantic tokens，而不是直接引用 foundation hex。

## 使用规则

### Paper / Warm Beige

- `bg-primary` 是默认页面地板。
- `bg-warm` 只用于产生可感知但安静的章节变化。
- 不连续叠加多个肉眼几乎无法区分的米色。

### Peach

- 用于具有邀请感、青年行动感或第一次进入项目的 section。
- 不用于所有 CTA，也不作为普通 card 背景反复出现。
- 正文使用 Ink 或 Forest，不使用低对比橙色正文。

### Soft Green

- 作为主要浅绿色背景，统一自然、共同体和公共行动场景。
- 文字优先使用 Forest。
- 不再新增“稍微更灰”“稍微更蓝”的页面专属浅绿。

### Forest

- 用于低密度 CTA、Full-width Visual Break、Footer 或少量重要转折。
- 普通页面不连续出现两个大面积 Forest section。
- 深绿上的正文和按钮必须使用 `text-on-dark` 或经过验证的高对比色。

### Orange

- `brand-orange` 可用于大标题、数字、装饰线和大面积品牌时刻。
- 小字号交互文字使用更深的 `action-orange`，保证可读性。
- Orange 不是正文色，也不是每个 icon 的默认颜色。

## 推荐页面色块节奏

### Programs

`Paper → Peach → Paper → Warm Beige / Sand → Forest`

### About / Story

`Paper → Warm Beige → Full-width Photo → Paper → Soft Green → Forest CTA`

### Field Notes

以 `Paper` 为主，依靠 divider 和摄影建立层级；只在 Feature 或 CTA 使用一次色块转换。

### Impact

`Paper → Warm Beige → Soft Green → Paper → Forest CTA`，高密度数据区不再叠加多种卡片颜色。

## Surface Budget

一个普通页面建议使用：

- 1 个默认纸色
- 1–2 个章节背景色
- 1 个深色 closing / visual break

不包括图片本身，单页同时出现的主要背景色原则上不超过四种。

## Border / Shadow

- 默认 divider：`color-border` 的 60–100% 强度。
- 主要层级依靠背景色、留白和排版，不依靠 shadow。
- Shadow 只用于需要悬浮语义的元素，如 dropdown、dialog 或极少量 hover elevation。

## Accessibility

- `brand-orange` 作为小字号文字前必须验证对比度；默认改用 `action-orange`。
- `soft-green` 上使用 Forest 或 Ink。
- `forest` 上使用 `text-on-dark`。
- 颜色不能成为 active、error 或 selected 状态的唯一信号；需配合 underline、位置、图标或文字。

## 禁止事项

- 新模块内 hardcode 独立 hex
- 为 hover 创建未经命名的新颜色
- 大量渐变
- 相邻 section 使用无法解释的近似背景色
- 把绿色等同于所有 NGO / environmental 内容
