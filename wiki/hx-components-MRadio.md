# HxMRadio

Single-select radio button group. Renders a list of radio buttons from an options source.

```tsx
const sizes = [
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
];

// Vertical layout (default)
<HxMRadio $model={form} $field="size" options={sizes} />

// Horizontal with 3 columns
<HxMRadio $model={form} $field="size" options={sizes} direction="dir-x" lanes={3} />

// Async options
<HxMRadio
  $model={form}
  $field="category"
  options={async (search) => fetchCategories(search)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |
| `options` | `HxSelectOptions<T>` | — | Options source ([see Common](./hx-components-Common#select-options)) |
| `direction` | `'dir-x' \| 'dir-y'` | `'dir-y'` | Layout direction |
| `lanes` | `number` | — | Grid column count (for `dir-x` layout) |
| `gapX` | size token | — | Horizontal gap between options |
| `gapY` | size token | — | Vertical gap between options |
| `enterToSwitchValue` | `boolean` | `false` | Enter key toggles |
| `spaceToSwitchValue` | `boolean` | `true` | Space key toggles |

## Keyboard Navigation

Same as `HxMCheckbox` — arrow key navigation between options, Enter/Space to select.

## Native DOM Events

Each option renders a standard radio input. Focus and keyboard are managed at the group level. In practice, individual event listeners are rarely needed — selection is handled by `$model`/`$field` binding.

## Global Config

```ts
import { configHxMRadio } from '@hx/components';
configHxMRadio({ direction: 'dir-y' });
```

## See Also

- [HxMCheckbox](./hx-components-MCheckbox) — multi-select variant
- [HxRadio](./hx-components-Radio) — single radio button
