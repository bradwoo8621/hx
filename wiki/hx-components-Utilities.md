# Utilities

Utility functions and context providers exported by `@hx/components`.

---

## Build Content

Constructs action menu content from action/group definitions.

```ts
import { buildContent } from '@hx/components';

const menu = buildContent([
  { label: 'Edit', onClick: handleEdit },
  { type: 'separator' },
  { label: 'Delete', onClick: handleDelete, disabled: true },
]);
```

---

## Data / Attribute Utilities

| Export | Purpose |
|--------|---------|
| `HxDataUtils.resolveChildModel($model, $field)` | Resolves a child `$model`, silently materializing `{}` when the slot is `null` / `undefined` (object slots only) |
| `HxDataPropToAttrValueComputer` | Per-component registry mapping props to `data-hx-*` attributes |
| `HxCommonDataPropToAttrValueComputerKey` | Registry key (`'HxCommon'`) for the shared computer |
| `HxDataAttributesUtils` | Helpers for computing/normalizing data attributes |
| `HxConsole` / `HxConsoleDelegate` | Console wrapper used by the library; supports custom delegates |

## Input Utilities

Factory functions for input event handlers.

```ts
import {
  createHxInputFocusHandler,
  createHxInputKeyDownHandler,
  createHxInputSelectAllHandler,
} from '@hx/components';
```

---

## Repeated Event Guard

`DOMUtils` drops repeated events on configured tag/event pairs while an earlier
handler is still running. The default configuration guards `click` on `button`,
which covers patterns such as submitting a form twice.

```ts
import { DOMUtils } from '@hx/components';

DOMUtils.getAvoidEventsMultipleTrigger(); // { button: ['click'] }
DOMUtils.setAvoidEventsMultipleTrigger({ button: ['click'], form: ['submit'] });
```

How a guarded event is handled:

- Before the handler runs, a transient `data-hx-aemt-<event>` attribute is
  written to the element. If that attribute is already present, the repeated
  event is ignored and the handler is not called.
- A synchronous handler releases the guard as soon as it returns; a handler that
  returns a Promise keeps it until the promise settles. Only the handler's own
  Promise is tracked — asynchronous work started elsewhere (for example inside a
  model listener) is not covered.
- A promise that has not settled after 10 seconds logs an error through
  `HxConsole`. Add `data-hx-aemt-suppress-error-report=""` to the element to opt
  out of that report; the guard is still held until the promise settles.
- Synchronous throws keep their normal semantics, and non-configured events are
  passed through unchanged.

`DOMUtils.testAvoidEventsMultipleTrigger(event, mark?)` exposes the same check
for custom handlers. Call it synchronously inside the listener, and remove the
returned guard attribute when the handler finishes.

---

## Pagination Utility

Reads and normalizes pagination data from a model (or from the `$model` root when `$field` is omitted). The lower-level `computePaginationData` is module-private.

```ts
import { readPaginationData } from '@hx/components';

const data = readPaginationData(
  {$model: form, $field: 'pagination', allowedPageSizes: [20]},
  context
);
// => { pageNumber: 1, pageSize: 20, totalPages: 1, totalItems }
```

`read` is the optional prop-level mapper `($model, value, context) => Partial<HxPaginationData>`. All numeric fields are coerced with `Number`; `pageNumber` defaults to `1`, `pageSize` to `allowedPageSizes[0]`, `totalPages` to `1`.

---

## Upload Utilities

```ts
import {
  parseFileName,   // (file: HxUploadFile) => [baseName: string, extName: string | undefined]
  mapError,        // (hasUploadError: boolean, message?: string) => string | undefined
  isImage,         // (bytes?: Uint8Array | null) => 'JPEG' | 'PNG' | 'GIF' | 'WEBP' | 'BMP' | 'APNG' | 'AVIF' | false
  toImageSrc,      // (bytes: Uint8Array, type: Lowercase<HxUploadImageType>) => data URL
  releaseImage,    // (url: string) => void — releases the object/data URL
} from '@hx/components';
```

`isImage` detects the format from magic bytes. Gallery uploads accept JPEG, PNG, GIF, WEBP, BMP, APNG, and AVIF.

---

## Accept Check

