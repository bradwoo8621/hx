# HxOverlay

Base overlay component — portal-based modal/drawer/toast system. Content renders into `document.body` via a portal root. Usually consumed through the higher-level components (`HxAlert`, `HxToast`, `HxDialog`, `HxDrawer`).

Every overlay is a **template**: `id` is required, the component renders nothing until `useHxOverlay().show(id, $model)` is called, and the same id can be shown repeatedly to produce simultaneous instances. Positioning and slide-in animations use logical properties, so in RTL direction drawers and toasts mirror to the opposite edge.

```tsx
const overlay = useHxOverlay();

// Register the template
<HxDialog id="profile-dialog" width="md" hideOnClickBackdrop hideOnEscape>
  <h2>Dialog Title</h2>
  <p>Content here</p>
</HxDialog>

// Open it
overlay.show('profile-dialog', form);

// Thin wrappers
<HxDrawer id="side-drawer" position="right" width="xs">...</HxDrawer>
<HxToast id="saved-toast" message="Saved" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | **Required.** Template id used by `show()` |
| `role` | `HxOverlayRole` | — | Overlay type (see below) |
| `width` | `HxSize` (`'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`) | — | Content width |
| `maxHeight` | `HxSize` (`'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`) | — | Maximum content height |
| `zIndex` | `number` | `1000` | CSS z-index; clamped to at least `10` |
| `hideOnClickBackdrop` | `boolean` | config (`false`) | Close overlay on backdrop click |
| `hideOnEscape` | `boolean` | config (`false`) | Close overlay on Escape key |
| `autoGrabFocus` | `boolean` | `true` | On open, focus `[data-hx-first-element]` (or the first focusable element); fall back to the content container when nothing is focusable |
| `tabTrap` | `boolean` | `true` | Keep `Tab` / `Shift+Tab` cycling inside the overlay |

## Programmatic Show and Hide

```tsx
const overlay = useHxOverlay();
overlay.show('confirm', model, handle => {
  // Called once after the instance is mounted; capture the handle here
});
```

- The show callback runs **once**, after the instance is mounted and its portal exists in the DOM, but before the open animation completes.
- `hide(handle)` is accepted once the overlay is on screen. A hide issued during the mounting frame — for example from inside the show callback — is rejected with a console warning. Validate the data **before** calling `show()` instead of opening and immediately closing.
- Inside overlay content, `useHxOverlayInstance().hide()` follows the same rule.

## Focus and Keyboard

An open overlay owns the keyboard:

- The content container and the backdrop are programmatically focusable (`tabindex="-1"`), so clicking an empty area keeps focus inside the overlay.
- `Escape` closes the overlay (when `hideOnEscape` is on) whether focus sits on the content, the backdrop, or any control inside.
- The **portal root** implements `Tab` / `Shift+Tab` trapping (not the content container). From the backdrop they enter at `[data-hx-first-element]` (or the first focusable element) going forward, and at the last focusable element going backwards.
- On close, focus returns to the element that was focused when the overlay opened, provided it is still in the document. `HxToast` performs no such restore.
- `HxToast` opts out of both (`autoGrabFocus={false} tabTrap={false}`).

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

`HxDialog` / `HxDrawer` props omit `role`.

## Sub-Components

| Component | Role |
|-----------|------|
| `HxOverlayBackdrop` | Backdrop with the animated transition; owns body scroll locking (skipped for toast roles) |
| `HxOverlayContent` | Content container; performs auto-focus and focus restore |
| `HxOverlayPortal` | Renders one overlay instance to `document.body` |
| `HxOverlayPortalRoot` | Per-instance portal destination; also owns the tab trap |
| `HxOverlayInternalContextProvider` | Instance-level context: `hide`, `hideComplete`, `onHide` / `offHide` |

The observable lifecycle state is written to `data-hx-overlay-state` on the backdrop: `hidden → prepare → active → hide`. There is no `HxOverlayInternalProvider` export and no `entering → entered → exiting → exited` state machine.

## Native DOM Events

The backdrop and content components accept only data-attribute props, not standard event handlers. Overlay behaviour is controlled through props; `HxToast` additionally takes `onDismissed`.

## Global Config

```ts
import { configHxOverlay } from '@hx/components';
configHxOverlay({
  zIndex: 1000,               // min 10
  hideOnClickBackdrop: false,
  hideOnEscape: false,
  toastDismissDelay: 5000,    // min 2000
  toastPosition: 'top-right',
  drawerPosition: 'right'
});
```
