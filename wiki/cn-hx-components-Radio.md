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
| `values` | `[checkedVal, uncheckedVal, checkFn?]` | `[true, false]` | 第 1 个值 = 选中，第 2 个 = 未选中。可选的第 3 个元素是 `(modelValue) => boolean` 函数，用于判断模型值是否算作已选中 |
| `allowUnchecked` | `boolean` | `false` | 允许点击已选中的按钮取消选择 |
| `text` | `ReactNode` | — | 单选按钮旁的标签文本 |
| `enterToSwitchValue` | `boolean` | `false` | Enter 键切换 |
| `spaceToSwitchValue` | `boolean` | `true` | Space 键切换 |

## 原生 DOM 事件

同 [HxCheckbox](./cn-hx-components-Checkbox)：`$model`/`$field` 绑定通常足够，无需手动监听。如需额外副作用可用 `onChange`。

## 全局配置

```ts
import { configHxRadio } from '@hx/components';
configHxRadio({ spaceToSwitchValue: true, allowUnchecked: false });
```
