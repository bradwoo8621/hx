# HxGrid

CSS Grid 容器。渲染 `<div>`。子元素通过 `gCols`（跨度）、`gCol`（起点）、`gRow`、`gRows`、`gJustifySelf`、`gAlignSelf` 设置格子位置；等价的 `data-hx-grid-cell-*` 属性同样可用。

```tsx
// 标准 12 列布局
<HxGrid columns={12} gapX="md" gapY="md">
  <HxDiv gCols={4}>侧边栏</HxDiv>
  <HxDiv gCols={8}>主内容</HxDiv>
</HxGrid>

// 15 列居中
<HxGrid columns={15} gapX="sm" justifyContent="center">
  <HxDiv gCols={5}>列 A</HxDiv>
  <HxDiv gCols={10}>列 B</HxDiv>
</HxGrid>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `columns` | `12 \| 15 \| 16` | `12` | 网格列数 |
| `justifyItems` | CSS 值 | `'normal'` | 项目在自身格子内的行内轴对齐 |
| `justifyContent` | CSS 值 | `'normal'` | 网格轨道的行内轴分布 |
| `alignItems` | CSS 值 | `'normal'` | 项目在自身行内的块轴对齐 |
| `alignContent` | CSS 值 | `'normal'` | 行的块轴分布 |
| `border` | `boolean` | `false` | 显示边框 |
| `borderRadius` | `HxBorderRadius` | — | 圆角 |
| `gapX` | `HxGap` | `'md'` | 水平间距 |
| `gapY` | `HxGap` | — | 垂直间距 |
| `paddingX` / `paddingY` | `HxPadding` | — | 水平 / 垂直内边距 |
| `paddingT` | `HxPadding` | — | 顶部内边距 |
| `paddingB` | `HxPadding` | — | 底部内边距 |
| `$model` | `HxObject<T>` | — | 响应式模型（自动传递给子组件） |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |

## 原生 DOM 事件

所有标准 `<div>` 事件均已透传。作为布局容器，实际使用中很少需要 DOM 事件监听。

## 全局配置

```ts
import { configHxGrid } from '@hx/components';
configHxGrid({ columns: 12, gapX: 'md', borderRadius: 'md' });
```
