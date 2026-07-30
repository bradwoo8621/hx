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

`DateLocaleUtils` provides locale-aware formatting for individual date/time parts using `Intl.DateTimeFormat.formatToParts()`.

```ts
import { DateLocaleUtils, type HxDateTimeFormatCalendar } from '@hx/components';

const date = new Date(2025, 6, 6, 15, 30, 0);

// Locale-aware part formatting (returns part value with literal suffix)
DateLocaleUtils.formatYear(date, 'ja-JP', false);     // "令和7年"
DateLocaleUtils.formatYear(date, 'zh-CN', true);       // "2025年" (forced Gregorian)
DateLocaleUtils.formatMonth(date, 'zh-CN', false);     // "7月"
DateLocaleUtils.formatDay(date, 'en-US', true);        // "6"
DateLocaleUtils.formatWeekday(date, 'zh-CN', true);    // "周日"
```

### Plugin Architecture

Non-Gregorian calendars (Japanese, ROC/Minguo, Buddhist, Korean, Coptic) are managed through a plugin system implementing the `NotGregorianLocaleUtils` interface. Each plugin declares its own `accept()`, `calendar()`, and optional `eraAs()` / `yearAs()` / `labelOfYear()` / `labelOfMonth()` / `eraOfDays()` methods.

Enable locale-specific calendar support:

```ts
import { DateArEGUtils, DateJaUtils, DateZhTWUtils, DateKoUtils, DateThUtils } from '@hx/components';

DateArEGUtils.enable();  // ar-EG → coptic (Anno Martyrum)
DateJaUtils.enable();    // ja / ja-JP → japanese
DateZhTWUtils.enable();  // zh-TW / zh-Hant-TW → roc (Minguo)
DateKoUtils.enable();    // ko / ko-KR / ko-KP → Gregorian (no special calendar)
DateThUtils.enable();    // th / th-TH → buddhist

DateArEGUtils.disable(); // Remove the plugin
```

The Coptic calendar spans two eras: **Anno Martyrum** (AM, Gregorian 284+) and **Before Diocletian** (displayed with a `"B.D."` prefix, e.g. `"B.D. 185"`). The plugin implements `yearAs()` to handle the era prefix automatically.

**Calendar resolution** — when `gregorian` is `false`, `DateLocaleUtils` resolves the calendar from the locale via the `CALENDAR_MAP`, which combines both the static mappings below and any enabled plugins:

- `am-ET` → `ethiopic`
- `ar-AE` / `ar-BH` / `ar-IQ` / `ar-KW` / `ar-LB` / `ar-QA` / `ar-SY` → `islamic-civil`
- `ar-DZ` / `ar-MA` / `ar-TN` → `islamic`
- `ar-EG` → `coptic`
- `ar-OM` / `ar-SA` / `ar-SD` / `ar-YE` → `islamic-umalqura`
- `fa` / `fa-AF` / `fa-IR` / `ckb-IR` → `persian`
- `ps` / `ps-AF` → `persian`
- `mzn` / `mzn-IR` / `lrc` / `lrc-IR` → `persian`
- `uz-Arab` / `uz-Arab-AF` → `persian`
- `hi-IN` / `en-IN` / `hi` → `indian`
- `he-IL` / `he` → `hebrew`
- Plugin-managed: `ar-EG` → `coptic`, `ja` / `ja-JP` → `japanese`, `zh-TW` / `zh-Hant-TW` → `roc`, `th` / `th-TH` → `buddhist`

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

Implement the `NotGregorianLocaleUtils` interface to add custom calendar support:

```ts
import type { NotGregorianLocaleUtils } from '@hx/components';

const myPlugin: NotGregorianLocaleUtils = {
  accept(lang) { return lang === 'my-LOCALE'; },
  calendar() { return 'dangi'; },
  supportedLanguages() { return ['my-LOCALE']; },
  eraAs(lang, date, partsOf) { /* custom era formatting */ },
  yearAs(lang, date, partsOf) { /* custom year formatting */ },
  labelOfYear(lang, value, era, year) { /* custom year label */ },
  labelOfMonth(lang, value, era, year, month) { /* custom month label */ },
  eraOfDays(lang, days) { /* era markers per day */ },
};

DateLocaleUtils.enableNotGregorianLocaleUtils(myPlugin);
```

`DateLocaleUtils.getWeekInfo()` reads locale-aware weekend and first-day-of-week from CLDR data:

```ts
const { weekends, firstDayOfWeek } = DateLocaleUtils.getWeekInfo('ar-SA');
// weekends: ['fri', 'sat'], firstDayOfWeek: 'sat'
const { weekends, firstDayOfWeek } = DateLocaleUtils.getWeekInfo('en-US');
// weekends: ['sat', 'sun'], firstDayOfWeek: 'sun'
```

When `gregorian` is `true`, all formatting uses the Gregorian calendar. When `gregorian` is `false`, the locale-specific calendar from `CALENDAR_MAP` is used, falling back to Gregorian if no mapping exists.
