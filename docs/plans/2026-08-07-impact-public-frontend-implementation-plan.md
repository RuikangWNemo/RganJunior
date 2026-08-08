# Impact / 影响公共前端实施计划

日期：2026-08-07

## 实施边界

完成 `/impact` 与 `/impact/awards` 两个公共页面、导航子菜单、页面元数据、站点地图和测试。当前只读取仓库内已核验资料，不连接数据库，不展示未核验的活动总数、家庭总数、年龄分布、城市分布或家长反馈。

## 数据层

新增 `src/content/impact.ts`，定义：

- `ImpactMetric`：数值、标签、说明、日期和来源。
- `ImpactRelationship`：少年与家庭、伙伴、土地、公共行动的关系。
- `ImpactAction`：已有记录支持的小行动。
- `ImpactEvidence`：竞赛、发表、论坛和实践记录。
- `ImpactRepository`：未来 Supabase provider 需要实现的统一读取接口。

当前 provider 使用以下已有资料：

- `src/pages/Journey.tsx` 中的 28 名同学及家长、2000+ 队伍、前 72 名和 CTB 前 3.6%。
- `src/content/archiveContent.ts` 中的 CTB、YSA Journal、Claremont 与活动资料路径。
- `src/content/programDetails.ts` 中的三个月行动机制。

## 页面与组件

1. 新增 `src/components/impact/ImpactReveal.tsx`，统一低强度进入动画和 reduced-motion 降级。
2. 新增 `src/components/impact/RelationshipMap.tsx`，桌面为关系网络，移动为纵向可读关系链。
3. 新增 `src/pages/Impact.tsx`，包含首屏、证据数字、关系图、双线成长观察、小行动和三个月节奏。
4. 新增 `src/pages/ImpactAwards.tsx`，用真实照片和资料图呈现竞赛、发表、论坛与实践档案。
5. 页面中不渲染空指标，不出现虚构头像、虚构前后照片或虚构反馈。

## 路由与导航

- `src/App.tsx`：加入 `/impact` 和 `/impact/awards`。
- `src/components/Navbar.tsx`：在田野笔记之后、加入我们之前加入 Impact，并为桌面和移动端提供“统计 / 获奖情况”子菜单。
- `src/components/Navbar.test.tsx`：覆盖顺序、活动状态和两个子菜单路由。
- `src/lib/brand.ts` 与相关测试：加入中英文页面标题和描述。
- `public/sitemap.xml`：加入两个公开 URL。

## 验证

- 新增 Impact 页面测试，验证已核验数字、数据说明、关系图文本替代和获奖记录。
- 运行应用类型检查、相关测试、完整测试、Lint、生产构建和 `git diff --check`。
- 启动本地服务器，在 1440px 桌面与 390px 移动尺寸检查两个页面和导航。
- 检查无横向溢出、真实图片裁切、键盘焦点、中英文切换和 reduced motion。
