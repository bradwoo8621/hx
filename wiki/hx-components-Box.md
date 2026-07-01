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
| `borderRadius` | `HxBoxBorderRadius` | — | Border radius size token |
| `paddingX` | `HxBoxPaddingX` | — | Horizontal padding |
| `paddingT` | `HxBoxPaddingT` | — | Top padding |
| `paddingB` | `HxBoxPaddingB` | — | Bottom padding |

## Native DOM Events (on `<div>`)

`onClick`, `onMouseDown`, `onMouseUp`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOver`, `onMouseOut`, `onKeyDown`, `onKeyUp`, `onFocus`, `onBlur`, `onScroll`, `onTouchStart`, `onTouchEnd`, `onTouchMove`, `onPointerDown`, `onPointerUp`, `onPointerEnter`, `onPointerLeave`.

## Global Config

```ts
import { configHxBox } from '@hx/components';
configHxBox({ border: false });
```
