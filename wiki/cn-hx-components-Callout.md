# HxCallout

内联提示消息，带图标和文本。

```tsx
<HxCallout kind="info" message="更改已保存。" />
<HxCallout kind="success" message="操作完成。" />
<HxCallout kind="warn" message="订阅将在 3 天后到期。" />
<HxCallout kind="error" message="付款失败。" />
<HxCallout kind="question" message="确定要删除吗？" />

// 自定义图标
<HxCallout kind={<CustomWarning />} message="自定义提示" />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `kind` | `'info' \| 'success' \| 'question' \| 'warn' \| 'error' \| ReactNode` | — | 提示类型或自定义图标元素 |
| `message` | `ReactNode` | — | 消息内容 |

## 类型映射

| `kind` | 图标 | 颜色 |
|--------|------|------|
| `'info'` | `Info` | 蓝色 |
| `'success'` | `Success` | 绿色 |
| `'question'` | `Question` | 中性色 |
| `'warn'` | `Exclamation` | 黄色 |
| `'error'` | `Error` | 红色 |

## 原生 DOM 事件

所有标准 `<div>` 事件透传。Callout 是纯展示元素，实际中很少需要事件监听。
