# HxActions

下拉操作菜单——将触发器按钮与包含操作项的弹出层组合在一起。

```tsx
<HxActions
  $model={form}
  leading={<HxButton text="操作" />}
  tailing={
    <HxFlex direction="dir-y">
      <HxButton text="编辑" variant="ghost" onClick={edit} />
      <HxButton text="复制" variant="ghost" onClick={dup} />
      <HxSeparator />
      <HxButton text="删除" variant="ghost" color="danger" onClick={del} />
    </HxFlex>
  }
  color="primary"
  variant="outline"
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 可选的响应式模型 |
| `color` | `HxColor` | `'primary'` | 触发器按钮颜色 |
| `variant` | `HxButtonVariant` | `'solid'` | 触发器按钮变体 |
| `leading` | `HxActionsLeading` | — | 触发器内容（点击切换弹出层）；省略时默认使用"更多"（省略号）按钮 |
| `tailing` | `HxActionsTailing` | **必填** | 弹出层下拉内容 |
| `zIndex` | `number` | 配置默认值 | 弹出层 z-index |
| `gapToEdge` | `number` | 配置默认值 | 触发器与弹出层间距（像素） |

外加 `HxFlex` 容器 props（padding / margin / 边框、`alignItems`、`alignContent`、`justifyContent`、`gapY` 及 flex / grid cell props；`direction` 与 `wrap` 在触发器上固定为 `dir-x` / 不换行）。

## 子组件

- **`HxActionsLeadingContent`** — 弹出层显隐状态、外部点击检测、键盘事件处理
- **`HxActionsTailingContent`** — 弹出层渲染，通过 `data-hx-hover` 管理悬停

## 原生 DOM 事件

触发器按钮和弹出层内容上的所有事件均透传。实际使用中，交互通过 `leading`/`tailing` 内容自身的事件（菜单项的 `onClick`），键盘导航由组件内部处理。

## 键盘导航

- **Escape** — 关闭弹出层
- **Enter / Space** — 弹出层打开时选中当前悬停项
- **上/下箭头** — 弹出层关闭时将其打开；打开状态下移动到上一项 / 下一项

## 全局配置

```ts
import { configHxActions } from '@hx/components';
configHxActions({ color: 'primary', variant: 'solid' });
```
