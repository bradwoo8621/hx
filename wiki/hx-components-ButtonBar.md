# HxButtonBar / HxCompactButtonBar

Horizontal bar grouping buttons into leading (left) and tailing (right) sections. Extends `HxFlex`.

```tsx
<HxButtonBar
  leading={
    <>
      <HxButton text="Save" onClick={save} />
      <HxButton text="Save & Close" onClick={saveClose} />
    </>
  }
  tailing={
    <HxButton text="Cancel" variant="outline" onClick={close} />
  }
/>

// Compact variant (no horizontal padding)
<HxCompactButtonBar
  leading={<HxButton text="Back" variant="ghost" />}
  tailing={<HxButton text="Next" />}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `leading` | `ReactNode` | — | Buttons on the left |
| `tailing` | `ReactNode` | — | Buttons on the right |
| `gapX` | size token | `'xs'` | Horizontal gap between buttons |
| `gapY` | size token | `'xs'` | Vertical gap between buttons |
| `paddingX` | size token | `'lg'` | Horizontal padding |
| `paddingT` | size token | `'md'` | Top padding |
| `paddingB` | size token | `'md'` | Bottom padding |

Inherits all `HxFlex` props except `justifyContent` and `children`.

## Justification Logic

| State | `justify-content` |
|-------|-------------------|
| Both `leading` and `tailing` present | `space-between` |
| Only `leading` | `flex-start` |
| Only `tailing` | `flex-end` |

## HxCompactButtonBar

Same as `HxButtonBar` but with `paddingX`, `paddingT`, and `paddingB` all set to `'none'`; `gapX` / `gapY` stay `'xs'`.

## Native DOM Events

Same as `HxFlex`: all `<div>` events forwarded, rarely needed for a layout container.

## Global Config

```ts
import { configHxButtonBar } from '@hx/components';
configHxButtonBar({ gap: 'xs', paddingX: 'lg', paddingY: 'md' }); // config keys still use gap/paddingY
```
