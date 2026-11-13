# HxTable

Data table with multi-row header support, cell merging, nested rows, group rows, and an optional row index column. Renders `<div>` with a CSS grid layout.

```tsx
// Basic table: each cell binds to a field of the row model
const model = ERO.reactive({
    employees: [
        {id: 'A001', name: 'Alice', department: 'Engineering'},
        {id: 'A002', name: 'Bob', department: 'Marketing'}
    ]
});

<HxTable
    $model={model}
    $field="employees"
    headers={[
        {title: 'ID', width: 64},
        {title: 'Name'},
        {title: 'Department'}
    ]}
    columns={[
        {content: <HxLabel $field="id"/>},
        {content: <HxLabel $field="name"/>},
        {content: <HxLabel $field="department"/>}
    ]}/>
```

```tsx
// Multi-row header with merged cells
<HxTable
    $model={model}
    $field="employees"
    headers={[
        {title: 'ID', rows: 2, width: 64},
        {title: 'Person', cols: 3},
        {title: 'Score', rows: 2, width: 100},
        {title: 'Name', row: 2},
        {title: 'Age', row: 2},
        {title: 'Department', row: 2}
    ]}
    columns={[
        {content: <HxLabel $field="id"/>},
        {content: <HxLabel $field="name"/>},
        {content: <HxLabel $field="age"/>},
        {content: <HxLabel $field="department"/>},
        {content: <HxLabel $field="score"/>}
    ]}/>
```

