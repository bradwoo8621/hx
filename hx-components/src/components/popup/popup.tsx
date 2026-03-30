import {type ModelPath} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type PropsWithoutRef,
	type ReactElement,
	type RefAttributes,
	useEffect,
	useRef
} from 'react';
import {createPortal} from 'react-dom';
import {useHxContext} from '../../contexts';
import {useDualRef} from '../../hooks';
import type {
	HxBorderRadius,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxPadding,
	WidthConstrainedProps
} from '../../types';
import {computeTransitionAndAnimation, exposePropsToDOM, interposeToChildren, resolveChildModel} from '../../utils';
import {HxPopupDefaults} from './defaults';
import {BodyScrollLock} from './scroll-lock';

/**
 * Popup display mode
 * - float: Free-floating popup (toast, notification), positioned absolutely, no background lock
 * - modal: Modal dialog, centered, background scroll locked, prevents interaction with page content
 * - popup: Context menu/dropdown, positioned relative to trigger element
 */
export type HxPopupMode = 'float' | 'modal' | 'popup';
/**
 * Transition animation type for popup show/hide
 * - opacity: Simple fade in/out transition
 * - custom: User provides custom animation via CSS
 */
export type HxPopupTransition = 'opacity' | 'custom';
/** Popup container border radius size from design system */
export type HxPopupBorderRadius = HxBorderRadius;
/** Horizontal padding size for popup container */
export type HxPopupPaddingX = HxPadding;
/** Top padding size for popup container */
export type HxPopupPaddingT = HxPadding;
/** Bottom padding size for popup container */
export type HxPopupPaddingB = HxPadding;

/**
 * Extended props for HxPopup component
 */
