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
| `maxBodyHeight` | `number` | — | Max height of the body in px |
| `renderAsForm` | `boolean` | `false` | Accept an object as a single row to simulate form rendering; often used with `ignoreHeaders` |
| `ignoreHeaders` | `boolean` | `false` | Skip header rendering (the first grid row is a body row) |
| `noDataKey` | `ReactNode` | `'~HxCommon.NoDataTableRow'` | Text or i18n key for the no-data row |
| `$model` | `HxObject<T>` | — | Reactive model (auto-propagated to children) |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |

## HxTableHeaderCell

| Field | Type | Description |
|-------|------|-------------|
| `title` | `ReactNode` | Header title |
| `tipTitle` | `ReactNode` | Tooltip title |
| `tipContent` | `ReactNode` | Tooltip content |
| `minWidth` | `string \| number` | Min column width; a number is treated as px, a string is used as a CSS length |
| `width` | `string \| number` | Default column width; a number is treated as px, a string is used as a CSS length |
| `maxWidth` | `string \| number` | Max column width; a number is treated as px, a string is used as a CSS length |
| `row` | `number` | Row number (1-based); required for cells not in the first row |
| `col` | `number` | Column number (1-based); defaults to declaration order |
| `rows` | `number` | Number of rows the cell spans; only required when >= 2 |
| `cols` | `number` | Number of columns the cell spans; only required when >= 2 |

The header must form a complete matrix: every cell position must be claimed by a header or a span. Overlapping headers are ignored with an error logged to the console.

## HxTableColumnCell

Each item of `columns` (or returned by the `columns` function) describes one body cell per data row: `content` (rendered with the row model interposed), `indent` for inline padding, and the same merging fields as the header cell: `row`, `col`, `rows`, `cols`. Column count must match `headerColumnCount`; merged cells must stay within the header matrix.

## Grid Lines

`columnGridLines` and `rowGridLines` draw hairline borders on the grid's internal edges:

- **Column grid lines** run between columns; the outer edge of the last column keeps no line.
- **Row grid lines** (`rowGridLines`) run between data rows. No line is drawn at the bottom edge of the last data row — that boundary is already the table's own bottom edge, and a row grid line there would double it.
- A cell that does not reach the block end of its row template (a vertically merged cell spans more grid rows than its neighbors) always renders its own bottom border. This is the cell's own boundary, not a grid line, so no setting toggles it; it stays visible even inside the last data row because its bottom is the inside of a vertical span, not the table's bottom edge.

## Native DOM Events

All standard `<div>` events forwarded via `HxHtmlElementProps`.

## Global Config

```ts
import { configHxTable } from '@hx/components';
configHxTable({ rowIndex: true, rowIndexMinWidth: 48, borderRadius: 'sm' });
```
