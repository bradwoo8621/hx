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
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |
| `color` | `HxColor` | `'primary'` | 触发器按钮颜色 |
| `variant` | `HxButtonVariant` | `'solid'` | 触发器按钮变体 |
| `leading` | `ReactNode` | **必填** | 触发器内容（点击切换弹出层） |
| `tailing` | `ReactNode` | **必填** | 弹出层下拉内容 |
| `zIndex` | `number` | 配置默认值 | 弹出层 z-index |
| `gapToEdge` | `number` | 配置默认值 | 触发器与弹出层间距（像素） |

## 子组件

- **`HxActionsLeadingContent`** — 弹出层显隐状态、外部点击检测、键盘事件处理
- **`HxActionsTailingContent`** — 弹出层渲染，通过 `data-hx-hover` 管理悬停

## 原生 DOM 事件

触发器按钮和弹出层内容上的所有事件均透传。实际使用中，交互通过 `leading`/`tailing` 内容自身的事件（菜单项的 `onClick`），键盘导航由组件内部处理。

## 键盘导航

- **Escape** — 关闭弹出层
- **Enter / Space**（触发器上）— 切换弹出层
- **上/下箭头** — 弹出层内导航
- **Tab** — 通过 `data-hx-hover` 管理焦点

## 全局配置

```ts
import { configHxActions } from '@hx/components';
configHxActions({ color: 'primary', variant: 'solid' });
```
