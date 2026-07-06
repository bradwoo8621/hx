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
import { DateLocaleUtils, type ArabCalendar } from '@hx/components';

const date = new Date(2025, 6, 6, 15, 30, 0);

// Locale-aware part formatting (returns part value with literal suffix)
DateLocaleUtils.formatYear(date, 'ja-JP', false);     // "令和7年"
DateLocaleUtils.formatYear(date, 'zh-CN', true);       // "2025年" (forced Gregorian)
DateLocaleUtils.formatMonth(date, 'zh-CN', false);     // "7月"
DateLocaleUtils.formatDay(date, 'en-US', true);        // "6"
DateLocaleUtils.formatWeekday(date, 'zh-CN', true);    // "周日"

// Arabic calendar variants
type ArabCalendar = 'islamic' | 'islamic-civil' | 'islamic-umalqura' | 'islamic-tbla' | 'islamic-rgsa';
DateLocaleUtils.formatYear(date, 'ar-SA', 'islamic-umalqura'); // "رجب"
```

**Calendar resolution** — when `gregorian` is `false`, `DateLocaleUtils` resolves the calendar from the locale:
- `ja-JP` / `ja` → `japanese` (Reiwa/Heisei/Showa era)
- `zh-TW` → `roc` (Minguo calendar)
- `hi-IN` / `en-IN` / `hi` → `indian`
- `he-IL` / `he` → `hebrew`
- `ar-EG` → `coptic`

When `gregorian` is `true`, all formatting uses the Gregorian calendar. When an `ArabCalendar` string is passed, that specific Islamic variant is used.
