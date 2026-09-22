# HxLabel

Styled text label with hover/active states and optional model binding. Renders `<span>`.

```tsx
<HxLabel text="Username" />
<HxLabel text="~Common.Price" valueUseI18N />

// Model-bound with value format converter
<HxLabel $model={form} $field="price" format="nf2" />

// Interactive states
<HxLabel text="Click me" clickable hoverable onClick={handleClick} />
<HxLabel text="Selected" active />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `ReactNode` | — | Label content. Prefix with `~` for i18n keys; write `\~` to display a literal leading `~`. Ignored when both `$model` and `$field` are specified |
| `color` | `HxColor` | — | Text color |
| `opaque` | `boolean` | — | Show opaque background behind text |
| `clickable` | `boolean` | — | `cursor: pointer` style |
| `hoverable` | `boolean` | — | Enable hover visual effect |
| `hovered` | `boolean` | — | Force hovered state (controlled) |
| `active` | `boolean` | — | Force active/pressed state (controlled) |
| `borderRadius` | `HxBorderRadius` | — | Border radius |
| `valueUseI18N` | `boolean` | `false` | Apply i18n to the value read from `$model` / `$field`. Static `text` is resolved from its `~` prefix instead |
| `format` | `HxFormats` | — | Format converter (number, date, datetime) for model values |
| `paddingX` | `HxLabelPaddingX` | — | Horizontal padding (`HxPadding` or `'text-indent'`) |
| `paddingY` | `HxPadding` | — | Vertical padding |
| `indent` | `boolean` | — | Keep the content inline-indented on both sides, same as `paddingX="text-indent"` |
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | When bound, displays the model field value instead of `text` |

## Native DOM Events

All `<span>` events forwarded. Useful when `clickable` or `hoverable` is enabled: `onClick`, `onMouseEnter`, `onMouseLeave`. Otherwise Label is typically display-only and doesn't need event listeners.

## Global Config

Sets the defaults for every `HxLabel`. Defaults are read at render time, so configuration applies globally and immediately; a prop passed to a label always wins.

```ts
import { configHxLabel } from '@hx/components';

configHxLabel({
  valueUseI18N: true,       // default: false
  paddingX: 'md',           // default: none, HxPadding only (the 'text-indent' mode is a component-prop value)
  paddingY: 'xs',           // default: none, HxPadding
});
```
