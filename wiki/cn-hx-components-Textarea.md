# HxTextarea / HxWithCheckTextarea

多行文本输入。渲染 `<textarea>`。

`HxWithCheckTextarea` 添加验证功能（参见 [WithCheck](./cn-hx-components-WithCheck)）。

```tsx
// 固定行数
<HxTextarea $model={form} $field="desc" rows={8} placeholder="请输入描述" />

// 自动增高
<HxTextarea $model={form} $field="notes" autoRows />

// 字符限制（显示计数器，阻止超限输入）
<HxTextarea $model={form} $field="bio" charLimit={500} />

// 可拖拽调整大小
<HxTextarea $model={form} $field="content" resize="vertical" />

// 延迟更新
<HxTextarea $model={form} $field="summary" emitChangeOnBlur />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |
| `selectAll` | `boolean` | `true` | 获取焦点时全选文本 |
| `autoRows` | `boolean` | — | 自动增高以适配内容 |
| `rows` | `number` | `5` | 初始可见行数 |
| `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | `'none'` | CSS resize 行为 |
| `placeholder` | `ReactNode` | — | 原生 `<textarea>` 占位文本 |
| `charLimit` | `number` | — | 最大字符数；显示计数器并阻止超限输入 |
| `emitChangeOnBlur` | `boolean` | `false` | 仅在失焦时更新模型 |
| `emitChangeDelay` | `number` | `150` | 防抖延迟（毫秒） |

## 原生 DOM 事件（`<textarea>` 上）

`onChange`、`onInput`、`onBeforeInput`、`onKeyDown`、`onKeyUp`、`onKeyPress`、`onFocus`、`onBlur`、`onClick`、`onMouseDown/Up/Enter/Leave`、`onCompositionStart/End/Update`、`onTouchStart/End`、`onPointerDown/Up`。

透传的原生属性：`autoFocus`、`maxLength`、`readOnly`、`spellCheck`、`wrap`。

## 全局配置

```ts
import { configHxTextarea } from '@hx/components';
configHxTextarea({ rows: 5, resize: 'none', selectAll: true });
```
