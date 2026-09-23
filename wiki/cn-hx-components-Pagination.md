# HxPagination

分页导航控件，带可选的每页条数选择器。

```tsx
// 带每页条数选择器
<HxPagination
  $model={form}
  $field="pagination"
  allowedPageSizes={[10, 20, 50]}
  showPageSize
  onPageNumberChange={(page) => fetchData(page)}
  onPageSizeChange={(size) => fetchData(1, size)}
/>

// 最简——仅页码导航
<HxPagination
  $model={form}
  $field="pagination"
  onPageNumberChange={(page) => loadPage(page)}
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
| `onPageNumberChange` | `(pageNumber: number) => Promise<void> \| void` | — | 页码变更异步回调；reject 时模型值回滚 |
| `onPageSizeChange` | `(pageSize: number) => Promise<void> \| void` | — | 每页条数变更异步回调；reject 时模型值回滚 |

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
import { computePaginationData } from '@hx/components';

computePaginationData(150, 20, 1);
// => { pageSize: 20, pageNumber: 1, totalPages: 8, totalItems: 150 }
```

## 全局配置

```ts
import { configHxPagination } from '@hx/components';
configHxPagination({ allowedPageSizes: [20], showPageSize: false, gapX: 'xs' });
```
