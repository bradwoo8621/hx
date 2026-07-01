# HxFlex

弹性布局容器，支持方向、对齐、间距和内边距控制。渲染 `<div>`。

```tsx
// 水平行，居中
<HxFlex direction="dir-x" justifyContent="center" alignItems="center" gapX="md">
  <HxButton text="取消" />
  <HxButton text="保存" />
</HxFlex>

// 垂直堆叠，带间距
<HxFlex direction="dir-y" gapY="sm" paddingX="lg">
  <HxInput $model={form} $field="name" />
  <HxInput $model={form} $field="email" />
</HxFlex>

// 不换行，两端对齐
<HxFlex wrap={false} justifyContent="space-between" paddingX="md">
  <HxLabel text="标题" />
  <HxButton text="编辑" variant="ghost" />
</HxFlex>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `direction` | `'dir-x' \| 'dir-y'` | `'dir-x'` | 弹性方向（行 / 列） |
| `wrap` | `boolean` | `true` | 启用 `flex-wrap` |
| `justifyContent` | `'start' \| 'end' \| 'center' \| 'space-between' \| 'space-around' \| 'space-evenly' \| 'normal'` | `'normal'` | 主轴对齐 |
| `alignItems` | `'start' \| 'end' \| 'center' \| 'baseline' \| 'stretch' \| 'normal'` | `'center'` | 交叉轴对齐 |
| `alignContent` | 对齐值 | `'normal'` | 多行交叉轴对齐 |
| `border` | `boolean` | `false` | 显示边框 |
| `borderRadius` | `HxFlexBorderRadius` | — | 圆角 |
| `gapX` | `HxFlexGapX` | — | 水平间距（`column-gap`） |
| `gapY` | `HxFlexGapY` | — | 垂直间距（`row-gap`） |
| `paddingX` | `HxFlexPaddingX` | — | 水平内边距 |
| `paddingT` | `HxFlexPaddingT` | — | 顶部内边距 |
| `paddingB` | `HxFlexPaddingB` | — | 底部内边距 |
| `$model` | `HxObject<T>` | — | 响应式模型（自动传递给子组件） |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |

## 原生 DOM 事件（`<div>` 上）

与 `HxBox` 完全相同。

## 全局配置

```ts
import { configHxFlex } from '@hx/components';
configHxFlex({ direction: 'dir-x', wrap: true, alignItems: 'center' });
```
