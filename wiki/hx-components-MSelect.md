# HxMSelect / HxWithCheckMSelect

Multiple select dropdown based on the single [Select](./hx-components-Select) — same popup, filter and keyboard behavior, with multiple-selection semantics: the model value is an array of selected option values, selections toggle in the popup, and selected options render as removable badges in the input.

`HxWithCheckMSelect` adds validation (see [WithCheck](./hx-components-WithCheck)).

The model value can be any shape via `toModel`/`fromModel` converters; without them the field holds the plain selection array. An empty selection writes `(void 0)` to the model.

In compact mode selected options render on a single line; overflowing options collapse into a `+N` badge. In the default (non-compact) mode each selected option renders as a badge with a remove button.

Delete (or Backspace on Mac) on the **select input** clears **all** selections via `clearValue()`; on an individual **badge** it removes that one selection. Both paths require `clearable`. Selected options are marked with a check icon in the popup, and in compact mode they also sort to the top (option sorting, when enabled, still applies within each group).

```tsx
// Static options
<HxMSelect $model={form} $field="country" options={[
  { value: 'us', label: 'United States' },
  { value: 'cn', label: 'China' },
]} />

// Async with filter and clear button — options receives (model, context), not a search string
<HxMSelect
  $model={form} $field="user"
  options={async (model, context) => fetchUsers(model, context)}
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
| `toModel` | `(value, context) => any` | — | Convert the selected display array to the model value |
| `fromModel` | `(value, context) => Array<any>` | — | Convert the model value to the selected display array |
| `compact` | `boolean` | `false` | Single-line rendering with overflow collapsed into a `+N` badge; selected options sort to the top in the popup |

Also supported (same meanings as on `HxSelect`): `downIcon`, `placeholderKey`, `filterPlaceholderKey`, `optionsOnLoadKey`, `noOptionsKey`, `optionsDependsOn`, `onOptionsChange` (default `'clear'`), `enterToOpenPopup` (default `false`), `spaceToOpenPopup` (default `true`), `sameWidthAtMinimum` (default `true`).

There is no `maxChecked` prop on `HxMSelect`; only `HxMCheckbox` caps the selection count. The popup stays open while toggling options, and options compare with loose `==`.

## Popup Props (HxMSelectPopup)

Same as [Select popup props](./hx-components-Select#popup-props-hxselectpopup), with i18n keys under `HxMSelectDefaults`.

## Keyboard Navigation

Same as [Select keyboard navigation](./hx-components-Select#keyboard-navigation), except that Delete / Backspace on the input clears **all** selections (a badge-level Delete / Backspace removes only that badge).

## Internal Event System

Mirrors the select's `EventEmitter` under `EvtHxMSelect_*` names:
- `EvtHxMSelect_OptionSelectedChange` — option clicked/toggled (input updates the model)
- `EvtHxMSelect_OptionDeselect` — option removed via the badge remove button (popup clears its active mark)
- `EvtHxMSelect_OptionDeselectAll` — all selections cleared (popup clears all active marks)
- `EvtHxMSelect_HoverPreviousOption` — Arrow Up
- `EvtHxMSelect_HoverNextOption` — Arrow Down
- `EvtHxMSelect_SelectHoverOption` — Enter on highlighted
- `EvtHxMSelect_ClosePopup` — Escape or click outside
- `EvtHxMSelect_GetSelect` — trigger asks for the select DOM node
- `EvtHxMSelect_GetFilterInput` — trigger asks for the filter input DOM node

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
