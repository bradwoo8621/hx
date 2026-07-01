# HxFlex

Flexbox container with direction, alignment, gap, and padding controls. Renders `<div>`.

```tsx
// Horizontal row, centered items
<HxFlex direction="dir-x" justifyContent="center" alignItems="center" gapX="md">
  <HxButton text="Cancel" />
  <HxButton text="Save" />
</HxFlex>

// Vertical stack with gap
<HxFlex direction="dir-y" gapY="sm" paddingX="lg">
  <HxInput $model={form} $field="name" />
  <HxInput $model={form} $field="email" />
</HxFlex>

// No-wrap, space-between
<HxFlex wrap={false} justifyContent="space-between" paddingX="md">
  <HxLabel text="Title" />
  <HxButton text="Edit" variant="ghost" />
</HxFlex>

// Alignment examples
<HxFlex alignItems="start">Top-aligned items</HxFlex>
<HxFlex alignItems="stretch">Full-height items</HxFlex>
<HxFlex alignItems="baseline">Baseline-aligned text</HxFlex>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'dir-x' \| 'dir-y'` | `'dir-x'` | Flex direction (row / column) |
| `wrap` | `boolean` | `true` | Enable `flex-wrap` |
| `justifyContent` | `'start' \| 'end' \| 'center' \| 'space-between' \| 'space-around' \| 'space-evenly' \| 'normal'` | `'normal'` | Main-axis alignment |
| `alignItems` | `'start' \| 'end' \| 'center' \| 'baseline' \| 'stretch' \| 'normal'` | `'center'` | Cross-axis alignment |
| `alignContent` | alignment value | `'normal'` | Multi-line cross-axis alignment |
| `border` | `boolean` | `false` | Show border |
| `borderRadius` | `HxFlexBorderRadius` | — | Border radius |
| `gapX` | `HxFlexGapX` | — | Horizontal gap (`column-gap`) |
| `gapY` | `HxFlexGapY` | — | Vertical gap (`row-gap`) |
| `paddingX` | `HxFlexPaddingX` | — | Horizontal padding |
| `paddingT` | `HxFlexPaddingT` | — | Top padding |
| `paddingB` | `HxFlexPaddingB` | — | Bottom padding |
| `$model` | `HxObject<T>` | — | Reactive model (auto-propagated to children) |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |

## Native DOM Events (on `<div>`)

Same full set as `HxBox`.

## Global Config

```ts
import { configHxFlex } from '@hx/components';
configHxFlex({ direction: 'dir-x', wrap: true, alignItems: 'center' });
```
