# HxPopup / HxPopupProvider

锚定到触发元素的弹出层。自动检测视口边界——优先在触发器下方弹出，必要时回退到上方。可在渲染参数中传入 `position` / `alignTo` 强制指定位置。RTL 方向下行内对齐会镜像:弹出层优先与触发器行首对齐,视口宽度不足时回退到另一侧。

```tsx
<HxPopupProvider zIndex={2000} gapToEdge={5}>
  <HxButton text="打开菜单" />
  <HxPopup>
    <HxFlex direction="dir-y">
      <HxButton text="编辑" variant="ghost" onClick={edit} />
      <HxButton text="删除" variant="ghost" color="danger" onClick={del} />
    </HxFlex>
  </HxPopup>
</HxPopupProvider>

// 匹配触发器宽度
<HxPopupProvider sameWidthAtMinimum>
  <HxInput $model={form} $field="search" />
  <HxPopup>
    {/* 弹出层宽度 >= 输入框宽度 */}
  </HxPopup>
</HxPopupProvider>
```

## Props（通过 HxPopupProvider）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `zIndex` | `number` | `2000` | CSS z-index |
| `gapToEdge` | `number` | `5` | 触发器与弹出层间距（像素） |
| `sameWidthAtMinimum` | `boolean` | — | 弹出层最小宽度等于触发器宽度 |
| `steady` | `ReactNode` | — | 弹出层关闭时仍保持挂载的常驻内容（例如数据加载器） |

## 渲染参数（HxPopupRenderOptions）

传给 `show()` / `relayout()` 以及 `show` 事件监听器。继承自 `HxRectRange`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `'top' \| 'bottom'` | 自动 | 强制弹出在触发器上方 / 下方。不传时依次尝试下方、上方，最后仍为下方 |
| `alignTo` | `'left' \| 'right'` | 自动 | 强制与触发器的水平对齐方式。按逻辑方向解释：`left` 表示行首，因此在 RTL 下会镜像 |
| `minWidth` / `maxWidth` / `minHeight` / `maxHeight` | `number` | — | 尺寸约束；`minWidth` 不会小于触发器宽度 |

## 延迟渲染 Portal

弹出层的 portal 只在 `show()` 之后才渲染到 DOM；隐藏时不产生任何 portal 节点，从而减小初始 DOM 体积。需要始终挂载的组件（例如 `HxSelectOptionsHolder`）请使用 `steady` 属性。

## 生命周期状态机

```
hidden → prepare → prepared → active → hide → hidden
```

## Hook

`useHxPopup()`——在弹出层内容中访问：

```ts
const { hide, relayout, on, off, emit } = useHxPopup();
```

`hide()` 关闭弹出层，`relayout(triggerEl, options)` 请求重新计算位置。`show(triggerEl, options)` 需要触发元素，因此打开动作通常由触发组件发起。两者都接收 `HxPopupRenderOptions`（见上文）。

## 原生 DOM 事件

弹出层转发所有标准 DOM 事件。实际中很少需要——弹出层显隐由 `useHxPopup()` 控制，键盘导航由组件内部处理。

## 全局配置

```ts
import { configHxWithPopup } from '@hx/components';
configHxWithPopup({ zIndex: 2000, gapToEdge: 5 });
```
