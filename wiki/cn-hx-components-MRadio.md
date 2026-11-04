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

// 异步选项——接收模型与上下文，不是搜索字符串
<HxMRadio
  $model={form}
  $field="category"
  options={async (model, context) => fetchCategories(model, context)}
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |
| `options` | `HxSelectOptions<T>` | — | 选项源（[参见 Common](./cn-hx-components-Common#select-options)） |
| `optionsDependsOn` | `HxDataPath \| HxDataPath[]` | — | 给定路径变化时重新加载选项 |
| `onOptionsChange` | `'none' \| 'clear' \| (options) => HxSelectOption \| undefined` | `'clear'` | 选项变化时如何处理当前值 |
| `direction` | `'dir-x' \| 'dir-y'` | `'dir-y'` | 布局方向 |
| `lanes` | `number` | — | 网格列数，1–10（用于 `dir-x` 布局，垂直布局时忽略） |
| `gapX` | 尺寸令牌 | — | 选项水平间距 |
| `gapY` | 尺寸令牌 | — | 选项垂直间距 |
| `enterToSwitchValue` | `boolean` | `false` | Enter 键切换 |
| `spaceToSwitchValue` | `boolean` | `true` | Space 键切换 |
| `$disabled` | `DisabledPropValue<T>` | — | 禁用整个组 |
| `optionsOnLoadKey` | `string` | `~HxCommon.SelectOptionsOnLoad` | 加载状态文本 |
| `noOptionsKey` | `string` | `~HxCommon.SelectNoOptions` | 空选项文本 |

`option.$disabled` 可禁用单个选项。选中比较使用严格 `===`。没有 `toModel` / `fromModel`，也没有组级 `allowUnchecked`——点击已选项不会清除它。

## 键盘导航

没有组级方向键导航。每个选项都是独立的 tab stop；Enter/Space 选择聚焦项。

## 渲染

每个选项渲染 ARIA `<span role="radio">`，不是原生 input。实际中很少需要单独监听事件——选中状态由 `$model`/`$field` 绑定管理。

## 全局配置

```ts
import { configHxMRadio } from '@hx/components';
configHxMRadio({ direction: 'dir-y' });
```

## 参见

- [HxMCheckbox](./cn-hx-components-MCheckbox) — 多选变体
- [HxRadio](./cn-hx-components-Radio) — 单个单选按钮
