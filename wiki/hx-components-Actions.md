# HxActions

Dropdown action menu — combines a trigger button with a popup containing action items.

```tsx
<HxActions
  $model={form}
  leading={<HxButton text="Actions" />}
  tailing={
    <HxFlex direction="dir-y">
      <HxButton text="Edit" variant="ghost" onClick={edit} />
      <HxButton text="Duplicate" variant="ghost" onClick={dup} />
      <HxSeparator />
      <HxButton text="Delete" variant="ghost" color="danger" onClick={del} />
    </HxFlex>
  }
  color="primary"
  variant="outline"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |
| `color` | `HxColor` | `'primary'` | Trigger button colour |
| `variant` | `HxButtonVariant` | `'solid'` | Trigger button variant |
| `leading` | `ReactNode` | **required** | Trigger content (click to toggle popup) |
| `tailing` | `ReactNode` | **required** | Popup dropdown content |
| `zIndex` | `number` | config default | Popup z-index |
| `gapToEdge` | `number` | config default | Trigger-to-popup gap (px) |

## Sub-Components

- **`HxActionsLeadingContent`** — Popup show/hide state, click-outside detection, keyboard event handling
- **`HxActionsTailingContent`** — Popup rendering with hover management via `data-hx-hover`

## Keyboard Navigation

- **Escape** — Close popup
- **Enter / Space** on trigger — Toggle popup
- **Arrow Up / Down** — Navigate within popup
- **Tab** — Focus management via `data-hx-hover`

## Native DOM Events

All events on the trigger button and popup content are forwarded. In practice, interaction is via `leading`/`tailing` content's own events (`onClick` on menu items), with keyboard navigation handled internally.

## Global Config

```ts
import { configHxActions } from '@hx/components';
configHxActions({ color: 'primary', variant: 'solid' });
```
