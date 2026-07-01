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
