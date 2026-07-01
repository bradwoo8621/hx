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
| `onPageNumberChange` | `(pageNumber: number) => void` | — | 页码变更回调 |
| `onPageSizeChange` | `(pageSize: number) => void` | — | 每页条数变更回调 |

## 内部模型（`HxPaginationData`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `pageSize` | `number` | 每页条数 |
| `pageNumber` | `number` | 当前页码（从 1 开始） |
| `totalPages` | `number` | 总页数 |
| `totalItems` | `number` | 总条目数 |

## 工具函数

```ts
import { computePaginationData } from '@hx/components';

computePaginationData(150, 20, 1);
// => { pageSize: 20, pageNumber: 1, totalPages: 8, totalItems: 150 }
```

## 全局配置

```ts
import { configHxPagination } from '@hx/components';
configHxPagination({ allowedPageSizes: [20], showPageSize: false });
```
