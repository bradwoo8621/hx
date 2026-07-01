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

## Kind Mappings

| `kind` | Icon | Color |
|--------|------|-------|
| `'info'` | `Info` | blue |
| `'success'` | `Success` | green |
| `'question'` | `Question` | neutral |
| `'warn'` | `Exclamation` | yellow |
| `'error'` | `Error` | red |

## Native DOM Events

All standard `<div>` events on the wrapper element.
