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
  calendarLocale="ja-JP"
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
| `displayFormat` | `HxDateTimePickerDisplayFormat` | — | Display format string, pattern, or function (function receives a `UTCDate`) |
| `availableParts` | `HxDateTimeRelatedFormat` | auto-detected | Which datetime parts are available (date, time, or both) |
| `defaultValue` | `HxDateTimeDefaultValuesInStr \| HxDateTimeValue` | — | Default value when model is empty |
| `valueFormat` | `HxDateTimeRelatedFormat` | — | Value format for model binding |
| `firstDayOfWeek` | `'sun' \| 'mon' \| 'default'` | `'default'` | First day of the week |
| `weekendDays` | `HxDateWeekendDays \| 'default'` | `'default'` | Weekend day configuration |
| `calendarLocale` | `'gregory' \| HxLanguageCode` | — | Force a specific locale or Gregorian calendar |
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

## Supported Date Range

The datetime picker operates within a fixed Gregorian date range of **0001/01/01** through **9999/12/31**. This bound applies across all calendar systems.

### Global Bounds

| Boundary | Gregorian Date | Behavior |
|----------|---------------|----------|
| Lower bound | 0001/01/01 | The AD epoch. Year 1 has no previous year. January of year 1 has no previous month. There is no year 0 (1 BC → 1 AD). |
| Upper bound | 9999/12/31 | The maximum representable date. Year 9999 has no next year. December of year 9999 has no next month. |

When either boundary is reached, the corresponding **previous/next year and previous/next month navigation buttons are disabled** in the popup header.

### Non-Gregorian Calendars

Non-Gregorian calendars map their navigation bounds to the same Gregorian epoch (0001/01/01) and upper limit (9999/12/31), expressed in their own calendar terms. Each calendar implements precise day-level thresholds accounting for partial-month windows at the boundaries:

| Calendar | Lower Bound (calendar date) | Upper Bound (calendar date) |
|----------|---------------------------|---------------------------|
| Gregorian | 0001/01/01 | 9999/12/31 |
| Japanese | 1/01/03 | 9999/12/31 |
| Minguo | −1911/01/03 | 8088/12/31 |
| Buddhist | 544/01/03 | 10542/12/31 |
| Hebrew | 3761/04/18 | 13760/02/28 |
| Islamic (tabular) | −640/05/20 | 9666/03/30 |
| Islamic (civil) | −640/05/18 | 9666/04/02 |
| Islamic (Umalqura) | −640/05/18 | 9666/04/02 |
| Persian | −621/10/11 | 9378/10/10 |
| Coptic | −284/05/08 | 9716/02/21 |
| Ethiopic | 5493/05/08 | 9992/02/21 |
| Indian (Saka) | −78/10/11 | 9921/10/10 |

> **Why these three start at 01/03:** Japanese, Minguo, and Buddhist calendars used the Julian calendar before the Gregorian reform in 1582. The Julian calendar's extra leap years accumulated a +12 day drift, and the 1582 reform removed 10 days, leaving a net +2 day offset at the epoch. So calendar 01/01–02 map to Gregorian 12/30–31 BC (clamped to the AD epoch), and **01/03** is the first day that maps to Gregorian 0001/01/01.

> **Note:** Islamic calendar variants (tabular, civil, Umalqura) implement year/month **move operations** (`moveYear`/`moveMonth`) via the shared `DateMoveAnyMonthsProvider` superclass (the same 12-month mechanism used by Indian and Persian), and both the months and years panels via the shared panel skeleton.

### Parse and Format Input Behavior

Date parsing and format-input components treat range boundaries differently from the picker:

| Layer | Range Validation |
|-------|-----------------|
| `DateParseUtils.parseValue` | No semantic validation. Accepts any digit values (e.g. month `"61"` is accepted). Only validates string structure (separator matching, trailing characters). |
| `DateParseUtils.fromParsed` / `toParsed` | Clamps year to `[0, 9999]`, other parts to `[0, 99]`. Does not validate month ≤ 12 or day ≤ 31. |
| `HxFormatInput` (datetime) | Structural validation only at edit time: digit count per field (year=4, others=2), separator positions. Range checks (e.g. month > 12) are **deferred to blur/submit** validation. |
| Negative numbers | Not supported. `-` is treated as a date separator, never as a sign. |

