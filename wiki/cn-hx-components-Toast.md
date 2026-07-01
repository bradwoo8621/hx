# HxToast

非阻塞通知，支持可选的自动关闭。基于 `HxOverlay`，使用 toast role 定位。

```tsx
// 自动关闭（默认 5000ms）
<HxToast type="success" message="文件上传成功。" />

// 仅手动关闭
<HxToast type="info" message="处理中..." dismissDelay={false} />

// 自定义关闭延迟（毫秒，最低 2000）
<HxToast type="warn" message="会话即将过期" dismissDelay={10000} />

// 关闭回调
<HxToast type="success" message="已保存！" onDismissed={() => refresh()} />

// 预置变体
<HxInfoToast message="更改已自动保存" />
<HxSuccessToast message="完成！" />
<HxWarnToast message="磁盘空间不足" />
<HxErrorToast message="上传失败" />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'info' \| 'success' \| 'warn' \| 'error' \| ReactNode` | — | 提示类型或自定义图标 |
| `message` | `ReactNode` | — | 提示消息内容 |
| `dismissDelay` | `boolean \| number` | `true` | 自动关闭延迟（毫秒，最低 2000）。`true` = 默认 5000ms。`false` = 不自动关闭 |
| `leadingFooter` | `ReactNode` | — | 底部左侧按钮 |
| `tailingFooter` | `ReactNode` | — | 底部右侧按钮（覆盖默认关闭按钮） |
| `onDismissed` | `() => void` | — | 关闭时回调 |

外加所有 `HxOverlay` 基础 props。

## 预置变体行为

| 组件 | 自动关闭 | 默认按钮 |
|------|----------|----------|
| `HxInfoToast` | 是（5000ms） | 关闭 |
| `HxSuccessToast` | 是（5000ms） | 关闭 |
| `HxWarnToast` | 是（5000ms） | 关闭 |
| `HxErrorToast` | 否 | 关闭 |
