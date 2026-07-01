# HxAlert

Modal alert dialog with type-specific icon, message, and footer buttons. Built on `HxOverlay`.

```tsx
// Basic alert with OK button
<HxAlert
  type="info"
  message="Record saved successfully."
  tailingFooter={<HxButton text="OK" onClick={close} />}
/>

// Question with Yes/No
<HxAlert
  type="question"
  message="Delete this item?"
  leadingFooter={<HxButton text="No" variant="outline" onClick={close} />}
  tailingFooter={<HxButton text="Yes" color="danger" onClick={handleDelete} />}
/>

// Convenience pre-builts (single OK button)
<HxInfoAlert message="Information message" onConfirmed={close} />
<HxSuccessAlert message="Done!" onConfirmed={close} />
<HxWarnAlert message="Warning!" onConfirmed={close} />
<HxErrorAlert message="Failed!" onConfirmed={close} />

// Question with Yes/No buttons
<HxQuestionAlert message="Are you sure?" onConfirmed={handleYes} onCanceled={handleNo} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'info' \| 'success' \| 'question' \| 'warn' \| 'error' \| ReactNode` | — | Alert type or custom icon element |
| `message` | `ReactNode` | — | Alert body message |
| `leadingFooter` | `ReactNode` | — | Footer buttons on the left |
| `tailingFooter` | `ReactNode` | — | Footer buttons on the right |
| `onConfirmed` | `() => void` | — | Confirm/OK callback |
| `onCanceled` | `() => void` | — | Cancel callback |

Plus all `HxOverlay` base props.

## Type Mappings

| `type` | Icon | Default Buttons |
|--------|------|-----------------|
| `'info'` | `Info` (blue) | OK |
| `'success'` | `Success` (green) | OK |
| `'warn'` | `Exclamation` (yellow) | OK |
| `'error'` | `Error` (red) | OK |
| `'question'` | `Question` (neutral) | Yes / No |
