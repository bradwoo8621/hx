# HxPanel / HxPanelInner

Collapsible panel with header title and body content area.

```tsx
// Simple panel
<HxPanel title="User Information" border borderRadius="md">
  <HxInput $model={form} $field="name" />
  <HxInput $model={form} $field="email" />
</HxPanel>

// Collapsible with scroll restoration
<HxPanel
  title="Advanced Settings"
  collapsible
  defaultCollapsed
  restoreScroll
>
  <HxInput $model={form} $field="apiKey" type="password" />
</HxPanel>

// Grid body layout
<HxPanel title="Details" bodyColumns={12}>
  <HxDiv style={{ gridColumn: 'span 6' }}>Left</HxDiv>
  <HxDiv style={{ gridColumn: 'span 6' }}>Right</HxDiv>
</HxPanel>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |
| `title` | `ReactNode` | — | Header title content |
| `border` | `boolean` | `true` | Show panel border |
| `borderRadius` | `HxPanelBorderRadius` | `'md'` | Border radius |
| `collapsible` | `boolean` | `false` | Enable collapse/expand toggle |
| `defaultCollapsed` | `boolean` | `false` | Start collapsed |
| `restoreScroll` | `boolean` | `true` | Restore scroll position on expand |
| `bodyColumns` | `12 \| 15 \| 16` | `12` | CSS grid columns for body content |
| `$domHeader` | HTML attributes | — | Extra attributes on the header element |
| `$domBody` | HTML attributes | — | Extra attributes on the body element |

## Sub-Components

- **`HxPanelHeader`** — Header bar (click to toggle when collapsible, includes `aria-expanded`)
- **`HxPanelBody`** — Body content area (hidden when collapsed)
- **`HxPanelProvider`** — Provides `{ collapsed, toggle }` context

## Keyboard (collapsible mode)

- **Enter / Space** on header — Toggle collapse/expand

## Native DOM Events

Header forwards button events; body forwards `<div>` events. In practice, manual event listeners are rarely needed — collapse/expand is triggered by header click, and body content is managed by child components.

## Global Config

```ts
import { configHxPanel } from '@hx/components';
configHxPanel({ border: true, borderRadius: 'md', bodyColumns: 12, restoreScroll: true });
```
