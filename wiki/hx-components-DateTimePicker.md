# HxDateTimePicker / HxWithCheckDateTimePicker

Date and time picker with calendar-based popup. Supports multiple calendar systems (Gregorian, Japanese, Minguo, Buddhist, etc.), i18n, and keyboard navigation.

`HxWithCheckDateTimePicker` adds validation (see [WithCheck](./hx-components-WithCheck)).

```tsx
// Date-only picker
<HxDateTimePicker
  $model={form} $field="date"
  displayFormat="@d/ymd"
/>

// Date-time picker
<HxDateTimePicker
  $model={form} $field="datetime"
  displayFormat="@d/ymd :hns"
/>

// Japanese calendar with era display
<HxDateTimePicker
  $model={form} $field="jpDate"
  forceLang="ja-JP"
  displayFormat="@d/ymd"
/>

// With validation
<HxWithCheckDateTimePicker
  $model={form} $field="requiredDate"
  displayFormat="@d/ymd"
  check
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |
| `displayFormat` | `HxDateTimePickerDisplayFormat` | — | Display format string, pattern, or function |
| `availableParts` | `HxDateTimeRelatedFormat` | auto-detected | Which datetime parts are available (date, time, or both) |
| `defaultValue` | `HxDateTimeDefaultValuesInStr \| HxDateTimeValue` | — | Default value when model is empty |
| `valueFormat` | `HxDateTimeRelatedFormat` | — | Value format for model binding |
| `firstDayOfWeek` | `'sun' \| 'mon' \| 'default'` | `'default'` | First day of the week |
| `weekendDays` | `HxDateWeekendDays \| 'default'` | `'default'` | Weekend day configuration |
| `forceLang` | `'gregory' \| HxLanguageCode` | — | Force a specific locale or Gregorian calendar |
| `enterToOpenPopup` | `boolean` | `false` | Open popup on Enter key |
| `spaceToOpenPopup` | `boolean` | `true` | Open popup on Space key |
| `clearable` | `boolean` | `false` | Show clear button |
| `placeholder` | `boolean` | `true` | Show placeholder when empty |
| `placeholderKey` | `ReactNode` | `'~HxCommon.DateTimePickerPlaceholder'` | Placeholder text |
| `calendarIcon` | `ReactNode` | — | Custom calendar icon |
| `todayKey` | `ReactNode` | `'~HxCommon.TodayButton'` | "Now" button label |
| `clearKey` | `ReactNode` | `'~HxCommon.ClearButton'` | "Clear" button label |
| `zIndex` | `number` | — | Popup z-index |
| `gapToEdge` | `number` | — | Gap between trigger and popup |

## Calendar Systems

The datetime picker supports multiple calendar systems through the `forceLang` prop:

- **Gregorian** (default) — `forceLang="gregory"` or omitted
- **Japanese Imperial** — `forceLang="ja-JP"` (era-based: Reiwa, Heisei, Showa, etc.)
- **Minguo (ROC)** — `forceLang="zh-TW"` (Taiwan)
- **Buddhist (B.E.)** — `forceLang="th"` (Thailand)
- **Hebrew** — `forceLang="he-IL"` (Israel)
- **Islamic** — `forceLang="ar-SA"` (Saudi Arabia)
- **Persian** — `forceLang="fa-IR"` (Iran)
- **Indian (Saka)** — `forceLang="hi-IN"` (India)

See [Date Localization utilities](./hx-components-Utilities#date-localization) for the complete calendar mapping.

### Era Display and Multi-Era Month Detection

When using the **Japanese calendar** (`ja-JP`), a single calendar month may span two eras. This occurs when the Japanese era transition falls within a Gregorian month. For example, Meiji 5 (1872) transitions from Meiji to a new era mid-month, or the `至徳`/`嘉慶` transition in August 1387.

The internal `eraOfDays` method of `HxDateTimePickerStateRef` handles this by:

1. Checking whether the first and last day of the displayed month belong to different eras using `DateLocaleUtils.formatDateInNumeric()`.
2. If they differ, the method performs a **binary search** over the month's days to find the exact boundary day where the era transitions.
3. The binary search works by repeatedly checking the era of the midpoint day:
   - If the midpoint is still in the first era, search the right half.
   - If the midpoint is in the new era, record it as the candidate boundary and search the left half.
4. Once found, the boundary day is marked with the new era label in a `Map<Date, string>` returned from the popup state ref.

A special hardcoded case exists for the `至徳`/`嘉慶` transition in August 1387, where the Intl API era detection produces ambiguous results.

## Internal State Ref

`useHxDateTimePickerPopupStateRef` is the core state management hook for the datetime picker popup. It exposes the following:

| Method | Description |
|--------|-------------|
| `value()` | Get the current value |
| `formatted()` | Get formatted labels (era, year, month, day, weekdays) |
| `labelOfYear()` | Get year label for the header |
| `labelOfMonth()` | Get month label for the header |
| `eraOfDays()` | Get era labels per day (for multi-era month display) |
| `gregorian()` | Check if Gregorian mode is active |
| `language()` | Get current language code |
| `weekdays()` | Compute weekday labels for the grid |
| `days()` | Compute day cells for the calendar grid |
| `changeYear()` | Navigate by year offset |
| `changeMonth()` | Navigate by month offset |
| `changeDayTo()` | Select a specific day |
| `clearModelValue()` | Clear the model value |
| `forceUpdate()` | Force a re-render |
| `clear()` | Clear the entire state |

## Internal Event System

The picker uses `EventEmitter` for trigger-popup communication:

| Event | Description |
|-------|-------------|
| `EvtHxDateTimePicker_ValueChange` | Value selected in the panel |
| `EvtHxDateTimePicker_ValueClear` | Value cleared |
| `EvtHxDateTimePicker_ClosePopup` | Popup close requested |
| `EvtHxDateTimePicker_GetPicker` | Get the picker DOM node |
| `EvtHxDateTimePicker_ArrowKey` | Arrow key pressed |

## Keyboard Navigation

- **Enter** — Open popup (when `enterToOpenPopup` is set)
- **Space** — Open popup (when `spaceToOpenPopup` is set, default)
- **Escape** — Close popup
- **Arrow keys** — Navigate between days in the calendar grid
- **Tab** — Move focus through panel elements

## Global Config

```ts
import { configHxDateTimePicker } from '@hx/components';
configHxDateTimePicker({
  clearable: true,
  firstDayOfWeek: 'mon',
  todayKey: '~MyApp.Now',
});
```

Available configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `valueFormat` | `HxDateTimeRelatedFormat` | — | Default value format |
| `clearable` | `boolean` | `false` | Show clear button |
| `firstDayOfWeek` | `'sun' \| 'mon' \| 'default'` | `'default'` | First day of week |
| `weekendDays` | `HxDateWeekendDays` | `'default'` | Weekend days |
| `forceGregorian` | `boolean` | `true` | Force Gregorian calendar |
| `enterToOpenPopup` | `boolean` | `false` | Open popup on Enter |
| `spaceToOpenPopup` | `boolean` | `true` | Open popup on Space |
| `zIndex` | `number` | — | Popup z-index base |
| `gapToEdge` | `number` | — | Popup gap to viewport edge |
| `placeholderKey` | `string` | `'~HxCommon.DateTimePickerPlaceholder'` | Placeholder i18n key |
| `placeholder` | `boolean` | `true` | Show placeholder |
| `todayKey` | `string` | `'~HxCommon.TodayButton'` | "Now" button i18n key |
| `clearKey` | `string` | `'~HxCommon.ClearButton'` | "Clear" button i18n key |
| `monthKeyPrefix` | `string` | `'~HxCommon.Month'` | Month name i18n prefix |
| `weekdayKeyPrefix` | `string` | `'~HxCommon.Weekday'` | Weekday name i18n prefix |

## Multi-Era Japanese Calendar: Binary Search Detail

The Japanese calendar can have era transitions mid-month. When displaying a month view in the calendar popup with `forceLang="ja-JP"`, the `eraOfDays` method of the state ref detects multi-era months and pinpoints the transition day.

The algorithm works as follows:

```
Input:  daysOfThisMonth — all days belonging to the current month
Output: Map<Date, string> — day → era label (empty map for single-era months)

1.  Take the first day and last day of the month.
2.  Format both in numeric form to get their era names:
      eraOfFirstDay, eraOfLastDay
3.  If eraOfFirstDay === eraOfLastDay → return empty map (single era).
4.  Otherwise, perform binary search over [0, daysOfThisMonth.length - 1]:
      a. Compute midpoint index.
      b. Format the midpoint day in numeric form to get its era.
      c. If midpoint era === eraOfFirstDay → search right half.
      d. If midpoint era !== eraOfFirstDay → record it as foundDay
         and search left half.
5.  Bind foundDay → eraOfLastDay in the result map.
6.  Return the map with era labels for days in the new era.
```

A hardcoded override handles the `至徳`/`嘉慶` transition in August 1387 (Julian calendar) where Intl.DateTimeFormat may produce inconsistent era labels.

## Native DOM Events

The trigger input and popup forward most standard DOM events. Commonly used: `onFocus`, `onBlur`. Value changes are handled automatically via `$model`/`$field` binding.
