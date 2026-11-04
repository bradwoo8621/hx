# HxActions

Dropdown action menu — combines a trigger button with a popup containing action items.

`tailing` accepts only `HxButton` (or `HxLabel`) elements, flat or nested in arrays. A flat array is one group; nested arrays are groups separated by a divider. Any other element is logged and dropped.

```tsx
<HxActions
  $model={form}
  leading={<HxButton text="Actions" />}
  tailing={[
    <HxButton text="Edit" onClick={edit} />,
    <HxButton text="Duplicate" onClick={dup} />,
    [
      <HxButton text="Delete" color="danger" onClick={del} />
    ]
  ]}
  color="primary"
  variant="outline"
/>
```

Popup buttons are forced to `variant="ghost"`; `color` is injected only when the item does not set one. Clicking an item closes the popup automatically.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Optional reactive model |
| `color` | `HxColor` | `'primary'` | Trigger button colour |
| `variant` | `Exclude<HxButtonVariant, 'link'>` | `'solid'` | Trigger button variant |
| `leading` | `HxActionsLeading` | — | Trigger content (click to toggle popup); defaults to a "More" (ellipsis) button when omitted |
| `tailing` | `HxActionsTailing` | **required** | Popup dropdown content |
| `zIndex` | `number` | config default | Popup z-index |
| `gapToEdge` | `number` | `HxSelectDefaults.gapToEdge` | Minimum gap between the popup and the viewport edge (px), not the trigger. `configHxActions({gapToEdge})` is stored but not read by the component |
| `popupPosition` | `'top' \| 'bottom'` | — | Force the popup below / above the trigger instead of auto-detecting |
| `popupAlignTo` | `'left' \| 'right'` | — | Force horizontal alignment with the trigger; logical, so it mirrors in RTL |

Plus the `HxFlex` container props (padding / margin / border, `alignItems`, `alignContent`, `justifyContent`, `gapY` and the flex / grid cell props; `direction` and `wrap` are fixed to `dir-x` / no-wrap on the trigger).

## Sub-Components

The internal `HxActionsLeadingContent` / `HxActionsTailingContent` are **not** exported from the package barrel. Their duties: leading handles show/hide, outside-click detection and keyboard events; tailing renders the popup and manages hover via `data-hx-hover`.

Keyboard navigation wraps around and skips disabled items. The popup is at least as wide as the trigger (`sameWidthAtMinimum`).

## Keyboard Navigation

- **Escape** — Close popup
- **Enter / Space** — With the popup open, select the currently hovered item
- **Arrow Up / Down** — With the popup closed, open it; with it open, move the hover to the previous / next item

## Native DOM Events

All events on the trigger button and popup content are forwarded. In practice, interaction is via `leading`/`tailing` content's own events (`onClick` on menu items), with keyboard navigation handled internally.

## Global Config

```ts
import { configHxActions } from '@hx/components';
configHxActions({ color: 'primary', variant: 'solid' });
```
