import {type ModelPath} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type PropsWithoutRef,
	type ReactElement,
	type RefAttributes,
	type RefObject,
	useEffect,
	useRef
} from 'react';
import {createPortal} from 'react-dom';
import {useHxContext} from '../../contexts';
import {useDualRef} from '../../hooks';
import type {
	AbsolutePosition,
	HxBorderRadius,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxPadding,
	WidthConstrainedProps
} from '../../types';
import {
	computeGapToViewportEdges,
	computeTransitionAndAnimation,
	exposePropsToDOM,
	interposeToChildren,
	positionWhenCan,
	resolveChildModel
} from '../../utils';
import {HxWithPopupDefaults} from '../with-popup/defaults';
import {HxOverlayDefaults} from './defaults';
import {BodyScrollLock} from './scroll-lock';

/**
 * Overlay display mode
 * - float: Free-floating overlay (toast, notification), positioned absolutely, no background lock
 * - modal: Modal dialog, centered, background scroll locked, prevents interaction with page content
 * - popup: Context menu/dropdown, positioned relative to trigger element
 */
export type HxOverlayMode = 'float' | 'modal' | 'popup';
/**
 * Transition animation type for overlay show/hide
 * - opacity: Simple fade in/out transition
 * - custom: User provides custom animation via CSS
 */
export type HxOverlayTransition = 'opacity' | 'custom';
/** Overlay container border radius size from design system */
export type HxOverlayBorderRadius = HxBorderRadius;
/** Horizontal padding size for overlay container */
export type HxOverlayPaddingX = HxPadding;
/** Top padding size for overlay container */
export type HxOverlayPaddingT = HxPadding;
/** Bottom padding size for overlay container */
export type HxOverlayPaddingB = HxPadding;

/**
 * Extended props for HxOverlay component
 */
export interface HxExtOverlayProps<T extends object> extends WidthConstrainedProps {
	/** Overlay display mode (float/modal/popup) - FIXED after component initialization */
	mode: HxOverlayMode;
	/** Whether to prevent document scrolling when overlay is open (automatically true for modal mode) */
	avoidDocumentScroll?: boolean;
	/** Z-index for the overlay portal container */
	zIndex?: number;
	/** It only takes effect when the mode is popup. */
	gapToEdge?: number;
	/** Transition animation type - use 'custom' to implement your own CSS animations */
	transition?: HxOverlayTransition;
	/** Whether to show a border around the overlay container */
	border?: boolean;
	/** Border radius size for the container corners (uses design system sizes: none/sm/md/lg/xl) */
	borderRadius?: HxOverlayBorderRadius;
	/** Horizontal (left and right) padding for the container */
	paddingX?: HxOverlayPaddingX;
	/** Top padding for the container */
	paddingT?: HxOverlayPaddingT;
	/** Bottom padding for the container */
	paddingB?: HxOverlayPaddingB;
	/** Controlled visibility state - set to true/false to show/hide the overlay */
	visible: boolean;
	triggerRef?: RefObject<HTMLElement>;
	/** Optional reactive model for automatic data binding to child components */
	$model?: HxObject<T>,
	/**
	 * Path to nested reactive object on $model. If specified, this nested object
	 * will be automatically passed as $model prop to all direct child components,
	 * simplifying data binding in nested layouts.
	 */
	$field?: ModelPath<T>;
}

/** HTML attributes that are omitted from base props to avoid conflicts */
export type OmittedOverlayHTMLProps = HxOmittedAttributes;

/** Complete props type for HxOverlay including HTML element props */
export type HxOverlayProps<T extends object> = PropsWithoutRef<
	& HxExtOverlayProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedOverlayHTMLProps, T>
>;

