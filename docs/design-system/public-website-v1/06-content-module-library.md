# 06 · Content Module Library

## 核心 Content Contract

阿柑少年最基本的内容单元是：

**Photography + Title + Lead / Body + Context**

Context 可以是时间、地点、人物、分类或 text link。Module 定义这些内容如何形成层级，不拥有或改写内容本身。

## Foundations / Primitives

### `Section`

职责：背景 tone、section spacing、scroll margin。

候选 API：

```text
tone: paper | warm | peach | sand | green | forest
space: md | lg | xl
```

同一个 Section 不自行定义新的背景 hex 或任意 padding。

### `Container`

职责：页面 gutter 和 max width。

```text
width: narrow | reading | default | wide
```

### `SectionHeader`

Slots：eyebrow、title、lead、supporting copy、action。

默认左对齐。`align="center"` 只用于短 Hero、Visual Break 和 CTA。

### `ImageFrame`

标准比例：

- `landscape`：4:3
- `editorial-wide`：3:2
- `hero-wide`：16:9 或受高度限制的自然比例
- `portrait`：4:5
- `square`：1:1，仅人物头像或真正方形内容
- `natural`：长文与特殊摄影

标准行为：`object-fit: cover`，可配置 focal point；caption 位于 frame 外。默认 radius 为中等且克制，不给每张照片添加 shadow。

## Editorial Modules

### A · `MediaTextBlock`

最常用模块。适用于项目、活动、人物、田野记录、研究和行动。

Desktop：

```text
[ PHOTO  7 cols ] [ COPY 5 cols ]
```

或反向：

```text
[ COPY 5 cols ] [ PHOTO 7 cols ]
```

Rules：

- 图片占 50–60%，文字占 40–50%。
- 标题、lead、body、meta、text link 使用固定 slots。
- 相邻内容可以交替，但不能为了交替破坏阅读顺序。
- 不包普通白色 card。

### B · `FeatureStory`

一个主要内容配一个 supporting story。

Desktop：主故事约 8 列，次故事约 4 列。主故事拥有更大的图、更大的标题和完整 summary；次故事减少信息层级，而不是同比缩小所有内容。

适用于 Field Notes 首页、人物专题、阶段性项目成果。

### C · `StoryPair`

两条同级但不完全同构的内容。

可采用：

- 两列照片 + 标题 + description
- 两列交错 media / copy
- 一张横图配一张 portrait

禁止扩展为四个完全相同的小卡片。超过两条时，应使用 editorial list、分组或新的 section。

### D · `FullBleedVisual`

大幅照片、短标题和一句话，作为长页面的低密度换气。

Rules：

- 每个长页面通常不超过 1–2 次。
- UI chrome 尽量消失。
- 文本必须短，并有足够对比度。
- 不在图片上叠加多个按钮、badge 和 card。

### `HorizontalTabs`

来源于 Programs 当前成功组件，统一用于项目分类、田野笔记分类、年份、活动类型和主题切换。

Rules：

- 单行横向轨道，不换行。
- Active 同时使用文字颜色和 underline / indicator。
- Mobile 保持自然 overflow，并自动将 active item 滚动到可见区域。
- 不为不同页面复制新的 tab 视觉版本。

### `QuoteBlock`

用于人物原话和情绪性 lead。

- 短引语可以使用 Brand Hand。
- 长引语使用 Body Sans 或 Reading Serif。
- 作者、角色和日期使用 metadata 样式。
- 依靠细线、留白或背景 tone，而不是 floating card。

### `ImpactStrip`

用于少量可核验数据。

- Desktop 可为 3–4 个分栏，主要依靠 divider。
- 数据值为 Primary，label 为 Secondary，来源为 Supporting。
- 不默认添加独立 shadow card。
- 数据较复杂时改用 table、timeline 或 narrative module。

### `CTASection`

低密度 closing module。

- 1 个短标题
- 最多 1 段 supporting copy
- 1 个 primary action，可加 1 个 secondary text link
- 可使用 Forest 背景或大幅照片
- 不在 CTA 中重新堆叠多个信息卡

## Module Selection Guide

| 内容情境 | 首选 Module |
| --- | --- |
| 一条项目 / 人物 / 行动介绍 | `MediaTextBlock` |
| 一个主故事 + 一个辅助故事 | `FeatureStory` |
| 两条同级内容 | `StoryPair` |
| 长页面换气 | `FullBleedVisual` |
| 分类或年份切换 | `HorizontalTabs` |
| 人物原话 | `QuoteBlock` |
| 3–4 个核心数据 | `ImpactStrip` |
| 页面结尾邀请 | `CTASection` |

## Card Policy

Card 只在对象需要明确边界、独立操作或状态时使用：

- 人物资料
- 报名入口
- 资源下载
- 可交互数据对象
- 表单和系统状态

普通故事、项目介绍和照片文字组合不使用 card。

## Content Preservation

Module migration 允许修改 wrapper、class、layout 和 presentation；不允许修改：

- 文案
- 图片和顺序
- URL 与路由
- section 顺序
- 数据源
- existing IDs
- 业务行为

每个 module 必须接受真实长度内容测试，不能只在短 demo 文案下成立。

## Standard Specimen

第一版预览只验证三个组合：

1. `SectionHeader + ImageFrame + Body`
2. 两组交替 `MediaTextBlock`
3. `FeatureStory + Secondary`

它们通过后，再建立其他 modules，避免一次设计过多抽象。
