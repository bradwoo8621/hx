# HxMCheckbox

Multi-select checkbox group. Renders a list of checkboxes from an options source.

```tsx
const options = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'rs', label: 'Rust' },
];

// Vertical layout (default)
<HxMCheckbox $model={form} $field="skills" options={options} />

// Horizontal with 3 columns
<HxMCheckbox $model={form} $field="items" options={opts} direction="dir-x" lanes={3} />

// Limit selections
<HxMCheckbox $model={form} $field="top3" options={opts} maxChecked={3} />

// Async options with search
<HxMCheckbox
  $model={form}
  $field="tags"
  options={async (search) => fetchTags(search)}
/>

// Custom spacing
<HxMCheckbox $model={form} $field="opts" options={opts} gapX="md" gapY="sm" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path (holds an array of selected values) |
| `options` | `HxSelectOptions<T>` | — | Options source — static array, iterable, or async function ([see Common](./hx-components-Common#select-options)) |
| `maxChecked` | `number` | — | Maximum simultaneous selections |
| `direction` | `'dir-x' \| 'dir-y'` | `'dir-y'` | Layout direction |
| `lanes` | `number` | — | Grid column count (for `dir-x` layout) |
| `gapX` | size token | — | Horizontal gap between options |
| `gapY` | size token | — | Vertical gap between options |
| `enterToSwitchValue` | `boolean` | `false` | Enter key toggles value |
| `spaceToSwitchValue` | `boolean` | `true` | Space key toggles value |

## Keyboard Navigation

Arrow keys navigate between options at the group level. Enter/Space toggle the focused option.

## Native DOM Events

Each option renders a standard checkbox input. Focus and keyboard are managed at the group level. In practice, individual event listeners are rarely needed — selection is handled by `$model`/`$field` binding.

## Global Config

```ts
import { configHxMCheckbox } from '@hx/components';
configHxMCheckbox({ direction: 'dir-y' });
```

## See Also

- [HxMRadio](./hx-components-MRadio) — single-select radio variant
- [HxSelectOptions](./hx-components-Common#select-options) — options type reference
