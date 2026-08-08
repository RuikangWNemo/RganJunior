# 项目页面字体统一实施计划

1. 删除 `src/index.css` 中的 `--font-program-editorial` 变量。
2. 删除 `.programs-overview-page` 与 `.program-detail-page` 的专属字体覆盖。
3. 保留组件中的 `font-serif` 标题角色，使标题使用全站手写衬线字体。
4. 让正文、菜单和 FAQ 答案自然继承全站手写无衬线字体。
5. 运行项目相关测试、TypeScript、Lint、生产构建和 `git diff --check`。
6. 在桌面与 390px 手机视口检查总览和详情页的计算字体、布局尺寸与控制台错误。
