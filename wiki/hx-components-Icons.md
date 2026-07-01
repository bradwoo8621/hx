# Icons

45 SVG icon components. All render at `15×15` with `viewBox="0 0 15 15"`, `fill="none"`, and `fill="currentColor"` on paths — inheriting text color from the parent element.

## Import

```tsx
// Named import
import { Calendar, Check, MagnifyingGlass, Trash } from '@hx/components';

// Namespace import
import { Icons } from '@hx/components';
// <Icons.Calendar />  <Icons.Check />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `marginT` | `number` | — | Top margin in pixels |
| `marginR` | `number` | — | Right margin in pixels |
| `marginB` | `number` | — | Bottom margin in pixels |
| `marginL` | `number` | — | Left margin in pixels |
| `style` | `CSSProperties` | — | Inline styles applied to the SVG element |
| `data-hx-*` | `string \| number \| boolean` | — | Custom data attributes for design token styling |

## Usage

```tsx
// As a button label icon (inherits button color)
<HxButton text={<><Plus marginR={4} />Add Item</>} />

// Standalone with styling
<Check style={{ color: 'green' }} marginR={8} />

// Inside input prefix (search icon)
<HxInput prefix={<MagnifyingGlass />} />
```

## Icon Catalog

| Name | Category | Name | Category |
|------|----------|------|----------|
| `Archive` | action | `Calendar` | data |
| `CaretDown` | nav | `CaretLeft` | nav |
| `CaretRight` | nav | `CaretUp` | nav |
| `Check` | status | `ChevronDown` | nav |
| `ChevronLeft` | nav | `ChevronRight` | nav |
| `ChevronUp` | nav | `Clear` | action |
| `Clock` | data | `Close` | action |
| `Collapse` | action | `Cross1` | action |
| `DotsX` | action (horizontal) | `DotsY` | action (vertical) |
| `Download` | action | `Error` | status |
| `Exclamation` | status | `Expand` | action |
| `EyeClosed` | toggle | `EyeNone` | toggle |
| `EyeOpen` | toggle | `FileText` | file |
| `House` | nav | `Info` | status |
| `LinkBreak` | action | `Link2` | action |
| `MagnifyingGlass` | action | `Margin` | layout |
| `Minus` | math | `Plus` | math |
| `Question` | status | `Success` | status |
| `Trash` | action | `TriangleDown` | nav |
| `TriangleLeft` | nav | `TriangleRight` | nav |
| `TriangleUp` | nav | `Update` | action |
| `Upload` | action | `ZoomIn` | action |
| `ZoomOut` | action | | |

## Native DOM Events (on `<svg>`)

`onClick`, `onMouseDown`, `onMouseUp`, `onMouseEnter`, `onMouseLeave`, `onFocus`, `onBlur`.
