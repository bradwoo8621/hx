# HxBox

最简单的布局容器——带可配置边框、内边距和圆角的 `<div>`。

```tsx
<HxBox border borderRadius="md" paddingX="lg" paddingT="md" paddingB="md">
  <p>盒内内容</p>
</HxBox>

<HxBox paddingX="sm">
  <HxLabel text="带内边距的内容" />
</HxBox>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型（自动传递给子组件） |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |
| `border` | `boolean` | `false` | 显示边框 |
| `borderRadius` | `HxBorderRadius` | — | 圆角尺寸令牌 |
| `paddingX` | `HxPadding` | — | 水平内边距 |
| `paddingY` | `HxPadding` | — | 垂直内边距 |
| `paddingT` | `HxPadding` | — | 顶部内边距 |
| `paddingB` | `HxPadding` | — | 底部内边距 |

同时接受全部 `HxCommonProps`：宽高约束、外边距、flex/grid cell props、`color` 以及 `data-hx-*` 透传。

## 原生 DOM 事件

所有标准 `<div>` 事件均透传：`onClick`、`onScroll`、`onMouseDown`、`onMouseUp`、`onMouseEnter`、`onMouseLeave`、`onMouseMove`、`onMouseOver`、`onMouseOut`、`onKeyDown`、`onKeyUp`、`onFocus`、`onBlur`、`onTouchStart`、`onTouchEnd`、`onTouchMove`、`onPointerDown`、`onPointerUp`、`onPointerEnter`、`onPointerLeave`。

实际使用中，布局容器很少需要 DOM 事件监听。

## 全局配置

```ts
import { configHxBox } from '@hx/components';
configHxBox({ border: false });
```
