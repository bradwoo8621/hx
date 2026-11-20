# HxRadio / HxWithCheckRadio

Single radio button bound to a model field.

`HxWithCheckRadio` adds validation (see [WithCheck](./hx-components-WithCheck)).

```tsx
<HxRadio $model={form} $field="gender" values={['male', 'female']} text="Male" />

// Allow deselect by clicking the already-checked radio
<HxRadio
  $model={form} $field="option"
  values={['A', undefined]}
  allowUnchecked
  text="Option A"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |
| `values` | `[checkedVal, uncheckedVal, checkFn?]` | `[true, false]` | The 1st value = checked, 2nd = unchecked. The optional 3rd element `(modelValue) => boolean` is only called when the model value equals neither of the first two |
| `allowUnchecked` | `boolean` | `false` | Allow deselecting an already-checked radio; applies to click and keyboard |
| `text` | `ReactNode` | — | Label text beside the radio button |
| `enterToSwitchValue` | `boolean` | `false` | Enter key toggles |
| `spaceToSwitchValue` | `boolean` | `true` | Space key toggles |
| `$visible` | `VisiblePropValue<T>` | `true` | Same three forms as `$disabled`, via `HxEditSingleFieldProps` |
| `$disabled` | `DisabledPropValue<T>` | — | Blocks click and keyboard and removes the control from the tab order |
| `$change` | `ChangePropValue<T>` | — | Listener(s) invoked with `(event, model, context)` when a monitored path changes |

## Rendering and Events

The control renders an ARIA `<span role="radio">`, not a native `<input>`. Toggling only calls `ERO.setValue` and re-renders, so no native `change` event fires — react through `$model` / `$field` or `onClick` on the root.

## Global Config

```ts
import { configHxRadio } from '@hx/components';
configHxRadio({ spaceToSwitchValue: true, allowUnchecked: false });
```
