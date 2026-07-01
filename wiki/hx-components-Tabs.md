# HxTabs

Tabbed content with header navigation and body switching. Each tab is defined as an object in the `content` array.

```tsx
<HxTabs
  $model={form}
  content={[
    { mark: 'general', header: 'General', body: <GeneralTab />, defaultActive: true },
    { mark: 'security', header: 'Security', body: <SecurityTab /> },
    { mark: 'billing', header: 'Billing', body: <BillingTab />, $disabled: (m) => !m.canBill },
  ]}
  border
  borderRadius="md"
  paddingX="lg"
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
| `paddingX` | `HxTabsPaddingX` | — | Body horizontal padding |
| `paddingT` | `HxTabsPaddingT` | — | Body top padding |
| `paddingB` | `HxTabsPaddingB` | — | Body bottom padding |
| `contentContainerType` | `'block' \| 'flex' \| 'grid'` | `'grid'` | CSS display for tab body content |
| `restoreScroll` | `boolean` | `true` | Restore scroll position when returning to a previously viewed tab |

## HxTab Definition

Each element in `content`:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `mark` | `string` | yes | Unique identifier for the tab |
| `header` | `ReactNode` | yes | Content rendered in the tab header |
| `body` | `ReactNode` | yes | Content rendered when this tab is active |
| `defaultActive` | `boolean` | no | Initially active tab |
| `$visible` | `DisabledPropValue<T>` | no | Reactive visibility — hidden tabs don't render |
| `$disabled` | `DisabledPropValue<T>` | no | Reactive disabled — can't be selected |

## Sub-Components

- **`HxTabsHeader`** — Row of tab header buttons
- **`HxTabsBody`** — Container for the active tab body
- **`HxTabHeader`** — Individual tab header (click to switch)
- **`HxTabBody`** — Individual tab body container

## Keyboard Navigation

- **Arrow Left / Right** — Move between tab headers
- **Enter / Space** — Activate focused tab
- **Tab** — Move focus into active tab content

## Hooks

- `useHxTabs()` — `{ tabs, activeMark, switchToTab }`
- `useHxTab()` — `{ isActive, mark, activate }`

## Native DOM Events

Tab headers forward button events. Tab body containers forward `<div>` events.

## Global Config

```ts
import { configHxTabs } from '@hx/components';
configHxTabs({ restoreScroll: true, contentContainerType: 'grid' });
```
