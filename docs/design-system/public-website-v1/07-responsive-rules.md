# 07 · Responsive Rules

## Breakpoints

Breakpoints 表示布局决策，不表示设备品牌。

| Mode | Width | 主要目的 |
| --- | --- | --- |
| Mobile | `< 768px` | 单列阅读、触控优先、横向 tabs |
| Tablet | `768–1023px` | 独立编辑画幅，不直接缩小 Desktop |
| Desktop | `1024–1439px` | 12 列、完整图文组合和主导航 |
| Wide | `≥ 1440px` | 内容宽度封顶，增加外侧留白 |

实现保持 mobile-first。必要时 module 可使用 container query，根据实际可用宽度而不是页面 viewport 决定布局。

## Required Test Viewports

- `390 × 844`：常见 Mobile
- `768 × 1024`：iPad portrait
- `820 × 1180`：现代 iPad portrait
- `1024 × 768`：iPad landscape / Desktop boundary
- `1440 × 1000`：标准 Desktop

不能只验证 Desktop 和 Mobile。

## Global Rules

- 页面不得出现水平滚动；Horizontal Tabs、代码或指定 media track 除外。
- 正文不低于 16px。
- Touch target 最小 `44 × 44px`。
- Wide 模式只增加 outer whitespace，不无限放大字号和 container。
- DOM 阅读顺序必须在所有布局下保持合理。
- 键盘 focus、active 和 hover 不能只在 Desktop 成立。

## Module Behavior

### `MediaTextBlock`

| Mode | Behavior |
| --- | --- |
| Desktop | 7/5 或 6/6 双列；允许 reverse |
| Tablet | 短 copy 可保持约 55/45；长 copy 或窄 container 改为 stacked |
| Mobile | 单列，通常 media 在前、copy 在后；必要时按叙事顺序调整 |

Tablet 的双列必须同时满足：图片仍有足够宽度、正文列不窄于舒适阅读宽度、标题不会形成逐字断行。否则转为上下结构。

### `FeatureStory`

| Mode | Behavior |
| --- | --- |
| Desktop | 8/4 主次层级 |
| Tablet | 5/3 或接近 1:1，但主故事仍通过图片尺度和标题保持优先 |
| Mobile | 主故事完整显示，secondary 置于其后并用 divider 分隔 |

### `StoryPair`

- Desktop：2 列。
- Tablet：内容短时 2 列，长标题或 portrait 内容时堆叠。
- Mobile：单列；禁止把两列压缩成难以阅读的小卡片。

### `HorizontalTabs`

- 始终单行。
- Desktop 可完整显示。
- Tablet / Mobile 允许横向滚动，隐藏视觉 scrollbar 但保留可滚动能力。
- Active item 必须自动进入可视范围。
- 两端可使用轻微 fade 提示 overflow，但不能遮挡文字或交互。

### `FullBleedVisual`

- Desktop 可以接近 viewport 宽度或完全 full bleed。
- Tablet 保留主 focal point，不简单缩小整张照片。
- Mobile 优先 portrait-safe crop；叠加文字过长时移到图片下方。

### `ImpactStrip`

- Desktop：3–4 列。
- Tablet：2 列。
- Mobile：单列或 2 列，取决于 label 长度；使用 divider，不产生卡片墙。

## Typography

- Display 的缩放幅度大于 Body。
- Mobile Hero 标题推荐 52px 左右上限，避免重新形成宣传海报。
- Tablet 先调整标题 max-width 和模块比例，再决定字号。
- 长英文和长中文标题可以切换到 Body Sans 的 module role。
- 行长由 container 控制，不依靠不断增大 padding 挤窄正文。

## Images

- 每张关键照片需要可配置 focal point。
- `object-fit: cover` 不等于允许裁掉人物脸部、手部或关键行动。
- Mobile 可以从 landscape 切换为 4:5 或自然高度，但必须保持叙事主体。
- Caption 始终跟随对应图片，不因重排移动到错误内容之后。
- 同一 module 的不同 breakpoint 不加载语义不同的替代图片，除非内容团队明确提供 art direction assets。

## Navigation

- Desktop 使用完整主导航。
- Tablet 是否保留完整导航由 specimen 验证；若导航拥挤，应整体切换为 menu，而不是缩小到难以点击。
- Mobile menu 必须显示当前 section、语言切换和主要 CTA。
- Sticky navigation 必须为 anchor 和 heading 提供统一 `scroll-margin`。

## Motion

- 进入动画距离和时长在 Mobile 下缩短。
- `prefers-reduced-motion` 下取消位移动画、parallax 和自动平滑滚动。
- 横向 tabs 的 active indicator 可以保留无位移或即时状态。
- 不使用动画掩盖 layout shift。

## Responsive QA

每次 module 或页面迁移必须检查：

1. 390、768、820、1024、1440 五个关键宽度。
2. 无页面级水平溢出。
3. 标题没有单字孤行或不自然断裂。
4. 正文行长、字号和行距适合阅读。
5. 图片主体没有被错误裁切。
6. Tabs 能滚动，active item 可见。
7. Touch target 至少 44px。
8. Sticky nav 不遮挡 anchor heading。
9. Keyboard focus 可见。
10. Reduced motion 模式仍能理解内容层级。
11. Content Snapshot 前后完全一致。
