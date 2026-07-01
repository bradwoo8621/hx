# HxSelect / HxWithCheckSelect

Dropdown select with optional filtering, sorting, and clearing. Uses `HxPopup` internally for positioning.

`HxWithCheckSelect` adds validation (see [WithCheck](./hx-components-WithCheck)).

```tsx
// Static options
<HxSelect $model={form} $field="country" options={[
  { value: 'us', label: 'United States' },
  { value: 'cn', label: 'China' },
]} />

// Async with filter and clear button
<HxSelect
  $model={form} $field="user"
  options={async (search) => fetchUsers(search)}
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
  placeholder="Select a product..."
  minPopupWidth={300}
  maxPopupHeight={400}
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
| `clearable` | `boolean` | — | Show a clear/X button to reset the value |
| `filter` | `boolean` | — | Show filter text input inside the popup |
| `sort` | `boolean` | — | Sort options alphabetically by label |
| `placeholder` | `ReactNode \| boolean` | `true` | Placeholder when nothing selected. `true` = default i18n key |
| `showSelectedOnPopupOpen` | `boolean` | `true` | Scroll to / highlight the current selection on open |
| `filterWhenOptionExceed` | `number` | `8` | Auto-enable filter when total options > this count |
| `minPopupWidth` | `number` | — | Minimum popup width (px) |
| `maxPopupHeight` | `number` | `258` | Maximum popup height (px) |
| `zIndex` | `number` | — | Popup z-index |
| `gapToEdge` | `number` | — | Gap between trigger and popup (px) |

## Popup Props (HxSelectPopup)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `optionsOnLoadKey` | i18n key | `'~HxCommon.OnLoading'` | Label while async options load |
| `noOptionsKey` | i18n key | `'~HxCommon.NoOptions'` | Label when no options match |
| `filterPlaceholderKey` | i18n key | `'~HxCommon.Filter'` | Filter input placeholder |

## Keyboard Navigation

- **Arrow Up / Down** — Navigate options (uses DOM attribute manipulation to avoid re-renders on large lists)
- **Enter** — Select highlighted option
- **Escape** — Close popup
- **Tab** — Focus trapped within popup (cycles between filter input and options)

## Internal Event System

The select uses `EventEmitter` for trigger-popup communication:
- `EvtHxSelect_OptionSelect` — option clicked/selected
- `EvtHxSelect_HoverPreviousOption` — Arrow Up
- `EvtHxSelect_HoverNextOption` — Arrow Down
- `EvtHxSelect_SelectHoverOption` — Enter on highlighted
- `EvtHxSelect_ClosePopup` — Escape or click outside

## Native DOM Events

The trigger input and popup forward all standard DOM events.

## Global Config

```ts
import { configHxSelect } from '@hx/components';
configHxSelect({
  filterWhenOptionExceed: 8,
  maxPopupHeight: 258,
  showSelectedOnPopupOpen: true,
});
```
