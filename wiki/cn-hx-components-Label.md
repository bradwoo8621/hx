# HxLabel

带样式的文本标签，支持悬停/激活状态和可选的模型绑定。渲染 `<span>`。

```tsx
<HxLabel text="用户名" color="neutral" />
<HxLabel text="~Common.Price" valueUseI18N />

// 模型绑定，带值格式化
<HxLabel $model={form} $field="price" format="@nugd7f2" />

// 交互状态
<HxLabel text="点击我" clickable hoverable onClick={handleClick} />
<HxLabel text="已选中" active />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `ReactNode` | — | 标签内容。以 `~` 开头为 i18n 键名。同时指定 `$model` 和 `$field` 时被忽略 |
| `color` | `HxColor` | — | 文字颜色 |
| `opaque` | `boolean` | — | 显示不透明背景 |
| `clickable` | `boolean` | — | `cursor: pointer` 样式 |
| `hoverable` | `boolean` | — | 启用悬停视觉效果 |
| `hovered` | `boolean` | — | 强制悬停状态（受控） |
| `active` | `boolean` | — | 强制激活/按下状态（受控） |
| `borderRadius` | `HxLabelBorderRadius` | — | 圆角 |
| `valueUseI18N` | `boolean` | `false` | 将 `text` 视为 i18n 键名 |
| `format` | `HxFormats` | — | 模型值的格式转换器（数字、日期、日期时间） |
| `paddingX` | `HxLabelPaddingX` | — | 水平内边距 |
| `paddingY` | `HxLabelPaddingY` | — | 垂直内边距 |
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 绑定时显示模型字段值而非 `text` |

## 原生 DOM 事件

所有 `<span>` 事件透传。启用 `clickable` 或 `hoverable` 时有用：`onClick`、`onMouseEnter`、`onMouseLeave`。其他情况下 Label 通常是纯展示元素，不需要事件监听。

## 全局配置

```ts
import { configHxLabel } from '@hx/components';
configHxLabel({ color: 'neutral' });
```
