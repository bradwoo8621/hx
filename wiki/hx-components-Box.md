# HxBox

The simplest layout container — a `<div>` with configurable border, padding, and border radius.

```tsx
<HxBox border borderRadius="md" paddingX="lg" paddingT="md" paddingB="md">
  <p>Boxed content</p>
</HxBox>

<HxBox paddingX="sm">
  <HxLabel text="Padded content" />
</HxBox>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model (auto-propagated to children) |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |
| `border` | `boolean` | `false` | Show a border |
| `borderRadius` | `HxBorderRadius` | — | Border radius size token |
| `paddingX` | `HxPadding` | — | Horizontal padding |
| `paddingY` | `HxPadding` | — | Vertical padding |
| `paddingT` | `HxPadding` | — | Top padding |
| `paddingB` | `HxPadding` | — | Bottom padding |

All `HxCommonProps` are accepted as well: width/height constraints, margins, flex/grid cell props, `color`, and the `data-hx-*` pass-through.

## Native DOM Events

All standard `<div>` events are forwarded: `onClick`, `onScroll`, `onMouseDown`, `onMouseUp`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOver`, `onMouseOut`, `onKeyDown`, `onKeyUp`, `onFocus`, `onBlur`, `onTouchStart`, `onTouchEnd`, `onTouchMove`, `onPointerDown`, `onPointerUp`, `onPointerEnter`, `onPointerLeave`.

In practice, layout containers rarely need DOM event listeners.

## Global Config

```ts
import { configHxBox } from '@hx/components';
configHxBox({ border: false });
```