### Fallback to Format-Input

When the display format does not include a full date (`y`/`m`/`d` all present —
e.g. a time-only or year-month format), no calendar popup can be shown. Instead
of throwing, the picker degrades to a plain `HxFormatInput`. This is a soft
misconfiguration indicator rather than a functional time-only mode: the input
pattern is derived from `availableParts` → `valueFormat` → the common default
(`y/m/dTh:n:s`), and the `displayFormat` itself is intentionally ignored. Use a
full date display format (or set `availableParts` / `valueFormat` explicitly)
to get the calendar popup.

## Calendar Systems

The datetime picker supports multiple calendar systems through the `calendarLocale` prop:

- **Gregorian** (default) — `calendarLocale="gregory"` or omitted
- **Japanese Imperial** — `calendarLocale="ja-JP"` (era-based: Reiwa, Heisei, Showa, etc.)
- **Minguo (ROC)** — `calendarLocale="zh-TW"` (Taiwan)
- **Buddhist (B.E.)** — `calendarLocale="th"` (Thailand)
- **Coptic** — `calendarLocale="ar-EG"` (Egypt, Anno Martyrum)
- **Ethiopic** — `calendarLocale="am-ET"` or `"ti-ET"` (Ethiopia/Eritrea, Incarnation Era)
- **Hebrew** — `calendarLocale="he-IL"` (Israel)
- **Islamic** — `calendarLocale="ar-SA"` (Saudi Arabia)
- **Persian** — `calendarLocale="fa-IR"` (Iran; months and years panels show Persian months with BC/10k boundary markers)
- **Indian (Saka)** — `calendarLocale="hi-IN"` (India; months and years panels show Saka months with BC/10k boundary markers)

