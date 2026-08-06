# 微信文章网站内容包整理设计

## 背景

`/Users/hw/Documents/RganJunior/Website/Wechat_Article` 中保存了“阿柑少年”公众号的 5 篇完整网页。每篇由一个主 HTML 和一个浏览器资源目录组成，混合了正文内容、正文图片、微信界面资源、脚本、样式和追踪代码。

本阶段只整理独立内容包，不修改现有 React 网站。

## 目标

从 5 个本地微信网页中提取可长期使用的网站内容，生成：

- 干净、语义化的正文 HTML；
- 带 YAML 元数据头的 Markdown；
- 仅包含正文实际引用媒体的图片目录；
- 单篇 JSON 元数据；
- 全局 JSON、CSV 和 Markdown 索引；
- 可解释的完整性审计报告。

## 输出结构

```text
Wechat_Article/
├── 原始 HTML 与资源目录（保持不动）
└── web-ready/
    ├── README.md
    ├── manifest.json
    ├── manifest.csv
    ├── INDEX.md
    ├── articles/
    │   └── article-slug/
    │       ├── article.md
    │       ├── content.html
    │       ├── metadata.json
    │       └── images/
    └── reports/
        └── audit.md
```

## 数据模型

每篇 `metadata.json` 至少包含：

- `id`：稳定标识；
- `slug`：网站路径名；
- `title`：标题；
- `description`：摘要；
- `accountName`：公众号名称；
- `author`：作者；
- `publishedAt`：ISO 8601 发布时间；
- `originalUrl`：微信原文链接；
- `sourceFile`：本地主 HTML 文件名；
- `coverImage`：本地封面相对路径；
- `images`：正文图片清单；
- `wordCount`、`imageCount`：核验字段；
- `status`、`warnings`：整理状态和异常。

## 清洗规则

1. 以主页面的 `#js_content` 为正文边界，页面其余区域默认不进入内容包。
2. 删除脚本、样式表、表单、评论、推荐、赞赏、页面级公众号二维码、公众号卡片和追踪节点；作者主动插入正文的活动咨询二维码保留。
3. 保留正文段落、标题、列表、引用、链接、图片、图注、表格和必要的语义结构。
4. 移除微信专用类名、事件属性、追踪属性和不可迁移的布局属性。
5. 正文图片只从 `#js_content` 中枚举；优先复制浏览器保存的本地文件。
6. 通过文件魔数识别图片真实格式，按正文顺序规范命名；同一源文件只复制一次。
7. 将 HTML 和 Markdown 中的图片引用改写成 `images/...` 相对路径。
8. Markdown 保留正文顺序和基本层级；复杂排版无法无损表达时保留为内嵌 HTML，并在审计报告中说明。
9. 原始 HTML 和资源目录不移动、不重命名、不覆盖。

## 转换策略

采用“原貌保留 + 网站标准化”的双层结果：

- `content.html` 尽量保留正文结构与图片顺序，作为高保真迁移源；
- `article.md` 进行语义化转换，作为后续内容系统或人工编辑入口。

不复制微信页面级 CSS/JS，不追求复刻微信界面。

## 异常处理

- 单篇解析失败时仍生成 `metadata.json`，状态设为 `failed` 并记录原因。
- 图片缺失时保留原始远程 URL 到元数据，并在正文中加入可追踪占位信息。
- 无法识别的媒体进入警告，不把未知脚本或二进制资源当作图片复制。
- 单篇失败不阻断其余文章处理。

## 验收

- 输入 5 篇，输出文章目录 5 个。
- 每篇均有 `article.md`、`content.html` 和 `metadata.json`。
- 标题、发布时间、摘要、原链接与源页面一致。
- 正文非空，段落顺序一致。
- 所有本地图片引用均指向存在的文件。
- 输出中无 `<script>`、微信页面运行 JS、远程追踪像素或绝对本机路径。
- `manifest.json`、`manifest.csv`、`INDEX.md` 与文章目录计数一致。
- `reports/audit.md` 给出总数、成功数、警告和缺失资源。
