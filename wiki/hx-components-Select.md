# HxSelect / HxWithCheckSelect

Dropdown select with optional filtering, sorting, and clearing. Uses `HxPopup` internally for positioning.

`HxWithCheckSelect` adds validation (see [WithCheck](./hx-components-WithCheck)).

Long selected labels truncate with an ellipsis (single line).

```tsx
// Static options
<HxSelect $model={form} $field="country" options={[
  { value: 'us', label: 'United States' },
  { value: 'cn', label: 'China' },
]} />

// Async with filter and clear button — options receives (model, context), not a search string
<HxSelect
  $model={form} $field="user"
  options={async (model, context) => fetchUsers(model, context)}
  filter
  clearable
/>

// Auto-show filter when options exceed 5
<HxSelect
  $model={form} $field="city"
  options={cityList}
  filterWhenOptionExceed={5}
/>

// Full configuration
<HxSelect
  $model={form} $field="product"
  options={productOpts}
  filter
  sort
  clearable
  placeholderKey="Select a product..."
  minPopupWidth={300}
  maxPopupHeight={400}
  popupPosition="bottom"
  popupAlignTo="right"
  zIndex={1050}
  gapToEdge={4}
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
| `clearable` | `boolean` | — | Show a clear/X button to reset the value; also enables Delete (and Backspace on Mac) |
| `filter` | `boolean \| undefined` | — | Show the filter input. When omitted, it appears once the option count reaches `filterWhenOptionExceed`; `false` disables it |
| `sort` | `boolean` | — | Sort options alphabetically by label |
| `selectedLabel` | `(option: HxSelectOption) => ReactNode` | — | Render the closed control's label from the selected option (an option's own `selectedLabel` field still takes precedence) |
| `placeholder` | `boolean` | `true` | Whether to show the placeholder text when nothing is selected |
| `placeholderKey` | `ReactNode` | `'~HxCommon.SelectPlaceholder'` | Placeholder text or i18n key |
| `downIcon` | `ReactNode` | — | Custom dropdown icon |
| `showSelectedOnPopupOpen` | `boolean` | `true` | Scroll to / highlight the current selection on open |
| `filterWhenOptionExceed` | `number` | `8` | Auto-enable the filter when the option count is **>=** this value (config clamps to at least 8) |
| `minPopupWidth` | `number` | — | Minimum popup width (px) |
| `maxPopupHeight` | `number` | `258` | Maximum popup height (px); config clamps to at least 200 |
| `sameWidthAtMinimum` | `boolean` | `true` | Popup at least as wide as the trigger |
| `enterToOpenPopup` | `boolean` | `false` | Enter opens the popup when closed |
| `spaceToOpenPopup` | `boolean` | `true` | Space opens the popup when closed |
| `popupPosition` | `'top' \| 'bottom'` | — | Force the popup below / above the trigger instead of auto-detecting |
| `popupAlignTo` | `'left' \| 'right'` | — | Force horizontal alignment with the trigger; logical, so it mirrors in RTL |
| `zIndex` | `number` | — | Popup z-index |
| `gapToEdge` | `number` | — | Minimum gap between the popup and the **viewport** edge (px) |

## Popup Props (HxSelectPopup)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `optionsOnLoadKey` | `ReactNode` | `'~HxCommon.SelectOptionsOnLoad'` | Label while async options load |
| `noOptionsKey` | `ReactNode` | `'~HxCommon.SelectNoOptions'` | Label when no options match |
| `filterPlaceholderKey` | `ReactNode` | `'~HxCommon.SelectFilterPlaceholder'` | Filter input placeholder |

Filtering is a case-insensitive label substring match, performed client-side over the loaded options; typing in the filter does not re-query the options source.

## Keyboard Navigation

- **Arrow Up / Down** — With the popup closed, open it; with it open, move the highlight (DOM attribute manipulation avoids re-renders on large lists). Disabled options are skipped
- **Enter** — Select the highlighted option; with the popup closed, opens it only when `enterToOpenPopup` is set
- **Space** — With the popup closed, opens it when `spaceToOpenPopup` is set; with it open, selects
- **Escape** — Close popup
- **Delete** / **Backspace (Mac)** — Clear the value when `clearable`
- **Tab** — There is no focus trap: on the trigger, Tab moves focus into the filter input; in the filter, Shift+Tab returns to the trigger and Tab moves to the next tabbable node

## Internal Event System

The select uses `EventEmitter` for trigger-popup communication:
- `EvtHxSelect_OptionSelect` — option clicked/selected
- `EvtHxSelect_HoverPreviousOption` — Arrow Up
- `EvtHxSelect_HoverNextOption` — Arrow Down
- `EvtHxSelect_SelectHoverOption` — Enter on highlighted
- `EvtHxSelect_ClosePopup` — Escape or click outside
- `EvtHxSelect_GetSelect` — trigger asks for the select DOM node
- `EvtHxSelect_GetFilterInput` — trigger asks for the filter input DOM node

## Native DOM Events

The trigger input and popup forward all standard DOM events, but in practice you rarely need them — selection is managed by `$model`/`$field` binding, and keyboard navigation is handled internally. Use `onFocus`/`onBlur` if you need to track focus state.

## Global Config

```ts
import { configHxSelect } from '@hx/components';
configHxSelect({
  filterWhenOptionExceed: 8,
  maxPopupHeight: 258,
  showSelectedOnPopupOpen: true,
});
```
