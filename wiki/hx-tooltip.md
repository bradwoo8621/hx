# Tooltip

An accessory — not a standalone component — that any component accepting common props can attach via the shared `tooltip` prop. Supports 12 placement positions, viewport-aware flip and RTL mirroring. Rendered in a portal by `HxTooltipProvider`, which `HxContextProvider` already includes.

## Usage

Any component accepting common props can attach a `tooltip` prop; the hover wiring is handled automatically by `usePropsToDomExpose`.

```tsx
// Plain string content, default position 'top'
<HxButton text="Hover" tooltip="A short hint" />

// Explicit position as an object
<HxButton text="Hover" tooltip={{ content: 'Below the button', position: 'bottom' }} />
```

## Positions

`HxTooltipPosition` — 12 placements:

| Family | Positions |
|--------|-----------|
| Top | `top` `top-left` `top-right` |
| Bottom | `bottom` `bottom-left` `bottom-right` |
| Left | `left` `left-top` `left-bottom` |
| Right | `right` `right-top` `right-bottom` |

If the requested position has no room, the tooltip flips once to its opposite (`top`↔`bottom`, `left`↔`right`); when neither fits it stays at the requested position. Top/bottom variants check only vertical room, and left/right variants only horizontal room.

## Context API

Components that need full control can use the tooltip context (provided by `HxTooltipProvider` or nested inside `HxContextProvider`).

```tsx
const TooltipDemo = () => {
	const tooltip = useHxTooltip();
	const handleRef = useRef<HxTooltipInstanceHandle | undefined>(void 0);

	const show = (ev: MouseEvent<HTMLElement>) => {
		tooltip.show(
			{targetEl: ev.currentTarget, props: {content: 'Hello', position: 'top'}},
			handle => { handleRef.current = handle; }
		);
	};
	const hide = () => {
		if (handleRef.current != null) {
			tooltip.hide(handleRef.current);
			handleRef.current = (void 0);
		}
	};

	return <div onMouseEnter={show} onMouseLeave={hide}>Hover me</div>;
};
```

## Configuration

`configHxTooltip` adjusts the global defaults:

| Setting | Default | Notes |
|---------|---------|-------|
| `zIndex` | `1500` | min 15 |
| `showDelay` | `100` | ms, min 30 |
| `paddingX` / `paddingY` | `'sm'` / `'xs'` | design-system padding tokens |
| `arrowSize` | `8` | px, min 0 |
| `minTriggerSize` | `40` | px, min 0; guides shoulder-aligned arrows |
| `animationGapSize` | `16` | px, min 0; gap in the ready/located motion |
| `gapToEdge` | `0` | px, min 0; minimum distance to the viewport edge |