Normalizes an accept string or array into a comma-joined `accept` attribute value. It returns `undefined` for an empty result — it is not a validation function.

```ts
import { computeAccept } from '@hx/components';

computeAccept(['.pdf', 'image/*']); // '.pdf,image/*'
computeAccept('  ');                // undefined
```

File-type validation itself is done by the upload component against the browser `accept` value and magic bytes; `useAcceptCheck` only warns about gallery-mode misconfiguration.

---

## SVG Icon Defaults

```ts
import { computeSvgIconDefaults } from '@hx/components';
// Fixed defaults — not settings-driven:
// width/height 15, viewBox "0 0 15 15", fill "none"
// maps marginT/R/B/L to data-hx-margin-t/r/b/l
```

---

## String / Number / File / Format / Environment

| Export | Purpose |
|--------|---------|
| `StringUtils` | String helpers (case, trimming, empty checks, …) |
| `StringChange` | Character-diff helper set used by format-input editing |
| `NumberUtils` | Locale-aware number formatting/parsing helpers |
| `FileUtils.sizeToStr(size)` | `[value, unit]` from a byte count |
| `HxFmt` / `HxFormatSettings` | Shared formatter used by labels and date/value display |
| `AnyUtils` | Small generic helpers |
| `DeviceCheck` | Browser/device capability checks |
| `BodyScrollLock` | Based on `body-scroll-lock`; used by overlays |

## Context Providers

Internal providers using `EventEmitter` for cross-component communication:

| Provider | Context API |
|----------|-------------|
| `HxPanelProvider` | `checkCollapsed`, `collapse`, `expand` + `on…` / `off…` listeners |
| `HxTabProvider` | `checkActive`, `active` + `on…` / `off…` listeners |
| `HxTabsProvider` | `getActive`, `checkActive`, `checkActiveable`, `active`, `doActive`, `activeChanged` + `on…` / `off…` listeners |
| `HxUploadProvider` | `fileUploaded`, `fileDeleted`, `clearError`, `raiseError` + `on…` / `off…` listeners |
| `HxSelectOptionsProvider` | `askOptions`, `optionsLoad`, `optionsChange`, `valueChange` + `on…` / `off…` listeners |
| `HxOverlayInternalContextProvider` | `hide`, `hideComplete` + `onHide` / `offHide` |

These providers are event-driven, not state containers. Most are internal and not exported from the package barrel (only `HxSelectOptionsProvider` is re-exported, through the `select-options` module). `HxOverlayInternalProvider` does not exist; the actual component is `HxOverlayInternalContextProvider`.

---

## Pattern Kits (FormatInput)

Built-in pattern-kit implementations and the registry used by `HxFormatInput`:

```ts
import {
  HxFormatInputNumberPatternKit,
  HxFormatInputIntegerPatternKit,
  HxFormatInputDateTimePatternKit,
  HxFormatInputPatternKitsInner,  // registry: @n → number, @i → integer, @d → datetime
} from '@hx/components';
```

The abstract base class (`AbstractHxFormatInputPatternKit`) is **not** exported from the package barrel, so external kits cannot currently be authored by extending it. Register through `HxFormatInputPatternKitsInner.register(builder)`; an unrecognized pattern silently downgrades to a plain `HxInput` and logs a console error.

---

## Date Localization

`DateLocaleFormatUtils` provides locale-aware formatting for individual date/time parts using `Intl.DateTimeFormat.formatToParts()`. All formatting is **UTC-based** — dates are passed as `UTCDate` (a timezone-free wrapper over the JS `Date`), so the host timezone never affects the output.

```ts
import { DateLocaleFormatUtils, UTCDate } from '@hx/components';

const date = UTCDate.of(2025, 6, 6); // 2025-07-06

// Locale-aware part formatting
DateLocaleFormatUtils.formatYear(date, 'ja-JP', false);  // "7年" (era is a separate part)
DateLocaleFormatUtils.formatYear(date, 'ja-JP', true);   // "2025" (forced Gregorian, digits only)
DateLocaleFormatUtils.formatMonth(date, 'zh-CN', false); // "7月"
DateLocaleFormatUtils.formatDay(date, 'en-US', true);    // "6"
DateLocaleFormatUtils.formatWeekday(date, 'zh-CN', true); // "日" (weekday prefix omitted)
DateLocaleFormatUtils.formatEra(date, 'ja-JP', false);   // "令和"
```

