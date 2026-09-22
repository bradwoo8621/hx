# HxBadge

Small tag/pill for status indication. Renders `<span>`.

```tsx
<HxBadge text="New" color="success" />
<HxBadge text="Draft" color="warn" variant="outline" size="std" />
<HxBadge text="Archived" color="waive" variant="dashed" />
<HxBadge text="~Status.Active" valueUseI18N />

// Model-bound — text reflects field value
<HxBadge $model={form} $field="status" color="primary" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `ReactNode` | — | Badge content |
| `color` | `HxColor` | `'primary'` | Text and background color |
| `variant` | `'solid' \| 'outline' \| 'dashed'` | `'solid'` | Visual style |
| `size` | `'sm' \| 'std'` | `'sm'` | Size variant |
| `borderRadius` | `HxBadgeBorderRadius` | `'round'` | Corner radius. `'round'` = fully rounded pill |
| `paddingX` | `HxLabelPaddingX` | `'md'` | Horizontal padding |
| `valueUseI18N` | `boolean` | `false` | Apply i18n to the value read from `$model` / `$field` |
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path for reactive text |

Plus all `HxLabel` props except `opaque`, `borderRadius`.

## Native DOM Events

All standard `<span>` events forwarded: `onClick`, `onMouseDown`, `onMouseUp`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onFocus`, `onBlur`. In practice, Badge is usually a display-only element.

## Global Config

Sets the defaults for every `HxBadge`. Defaults are read at render time, so configuration applies globally and immediately; a prop passed to a badge always wins.

```ts
import { configHxBadge } from '@hx/components';

configHxBadge({
  color: 'primary',       // default: primary
  variant: 'solid',       // default: solid
  size: 'sm',             // default: sm
  borderRadius: 'round',  // default: round
  paddingX: 'md',         // default: md
});
```
