# HxCheckbox / HxWithCheckCheckbox

Single checkbox bound to a model field. Value is matched against a configurable value pair.

`HxWithCheckCheckbox` adds validation (see [WithCheck](./hx-components-WithCheck)).

```tsx
// Boolean toggle (checked=true, unchecked=false)
<HxCheckbox $model={form} $field="agreed" text="I agree to the terms" />

// Custom value pair
<HxCheckbox $model={form} $field="status" values={['active', 'inactive']} text="Active" />

// Three-state with custom check function (3rd element)
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
| `values` | `[checkedVal, uncheckedVal, checkFn?]` | `[true, false]` | The 1st value = checked, 2nd = unchecked. Optional 3rd element is a `(modelValue) => boolean \| 'indeterminate'` function for custom checked state |
| `text` | `ReactNode` | — | Label text displayed beside the checkbox |
| `enterToSwitchValue` | `boolean` | `false` | Enter key toggles value |
| `spaceToSwitchValue` | `boolean` | `true` | Space key toggles value |

### Three-State Checkbox

When a 3-element `values` tuple is provided, the 3rd element is a function that determines the visual state:

```tsx
values={[
  true,                              // checked value
  false,                             // unchecked value
  (v) => Array.isArray(v) && v.length > 0 && v.length < total
    ? 'indeterminate'                // returns 'indeterminate' for partial state
    : v.length === total,            // returns boolean for full/none
]}
```

## Native DOM Events

`onChange`, `onKeyDown`, `onKeyUp`, `onKeyPress`, `onFocus`, `onBlur`, `onClick`, `onMouseDown/Up/Enter/Leave`.

## Global Config

```ts
import { configHxCheckbox } from '@hx/components';
configHxCheckbox({ spaceToSwitchValue: true });
```
