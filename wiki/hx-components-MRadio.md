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

// Async options — receives the model and context, not a search string
<HxMRadio
  $model={form}
  $field="category"
  options={async (model, context) => fetchCategories(model, context)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |
| `options` | `HxSelectOptions<T>` | — | Options source ([see Common](./hx-components-Common#select-options)) |
| `optionsDependsOn` | `HxDataPath \| HxDataPath[]` | — | Reload options when the given path(s) change |
| `onOptionsChange` | `'none' \| 'clear' \| (options) => HxSelectOption \| undefined` | `'clear'` | What to do with the current value when options change |
| `direction` | `'dir-x' \| 'dir-y'` | `'dir-y'` | Layout direction |
| `lanes` | `number` | — | Grid column count, 1–10 (for `dir-x` layout, ignored when the direction is vertical) |
| `gapX` | size token | — | Horizontal gap between options |
| `gapY` | size token | — | Vertical gap between options |
| `enterToSwitchValue` | `boolean` | `false` | Enter key toggles |
| `spaceToSwitchValue` | `boolean` | `true` | Space key toggles |
| `$disabled` | `DisabledPropValue<T>` | — | Disables the whole group |
| `optionsOnLoadKey` | `string` | `~HxCommon.SelectOptionsOnLoad` | Loading-state text |
| `noOptionsKey` | `string` | `~HxCommon.SelectNoOptions` | Empty-options text |

`option.$disabled` disables an individual option. Selection equality is strict `===`. There is no `toModel` / `fromModel`, and there is no group `allowUnchecked` — clicking the selected option never clears it.

## Keyboard Navigation

There is no group-level arrow navigation. Each option is its own tab stop; Enter/Space selects the focused option.

## Rendering

Each option renders an ARIA `<span role="radio">`, not a native input. Individual event listeners are rarely needed — selection is handled by `$model`/`$field` binding.

## Global Config

```ts
import { configHxMRadio } from '@hx/components';
configHxMRadio({ direction: 'dir-y' });
```

## See Also

- [HxMCheckbox](./hx-components-MCheckbox) — multi-select variant
- [HxRadio](./hx-components-Radio) — single radio button
