# HxMRadio

单选按钮组。根据选项源渲染单选按钮列表。

```tsx
const sizes = [
  { value: 's', label: '小号' },
  { value: 'm', label: '中号' },
  { value: 'l', label: '大号' },
];

// 垂直布局（默认）
<HxMRadio $model={form} $field="size" options={sizes} />

// 水平布局，3 列
<HxMRadio $model={form} $field="size" options={sizes} direction="dir-x" lanes={3} />

// 异步选项
<HxMRadio
  $model={form}
  $field="category"
  options={async (search) => fetchCategories(search)}
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |
| `options` | `HxSelectOptions<T>` | — | 选项源（[参见 Common](./cn-hx-components-Common#select-options)） |
| `direction` | `'dir-x' \| 'dir-y'` | `'dir-y'` | 布局方向 |
| `lanes` | `number` | — | 网格列数（用于 `dir-x` 布局） |
| `gapX` | 尺寸令牌 | — | 选项水平间距 |
| `gapY` | 尺寸令牌 | — | 选项垂直间距 |
| `enterToSwitchValue` | `boolean` | `false` | Enter 键切换 |
| `spaceToSwitchValue` | `boolean` | `true` | Space 键切换 |

## 键盘导航

与 `HxMCheckbox` 相同——方向键在选项间导航，Enter/Space 选择。

## 原生 DOM 事件

每个选项渲染为标准单选输入。焦点和键盘在组级别管理。实际中很少需要单独监听事件——选中状态由 `$model`/`$field` 绑定管理。

## 全局配置

```ts
import { configHxMRadio } from '@hx/components';
configHxMRadio({ direction: 'dir-y' });
```

## 参见

- [HxMCheckbox](./cn-hx-components-MCheckbox) — 多选变体
- [HxRadio](./cn-hx-components-Radio) — 单个单选按钮