```tsx
// With row index column
<HxTable $model={model} $field="employees" rowIndex rowIndexMinWidth={48}
         headers={headers} columns={columns}/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `headers` | `HxTableHeaderCells` | — | Header cells; must form a complete matrix (see below) |
| `columns` | `HxTableColumnCells \| HxTableColumnCellsFunc` | — | Column cells, or a function returning them per data row |
| `fixedStartColumns` | `number` | — | Number of leading columns fixed (sticky) at the inline-start edge while scrolling horizontally; `0` is treated as off |
| `fixedEndColumns` | `number` | — | Number of trailing columns fixed (sticky) at the inline-end edge while scrolling horizontally; `0` is treated as off |
| `rowIndex` | `boolean` | `false` | Show a row index column |
| `rowIndexMinWidth` | `number` | `40` | Min width in px of the row index column |
| `rowIndexMaxWidth` | `number` | `48` | Max width in px of the row index column; ignored when smaller than `rowIndexMinWidth` |
| `border` | `boolean` | `true` | Show border |
| `borderRadius` | `HxBorderRadius` | `'md'` | Border radius |
| `columnGridLines` | `boolean` | `false` | Show column grid lines between columns |
| `rowGridLines` | `boolean` | `false` | Show row grid lines between data rows (see [Grid Lines](#grid-lines)) |
| `stripeRow` | `boolean` | `true` | Show alternating row background |
| `scrollHeight` | `number` | — | Max height of the header and body in px; a vertical scrollbar appears when the content exceeds it, and the header stays sticky at the top while scrolling |
| `renderAsForm` | `boolean` | `false` | Accept an object as a single row to simulate form rendering; often used with `ignoreHeaders`; when the data is an empty array, nothing is rendered (the no-data row is not shown either) |
| `nestedRow` | `boolean` | `false` | Whether the table may contain nested cells; must be set to `true` when a `columns` function returns cells containing a nested cell (static `columns` arrays are detected automatically) |
| `nestedRowOperatorWidth` | `number` | `32` | Width in px of the expand/collapse operator column when it does not share the row index column |
| `nestedRowHover` | `boolean` | `false` | Whether the nested row gets its own hover highlight. When `true` (with `nestedRowIndependentHover`): hovering the nested cell highlights it together with the operator cell; when `true` (without independence): the nested cell joins the standard row highlight; when `false`: hovering the nested cell highlights the standard cells instead |
| `nestedRowIndependentHover` | `boolean` | `true` | Whether the nested row hover works independently of the standard cells (both directions); group cells always hover independently |
| `ignoreHeaders` | `boolean` | `false` | Skip header rendering (the first grid row is a body row) |
| `noDataKey` | `ReactNode` | `'~HxCommon.TableNoData'` | Text or i18n key for the no-data row |
| `pagination` | `HxTablePaginationProps<PT>` | — | Render a footer pagination bar ([see below](#pagination-sort-and-filter)) |
| `sortColumns` | `HxTableSortColumns` | — | Sortable columns and their initial directions ([see below](#pagination-sort-and-filter)) |
| `filterColumns` | `HxTableFilterColumns` | — | Filter columns and their initial values ([see below](#pagination-sort-and-filter)) |
| `fuzzyFilter` | `HxTableFuzzyFilterMode` | `'none'` | Fuzzy filter trigger mode: `'none'` / `'enter'` / `'enter+blur'` / `'change'` ([see below](#pagination-sort-and-filter)) |
| `fuzzyPlaceholderKey` | `ReactNode` | `'~HxCommon.TableFuzzyPlaceholder'` | Text or i18n key for the fuzzy input placeholder ([see below](#pagination-sort-and-filter)) |
| `onCriteriaChanged` | `HxTableOnCriteriaChanged<T>` | — | Change handler for pagination/sort/filter; required to activate them — resolve accepts the change, reject rolls it back ([see below](#pagination-sort-and-filter)) |
| `renderPrepare` | `HxTableDataRenderPreparer<T>` | — | Derive the rows to render from the model and the current criteria ([see below](#pagination-sort-and-filter)) |
| `$model` | `HxObject<T>` | — | **Required.** Reactive model (auto-propagated to children) |
| `$field` | `ModelPath<T> \| HxDataPath` | — | **Required.** Model field path |

## HxTableHeaderCell

| Field | Type | Description |
|-------|------|-------------|
| `title` | `ReactNode` | Header title |
| `width` | `string \| number` | Column track width. A number produces `minmax(<n>px, auto)` (a minimum, so the column can grow); a string containing a CSS function call (`minmax()`, `fit-content()`, `calc()`, …), ending with `fr`, or containing `auto` is used as the track as-is; other strings become the minimum of a `minmax(<width>, auto)` track |
| `indent` | `HxPadding` | Inline padding for the cell |
| `row` | `number` | Row number (1-based); required for cells not in the first row |
| `col` | `number` | Column number (1-based); defaults to declaration order |
| `rows` | `number` | Number of rows the cell spans; only required when >= 2 |
| `cols` | `number` | Number of columns the cell spans; only required when >= 2 |

There are no `tipTitle` / `tipContent` fields; embed a tooltip in the `title` node if needed. `minWidth` and `maxWidth` are declared in the type but are **not applied** by the layout — only `width` controls sizing.

The header must form a matrix. Gaps are auto-filled with empty assist cells; overlapping cells are ignored with an error logged to the console.

## HxTableColumnCell

Each item of `columns` (or returned by the `columns` function) describes one body cell per data row: `content` (rendered with the row model interposed), `indent` for inline padding, and the same merging fields as the header cell: `row`, `col`, `rows`, `cols`. Column count must match `headerColumnCount`; merged cells must stay within the header matrix.

## Nested Rows and Group Rows

When `columns` is a function, the returned cells can append extra rows below a specific data row. This is invisible to a static `columns` array — group cells usually apply only to some rows, not all of them.

### Nested Cell

Appending one element with `nested: true` (type `HxTableNestedCell`) at the end of the returned array adds an expandable nested row under every data row. The nested cell spans all columns except the first (the expand/collapse operator cell):

```tsx
const columns: HxTableColumnCells = [
    {content: <HxLabel $field="id"/>},
    {content: <HxLabel $field="name"/>},
    {content: <HxLabel $field="department"/>},
    {
        nested: true,
        content: <HxLabel $field="detail"/>
    }
];
```

- The expand/collapse operator (+/−) shares the row index column when `rowIndex` is on; otherwise an operator column of `nestedRowOperatorWidth` px is inserted as the first column.
- When the operator shares the row index column, hovering it swaps the row number for the operator icon; the row number is shown otherwise.
- The nested row collapses to zero height; expanding it grows the row. When a table with nested cells has no `rowIndex` column, `nestedRow` must be set to `true` (with `rowIndex` on, or with a static `columns` array, it is detected automatically).

### Group Cells

Appending one more array at the end of the returned cells adds a group row below the standard row. The array contains standard group cells (plain `HxTableColumnCell`s, following the table column grid, including the row index / operator column) and optionally full-line group cells:

- **Standard group cell** — a plain `HxTableColumnCell`; placed on the column grid like an ordinary row, supports `cols` / `rows` merging and `content`.
- **Full-line group cell** — declared with `fullLine: true` (type `HxTableGroupFullLineCell`); grabs all columns automatically, ignores `col` / `cols`, and is always sticky to the inline-start edge (its width is set to the full table width so it stays intact while scrolling horizontally).
- When a group cell spans multiple rows (`rows >= 2` or several full-line cells stacked), cells starting in a row other than the first must set `row` (1-based, **restarting at 1 within the group cells**, regardless of how many rows the standard cells occupy).
- Standard cells and full-line cells can be mixed: standard cells shape the first group line, each full-line cell then takes a whole following line.
- Group cells are appended after the nested cell (when both exist), and a group row applies only to the data row that produced it.

```tsx
// "columns" function appending group rows under low/high-score rows
const columns: HxTableColumnCellsFunc = ($model, array, row, rowIndex) => {
    const score = row.score as number;
    const stdCells: HxTableColumnCells = [
        {content: <HxLabel $field="id"/>},
        {content: <HxLabel $field="name"/>},
        {content: <HxLabel $field="score"/>}
    ];
    if (score < 80) {
        // standard group cells following the column grid
        return [...stdCells, [
            {content: 'Remark', cols: 2},
            {content: `Low score (${score}), attention required`, cols: 4}
        ]];
    }
    if (score >= 90) {
        // full-line group cell grabbing all columns
        return [...stdCells, [
            {fullLine: true, content: `Excellent score (${score})`}
        ]];
    }
    return stdCells;
};
```

## Vertical Scroll

Setting `scrollHeight` caps the height of the table content (header and body) in px; when the content exceeds it, a vertical scrollbar appears. The header stays visible while scrolling: header cells stick to the top of the scroll container (each header row's cells keep their own sticky offset, supporting multi-row headers). Columns can also overflow horizontally when their total width exceeds the table width; the header scrolls along horizontally. When `rowIndex` is on, the row index column sticks to the inline-start edge while scrolling horizontally (its header cell overlaps the other sticky-top header cells, which stack above normal body cells). `fixedStartColumns` / `fixedEndColumns` keep the first/last N columns pinned at the inline-start / inline-end edges the same way (measured per grid column, so they work with multi-row headers and merged cells); the boundary of the last fixed column is drawn with the stronger `--hx-border-color-fix` border color to stand out from normal grid lines. The no-data row spans all columns and also sticks to the inline-start edge, keeping its hover area intact while scrolling.

## Grid Lines

`columnGridLines` and `rowGridLines` draw hairline borders on the grid's internal edges:

- **Column grid lines** run between columns; the outer edge of the last column keeps no line.
- **Row grid lines** (`rowGridLines`) run between data rows. No line is drawn at the bottom edge of the last data row — that boundary is already the table's own bottom edge, and a row grid line there would double it.
- A cell that does not reach the block end of its row template (a vertically merged cell spans more grid rows than its neighbors) always renders its own bottom border. This is the cell's own boundary, not a grid line, so no setting toggles it; it stays visible even inside the last data row because its bottom is the inside of a vertical span, not the table's bottom edge.

## Pagination, Sort and Filter

Pagination, sort and filter form a single **criteria pipeline**: the props declare them and two functions drive them.

- `pagination` / `sortColumns` / `filterColumns` — declare the footer bar, the sortable columns and the filter columns, together with their initial criteria (pagination values read from the pagination model, sort directions from each column's `defaultMethod`, filter values from each column's `defaultValue`).
- `fuzzyFilter` — fuzzy filter trigger mode: `'none'` renders no fuzzy input; `'enter'` commits on Enter only; `'enter+blur'` also commits on blur when the text changed (so the visible text always matches the applied criteria after leaving the field); `'change'` commits debounced while typing (client-side friendly, wasteful server-side). Enter presses are IME-safe (the Enter that confirms a composition does not commit) and debounced, so rapid presses collapse into one change.
- `fuzzyPlaceholderKey` — text or i18n key shown in the fuzzy input; also settable through `configHxTable`.
- `onCriteriaChanged` — the change handler. **Required for the UI**: without it the pagination bar and the toolbar are not rendered. The pagination prop still slices the body, and the initial `sortColumns` / `filterColumns` criteria still reach `renderPrepare`.
- `renderPrepare` — derives the rows to render from the model and the current criteria.

`pagination` / `sortColumns` / `filterColumns` / `fuzzyFilter` seed the pipeline on the first render; changing them on a later render is supported. The table reconciles the applied criteria: entries whose definitions remain are kept, entries whose definitions are gone (or whose filter type changed) are pruned, fuzzy/pagination are dropped when their declarations disappear, and pagination is seeded when it appears. When the applied criteria actually changed, a `'props-change'` criteria change fires through `onCriteriaChanged` and the toolbar and body repaint. Still keep the declarations static when possible — every change costs a data fetch, and inline re-created objects trigger the (cheap) reconciliation on each host re-render.

### The Criteria Pipeline

Each change (page size, page number, sort, filter, fuzzy, or a declaration-props change) produces a criteria snapshot `HxTableDataCriteria` — the changed part plus everything accumulated so far:

```tsx
interface HxTableDataCriteria {
    type: 'props-change' | 'page-size-change' | 'page-number-change' | 'sort-change' | 'filter-change' | 'clear-sort-and-filter' | 'fuzzy-change';
    pagination?: HxPaginationData;   // { pageNumber, pageSize, totalPages, totalItems }
    sort?: HxTableSortCriteria;      // [{ key, method: 'asc' | 'desc' }]
    filter?: HxTableFilterCriteria;  // [{ key, method?, value? }]
}
```

The snapshot is passed to `onCriteriaChanged($model, data, context)`:

- **The snapshot is mutable** — adjustments made in the handler (e.g. recomputing `totalPages` after a fetch) are kept in the applied criteria.
- **Resolve** to accept: the criteria update and the table body re-renders with them.
- **Reject** to abort: the interaction is rolled back and the previous criteria stay.

On rendering, the body runs `renderPrepare($model, data, context)` with the current criteria and then slices the returned rows by the pagination model values — an out-of-range page number falls back to the last page (25 items, page 5, size 10 → the last 5 items).

### onCriteriaChanged

The change handler, fired for **every** criteria change — page size, page number, sort, filter, fuzzy and declaration-props changes (`type: 'props-change'`). Resolve accepts the change; reject aborts and rolls it back (a failed fetch keeps the previous page). The snapshot is mutable, and after the next body render the table diffs the criteria pagination against the pagination model and silently writes the differences back — so corrections you make on `data.pagination` (totals, corrected page number) end up on the footer bar with no extra work.

How you write it depends on where the data lives:

- **Server-side** (the model holds one page): fetch the new rows into the model, then fix the totals on the snapshot — and the page number when the requested page exceeds them.

```tsx
const onCriteriaChanged: HxTableOnCriteriaChanged<Model> = async (_, data) => {
    const {pageNumber = 1, pageSize = 10} = data.pagination!;
    const {rows, total} = await fetchApi('/api/employees', {pageNumber, pageSize});
    model.employees = rows;
    data.pagination!.totalItems = total;
    data.pagination!.totalPages = Math.ceil(total / pageSize);
    if (pageNumber > data.pagination!.totalPages) {
        data.pagination!.pageNumber = 1;
    }
};
// renderPrepare omitted — resolving the promise is the whole contract
```

- **Client-side** (the model holds everything): usually just resolve — sort, filter, fuzzy and page-number changes never change the data set, and page-size changes are fixed up automatically while `totalItems` still equals the whole data-set length (see the caveat under `renderPrepare`). The real work lives in `renderPrepare` (below).
- **Hybrid** (rows fetched from the server, fuzzy/filter/sort applied to the current page locally): resolve and let `renderPrepare` do the local work.

Notes: because the model holds only one page, server-side slicing clamps `pageNumber` to `1`, so the row index column restarts at `1` on every page — only client-side mode continues it across pages. A slow change may still be in flight when the user performs the next one; guard re-entrancy in your own handler if you care. A handler that never fixes the totals leaves the pagination bar on its previous values.

### renderPrepare

Derives the rows the body renders by applying filter, sort and pagination. It runs on **every body render** and receives the **live** criteria object — not a copy — which is what makes the pagination contract below work. The table additionally slices the returned rows by the pagination model values; an out-of-range page number falls back to the last page (25 items, page 5, size 10 → the last 5 items).

- **Server-side**: usually unset — the model already holds the rows to show; set it only for extra per-render processing over the fetched rows.
- **Client-side**: apply filter and sort over the whole in-memory data set, return the matching rows, and fix the filtered pagination (the contract below).

```tsx
const model = ERO.reactive({
    employees: [...],
    pagination: {pageNumber: 1, pageSize: 5, totalPages: 2, totalItems: 8}
});

