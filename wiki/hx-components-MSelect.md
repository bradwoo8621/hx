# HxMSelect / HxWithCheckMSelect

Multiple select dropdown. Currently an exact clone of the single [Select](./hx-components-Select) — same props, popup, keyboard behavior, and styles; multiple-selection semantics (value array, `toModel`/`fromModel` converters, `maxChecked`, `compact`) will diverge later.

`HxWithCheckMSelect` adds validation (see [WithCheck](./hx-components-WithCheck)).

Long selected labels truncate with an ellipsis (single line).

```tsx
// Static options
<HxMSelect $model={form} $field="country" options={[
  { value: 'us', label: 'United States' },
  { value: 'cn', label: 'China' },
]} />

// Async with filter and clear button
<HxMSelect
  $model={form} $field="user"
  options={async (search) => fetchUsers(search)}
  filter
  clearable
/>

// Auto-show filter when options exceed 5
<HxMSelect
  $model={form} $field="city"
  options={cityList}
  filterWhenOptionExceed={5}
/>
```

## Props

Same as [Select props](./hx-components-Select#props), plus:

`clearable` defaults to `true` for `HxMSelect` (the single select has no default); configure it globally with `configHxMSelect({ clearable: false })`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `toModel` | `(value: Array<any>) => any` | — | Convert the selected display array to the model value |
| `fromModel` | `(value: any) => Array<any>` | — | Convert the model value to the selected display array |
| `maxChecked` | `number` | — | Maximum simultaneous selections (reserved) |
| `compact` | `boolean` | `false` | Compact rendering (reserved) |

## Popup Props (HxMSelectPopup)

Same as [Select popup props](./hx-components-Select#popup-props-hxselectpopup), with i18n keys under `HxMSelectDefaults`.

## Keyboard Navigation

Same as [Select keyboard navigation](./hx-components-Select#keyboard-navigation).

## Internal Event System

Mirrors the select's `EventEmitter` under `EvtHxMSelect_*` names:
- `EvtHxMSelect_OptionSelectedChange` — option clicked/selected
- `EvtHxMSelect_HoverPreviousOption` — Arrow Up
- `EvtHxMSelect_HoverNextOption` — Arrow Down
- `EvtHxMSelect_SelectHoverOption` — Enter on highlighted
- `EvtHxMSelect_ClosePopup` — Escape or click outside

## Global Config

```ts
import { configHxMSelect } from '@hx/components';
configHxMSelect({
  clearable: false, // default: true
  filterWhenOptionExceed: 8,
  maxPopupHeight: 258,
  showSelectedOnPopupOpen: true,
});
```

Also available via the chained settings API: `HxSettings.mSelect({...})`.
