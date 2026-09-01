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
| `columns` | `HxTableColumns` | — | 列内容,顺序与表头列一致 |
| `rowIndex` | `boolean` | `false` | 显示行号列 |
| `rowIndexMinWidth` | `number` | `40` | 行号列最小宽度(px) |
| `border` | `boolean` | `true` | 显示边框 |
| `borderRadius` | `HxBoxBorderRadius` | `'md'` | 圆角 |
| `columnGridLines` | `boolean` | `false` | 显示列网格线(存在行/列合并时忽略) |
| `maxBodyHeight` | `number` | — | 表体最大高度(px) |
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

## 原生 DOM 事件

通过 `HxHtmlElementProps` 转发所有标准 `<div>` 事件。

## 全局配置

```ts
import { configHxTable } from '@hx/components';
configHxTable({ rowIndex: true, rowIndexMinWidth: 48, borderRadius: 'sm' });
```
