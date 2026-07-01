# HxButton

渲染 `<button type="button">`。表单和对话框中的主要操作触发器。

```tsx
// 基本点击处理
<HxButton text="提交" onClick={() => submit()} />

// 变体
<HxButton text="删除" color="danger" variant="outline" onClick={remove} />
<HxButton text="取消" variant="ghost" onClick={close} />
<HxButton text="了解更多" variant="link" />

// 国际化（两种等价写法）
<HxButton text="~Common.Save" />
<HxButton text="Common.Save" valueUseI18N />

// 响应式禁用
<HxButton text="保存" $disabled={(m) => !m.dirty} />

// 模型绑定文本
<HxButton $model={form} $field="submitLabel" onClick={submit} />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `ReactNode` | — | 按钮文本内容 |
| `color` | `HxButtonColor` | `'primary'` | 配色方案 |
| `variant` | `'solid' \| 'outline' \| 'ghost' \| 'link'` | `'solid'` | 视觉样式变体 |
| `uppercase` | `boolean` | `true` | CSS `text-transform: uppercase`。指定 `$field` 时被忽略 |
| `valueUseI18N` | `boolean` | `false` | 对 `$field` 对应的模型值应用 i18n 翻译。使用 `text` 时不生效 |
| `$model` | `HxObject<T>` | — | 响应式模型，用于值/禁用绑定 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 指定后按钮文本从该模型字段读取，此时 `text` 和 `uppercase` 被忽略 |
| `$disabled` | `DisabledPropValue<T>` | — | `(model) => boolean`——响应式禁用 |

## 原生 DOM 事件

Button 最常用的事件是 `onClick`。其余标准 `<button>` 事件虽可透传，但很少需要：

**常用**：`onClick`。

**可用但通常不需要**（组件内部已管理）：值/禁用通过 `$model`/`$disabled` 管理。

**可用**：`onFocus`、`onBlur`、`onKeyDown`、`onKeyUp`、`onMouseEnter`、`onMouseLeave`、`onMouseDown`、`onMouseUp`、`onMouseMove`、`onMouseOver`、`onMouseOut`、`onTouchStart`、`onTouchEnd`、`onTouchMove`、`onPointerDown`、`onPointerUp`、`onPointerEnter`、`onPointerLeave`。

**排除的原生属性**：`disabled`（使用 `$disabled`）、`type`（硬编码为 `"button"`）、`value`、`color`、`children`。

其余所有标准 `<button>` 属性（包括 `autoFocus`、`form`、`name`）均透传。

## 全局配置

```ts
import { configHxButton } from '@hx/components';
configHxButton({ color: 'primary', variant: 'solid', uppercase: true });
```
