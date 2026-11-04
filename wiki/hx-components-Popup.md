# HxPopup / HxPopupProvider

Anchored popup overlay positioned relative to a trigger element. The public entry point is `HxPopupProvider`: it takes the trigger through the `trigger` prop and the popup body as `children`. `HxPopup` itself is not exported from the package barrel, so do not render it directly.

Auto-detects viewport boundaries — prefers below, falls back to above. Pass `position` / `alignTo` to force placement. In RTL the inline alignment mirrors.

```tsx
<HxPopupProvider
  zIndex={2000}
  gapToEdge={5}
  sameWidthAtMinimum
  trigger={<HxButton text="Open Menu" />}
>
  <HxFlex direction="dir-y">
    <HxButton text="Edit" variant="ghost" onClick={edit} />
    <HxButton text="Delete" variant="ghost" color="danger" onClick={del} />
  </HxFlex>
</HxPopupProvider>

// Match trigger width (sameWidthAtMinimum is required on the provider)
<HxPopupProvider sameWidthAtMinimum trigger={<HxInput $model={form} $field="search" />}>
  {/* Popup width >= input width */}
</HxPopupProvider>
```

## Props (HxPopupProvider)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `ReactNode` | — | **Required.** Trigger element |
| `children` | `ReactNode` | — | **Required.** Popup content |
| `sameWidthAtMinimum` | `boolean` | — | **Required.** Popup min-width follows the trigger width; when `false`, the `minWidth` render option is ignored |
| `zIndex` | `number` | `2000` | CSS z-index, clamped to at least `20` |
| `gapToEdge` | `number` | `5` | Minimum gap between the popup and the **viewport** edge (px), clamped to at least `2` |
| `steady` | `ReactNode` | — | Steady-state children that persist even when the popup is closed (e.g. data loaders) |

Data attributes (other than `data-hx-popup` / `data-hx-popup-state`) pass through to the popup root.

## Render Options (HxPopupRenderOptions)

Passed to `show()` / `relayout()`. Extends `HxRectRange`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | `'top' \| 'bottom'` | auto | Force the popup above / below the trigger |
| `alignTo` | `'left' \| 'right'` | auto | Force horizontal alignment against the trigger. Logical: `left` means inline-start, so it mirrors in RTL |
| `minWidth` / `maxWidth` / `minHeight` / `maxHeight` | `number` | — | Size constraints. `minWidth` only applies when the provider's `sameWidthAtMinimum` is `true` |

## Deferred Portal Rendering

The popup portal is only rendered to the DOM when the popup is shown. When hidden, no portal DOM nodes exist. Use `steady` for components that must remain mounted regardless of visibility (e.g. `HxSelectOptionsHolder`).

## Lifecycle State Machine

```
hidden → prepare → prepared → active → hide → hidden
```

The `hide → hidden` step is driven by the close transition. A time-based fallback always completes the step, so a popup whose transition never fires never gets stuck in `hide`.

## Hook

`useHxPopup()` — accessible within popup content:

```ts
const {hide, show, relayout, isVisible, checkFocusElement, on, off, emit} = useHxPopup();
```

`hide()` closes the popup; `relayout(triggerEl, options)` recomputes its position; `show(triggerEl, options)` requires the trigger element. `isVisible(callback)` answers synchronously from the portal's lifecycle state.

## Trigger Behaviour Lives in `usePopupVisibleRef`

The popup does **not** install outside-click/focus detection or ancestor scroll/resize relayout by itself. A custom trigger must use `usePopupVisibleRef` for those; otherwise the popup stays open.

```ts
const {context, visibleRef} = usePopupVisibleRef({elementRef: triggerRef});
visibleRef.current.show(disabled, {position: 'bottom'});
visibleRef.current.hide();
```

See [Hooks](./hx-components-Hooks#usepopupvisibleref).

## Native DOM Events

`HxPopup` accepts only data-attribute props (plus the sizing props listed above), not standard DOM event handlers. Attach handlers to the trigger or to elements inside the popup content.

## Global Config

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `zIndex` | `number` | `2000` | Base z-index of popup layers, minimum `20` |
| `gapToEdge` | `number` | `5` | Minimum gap between popup and viewport edge (px), minimum `2` |
| `showAnimationTime` | `number` | `200` | Fallback wait in ms when showing. Used only when no transition or animation is declared |
| `closeAnimationTime` | `number` | `50` | Fallback wait in ms when closing |

```ts
import { configHxWithPopup } from '@hx/components';
configHxWithPopup({zIndex: 2000, gapToEdge: 5, showAnimationTime: 200, closeAnimationTime: 50});
```
