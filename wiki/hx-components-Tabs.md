# HxTabs

Tabbed content with header navigation and body switching. Each tab is defined as an object in the `content` array.

The active-tab indicator and header scrolling use logical offsets. In RTL direction, tabs are laid out right-to-left, the indicator positions from the inline-start (right) edge, and the overflow more-tab dropdown sticks to the inline-end (left) edge.

```tsx
<HxTabs
  $model={form}
  content={[
    { mark: 'general', header: 'General', body: <GeneralTab />, defaultActive: true },
    { mark: 'security', header: 'Security', body: <SecurityTab /> },
    { mark: 'billing', header: 'Billing', body: <BillingTab />,
      $disabled: {on: 'canBill', handle: (_ev, m) => !m.canBill, default: (m) => !m.canBill} },
  ]}
  border
  borderRadius="md"
  contentPaddingX="lg"
  restoreScroll
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model, passed to all tab bodies |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Nested model field path |
| `content` | `HxTab[]` | **required** | Array of tab definitions |
| `border` | `boolean` | `false` | Show border around content area |
| `borderRadius` | `HxTabsBorderRadius` | — | Border radius |
| `contentPaddingX` | `HxTabsPaddingX` | — | Body horizontal padding. The 12px fallback applies only when neither `padding-x` nor `padding-y` is set |
| `contentPaddingT` | `HxTabsPaddingT` | — | Body top padding |
| `contentPaddingB` | `HxTabsPaddingB` | — | Body bottom padding |
| `contentContainerType` | `'block' \| 'flex' \| 'grid'` | `'grid'` | CSS display for tab body content |
| `restoreScroll` | `boolean` | `true` | Restore scroll position when returning to a previously viewed tab |

## HxTab Definition

Each element in `content`:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `mark` | `string` | no | Unique identifier used for programmatic navigation and as the `data-hx-tab-mark` value |
| `header` | `ReactNode` | no | Content rendered in the tab header |
| `body` | `ReactNode` | no | Content rendered when this tab is active |
| `defaultActive` | `boolean` | no | Initially active tab; otherwise the first tab is active |
| `$visible` | `VisiblePropValue<T>` | no | Boolean, function evaluated at mount / parent re-render, or `{on, handle}` monitor. Hidden tabs still render with `data-hx-visible="no"`; their bodies stay mounted (inactive bodies are `display: none`), so tab state is preserved |
| `$disabled` | `DisabledPropValue<T>` | no | Boolean, function evaluated at mount / parent re-render, or `{on, handle}` monitor — can't be selected |

## Sub-Components

The internal `HxTabsHeader` / `HxTabsBody` / `HxTabHeader` / `HxTabBody` are **not** exported from the package barrel.

- **`HxTabsHeader`** — Row of tab headers, including the sliding active indicator and the overflow "more" selector
- **`HxTabsBody`** — Container for all tab bodies
- **`HxTabHeader`** — Individual tab header (click or keyboard to switch)
- **`HxTabBody`** — Individual tab body; inactive bodies stay mounted and are hidden with `display: none`

## Keyboard Navigation

- **Enter / Space** — Activate the focused tab header
- **Tab** — Move focus into the header row / active tab content using the browser's normal order

There is no group-level Arrow Left / Right navigation. Each header is its own tab stop.

## Hooks

- `useHxTabs()` — event-driven container context: `getActive`, `checkActive`, `checkActiveable`, `active`, `doActive`, `activeChanged`, each with `on…` / `off…` listeners
- `useHxTab()` — event-driven tab context: `checkActive`, `active`, each with `on…` / `off…` listeners

These hooks are not exported from the package barrel either; the contexts are internal.

## Native DOM Events

All events forwarded. In practice, tab switching is handled internally via header clicks and keyboard navigation. `onClick` on tab headers is available but usually unnecessary — use the `content` array's callbacks instead.

## Global Config

```ts
import { configHxTabs } from '@hx/components';
configHxTabs({ restoreScroll: true, containerType: 'grid' });
```
