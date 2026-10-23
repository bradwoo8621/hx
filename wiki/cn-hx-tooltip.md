# Tooltip

一种附属物（非独立组件），任何接受公共 props 的组件都能通过共享的 `tooltip` prop 附加。支持 12 种放置位置、视口感知翻转与 RTL 镜像。由 `HxTooltipProvider` 渲染在 portal 中，`HxContextProvider` 已内置该 Provider。

## 用法

任何接受公共 props 的组件都可以通过 `tooltip` prop 附加提示，悬停接线由 `usePropsToDomExpose` 自动完成。

```tsx
// 纯字符串内容，默认位置 'top'
<HxButton text="Hover" tooltip="A short hint" />

// 用对象显式指定位置
<HxButton text="Hover" tooltip={{ content: 'Below the button', position: 'bottom' }} />
```

## 位置

`HxTooltipPosition` —— 共 12 种：

| 系列 | 位置 |
|------|------|
| Top | `top` `top-left` `top-right` |
| Bottom | `bottom` `bottom-left` `bottom-right` |
| Left | `left` `left-top` `left-bottom` |
| Right | `right` `right-top` `right-bottom` |

若请求的位置空间不足，提示会向其相反方向翻转一次（`top`↔`bottom`、`left`↔`right`）；两者都放不下时保持请求的位置。Top/Bottom 系列只校验纵向空间，Left/Right 系列只校验横向空间。

## Context API

需要完全掌控的组件可以使用工具提示上下文（由 `HxTooltipProvider` 提供，或嵌套在 `HxContextProvider` 内）。

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

## 配置

`configHxTooltip` 用于调整全局默认值：

| 设置 | 默认值 | 说明 |
|------|--------|------|
| `zIndex` | `1500` | 最低 15 |
| `showDelay` | `100` | 毫秒，最低 30 |
| `paddingX` / `paddingY` | `'sm'` / `'xs'` | 设计系统内边距 token |
| `arrowSize` | `8` | 像素，最低 0 |
| `minTriggerSize` | `40` | 像素，最低 0；用于引导肩部对齐的箭头 |
| `animationGapSize` | `16` | 像素，最低 0；ready/located 位移的间隙 |
| `gapToEdge` | `0` | 像素，最低 0；到视口边缘的最小距离 |
