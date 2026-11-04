# HxToast

非阻塞通知，支持可选的自动关闭。基于 `HxOverlay`，使用 toast role 定位。

Toast 是一个**模板**：给它 `id` 并渲染一次，再通过 `useHxOverlay().show(id, $model)` 打开。

```tsx
const overlay = useHxOverlay();

// 普通 toast：默认不自动关闭（dismissDelay 未传 → -1）
<HxToast id="processing-toast" type="info" message="处理中..." />

// 按全局默认延迟（5000 ms）自动关闭
<HxToast id="saved-toast" type="success" message="已保存！" dismissDelay />

// 自定义关闭延迟（毫秒，最低 2000）
<HxToast id="expiry-toast" type="warn" message="会话即将过期" dismissDelay={10000} />

// 屏幕位置（默认 'top-right'，或配置中的 toastPosition）
<HxToast id="low-disk" type="warn" message="磁盘空间不足" position="bottom-right" />

// 关闭回调
<HxToast id="refresh-toast" type="success" message="已保存！" onDismissed={refresh} />

overlay.show('saved-toast', form);
```

## 预置变体

```tsx
<HxInfoToast id="info" message="更改已自动保存" />
<HxSuccessToast id="success" message="完成！" />
<HxWarnToast id="warn" message="磁盘空间不足" />
<HxErrorToast id="error" message="上传失败" />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `string` | — | **必填。** 供 `show()` 使用的模板 id |
| `type` | `'info' \| 'success' \| 'question' \| 'warn' \| 'error' \| ReactNode` | — | 提示类型或自定义图标 |
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` | Toast 出现的屏幕角落 |
| `message` | `ReactNode` | — | 提示消息内容 |
| `dismissDelay` | `boolean \| number` | — | `true` = 全局默认（5000 ms）；`number` = 该延迟（最低 2000 ms）；`false` 或省略 = 不自动关闭 |
| `leadingFooter` | `ReactNode` | — | 底部左侧内容 |
| `tailingFooter` | `ReactNode` | — | 底部右侧内容 |
| `onDismissed` | `(ev, $model, context) => void` | — | 关闭时回调 |

`HxToastProps` 省略 `role`、`width`、`maxHeight`、`hideOnClickBackdrop`、`hideOnEscape`、`tabTrap`、`autoGrabFocus` 和 `children`。宽度固定为 `"md"`，点击遮罩或按 Escape 永远不会关闭 toast。

## 预置变体行为

| 组件 | 自动关闭 | 默认按钮 |
|------|----------|----------|
| `HxInfoToast` | 是（5000 ms） | 关闭 |
| `HxSuccessToast` | 是（5000 ms） | 关闭 |
| `HxWarnToast` | 是（5000 ms） | 关闭 |
| `HxErrorToast` | 否 | 关闭 |

预置变体省略 `type`、`leadingFooter`、`tailingFooter`：其关闭按钮无法覆盖。
