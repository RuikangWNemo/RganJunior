# 专业项目总览与详情页升级实施计划

## 实施目标

将现有 `/programs` 一页式完整长页改为专业项目总览，并增加三个独立详情页、滚动定位菜单和项目专属 FAQ。保持现有咨询、参与意向、旧路由兼容和双语能力。

## 任务一：扩展项目内容模型

### 文件

- 修改 `src/content/actionPrograms.ts`
- 新建 `src/content/programDetails.ts`
- 新建 `src/content/programDetails.test.ts`

### 步骤

1. 先为三个项目编写内容模型测试，验证：
   - 项目标识唯一。
   - 总览锚点与详情页路由唯一。
   - 每个项目有对应图片、总览说明和详情 SEO。
   - 每个项目有五到七条 FAQ。
   - FAQ 问题和答案非空。
2. 扩展项目基础信息，加入：
   - `overviewPath`
   - `detailPath`
   - 总览定位和说明
   - 对应图片与替代文本
   - 详情页标题和 SEO 描述
3. 将详情页专属章节、内容组和 FAQ 放入独立内容文件，避免页面组件维护大段重复常量。
4. 运行内容模型测试。

## 任务二：建立项目页滚动导航能力

### 文件

- 新建 `src/lib/programNavigation.ts`
- 新建 `src/lib/programNavigation.test.ts`
- 新建 `src/components/programs/ProgramsSectionNav.tsx`

### 步骤

1. 先编写工具测试，覆盖合法项目锚点读取、非法锚点回退和项目顺序。
2. 建立项目章节标识、锚点读取和章节切换事件。
3. 实现滚动菜单：
   - 固定在主导航下方。
   - 当前项目高亮。
   - 点击更新锚点并滚动到项目入口。
   - 手机端横向滚动并确保当前项目可见。
   - 尊重减少动态效果设置。
4. 复用“关于”页已经验证的 IntersectionObserver、选择锁和活动项自动居中模式。

## 任务三：将 `/programs` 重构为专业总览

### 文件

- 重写 `src/pages/Actions.tsx`
- 修改 `src/pages/Actions.test.tsx`
- 新建 `src/components/programs/ProgramInvitation.tsx`
- 新建 `src/components/programs/ProgramOverviewEntry.tsx`

### 步骤

1. 先更新页面测试，验证：
   - Nate 第一人称短引和署名存在。
   - 页面没有 Nate 人物大图。
   - 三个入口按固定顺序显示。
   - 三个入口均包含名称、定位、说明、对应图片和详情链接。
   - 总览页不显示对象、周期、状态、费用和 FAQ。
   - 滚动菜单包含三个项目名称。
2. 实现简短项目引言，不设置 CTA。
3. 使用共享入口组件渲染三个项目，保持相近的文字量、图片面积、留白和链接位置。
4. 桌面端保持稳定双栏结构，手机端改为文字在上、图片在下。
5. 删除总览页当前展开的完整营期、三个月路径、研究方法、FAQ 之外的详情内容，并将其迁移到详情页。
6. 保留底部统一联系引导，但主要参与入口放在详情页。

## 任务四：建立共享详情页框架

### 文件

- 新建 `src/pages/ProgramDetail.tsx`
- 新建 `src/pages/ProgramDetail.test.tsx`
- 新建 `src/components/programs/ProgramDetailLayout.tsx`
- 新建 `src/components/programs/ProgramActions.tsx`
- 新建 `src/components/programs/ProgramFaq.tsx`
- 新建 `src/components/programs/ProgramFaqSchema.tsx`

### 步骤

1. 先编写详情页测试，覆盖：
   - 三个合法项目显示各自标题、图片和内容。
   - 未知项目进入 404。
   - 每个项目显示独立 FAQ。
   - FAQ 默认收起并可展开。
   - 参与意向链接带入当前项目标识。
   - 返回项目总览链接带入对应锚点。
2. 实现共享详情页框架：
   - 返回项目总览。
   - 项目标题、定位和现场图片。
   - 内容主体插槽。
   - FAQ。
   - 联系与参与操作区。
3. 使用现有可访问 Accordion 基础组件实现 FAQ，保持克制视觉和清晰展开状态。
4. 为每个详情页注入 FAQPage JSON-LD；只包含当前页面真实可见的问答。
5. 联系方式继续读取集中配置；未提供电话时使用邮箱回退。

## 任务五：实现三个项目的专属详情内容

### 文件

- 新建 `src/components/programs/details/LifeCampDetails.tsx`
- 新建 `src/components/programs/details/ActionGroupDetails.tsx`
- 新建 `src/components/programs/details/PublicProjectsDetails.tsx`

### 步骤

1. 生活共创营迁移和整理：
   - 项目理念。
   - 寒暑假与节假日营。
   - 周末营。
   - 自然、共同生活、共创表达。
   - 安全、医疗、保险、人员照护和费用。
2. 行动小组迁移和整理：
   - 三个月行动路径。
   - 线上茶会、读书会、共学和主题分享。
   - 七日挑战、低碳行动、家庭实践。
   - 线上分享和线下共创。
3. 公共议题项目迁移和整理：
   - 议题方向。
   - 访谈、问卷、田野观察和持续记录。
   - 文章、研究记录和公共分享。
   - 参与与合作方式。
4. 三个页面共享标题层级、内容宽度和间距系统，但允许时间线、内容组和研究列表使用各自最合适的布局。

## 任务六：接入路由、导航和 SEO

### 文件

- 修改 `src/App.tsx`
- 修改 `src/components/Navbar.tsx`
- 修改 `src/components/Navbar.test.tsx`
- 修改 `src/lib/brand.ts`
- 修改 `public/sitemap.xml`

### 步骤

1. 在 `/programs/inquiry` 静态路由之后加入 `/programs/:programId`。
2. 主导航“项目”在总览页和详情页均保持活动状态。
3. 主导航次级菜单继续指向总览页三个锚点，保持“菜单负责定位、详情链接负责深入”的分工。
4. 为三个详情页添加独立标题、描述和 canonical URL。
5. 将三个详情页加入站点地图。
6. 保留 `/actions`、`/actions/inquiry` 和旧锚点兼容逻辑。

## 任务七：验证咨询与参与意向流程

### 文件

- 修改 `src/pages/ActionInquiry.test.tsx`
- 按需修改 `src/pages/ActionInquiry.tsx`

### 步骤

1. 验证从每个详情页进入参与意向时预选正确项目。
2. 验证返回链接回到对应详情页或总览锚点，选择一种一致行为并在测试中固定。
3. 验证直接咨询继续使用电话优先、邮箱回退。
4. 不改变现有提交接口与后端字段。

## 任务八：自动化与浏览器验证

### 自动化

1. 运行新增和相关测试。
2. 运行全量 `npm test`。
3. 运行 `npm run lint`。
4. 运行 `npm run build`。
5. 运行 `git diff --check`。

### 浏览器

1. 桌面视口检查 Nate 短引、滚动菜单和三个入口的视觉平衡。
2. 滚动页面，验证活动项目自动高亮和 URL 锚点更新。
3. 进入三个详情页，检查内容差异、FAQ 展开和参与入口。
4. 在 390px 手机视口检查：
   - 导航横向滚动。
   - 项目入口改为纵向布局。
   - 详情页和 FAQ 无横向溢出。
5. 验证旧 `/actions#action-group` 跳转并滚动到新总览对应入口。
6. 检查 Vite 错误覆盖层和浏览器控制台错误。
