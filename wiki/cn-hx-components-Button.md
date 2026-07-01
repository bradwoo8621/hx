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
| `uppercase` | `boolean` | `true` | CSS `text-transform: uppercase` |
| `valueUseI18N` | `boolean` | `false` | 将 `text` 解释为 i18n 键名 |
| `$model` | `HxObject<T>` | — | 响应式模型，用于值/禁用绑定 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 字段路径——按钮文本反映该字段值 |
| `$disabled` | `DisabledPropValue<T>` | — | `(model) => boolean`——响应式禁用 |

## 原生 DOM 事件（`<button>` 上）

`onClick`、`onMouseDown`、`onMouseUp`、`onMouseEnter`、`onMouseLeave`、`onMouseMove`、`onMouseOver`、`onMouseOut`、`onKeyDown`、`onKeyUp`、`onKeyPress`、`onFocus`、`onBlur`、`onTouchStart`、`onTouchEnd`、`onTouchMove`、`onPointerDown`、`onPointerUp`、`onPointerEnter`、`onPointerLeave`。

透传的原生属性：`disabled`、`autoFocus`、`form`、`name`。

## 全局配置

```ts
import { configHxButton } from '@hx/components';
configHxButton({ color: 'primary', variant: 'solid', uppercase: true });
```
