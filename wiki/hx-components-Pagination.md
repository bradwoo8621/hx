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
| `onPageNumberChange` | `(pageNumber: number) => void` | — | Callback on page change |
| `onPageSizeChange` | `(pageSize: number) => void` | — | Callback on page size change |

## Internal Model (`HxPaginationData`)

| Field | Type | Description |
|-------|------|-------------|
| `pageSize` | `number` | Items per page |
| `pageNumber` | `number` | Current page (1-based) |
| `totalPages` | `number` | Total page count |
| `totalItems` | `number` | Total item count |

## Utility

```ts
import { computePaginationData } from '@hx/components';

computePaginationData(150, 20, 1);
// => { pageSize: 20, pageNumber: 1, totalPages: 8, totalItems: 150 }
```

## Global Config

```ts
import { configHxPagination } from '@hx/components';
configHxPagination({ allowedPageSizes: [20], showPageSize: false });
```
