# HxTextarea / HxWithCheckTextarea

多行文本输入。渲染 `<textarea>`。

`HxWithCheckTextarea` 添加验证功能（参见 [WithCheck](./cn-hx-components-WithCheck)）。

```tsx
// 固定行数
<HxTextarea $model={form} $field="desc" rows={8} placeholder="请输入描述" />

// 自动增高，上限 10 行
<HxTextarea $model={form} $field="notes" autoRows={10} />

// 字符计数
<HxTextarea $model={form} $field="bio" charLimit={500} />

// 可拖拽调整大小（dir-x 为水平，dir-y 为垂直）
<HxTextarea $model={form} $field="content" resize="dir-y" />

// 延迟更新
<HxTextarea $model={form} $field="summary" emitChangeOnBlur />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |
| `selectAll` | `boolean` | `true` | 获取焦点时全选文本 |
| `autoRows` | `boolean \| number` | — | 自动增高以适配内容。`true` 表示无上限，传入数字时表示最大行数 |
| `rows` | `number` | `5` | 初始可见行数（最小 2） |
| `resize` | `'none' \| 'dir-x' \| 'dir-y' \| 'both'` | `'none'` | 用户拖拽调整大小的行为；`dir-x` 为水平，`dir-y` 为垂直 |
| `placeholder` | `ReactNode` | — | 渲染在容器内的占位浮层，不是原生 `placeholder` 属性。值为空时在禁用与只读状态下同样显示 |
| `charLimit` | `number` | — | 在 textarea 旁显示 `<已输入> / <上限>` 计数器。仅展示，不会截断输入 |
| `emitChangeOnBlur` | `boolean` | `false` | 仅在失焦时更新模型 |
| `emitChangeDelay` | `number` | `150` | 防抖延迟（毫秒）。负值会被钳制为 0 |

## 原生 DOM 事件

**常用**：`onFocus`、`onBlur`、`onKeyDown`（如 Ctrl+Enter 提交）。

**可用但通常不需要**：`onChange`、`onInput`——值变更由 `$model`/`$field` 响应式绑定处理。

**可用**：`onBeforeInput`、`onKeyUp`、`onKeyPress`、`onClick`、`onMouseDown`、`onMouseUp`、`onMouseEnter`、`onMouseLeave`、`onCompositionStart`、`onCompositionEnd`、`onCompositionUpdate`（IME 事件内部处理）、`onTouchStart`、`onTouchEnd`、`onPointerDown`、`onPointerUp`。

**排除的原生属性**：`disabled`（使用 `$disabled`）、`value`、`placeholder`（使用组件 `placeholder` prop）、`readOnly`（使用 `$readonly`）、`rows`（使用组件 `rows` prop）、`cols`、`wrap`、`children`、`minLength`、`maxLength`、`required`、`color`。

其余所有标准 `<textarea>` 属性（包括 `autoFocus`、`spellCheck`）均透传。

## 全局配置

```ts
import { configHxTextarea } from '@hx/components';
configHxTextarea({ rows: 5, resize: 'none', selectAll: true });
```
