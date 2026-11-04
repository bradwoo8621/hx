# HxRadio / HxWithCheckRadio

绑定到模型字段的单选按钮。

`HxWithCheckRadio` 添加验证功能（参见 [WithCheck](./cn-hx-components-WithCheck)）。

```tsx
<HxRadio $model={form} $field="gender" values={['male', 'female']} text="男" />

// 允许点击已选中的按钮取消选择
<HxRadio
  $model={form} $field="option"
  values={['A', undefined]}
  allowUnchecked
  text="选项 A"
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |
| `values` | `[checkedVal, uncheckedVal, checkFn?]` | `[true, false]` | 第 1 个值 = 选中，第 2 个 = 未选中。可选的第 3 个元素 `(modelValue) => boolean` 仅在模型值既不等于第 1 个也不等于第 2 个值时调用 |
| `allowUnchecked` | `boolean` | `false` | 允许取消已选中的按钮；点击和键盘都生效 |
| `text` | `ReactNode` | — | 单选按钮旁的标签文本 |
| `enterToSwitchValue` | `boolean` | `false` | Enter 键切换 |
| `spaceToSwitchValue` | `boolean` | `true` | Space 键切换 |

## 渲染与事件

控件渲染的是 ARIA `<span role="radio">`，不是原生 `<input>`。切换只调用 `ERO.setValue` 并重渲染，因此不会触发原生 `change` 事件——请通过 `$model` / `$field` 或根元素上的 `onClick` 响应。

## 全局配置

```ts
import { configHxRadio } from '@hx/components';
configHxRadio({ spaceToSwitchValue: true, allowUnchecked: false });
```
