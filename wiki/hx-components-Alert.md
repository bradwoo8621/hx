# HxAlert

Modal alert dialog with a type-specific icon, message, and footer. Built on `HxOverlay`.

An alert is a **template**: give it an `id`, render it once, then open it with `useHxOverlay().show(id, $model)`. Nothing renders until `show` is called.

```tsx
const overlay = useHxOverlay();

// Template (render anywhere once)
<HxAlert
  id="save-alert"
  kind="info"
  message="Record saved successfully."
  tailingFooter={<HxButton text="OK" onClick={close} />}
/>

// Open it
overlay.show('save-alert', form);
```

`kind` selects the icon and colour; a plain `HxAlert` renders **no buttons** unless you pass `leadingFooter` / `tailingFooter`.

## Question Alert

```tsx
<HxAlert
  id="delete-alert"
  kind="question"
  message="Delete this item?"
  leadingFooter={<HxButton text="No" variant="outline" onClick={close} />}
  tailingFooter={<HxButton text="Yes" color="danger" onClick={handleDelete} />}
/>
```

## Pre-built Variants

```tsx
// Single OK button
<HxInfoAlert id="info" message="Information message" confirm={close} />
<HxSuccessAlert id="success" message="Done!" confirm={close} />
<HxWarnAlert id="warn" message="Warning!" confirm={close} />
<HxErrorAlert id="error" message="Failed!" confirm={close} />

// Yes / No buttons
<HxQuestionAlert id="question" message="Are you sure?" yes={handleYes} no={handleNo} />
```

All callbacks receive `(event, $model, context)` and the alert closes itself after the callback runs. `yes` is required; `no` is optional.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | **Required.** Template id used by `show()` |
| `kind` | `'info' \| 'success' \| 'question' \| 'warn' \| 'error' \| ReactNode` | — | Alert type, or a custom icon element |
| `message` | `ReactNode` | — | Alert body message |
| `leadingFooter` | `ReactNode` | — | Footer content on the left |
| `tailingFooter` | `ReactNode` | — | Footer content on the right |

Pre-built variants add:

| Variant | Prop | Type |
|---------|------|------|
| `HxInfoAlert` / `HxSuccessAlert` / `HxWarnAlert` / `HxErrorAlert` | `confirm` | `(ev, $model, context) => void` |
| `HxQuestionAlert` | `yes` (required), `no` | `(ev, $model, context) => void` |

`HxAlertProps` omits `role`, `maxHeight`, `hideOnClickBackdrop`, `hideOnEscape`, and `children` from the overlay props. `width` is accepted by the type but always forced to `"sm"`. Backdrop click and Escape do not close an alert.

## Type Mappings

| `kind` | Icon | Colour | Buttons |
|--------|------|--------|---------|
| `'info'` | `Info` | `info` (blue) | none on plain `HxAlert`; OK on `HxInfoAlert` |
| `'success'` | `Success` | `success` (green) | OK on `HxSuccessAlert` |
| `'warn'` | `Exclamation` | `warn` (orange) | OK on `HxWarnAlert` |
| `'error'` | `Error` | `danger` (red) | OK on `HxErrorAlert` |
| `'question'` | `Question` | `info` (blue) | Yes / No on `HxQuestionAlert` |
