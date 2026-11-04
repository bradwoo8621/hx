# HxMCheckbox

多选复选框组。根据选项源渲染复选框列表。

```tsx
const options = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'rs', label: 'Rust' },
];

// 垂直布局（默认）
<HxMCheckbox $model={form} $field="skills" options={options} />

// 水平布局，3 列
<HxMCheckbox $model={form} $field="items" options={opts} direction="dir-x" lanes={3} />

// 限制最大选择数
<HxMCheckbox $model={form} $field="top3" options={opts} maxChecked={3} />

// 异步选项——接收模型与上下文，不是搜索字符串
<HxMCheckbox
  $model={form}
  $field="tags"
  options={async (model, context) => fetchTags(model, context)}
/>

// 自定义间距
<HxMCheckbox $model={form} $field="opts" options={opts} gapX="md" gapY="sm" />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径（保存选中值的数组） |
| `options` | `HxSelectOptions<T>` | — | 选项源——静态数组，或返回数组/Promise 的函数（[参见 Common](./cn-hx-components-Common#select-options)） |
| `optionsDependsOn` | `HxDataPath \| HxDataPath[]` | — | 给定路径变化时重新加载选项 |
| `onOptionsChange` | `'none' \| 'clear' \| (options) => HxSelectOption \| undefined` | `'clear'` | 选项变化时如何处理当前值 |
| `toModel` | `(value, context) => any` | — | 将选中的显示值数组转换为模型值 |
| `fromModel` | `(value, context) => Array<any>` | — | 将模型值转换为选中的显示值数组 |
| `maxChecked` | `number` | — | 最大同时选中数量。达到上限后未选项变为禁用，已选项仍可用 |
| `direction` | `'dir-x' \| 'dir-y'` | `'dir-y'` | 布局方向 |
| `lanes` | `number` | — | 网格列数，1–10（用于 `dir-x` 布局，垂直布局时忽略） |
| `gapX` | 尺寸令牌 | — | 选项水平间距 |
| `gapY` | 尺寸令牌 | — | 选项垂直间距 |
| `enterToSwitchValue` | `boolean` | `false` | Enter 键切换值 |
| `spaceToSwitchValue` | `boolean` | `true` | Space 键切换值 |
| `$disabled` | `DisabledPropValue<T>` | — | 禁用整个组 |
| `optionsOnLoadKey` | `string` | `~HxCommon.SelectOptionsOnLoad` | 加载状态文本 |
| `noOptionsKey` | `string` | `~HxCommon.SelectNoOptions` | 空选项文本 |

`option.$disabled` 可禁用单个选项。空选择写入 `(void 0)`，选中比较使用宽松 `==`。

## 键盘导航

没有组级方向键导航。每个选项都是独立的 tab stop；Enter/Space 切换聚焦项。

## 渲染

每个选项渲染 ARIA `<span role="checkbox">`，不是原生 input。实际中很少需要单独监听事件——选中状态由 `$model`/`$field` 绑定管理。

## 全局配置

```ts
import { configHxMCheckbox } from '@hx/components';
configHxMCheckbox({ direction: 'dir-y' });
```

## 参见

- [HxMRadio](./cn-hx-components-MRadio) — 单选变体
- [HxSelectOptions](./cn-hx-components-Common#select-options) — 选项类型参考
