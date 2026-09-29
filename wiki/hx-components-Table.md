# HxTable

Data table with multi-row header support, cell merging, and an optional row index column. Renders `<div>` with a CSS grid layout.

```tsx
// Basic table
<HxTable
    headers={[
        {title: 'ID', width: 64},
        {title: 'Name'},
        {title: 'Department'}
    ]}
    columns={[
        {content: 'A001'},
        {content: 'Alice'},
        {content: 'Engineering'}
    ]}/>
```

```tsx
// Multi-row header with merged cells
<HxTable
    headers={[
        {title: 'ID', rows: 2, width: 64},
        {title: 'Person', cols: 3, tipTitle: 'Person', tipContent: 'Grouped personal information'},
        {title: 'Score', rows: 2, width: 100},
        {title: 'Name', row: 2},
        {title: 'Age', row: 2},
        {title: 'Department', row: 2}
    ]}
    columns={[
        {content: 'A001'},
        {content: 'Alice'},
        {content: '28'},
        {content: 'Engineering'},
        {content: '92'}
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

## Vertical Scroll

Setting `scrollHeight` caps the height of the table content (header and body) in px; when the content exceeds it, a vertical scrollbar appears. The header stays visible while scrolling: header cells stick to the top of the scroll container (each header row's cells keep their own sticky offset, supporting multi-row headers). Columns can also overflow horizontally when their total width exceeds the table width; the header scrolls along horizontally. When `rowIndex` is on, the row index column sticks to the inline-start edge while scrolling horizontally (its header cell overlaps the other sticky-top header cells, which stack above normal body cells). The no-data row spans all columns and also sticks to the inline-start edge, keeping its hover area intact while scrolling.

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

## Native DOM Events

All standard `<div>` events forwarded via `HxHtmlElementProps`.

## Global Config

```ts
import { configHxTable } from '@hx/components';
configHxTable({ rowIndex: true, rowIndexMinWidth: 48, borderRadius: 'sm', paginationPosition: 'end' });
```
