# HxToast

Non-blocking notification with optional auto-dismiss. Built on `HxOverlay` with toast role positioning.

```tsx
// Auto-dismiss success (default 5000ms)
<HxToast type="success" message="File uploaded." />

// Manual dismiss only
<HxToast type="info" message="Processing..." dismissDelay={false} />

// Custom dismiss delay (ms, minimum 2000)
<HxToast type="warn" message="Session expires soon" dismissDelay={10000} />

// Dismiss callback
<HxToast type="success" message="Saved!" onDismissed={() => refresh()} />

// Pre-built variants
<HxInfoToast message="Changes auto-saved" />
<HxSuccessToast message="Done!" />
<HxWarnToast message="Low disk space" />
<HxErrorToast message="Upload failed" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'info' \| 'success' \| 'warn' \| 'error' \| ReactNode` | — | Toast type or custom icon |
| `message` | `ReactNode` | — | Toast message content |
| `dismissDelay` | `boolean \| number` | `true` | Auto-dismiss delay in ms (min 2000). `true` = default 5000ms. `false` = no auto-dismiss |
| `leadingFooter` | `ReactNode` | — | Footer buttons on the left |
| `tailingFooter` | `ReactNode` | — | Footer buttons on the right (overrides default Dismiss button) |
| `onDismissed` | `() => void` | — | Callback fired when the toast is dismissed |

Plus all `HxOverlay` base props.

## Pre-built Behaviours

| Component | Auto-dismiss | Default Button |
|-----------|-------------|----------------|
| `HxInfoToast` | Yes (5000ms) | Dismiss |
| `HxSuccessToast` | Yes (5000ms) | Dismiss |
| `HxWarnToast` | Yes (5000ms) | Dismiss |
| `HxErrorToast` | No | Dismiss |
