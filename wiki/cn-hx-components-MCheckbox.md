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

// 异步选项带搜索
<HxMCheckbox
  $model={form}
  $field="tags"
  options={async (search) => fetchTags(search)}
/>

// 自定义间距
<HxMCheckbox $model={form} $field="opts" options={opts} gapX="md" gapY="sm" />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径（保存选中值的数组） |
| `options` | `HxSelectOptions<T>` | — | 选项源——静态数组、可迭代对象或异步函数（[参见 Common](./cn-hx-components-Common#select-options)） |
| `maxChecked` | `number` | — | 最大同时选中数量 |
| `direction` | `'dir-x' \| 'dir-y'` | `'dir-y'` | 布局方向 |
| `lanes` | `number` | — | 网格列数（用于 `dir-x` 布局） |
| `gapX` | 尺寸令牌 | — | 选项水平间距 |
| `gapY` | 尺寸令牌 | — | 选项垂直间距 |
| `enterToSwitchValue` | `boolean` | `false` | Enter 键切换值 |
| `spaceToSwitchValue` | `boolean` | `true` | Space 键切换值 |

## 键盘导航

方向键在组级别选项间导航。Enter/Space 切换聚焦的选项。

## 原生 DOM 事件

每个选项渲染为标准复选框输入。焦点和键盘在组级别管理。实际中很少需要单独监听事件——选中状态由 `$model`/`$field` 绑定管理。

## 全局配置

```ts
import { configHxMCheckbox } from '@hx/components';
configHxMCheckbox({ direction: 'dir-y' });
```

## 参见

- [HxMRadio](./cn-hx-components-MRadio) — 单选变体
- [HxSelectOptions](./cn-hx-components-Common#select-options) — 选项类型参考
