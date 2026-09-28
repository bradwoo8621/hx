# HxPagination

分页导航控件，带可选的每页条数选择器。

```tsx
// 带每页条数选择器
<HxPagination
  $model={form}
  $field="pagination"
  allowedPageSizes={[10, 20, 50]}
  showPageSize
  onPageNumberChange={async () => await fetchData()}
  onPageSizeChange={async (_, data) => { data.pageNumber = 1; await fetchData(); }}
/>

// 最简——仅页码导航
<HxPagination
  $model={form}
  $field="pagination"
  onPageNumberChange={async () => await loadPage()}
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型（若不提供则创建内部模型） |
| `$field` | `ModelPath<T> \| HxDataPath` | — | `HxPaginationData` 的字段路径 |
| `allowedPageSizes` | `number[]` | `[20]` | 下拉选择器中的可选每页条数 |
| `showPageSize` | `boolean` | `false` | 显示每页条数选择器 |
| `gapX` | `HxGap` | `'xs'` | 控件之间的水平间距 |
| `read` | `($model, value, context) => Partial<HxPaginationData>` | — | 将非标准模型结构映射为分页数据 |
| `write` | `($model, data, context) => void` | — | 自定义写回（替换默认的模型写入） |
| `ofTotalPagesKey` | `ReactNode` | `'~HxCommon.OfTotalPages'` | 页码之后的文本或 i18n key，如 `1 / 5` 中的 `/` |
| `perPageKey` | `ReactNode` | `'~HxCommon.PerPage'` | 每页条数之后的文本或 i18n key，如 `/ Page` |
| `totalItemsKey1` | `ReactNode` | `'~HxCommon.TotalItems1'` | 总条数之前的文本或 i18n key，如 `Total` |
| `totalItemsKey2` | `ReactNode` | `'~HxCommon.TotalItems2'` | 总条数之后的文本或 i18n key，如 `Items` |
| `totalCommaKey` | `ReactNode` | `'~HxCommon.TotalComma'` | 总条数与每页条数之间的文本或 i18n key，如 `,` |
| `loading` | `'none' \| 'start' \| 'end'` | `'none'` | 变更回调执行期间在控件上显示旋转指示（`start` / `end` 位置） |
| `onPageNumberChange` | `($model, data, context) => Promise<void> \| void` | — | 页码变更异步回调；reject 时变更回滚 |
| `onPageSizeChange` | `($model, data, context) => Promise<void> \| void` | — | 每页条数变更异步回调；reject 时变更回滚 |

## 变更回调

`onPageNumberChange` / `onPageSizeChange` 的 `data` 参数是内部分页数据的**普通快照**。在回调内修改快照的 `totalPages` / `totalItems` 是反映服务端结果的受支持方式——变化的字段会自动写回 `$model` 并触发重绘。每页条数回调中还可以重置 `pageNumber`（如改完每页条数后跳回第 1 页）；修改触发本次变更的字段本身则不会生效。返回的 promise reject 时，触发字段在内部模型与 `$model` 中都回滚到之前的值。

回调执行期间，控件以全尺寸遮罩拦截后续交互（含鼠标点击）。`loading` prop 只控制该窗口期内旋转指示是否可见——交互拦截在所有模式下都生效。已打开弹层的键盘输入不受遮罩覆盖。

## 内部模型（`HxPaginationData`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `pageSize` | `number` | 每页条数 |
| `pageNumber` | `number` | 当前页码（从 1 开始） |
| `totalPages` | `number` | 总页数 |
| `totalItems` | `number` | 总条目数 |

> **不要在分页数据字段上挂 `ERO.on` 监听。**组件每次变更时会分多步同步内部页码状态与模型，字段监听器会在一次交互中收到多个事件、并观察到中间态值。分页变化请通过 `onPageNumberChange` / `onPageSizeChange` 处理——它们在模型写入后每次交互只触发一次，且 reject 会触发回滚到上一个值。

## 工具函数

```ts
import { readPaginationData } from '@hx/components';

// 读取 $model.$field（可选 `read` 映射）并归一化
readPaginationData({ $model, $field: 'pagination', allowedPageSizes: [20] }, context);
// => { pageSize: 20, pageNumber: 1, totalPages: 1, totalItems: ... }
```

## 全局配置

```ts
import { configHxPagination } from '@hx/components';
configHxPagination({ allowedPageSizes: [20], showPageSize: false, gapX: 'xs' });
```
