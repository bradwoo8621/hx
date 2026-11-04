# HxPopup / HxPopupProvider

锚定到触发元素的弹出层。公共入口是 `HxPopupProvider`：触发器通过 `trigger` prop 传入，弹出内容作为 `children`。`HxPopup` 本身没有从包入口导出，不要直接渲染它。

自动检测视口边界——优先在触发器下方，必要时回退到上方。可传入 `position` / `alignTo` 强制指定。RTL 方向下行内对齐会镜像。

```tsx
<HxPopupProvider
  zIndex={2000}
  gapToEdge={5}
  sameWidthAtMinimum
  trigger={<HxButton text="打开菜单" />}
>
  <HxFlex direction="dir-y">
    <HxButton text="编辑" variant="ghost" onClick={edit} />
    <HxButton text="删除" variant="ghost" color="danger" onClick={del} />
  </HxFlex>
</HxPopupProvider>

// 匹配触发器宽度（provider 上 sameWidthAtMinimum 必填）
<HxPopupProvider sameWidthAtMinimum trigger={<HxInput $model={form} $field="search" />}>
  {/* 弹出层宽度 >= 输入框宽度 */}
</HxPopupProvider>
```

## Props（HxPopupProvider）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `trigger` | `ReactNode` | — | **必填。** 触发元素 |
| `children` | `ReactNode` | — | **必填。** 弹出内容 |
| `sameWidthAtMinimum` | `boolean` | — | **必填。** 弹出层最小宽度跟随触发器；为 `false` 时 `minWidth` 渲染参数被忽略 |
| `zIndex` | `number` | `2000` | CSS z-index，最低 `20` |
| `gapToEdge` | `number` | `5` | 弹出层与**视口**边缘的最小间距（px），最低 `2` |
| `steady` | `ReactNode` | — | 弹出层关闭时仍保持挂载的常驻内容（例如数据加载器） |

除 `data-hx-popup` / `data-hx-popup-state` 之外的数据属性会透传到弹出层根节点。

## 渲染参数（HxPopupRenderOptions）

传给 `show()` / `relayout()`。继承自 `HxRectRange`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `'top' \| 'bottom'` | 自动 | 强制弹出在触发器上方 / 下方 |
| `alignTo` | `'left' \| 'right'` | 自动 | 强制与触发器的水平对齐。按逻辑方向解释：`left` 表示行首，因此在 RTL 下会镜像 |
| `minWidth` / `maxWidth` / `minHeight` / `maxHeight` | `number` | — | 尺寸约束。`minWidth` 仅在 provider 的 `sameWidthAtMinimum` 为 `true` 时生效 |

## 延迟渲染 Portal

弹出层的 portal 只在显示之后才渲染到 DOM；隐藏时不产生任何 portal 节点。需要始终挂载的组件（例如 `HxSelectOptionsHolder`）请使用 `steady`。

## 生命周期状态机

```
hidden → prepare → prepared → active → hide → hidden
```

`hide → hidden` 由关闭过渡驱动。同时总有一个基于时间的兜底，因此过渡永远不触发时不会卡在 `hide`。

## Hook

`useHxPopup()`——在弹出层内容中访问：

```ts
const {hide, show, relayout, isVisible, checkFocusElement, on, off, emit} = useHxPopup();
```

`hide()` 关闭弹出层；`relayout(triggerEl, options)` 重新计算位置；`show(triggerEl, options)` 需要触发元素。`isVisible(callback)` 基于 portal 的生命周期状态同步回答。

## 触发行为由 `usePopupVisibleRef` 提供

弹出层**不会**自行安装外部点击/聚焦检测或祖先滚动/尺寸变化重定位。自定义触发器必须使用 `usePopupVisibleRef`，否则弹出层会一直保持打开。

```ts
const {context, visibleRef} = usePopupVisibleRef({elementRef: triggerRef});
visibleRef.current.show(disabled, {position: 'bottom'});
visibleRef.current.hide();
```

参见 [Hooks](./cn-hx-components-Hooks#usepopupvisibleref)。

## 原生 DOM 事件

`HxPopup` 只接受 data 属性 props（以及上面的尺寸 props），不接受标准 DOM 事件处理器。事件应挂在触发器或弹出内容内部元素上。

## 全局配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `zIndex` | `number` | `2000` | 弹出层基础 z-index，最小 `20` |
| `gapToEdge` | `number` | `5` | 弹出层与视口边缘的最小间距（px），最小 `2` |
| `showAnimationTime` | `number` | `200` | 显示时的兜底等待时间（ms）。仅在未声明过渡/动画时使用 |
| `closeAnimationTime` | `number` | `50` | 关闭时的兜底等待时间（ms） |

```ts
import { configHxWithPopup } from '@hx/components';
configHxWithPopup({zIndex: 2000, gapToEdge: 5, showAnimationTime: 200, closeAnimationTime: 50});
```
