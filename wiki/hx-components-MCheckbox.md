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

// Async options — receives the model and context, not a search string
<HxMCheckbox
  $model={form}
  $field="tags"
  options={async (model, context) => fetchTags(model, context)}
/>

// Custom spacing
<HxMCheckbox $model={form} $field="opts" options={opts} gapX="md" gapY="sm" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path (holds an array of selected values) |
| `options` | `HxSelectOptions<T>` | — | Options source — static array, or a function returning an array / promise ([see Common](./hx-components-Common#select-options)) |
| `optionsDependsOn` | `HxDataPath \| HxDataPath[]` | — | Reload options when the given path(s) change |
| `onOptionsChange` | `'none' \| 'clear' \| (options) => HxSelectOption \| undefined` | `'clear'` | What to do with the current value when options change |
| `toModel` | `(value, context) => any` | — | Convert the checked display array to the model value |
| `fromModel` | `(value, context) => Array<any>` | — | Convert the model value to the checked display array |
| `maxChecked` | `number` | — | Maximum simultaneous selections. At the cap, unchecked options become disabled; checked ones stay enabled |
| `direction` | `'dir-x' \| 'dir-y'` | `'dir-y'` | Layout direction |
| `lanes` | `number` | — | Grid column count, 1–10 (for `dir-x` layout, ignored when the direction is vertical) |
| `gapX` | size token | — | Horizontal gap between options |
| `gapY` | size token | — | Vertical gap between options |
| `enterToSwitchValue` | `boolean` | `false` | Enter key toggles value |
| `spaceToSwitchValue` | `boolean` | `true` | Space key toggles value |
| `$disabled` | `DisabledPropValue<T>` | — | Disables the whole group |
| `optionsOnLoadKey` | `string` | `~HxCommon.SelectOptionsOnLoad` | Loading-state text |
| `noOptionsKey` | `string` | `~HxCommon.SelectNoOptions` | Empty-options text |

`option.$disabled` disables an individual option. An empty selection is written as `(void 0)`, and selection equality uses loose `==`.

## Keyboard Navigation

There is no group-level arrow navigation. Each option is its own tab stop; Enter/Space toggles the focused option.

## Rendering

Each option renders an ARIA `<span role="checkbox">`, not a native input. Individual event listeners are rarely needed — selection is handled by `$model`/`$field` binding.

## Global Config

```ts
import { configHxMCheckbox } from '@hx/components';
configHxMCheckbox({ direction: 'dir-y' });
```

## See Also

- [HxMRadio](./hx-components-MRadio) — single-select radio variant
- [HxSelectOptions](./hx-components-Common#select-options) — options type reference
