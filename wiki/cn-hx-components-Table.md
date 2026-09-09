# HxTable

支持多行表头、单元格合并与可选行号列的数据表格。渲染为 `<div>`,使用 CSS Grid 布局。

```tsx
// 基础表格
<HxTable
    headers={[
        {title: 'ID', width: 64},
        {title: '姓名'},
        {title: '部门'}
    ]}
    columns={[
        {content: 'A001'},
        {content: 'Alice'},
        {content: 'Engineering'}
    ]}/>
```

```tsx
// 多行表头与合并单元格
<HxTable
    headers={[
        {title: 'ID', rows: 2, width: 64},
        {title: '个人信息', cols: 3, tipTitle: 'Person', tipContent: '分组展示的个人信息'},
        {title: '成绩', rows: 2, width: 100},
        {title: '姓名', row: 2},
        {title: '年龄', row: 2},
        {title: '部门', row: 2}
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
// 带行号列
<HxTable rowIndex rowIndexMinWidth={48} headers={headers} columns={columns}/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `headers` | `HxTableHeaderCells` | — | 表头单元格;必须构成完整矩阵(见下文) |
| `columns` | `HxTableColumnCells \| HxTableColumnCellsFunc` | — | 列单元格,或按数据行返回单元格的函数 |
| `rowIndex` | `boolean` | `false` | 显示行号列 |
| `rowIndexMinWidth` | `number` | `40` | 行号列最小宽度(px) |
| `border` | `boolean` | `true` | 显示边框 |
| `borderRadius` | `HxBoxBorderRadius` | `'md'` | 圆角 |
| `columnGridLines` | `boolean` | `false` | 在列之间显示列网格线 |
| `rowGridLines` | `boolean` | `false` | 在数据行之间显示行网格线 |
| `secondaryRowGridLines` | `boolean` | `false` | 在合并单元格覆盖的行之间显示次级行网格线 |
| `stripeRow` | `boolean` | `true` | 显示交替行背景 |
| `maxBodyHeight` | `number` | — | 表体最大高度(px) |
| `renderAsForm` | `boolean` | `false` | 接受单个对象作为一行,模拟表单渲染;常与 `ignoreHeaders` 配合 |
| `ignoreHeaders` | `boolean` | `false` | 跳过表头渲染(网格第一行为数据行) |
| `noDataKey` | `ReactNode` | `'~HxCommon.NoDataTableRow'` | 无数据行的文本或 i18n key |
| `$model` | `HxObject<T>` | — | 响应式数据模型(自动传递给子组件) |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 数据模型字段路径 |

## HxTableHeaderCell

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | `ReactNode` | 表头标题 |
| `tipTitle` | `ReactNode` | 提示标题 |
| `tipContent` | `ReactNode` | 提示内容 |
| `minWidth` | `number` | 最小列宽(px) |
| `width` | `number` | 默认列宽(px) |
| `maxWidth` | `number` | 最大列宽(px) |
| `fixed` | `'start' \| 'end'` | 将列固定在起始或末尾 |
| `row` | `number` | 行号(从 1 开始);非首行单元格必须指定 |
| `col` | `number` | 列号(从 1 开始);默认按声明顺序 |
| `rows` | `number` | 合并行数,只有 >= 2 时需要指定 |
| `cols` | `number` | 合并列数,只有 >= 2 时需要指定 |

表头必须构成完整矩阵:每个单元格位置都已被表头或合并单元格占据。重叠的表头会被忽略,并在控制台输出错误日志。

## HxTableColumnCell

`columns` 的每个元素(或 `columns` 函数返回的元素)描述每条数据行的表体单元格:`content`(渲染时注入当前行模型)、`indent`(内联方向内边距),以及与表头单元格相同的合并字段:`row`、`col`、`rows`、`cols`。列数必须与表头列数一致,合并范围不能超出表头矩阵。

## 原生 DOM 事件

通过 `HxHtmlElementProps` 转发所有标准 `<div>` 事件。

## 全局配置

```ts
import { configHxTable } from '@hx/components';
configHxTable({ rowIndex: true, rowIndexMinWidth: 48, borderRadius: 'sm' });
```
