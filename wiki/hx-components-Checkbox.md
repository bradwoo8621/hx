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
| `values` | `[checkedVal, uncheckedVal, checkFn?]` | `[true, false]` | The 1st value = checked, 2nd = unchecked. Optional 3rd element is a `(modelValue) => boolean` function that decides whether the model value counts as checked |
| `text` | `ReactNode` | — | Label text displayed beside the checkbox |
| `enterToSwitchValue` | `boolean` | `false` | Enter key toggles value |
| `spaceToSwitchValue` | `boolean` | `true` | Space key toggles value |

## Native DOM Events

**Commonly used**: `onChange` if you need to react to toggle events beyond the model update. In most cases the `$model`/`$field` binding is sufficient.

**Available**: `onKeyDown`, `onKeyUp`, `onKeyPress`, `onFocus`, `onBlur`, `onClick`, `onMouseDown`, `onMouseUp`, `onMouseEnter`, `onMouseLeave`.

## Global Config

```ts
import { configHxCheckbox } from '@hx/components';
configHxCheckbox({ spaceToSwitchValue: true });
```
