# HxTabs

标签页内容，带标题导航和内容切换。每个标签页作为 `content` 数组中的对象定义。

```tsx
<HxTabs
  $model={form}
  content={[
    { mark: 'general', header: '常规', body: <GeneralTab />, defaultActive: true },
    { mark: 'security', header: '安全', body: <SecurityTab /> },
    { mark: 'billing', header: '账单', body: <BillingTab />, $disabled: (m) => !m.canBill },
  ]}
  border
  borderRadius="md"
  paddingX="lg"
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
| `paddingX` | `HxTabsPaddingX` | — | 标签页内容水平内边距 |
| `paddingT` | `HxTabsPaddingT` | — | 标签页内容顶部内边距 |
| `paddingB` | `HxTabsPaddingB` | — | 标签页内容底部内边距 |
| `contentContainerType` | `'block' \| 'flex' \| 'grid'` | `'grid'` | 标签页内容的 CSS display |
| `restoreScroll` | `boolean` | `true` | 返回之前浏览的标签页时恢复滚动位置 |

## HxTab 定义

`content` 中每个元素的字段：

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `mark` | `string` | 是 | 标签页唯一标识 |
| `header` | `ReactNode` | 是 | 标签页标题内容 |
| `body` | `ReactNode` | 是 | 标签页激活时渲染的内容 |
| `defaultActive` | `boolean` | 否 | 初始激活的标签页 |
| `$visible` | `DisabledPropValue<T>` | 否 | 响应式可见性——隐藏的标签页不渲染 |
| `$disabled` | `DisabledPropValue<T>` | 否 | 响应式禁用——不可选中 |

## 子组件

- **`HxTabsHeader`** — 标签页标题按钮行
- **`HxTabsBody`** — 当前激活标签页内容容器
- **`HxTabHeader`** — 单个标签页标题（点击切换）
- **`HxTabBody`** — 单个标签页内容容器

## 键盘导航

- **左/右箭头** — 标签页标题间切换
- **Enter / Space** — 激活聚焦的标签页
- **Tab** — 焦点进入激活标签页内容

## 原生 DOM 事件

所有事件透传。实际中，标签页切换由组件内部处理（标题点击+键盘导航），无需手动监听。`onClick` 可用但通常多余——使用 `content` 数组的回调即可。

## Hooks

- `useHxTabs()` — `{ tabs, activeMark, switchToTab }`
- `useHxTab()` — `{ isActive, mark, activate }`

## 全局配置

```ts
import { configHxTabs } from '@hx/components';
configHxTabs({ restoreScroll: true, contentContainerType: 'grid' });
```
