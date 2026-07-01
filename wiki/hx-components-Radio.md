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
| `values` | `[checkedVal, uncheckedVal]` | `[true, false]` | Value pair: checked value, unchecked value |
| `allowUnchecked` | `boolean` | `false` | Allow deselecting by clicking an already-checked radio |
| `text` | `ReactNode` | — | Label text beside the radio button |
| `enterToSwitchValue` | `boolean` | `false` | Enter key toggles |
| `spaceToSwitchValue` | `boolean` | `true` | Space key toggles |

## Native DOM Events

Same as `HxCheckbox`: `onChange`, `onKeyDown/Up/Press`, `onFocus`, `onBlur`, `onClick`, `onMouseDown/Up/Enter/Leave`.

## Global Config

```ts
import { configHxRadio } from '@hx/components';
configHxRadio({ spaceToSwitchValue: true, allowUnchecked: false });
```
