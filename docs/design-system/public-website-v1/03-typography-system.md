# 03 · Typography System

## 目标

建立稳定、成熟、适合中文阅读的标题与正文关系。手写字体保留阿柑少年的品牌温度，但不再承担所有信息。

## Font Roles

| Role | 候选字体栈 | 使用场景 |
| --- | --- | --- |
| Brand Hand | `TanukiMagic Web`, `Rgan Round Glyph Patch`, `Qiaoqiaohua Handwriting`, `Noto Serif SC`, serif | 短 display、section title、短引语、品牌短句 |
| Body Sans | `Noto Sans SC`, `Inter`, `PingFang SC`, `Microsoft YaHei`, system-ui, sans-serif | 正文、lead、导航、按钮、metadata、数据 |
| Reading Serif | `Noto Serif SC`, `Source Han Serif SC`, Georgia, serif | 田野笔记和成长故事的长文正文，可选 |

Body Sans 是公共网站默认信息字体。Reading Serif 只在明确的长文阅读容器内使用，不能成为普通页面正文的第二套随机选择。

## Display / Lead / Body Scale

以下数值是 specimen 使用的 v1 候选值。

| Token | Candidate size | Line height | Font role | 主要用途 |
| --- | --- | --- | --- | --- |
| `type-display` | `clamp(3.25rem, 6.2vw, 5.5rem)` | `1.04` | Brand Hand | Hero 主标题；每页最多一个 |
| `type-section` | `clamp(2.75rem, 4.6vw, 4.5rem)` | `1.08` | Brand Hand | 大型 section 标题 |
| `type-module` | `clamp(2rem, 3vw, 3.25rem)` | `1.14` | Brand Hand 或 Body Sans | 图文模块标题 |
| `type-lead` | `clamp(1.25rem, 1.7vw, 1.625rem)` | `1.55` | Body Sans | 情绪性引导句、blockquote lead |
| `type-body-lg` | `clamp(1.0625rem, 1.2vw, 1.1875rem)` | `1.85` | Body Sans | 重要介绍、module summary |
| `type-body` | `1rem` | `1.85` | Body Sans | 默认正文 |
| `type-reading` | `1.0625rem` | `2` | Reading Serif | 长篇文章正文 |
| `type-meta` | `0.875rem` | `1.55` | Body Sans | 时间、地点、作者、分类 |
| `type-caption` | `0.8125rem` | `1.55` | Body Sans | 图片说明、来源、辅助信息 |

## 每个 Section 的三层限制

一个普通 section 原则上只使用：

1. `type-section` 或 `type-module`
2. `type-lead` 或 `type-body-lg`
3. `type-body`

`type-meta` 和 `type-caption` 可以存在，但必须保持辅助地位。禁止在同一个 section 继续叠加视觉上的 H4、H5、small、tiny 层级。

## 手写字体边界

### 可以使用

- Hero 的短主标题
- Section title
- 12–18 个汉字以内的 module title
- 一句短 lead 或 quote
- 少量数字强调，但不用于数据表

### 不应使用

- 超过三行的正文
- 时间、地点、价格、数据和表单信息
- 导航、按钮和筛选标签
- 长英文标题
- 需要快速扫描的列表

短标题推荐 Desktop 不超过两行、Mobile 不超过三行。标题过长时，优先使用 Body Sans 的 `type-module`，而不是继续缩小手写字体直到难以阅读。

## Weight

- Brand Hand 默认 `400–500`，不通过粗体制造强调。
- Body 正文 `400`。
- Lead `400–500`。
- 导航、按钮和 metadata `500–600`。
- 禁止在同一段中混合三种以上字重。

## Text Measure

| 内容 | 最大行长 |
| --- | --- |
| Hero lead | `28–34ch` |
| 普通正文 | `36–44ch` 中文视觉宽度 |
| 长篇文章 | `42–52rem` reading container |
| 图片 caption | 不超过图片宽度，建议 `32–48ch` |

中文正文避免满屏横跨 wide container。Desktop 的正文列通常不应超过约 640–720px。

## Alignment

- 默认左对齐。
- 居中只用于非常短的 Hero、Visual Break 或 CTA。
- 长正文不居中。
- 数字和 metadata 可用 tabular figures，但不能用手写字体。

## Bilingual Rules

- 中英文共享视觉角色，不要求逐字获得完全相同的行数。
- 英文超过两行时优先使用 Body Sans，而不是强行使用手写 Latin。
- 中英文导航采用同一字号、字重和 touch target。
- 英文大写 eyebrow 可以增加 tracking；中文 eyebrow 不机械添加大字距。

## Responsive Type Behavior

- Mobile 不把所有字号按同一比例缩小；Display 收缩最多，Body 基本保持。
- `type-body` 不低于 16px。
- Tablet 的标题宽度比字号更重要；先调整 max-width 和换行，再缩小字号。
- 不能通过 `vw` 让标题在 Wide screen 无限增长。

## Typography QA

- 一个 section 是否出现超过三个主要字号？
- 手写文字是否超过三行？
- H1 与正文是否仍出现 6 倍以上的视觉断层？
- 正文在 390px 下是否至少 16px？
- 中文长文是否保持合适行长与行距？
- metadata 是否仍可快速扫描？
