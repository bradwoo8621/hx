# HxToast

Non-blocking notification with optional auto-dismiss. Built on `HxOverlay` with toast-role positioning.

A toast is a **template**: give it an `id`, render it once, then open it with `useHxOverlay().show(id, $model)`.

```tsx
const overlay = useHxOverlay();

// Plain toast: no auto-dismiss by default (dismissDelay is undefined → -1)
<HxToast id="processing-toast" type="info" message="Processing..." />

// Auto-dismiss after the global default (5000 ms)
<HxToast id="saved-toast" type="success" message="Saved!" dismissDelay />

// Custom dismiss delay (ms, minimum 2000)
<HxToast id="expiry-toast" type="warn" message="Session expires soon" dismissDelay={10000} />

// Screen position (default 'top-right', or toastPosition from config)
<HxToast id="low-disk" type="warn" message="Low disk space" position="bottom-right" />

// Dismiss callback
<HxToast id="refresh-toast" type="success" message="Saved!" onDismissed={refresh} />

overlay.show('saved-toast', form);
```

## Pre-built Variants

```tsx
<HxInfoToast id="info" message="Changes auto-saved" />
<HxSuccessToast id="success" message="Done!" />
<HxWarnToast id="warn" message="Low disk space" />
<HxErrorToast id="error" message="Upload failed" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | **Required.** Template id used by `show()` |
| `type` | `'info' \| 'success' \| 'question' \| 'warn' \| 'error' \| ReactNode` | — | Toast type or custom icon |
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` | Screen corner the toast appears in |
| `message` | `ReactNode` | — | Toast message content |
| `dismissDelay` | `boolean \| number` | — | `true` = global default (5000 ms); `number` = that delay, floored at 2000 ms; `false` or omitted = no auto-dismiss |
| `leadingFooter` | `ReactNode` | — | Footer content on the left |
| `tailingFooter` | `ReactNode` | — | Footer content on the right |
| `onDismissed` | `(ev, $model, context) => void` | — | Fired when the toast is dismissed |

`HxToastProps` omits `role`, `width`, `maxHeight`, `hideOnClickBackdrop`, `hideOnEscape`, `tabTrap`, `autoGrabFocus`, and `children`. Width is fixed to `"md"`, and backdrop click / Escape never close a toast.

## Pre-built Behaviours

| Component | Auto-dismiss | Default Button |
|-----------|-------------|----------------|
| `HxInfoToast` | Yes (5000 ms) | Dismiss |
| `HxSuccessToast` | Yes (5000 ms) | Dismiss |
| `HxWarnToast` | Yes (5000 ms) | Dismiss |
| `HxErrorToast` | No | Dismiss |

The pre-built variants omit `type`, `leadingFooter`, and `tailingFooter`: their Dismiss button cannot be overridden.
