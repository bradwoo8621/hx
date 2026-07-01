# HxBadge

用于状态展示的小标签/徽章。渲染 `<span>`。

```tsx
<HxBadge text="新品" color="success" />
<HxBadge text="草稿" color="warning" variant="outline" size="std" />
<HxBadge text="已归档" color="neutral" variant="dashed" />
<HxBadge text="~Status.Active" valueUseI18N />

// 模型绑定——文本反映字段值
<HxBadge $model={form} $field="status" color="primary" />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `ReactNode` | — | 徽章内容 |
| `color` | `HxColor` | — | 文字和背景颜色 |
| `variant` | `'solid' \| 'outline' \| 'dashed'` | `'solid'` | 视觉样式 |
| `size` | `'sm' \| 'std'` | `'sm'` | 尺寸变体 |
| `borderRadius` | `HxLabelBorderRadius \| 'round'` | `'round'` | 圆角。`'round'` = 完全圆形的胶囊形状 |
| `valueUseI18N` | `boolean` | `false` | 将 `text` 视为 i18n 键名 |
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径（响应式文本） |

继承所有 `HxLabel` props，除了 `opaque`、`borderRadius`、`paddingX`。

## 原生 DOM 事件

所有标准 `<span>` 事件透传：`onClick`、`onMouseDown`、`onMouseUp`、`onMouseEnter`、`onMouseLeave`、`onMouseMove`、`onFocus`、`onBlur`。实际中 Badge 通常是纯展示元素。

## 全局配置

```ts
import { configHxBadge } from '@hx/components';
configHxBadge({ size: 'sm', variant: 'solid' });
```
