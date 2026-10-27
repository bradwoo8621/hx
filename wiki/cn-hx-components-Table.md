# HxTable

支持多行表头、单元格合并、嵌套行、分组行与可选行号列的数据表格。渲染为 `<div>`,使用 CSS Grid 布局。

```tsx
// 基础表格:每个单元格绑定行模型的字段
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
        {title: '姓名'},
        {title: '部门'}
    ]}
    columns={[
        {content: <HxLabel $field="id"/>},
        {content: <HxLabel $field="name"/>},
        {content: <HxLabel $field="department"/>}
    ]}/>
```

```tsx
// 多行表头与合并单元格
<HxTable
    $model={model}
    $field="employees"
    headers={[
        {title: 'ID', rows: 2, width: 64},
        {title: '个人信息', cols: 3, tipTitle: 'Person', tipContent: '分组展示的个人信息'},
        {title: '成绩', rows: 2, width: 100},
        {title: '姓名', row: 2},
        {title: '年龄', row: 2},
        {title: '部门', row: 2}
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
// 带行号列
<HxTable rowIndex rowIndexMinWidth={48} headers={headers} columns={columns}/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `headers` | `HxTableHeaderCells` | — | 表头单元格;必须构成完整矩阵(见下文) |
| `columns` | `HxTableColumnCells \| HxTableColumnCellsFunc` | — | 列单元格,或按数据行返回单元格的函数 |
| `fixedStartColumns` | `number` | — | 水平滚动时固定在行首一侧的列数;`0` 视为关闭 |
| `fixedEndColumns` | `number` | — | 水平滚动时固定在行尾一侧的列数;`0` 视为关闭 |
| `rowIndex` | `boolean` | `false` | 显示行号列 |
| `rowIndexMinWidth` | `number` | `40` | 行号列最小宽度(px) |
| `rowIndexMaxWidth` | `number` | `48` | 行号列最大宽度(px);小于 `rowIndexMinWidth` 时忽略 |
| `border` | `boolean` | `true` | 显示边框 |
| `borderRadius` | `HxBoxBorderRadius` | `'md'` | 圆角 |
| `columnGridLines` | `boolean` | `false` | 在列之间显示列网格线 |
| `rowGridLines` | `boolean` | `false` | 在数据行之间显示行网格线(见[网格线](#网格线)) |
| `stripeRow` | `boolean` | `true` | 显示交替行背景 |
| `scrollHeight` | `number` | — | 表头与表体最大高度(px);内容超出时出现垂直滚动条,滚动时表头固定不动 |
| `renderAsForm` | `boolean` | `false` | 接受单个对象作为一行,模拟表单渲染;常与 `ignoreHeaders` 配合;数据为空数组时不渲染任何内容(也不显示无数据行) |
| `nestedRow` | `boolean` | `false` | 表格是否包含嵌套单元格;当 `columns` 函数返回的单元格包含嵌套单元格时必须设为 `true`(静态 `columns` 数组会自动检测) |
| `nestedRowOperatorWidth` | `number` | `32` | 展开/收起操作列不与行号列共享时的列宽(px) |
| `nestedRowHover` | `boolean` | `false` | 嵌套行是否有自己的悬停高亮。为 `true` 时(配合 `nestedRowIndependentHover`):悬停嵌套单元格会连同操作单元格一起高亮;为 `true` 且不独立时:嵌套单元格加入标准行高亮;为 `false` 时:悬停嵌套单元格改为高亮标准单元格 |
| `nestedRowIndependentHover` | `boolean` | `true` | 嵌套行悬停是否与标准单元格互相独立(双向);分组单元格始终独立高亮 |
| `ignoreHeaders` | `boolean` | `false` | 跳过表头渲染(网格第一行为数据行) |
| `noDataKey` | `ReactNode` | `'~HxCommon.NoDataTableRow'` | 无数据行的文本或 i18n key |
| `pagination` | `HxTablePaginationProps<PT>` | — | 在表脚渲染分页条([见下文](#分页排序与筛选)) |
| `sort` | `HxTableSortProps` | — | 启用排序:可排序列及其初始方向([见下文](#分页排序与筛选)) |
| `filter` | `HxTableFilterProps` | — | 启用筛选:筛选列、全局模糊匹配与关键字拆分([见下文](#分页排序与筛选)) |
| `onCriteriaChanged` | `HxTableOnCriteriaChanged<T>` | — | 分页/排序/筛选的变更处理器,三者生效的前提 —— resolve 接受变更,reject 回滚([见下文](#分页排序与筛选)) |
| `renderPrepare` | `HxTableDataRenderPreparer<T>` | — | 依据模型与当前 criteria 推导要渲染的行([见下文](#分页排序与筛选)) |
| `$model` | `HxObject<T>` | — | 响应式数据模型(自动传递给子组件) |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 数据模型字段路径 |

## HxTableHeaderCell

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | `ReactNode` | 表头标题 |
| `tipTitle` | `ReactNode` | 提示标题 |
| `tipContent` | `ReactNode` | 提示内容 |
| `minWidth` | `string \| number` | 最小列宽;数字按 px 处理,字符串按 CSS 长度使用 |
| `width` | `string \| number` | 默认列宽;数字按 px 处理;含 CSS 函数调用(`minmax()`、`fit-content()`、`calc()` 等)、以 `fr` 结尾或含 `auto` 的字符串按轨道尺寸原样使用,其余字符串作为 `minmax(<width>, auto)` 轨道的最小值 |
| `maxWidth` | `string \| number` | 最大列宽;数字按 px 处理,字符串按 CSS 长度使用 |
| `row` | `number` | 行号(从 1 开始);非首行单元格必须指定 |
| `col` | `number` | 列号(从 1 开始);默认按声明顺序 |
| `rows` | `number` | 合并行数,只有 >= 2 时需要指定 |
| `cols` | `number` | 合并列数,只有 >= 2 时需要指定 |

表头必须构成完整矩阵:每个单元格位置都已被表头或合并单元格占据。重叠的表头会被忽略,并在控制台输出错误日志。

## HxTableColumnCell

`columns` 的每个元素(或 `columns` 函数返回的元素)描述每条数据行的表体单元格:`content`(渲染时注入当前行模型)、`indent`(内联方向内边距),以及与表头单元格相同的合并字段:`row`、`col`、`rows`、`cols`。列数必须与表头列数一致,合并范围不能超出表头矩阵。

## 嵌套行与分组行

当 `columns` 是函数时,返回的单元格可以在特定数据行下方追加额外行。静态 `columns` 数组做不到这一点——分组单元格通常只用于部分数据行,而非全部。

### 嵌套单元格

在返回数组末尾追加一个 `nested: true` 的元素(类型 `HxTableNestedCell`),即可在每条数据行下增加一行可展开的嵌套行。嵌套单元格横跨除第一列(展开/收起操作单元格)外的所有列:

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

- 展开/收起操作符(+/−)在开启 `rowIndex` 时与行号列共享;否则会插入一个宽度为 `nestedRowOperatorWidth` px 的操作列作为第一列。
- 操作符与行号列共享时,悬停会以操作图标替换行号;其余时间显示行号。
- 嵌套行收起时高度为零,展开后撑满所在行。当表格含嵌套单元格且未开启 `rowIndex` 时,必须将 `nestedRow` 设为 `true`(开启 `rowIndex` 或使用静态 `columns` 数组时会自动检测)。

### 分组单元格

在返回的单元格末尾再追加一个数组,即可在标准行下方增加一行分组行。数组中包含标准分组单元格(普通 `HxTableColumnCell`,遵循表格列网格,包括行号/操作列)以及可选的整行分组单元格:

- **标准分组单元格**——即普通 `HxTableColumnCell`;与普通行一样放置在列网格上,支持 `cols` / `rows` 合并与 `content`。
- **整行分组单元格**——以 `fullLine: true` 声明(类型 `HxTableGroupFullLineCell`);自动占据所有列,忽略 `col` / `cols`,且始终粘附在行首一侧(宽度被设置为整表宽度,水平滚动时保持完整)。
- 当分组单元格跨越多行(`rows >= 2` 或多个整行单元格堆叠)时,不在首行开始的单元格必须设置 `row`(从 1 开始计数,**在分组单元格内重新从 1 计数**,与标准单元格占据的行数无关)。
- 标准单元格与整行单元格可以混用:标准单元格构成分组行的第一行,此后每个整行单元格各占据一整行。
- 分组单元格追加在嵌套单元格之后(两者同时存在时);分组行只作用于产生它的那条数据行。

```tsx
// "columns" 函数在低分/高分行下方追加分组行
const columns = (_$model, _array, _row, rowIndex) => {
    const score = scores[rowIndex];
    if (score < 80) {
        // 标准分组单元格,遵循列网格
        return [...stdCells, [
            {content: '备注', cols: 2},
            {content: `低分(${score}),需要关注`, cols: 4}
        ]];
    }
    if (score >= 90) {
        // 整行分组单元格,占据所有列
        return [...stdCells, [
            {fullLine: true, content: `优秀分数(${score})`}
        ]];
    }
    return stdCells;
};
```

## 垂直滚动

设置 `scrollHeight` 后,表格内容(表头与表体)的高度上限即为该值(px);内容超出时出现垂直滚动条。滚动时表头保持可见:表头单元格会粘附在滚动容器顶部(支持多行表头,每一行表头单元格各自保持自己的粘附偏移)。当列总宽超出表格宽度时,内容还能横向溢出滚动,表头随之一起水平滚动。开启 `rowIndex` 时,行号列在水平滚动时粘附在行首一侧(其表头单元格覆盖在普通表头单元格之上,普通表头又覆盖在表体单元格之上)。`fixedStartColumns` / `fixedEndColumns` 以同样方式将前 N 列 / 后 N 列固定在行首 / 行尾一侧(按网格列测量,多行表头与合并单元格同样适用);最后一个固定列的分界线使用更深的 `--hx-border-color-fix` 边框颜色,与普通网格线区分。无数据行横跨所有列,同样粘附在行首一侧,滚动时保持完整的悬停区域。

## 网格线

`columnGridLines` 与 `rowGridLines` 在网格的内部边界上绘制细线边框:

- **列网格线**:在列之间绘制;最后一列的外侧边缘不绘制线条。
- **行网格线**(`rowGridLines`):在数据行之间绘制。最后一条数据行的下边缘不绘制线条——该边界本就是表格自身的下边缘,在此再画一条行网格线会造成重复。
- **未到达行模板块末端的单元格**(纵向合并单元格比相邻单元格跨越更多网格行)始终渲染自己的底边。这是单元格自身的边界而非网格线,不受任何开关控制;即使在最后一条数据行内也保持可见——其下边缘位于纵向合并区内部,并非表格的下边缘。

## 分页、排序与筛选

分页、排序与筛选构成同一条 **criteria 管道**:三个 props 声明它们,两个函数驱动它们。

- `pagination` / `sort` / `filter` —— 声明表脚分页条、可排序列与筛选列,并给出初始 criteria(分页值读自分页模型,排序方向取各列 `default`,筛选值取各列 `defaultValue`)。
- `onCriteriaChanged` —— 变更处理器。**必填**:缺省时 `pagination` / `sort` / `filter` 会被丢弃,三者均不渲染。
- `renderPrepare` —— 依据模型与当前 criteria 推导要渲染的行。

### criteria 管道

每次交互(每页条数、页码、排序、筛选)产生一份 criteria 快照 `HxTableDataCriteria` —— 变更部分加上此前累积的全部内容:

```tsx
interface HxTableDataCriteria {
    type: 'page-size-change' | 'page-number-change' | 'sort-change' | 'filter-change';
    pagination?: HxPaginationData;   // { pageNumber, pageSize, totalPages, totalItems }
    sort?: HxTableSortCriteria;      // [{ key, method: 'asc' | 'desc' }]
    filter?: HxTableFilterCriteria;  // [{ key, method?, value? }]
}
```

快照会传给 `onCriteriaChanged($model, data, context)`:

- **快照可变** —— 处理器内的调整(如每页条数变化后重算 `totalPages`)会被保留并写回分页模型。
- **resolve** 表示接受:criteria 更新,表体随之重渲染。
- **reject** 表示中止:交互回滚,维持原 criteria。

渲染时,表体以当前 criteria 执行 `renderPrepare($model, data, context)`,再按分页模型值对返回的行切片 —— 页码越界时回退到最后一页(25 条、第 5 页、每页 10 条 → 渲染最后 5 条)。

### 服务端 vs 客户端

表格并不知道数据来自哪里,差异只体现在 `onCriteriaChanged` 的写法:

**服务端** —— 模型中只有当前页。定义 `onCriteriaChanged` 拉取新数据写入模型,并在快照上修正 `totalItems` / `totalPages`。`renderPrepare` 留空:模型里就是本页数据,内置切片对单页数据是空操作。reject 则中止并保留上一页。

```tsx
const onCriteriaChanged: HxTableOnCriteriaChanged<Model> = async (_, data) => {
    const {pageNumber = 1, pageSize = 10} = data.pagination!;
    const {rows, total} = await fetchApi('/api/employees', {pageNumber, pageSize});
    model.employees = rows;
    data.pagination!.totalItems = total;
    data.pagination!.totalPages = Math.ceil(total / pageSize);
};
// renderPrepare 留空 —— promise 的 resolve/reject 即全部契约
```

**客户端** —— 模型持有全量数据。排序、筛选、页码变化不会改变数据集与总数,`onCriteriaChanged` 对它们只需 resolve。每页条数变化会**自动修正**:当内存中的行即全量数据(数组长度等于 `totalItems`)时,表格自行重算 `totalPages` 并调整 `pageNumber` —— 分页 props 上的 `keepPageNumberWhenSizeChange`(默认 `true`)保持页码(越界时钳到最后一页),`false` 则一律回到第 1 页。因此 `onCriteriaChanged` 通常只需 resolve。真正的工作在 `renderPrepare`:在内存全量数据上完成筛选与排序并返回命中的行 —— 表格再从结果中切出请求页。

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
    pagination={{ $field: 'pagination', allowedPageSizes: [5, 10] }}
    onCriteriaChanged={async () => {
        // resolve 即可 —— 每页条数变化后的 totals 会自动修正
    }}
    renderPrepare={(_, {filter, sort}) => {
        let rows = model.employees;
        // 在内存全量数据上先筛选、后排序
        return rows;
    }}/>
```

