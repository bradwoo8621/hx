# HxButtonBar / HxCompactButtonBar

水平按钮栏，将按钮分为左侧（leading）和右侧（tailing）两组。继承 `HxFlex`。

```tsx
<HxButtonBar
  leading={
    <>
      <HxButton text="保存" onClick={save} />
      <HxButton text="保存并关闭" onClick={saveClose} />
    </>
  }
  tailing={
    <HxButton text="取消" variant="outline" onClick={close} />
  }
/>

// 紧凑变体（无水平内边距）
<HxCompactButtonBar
  leading={<HxButton text="返回" variant="ghost" />}
  tailing={<HxButton text="下一步" />}
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `leading` | `ReactNode` | — | 左侧按钮 |
| `tailing` | `ReactNode` | — | 右侧按钮 |
| `gap` | 尺寸令牌 | `'xs'` | 按钮间距 |
| `paddingX` | 尺寸令牌 | `'lg'` | 水平内边距 |
| `paddingY` | 尺寸令牌 | `'md'` | 垂直内边距 |

继承所有 `HxFlex` props，除了 `justifyContent` 和 `children`。

## 对齐逻辑

| 状态 | `justify-content` |
|------|-------------------|
| `leading` 和 `tailing` 同时存在 | `space-between` |
| 仅 `leading` | `flex-start` |
| 仅 `tailing` | `flex-end` |

## HxCompactButtonBar

与 `HxButtonBar` 相同，但 `paddingX: 'none'`。

## 原生 DOM 事件

同 `HxFlex`：所有 `<div>` 事件均已透传，布局容器很少需要。

## 全局配置

```ts
import { configHxButtonBar } from '@hx/components';
configHxButtonBar({ gap: 'xs', paddingX: 'lg', paddingY: 'md' });
```
