# Public Website Design Direction v1

> 阿柑少年公开网站的视觉宪法。它先回答“网站应该长什么样”，再约束 tokens、组件和页面实现。

## 状态

- 视觉方向：已确认
- 数值型 tokens：v1 候选值，需通过标准 specimen 后冻结
- 适用范围：公开内容网站
- 不适用范围：登录后社区、管理后台、认证流程和业务表单界面
- 迁移方式：Strangler Pattern，逐页替换，不先重写 legacy CSS

## North Star

阿柑少年网站应位于以下四种文化语境的交界处：

**青年文化项目 × 独立杂志 × 自然教育 × 公共行动**

八个固定关键词：

**Editorial / Field-rooted / Youthful / Warm / Human / Photography-led / Restrained / Credible**

中文对应：

**编辑感 / 田野感 / 青年感 / 温暖 / 人本 / 影像驱动 / 克制 / 可信**

成熟感来自比例、留白、摄影和信息秩序，不来自奢侈品牌式的冷淡。

## 视觉配方

- 55% 独立田野杂志：编辑层级、阅读节奏、留白和图文关系
- 25% 青年文化刊物：手写标题、轻度不对称、橙色行动感
- 20% 公共行动档案：清晰信息、证据感、时间地点和数据可信度

最终表现为：真实摄影占主导，米色纸张构成底色，橙色提供情绪和行动感，柔和绿色建立自然与公共性；手写字体表达短标题，正文、数据与界面信息保持清晰克制。

## 明确的反目标

- 不是儿童网站：吉祥物是品牌标点，不是每个模块的装饰背景。
- 不是传统 NGO 网站：不依赖绿色卡片、图标和成果数字堆叠。
- 不是商业 SaaS：不使用 dashboard 式网格、glassmorphism 和功能卡片海洋。
- 不是极简奢侈品牌：不追求冷白、纯黑大片和脱离真实生活的空旷。
- 不是手账拼贴网站：手作感只出现在字体、线条和少量不规则关系中。

## Reference Archetypes

| Archetype | 学习 | 不学习 |
| --- | --- | --- |
| 独立田野杂志 | 长短内容层级、留白、图文不对称 | 黑白冷淡、实验性导航 |
| 青年文化刊物 | 标题生命力、轻度错位、色彩张力 | 海报字号泛滥、持续动画 |
| 摄影优先的生活叙事 | 大幅真实影像、人物与环境并存、UI 后退 | 商品缩略图网格、统一卡片墙 |
| 公共行动档案 | 项目、时间、地点、数据和证据的可信层级 | 企业报告模板、机构化 card grid |

## 页面密度节奏

页面不是持续保持同一密度，而应形成可感知的呼吸：

**Hero 低密度 → Editorial 中低密度 → Project 中密度 → Visual Break 低密度 → Impact 中高密度 → CTA 低密度**

同一个页面连续出现两个高密度 section 时，必须通过大图、留白或色块切换进行缓冲。

## Photography Principle

> Photography is primary content, not decoration.

照片可以成为 50vw 大图、全宽 visual break、纵向人物肖像、两张错落照片或压过常规网格的主体。照片不应长期退化为 card thumbnail，也不应被复杂装饰、渐变和悬浮 UI 抢走注意力。

## 决策优先级

发生设计冲突时，按以下顺序判断：

1. 内容完整性与可访问性
2. 本文件的视觉方向与设计原则
3. Content Module 的结构规则
4. Typography、Color、Spacing 和 Responsive tokens
5. 页面局部构图
6. Legacy CSS 的现有表现

Legacy CSS 只承担兼容职责，不反向定义新系统。

## Migration Constitution

每次迁移页面必须遵守三条硬约束：

1. **Migration must be content-preserving.** 未经明确授权，不修改文案、图片资源、图片顺序、链接、路由、SEO metadata、section 顺序、数据源、表单行为、analytics 或 existing IDs。
2. **Do not rewrite legacy CSS globally.** 旧 CSS 继续作为 compatibility layer；只删除已经确认无引用、且迁移页面通过回归检查的 selectors。
3. **Every migrated page must pass visual and content regression before legacy styles are removed.**

每页迁移前生成 Content Snapshot，迁移后逐项对照。新组件不得通过 `!important` 或不断增加 selector specificity 与旧 CSS 竞争；应使用 cascade layers、作用域 class 或 CSS Modules 隔离。

## 文件索引

1. [Design Audit](./01-design-audit.md)
2. [Design Principles](./02-design-principles.md)
3. [Typography System](./03-typography-system.md)
4. [Color Palette](./04-color-palette.md)
5. [Spacing System](./05-spacing-system.md)
6. [Content Module Library](./06-content-module-library.md)
7. [Responsive Rules](./07-responsive-rules.md)

## v1 冻结条件

在正式迁移页面前，先制作一份与生产页面隔离的标准 specimen，至少包含：

- Editorial Manifesto
- Alternating Media Story
- Feature + Secondary
- 1440px、820px、390px 三种画幅

如果约 70% 的公开内容能够自然落入这些组合，并且在三种画幅下都保持阿柑少年的识别度与阅读节奏，v1 tokens 才进入冻结状态。
