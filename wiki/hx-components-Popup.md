# HxPopup / HxPopupProvider

Anchored popup overlay positioned relative to a trigger element. Auto-detects viewport boundaries — prefers below, falls back to above.

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

## Deferred Portal Rendering

The popup portal is only rendered to the DOM when the popup is shown (`show()`). When hidden, no portal DOM nodes exist, reducing the initial DOM footprint. Use the `steady` prop for components that must remain mounted regardless of popup visibility (e.g. `HxSelectOptionsHolder`).

## Lifecycle State Machine

```
hidden → prepare → prepared → active → hide → hidden
```

## Hook

`useHxPopupContext()` — accessible within popup content:

```ts
const { show, hide, toggle, isVisible } = useHxPopupContext();
```

## Native DOM Events

Popup overlay forwards all standard DOM events. In practice you rarely need them — show/hide is controlled via `useHxPopupContext()`, and keyboard navigation is handled internally.

## Global Config

```ts
import { configHxPopup } from '@hx/components';
configHxPopup({ zIndex: 2000, gapToEdge: 5 });
```
