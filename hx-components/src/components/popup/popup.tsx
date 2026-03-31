// @ts-expect-error import React
import React, {type ReactNode, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import type {AbsolutePosition, RectRange} from '../../types';
import {computeGapToViewportEdges, interposeToChildren} from '../../utils';
import {type PopupRect, useHxPopupContext} from './popup-provider';

/**
 * Popup container component props
 */
export interface HxPopupProps {
	/** Z-index for the popup container */
	zIndex: number;
	/** Minimum gap between popup edge and viewport boundary */
	gapToEdge: number;

	/** Content to render inside the popup */
	children: ReactNode;
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

/**
 * Popup container component that handles positioning, animations, and viewport boundary detection
 * Automatically positions itself relative to the trigger element while staying within viewport bounds
 */
export const HxPopup = (props: HxPopupProps) => {
	const {
		zIndex, gapToEdge,
		children
	} = props;

	const context = useHxContext();
	const popupContext = useHxPopupContext();
	const ref = useRef<HTMLDivElement | null>(null);
	const renderStateRef = useRef<RenderState>('hidden');
	const triggerRectRef = useRef<PopupRect | undefined>();
	const domRectRef = useRef<AbsolutePosition | undefined>();

	/**
	 * Handle focus element check requests to determine if an element is inside this popup
	 */
	useEffect(() => {
		const onCheckFocusElement = (triggerEl: HTMLElement, callback: (inPopup: boolean) => void) => {
			callback(triggerEl.closest('div[data-hx-popup]') == ref.current);
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
				const dom = ref.current;
				const {width, height} = dom?.getBoundingClientRect() ?? {width: 0, height: 0};
				const triggerRect = triggerRectRef.current!;
				const {
					top: topGap, bottom: bottomGap, left: leftGap, right: rightGap
				} = computeGapToViewportEdges(triggerRect!, gapToEdge);

				// Position popup below trigger if there's enough space, otherwise above
				const atBottom = bottomGap >= height || topGap <= height;
				// Align left edge with trigger if there's enough space, otherwise align right edge
				const startFromLeft = rightGap + triggerRect.width >= width || leftGap + triggerRect.width <= width;

				domRectRef.current = {
					top: atBottom ? (triggerRect.top + triggerRect.height + 2) : (void 0),
					bottom: atBottom ? (void 0) : ((window.innerHeight || document.documentElement.clientHeight) - triggerRect.top + 2),
					left: startFromLeft ? triggerRect.left : (void 0),
					right: startFromLeft ? (void 0) : ((window.innerWidth || document.documentElement.clientWidth) - triggerRect.right),
					height,
					width
				};

				renderStateRef.current = 'prepared';
				if (dom != null) {
					dom.setAttribute('data-hx-popup-state', 'prepared');
					const domRect = domRectRef.current!;
					dom.style.height = '';
					dom.style.width = domRect.width == null ? '' : (domRect.width + 'px');
					dom.style.top = domRect.top == null ? '' : (domRect.top + 'px');
					dom.style.bottom = domRect.bottom == null ? '' : (domRect.bottom + 'px');
					dom.style.left = domRect.left == null ? '' : (domRect.left + 'px');
					dom.style.right = domRect.right == null ? '' : (domRect.right + 'px');
				}

				// Animate to active state after next frame to allow CSS transitions to work
				requestAnimationFrame(() => {
					const dom = ref.current;
					if (dom != null && renderStateRef.current === 'prepared') {
						renderStateRef.current = 'active';
						dom.setAttribute('data-hx-popup-state', 'active');
						dom.style.height = height + 'px';
					}
				});
				break;
			}
		}
		// eslint-disable-next-line react-hooks/refs,react-hooks/exhaustive-deps
	}, [gapToEdge, renderStateRef.current]);

	/**
	 * Register popup show/hide event listeners
	 */
	useEffect(() => {
		/**
		 * Handle popup show event: start position calculation and show animation
		 */
		const onShow = <E extends HTMLElement>(triggerEl: E, popupRectRange: RectRange) => {
			const rect = triggerEl.getBoundingClientRect();
			renderStateRef.current = 'prepare';
			triggerRectRef.current = rect;
			// always use the maximum value of given min width and trigger element width
			triggerRectRef.current.minWidth = Math.max(popupRectRange.minWidth ?? rect.width, rect.width);
			triggerRectRef.current.maxHeight = popupRectRange.maxHeight;
			context.forceUpdate();
		};

		/**
		 * Handle popup hide event: play exit animation and clean up styles
		 */
		const onHide = () => {
			const dom = ref.current;
			if (dom != null) {
				dom.style.height = '';
			}
			// Wait for transition to complete before fully hiding
			const onTransitionEnd = () => {
				renderStateRef.current = 'hidden';
				const dom = ref.current;
				dom?.setAttribute('data-hx-popup-state', 'hidden');
				context.forceUpdate();
				// Reset all positioning styles
				if (dom != null) {
					dom.style.height = '';
					dom.style.width = '';
					dom.style.top = '';
					dom.style.bottom = '';
					dom.style.left = '';
					dom.style.right = '';
				}
			};
			dom?.addEventListener('transitionend', onTransitionEnd, {once: true});
			// guard to clear event listener, to avoid memory leak
			// all transition must be finished in 1s
			// and try to clear the event listener in case of event never triggered for reason
			setTimeout(() => {
				ref.current?.removeEventListener('transitionend', onTransitionEnd);
			}, 1000);

			renderStateRef.current = 'hide';
			dom?.setAttribute('data-hx-popup-state', 'hide');
		};

		popupContext.onShow(onShow);
		popupContext.onHide(onHide);
		return () => {
			popupContext.offShow(onShow);
			popupContext.offHide(onHide);
		};
	}, [context, popupContext]);

	// Size constraints from popup rect range
	// eslint-disable-next-line react-hooks/refs
	const {minWidth, maxWidth, minHeight, maxHeight} = triggerRectRef.current ?? {};

	// Always render the popup container (even when hidden) to support preloading data
	// This allows data fetching and state management to work even before the popup is opened
	return <div data-hx-popup="" role="popup"
		// eslint-disable-next-line react-hooks/refs
		        data-hx-popup-state={renderStateRef.current}
		        style={{zIndex, minWidth, maxWidth, minHeight, maxHeight}}
		        ref={ref}>
		{/* eslint-disable-next-line react-hooks/refs */}
		{interposeToChildren({visible: renderStateRef.current !== 'hidden'}, children)}
	</div>;
};
