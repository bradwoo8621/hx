# HxGrid

CSS Grid 容器。渲染 `<div>`。子元素通过 `style={{ gridColumn }}` 控制列跨度。

```tsx
// 标准 12 列布局
<HxGrid columns={12} gapX="md" gapY="md">
  <HxDiv style={{ gridColumn: 'span 4' }}>侧边栏</HxDiv>
  <HxDiv style={{ gridColumn: 'span 8' }}>主内容</HxDiv>
</HxGrid>

// 15 列居中
<HxGrid columns={15} gapX="sm" justifyContent="center">
  <HxDiv style={{ gridColumn: 'span 5' }}>列 A</HxDiv>
  <HxDiv style={{ gridColumn: 'span 10' }}>列 B</HxDiv>
</HxGrid>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `columns` | `12 \| 15 \| 16` | `12` | 网格列数 |
| `justifyItems` | CSS 值 | — | 行轴上的项目对齐 |
| `justifyContent` | CSS 值 | — | 行轴上的容器对齐 |
| `alignItems` | CSS 值 | — | 列轴上的项目对齐 |
| `alignContent` | CSS 值 | — | 多行容器对齐 |
| `border` | `boolean` | `false` | 显示边框 |
| `borderRadius` | `HxGridBorderRadius` | `'md'` | 圆角 |
| `gapX` | `HxGridGapX` | `'md'` | 水平间距 |
| `gapY` | `HxGridGapY` | — | 垂直间距 |
| `paddingX` | 尺寸令牌 | — | 水平内边距 |
| `paddingT` | 尺寸令牌 | — | 顶部内边距 |
| `paddingB` | 尺寸令牌 | — | 底部内边距 |
| `$model` | `HxObject<T>` | — | 响应式模型（自动传递给子组件） |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |

## 原生 DOM 事件（`<div>` 上）

与 `HxBox` 完全相同。

## 全局配置

```ts
import { configHxGrid } from '@hx/components';
configHxGrid({ columns: 12, gapX: 'md', borderRadius: 'md' });
```
