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
| `border` | `boolean` | `true` | Show border |
| `borderRadius` | `HxBoxBorderRadius` | `'md'` | Border radius |
| `columnGridLines` | `boolean` | `false` | Show column grid lines between columns |
| `rowGridLines` | `boolean` | `false` | Show grid lines between data rows |
| `secondaryRowGridLines` | `boolean` | `false` | Show grid lines between rows spanned by a merged cell |
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
| `minWidth` | `number` | Min column width in px |
| `width` | `number` | Default column width in px |
| `maxWidth` | `number` | Max column width in px |
| `fixed` | `'start' \| 'end'` | Fix the column to the start or end |
| `row` | `number` | Row number (1-based); required for cells not in the first row |
| `col` | `number` | Column number (1-based); defaults to declaration order |
| `rows` | `number` | Number of rows the cell spans; only required when >= 2 |
| `cols` | `number` | Number of columns the cell spans; only required when >= 2 |

The header must form a complete matrix: every cell position must be claimed by a header or a span. Overlapping headers are ignored with an error logged to the console.

## HxTableColumnCell

Each item of `columns` (or returned by the `columns` function) describes one body cell per data row: `content` (rendered with the row model interposed), `indent` for inline padding, and the same merging fields as the header cell: `row`, `col`, `rows`, `cols`. Column count must match `headerColumnCount`; merged cells must stay within the header matrix.

## Native DOM Events

All standard `<div>` events forwarded via `HxHtmlElementProps`.

## Global Config

```ts
import { configHxTable } from '@hx/components';
configHxTable({ rowIndex: true, rowIndexMinWidth: 48, borderRadius: 'sm' });
```