### Plugin Architecture

Non-Gregorian calendars (Japanese, Minguo, Buddhist, Korean, Coptic, Ethiopic, Hebrew, Islamic ×3, Persian, Indian, Chinese) are managed through a plugin system implementing the `DateLocaleNotGregorianProvider` interface. Each plugin declares its own `accept()`, `calendar()`, `supportedLanguages()`, and optional `eraAs()` / `yearAs()` / `yearHeaderLabel()` / `monthHeaderLabel()` / `eraOfDays()` / `monthsOfYear()` / `yearsAround()` methods. Calendar navigation additionally needs a move provider implementing `DateMoveNotGregorianProvider` (`moveYear` / `moveMonth` / boundary hooks), registered via `DateMoveUtils.enableNotGregorianMoveProvider()`.

Enable locale-specific calendar support:

```ts
import {
  DateBuddhistUtils, DateChineseUtils, DateCopticUtils, DateEthiopicUtils,
  DateHebrewUtils, DateIndianUtils, DateIslamicUtils, DateIslamicCivilUtils,
  DateIslamicUmalquraUtils, DateJapaneseUtils, DateKoreanUtils, DateMinguoUtils,
  DatePersianUtils
} from '@hx/components';

DateCopticUtils.enable();           // ar-EG → coptic (Anno Martyrum)
DateEthiopicUtils.enable();         // am-ET / ti-ET → ethiopic (Incarnation Era)
DateJapaneseUtils.enable();         // ja / ja-JP → japanese
DateMinguoUtils.enable();           // zh-TW / zh-Hant-TW → roc (Minguo)
DateKoreanUtils.enable();           // ko / ko-KR / ko-KP → Gregorian (no special calendar)
DateBuddhistUtils.enable();         // th / th-TH → buddhist
DateHebrewUtils.enable();           // he / he-IL → hebrew
DateIslamicUtils.enable();          // ar-DZ / ar-MA / ar-TN → islamic
DateIslamicCivilUtils.enable();     // ar-AE / ar-IQ / ar-SY / ... → islamic-civil
DateIslamicUmalquraUtils.enable();  // ar-SA / ar-OM / ar-YE / ... → islamic-umalqura
DateIndianUtils.enable();           // hi / hi-IN / en-IN → indian
DatePersianUtils.enable();          // fa / fa-IR / ckb-IR / ... → persian
DateChineseUtils.enable();          // zh-CN → chinese

DateCopticUtils.disable();          // Remove the Coptic plugin (each plugin also exposes disable())
```

The Coptic calendar spans two eras: **Anno Martyrum** (AM, Gregorian 284+) and **Before Diocletian**. Before-Diocletian dates return the era label `"ق.د"` from `eraAs()`; the year itself is formatted without an additional prefix.

The Ethiopic calendar spans two eras: **Anno Incarnationis** (A.I., Gregorian 8+) and **Before Incarnation**. `eraAs()` returns `"ዓ.ዓ."` for Amharic and `"A.A."` for Tigrinya Before-Incarnation dates (and `''` otherwise). The B.I. era uses year numbers 5493–5500 (Gregorian 1–8 CE).

The Persian calendar's leap rule follows ICU (persncal.cpp): a base 33-year
cycle of 8 leap years (years whose remainder is in `{1, 5, 9, 13, 17, 22, 26, 30}`),
overridden for Persian years 1502–2987 by a leap-day shift table — each entry X
makes year X common and year X+1 leap, moving the leap day one year forward.
Years ≥ 2988 fall back to the plain mod-33 rule. The move provider implements
the same rule so navigation and formatting always agree with the runtime Intl.

**Calendar resolution** — plugins must be `enable()`d before locale calendars are available; an unregistered locale silently falls back to Gregorian. When `gregorian` is `false`, `DateLocaleFormatUtils` resolves the calendar from the locale via the `CALENDAR_MAP`, which is populated from the `supportedLanguages()` of every enabled plugin:

