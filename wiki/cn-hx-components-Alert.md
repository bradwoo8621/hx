# HxAlert

模态警示对话框，带类型特定图标、消息和底部按钮。基于 `HxOverlay`。

```tsx
// 基本提示，带确定按钮
<HxAlert
  type="info"
  message="记录已成功保存。"
  tailingFooter={<HxButton text="确定" onClick={close} />}
/>

// 确认询问，带是/否按钮
<HxAlert
  type="question"
  message="确定要删除此项吗？"
  leadingFooter={<HxButton text="否" variant="outline" onClick={close} />}
  tailingFooter={<HxButton text="是" color="danger" onClick={handleDelete} />}
/>

// 便捷预置变体（单确定按钮）
<HxInfoAlert message="提示信息" onConfirmed={close} />
<HxSuccessAlert message="操作成功！" onConfirmed={close} />
<HxWarnAlert message="警告！" onConfirmed={close} />
<HxErrorAlert message="操作失败！" onConfirmed={close} />

// 确认询问（是/否按钮）
<HxQuestionAlert message="确定吗？" onConfirmed={handleYes} onCanceled={handleNo} />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'info' \| 'success' \| 'question' \| 'warn' \| 'error' \| ReactNode` | — | 警示类型或自定义图标元素 |
| `message` | `ReactNode` | — | 警示正文消息 |
| `leadingFooter` | `ReactNode` | — | 底部左侧按钮 |
| `tailingFooter` | `ReactNode` | — | 底部右侧按钮 |
| `onConfirmed` | `() => void` | — | 确定回调 |
| `onCanceled` | `() => void` | — | 取消回调 |

外加所有 `HxOverlay` 基础 props。

## 类型映射

| `type` | 图标 | 默认按钮 |
|--------|------|----------|
| `'info'` | `Info`（蓝） | 确定 |
| `'success'` | `Success`（绿） | 确定 |
| `'warn'` | `Exclamation`（黄） | 确定 |
| `'error'` | `Error`（红） | 确定 |
| `'question'` | `Question`（中性） | 是 / 否 |
