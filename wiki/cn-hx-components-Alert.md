# HxAlert

模态警示对话框，带类型特定图标、消息和底部按钮。基于 `HxOverlay`。

警示框是一个**模板**：给它 `id` 并渲染一次，再通过 `useHxOverlay().show(id, $model)` 打开。调用 `show` 前不会渲染任何内容。

```tsx
const overlay = useHxOverlay();

// 模板（在任意位置渲染一次）
<HxAlert
  id="save-alert"
  kind="info"
  message="记录已成功保存。"
  tailingFooter={<HxButton text="确定" onClick={close} />}
/>

// 打开
overlay.show('save-alert', form);
```

`kind` 决定图标和颜色；普通 `HxAlert` 在未传 `leadingFooter` / `tailingFooter` 时**不渲染按钮**。

## 确认询问

```tsx
<HxAlert
  id="delete-alert"
  kind="question"
  message="确定要删除此项吗？"
  leadingFooter={<HxButton text="否" variant="outline" onClick={close} />}
  tailingFooter={<HxButton text="是" color="danger" onClick={handleDelete} />}
/>
```

## 预置变体

```tsx
// 单个确定按钮
<HxInfoAlert id="info" message="提示信息" confirm={close} />
<HxSuccessAlert id="success" message="操作成功！" confirm={close} />
<HxWarnAlert id="warn" message="警告！" confirm={close} />
<HxErrorAlert id="error" message="操作失败！" confirm={close} />

// 是 / 否按钮
<HxQuestionAlert id="question" message="确定吗？" yes={handleYes} no={handleNo} />
```

所有回调接收 `(event, $model, context)`，执行后警示框自行关闭。`yes` 必填，`no` 可选。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `string` | — | **必填。** 供 `show()` 使用的模板 id |
| `kind` | `'info' \| 'success' \| 'question' \| 'warn' \| 'error' \| ReactNode` | — | 警示类型或自定义图标元素 |
| `message` | `ReactNode` | — | 警示正文消息 |
| `leadingFooter` | `ReactNode` | — | 底部左侧内容 |
| `tailingFooter` | `ReactNode` | — | 底部右侧内容 |

预置变体额外提供：

| 变体 | Prop | 类型 |
|------|------|------|
| `HxInfoAlert` / `HxSuccessAlert` / `HxWarnAlert` / `HxErrorAlert` | `confirm` | `(ev, $model, context) => void` |
| `HxQuestionAlert` | `yes`（必填）、`no` | `(ev, $model, context) => void` |

`HxAlertProps` 从遮罩层 props 中省略 `role`、`maxHeight`、`hideOnClickBackdrop`、`hideOnEscape` 和 `children`。`width` 类型上可用，但始终被强制为 `"sm"`。点击遮罩或按 Escape 不会关闭警示框。

## 类型映射

| `kind` | 图标 | 颜色 | 按钮 |
|--------|------|------|------|
| `'info'` | `Info` | `info`（蓝） | 普通 `HxAlert` 无；`HxInfoAlert` 为确定 |
| `'success'` | `Success` | `success`（绿） | `HxSuccessAlert` 为确定 |
| `'warn'` | `Exclamation` | `warn`（橙） | `HxWarnAlert` 为确定 |
| `'error'` | `Error` | `danger`（红） | `HxErrorAlert` 为确定 |
| `'question'` | `Question` | `info`（蓝） | `HxQuestionAlert` 为是 / 否 |
