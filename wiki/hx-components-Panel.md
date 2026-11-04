# HxPanel

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
| `borderRadius` | `HxBorderRadius` | `'md'` | Border radius |
| `collapsible` | `boolean` | `false` | Enable collapse/expand toggle |
| `defaultCollapsed` | `boolean` | `false` | Start collapsed |
| `restoreScroll` | `boolean` | `true` | Restore scroll position on expand |
| `bodyColumns` | `12 \| 15 \| 16` | `12` | CSS grid columns for body content |
| `$domHeader` | HTML attributes | — | Extra attributes on the header element |
| `$domBody` | HTML attributes | — | Extra attributes on the body element |

Header layout props: `headerJustifyContent`, `headerAlignItems`, `headerAlignContent`, `headerGapX`, `headerGapY`, `headerPaddingX`, `headerPaddingT`, `headerPaddingB`. Body layout props: `bodyJustifyItems`, `bodyJustifyContent`, `bodyAlignItems`, `bodyAlignContent`, `bodyGapX`, `bodyGapY`, `bodyPaddingX`, `bodyPaddingT`, `bodyPaddingB`. All body content is placed in a CSS grid of `bodyColumns` columns.

`$visible` and `$change` are inherited from `HxStdProps`.

## Sub-Components

These internal components are **not** exported from the package barrel.

- **`HxPanelHeader`** — Header row: title plus a dedicated ghost collapse button (`data-hx-panel-collapse-button`). The header/title itself is not clickable, and no `aria-expanded` is written.
- **`HxPanelBody`** — Body content area. It stays mounted when collapsed; the root's `data-hx-panel-collapsed` CSS hides it.
- **`HxPanelProvider`** — Event-driven context: `checkCollapsed`, `collapse`, `expand`, each with `on…` / `off…` listeners.

## Keyboard (collapsible mode)

- **Enter / Space** on the collapse **button** — Toggle collapse/expand. The title is not a button and does not respond to keys.

## Native DOM Events

The collapse button forwards button events; the body forwards `<div>` events. Collapse/expand is otherwise triggered by the dedicated button.

## Global Config

```ts
import { configHxPanel } from '@hx/components';
configHxPanel({ border: true, borderRadius: 'md', bodyColumns: 12, restoreScroll: true });
```
