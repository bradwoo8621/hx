# HxBadge

用于状态展示的小标签/徽章。渲染 `<span>`。

```tsx
<HxBadge text="新品" color="success" />
<HxBadge text="草稿" color="warn" variant="outline" size="std" />
<HxBadge text="已归档" color="waive" variant="dashed" />
<HxBadge text="~Status.Active" valueUseI18N />

// 模型绑定——文本反映字段值
<HxBadge $model={form} $field="status" color="primary" />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `ReactNode` | — | 徽章内容 |
| `color` | `HxColor` | `'primary'` | 文字和背景颜色 |
| `variant` | `'solid' \| 'outline' \| 'dashed'` | `'solid'` | 视觉样式 |
| `size` | `'sm' \| 'std'` | `'sm'` | 尺寸变体 |
| `borderRadius` | `HxLabelBorderRadius \| 'round'` | `'round'` | 圆角。`'round'` = 完全圆形的胶囊形状 |
| `paddingX` | `HxLabelPaddingX` | `'md'` | 水平内边距 |
| `valueUseI18N` | `boolean` | `false` | 对 `$model` / `$field` 读到的值应用 i18n |
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径（响应式文本） |

继承所有 `HxLabel` props，除了 `opaque`、`borderRadius`。

## 原生 DOM 事件

所有标准 `<span>` 事件透传：`onClick`、`onMouseDown`、`onMouseUp`、`onMouseEnter`、`onMouseLeave`、`onMouseMove`、`onFocus`、`onBlur`。实际中 Badge 通常是纯展示元素。

## 全局配置

设置所有 `HxBadge` 的默认值。默认值在渲染时读取，因此配置全局立即生效；徽章上显式传入的 prop 优先级更高。

```ts
import { configHxBadge } from '@hx/components';

configHxBadge({
  color: 'primary',       // 默认：primary
  variant: 'solid',       // 默认：solid
  size: 'sm',             // 默认：sm
  borderRadius: 'round',  // 默认：round
  paddingX: 'md',         // 默认：md
});
```