### 排序与筛选声明

- `sort`:`HxTableSortColumn[]` —— `{ key?, text, default?: 'asc' | 'desc' }`。`key` 用于在排序 criteria 中标识该列,缺省时取渲染的 `text`。
- `filter`:`HxTableFilterProps` —— `columns` 为 `{ key?, text, range?, defaultMethod?, defaultValue? }`;`fuzzy` 开启全局模糊匹配;`splitKeywords` 按空格(OR)与逗号(AND)拆分关键字,OR 优先级高于 AND。
- 筛选值:`range: true` 时两个值构成区间(`and` = 区间内,`or` = 区间外);`range: false` 时单值走 `match` / `unmatch` 比较,多值走 `and` / `or` 组合。

工具条中的排序/筛选 UI 尚在建设中;上述声明的初始 criteria 已进入上面的管道。

### 表脚分页条

`position` 控制分页条位于表脚起始(`'start'`)或末尾(`'end'`,默认);其余 props 透传给 `HxPagination`([参见 HxPagination](./cn-hx-components-Pagination)),但 `onPageNumberChange` / `onPageSizeChange` / `onPageChanged` 不被接受 —— 它们统一经由 `onCriteriaChanged` 处理。`keepPageNumberWhenSizeChange`(默认 `true`)控制客户端每页条数变化时页码的自动调整(见上文)。行号列跨页连续编号。客户端模式下,渲染前必须在分页模型中提供 `totalPages` / `totalItems`。表脚(无论是否分页)与表头、表体一样,在表格布局初始化完成后统一开始渲染。

