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

// Right drawer
<HxOverlay role="drawer-right" width="md">
  <HxOverlayBackdrop />
  <HxOverlayContent>
    <HxPanel title="Settings">...</HxPanel>
  </HxOverlayContent>
</HxOverlay>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `role` | `HxOverlayRole` | — | Overlay type (see below) |
| `width` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'screen'` | — | Content width |
| `maxHeight` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'screen'` | — | Maximum content height |
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
| `'toast-top-left'` | Fixed, top-left corner |
| `'toast-top-center'` | Fixed, top-centre |
| `'toast-top-right'` | Fixed, top-right corner |
| `'toast-bottom-left'` | Fixed, bottom-left corner |
| `'toast-bottom-center'` | Fixed, bottom-centre |
| `'toast-bottom-right'` | Fixed, bottom-right corner |

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
configHxOverlay({ zIndex: 1000, hideOnClickBackdrop: false, hideOnEscape: false });
```
