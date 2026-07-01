# HxLabel

Styled text label with hover/active states and optional model binding. Renders `<span>`.

```tsx
<HxLabel text="Username" color="neutral" />
<HxLabel text="~Common.Price" valueUseI18N />

// Model-bound with value format converter
<HxLabel $model={form} $field="price" format="@nugd7f2" />

// Interactive states
<HxLabel text="Click me" clickable hoverable onClick={handleClick} />
<HxLabel text="Selected" active />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `ReactNode` | — | Label content. Prefix with `~` for i18n keys |
| `color` | `HxColor` | — | Text color |
| `opaque` | `boolean` | — | Show opaque background behind text |
| `clickable` | `boolean` | — | `cursor: pointer` style |
| `hoverable` | `boolean` | — | Enable hover visual effect |
| `hovered` | `boolean` | — | Force hovered state (controlled) |
| `active` | `boolean` | — | Force active/pressed state (controlled) |
| `borderRadius` | `HxLabelBorderRadius` | — | Border radius |
| `valueUseI18N` | `boolean` | `false` | Treat `text` as i18n key |
| `format` | `HxFormats` | — | Format converter (number, date, datetime) for model values |
| `paddingX` | `HxLabelPaddingX` | — | Horizontal padding |
| `paddingY` | `HxLabelPaddingY` | — | Vertical padding |
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | When bound, displays the model field value instead of `text` |

## Native DOM Events (on `<span>`)

`onClick`, `onMouseDown`, `onMouseUp`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onFocus`, `onBlur`.

## Global Config

```ts
import { configHxLabel } from '@hx/components';
configHxLabel({ color: 'neutral' });
```