## 行悬停高亮

鼠标悬停在任意表体单元格上时,其所属的整个数据行都会高亮(跨纵向合并单元格同样保持)。在同一行内的单元格之间移动时,高亮不会中断。

存在嵌套或分组单元格时,数据行拆分为三个悬停区域,各自独立高亮:

- **标准单元格**(含行号/操作单元格)始终作为一整行一起高亮。
- **分组单元格**始终独立悬停:悬停分组单元格只高亮该行的分组单元格,不会带亮上方的标准单元格或下方的嵌套单元格。
- **嵌套单元格**:由两个悬停 prop 控制。

  | `nestedRowIndependentHover` | `nestedRowHover` | 悬停标准行 | 悬停嵌套单元格 |
  |---|---|---|---|
  | `true`(默认) | `true` | 仅标准单元格 | 嵌套单元格 + 操作单元格 |
  | `true`(默认) | `false` | 仅标准单元格 | 标准单元格(与悬停标准行相同) |
  | `false` | `true` | 标准单元格 + 嵌套单元格 | 标准单元格 + 嵌套单元格(合为一个区域) |
  | `false` | `false` | 仅标准单元格 | 标准单元格(与悬停标准行相同) |

## 原生 DOM 事件

通过 `HxHtmlElementProps` 转发所有标准 `<div>` 事件。

## 全局配置

```ts
import { configHxTable } from '@hx/components';
configHxTable({ rowIndex: true, rowIndexMinWidth: 48, nestedRowOperatorWidth: 32, borderRadius: 'sm', paginationPosition: 'end' });
```
