# HxOverlay

基础遮罩层组件——基于 Portal 的模态框/抽屉/提示系统。内容通过 `HxOverlayPortalRoot` 渲染到 `document.body`。通常通过更高层组件（`HxAlert`、`HxToast`、`HxPopup`）使用。

```tsx
// 对话框，带遮罩
<HxOverlay role="dialog" width="md" hideOnClickBackdrop hideOnEscape>
  <HxOverlayBackdrop />
  <HxOverlayContent>
    <h2>对话框标题</h2>
    <p>内容在这里</p>
  </HxOverlayContent>
</HxOverlay>

// 右侧抽屉
<HxOverlay role="drawer-right" width="md">
  <HxOverlayBackdrop />
  <HxOverlayContent>
    <HxPanel title="设置">...</HxPanel>
  </HxOverlayContent>
</HxOverlay>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `role` | `HxOverlayRole` | — | 遮罩层类型（见下） |
| `width` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'screen'` | — | 内容宽度 |
| `maxHeight` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'screen'` | — | 最大内容高度 |
| `zIndex` | `number` | `1000` | CSS z-index |
| `hideOnClickBackdrop` | `boolean` | `false` | 点击遮罩时关闭 |
| `hideOnEscape` | `boolean` | `false` | 按 Escape 键时关闭 |

## Role 值

| Role | 行为 |
|------|------|
| `'alert'` | 居中模态框，带遮罩 |
| `'dialog'` | 居中模态框，带遮罩 |
| `'drawer-left'` | 从左侧滑入 |
| `'drawer-right'` | 从右侧滑入 |
| `'drawer-top'` | 从顶部滑入 |
| `'drawer-bottom'` | 从底部滑入 |
| `'toast-top-left'` | 固定左上角 |
| `'toast-top-center'` | 固定顶部居中 |
| `'toast-top-right'` | 固定右上角 |
| `'toast-bottom-left'` | 固定左下角 |
| `'toast-bottom-center'` | 固定底部居中 |
| `'toast-bottom-right'` | 固定右下角 |

## 子组件

| 组件 | 作用 |
|------|------|
| `HxOverlayBackdrop` | 半透明遮罩，带 CSS 过渡动画 |
| `HxOverlayContent` | 内容容器，带焦点锁定和页面滚动锁定 |
| `HxOverlayPortal` | 通过 React Portal 渲染到 `document.body` |
| `HxOverlayPortalRoot` | Portal 目标 DOM 节点（每个应用包含一次） |
| `HxOverlayInternalProvider` | 生命周期状态：`entering → entered → exiting → exited` |

## 全局配置

```ts
import { configHxOverlay } from '@hx/components';
configHxOverlay({ zIndex: 1000, hideOnClickBackdrop: false, hideOnEscape: false });
```
