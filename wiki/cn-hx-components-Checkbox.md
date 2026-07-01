# HxCheckbox / HxWithCheckCheckbox

绑定到模型字段的单选框。值通过可配置的值对进行匹配。

`HxWithCheckCheckbox` 添加验证功能（参见 [WithCheck](./cn-hx-components-WithCheck)）。

```tsx
// 布尔开关（选中=true，未选中=false）
<HxCheckbox $model={form} $field="agreed" text="我同意条款" />

// 自定义值对
<HxCheckbox $model={form} $field="status" values={['active', 'inactive']} text="启用" />

// 三态——第 3 个元素为自定义判断函数
<HxCheckbox
  $model={form}
  $field="selectAll"
  values={[true, false, (modelValue) => isPartialSelection(modelValue)]}
  text="全选"
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |
| `values` | `[checkedVal, uncheckedVal, checkFn?]` | `[true, false]` | 第 1 个值 = 选中，第 2 个 = 未选中。可选的第 3 个元素是 `(modelValue) => boolean \| 'indeterminate'` 函数 |
| `text` | `ReactNode` | — | 复选框旁的标签文本 |
| `enterToSwitchValue` | `boolean` | `false` | Enter 键切换值 |
| `spaceToSwitchValue` | `boolean` | `true` | Space 键切换值 |

### 三态复选框

当 `values` 为 3 元素元组时，第 3 个元素决定视觉状态：

```tsx
values={[
  true,                              // 选中值
  false,                             // 未选中值
  (v) => Array.isArray(v) && v.length > 0 && v.length < total
    ? 'indeterminate'                // 部分选中返回 'indeterminate'
    : v.length === total,            // 全选/全不选返回布尔值
]}
```

## 原生 DOM 事件

`onChange`、`onKeyDown`、`onKeyUp`、`onKeyPress`、`onFocus`、`onBlur`、`onClick`、`onMouseDown/Up/Enter/Leave`。

## 全局配置

```ts
import { configHxCheckbox } from '@hx/components';
configHxCheckbox({ spaceToSwitchValue: true });
```
