// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {useDelayedFunc, usePropsToDomExpose} from '../../hooks';
import type {HxAbsolutePosition} from '../../types';
import {DOMUtils, type GapsToEdge, HxDataPropToAttrValueComputer} from '../../utils';
import {useHxPopupInternalContext} from './popup-internal-context';
import {type HxPopupRenderOptions, useHxPopup} from './popup-provider';
import type {HxPopupProps} from './types';

/**
 * Popup rendering state machine states
 * - hidden: Popup is completely hidden and not visible
 * - prepare: About to show, calculating position and dimensions
 * - prepared: Position calculated, ready to animate in
 * - active: Popup is fully visible and interactive
 * - hide: In process of hiding, playing exit animation
 */
type RenderState = 'hidden' | 'prepare' | 'prepared' | 'active' | 'hide';
type TriggerState = Required<HxAbsolutePosition> & HxPopupRenderOptions & { el: HTMLElement };

const computeTriggerState = (triggerEl: HTMLElement, options: HxPopupRenderOptions): TriggerState => {
	const rect = triggerEl.getBoundingClientRect();
	return {
		el: triggerEl,
		top: rect.top,
		bottom: rect.bottom,
		left: rect.left,
		right: rect.right,
		width: rect.width,
		height: rect.height,
		// always use the maximum value of given min width and trigger element width
		minWidth: Math.max(options.minWidth ?? rect.width, rect.width),
		maxWidth: options.maxWidth,
		minHeight: options.minHeight,
		maxHeight: options.maxHeight,

		position: options.position,
		alignTo: options.alignTo
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
	triggerState: TriggerState, popup: HTMLElement | null | undefined,
	gapsToEdge: GapsToEdge, sameWidthAtMinimum: boolean
): HxAbsolutePosition => {
	const {width, height} = popup?.getBoundingClientRect() ?? {width: 0, height: 0};
	// Position popup below trigger if there's enough space, otherwise above
	let atBottom: boolean;
	if (triggerState.position === 'top') {
		atBottom = false;
	} else if (triggerState.position === 'bottom') {
		atBottom = true;
	} else {
		atBottom = gapsToEdge.bottom >= height || gapsToEdge.top <= height;
	}
	// check the direction of trigger
	const ltr = triggerState.el == null ? true : getComputedStyle(triggerState.el).direction !== 'rtl';
	let startFromLeft = true;
	if (ltr) {
		if (triggerState.alignTo === 'left') {
			startFromLeft = true;
		} else if (triggerState.alignTo === 'right') {
			startFromLeft = false;
		} else {
			// Align left edge with trigger if there's enough space, otherwise align right edge
			startFromLeft = gapsToEdge.right + triggerState.width >= width || gapsToEdge.left + triggerState.width <= width;
		}
	} else {
		if (triggerState.alignTo === 'left') {
			startFromLeft = false;
		} else if (triggerState.alignTo === 'right') {
			startFromLeft = true;
		} else {
			// Align right edge with trigger if there's enough space, otherwise align left edge
			if (gapsToEdge.left + triggerState.width >= width) {
				// enough space when align to right
				startFromLeft = false;
			} else if (gapsToEdge.right + triggerState.width < width) {
				// no enough space when align to left
				startFromLeft = false;
			}
		}
	}

	return {
		top: atBottom ? (triggerState.top + triggerState.height + 2) : (void 0),
		bottom: atBottom ? (void 0) : ((window.innerHeight || document.documentElement.clientHeight) - triggerState.top + 2),
		left: startFromLeft ? triggerState.left : (void 0),
		right: startFromLeft ? (void 0) : ((window.innerWidth || document.documentElement.clientWidth) - triggerState.right),
		height,
		// always make sure the width of popup at least same as the trigger
		width: sameWidthAtMinimum ? Math.max(width, triggerState.width) : width
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
	const popupContext = useHxPopup();
	const internalContext = useHxPopupInternalContext();
	const ref = useRef<HTMLDivElement | null>(null);
	const renderStateRef = useRef<RenderState>('hidden');
	const triggerStateRef = useRef<TriggerState | undefined>();
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
				const triggerState = triggerStateRef.current!;
				const gapsToEdge = DOMUtils.computeGapToViewportEdges(triggerState!, gapToEdge);
				domRectRef.current = computeDomPosition(triggerState, ref.current, gapsToEdge, sameWidthAtMinimum);
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
		const onRelayout = <E extends HTMLElement>(triggerEl: E, options: HxPopupRenderOptions) => {
			delay('relayout', () => {
				if (renderStateRef.current !== 'active') {
					return;
				}
				const dom = ref.current;
				if (dom == null) {
					return;
				}

				triggerStateRef.current = computeTriggerState(triggerEl, options);
				const triggerState = triggerStateRef.current;
				const gapsToEdge = DOMUtils.computeGapToViewportEdges(triggerState, gapToEdge);
				domRectRef.current = computeDomPosition(triggerState, ref.current, gapsToEdge, sameWidthAtMinimum);
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

		popupContext.onRelayout(onRelayout);
		popupContext.onHide(onHide);
		return () => {
			popupContext.offRelayout(onRelayout);
			popupContext.offHide(onHide);
		};
	}, [gapToEdge, sameWidthAtMinimum, context, popupContext, delay]);
	useEffect(() => {
		// only execute after mount
		/**
		 * Handle popup show event: start position calculation and show animation
		 */
		internalContext.readyToShow(<E extends HTMLElement>(triggerEl: E, options: HxPopupRenderOptions) => {
			renderStateRef.current = 'prepare';
			triggerStateRef.current = computeTriggerState(triggerEl, options);
			// to prepare the content
			context.forceUpdate();
		});
	}, [context, internalContext]);
	useEffect(() => {
		// when render state back to hidden, invoke hide completed event
		if (renderStateRef.current === 'hidden') {
			internalContext.hideCompleted();
		}
		// eslint-disable-next-line react-hooks/refs, react-hooks/exhaustive-deps
	}, [internalContext, renderStateRef.current]);

	// Size constraints from popup rect range
	// eslint-disable-next-line react-hooks/refs
	const {minWidth, maxWidth, minHeight, maxHeight} = triggerStateRef.current ?? {};

	const restProps = usePropsToDomExpose(rest, (void 0), context, {
		key: 'HxPopup'
	});

	return <div {...restProps} data-hx-popup="" role="popup"
		// eslint-disable-next-line react-hooks/refs
		        data-hx-popup-state={renderStateRef.current}
		        style={{zIndex, minWidth: sameWidthAtMinimum ? minWidth : (void 0), maxWidth, minHeight, maxHeight}}
		        ref={ref}>
		{/* eslint-disable-next-line react-hooks/refs */}
		{DOMUtils.interposeToChildren({visible: renderStateRef.current !== 'hidden'}, children)}
	</div>;
};

HxDataPropToAttrValueComputer.create('HxPopup').register();
