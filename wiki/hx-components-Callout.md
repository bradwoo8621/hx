# HxCallout

Inline alert message with icon and text.

```tsx
<HxCallout kind="info" message="Changes saved." />
<HxCallout kind="success" message="Operation completed." />
<HxCallout kind="warn" message="Subscription expires in 3 days." />
<HxCallout kind="error" message="Payment failed." />
<HxCallout kind="question" message="Proceed with deletion?" />

// Custom icon
<HxCallout kind={<CustomWarning />} message="Custom callout" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `kind` | `HxCalloutKind \| ReactNode` | — | `'info'`, `'success'`, `'question'`, `'warn'`, `'error'`, or custom icon element |
| `message` | `ReactNode` | — | Message content |

`HxCalloutProps` extends `HxFlexProps` (except `direction`, `wrap`, and `children`), so `$model`, `$field`, `justifyContent`, `alignItems`, `alignContent`, `gapX`, `gapY`, `border`, `borderRadius`, `paddingX/T/B`, flex/grid cell props, and the data-attribute pass-through are all accepted. `configHxCallout` supplies defaults for `border`, `borderRadius`, and padding.

## Kind Mappings

| `kind` | Icon | Color |
|--------|------|-------|
| `'info'` | `Info` | blue |
| `'success'` | `Success` | green |
| `'question'` | `Question` | primary (blue) |
| `'warn'` | `Exclamation` | yellow |
| `'error'` | `Error` | red |

## Native DOM Events

All standard `<div>` events forwarded. Callout is a display-only element — rarely needs event listeners in practice.

## Global Config

```ts
import { configHxCallout } from '@hx/components';
configHxCallout({border: false, borderRadius: 'lg', paddingX: 'xl', paddingT: 'xl', paddingB: 'xl'});
```
