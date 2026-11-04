# HxCheckbox / HxWithCheckCheckbox

Single checkbox bound to a model field. Value is matched against a configurable value pair.

`HxWithCheckCheckbox` adds validation (see [WithCheck](./hx-components-WithCheck)).

```tsx
// Boolean toggle (checked=true, unchecked=false)
<HxCheckbox $model={form} $field="agreed" text="I agree to the terms" />

// Custom value pair
<HxCheckbox $model={form} $field="status" values={['active', 'inactive']} text="Active" />

// Custom checked test as the 3rd element
<HxCheckbox
  $model={form}
  $field="selectAll"
  values={[true, false, (modelValue) => isPartialSelection(modelValue)]}
  text="Select All"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |
| `values` | `[checkedVal, uncheckedVal, checkFn?]` | `[true, false]` | The 1st value = checked, 2nd = unchecked. The optional 3rd element `(modelValue) => boolean` is only called when the model value equals neither of the first two |
| `text` | `ReactNode` | — | Label text displayed beside the checkbox |
| `enterToSwitchValue` | `boolean` | `false` | Enter key toggles value |
| `spaceToSwitchValue` | `boolean` | `true` | Space key toggles value |

## Rendering and Events

The control renders an ARIA `<span role="checkbox">`, not a native `<input>`; toggling calls `ERO.setValue` and re-renders. Consequently no native `change` event fires — react through `$model` / `$field` or `onClick` on the root.

`$disabled` blocks click and keyboard. `$visible` is available through `HxEditSingleFieldProps`.

**Available events**: `onKeyDown`, `onKeyUp`, `onKeyPress`, `onFocus`, `onBlur`, `onClick`, `onMouseDown`, `onMouseUp`, `onMouseEnter`, `onMouseLeave`.

## Global Config

```ts
import { configHxCheckbox } from '@hx/components';
configHxCheckbox({ spaceToSwitchValue: true });
```
