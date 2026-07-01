# HxPanel / HxPanelInner

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
| `borderRadius` | `HxPanelBorderRadius` | `'md'` | 圆角 |
| `collapsible` | `boolean` | `false` | 启用折叠/展开切换 |
| `defaultCollapsed` | `boolean` | `false` | 初始折叠 |
| `restoreScroll` | `boolean` | `true` | 展开时恢复滚动位置 |
| `bodyColumns` | `12 \| 15 \| 16` | `12` | 内容区域 CSS Grid 列数 |
| `$domHeader` | HTML 属性 | — | 标题元素上的额外属性 |
| `$domBody` | HTML 属性 | — | 内容元素上的额外属性 |

## 子组件

- **`HxPanelHeader`** — 标题栏（可折叠时点击切换，含 `aria-expanded`）
- **`HxPanelBody`** — 内容区域（折叠时隐藏）
- **`HxPanelProvider`** — 提供 `{ collapsed, toggle }` 上下文

## 键盘（可折叠模式）

- **Enter / Space** 在标题上 — 切换折叠/展开

## 全局配置

```ts
import { configHxPanel } from '@hx/components';
configHxPanel({ border: true, borderRadius: 'md', bodyColumns: 12, restoreScroll: true });
```