See [Date Localization utilities](./hx-components-Utilities#date-localization) for the complete calendar mapping.

### Calendar Panels

The months and years panels of the popup are built on a shared
walk-and-re-anchor skeleton (`DateLocaleNotGregorianHelper`); Gregorian-and-Julian
calendars (Japanese, Minguo, Buddhist) add the 1582/10 short-month handling via
`DateLocaleGregorianAndJulianHelper`.

- **Minguo / Buddhist** — full years and months panels, including the era
  boundary (Minguo −1 ↔ 1), the 1582 reform crossing and the calendar clamps.
- **Indian (Saka)** — full years and months panels; the Saka calendar bounds
  [−78, 9921] leave partial years at both ends, so months 1-9 of −78 are marked
  `bc` and months 11-12 of 9921 are marked `y10k`.
- **Persian** — full years and months panels; the Persian bounds [−621, 9378]
  leave partial years at both ends, so months 1-9 of −621 are marked `bc` and
  months 11-12 of 9378 are marked `y10k`.
- **Islamic (tabular / civil / Umalqura)** — full years and months panels;
  the Islamic bounds [−640, 9666] leave partial years at both ends, so months
  1-4 of −640 are marked `bc` and months 5-12 of 9666 are marked `y10k`. The
  years panel walks 353 days per calendar year (Islamic years are 354/355
  days) and backs off to Muharram 1 via the landing month; at the bottom clamp
  its first cell anchors at −640/1/1 (Gregorian 1 BCE 8/17), before the
  calendar's first representable days — expected, like the Persian −621/1/1
  anchor.
- **Coptic / Ethiopic** — full years and months panels; the months panel shows
  **13 month cells** (12 × 30-day months plus the 5/6-day intercalary month).
  The Coptic bounds [−284, 9716] leave partial years at both ends, so months
  1-4 of −284 are marked `bc` and months 3-13 of 9716 are marked `y10k`; the
  Ethiopic bounds (B.I. 5493–5500, A.I. 1–9992) similarly mark months 1-4 of
  5493 `bc` and months 3-13 of 9992 `y10k`.

- **Hebrew** — full years and months panels; the Hebrew bounds [3761, 13760]
  leave partial years at both ends, so months 1-3 of 3761 are marked `bc`
  and months 3-12 of 13760 are marked `y10k`. Months are numbered in the
  civil sequence starting at Tishrei; in a leap year Adar is split into
  Adar I / Adar II and the grid appends a 13th month (Elul). The years
  panel walks 353 days per calendar year and corrects the year iteratively
  (Hebrew years are 353/354/355 days, leap years 383/384/385), stepping
  355 days per year with a leap-month skip.

Each years-panel cell holds the **first day of its calendar year** in ICU
semantics; at the calendar edges the cell date may fall outside the Gregorian
[0001, 9999] range (e.g. Minguo −1911/1/1 and Saka −78/1/1 anchor in 1 BCE) —
this is expected. Clicking a cell applies the cell's year offset to the state
date and never uses the cell date directly.

### Era Display and Multi-Era Month Detection

When using the **Japanese calendar** (`ja-JP`), a single calendar month may span two eras. This occurs when the Japanese era transition falls within a Gregorian month. For example, Meiji 5 (1872) transitions from Meiji to a new era mid-month, or the `至徳`/`嘉慶` transition in August 1387.

The `yearHeaderLabel`, `monthHeaderLabel`, and `eraOfDays` methods on `HxDateTimePickerStateRef` delegate to `DateLocaleUtils`, which routes non-Gregorian calls to the corresponding `DateLocaleNotGregorianProvider` plugin (e.g., `DateJapaneseUtils` for Japanese). The plugin's `eraOfDays` implementation:

1. Checks whether the first and last day of the displayed month belong to different eras using `DateLocaleFormatUtils.formatDateInNumeric()`.
2. If they differ, performs a **binary search** over the month's days to find the exact boundary day where the era transitions.
3. The binary search works by repeatedly checking the era of the midpoint day:
   - If the midpoint is still in the first era, search the right half.
   - If the midpoint is in the new era, record it as the candidate boundary and search the left half.
4. Once found, the boundary day is marked with the new era label in a `Map<Date, string>`.

A special hardcoded case exists for the `至徳`/`嘉慶` transition in August 1387, where the Intl API era detection produces ambiguous results.

## Internal State Ref

`useHxDateTimePickerPopupStateRef` is the core state management hook for the datetime picker popup. It exposes the following:

| Method | Description |
|--------|-------------|
| `modelValue()` | Get the value from the model (or `null`/`undefined` when empty) |
| `stateValue()` | Get the internal state value (fulfilled; may differ from the model after navigation) |
| `formatted()` | Get formatted labels (era, year, month, day, weekdays) |
| `yearHeaderLabel(era, year)` | Get year label for the header |
| `monthHeaderLabel(era, year, month)` | Get month label for the header |
| `eraOfDays(days)` | Get era labels per day (for multi-era month display) |
| `isPreviousYearAllowed()` / `isNextYearAllowed()` / `isPreviousMonthAllowed()` / `isNextMonthAllowed()` | Check calendar navigation bounds |
| `currentDatePanel()` | Get the current panel (`'days'` / `'months'` / `'years'`) |
| `switchDatePanel(panel, notifyEvent)` | Switch the date panel |
| `gregorian()` | Check if Gregorian mode is active |
| `language()` | Get current language code |
| `weekdays()` | Compute weekday labels for the grid |
| `days(weekdays)` | Compute day cells for the calendar grid |
| `months()` | Compute month cells for the months panel |
| `years()` | Compute year cells for the years panel |
| `changeYear(yearOffset, applyToModel)` | Navigate by year offset |
| `changeMonth(monthOffset, applyToModel)` | Navigate by month offset |
| `changeDayTo(year, month, day)` | Select a specific day |
| `clearModelValue()` | Clear the model value |
| `clearState()` | Clear all cached state; the next access re-reads from the model |

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

The Japanese calendar can have era transitions mid-month. When displaying a month view in the calendar popup with `calendarLocale="ja-JP"`, the state ref's `eraOfDays` method delegates to `DateLocaleUtils.eraOfDays()`, which routes to `DateJapaneseUtils.eraOfDays()` — the Japanese `DateLocaleNotGregorianProvider` plugin implementation — to detect multi-era months and pinpoint the transition day.

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
