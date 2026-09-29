# HxPagination

Page navigation control with optional page size selector.

```tsx
// With page size selector
<HxPagination
  $model={form}
  $field="pagination"
  allowedPageSizes={[10, 20, 50]}
  showPageSize
  onPageNumberChange={async () => await fetchData()}
  onPageSizeChange={async (_, data) => { data.pageNumber = 1; await fetchData(); }}
/>

// Minimal — just page navigation
<HxPagination
  $model={form}
  $field="pagination"
  onPageNumberChange={async () => await loadPage()}
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
| `read` | `($model, value, context) => Partial<HxPaginationData>` | — | Map a non-standard model shape to pagination data |
| `write` | `($model, data, context) => void` | — | Custom write-back (replaces the default model write) |
| `ofTotalPagesKey` | `ReactNode` | `'~HxCommon.OfTotalPages'` | Text or i18n key after the page number, e.g. the `/` in `1 / 5` |
| `perPageKey` | `ReactNode` | `'~HxCommon.PerPage'` | Text or i18n key after the page size number, e.g. `/ Page` |
| `totalItemsKey1` | `ReactNode` | `'~HxCommon.TotalItems1'` | Text or i18n key before the total item count, e.g. `Total` |
| `totalItemsKey2` | `ReactNode` | `'~HxCommon.TotalItems2'` | Text or i18n key after the total item count, e.g. `Items` |
| `totalCommaKey` | `ReactNode` | `'~HxCommon.TotalComma'` | Text or i18n key between the total count and the page size, e.g. `,` |
| `loading` | `'none' \| 'start' \| 'end'` | `'none'` | Show a spinning indicator over the control while a change callback is in flight (`start` / `end` position) |
| `onPageNumberChange` | `($model, data, context) => Promise<void> \| void` | — | Async callback on page change; the change rolls back if it rejects |
| `onPageSizeChange` | `($model, data, context) => Promise<void> \| void` | — | Async callback on page size change; the change rolls back if it rejects |
| `onPageChanged` | `($model, data, context) => Promise<void> \| void` | — | Fired once after a page number/size change has been applied and written back; errors are logged and never roll the change back |

## Change Callbacks

`onPageNumberChange` / `onPageSizeChange` receive a **plain snapshot** of the internal pagination data as `data`. Mutating `totalPages` / `totalItems` on the snapshot inside the callback is the supported way to reflect server results — changed fields are written back to `$model` automatically and the control repaints. A page-size callback may also reset `pageNumber` (e.g. jump back to page 1 after changing the size); mutating the field that triggered the change itself has no effect. When the returned promise rejects, the trigger field rolls back to its previous value in both the internal model and `$model`.

While a callback is in flight the control blocks further interactions with a full-size overlay (mouse clicks included). The `loading` prop only controls whether the spinning indicator is visible during that window — interaction blocking applies in all modes. Keyboard input on an already-open popup is not covered by the overlay.

`onPageChanged` fires after `onPageNumberChange` / `onPageSizeChange` has resolved and the (possibly mutated) snapshot has been written back to `$model`, once per successful interaction. Unlike the other two callbacks its rejection does not roll anything back — the change stays applied and the error is logged to the console. Use it for follow-up work that should not veto the change, such as refreshing a table body bound to the same pagination model (`HxTable` wires its body refresh through this callback).

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
import { readPaginationData } from '@hx/components';

// Reads $model.$field (with the optional `read` mapper) and normalizes it
readPaginationData({ $model, $field: 'pagination', allowedPageSizes: [20] }, context);
// => { pageSize: 20, pageNumber: 1, totalPages: 1, totalItems: ... }
```

## Global Config

```ts
import { configHxPagination } from '@hx/components';
configHxPagination({ allowedPageSizes: [20], showPageSize: false, gapX: 'xs' });
```
