# HxOverlay

Base overlay component — portal-based modal/drawer/toast system. Content renders into `document.body` via `HxOverlayPortalRoot`. Usually consumed via higher-level components (`HxAlert`, `HxToast`, `HxPopup`).

Positioning and slide-in animations use logical properties. In RTL direction, drawers and toasts mirror to the opposite edge: `drawer-left` slides in from the inline-start (right) edge, `toast-tr` docks bottom-left-equivalent, etc. Drawer/toast roles describe the LTR layout; their placement flips with `direction: rtl`.

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
| `autoGrabFocus` | `boolean` | `true` | On open, focus `[data-hx-first-element]` (or the first focusable element); fall back to the content container when nothing is focusable |
| `tabTrap` | `boolean` | `true` | Keep `Tab` / `Shift+Tab` cycling inside the overlay |

## Programmatic Show and Hide

```tsx
const overlay = useHxOverlay();
overlay.show('confirm', model, handle => {
  // Called once after the instance is mounted; capture the handle here
});
```

- The show callback runs **once**, after the instance is mounted and its portal exists in the DOM, but before the open animation completes. Its purpose is to hand back the instance handle.
- `hide(handle)` is accepted once the overlay is on screen. A hide issued during the mounting frame — for example from inside the show callback — is rejected with a console warning, because the open animation has not started yet. Validate the data **before** calling `show()` instead of opening and immediately closing.
- Inside overlay content, `useHxOverlayInstance().hide()` follows the same rule.

## Focus and Keyboard

An open overlay owns the keyboard:

- The content container and the backdrop are programmatically focusable (`tabindex="-1"`), so clicking an empty area of the dialog — or the backdrop — keeps focus inside the overlay instead of dropping it on `document.body`.
- `Escape` closes the overlay (when `hideOnEscape` is on) whether focus sits on the content, on the backdrop, or on any control inside.
- `Tab` / `Shift+Tab` cycle inside the overlay. From the backdrop they enter at `[data-hx-first-element]` (or the first focusable element) going forward, and at the last focusable element going backwards.
- On close, focus returns to the element that was focused when the overlay opened, provided that element is still in the document. `HxToast` performs no such restore.
- `HxToast` opts out of both (`autoGrabFocus={false} tabTrap={false}`): a notification neither takes focus when it appears nor becomes focusable when clicked.

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