<HxTable
    $model={model}
    $field="employees"
    headers={headers}
    columns={columns}
    rowIndex
    pagination={{ $model: model, $field: 'pagination', allowedPageSizes: [5, 10] }}
    onCriteriaChanged={async () => {
        // resolving is enough — the filtered totals are fixed in renderPrepare
    }}
    renderPrepare={(_, criteria) => {
        let rows = applyFilterAndSort(model.employees, criteria);
        if (criteria.pagination != null) {
            // fix the filtered pagination by MUTATING criteria.pagination in place
            criteria.pagination.totalItems = rows.length;
            criteria.pagination.totalPages = Math.max(1, Math.ceil(rows.length / (criteria.pagination.pageSize ?? 5)));
            criteria.pagination.pageNumber = Math.min(criteria.pagination.pageNumber ?? 1, criteria.pagination.totalPages);
        }
        return rows;
    }}/>
```

- **Hybrid**: fuzzy/filter/sort apply to the current page only; return the processed rows and leave `criteria.pagination` untouched.

The pagination-fixing contract: write the filtered totals and a range-valid page number by **mutating `criteria.pagination` in place** — never replace the object. After `renderPrepare` returns, the table compares the criteria pagination with the pagination model, silently writes back any difference except `pageSize` and repaints the footer bar — after a filter replaces the row set, the bar shows the corrected page and totals with no extra work. Keep the fix idempotent (`renderPrepare` runs on every render): clamp, never reset — an unconditional `pageNumber = 1` would swallow page navigation. And once the filtered totals live in the pagination model, the automatic page-size fix-up no longer matches (`totalItems` no longer equals the whole data-set length) — the clamp above already covers that path.

### Sort and Filter Declarations

- `sortColumns`: `HxTableSortColumns` (`HxTableSortColumn[]`) — `{ key, text, defaultMethod?: 'asc' | 'desc' }`. `key` identifies the column in the sort criteria; `defaultMethod` seeds the initial direction.
- `filterColumns`: `HxTableFilterColumns` (`HxTableFilterColumn[]`) — `{ key, text, type: 'words' | 'select' | 'm-select' | 'range', options?, defaultMethod?, defaultValue? }`. `type` selects the popup editor and the value shape: `words` — free text where spaces separate alternatives and commas combine them with and; `select` / `m-select` — pick from `options` (a missing `options` downgrades the column to `words`), single or multiple option values; `range` — two values defining an interval (`between` = within, `not-between` = outside); bounds are trimmed with blank meaning no value, and a range with both bounds blank is not applied. `defaultMethod` defaults to `match` (`between` for `range`); `defaultValue` seeds the initial criteria.
- `fuzzyFilter`: `HxTableFuzzyFilterMode`, default `'none'` — fuzzy filter trigger mode (`'none'` / `'enter'` / `'enter+blur'` / `'change'`, see the props row above for the semantics). It can also be set globally through `configHxTable`. Whatever the mode, the committed text is parsed with the words syntax (spaces = alternatives, commas = and) into `HxTableFuzzyCriteria` and drives the criteria pipeline like any other interaction.

### Footer Bar

`position` places the pagination bar at the start (`'start'`) or the end (`'end'`, default) of the footer; the remaining props are forwarded to `HxPagination` ([see HxPagination](./hx-components-Pagination)), except `onPageNumberChange` / `onPageSizeChange` / `onPageChanged` — they are not accepted here and are routed through `onCriteriaChanged` instead. `keepPageNumberWhenSizeChange` (default `true`) controls the automatic page-number adjustment on a client-side page size change — `true` keeps the current page (clamped to the last page when it goes out of range), `false` always returns to page 1; the adjustment applies while `totalItems` still equals the whole data-set length (see the caveat under `renderPrepare`). In client-side mode the row index column continues across pages; in server-side mode it restarts at `1` per page. In client-side mode, `totalPages` / `totalItems` must be present in the pagination model before rendering. The footer (with or without pagination) renders only after the table layout is initialized, together with the header and body.

## Row Hover

Hovering any body cell highlights the whole data row it belongs to (a row keeps its hover background even across vertically merged cells). The row under the pointer also stays highlighted when moving between its own cells.

When nested or group cells exist, the row splits into three hover zones, each highlightable on its own:

- **Standard cells** (including the row index / operator cell) always highlight together as one row.
- **Group cells** always hover independently: hovering a group cell highlights only the group cells of that row, never the standard cells above or the nested cell below.
- **Nested cell**: controlled by the two hover props.

  | `nestedRowIndependentHover` | `nestedRowHover` | Hovering the standard row | Hovering the nested cell |
  |---|---|---|---|
  | `true` (default) | `true` | Standard cells only | Nested cell + operator cell |
  | `true` (default) | `false` | Standard cells only | Standard cells (same as hovering the standard row) |
  | `false` | `true` | Standard cells + nested cell | Standard cells + nested cell (one whole zone) |
  | `false` | `false` | Standard cells only | Standard cells (same as hovering the standard row) |

## Additional Behaviour

- `fixedStartColumns` counts the row index column as grid column 1.
- `renderAsForm` disables row hover.
- `pagination` forwards every `HxPaginationProps` except the three change callbacks: `$model` (defaults to the table model), `$field`, `read`, `write`, `allowedPageSizes` (default `[20]`), `showPageSize`, `loading`, and the i18n keys.
- `configHxTable` also accepts `headerCellIndent` / `bodyCellIndent` (default `'sm'`).
- The barrel exports `HxTable`, `HxTableType`, `configHxTable`, `HxTableSettings`, and every type in `table/types.ts` (including `HxTableSortColumn`, `HxTableFilterColumn`, `HxTableRtColumnCells`, `HxTableDataRenderPreparer`, `HxTablePaginationPosition`). `HxTableBody`, `HxTableToolbar`, `HxTableFooter`, and the other internal components are not exported.

## Native DOM Events

All standard `<div>` events forwarded via `HxHtmlElementProps`.

## Global Config

```ts
import { configHxTable } from '@hx/components';
configHxTable({ rowIndex: true, rowIndexMinWidth: 48, nestedRowOperatorWidth: 32, borderRadius: 'sm', paginationPosition: 'end' });
```
