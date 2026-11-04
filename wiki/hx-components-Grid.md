# HxGrid

CSS Grid container. Renders `<div>`. Children set their cell placement with `gCols` (span), `gCol` (start), `gRow`, `gRows`, `gJustifySelf`, `gAlignSelf`; the equivalent `data-hx-grid-cell-*` attributes also work.

```tsx
// Standard 12-column layout
<HxGrid columns={12} gapX="md" gapY="md">
  <HxDiv gCols={4}>Sidebar</HxDiv>
  <HxDiv gCols={8}>Main Content</HxDiv>
</HxGrid>

// 15-column with center alignment
<HxGrid columns={15} gapX="sm" justifyContent="center">
  <HxDiv gCols={5}>Column A</HxDiv>
  <HxDiv gCols={10}>Column B</HxDiv>
</HxGrid>

// With border, centered items
<HxGrid columns={12} border borderRadius="md" gapX="md" gapY="md">
  <HxDiv gCols={6}>Left</HxDiv>
  <HxDiv gCols={6}>Right</HxDiv>
</HxGrid>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `12 \| 15 \| 16` | `12` | Grid column count |
| `justifyItems` | CSS value | `'normal'` | Inline-axis alignment of an item inside its own cell |
| `justifyContent` | CSS value | `'normal'` | Inline-axis distribution of the grid tracks |
| `alignItems` | CSS value | `'normal'` | Block-axis alignment of an item inside its row |
| `alignContent` | CSS value | `'normal'` | Block-axis distribution of the rows |
| `border` | `boolean` | `false` | Show border |
| `borderRadius` | `HxBorderRadius` | — | Border radius |
| `gapX` | `HxGap` | `'md'` | Horizontal gap |
| `gapY` | `HxGap` | — | Vertical gap |
| `paddingX` / `paddingY` | `HxPadding` | — | Horizontal / vertical padding |
| `paddingT` | `HxPadding` | — | Top padding |
| `paddingB` | `HxPadding` | — | Bottom padding |
| `$model` | `HxObject<T>` | — | Reactive model (auto-propagated to children) |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |

## Native DOM Events

All standard `<div>` events forwarded. As a layout container, DOM event listeners are rarely needed in practice.

## Global Config

```ts
import { configHxGrid } from '@hx/components';
configHxGrid({ columns: 12, gapX: 'md', borderRadius: 'md' });
```
