# HxOverlay

基础遮罩层组件——基于 Portal 的模态框/抽屉/提示系统。内容通过 Portal 根节点渲染到 `document.body`，通常通过更高层组件（`HxAlert`、`HxToast`、`HxDialog`、`HxDrawer`）使用。

每个遮罩层都是**模板**：`id` 必填，在 `useHxOverlay().show(id, $model)` 调用前不渲染任何内容，同一个 id 可以重复打开，产生多个同时存在的实例。定位与滑入动画均使用逻辑属性，因此 RTL 方向下抽屉和提示会镜像到对侧边缘。

```tsx
const overlay = useHxOverlay();

// 注册模板
<HxDialog id="profile-dialog" width="md" hideOnClickBackdrop hideOnEscape>
  <h2>对话框标题</h2>
  <p>内容在这里</p>
</HxDialog>

// 打开
overlay.show('profile-dialog', form);

// 薄封装组件
<HxDrawer id="side-drawer" position="right" width="xs">...</HxDrawer>
<HxToast id="saved-toast" message="已保存" />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `string` | — | **必填。** 供 `show()` 使用的模板 id |
| `role` | `HxOverlayRole` | — | 遮罩层类型（见下） |
| `width` | `HxSize`（`'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`） | — | 内容宽度 |
| `maxHeight` | `HxSize`（`'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`） | — | 最大内容高度 |
| `zIndex` | `number` | `1000` | CSS z-index；最小限制为 `10` |
| `hideOnClickBackdrop` | `boolean` | 配置（`false`） | 点击遮罩时关闭 |
| `hideOnEscape` | `boolean` | 配置（`false`） | 按 Escape 键时关闭 |
| `autoGrabFocus` | `boolean` | `true` | 打开时聚焦 `[data-hx-first-element]`（没有则第一个可聚焦元素）；一个都没有时聚焦内容容器 |
| `tabTrap` | `boolean` | `true` | 让 `Tab` / `Shift+Tab` 在遮罩层内部循环 |

## 程序化显示与关闭

```tsx
const overlay = useHxOverlay();
overlay.show('confirm', model, handle => {
  // 实例挂载后调用一次，在这里保存 handle
});
```

- 显示回调只会调用**一次**，时机在实例挂载完成、Portal 已存在于 DOM 之后，但早于开场动画结束。
- `hide(handle)` 需要遮罩层已经显示出来才会生效。在挂载那一帧内发起的关闭（例如在显示回调里直接调用）会被拒绝并打印控制台警告。需要"条件不满足就不弹"时，应在调用 `show()` **之前**校验。
- 在遮罩层内容内部调用 `useHxOverlayInstance().hide()` 遵循同样的规则。

## 焦点与键盘

遮罩层打开期间接管键盘：

- 内容容器和遮罩本身都可被程序聚焦（`tabindex="-1"`），点击空白区域时焦点仍留在遮罩层内。
- 无论焦点在内容、遮罩还是内部控件上，按 `Escape` 都能关闭（需开启 `hideOnEscape`）。
- **Portal 根节点**负责 `Tab` / `Shift+Tab` 循环（不是内容容器）。焦点在遮罩上时，向前从 `[data-hx-first-element]`（没有则第一个可聚焦元素）进入，向后从最后一个可聚焦元素进入。
- 关闭时，焦点回到打开遮罩层时正在聚焦的元素（前提是该元素仍在文档中）。`HxToast` 不做此还原。
- `HxToast` 两者都关闭（`autoGrabFocus={false} tabTrap={false}`）。

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

`HxDialog` / `HxDrawer` 的 props 省略 `role`。

## 子组件

| 组件 | 作用 |
|------|------|
| `HxOverlayBackdrop` | 带过渡动画的遮罩；负责页面滚动锁定（toast role 跳过） |
| `HxOverlayContent` | 内容容器；负责自动聚焦与焦点还原 |
| `HxOverlayPortal` | 把单个遮罩层实例渲染到 `document.body` |
| `HxOverlayPortalRoot` | 每实例的 Portal 目标节点；同时负责 Tab 循环 |
| `HxOverlayInternalContextProvider` | 实例级上下文：`hide`、`hideComplete`、`onHide` / `offHide` |

可观察的生命周期状态由遮罩写入 `data-hx-overlay-state`：`hidden → prepare → active → hide`。不存在 `HxOverlayInternalProvider` 导出，也不存在 `entering → entered → exiting → exited` 状态机。

## 原生 DOM 事件

遮罩与内容组件只接受 data 属性 props，不接受标准事件处理器。遮罩行为由 props 控制；`HxToast` 额外接受 `onDismissed`。

## 全局配置

```ts
import { configHxOverlay } from '@hx/components';
configHxOverlay({
  zIndex: 1000,               // 最低 10
  hideOnClickBackdrop: false,
  hideOnEscape: false,
  toastDismissDelay: 5000,    // 最低 2000
  toastPosition: 'top-right',
  drawerPosition: 'right'
});
```
