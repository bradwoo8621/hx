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
        {title: 'Person', cols: 3, tipTitle: 'Person', tipContent: 'Grouped personal information'},
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
<HxTable rowIndex rowIndexMinWidth={48} headers={headers} columns={columns}/>
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
| `borderRadius` | `HxBoxBorderRadius` | `'md'` | Border radius |
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
| `noDataKey` | `ReactNode` | `'~HxCommon.NoDataTableRow'` | Text or i18n key for the no-data row |
| `pagination` | `HxTablePaginationProps<PT>` | — | Render a footer pagination bar ([see below](#pagination)) |
| `$model` | `HxObject<T>` | — | Reactive model (auto-propagated to children) |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |

## HxTableHeaderCell

| Field | Type | Description |
|-------|------|-------------|
| `title` | `ReactNode` | Header title |
| `tipTitle` | `ReactNode` | Tooltip title |
| `tipContent` | `ReactNode` | Tooltip content |
| `minWidth` | `string \| number` | Min column width; a number is treated as px, a string is used as a CSS length |
| `width` | `string \| number` | Default column width; a number is treated as px; a string containing a CSS function call (`minmax()`, `fit-content()`, `calc()`, …), ending with `fr`, or containing `auto` is used as the track size as-is, other strings are used as the minimum of a `minmax(<width>, auto)` track |
| `maxWidth` | `string \| number` | Max column width; a number is treated as px, a string is used as a CSS length |
| `row` | `number` | Row number (1-based); required for cells not in the first row |
| `col` | `number` | Column number (1-based); defaults to declaration order |
| `rows` | `number` | Number of rows the cell spans; only required when >= 2 |
| `cols` | `number` | Number of columns the cell spans; only required when >= 2 |

The header must form a complete matrix: every cell position must be claimed by a header or a span. Overlapping headers are ignored with an error logged to the console.

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
const columns = (_$model, _array, _row, rowIndex) => {
    const score = scores[rowIndex];
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

## Pagination

Passing `pagination` renders an `HxPagination` bar in the table footer. The table slices rows client-side: the body shows `pageSize` rows starting at `(pageNumber - 1) * pageSize`, and the row index column continues across pages instead of restarting at 1.

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
    pagination={{ $field: 'pagination', allowedPageSizes: [5, 10] }}/>
```

`totalPages` / `totalItems` must be provided in the pagination model before rendering (update them from `onPageNumberChange` / `onPageSizeChange` when the data set changes). `position` places the bar at the start (`'start'`) or the end (`'end'`, default) of the footer; all other props are forwarded to `HxPagination` ([see HxPagination](./hx-components-Pagination)). The footer (with or without pagination) renders only after the table layout is initialized, together with the header and body.

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

## Native DOM Events

All standard `<div>` events forwarded via `HxHtmlElementProps`.

## Global Config

```ts
import { configHxTable } from '@hx/components';
configHxTable({ rowIndex: true, rowIndexMinWidth: 48, nestedRowOperatorWidth: 32, borderRadius: 'sm', paginationPosition: 'end' });
```
