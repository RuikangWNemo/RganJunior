# 02 · Design Principles

## 1. 统一规则，不统一页面

全站共享 typography、color、spacing、image 和 module 规则，但不同页面可以拥有不同构图和叙事节奏。Design System 不应把网站变成一组模板复制品。

## 2. Photography is primary content

真实影像不是装饰，也不是卡片缩略图。设计首先给照片尺度与呼吸，再放入 UI。任何装饰都不能比人物、土地和真实行动更抢眼。

## 3. 手写负责情绪，信息字体负责理解

手写字体用于短标题、短 lead、品牌短句和少量引语。正文、时间、地点、数据、导航、表单与长标题使用清晰的 sans 或 reading serif。

## 4. 一个 Section 只有一个主角

每个 section 必须能指出：

- Primary element
- Secondary element
- Supporting information

不能让标题、图片、数据和 CTA 同时争夺第一层级。

## 5. 每个 Section 最多三个主要字号

标准组合是：Title / Lead / Body。Eyebrow、caption 和 metadata 属于辅助信息，不应形成新的视觉主层级。

## 6. 密度需要起伏

Hero 和 CTA 应低密度，Editorial 中低密度，项目说明中密度，Impact 可以中高密度。高密度区域前后必须有留白、大图或色块缓冲。

## 7. Color blocks 推动叙事

背景颜色用于章节转换、情绪变化和阅读节奏，而不是给每一个内容对象上色。普通 section 不使用渐变制造层级。

## 8. Editorial composition 优先于 card grid

照片、文字、留白、细分隔线和色块是主要层级工具。Card 只用于真正独立、需要边界或交互状态的对象，例如人物资料、数据、下载、报名入口。

## 9. 不对称必须有秩序

允许左右交替、大小对比、错落图片和偏移，但所有不对称都要落在共同 grid、container 和 spacing tokens 上。随机 margin 不是编辑感。

## 10. 动画服务于理解

动画只用于导航反馈、内容进入、slider 状态和图片层级。禁止持续漂浮、过度 parallax、复杂 hover 和为了“年轻”而加入的高频动效。

## 11. Tablet 是独立画幅

Tablet 需要根据文字长度和图片最小尺寸决定保留双列或转为上下结构，不允许简单缩小 Desktop。

## 12. 新系统旁路生长

不先清理 legacy CSS。新 tokens、primitives 和 modules 在独立层建立；页面迁移完成并通过回归后，旧样式才逐项退休。

## 设计判断清单

在批准一个新 section 或 module 前，回答：

1. 主角是什么？
2. 照片是否拥有足够尺度？
3. 是否出现超过三个主要字号？
4. 是否能用留白或分隔线替代 card？
5. 是否使用了未经批准的颜色或间距？
6. Tablet 下的布局决策是什么？
7. 去掉动画后，层级是否仍然成立？
8. 它是否看起来像儿童、NGO、SaaS 或奢侈品牌模板？
9. 它能否承载真实内容，而不是只适合 demo 文案？
10. 它是否可以复用于至少两个公开页面？

## Anti-patterns

- 连续三个以上同尺寸卡片
- 大标题、lead、正文之间出现断崖式字号差
- 长段手写正文
- 每个 section 一个新 hex
- 依靠 shadow 和 radius 证明内容是独立对象
- 所有内容居中
- 所有图片固定为同一小比例
- Desktop 双列直接压缩到 Tablet
- 以视觉优化为理由顺手修改内容
