# 项目页开屏叙事与人物照片设计

## 目标

将项目页开屏从简短邀请改为完整的项目起源叙事，让访问者先理解阿柑少年如何从 Nate 在铁牛村的真实生活中生长出来，再进入下方四个具体项目。

开屏需要同时满足：

- 清晰呈现项目从生活、关系与信任走向共创、行动和公共议题研究的成长路径；
- 让 Nate 的个人邀请保持真实人物感，而不是成为抽象品牌宣言；
- 延续现有橙绿纪实编辑语言；
- 为中英文内容提供一致的视觉层级和自然表达；
- 在桌面和手机上都保持合理的阅读长度与顺序。

## 已确认方向

采用纪实编辑式双栏，并使用“关于”开屏同类的铁牛村真实场景照片。本页禁止使用 Nate 的照片。

### 桌面布局

开屏顶部仿照“关于”页面，使用左侧文字、右侧照片的双栏网格并垂直居中：

- 左栏为主叙事：主标题、项目起源导语、两段成长路径正文；
- 右栏上方为铁牛村 4:3 横幅场景照片及简短图注；
- “Nate 的邀请”不放在照片栏中，而是位于顶部双栏下方，横跨完整内容宽度；
- 邀请区在桌面使用“标题 / 引语正文”双栏，正文保留橙色竖线和署名。

双栏之间保留充足空隙，不使用悬浮卡片、复杂滤镜或额外装饰插画。

### 手机布局

内容按以下顺序自然堆叠：

1. 主标题与项目成长路径；
2. 铁牛村场景照片与图注；
3. 横向邀请区在手机上恢复为单栏，依次显示标题、邀请正文与署名；
4. 项目章节导航。

照片保持 4:3 比例，并缩减文字区与照片区之间的间距，避免首屏形成松散断层。

## 文字层级

- 主标题使用深森林绿手写标题字体，桌面约 56–60px，手机约 38–40px，行高约 1.1；
- 第一段作为导语，使用 18–20px 正文无衬线体和中等字重；
- 后两段使用 16–18px 正文无衬线体，行高约 1.85–1.9；
- “Nate 的邀请”使用橙色小标题，正文保持 16–17px，不使用大号手写引语；
- 署名使用较小字号和深绿色，作为引语结束标记；
- 中文正文控制在舒适阅读宽度，英文通过独立最大宽度与标题字号避免过长行。

## 中文内容

### 主叙事

**从真实生活出发，走向共创与行动**

阿柑少年从 Nate 在铁牛村的成长经历中长出来。

从邀请朋友来村里玩，到调研生态农业、参与公共议题，再到发起生活共创营，它逐渐形成了一条青少年真实世界成长路径。

我们希望孩子先走进自然和生活，建立感受、关系和信任，再把这份连接延续到日常行动、社群共创和公共议题研究中。

### Nate 的邀请

我最早只是想邀请朋友来铁牛村玩。后来我慢慢发现，乡村不只是一个可以放松的地方，它让我重新认识食物、土地和社区，也让我开始思考真实世界里的问题。

阿柑少年希望邀请更多同龄人来到这里：先生活，先感受，先和人、土地、食物建立连接。也许一开始我们还不知道能做什么，但只要愿意进入现场，问题和行动就会慢慢长出来。

—— Nate，阿柑少年发起人

## 英文内容

### Main narrative

**From real life toward co-creation and action**

R'gan Junior grew out of Nate's experience of growing up in Tieniu Village.

What began as an invitation for friends to visit the village expanded into research on ecological agriculture, engagement with public issues, and the creation of the Life Co-creation Camp. Along the way, it became a real-world learning pathway for young people.

We hope young people can first step into nature and everyday life, building awareness, relationships, and trust—then carry those connections into daily action, community co-creation, and research on public issues.

### Nate's invitation

At first, I simply wanted to invite friends to spend time in Tieniu Village. Over time, I realized that the village was more than a place to relax. It helped me see food, land, and community differently, and led me to think about questions in the real world.

R'gan Junior hopes to invite more young people here: to live first, feel first, and begin by building connections with people, land, and food. We may not know what we can do at the beginning, but when we are willing to step into the field, questions and actions begin to grow.

— Nate, Founder of R'gan Junior

## 组件与可访问性

- 继续由 `ProgramInvitation` 负责开屏，不增加新的页面级状态；
- 主标题保持页面唯一的 `h1`；
- 右栏使用带可访问名称的 `aside`，邀请内容使用 `blockquote` 与 `cite`；
- 照片使用已有的铁牛村林盘航拍图，提供中英文替代文本和图注，不使用 Nate 的照片；
- 更新页面测试，覆盖新标题、核心正文、照片替代文本、邀请标题和署名；
- 保持页面现有语言切换、项目导航与滚动行为不变。

## 验证

- 运行项目页相关测试；
- 运行 TypeScript 应用检查；
- 运行生产构建；
- 不进行浏览器截图或视觉自动化检查，除非用户另行要求。
