# HxCheckbox / HxWithCheckCheckbox

绑定到模型字段的单选框。值通过可配置的值对进行匹配。

`HxWithCheckCheckbox` 添加验证功能（参见 [WithCheck](./cn-hx-components-WithCheck)）。

```tsx
// 布尔开关（选中=true，未选中=false）
<HxCheckbox $model={form} $field="agreed" text="我同意条款" />

// 自定义值对
<HxCheckbox $model={form} $field="status" values={['active', 'inactive']} text="启用" />

// 第 3 个元素为自定义判断函数
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
| `values` | `[checkedVal, uncheckedVal, checkFn?]` | `[true, false]` | 第 1 个值 = 选中，第 2 个 = 未选中。可选的第 3 个元素 `(modelValue) => boolean` 仅在模型值既不等于第 1 个也不等于第 2 个值时调用 |
| `text` | `ReactNode` | — | 复选框旁的标签文本 |
| `enterToSwitchValue` | `boolean` | `false` | Enter 键切换值 |
| `spaceToSwitchValue` | `boolean` | `true` | Space 键切换值 |

## 渲染与事件

控件渲染的是 ARIA `<span role="checkbox">`，不是原生 `<input>`；切换只调用 `ERO.setValue` 并重渲染。因此不会触发原生 `change` 事件——请通过 `$model` / `$field` 或根元素上的 `onClick` 响应。

`$disabled` 会阻止点击和键盘。`$visible` 通过 `HxEditSingleFieldProps` 可用。

**可用事件**：`onKeyDown`、`onKeyUp`、`onKeyPress`、`onFocus`、`onBlur`、`onClick`、`onMouseDown`、`onMouseUp`、`onMouseEnter`、`onMouseLeave`。

## 全局配置

```ts
import { configHxCheckbox } from '@hx/components';
configHxCheckbox({ spaceToSwitchValue: true });
```
