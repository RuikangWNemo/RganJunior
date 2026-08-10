# 01 · Current Website Design Audit

审查日期：2026-08-08

范围：首页、关于、项目、发起人故事、田野笔记、影响、成长故事、加入我们等公开内容页面。

## 结论

网站并不缺少好的设计，而是缺少一套能够把好设计稳定复制到其他页面的共同规则。

当前最成熟的组合是「项目」页的色块叙事、横向导航和交替图文；「田野笔记」则证明网站可以不用普通卡片网格，也能组织较多内容。主要风险不是单个页面不好看，而是每个页面都通过独立 CSS 建立自己的字体、颜色、间距和模块语言。

## 代码层证据

- `src/index.css` 约 11,400 行，包含多代页面样式和大量页面前缀规则。
- 根级已经存在 semantic color tokens，但首页、关于、加入、项目等又定义了自己的局部 palette。
- 近似绿色同时出现为 `#006644`、`#063f30`、`#0b5a43`、`#073c2d` 等多个值。
- 手写字体同时进入 heading 和全局正文路径；部分新页面再局部覆盖 Noto Sans，造成页面之间的阅读气质不一致。
- TSX 中同时存在 Tailwind 标准字号和大量任意字号；页面专属 CSS 还定义了另一套 `clamp()` 尺度。
- Programs、About、Field Notes、Impact 各自实现相似图文模块，但没有共享的内容模块 contract。

## 跨页面问题

### Typography

- Desktop 页面主标题实测约 72px–106px，未共享同一角色尺度。
- 项目页 H1 约 105.6px、主要 H2 约 86.4px；Impact 的数据标题 H3 又只有 14px。
- 手写字体承担了过多长文本和信息文本，削弱阅读效率与成熟度。
- 语义标签与视觉角色耦合：同一个 `h2` 可能是大标题、模块标题或很小的信息标签。

### Color

- 大方向正确：橙、绿、米色、浅橙和沙色已经形成品牌识别。
- 问题是每个页面维护“自己的正确颜色”，导致近似但不一致的纸色、绿色和橙色。
- 小字号橙色文本的可读性需要单独处理，不能直接复用大标题橙。

### Spacing

- Section 上下留白主要由页面局部 `clamp()` 或任意数值决定。
- 标题、lead、正文、图片之间没有统一的 semantic gap。
- 有些页面低密度非常成功，有些页面则在同一屏内混合超大标题和密集信息，节奏断裂。

### Content Modules

- 项目页的左右交替图文已接近标准模块，但仍是页面专属实现。
- About、Home 和 Founder Story 分别重复实现“人物照片 + 文字”。
- Field Notes 使用 cardless editorial layout，是值得推广的内容组织方式。
- Impact 在部分区域回到 `border + radius + shadow` 的卡片语言，与其他页面略有脱节。

### Image System

- 真实照片是网站最有价值的视觉资产。
- 当前图片比例、圆角和裁切策略由页面分别决定；有些圆角在 `figure`，有些在 `img`，有些为直角。
- 照片既有非常成功的大幅使用，也有退化为缩略图附件的场景。

### Responsive

- 已检查的公开页面没有明显横向页面溢出。
- 项目横向导航在 Mobile 能形成真实 overflow track，是正确行为。
- Tablet 经常直接采用单列或桌面缩小版，缺少依据内容长度作出的中间布局决策。
- 主导航较早切换为移动菜单；后续 specimen 需要确认 iPad 横屏是否应保留桌面导航。

## 页面级观察

| 页面 | 应保留 | 需要系统化 |
| --- | --- | --- |
| Home | 绿色 hero、品牌橙、真实照片与插画并存 | 局部 palette、超大标题、项目 tile 卡片化 |
| Programs | 横向导航、peach → paper → sand → green 节奏、交替图文 | 抽成标准 modules，降低标题极值 |
| About | 地域影像、人物层级、章节叙事 | 多套局部绿色、标题尺度过多、页面专属布局 |
| Field Notes | cardless 列表、主次故事、阅读感 | 字体角色、图片比例、分类导航复用 |
| Impact | 可核验信息、人物与关系的叙事意图 | 数据卡片数量、极小标题、信息密度过渡 |
| Join | 低密度封面、橙线与绿色场景 | H1 与后续标题比例、绿色 token 统一 |

## 应保留并推广

- 项目页 Horizontal Tabs 的高度、移动交互和 active indicator 逻辑。
- 暖纸色、浅桃色、沙色、柔和绿与深绿 CTA 的叙事节奏。
- 左右交替图文，而不是连续同构卡片。
- Field Notes 的 Feature + Secondary 层级。
- 图片优先、细 border、少阴影的处理。
- 简洁的 underline / arrow text link。
- reduced-motion 支持和当前较克制的进入动画。

## 应废弃或合并

- 页面专属的近似品牌色，合并到 semantic color tokens。
- 所有标题都默认手写字体的规则。
- `H1/H2/H3` 直接决定视觉大小的做法，改为视觉 role tokens。
- 普通内容项统一包进白色 card 的模式。
- 同一类 tab、section header、image frame 的多个页面版本。
- 新代码中的 arbitrary hex、arbitrary spacing 和 arbitrary radius。
- 用 `!important` 或复杂 selector 赢过 legacy CSS 的迁移方式。

## 优先级

### P0 · 建立共同方向

- 视觉宪法
- Typography roles
- Semantic colors
- Section rhythm
- Content-preserving migration contract

### P1 · 建立 specimen

- Editorial Manifesto
- MediaTextBlock
- Feature + Secondary
- Desktop / Tablet / Mobile 对照

### P2 · 渐进迁移

第一样板页选择 Programs，因为它已经拥有最多应保留的成功元素，迁移主要是“提炼标准”而不是“重新设计”。

## 页面迁移的完成标准

- Content Snapshot 前后完全一致。
- 页面只使用已批准的 typography、color 和 spacing roles。
- Tablet 不是偶然可用，而是有明确布局决策。
- 无页面横向溢出，触控目标和正文行长合格。
- 新模块不依赖 legacy selector specificity。
- 只有确认无引用的 legacy selectors 才能删除。
