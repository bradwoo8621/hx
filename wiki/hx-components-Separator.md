# HxSeparator

Visual divider line. Renders `<div>`.

```tsx
// Horizontal divider with vertical margin
<HxSeparator direction="dir-x" color="neutral" marginY="md" />

// Vertical divider between inline elements
<HxFlex direction="dir-x" alignItems="center">
  <span>Left</span>
  <HxSeparator direction="dir-y" marginX="sm" />
  <span>Right</span>
</HxFlex>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'dir-x' \| 'dir-y'` | `'dir-x'` | Orientation. `'dir-x'` = horizontal, `'dir-y'` = vertical |
| `color` | `HxColor` | — | Line color |
| `size` | size token | — | Line thickness |
| `marginX` | size token | `none` | Horizontal margin |
| `marginY` | size token | `none` | Vertical margin |
| `$model` | `HxObject<T>` | — | Reactive model |

## Native DOM Events (on `<div>`)

All standard `<div>` events: `onClick`, `onMouseDown/Up/Enter/Leave/Move/Over/Out`, `onKeyDown/Up`, `onFocus`, `onBlur`, `onScroll`.

## Global Config

```ts
import { configHxSeparator } from '@hx/components';
configHxSeparator({ color: 'neutral' });
```
