# HxSeparator

视觉分割线。渲染 `<div>`。

```tsx
// 水平分割线，带垂直边距
<HxSeparator direction="dir-x" color="neutral" marginY="md" />

// 垂直分割线（行内元素间）
<HxFlex direction="dir-x" alignItems="center">
  <span>左侧</span>
  <HxSeparator direction="dir-y" marginX="sm" />
  <span>右侧</span>
</HxFlex>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `direction` | `'dir-x' \| 'dir-y'` | `'dir-x'` | 方向。`'dir-x'` = 水平线，`'dir-y'` = 垂直线 |
| `color` | `HxColor` | — | 线条颜色 |
| `size` | 尺寸令牌 | — | 线条粗细 |
| `marginX` | 尺寸令牌 | `none` | 水平外边距 |
| `marginY` | 尺寸令牌 | `none` | 垂直外边距 |
| `$model` | `HxObject<T>` | — | 响应式模型 |

## 原生 DOM 事件（`<div>` 上）

所有标准 `<div>` 事件。

## 全局配置

```ts
import { configHxSeparator } from '@hx/components';
configHxSeparator({ color: 'neutral' });
```
