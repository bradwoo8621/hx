# HxTabs

标签页内容，带标题导航和内容切换。每个标签页作为 `content` 数组中的对象定义。

活动标签指示条与标题栏滚动均使用逻辑偏移。RTL 方向下标签从右到左排列，指示条从行首（右侧）定位，溢出的“更多标签”下拉停靠在行尾（左侧）。

```tsx
<HxTabs
  $model={form}
  content={[
    { mark: 'general', header: '常规', body: <GeneralTab />, defaultActive: true },
    { mark: 'security', header: '安全', body: <SecurityTab /> },
    { mark: 'billing', header: '账单', body: <BillingTab />,
      $disabled: {on: 'canBill', handle: (_ev, m) => !m.canBill, default: (m) => !m.canBill} },
  ]}
  border
  borderRadius="md"
  contentPaddingX="lg"
  restoreScroll
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型，传递给所有标签页内容 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 嵌套模型字段路径 |
| `content` | `HxTab[]` | **必填** | 标签页定义数组 |
| `border` | `boolean` | `false` | 内容区域显示边框 |
| `borderRadius` | `HxTabsBorderRadius` | — | 圆角 |
| `contentPaddingX` | `HxTabsPaddingX` | — | 标签页内容水平内边距。仅当 `padding-x` 与 `padding-y` 都未设置时，才使用 12px 兜底 |
| `contentPaddingT` | `HxTabsPaddingT` | — | 标签页内容顶部内边距 |
| `contentPaddingB` | `HxTabsPaddingB` | — | 标签页内容底部内边距 |
| `contentContainerType` | `'block' \| 'flex' \| 'grid'` | `'grid'` | 标签页内容的 CSS display |
| `restoreScroll` | `boolean` | `true` | 返回之前浏览的标签页时恢复滚动位置 |

## HxTab 定义

`content` 中每个元素的字段：

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `mark` | `string` | 否 | 唯一标识，用于程序化导航和 `data-hx-tab-mark` |
| `header` | `ReactNode` | 否 | 标签页标题内容 |
| `body` | `ReactNode` | 否 | 标签页激活时渲染的内容 |
| `defaultActive` | `boolean` | 否 | 初始激活的标签页；否则第一个标签页激活 |
| `$visible` | `VisiblePropValue<T>` | 否 | 布尔值、在挂载/父组件重渲染时求值的函数，或跟随模型变化的 `{on, handle}` 监听对象。隐藏的标签页仍会渲染并带 `data-hx-visible="no"`；其内容保持挂载（非激活内容为 `display: none`），因此标签页状态得以保留 |
| `$disabled` | `DisabledPropValue<T>` | 否 | 布尔值、在挂载/父组件重渲染时求值的函数，或跟随模型变化的 `{on, handle}` 监听对象——不可选中 |

## 子组件

内部 `HxTabsHeader` / `HxTabsBody` / `HxTabHeader` / `HxTabBody` **没有**从包入口导出。

- **`HxTabsHeader`** — 标题行，包含滑动活动指示条和溢出的“更多”选择器
- **`HxTabsBody`** — 所有标签页内容的容器
- **`HxTabHeader`** — 单个标签页标题（点击或键盘切换）
- **`HxTabBody`** — 单个标签页内容；非激活内容保持挂载并用 `display: none` 隐藏

## 键盘导航

- **Enter / Space** — 激活聚焦的标签页标题
- **Tab** — 按浏览器正常顺序进入标题行 / 激活内容

没有组级左右箭头导航；每个标题都是独立的 tab stop。

## 原生 DOM 事件

所有事件透传。实际中，标签页切换由组件内部处理（标题点击+键盘），无需手动监听。`onClick` 可用但通常多余——使用 `content` 数组的回调即可。

## Hooks

- `useHxTabs()` — 事件驱动容器上下文：`getActive`、`checkActive`、`checkActiveable`、`active`、`doActive`、`activeChanged`，每个都有 `on…` / `off…` 监听器
- `useHxTab()` — 事件驱动标签页上下文：`checkActive`、`active`，每个都有 `on…` / `off…` 监听器

这两个 hook 也没有从包入口导出，上下文属于内部实现。

## 全局配置

```ts
import { configHxTabs } from '@hx/components';
configHxTabs({ restoreScroll: true, containerType: 'grid' });
```
