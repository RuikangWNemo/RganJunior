# 05 · Spacing System

## Base Scale

采用 4px 基准、有限集合。页面不直接发明 `83px`、`117px` 等一次性数值。

| Token | Value | 常见用途 |
| --- | --- | --- |
| `space-1` | `4px` | 极小视觉校正 |
| `space-2` | `8px` | icon gap、紧凑 metadata |
| `space-3` | `12px` | caption、label gap |
| `space-4` | `16px` | 默认小间距 |
| `space-6` | `24px` | title → lead、控件组 |
| `space-8` | `32px` | lead → body、内容组 |
| `space-12` | `48px` | copy → media、较大内部留白 |
| `space-16` | `64px` | 模块内部大间距 |
| `space-20` | `80px` | Mobile 大型 section |
| `space-24` | `96px` | 标准 section、模块间距 |
| `space-32` | `128px` | Desktop 大 section |
| `space-40` | `160px` | Desktop 低密度 hero / visual break |

## Section Space

| Role | Desktop | Tablet | Mobile | 适用 |
| --- | --- | --- | --- | --- |
| `section-xl` | `160px` | `128px` | `96px` | Hero、Manifesto、Visual Break |
| `section-lg` | `128px` | `104px` | `80px` | 主要 editorial section |
| `section-md` | `96px` | `80px` | `64px` | 项目说明、列表、数据区 |

同一 section 默认上下对称。只有叙事上明确连接前后模块时，才允许使用不同的 top / bottom role。

## Internal Rhythm

| Relationship | Default |
| --- | --- |
| Eyebrow → Title | `16px` |
| Title → Lead | `24px` |
| Lead → Body | `24px` |
| Title → Body（无 Lead） | `32px` |
| Body paragraph → paragraph | `16–24px` |
| Copy → Action | `32px` |
| Copy → Media（stacked） | `48px` Mobile / `64px` Tablet |
| Media → Caption | `12px` |
| Module → Module | `96–160px`，按密度 profile |

## Containers

| Token | Max width | 用途 |
| --- | --- | --- |
| `container-wide` | `1280px` | 大图、mosaic、宽内容组合 |
| `container-default` | `1120px` | 标准 section 与交替图文 |
| `container-reading` | `720px` | 长文正文 |
| `container-narrow` | `620px` | intro、lead、单列说明 |

页面 gutter：

- Mobile：`24px`
- Tablet：`40px`
- Desktop：`64px`
- Wide：不继续放大内容，只增加外侧呼吸空间

## Grid

- Desktop 默认 12 列。
- Tablet 默认 8 列。
- Mobile 默认 4 列。
- 标准 column gap：Desktop `32px`、Tablet `24px`、Mobile `16px`。
- Editorial module 可以跨列不对称，但不能脱离 grid 随机偏移。

## Density Profiles

### Low

- `section-xl`
- 1 个主标题
- 1 个主要视觉或 1 段短 lead
- 至多 1 个 CTA group

适用于 Hero、Visual Break、Join CTA。

### Medium-low

- `section-lg`
- 1 个标题组
- 1 个主要照片
- 1–2 段正文

适用于人物故事、田野叙事。

### Medium

- `section-lg` 或 `section-md`
- 图文双列
- metadata、summary 和 text link

适用于 Programs。

### Medium-high

- `section-md`
- 数据、时间线或多条摘要
- 依靠 divider 与 grid 管理，不通过缩小所有字号提高密度

适用于 Impact 和 Archive。

## Rules

- 优先改变 section role，不单独微调 margin。
- 标题与正文过远时，先检查 hierarchy，不直接塞入 arbitrary gap。
- 连续模块需要变化时，可以改变图片位置或背景 tone，不必改变 spacing system。
- Mobile 保留呼吸感；不能因为屏幕小就把所有 section 压到 32–40px。
- Sticky nav 的占位和 `scroll-margin` 必须来自统一 navigation height tokens。

## Spacing QA

- 页面是否出现不属于 scale 的数值？
- 同类标题与正文关系是否一致？
- 两个高密度 section 是否直接相邻？
- Tablet gutter 是否既不拥挤也不浪费？
- Reading container 是否过宽？
- 宽屏内容是否因为无限拉伸而失去编辑比例？
