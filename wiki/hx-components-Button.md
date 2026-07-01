# HxButton

Renders `<button type="button">`. The primary action trigger in forms and dialogs.

```tsx
// Basic click handler
<HxButton text="Submit" onClick={() => submit()} />

// Variants
<HxButton text="Delete" color="danger" variant="outline" onClick={remove} />
<HxButton text="Cancel" variant="ghost" onClick={close} />
<HxButton text="Learn More" variant="link" />

// i18n (two equivalent ways)
<HxButton text="~Common.Save" />
<HxButton text="Common.Save" valueUseI18N />

// Reactive disabled
<HxButton text="Save" $disabled={(m) => !m.dirty} />

// Model-bound text
<HxButton $model={form} $field="submitLabel" onClick={submit} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `ReactNode` | — | Button label content |
| `color` | `HxButtonColor` | `'primary'` | Color scheme |
| `variant` | `'solid' \| 'outline' \| 'ghost' \| 'link'` | `'solid'` | Visual style |
| `uppercase` | `boolean` | `true` | CSS `text-transform: uppercase` |
| `valueUseI18N` | `boolean` | `false` | Interpret `text` as an i18n key |
| `$model` | `HxObject<T>` | — | Reactive model for value/disabled binding |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Field path — button text reflects this value |
| `$disabled` | `DisabledPropValue<T>` | — | `(model) => boolean` — reactive disabled |

## Native DOM Events (on `<button>`)

`onClick`, `onMouseDown`, `onMouseUp`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOver`, `onMouseOut`, `onKeyDown`, `onKeyUp`, `onKeyPress`, `onFocus`, `onBlur`, `onTouchStart`, `onTouchEnd`, `onTouchMove`, `onPointerDown`, `onPointerUp`, `onPointerEnter`, `onPointerLeave`.

Native attributes forwarded: `disabled`, `autoFocus`, `form`, `name`.

## Global Config

```ts
import { configHxButton } from '@hx/components';
configHxButton({ color: 'primary', variant: 'solid', uppercase: true });
```
