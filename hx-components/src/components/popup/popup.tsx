// @ts-expect-error import React
import React, {type ReactNode, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {useDelayedFunc} from '../../hooks';
import type {HxAbsolutePosition, HxRectRange} from '../../types';
import {DOMUtils, type GapsToEdge} from '../../utils';
import {useHxPopupContext} from './popup-provider';

/**
 * Popup container component props
 */
export interface HxPopupProps {
	/** Z-index for the popup container */
	zIndex: number;
	/** Minimum gap between popup edge and viewport boundary */
	gapToEdge: number;
	/** Popup with at minimum same width with trigger */
	sameWidthAtMinimum: boolean;

	/** Content to render inside the popup */
	children: ReactNode;
	[key: `data-${string}`]: string;
}

/**
 * Popup rendering state machine states
 * - hidden: Popup is completely hidden and not visible
 * - prepare: About to show, calculating position and dimensions
 * - prepared: Position calculated, ready to animate in
 * - active: Popup is fully visible and interactive
 * - hide: In process of hiding, playing exit animation
 */
type RenderState = 'hidden' | 'prepare' | 'prepared' | 'active' | 'hide';
type TriggerRect = Required<HxAbsolutePosition> & HxRectRange;

const copyRect = (rect: DOMRect, popupRectRange: HxRectRange) => {
	return {
		top: rect.top,
		bottom: rect.bottom,
		left: rect.left,
		right: rect.right,
		width: rect.width,
		height: rect.height,
		// always use the maximum value of given min width and trigger element width
		minWidth: Math.max(popupRectRange.minWidth ?? rect.width, rect.width),
		maxWidth: popupRectRange.maxWidth,
		minHeight: popupRectRange.minHeight,
		maxHeight: popupRectRange.maxHeight
	};
};

const copyRectToDomStyle = (
	rect: HxAbsolutePosition | null | undefined, dom: HTMLElement, ignoreHeight: boolean, avoidTransition: boolean
) => {
	if (rect == null) {
		return;
	}

	if (avoidTransition) {
		dom.setAttribute('data-hx-popup-avoid-transition', '');
	} else {
		dom.removeAttribute('data-hx-popup-avoid-transition');
	}
	if (ignoreHeight) {
		dom.style.height = '';
	} else {
		dom.style.height = rect.height == null ? '' : (rect.height + 'px');
	}
	dom.style.width = rect.width == null ? '' : (rect.width + 'px');
	dom.style.top = rect.top == null ? '' : (rect.top + 'px');
	dom.style.bottom = rect.bottom == null ? '' : (rect.bottom + 'px');
	dom.style.left = rect.left == null ? '' : (rect.left + 'px');
	dom.style.right = rect.right == null ? '' : (rect.right + 'px');
};

const clearDomRect = (dom: HTMLElement | null | undefined) => {
	if (dom == null) {
		return;
	}

	dom.style.height = '';
	dom.style.width = '';
	dom.style.top = '';
	dom.style.bottom = '';
	dom.style.left = '';
	dom.style.right = '';
};

const computeDomPosition = (
	triggerRect: TriggerRect, popup: HTMLElement | null | undefined,
	gapsToEdge: GapsToEdge, sameWidthAtMinimum: boolean
): HxAbsolutePosition => {
	const {width, height} = popup?.getBoundingClientRect() ?? {width: 0, height: 0};
	// Position popup below trigger if there's enough space, otherwise above
	const atBottom = gapsToEdge.bottom >= height || gapsToEdge.top <= height;
	// Align left edge with trigger if there's enough space, otherwise align right edge
	const startFromLeft = gapsToEdge.right + triggerRect.width >= width || gapsToEdge.left + triggerRect.width <= width;

	return {
		top: atBottom ? (triggerRect.top + triggerRect.height + 2) : (void 0),
		bottom: atBottom ? (void 0) : ((window.innerHeight || document.documentElement.clientHeight) - triggerRect.top + 2),
		left: startFromLeft ? triggerRect.left : (void 0),
		right: startFromLeft ? (void 0) : ((window.innerWidth || document.documentElement.clientWidth) - triggerRect.right),
		height,
		// always make sure the width of popup at least same as the trigger
		width: sameWidthAtMinimum ? Math.max(width, triggerRect.width) : width
	};
};
/**
 * Popup container component that handles positioning, animations, and viewport boundary detection
 * Automatically positions itself relative to the trigger element while staying within viewport bounds
 */
export const HxPopup = (props: HxPopupProps) => {
	const {
		zIndex, gapToEdge, sameWidthAtMinimum,
		children, ...rest
	} = props;

	const context = useHxContext();
	const popupContext = useHxPopupContext();
	const ref = useRef<HTMLDivElement | null>(null);
	const renderStateRef = useRef<RenderState>('hidden');
	const triggerRectRef = useRef<TriggerRect | undefined>();
	const domRectRef = useRef<HxAbsolutePosition | undefined>();
	const {delay} = useDelayedFunc(10);

	/**
	 * Handle focus element check requests to determine if an element is inside this popup
	 */
	useEffect(() => {
		const onCheckFocusElement = (triggerEl: HTMLElement, callback: (inPopup: boolean) => void) => {
			callback(!!ref.current?.contains(triggerEl));
		};
		popupContext.onCheckFocusElement(onCheckFocusElement);
		return () => {
			popupContext.offCheckFocusElement(onCheckFocusElement);
		};
	}, [popupContext]);

	/**
	 * Handle position calculation and state transitions for popup show animation
	 */
	useEffect(() => {
		switch (renderStateRef.current) {
			case 'prepare': {
				const triggerRect = triggerRectRef.current!;
				const gapsToEdge = DOMUtils.computeGapToViewportEdges(triggerRect!, gapToEdge);
				domRectRef.current = computeDomPosition(triggerRect, ref.current, gapsToEdge, sameWidthAtMinimum);
				// save height
				const height = domRectRef.current.height!;

				const dom = ref.current;
				renderStateRef.current = 'prepared';
				if (dom != null) {
					copyRectToDomStyle(domRectRef.current, dom, true, false);
					dom.setAttribute('data-hx-popup-state', 'prepared');
				}

				// Animate to active state after next frame to allow CSS transitions to work
				requestAnimationFrame(() => {
					const dom = ref.current;
					if (dom != null && renderStateRef.current === 'prepared') {
						renderStateRef.current = 'active';
						dom.style.height = height + 'px';
						// Wait for transition to complete before fully hiding
						const onTransitionEnd = () => {
							dom.style.height = '';
						};
						DOMUtils.safeOnTransitionEndOnce(dom, onTransitionEnd);
						dom.setAttribute('data-hx-popup-state', 'active');
					}
				});
				break;
			}
		}
		// eslint-disable-next-line react-hooks/refs,react-hooks/exhaustive-deps
	}, [gapToEdge, sameWidthAtMinimum, renderStateRef.current]);

	/**
	 * Register popup show/hide event listeners
	 */
	useEffect(() => {
		/**
		 * Handle popup show event: start position calculation and show animation
		 */
		const onShow = <E extends HTMLElement>(triggerEl: E, popupRectRange: HxRectRange) => {
			const rect = triggerEl.getBoundingClientRect();
			renderStateRef.current = 'prepare';
			triggerRectRef.current = copyRect(rect, popupRectRange);
			// to prepare the content
			context.forceUpdate();
		};

		const onRelayout = <E extends HTMLElement>(triggerEl: E, popupRectRange: HxRectRange) => {
			delay('relayout', () => {
				if (renderStateRef.current !== 'active') {
					return;
				}
				const dom = ref.current;
				if (dom == null) {
					return;
				}

				const rect = triggerEl.getBoundingClientRect();
				triggerRectRef.current = copyRect(rect, popupRectRange);
				const triggerRect = triggerRectRef.current;
				const gapsToEdge = DOMUtils.computeGapToViewportEdges(triggerRect, gapToEdge);
				domRectRef.current = computeDomPosition(triggerRect, ref.current, gapsToEdge, sameWidthAtMinimum);
				copyRectToDomStyle(domRectRef.current, dom, false, true);
			});
		};

		/**
		 * Handle popup hide event: play exit animation and clean up styles
		 */
		const onHide = () => {
			if (renderStateRef.current === 'hide' || renderStateRef.current === 'hidden') {
				return;
			}

			const dom = ref.current;
			if (dom != null) {
				// the height style is cleared after active transition end
				dom.style.height = dom.getBoundingClientRect().height + 'px';
			}
			requestAnimationFrame(() => {
				const dom = ref.current;
				if (dom != null) {
					dom.style.height = '';
					// Wait for transition to complete before fully hiding
					const onTransitionEnd = () => {
						renderStateRef.current = 'hidden';
						const dom = ref.current;
						dom?.setAttribute('data-hx-popup-state', 'hidden');
						// to clear the content
						context.forceUpdate();
						// Reset all positioning styles
						clearDomRect(dom);
					};
					DOMUtils.safeOnTransitionEndOnce(dom, onTransitionEnd);

					renderStateRef.current = 'hide';
					dom?.setAttribute('data-hx-popup-state', 'hide');
				}
			});
		};

		popupContext.onShow(onShow);
		popupContext.onRelayout(onRelayout);
		popupContext.onHide(onHide);
		return () => {
			popupContext.offShow(onShow);
			popupContext.offRelayout(onRelayout);
			popupContext.offHide(onHide);
		};
	}, [gapToEdge, sameWidthAtMinimum, context, popupContext, delay]);

	// Size constraints from popup rect range
	// eslint-disable-next-line react-hooks/refs
	const {minWidth, maxWidth, minHeight, maxHeight} = triggerRectRef.current ?? {};

	// Always render the popup container (even when hidden) to support preloading data
	// This allows data fetching and state management to work even before the popup is opened
	return <div {...rest} data-hx-popup="" role="popup"
		// eslint-disable-next-line react-hooks/refs
		        data-hx-popup-state={renderStateRef.current}
		        style={{zIndex, minWidth, maxWidth, minHeight, maxHeight}}
		        ref={ref}>
		{/* eslint-disable-next-line react-hooks/refs */}
		{DOMUtils.interposeToChildren({visible: renderStateRef.current !== 'hidden'}, children)}
	</div>;
};
