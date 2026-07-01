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
| `uppercase` | `boolean` | `true` | CSS `text-transform: uppercase`. Ignored when `$field` is specified |
| `valueUseI18N` | `boolean` | `false` | Apply i18n translation to the model field value when `$field` is set. Has no effect when `text` is used |
| `$model` | `HxObject<T>` | — | Reactive model for value/disabled binding |
| `$field` | `ModelPath<T> \| HxDataPath` | — | When set, the button text is read from this model field, and `text` / `uppercase` are ignored |
| `$disabled` | `DisabledPropValue<T>` | — | `(model) => boolean` — reactive disabled |

## Native DOM Events

`onClick` is the primary event for Button. All other standard `<button>` events are forwarded but rarely needed:

**Commonly used**: `onClick`.

**Available but usually unnecessary** (component handles these internally): value/disabled via `$model`/`$disabled`.

**Available if needed**: `onFocus`, `onBlur`, `onKeyDown`, `onKeyUp`, `onMouseEnter`, `onMouseLeave`, `onMouseDown`, `onMouseUp`, `onMouseMove`, `onMouseOver`, `onMouseOut`, `onTouchStart`, `onTouchEnd`, `onTouchMove`, `onPointerDown`, `onPointerUp`, `onPointerEnter`, `onPointerLeave`.

**Excluded native attributes**: `disabled` (use `$disabled`), `type` (hardcoded to `"button"`), `value`, `color`, `children`.

All other standard `<button>` attributes (including `autoFocus`, `form`, `name`) are forwarded.

## Global Config

```ts
import { configHxButton } from '@hx/components';
configHxButton({ color: 'primary', variant: 'solid', uppercase: true });
```
