# HxOverlay

基础遮罩层组件——基于 Portal 的模态框/抽屉/提示系统。内容通过 `HxOverlayPortalRoot` 渲染到 `document.body`。通常通过更高层组件（`HxAlert`、`HxToast`、`HxPopup`）使用。

定位与滑入动画均使用逻辑属性。RTL 方向下抽屉和提示会镜像到对侧边缘：`drawer-left` 从行首（右侧）滑入，`toast-tr` 停靠在左上角对应位置等。抽屉/提示的 role 描述的是 LTR 布局，实际位置随 `direction: rtl` 翻转。

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

// 或使用薄封装组件
<HxDialog width="md" hideOnClickBackdrop hideOnEscape>...</HxDialog>
<HxDrawer position="right" width="xs">...</HxDrawer>

// 通过 position 定位的 Toast
<HxToast position="top-right" message="已保存" />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `role` | `HxOverlayRole` | — | 遮罩层类型（见下） |
| `width` | `HxSize`（`'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`） | — | 内容宽度 |
| `maxHeight` | `HxSize`（`'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`） | — | 最大内容高度 |
| `zIndex` | `number` | `1000` | CSS z-index |
| `hideOnClickBackdrop` | `boolean` | `false` | 点击遮罩时关闭 |
| `hideOnEscape` | `boolean` | `false` | 按 Escape 键时关闭 |
| `autoGrabFocus` | `boolean` | `true` | 打开时聚焦 `[data-hx-first-element]`（没有则第一个可聚焦元素）；一个可聚焦元素都没有时聚焦内容容器 |
| `tabTrap` | `boolean` | `true` | 让 `Tab` / `Shift+Tab` 在遮罩层内部循环 |

## 程序化显示与关闭

```tsx
const overlay = useHxOverlay();
overlay.show('confirm', model, handle => {
  // 实例挂载后调用一次，在这里保存 handle
});
```

- 显示回调只会调用**一次**，时机在实例挂载完成、Portal 已存在于 DOM 之后，但早于开场动画结束。它的作用是把实例 handle 交回给调用方。
- `hide(handle)` 需要遮罩层已经显示出来才会生效。在挂载那一帧内发起的关闭（例如在显示回调里直接调用）会被拒绝并打印控制台警告，因为此时开场动画尚未开始。需要"条件不满足就不弹"时，应在调用 `show()` **之前**校验，而不是打开后立刻关闭。
- 在遮罩层内容内部调用 `useHxOverlayInstance().hide()` 遵循同样的规则。

## 焦点与键盘

遮罩层打开期间接管键盘：

- 内容容器和遮罩本身都可被程序聚焦（`tabindex="-1"`），所以点击对话框的空白区域或遮罩时，焦点仍留在遮罩层内，而不会掉到 `document.body` 上。
- 无论焦点在内容、遮罩还是内部控件上，按 `Escape` 都能关闭（需开启 `hideOnEscape`）。
- `Tab` / `Shift+Tab` 在遮罩层内循环。焦点在遮罩上时，向前从 `[data-hx-first-element]`（没有则第一个可聚焦元素）进入，向后从最后一个可聚焦元素进入。
- `HxToast` 两者都关闭（`autoGrabFocus={false} tabTrap={false}`）：通知出现时不夺焦点，点击时也不会变成可聚焦元素。

## Role 值

| Role | 行为 |
|------|------|
| `'alert'` | 居中模态框，带遮罩 |
| `'dialog'` | 居中模态框，带遮罩 |
| `'drawer-left'` | 从左侧滑入 |
| `'drawer-right'` | 从右侧滑入 |
| `'drawer-top'` | 从顶部滑入 |
| `'drawer-bottom'` | 从底部滑入 |
| `'toast-tl'` | 固定左上角 |
| `'toast-tr'` | 固定右上角 |
| `'toast-bl'` | 固定左下角 |
| `'toast-br'` | 固定右下角 |

## 封装组件

| 组件 | 写入的 role | 额外 prop |
|------|------------|-----------|
| `HxDialog` | `role="dialog"` | — |
| `HxDrawer` | 由 `position` 映射 | `position: 'top' \| 'right' \| 'bottom' \| 'left'`（默认 `'right'`，或配置中的 `drawerPosition`） |

## 子组件

| 组件 | 作用 |
|------|------|
| `HxOverlayBackdrop` | 半透明遮罩，带 CSS 过渡动画 |
| `HxOverlayContent` | 内容容器，带焦点锁定和页面滚动锁定 |
| `HxOverlayPortal` | 通过 React Portal 渲染到 `document.body` |
| `HxOverlayPortalRoot` | Portal 目标 DOM 节点（每个应用包含一次） |
| `HxOverlayInternalProvider` | 生命周期状态：`entering → entered → exiting → exited` |

## 原生 DOM 事件

所有子组件转发标准事件。实际中很少需要——遮罩层行为由 props 控制（`hideOnEscape`、`hideOnClickBackdrop`、`onConfirmed`、`onDismissed`）。

## 全局配置

```ts
import { configHxOverlay } from '@hx/components';
configHxOverlay({ zIndex: 1000, hideOnClickBackdrop: false, hideOnEscape: false, toastPosition: 'top-right', drawerPosition: 'right' });
```
