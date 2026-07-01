# HxGrid

CSS Grid container. Renders `<div>`. Children control their column span via `style={{ gridColumn }}`.

```tsx
// Standard 12-column layout
<HxGrid columns={12} gapX="md" gapY="md">
  <HxDiv style={{ gridColumn: 'span 4' }}>Sidebar</HxDiv>
  <HxDiv style={{ gridColumn: 'span 8' }}>Main Content</HxDiv>
</HxGrid>

// 15-column with center alignment
<HxGrid columns={15} gapX="sm" justifyContent="center">
  <HxDiv style={{ gridColumn: 'span 5' }}>Column A</HxDiv>
  <HxDiv style={{ gridColumn: 'span 10' }}>Column B</HxDiv>
</HxGrid>

// With border, centered items
<HxGrid columns={12} border borderRadius="md" gapX="md" gapY="md">
  <HxDiv style={{ gridColumn: 'span 6' }}>Left</HxDiv>
  <HxDiv style={{ gridColumn: 'span 6' }}>Right</HxDiv>
</HxGrid>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `12 \| 15 \| 16` | `12` | Grid column count |
| `justifyItems` | CSS value | — | Item alignment on row axis |
| `justifyContent` | CSS value | — | Grid container alignment on row axis |
| `alignItems` | CSS value | — | Item alignment on column axis |
| `alignContent` | CSS value | — | Multi-row container alignment |
| `border` | `boolean` | `false` | Show border |
| `borderRadius` | `HxGridBorderRadius` | `'md'` | Border radius |
| `gapX` | `HxGridGapX` | `'md'` | Horizontal gap |
| `gapY` | `HxGridGapY` | — | Vertical gap |
| `paddingX` | size token | — | Horizontal padding |
| `paddingT` | size token | — | Top padding |
| `paddingB` | size token | — | Bottom padding |
| `$model` | `HxObject<T>` | — | Reactive model (auto-propagated to children) |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |

## Native DOM Events (on `<div>`)

Same full set as `HxBox`.

## Global Config

```ts
import { configHxGrid } from '@hx/components';
configHxGrid({ columns: 12, gapX: 'md', borderRadius: 'md' });
```
