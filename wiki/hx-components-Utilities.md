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

## Pagination Utility

Computes `HxPaginationData` from raw item/page counts:

```ts
import { computePaginationData } from '@hx/components';

const data = computePaginationData(150, 20, 1);
// => { pageSize: 20, pageNumber: 1, totalPages: 8, totalItems: 150 }
```

---

## Upload Utilities

```ts
import {
  parseFileName,   // (name: string) => { name: string, ext: string }
  mapError,        // (error: unknown) => user-friendly string
  isImage,         // (file: HxUploadFile) => boolean
  toImageSrc,      // (bytes: ArrayBuffer) => data: URL string
  releaseImage,    // (src: string) => undefined — revokes object URL
} from '@hx/components';
```

---

## Accept Check

Normalizes accept strings/arrays into a validation function:

```ts
import { computeAccept } from '@hx/components';

const check = computeAccept(['.pdf', 'image/*']);
check({ name: 'doc.pdf', mimeType: 'application/pdf' });   // true
check({ name: 'photo.jpg', mimeType: 'image/jpeg' });      // true
check({ name: 'data.exe', mimeType: 'application/x-msdownload' }); // false
```

---

## SVG Icon Defaults

```ts
import { computeSvgIconDefaults } from '@hx/components';
// Computes default dimensions and styles from settings
```

---

## Context Providers

Internal providers using `EventEmitter` for cross-component communication:

| Provider | State Provided |
|----------|---------------|
| `HxPanelProvider` | `{ collapsed, toggle }` |
| `HxTabProvider` | `{ isActive, mark, disabled, activate }` |
| `HxTabsProvider` | `{ tabs, activeMark, switchToTab, restoreScroll }` |
| `HxUploadProvider` | `{ files, errors, uploading, addFiles, removeFile, uploadAll, clearFiles }` |
| `HxSelectOptionsProvider` | `{ options, selectedValue, searchText, selectOption }` |
| `HxOverlayInternalProvider` | Lifecycle: `entering → entered → exiting → exited` |

---

## Pattern Kits (FormatInput)

Abstract base and built-in implementations for `HxFormatInput`:

```ts
import {
  AbstractHxFormatInputPatternKit,
  HxFormatInputNumberPatternKit,
  HxFormatInputDateTimePatternKit,
  HxFormatInputPatternKitsInner,  // registry: @n → NumberKit, @d → DateTimeKit
} from '@hx/components';

class MyKit extends AbstractHxFormatInputPatternKit {
  parse(raw: string): ParsedValue { /* ... */ }
  format(parsed: ParsedValue): string { /* ... */ }
}
```

---

## Date Localization

`DateLocaleFormatUtils` provides locale-aware formatting for individual date/time parts using `Intl.DateTimeFormat.formatToParts()`. All formatting is **UTC-based** — dates are passed as `UTCDate` (a timezone-free wrapper over the JS `Date`), so the host timezone never affects the output.

```ts
import { DateLocaleFormatUtils, UTCDate } from '@hx/components';

const date = UTCDate.of(2025, 6, 6); // 2025-07-06

// Locale-aware part formatting (returns part value with literal suffix)
DateLocaleFormatUtils.formatYear(date, 'ja-JP', false);  // "令和7年"
DateLocaleFormatUtils.formatYear(date, 'zh-CN', true);    // "2025年" (forced Gregorian)
DateLocaleFormatUtils.formatMonth(date, 'zh-CN', false);  // "7月"
DateLocaleFormatUtils.formatDay(date, 'en-US', true);     // "6"
DateLocaleFormatUtils.formatWeekday(date, 'zh-CN', true); // "周日"
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

The Coptic calendar spans two eras: **Anno Martyrum** (AM, Gregorian 284+) and **Before Diocletian** (displayed with a `"B.D."` prefix, e.g. `"B.D. 185"`). The plugin implements `yearAs()` to handle the era prefix automatically.

The Ethiopic calendar spans two eras: **Anno Incarnationis** (A.I., Gregorian 8+) and **Before Incarnation** (displayed with a `"B.I."` prefix, e.g. `"B.I. 5493"`). The B.I. era uses year numbers 5493–5500 (Gregorian 1–8 CE). The plugin implements `yearAs()` to handle the era prefix automatically.

**Calendar resolution** — when `gregorian` is `false`, `DateLocaleFormatUtils` resolves the calendar from the locale via the `CALENDAR_MAP`, which is populated from the `supportedLanguages()` of every enabled plugin:

- `ar-AE` / `ar-BH` / `ar-IQ` / `ar-KW` / `ar-LB` / `ar-QA` / `ar-SY` → `islamic-civil`
- `ar-DZ` / `ar-MA` / `ar-TN` → `islamic`
- `ar-OM` / `ar-SA` / `ar-SD` / `ar-YE` → `islamic-umalqura`
- `fa` / `fa-AF` / `fa-IR` / `ckb-IR` → `persian`
- `ps` / `ps-AF` → `persian`
- `mzn` / `mzn-IR` / `lrc` / `lrc-IR` → `persian`
- `uz-Arab` / `uz-Arab-AF` → `persian`
- `hi-IN` / `en-IN` / `hi` → `indian`
- `he-IL` / `he` → `hebrew`
- Plugin-managed: `am-ET` / `ti-ET` → `ethiopic`, `ar-EG` → `coptic`, `ja` / `ja-JP` → `japanese`, `zh-TW` / `zh-Hant-TW` → `roc`, `th` / `th-TH` → `buddhist`

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
