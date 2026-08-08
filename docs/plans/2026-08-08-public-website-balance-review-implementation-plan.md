# 阿柑少年网站平衡设计评审页实施计划

1. 在 `docs/design-system/public-website-balance-review/` 创建与正式 React 路由隔离的静态评审页，不修改正式页面、内容数据、SEO 和业务交互。
2. 在评审页 CSS 中定义已确认的字体、三层字号、颜色、8px 间距、12 栏容器、图片比例和响应式 token。
3. 制作“现状 / 新标准”项目顶部左右对照，准确展示当前 14.4px / 105.6px 关系和新的 60px / 34px / 18px 三层关系。
4. 制作 Paper → Peach → Paper → Warm Sand → Join Green 色带、对比度标注和实际页面色块示例。
5. 制作基于现有项目页的 sticky 横向子菜单，包含 active 下划线、键盘焦点、手机 overflow 和 active item 自动居中。
6. 使用项目现有真实摄影资产制作两组交替 Standard Media Text，验证左图右文、右图左文与手机统一图先顺序。
7. 制作 Feature + Secondary 主次组合，通过内容 slots 而非整体缩放建立 8/4 栏层级。
8. 制作 Full-width Photo Essay：桌面 16:7 满宽照片、手机 4:3 crop，下方只放手写短标题、一段 Body Sans 说明和同层级 context。
9. 添加 1440px、820px、390px 布局说明，并在 320px 宽度验证页面级横向滚动、图片阅读顺序和正文最小字号。
10. 运行静态链接和资产检查，启动 Vite 开发服务器，用桌面、平板、手机与 reduced-motion 环境完成浏览器验证和截图。