- `ar-AE` / `ar-BH` / `ar-IQ` / `ar-KW` / `ar-LB` / `ar-QA` / `ar-SY` → `islamic-civil`
- `ar-DZ` / `ar-MA` / `ar-TN` → `islamic`
- `ar-OM` / `ar-SA` / `ar-SD` / `ar-YE` → `islamic-umalqura`
- `fa-AF` / `fa-IR` / `ckb-IR` / `lrc` / `lrc-IR` / `mzn` / `mzn-IR` / `ps-AF` → `persian`
- `uz-Arab` / `uz-Arab-AF` → `persian`

Bare `fa` and bare `ps` are not accepted by the Persian plugin.
- `hi-IN` / `en-IN` / `hi` → `indian`
- `he-IL` / `he` → `hebrew`
- Plugin-managed: `am-ET` / `ti-ET` → `ethiopic`, `ar-EG` → `coptic`, `ja` / `ja-JP` → `japanese`, `zh-TW` / `zh-Hant-TW` → `roc`, `th` / `th-TH` → `buddhist`, `zh` / `zh-Hans` (not `zh-TW`) → `chinese`, `ko` / `ko-KR` → Gregorian (Korean plugin accepts the locale but uses the Gregorian calendar)

`HxDateTimeFormatCalendar` supports all 18 ECMA-402 calendar values:

```ts
type HxDateTimeFormatCalendar =
  | 'gregory' | 'buddhist' | 'chinese' | 'coptic' | 'dangi'
  | 'ethioaa' | 'ethiopic' | 'hebrew' | 'indian'
  | 'islamic' | 'islamic-civil' | 'islamic-umalqura'
  | 'islamic-tbla' | 'islamic-rgsa'
  | 'iso8601' | 'japanese' | 'persian' | 'roc'
  | string; // extensible for plugin-defined calendars
```

### Custom Calendar Plugins

Implement the `DateLocaleNotGregorianProvider` interface to add custom calendar support:

```ts
import type { DateLocaleNotGregorianProvider } from '@hx/components';
import { DateLocaleFormatUtils } from '@hx/components';

const myPlugin: DateLocaleNotGregorianProvider = {
  accept(lang) { return lang === 'my-LOCALE'; },
  calendar() { return 'dangi'; },
  supportedLanguages() { return ['my-LOCALE']; },
  eraAs(date, partsOf, lang) { /* custom era formatting */ },
  yearAs(date, partsOf, lang) { /* custom year formatting */ },
  yearHeaderLabel(value, era, year, lang) { /* custom year label */ },
  monthHeaderLabel(value, era, year, month, lang) { /* custom month label */ },
  eraOfDays(days, lang) { /* era markers per day */ },
};

DateLocaleFormatUtils.enableNotGregorianLocaleProvider(myPlugin);
DateLocaleFormatUtils.disableNotGregorianLocaleProvider(myPlugin);
```

For calendar navigation, additionally register a move provider implementing `DateMoveNotGregorianProvider`:

```ts
import { DateMoveUtils, type DateMoveNotGregorianProvider } from '@hx/components';

const myMovePlugin: DateMoveNotGregorianProvider = {
  accept(lang) { return lang === 'my-LOCALE'; },
  moveYear(date, yearOffset, lang) { /* ... */ },
  moveMonth(date, monthOffset, lang) { /* ... */ },
  isPreviousYearAllowed(lang, firstDayOfCurrentMonthOfGregory) { /* ... */ },
  // isNextYearAllowed / isPreviousMonthAllowed / isNextMonthAllowed ...
};

DateMoveUtils.enableNotGregorianMoveProvider(myMovePlugin);
```

`DateLocaleFormatUtils.getWeekInfo()` reads locale-aware weekend and first-day-of-week from CLDR data:

```ts
const { weekends, firstDayOfWeek } = DateLocaleFormatUtils.getWeekInfo('ar-SA');
// weekends: ['fri', 'sat'], firstDayOfWeek: 'sat'
const { weekends, firstDayOfWeek } = DateLocaleFormatUtils.getWeekInfo('en-US');
// weekends: ['sat', 'sun'], firstDayOfWeek: 'sun'
```

When `gregorian` is `true`, all formatting uses the Gregorian calendar. When `gregorian` is `false`, the locale-specific calendar from `CALENDAR_MAP` is used, falling back to Gregorian if no mapping exists.
