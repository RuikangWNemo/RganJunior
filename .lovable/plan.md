

# 首页Logo冲击力 + 滚动缩进导航栏交互

## 概述
在首页Hero区域居中展示阿柑mascot大Logo（有冲击力），当用户向下滚动时，Logo通过丝滑动画缩小并移动到左上角导航栏位置，形成视觉连续感。

## 实现方案

### 1. Hero区域 — 大Logo展示
- 在Hero中央（标题上方）放置 `mascot-full.png`，尺寸较大（约 w-32 md:w-48），带入场动画（scale-in + fade-in）
- 添加微妙的呼吸动画（缓慢上下浮动），增强生命力

### 2. 滚动驱动的Logo过渡动画
- 创建一个**固定定位的Logo元素**（`position: fixed`），初始状态在页面中央（与Hero Logo重合）
- 监听 `window.scrollY`，计算滚动进度（0→1，大约在 0~300px 区间）
- 根据进度插值：
  - **位置**：从屏幕中央 → 左上角导航栏Logo位置
  - **尺寸**：从大（~120-192px）→ 小（~32-40px）
  - **透明度**：Hero中的静态Logo在滚动时淡出
- 过渡完成后，固定Logo与导航栏Logo无缝衔接（隐藏Navbar中原有Logo，显示这个动画Logo）

### 3. Navbar适配
- 当在首页且未滚动时，隐藏Navbar中的Logo（因为Hero有大Logo）
- 滚动过渡完成后，动画Logo"停靠"在Navbar位置，恢复Navbar正常显示

### 4. 非首页行为
- 其他页面保持Navbar Logo正常显示，不做特殊动画

## 技术细节
- 在 `Index.tsx` 中添加固定定位的动画Logo组件
- 用 `useEffect` + `requestAnimationFrame` 监听滚动，计算 `transform: translate() scale()`
- Navbar接收一个 `hidelogo` prop（通过判断路由 + 滚动状态）
- 所有过渡使用 `cubic-bezier(0.4, 0, 0.2, 1)`

## 涉及文件
- `src/pages/Index.tsx` — 添加Hero大Logo + 固定定位动画Logo
- `src/components/Navbar.tsx` — 首页时根据滚动状态隐藏/显示Logo
- `src/index.css` — 添加呼吸浮动动画keyframe