export interface HxExtPopupProps<T extends object> extends WidthConstrainedProps {
	/** Popup display mode (float/modal/popup) - FIXED after component initialization */
	mode: HxPopupMode;
	/** Whether to prevent document scrolling when popup is open (automatically true for modal mode) */
	avoidDocumentScroll?: boolean;
	/** Z-index for the popup portal container */
	zIndex?: number;
	/** Transition animation type - use 'custom' to implement your own CSS animations */
	transition?: HxPopupTransition;
	/** Whether to show a border around the popup container */
	border?: boolean;
	/** Border radius size for the container corners (uses design system sizes: none/sm/md/lg/xl) */
	borderRadius?: HxPopupBorderRadius;
	/** Horizontal (left and right) padding for the container */
	paddingX?: HxPopupPaddingX;
	/** Top padding for the container */
	paddingT?: HxPopupPaddingT;
	/** Bottom padding for the container */
	paddingB?: HxPopupPaddingB;
	/** Controlled visibility state - set to true/false to show/hide the popup */
	visible: boolean;
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
export type OmittedPopupHTMLProps = HxOmittedAttributes;

/** Complete props type for HxPopup including HTML element props */
export type HxPopupProps<T extends object> = PropsWithoutRef<
	& HxExtPopupProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedPopupHTMLProps, T>
>;

/** Component type definition for HxPopup */
export type HxPopupType = <T extends object>(
	props: HxPopupProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Popup visibility state machine states
 * - prepared: Popup is not rendered (hidden state)
 * - mounted: Popup is rendered to DOM but not yet visible (pre-animation state)
 * - active: Popup is fully visible and interactive
 * - unmounting: Popup is playing exit animation before being removed from DOM
 */
type HxPopupVisibleMode = 'prepared' | 'mounted' | 'active' | 'unmounting';

/**
 * Stores visibility state machine information
 */
interface HxPopupVisibleRef {
	/** Current controlled visibility prop value */
	visible: boolean;
	/** Previous state in the state machine */
	last: HxPopupVisibleMode;
	/** Current state in the state machine */
	now: HxPopupVisibleMode;
}

/**
 * HxPopup - Advanced popup/modal/tooltip component with React Portal support
 *
 * Features:
 * - Renders via React Portal to document body to avoid z-index and overflow issues
 * - Three display modes: float (notifications), modal (dialogs), popup (context menus)
 * - Automatic transition/animation detection with smooth enter/exit transitions
 * - Built-in scroll locking for modal mode (prevents background scrolling)
 * - Automatic $model propagation to child components for easy form binding
 * - Design system compliant styling with padding, border, and borderRadius props
 * - Multi-layer popup support with nested popup handling
 *
 * @example
 * ```tsx
 * <HxPopup
 *   mode="modal"
 *   visible={isOpen}
 *   onClose={() => setIsOpen(false)}
 * >
 *   <div>Modal content</div>
 * </HxPopup>
 * ```
 */
export const HxPopup =
	forwardRef(<T extends object>(props: HxPopupProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			mode,
			avoidDocumentScroll = HxPopupDefaults.avoidDocumentScroll,
			zIndex = HxPopupDefaults.zIndex,
			transition,
			border = false, borderRadius = 'none',
			paddingX = 'none', paddingT = 'none', paddingB = 'none',
			visible,
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
		const visibleRef = useRef<HxPopupVisibleRef>(
			visible
				? {visible, last: 'active', now: 'active'} // Initialize visible if prop is true on mount
				: {visible, last: 'prepared', now: 'prepared'}); // Initialize hidden if prop is false on mount
		/** Dual ref supporting both callback refs and ref objects, forwarded to the popup DOM element */
		const popupRef = useDualRef(ref);

		/**
		 * Prevent mode changes after component initialization
		 * Mode is fixed at mount time to avoid inconsistent behavior
		 */
		useEffect(() => {
			if (mode !== fixedModeRef.current) {
				console.error(`HxPopup mode[fixed=${fixedModeRef.current}, new=${mode}] cannot be changed, it is fixed after initialized, and new value assigned is ignored.`);
			}
			if (avoidDocumentScroll !== fixedAvoidDocumentScrollRef.current) {
				console.error(`HxPopup avoidDocumentScroll[fixed=${fixedAvoidDocumentScrollRef.current}, new=${avoidDocumentScroll}] cannot be changed, it is fixed after initialized, and new value assigned is ignored.`);
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
					}
					break;
				}
				case 'mounted': {
					// Popup has been added to DOM, transition to active state and trigger enter animation
					visibleRef.current.last = 'mounted';
					visibleRef.current.now = 'active';
					// change attribute to control the transition or animation
					popupRef.current!.setAttribute('data-hx-visible', 'active');

					// Lock body scroll for modal mode
					if (fixedModeRef.current === 'modal' || fixedAvoidDocumentScrollRef.current) {
						bodyScrollLockRef.current = true;
						BodyScrollLock.lock();
					}
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
		}, [popupRef, visibleRef.current.now]);
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
						// Show popup: transition from hidden to mounted (renders to DOM)
						visibleRef.current.last = 'prepared';
						visibleRef.current.now = 'mounted';
						context.forceUpdate();
						break;
					}
					case 'unmounting': {
						// Cancel exit animation: popup was closing but got opened again
						visibleRef.current.last = 'unmounting';
						visibleRef.current.now = 'active';
						// change attribute to control the transition or animation
						popupRef.current!.setAttribute('data-hx-visible', 'active');
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
						// Hide popup before it even became visible - go directly to hidden
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
						const {any, time} = computeTransitionAndAnimation(popupRef.current!);
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
							popupRef.current!.setAttribute('data-hx-visible', 'unmounting');
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
		}, [context, popupRef, visible]);

		/**
		 * Render nothing when in 'prepared' state (hidden)
		 * This removes the popup from the DOM entirely when not visible
		 */
		// eslint-disable-next-line react-hooks/refs
		if (visibleRef.current.now === 'prepared') {
			return null;
		}

		/** Resolve the nested model to pass to child components */
		const $modelToChild = resolveChildModel($model, $field);
		/** Process props to expose reactive values as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);
		/** Whether document scrolling is allowed (used for backdrop styling) */
			// eslint-disable-next-line react-hooks/refs
		const documentScroll = fixedModeRef.current !== 'modal' && !fixedAvoidDocumentScrollRef.current;

		/**
		 * Render popup via React Portal to document body
		 * This avoids z-index stacking issues and overflow constraints from parent elements
		 */
		return createPortal(<div data-hx-portal-root=""
		                         data-hx-theme={context.theme.current()}
		                         data-hx-language={context.language.current()}
		                         style={{zIndex}}>
				{/* Popup backdrop element - styled via CSS based on mode */}
				<div data-hx-popup-backdrop=""
					// eslint-disable-next-line react-hooks/refs
					 data-hx-popup-backdrop-document-scroll={documentScroll}/>
				{/* Main popup container element */}
				<div {...restProps}
				     data-hx-popup=""
					// eslint-disable-next-line react-hooks/refs
					 data-hx-popup-mode={fixedModeRef.current}
					 data-hx-popup-transition={transition}
					 data-hx-popup-border={border} data-hx-popup-border-radius={borderRadius}
					 data-hx-popup-padding-x={paddingX}
					 data-hx-popup-padding-t={paddingT} data-hx-popup-padding-b={paddingB}
					// eslint-disable-next-line react-hooks/refs
					 data-hx-visible={visibleRef.current.now}
					 ref={popupRef}>
					{/* Automatically inject the resolved model into all direct child components */}
					{interposeToChildren({$model: $modelToChild}, children)}
				</div>
			</div>,
			document.body);
	}) as unknown as HxPopupType;
// @ts-expect-error assign component name
HxPopup.displayName = 'HxPopup';
