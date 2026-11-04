# HxPanel

可折叠面板，带标题头和内容区域。

```tsx
// 简单面板
<HxPanel title="用户信息" border borderRadius="md">
  <HxInput $model={form} $field="name" />
  <HxInput $model={form} $field="email" />
</HxPanel>

// 可折叠，带滚动恢复
<HxPanel
  title="高级设置"
  collapsible
  defaultCollapsed
  restoreScroll
>
  <HxInput $model={form} $field="apiKey" type="password" />
</HxPanel>

// 网格内容布局
<HxPanel title="详情" bodyColumns={12}>
  <HxDiv style={{ gridColumn: 'span 6' }}>左</HxDiv>
  <HxDiv style={{ gridColumn: 'span 6' }}>右</HxDiv>
</HxPanel>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |
| `title` | `ReactNode` | — | 标题内容 |
| `border` | `boolean` | `true` | 显示面板边框 |
| `borderRadius` | `HxBorderRadius` | `'md'` | 圆角 |
| `collapsible` | `boolean` | `false` | 启用折叠/展开切换 |
| `defaultCollapsed` | `boolean` | `false` | 初始折叠 |
| `restoreScroll` | `boolean` | `true` | 展开时恢复滚动位置 |
| `bodyColumns` | `12 \| 15 \| 16` | `12` | 内容区域 CSS Grid 列数 |
| `$domHeader` | HTML 属性 | — | 标题元素上的额外属性 |
| `$domBody` | HTML 属性 | — | 内容元素上的额外属性 |

标题布局 props：`headerJustifyContent`、`headerAlignItems`、`headerAlignContent`、`headerGapX`、`headerGapY`、`headerPaddingX`、`headerPaddingT`、`headerPaddingB`。内容布局 props：`bodyJustifyItems`、`bodyJustifyContent`、`bodyAlignItems`、`bodyAlignContent`、`bodyGapX`、`bodyGapY`、`bodyPaddingX`、`bodyPaddingT`、`bodyPaddingB`。所有内容放在 `bodyColumns` 列的 CSS Grid 中。

`$visible` 与 `$change` 继承自 `HxStdProps`。

## 子组件

这些内部组件**没有**从包入口导出。

- **`HxPanelHeader`** — 标题行：标题文本 + 独立的 ghost 折叠按钮（`data-hx-panel-collapse-button`）。标题/文本本身不可点击，也不会写入 `aria-expanded`。
- **`HxPanelBody`** — 内容区域。折叠时仍保持挂载，由根节点的 `data-hx-panel-collapsed` CSS 隐藏。
- **`HxPanelProvider`** — 事件驱动上下文：`checkCollapsed`、`collapse`、`expand`，每个都有 `on…` / `off…` 监听器。

## 键盘（可折叠模式）

- **Enter / Space** 在折叠**按钮**上 — 切换折叠/展开。标题不是按钮，不响应键盘。

## 原生 DOM 事件

折叠按钮转发按钮事件；内容转发 `<div>` 事件。折叠/展开由专用按钮触发。

## 全局配置

```ts
import { configHxPanel } from '@hx/components';
configHxPanel({ border: true, borderRadius: 'md', bodyColumns: 12, restoreScroll: true });
```
