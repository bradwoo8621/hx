# HxPopup / HxPopupProvider

Anchored popup overlay positioned relative to a trigger element. Auto-detects viewport boundaries — prefers below, falls back to above. Pass `position` / `alignTo` in the render options to force the placement. In RTL direction the inline alignment mirrors: the popup prefers aligning its inline-start edge with the trigger's and falls back to the other edge when the viewport is too narrow.

```tsx
<HxPopupProvider zIndex={2000} gapToEdge={5}>
  <HxButton text="Open Menu" />
  <HxPopup>
    <HxFlex direction="dir-y">
      <HxButton text="Edit" variant="ghost" onClick={edit} />
      <HxButton text="Delete" variant="ghost" color="danger" onClick={del} />
    </HxFlex>
  </HxPopup>
</HxPopupProvider>

// Match trigger width
<HxPopupProvider sameWidthAtMinimum>
  <HxInput $model={form} $field="search" />
  <HxPopup>
    {/* Popup width >= input width */}
  </HxPopup>
</HxPopupProvider>
```

## Props (via HxPopupProvider)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `zIndex` | `number` | `2000` | CSS z-index |
| `gapToEdge` | `number` | `5` | Gap between trigger and popup (px) |
| `sameWidthAtMinimum` | `boolean` | — | Popup min-width = trigger width |
| `steady` | `ReactNode` | — | Steady-state children that persist even when popup is closed (e.g. data loaders) |

## Render Options (HxPopupRenderOptions)

Passed to `show()` / `relayout()` and to the `show` event listeners. Extends `HxRectRange`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | `'top' \| 'bottom'` | auto | Force the popup above / below the trigger. Omitted, the popup tries below, then above, then below again |
| `alignTo` | `'left' \| 'right'` | auto | Force horizontal alignment against the trigger. Logical: `left` means inline-start, so it mirrors in RTL |
| `minWidth` / `maxWidth` / `minHeight` / `maxHeight` | `number` | — | Size constraints; `minWidth` is never smaller than the trigger width |

## Deferred Portal Rendering

The popup portal is only rendered to the DOM when the popup is shown (`show()`). When hidden, no portal DOM nodes exist, reducing the initial DOM footprint. Use the `steady` prop for components that must remain mounted regardless of popup visibility (e.g. `HxSelectOptionsHolder`).

## Lifecycle State Machine

```
hidden → prepare → prepared → active → hide → hidden
```

## Hook

`useHxPopup()` — accessible within popup content:

```ts
const { hide, relayout, on, off, emit } = useHxPopup();
```

`hide()` closes the popup and `relayout(triggerEl, options)` asks it to recompute its position. `show(triggerEl, options)` requires the trigger element, so opening is normally driven by the trigger component. Both take `HxPopupRenderOptions` (see above).

## Native DOM Events

Popup overlay forwards all standard DOM events. In practice you rarely need them — show/hide is controlled via `useHxPopup()`, and keyboard navigation is handled internally.

## Global Config

```ts
import { configHxWithPopup } from '@hx/components';
configHxWithPopup({ zIndex: 2000, gapToEdge: 5 });
```