/** Component type definition for HxOverlay */
export type HxOverlayType = <T extends object>(
	props: HxOverlayProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Overlay visibility state machine states
 * - prepared: Overlay is not rendered (hidden state)
 * - mounted: Overlay is rendered to DOM but not yet visible (pre-animation state)
 * - active: Overlay is fully visible and interactive
 * - unmounting: Overlay is playing exit animation before being removed from DOM
 */
type HxOverlayVisibleMode = 'prepared' | 'mounted' | 'active' | 'unmounting';

/**
 * Stores visibility state machine information
 */
interface HxOverlayVisibleRef {
	/** Current controlled visibility prop value */
	visible: boolean;
	/** Previous state in the state machine */
	last: HxOverlayVisibleMode;
	/** Current state in the state machine */
	now: HxOverlayVisibleMode;
}

interface OverlayPosition extends AbsolutePosition {
	at?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * popup can be on top or bottom of trigger only
 */
const computePopupPosition = (
	triggerEl: HTMLElement, overlayEl: HTMLElement, gapToEdge: number
): OverlayPosition => {
	const position: OverlayPosition = {};

	const {top, bottom, left, right, rect: triggerRect} = computeGapToViewportEdges(triggerEl, gapToEdge);
	const overlayRect = overlayEl.getBoundingClientRect();
	if (overlayRect.height < bottom || overlayRect.height > top) {
		// on bottom of trigger
		position.top = triggerRect.top + triggerRect.height;
		position.at = 'bottom';
	} else {
		// on top of trigger
		position.top = triggerRect.top - overlayRect.height;
		position.at = 'top';
	}

	if (overlayRect.width < triggerRect.width + right || overlayRect.width > left + triggerRect.width) {
		// left from left side of trigger
		position.left = triggerRect.left;
	} else {
		// right from right side of trigger
		position.left = triggerRect.left + triggerRect.width - overlayRect.width;
	}

	return position;
};
const forcePositionWhenCan = (el: HTMLElement, position?: OverlayPosition) => {
	if (position == null || Object.keys(position).length === 0) {
		return;
	}

	if (position.top != null) {
		if (position.at === 'top') {
			el.style.setProperty('--popup-top-start', (position.top - 20) + 'px');
		} else if (position.at === 'bottom') {
			el.style.setProperty('--popup-top-start', (position.top + 20) + 'px');
		}
		el.style.setProperty('--popup-top-end', position.top + 'px');
	}
	if (position.bottom != null) {
		el.style.bottom = position.bottom + 'px';
	}
	if (position.left != null) {
		el.style.left = position.left + 'px';
	}
	if (position.right != null) {
		el.style.right = position.right + 'px';
	}
};
/**
 * HxOverlay - Advanced popup/modal/tooltip component with React Portal support
 *
 * Features:
 * - Renders via React Portal to document body to avoid z-index and overflow issues
 * - Three display modes: float (notifications), modal (dialogs), popup (context menus)
 * - Automatic transition/animation detection with smooth enter/exit transitions
 * - Built-in scroll locking for modal mode (prevents background scrolling)
 * - Automatic $model propagation to child components for easy form binding
 * - Design system compliant styling with padding, border, and borderRadius props
 * - Multi-layer overlay support with nested overlay handling
 *
 * @example
 * ```tsx
 * <HxOverlay
 *   mode="modal"
 *   visible={isOpen}
 *   onClose={() => setIsOpen(false)}
 * >
 *   <div>Modal content</div>
 * </HxOverlay>
 * ```
 */
export const HxOverlay =
	forwardRef(<T extends object>(props: HxOverlayProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			mode, avoidDocumentScroll = HxOverlayDefaults.avoidDocumentScroll, zIndex = HxOverlayDefaults.zIndex,
			gapToEdge = HxWithPopupDefaults.gapToEdge,
			transition,
			border = false, borderRadius = 'none',
			paddingX = 'none', paddingT = 'none', paddingB = 'none',
			visible, triggerRef,
			children,
			...rest
		} = props;

		/** HX context providing theme, i18n, and forceUpdate functionality */
		const context = useHxContext();
		const bodyScrollLockRef = useRef(false);
		/** Stores the initial mode (fixed after component mount to prevent runtime changes) */
		const fixedModeRef = useRef(mode);
		/** Stores the initial avoidDocumentScroll (fixed after component mount to prevent runtime changes) */
		const fixedAvoidDocumentScrollRef = useRef(avoidDocumentScroll);
		/** Visibility state machine state storage */
		const visibleRef = useRef<HxOverlayVisibleRef>(
			visible
				? {visible, last: 'active', now: 'active'} // Initialize visible if prop is true on mount
				: {visible, last: 'prepared', now: 'prepared'}); // Initialize hidden if prop is false on mount
		/** Dual ref supporting both callback refs and ref objects, forwarded to the overlay DOM element */
		const overlayRef = useDualRef(ref);
		const positionRef = useRef<OverlayPosition>({});

		/**
		 * Prevent mode changes after component initialization
		 * Mode is fixed at mount time to avoid inconsistent behavior
		 */
		useEffect(() => {
			if (mode !== fixedModeRef.current) {
				console.error(`HxOverlay mode[fixed=${fixedModeRef.current}, new=${mode}] cannot be changed, it is fixed after initialized, and new value assigned is ignored.`);
			}
			if (avoidDocumentScroll !== fixedAvoidDocumentScrollRef.current) {
				console.error(`HxOverlay avoidDocumentScroll[fixed=${fixedAvoidDocumentScrollRef.current}, new=${avoidDocumentScroll}] cannot be changed, it is fixed after initialized, and new value assigned is ignored.`);
			}
		}, [mode, avoidDocumentScroll]);

		/**
		 * Handle state machine transitions and side effects when visibility state changes
		 * Manages scroll locking/unlocking and DOM attribute updates for animations
		 */
		useEffect(() => {
			switch (visibleRef.current.now) {
				case 'prepared': {
					// When entering prepared state from any other state, unlock body scroll
					if (visibleRef.current.last !== 'prepared') {
						// transit from other, could be one of following:
						// - from mounted: Not yet actually displayed, it directly returns to prepared because the passed visible becomes false.
						// - from active: No transition or animation detected, skipping the animation phase and disappearing directly.
						// - from unmounting: Disappear with an animation phase, vanishing after the animation ends.
						// unlock body scroll
						if (bodyScrollLockRef.current) {
							bodyScrollLockRef.current = false;
							BodyScrollLock.unlock();
						}
						// clear the position
						positionRef.current = {};
					}
					break;
				}
				case 'mounted': {
					const shouldComputePopupPosition = fixedModeRef.current === 'popup' && triggerRef?.current != null;
					if (shouldComputePopupPosition) {
						positionRef.current = computePopupPosition(triggerRef.current, overlayRef.current!, gapToEdge);
						forcePositionWhenCan(overlayRef.current!, positionRef.current);
					}

					requestAnimationFrame(() => {
						// Overlay has been added to DOM, transition to active state and trigger enter animation
						visibleRef.current.last = 'mounted';
						visibleRef.current.now = 'active';
						// change attribute to control the transition or animation
						overlayRef.current!.setAttribute('data-hx-visible', 'active');

						// Lock body scroll for modal mode
						if (fixedModeRef.current === 'modal' || fixedAvoidDocumentScrollRef.current) {
							bodyScrollLockRef.current = true;
							BodyScrollLock.lock();
						}
					});
					break;
				}
				case 'active': {
					// If initial state was active (visible prop true on mount), lock scroll immediately
					// when transit from other, could be one of following, no need to lock scroll:
					// - from mounted: Normal case, it will not trigger side effect, so handled on trigger time. see above case.
					// - from unmounting: Not yet actually disappeared, it directly returns to active because the passed visible becomes true.
					// - from prepared: Never
					if (visibleRef.current.last === 'active') {
						if (fixedModeRef.current === 'modal' || fixedAvoidDocumentScrollRef.current) {
							bodyScrollLockRef.current = true;
							BodyScrollLock.lock();
						}
					}
					break;
				}
				case 'unmounting':
				default: {
					break;
				}
			}
			// eslint-disable-next-line react-hooks/refs
		}, [gapToEdge, overlayRef, triggerRef, visibleRef.current.now]);
		/**
		 * Handle changes to the controlled 'visible' prop
		 * Manages state machine transitions between visibility states
		 * Detects transition/animation durations for smooth exit animations
		 */
		useEffect(() => {
			if (visible) {
				visibleRef.current.visible = true;
				switch (visibleRef.current.now) {
					case 'prepared': {
						// Show overlay: transition from hidden to mounted (renders to DOM)
						visibleRef.current.last = 'prepared';
						visibleRef.current.now = 'mounted';
						context.forceUpdate();
						break;
					}
					case 'unmounting': {
						// Cancel exit animation: overlay was closing but got opened again
						visibleRef.current.last = 'unmounting';
						visibleRef.current.now = 'active';
						// change attribute to control the transition or animation
						overlayRef.current!.setAttribute('data-hx-visible', 'active');
						break;
					}
					case 'mounted':
					case 'active':
					default: {
						// Already visible or in process of showing - do nothing
						break;
					}
				}
			} else {
				visibleRef.current.visible = false;
				switch (visibleRef.current.now) {
					case 'mounted': {
						// Hide overlay before it even became visible - go directly to hidden
						visibleRef.current.last = 'mounted';
						visibleRef.current.now = 'prepared';
						context.forceUpdate();
						break;
					}
					case 'active': {
						// Start exit process: transition to unmounting state
						visibleRef.current.last = 'active';
						visibleRef.current.now = 'unmounting';

						// Detect transition/animation duration to know when to remove from DOM
						const {any, time} = computeTransitionAndAnimation(overlayRef.current!);
						if (any) {
							// Wait for animation to complete before hiding
							setTimeout(() => {
								if (visibleRef.current.now === 'unmounting') {
									visibleRef.current.last = 'unmounting';
									visibleRef.current.now = 'prepared';
									context.forceUpdate();
								}
							}, time);
							// Trigger exit animation via data attribute
							overlayRef.current!.setAttribute('data-hx-visible', 'unmounting');
						} else {
							// No animations - hide immediately
							visibleRef.current.last = 'active';
							visibleRef.current.now = 'prepared';
							context.forceUpdate();
						}
						break;
					}
					case 'prepared':
					case 'unmounting':
					default: {
						// Already hidden or in process of hiding - do nothing
					}
				}
			}
		}, [context, overlayRef, visible]);

		/**
		 * Render nothing when in 'prepared' state (hidden)
		 * This removes the overlay from the DOM entirely when not visible
		 */
		// eslint-disable-next-line react-hooks/refs
		if (visibleRef.current.now === 'prepared') {
			return null;
		}

		/** Resolve the nested model to pass to child components */
		const $modelToChild = resolveChildModel($model, $field);
		/** Process props to expose reactive values as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);
		// compute the position
		// eslint-disable-next-line react-hooks/refs
		restProps.style = positionWhenCan(positionRef.current, restProps.style);
		/** Whether document scrolling is allowed (used for backdrop styling) */
			// eslint-disable-next-line react-hooks/refs
		const documentScroll = fixedModeRef.current !== 'modal' && !fixedAvoidDocumentScrollRef.current;

		/**
		 * Render overlay via React Portal to document body
		 * This avoids z-index stacking issues and overflow constraints from parent elements
		 */
		return createPortal(<div data-hx-portal-root=""
		                         data-hx-theme={context.theme.current()}
		                         data-hx-language={context.language.current()}
		                         style={{zIndex}}>
				{/* Overlay backdrop element - styled via CSS based on mode */}
				<div data-hx-overlay-backdrop=""
					// eslint-disable-next-line react-hooks/refs
					 data-hx-overlay-backdrop-document-scroll={documentScroll}/>
				{/* Main overlay container element */}
				<div {...restProps}
				     data-hx-overlay=""
					// eslint-disable-next-line react-hooks/refs
					 data-hx-overlay-mode={fixedModeRef.current}
					 data-hx-overlay-transition={transition}
					 data-hx-overlay-border={border} data-hx-overlay-border-radius={borderRadius}
					 data-hx-overlay-padding-x={paddingX}
					 data-hx-overlay-padding-t={paddingT} data-hx-overlay-padding-b={paddingB}
					// eslint-disable-next-line react-hooks/refs
					 data-hx-visible={visibleRef.current.now}
					 ref={overlayRef}>
					{/* Automatically inject the resolved model into all direct child components */}
					{interposeToChildren({$model: $modelToChild}, children)}
				</div>
			</div>,
			document.body);
	}) as unknown as HxOverlayType;
// @ts-expect-error assign component name
HxOverlay.displayName = 'HxOverlay';
