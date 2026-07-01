# HxBadge

Small tag/pill for status indication. Renders `<span>`.

```tsx
<HxBadge text="New" color="success" />
<HxBadge text="Draft" color="warning" variant="outline" size="std" />
<HxBadge text="Archived" color="neutral" variant="dashed" />
<HxBadge text="~Status.Active" valueUseI18N />

// Model-bound — text reflects field value
<HxBadge $model={form} $field="status" color="primary" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `ReactNode` | — | Badge content |
| `color` | `HxColor` | — | Text and background color |
| `variant` | `'solid' \| 'outline' \| 'dashed'` | `'solid'` | Visual style |
| `size` | `'sm' \| 'std'` | `'sm'` | Size variant |
| `borderRadius` | `HxLabelBorderRadius \| 'round'` | `'round'` | Corner radius. `'round'` = fully rounded pill |
| `valueUseI18N` | `boolean` | `false` | Treat `text` as i18n key |
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path for reactive text |

Plus all `HxLabel` props except `opaque`, `borderRadius`, `paddingX`.

## Native DOM Events

All standard `<span>` events forwarded: `onClick`, `onMouseDown`, `onMouseUp`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onFocus`, `onBlur`. In practice, Badge is usually a display-only element.

## Global Config

```ts
import { configHxBadge } from '@hx/components';
configHxBadge({ size: 'sm', variant: 'solid' });
```
