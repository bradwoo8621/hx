# HxOverlay

Base overlay component — portal-based modal/drawer/toast system. Content renders into `document.body` via `HxOverlayPortalRoot`. Usually consumed via higher-level components (`HxAlert`, `HxToast`, `HxPopup`).

```tsx
// Dialog with backdrop
<HxOverlay role="dialog" width="md" hideOnClickBackdrop hideOnEscape>
  <HxOverlayBackdrop />
  <HxOverlayContent>
    <h2>Dialog Title</h2>
    <p>Content here</p>
  </HxOverlayContent>
</HxOverlay>

// Or use the thin wrappers
<HxDialog width="md" hideOnClickBackdrop hideOnEscape>...</HxDialog>
<HxDrawer position="right" width="xs">...</HxDrawer>

// Toast positioned by prop
<HxToast position="top-right" message="Saved" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `role` | `HxOverlayRole` | — | Overlay type (see below) |
| `width` | `HxSize` (`'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`) | — | Content width |
| `maxHeight` | `HxSize` (`'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`) | — | Maximum content height |
| `zIndex` | `number` | `1000` | CSS z-index |
| `hideOnClickBackdrop` | `boolean` | `false` | Close overlay on backdrop click |
| `hideOnEscape` | `boolean` | `false` | Close overlay on Escape key |

## Role Values

| Role | Behavior |
|------|----------|
| `'alert'` | Centred modal with backdrop |
| `'dialog'` | Centred modal with backdrop |
| `'drawer-left'` | Slides in from left |
| `'drawer-right'` | Slides in from right |
| `'drawer-top'` | Slides in from top |
| `'drawer-bottom'` | Slides in from bottom |
| `'toast-tl'` | Fixed, top-left corner |
| `'toast-tr'` | Fixed, top-right corner |
| `'toast-bl'` | Fixed, bottom-left corner |
| `'toast-br'` | Fixed, bottom-right corner |

## Wrapper Components

| Component | Role written | Extra prop |
|-----------|--------------|------------|
| `HxDialog` | `role="dialog"` | — |
| `HxDrawer` | mapped from `position` | `position: 'top' \| 'right' \| 'bottom' \| 'left'` (default `'right'`, or `drawerPosition` from config) |

## Sub-Components

| Component | Role |
|-----------|------|
| `HxOverlayBackdrop` | Semi-transparent backdrop with animated CSS transition |
| `HxOverlayContent` | Content container with focus trapping and body scroll lock |
| `HxOverlayPortal` | Renders content to `document.body` via React Portal |
| `HxOverlayPortalRoot` | Portal destination DOM node (include once per app) |
| `HxOverlayInternalProvider` | Lifecycle state: `entering → entered → exiting → exited` |

## Native DOM Events

All overlay sub-components forward standard events. In practice you rarely need them — overlay behaviour is controlled via props (`hideOnEscape`, `hideOnClickBackdrop`, `onConfirmed`, `onDismissed`).

## Global Config

```ts
import { configHxOverlay } from '@hx/components';
configHxOverlay({ zIndex: 1000, hideOnClickBackdrop: false, hideOnEscape: false, toastPosition: 'top-right', drawerPosition: 'right' });
```
