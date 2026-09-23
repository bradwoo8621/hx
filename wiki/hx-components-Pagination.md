# HxPagination

Page navigation control with optional page size selector.

```tsx
// With page size selector
<HxPagination
  $model={form}
  $field="pagination"
  allowedPageSizes={[10, 20, 50]}
  showPageSize
  onPageNumberChange={(page) => fetchData(page)}
  onPageSizeChange={(size) => fetchData(1, size)}
/>

// Minimal — just page navigation
<HxPagination
  $model={form}
  $field="pagination"
  onPageNumberChange={(page) => loadPage(page)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model (creates internal model if omitted) |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path for `HxPaginationData` |
| `allowedPageSizes` | `number[]` | `[20]` | Available page size options in the dropdown |
| `showPageSize` | `boolean` | `false` | Show the page size selector |
| `gapX` | `HxGap` | `'xs'` | Horizontal gap between the controls |
| `onPageNumberChange` | `(pageNumber: number) => Promise<void> \| void` | — | Async callback on page change; the model value rolls back if it rejects |
| `onPageSizeChange` | `(pageSize: number) => Promise<void> \| void` | — | Async callback on page size change; the model value rolls back if it rejects |

## Internal Model (`HxPaginationData`)

| Field | Type | Description |
|-------|------|-------------|
| `pageSize` | `number` | Items per page |
| `pageNumber` | `number` | Current page (1-based) |
| `totalPages` | `number` | Total page count |
| `totalItems` | `number` | Total item count |

> **Do not attach `ERO.on` listeners to the pagination data fields.** The component syncs its internal page state and the model in multiple steps on every change, so field listeners would receive several events per interaction and observe intermediate values. React to pagination changes through `onPageNumberChange` / `onPageSizeChange` instead — they fire once per interaction, after the model has been written, and their rejection triggers a rollback to the previous value.

## Utility

```ts
import { computePaginationData } from '@hx/components';

computePaginationData(150, 20, 1);
// => { pageSize: 20, pageNumber: 1, totalPages: 8, totalItems: 150 }
```

## Global Config

```ts
import { configHxPagination } from '@hx/components';
configHxPagination({ allowedPageSizes: [20], showPageSize: false, gapX: 'xs' });
```
