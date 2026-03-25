import {type ModelPath} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type MutableRefObject,
	type PropsWithoutRef,
	type ReactElement,
	type RefAttributes,
	useEffect,
	useRef
} from 'react';
import {createPortal} from 'react-dom';
import {type HxContext, useHxContext} from '../../contexts';
import {useDualRef} from '../../hooks';
import type {HxBorderRadius, HxHtmlElementProps, HxObject, HxOmittedAttributes, HxPadding} from '../../types';
import {
	computeTransitionAndAnimation,
	disableBodyScroll,
	enableBodyScroll,
	exposePropsToDOM,
	interposeToChildren,
	resolveChildModel
} from '../../utils';
import {HxPopupDefaults} from './defaults';

/**
 * - float: control visible by yourself
 * - modal: control visible by yourself. avoid document scroll.
 * - popup: control visible by popup itself, or yourself
 */
export type HxPopupMode = 'float' | 'modal' | 'popup';
export type HxPopupTransition = 'opacity' | 'custom';
/** Popup container border radius size from design system */
export type HxPopupBorderRadius = HxBorderRadius;
/** Horizontal padding size for popup container */
export type HxPopupPaddingX = HxPadding;
/** Top padding size for popup container */
export type HxPopupPaddingT = HxPadding;
/** Bottom padding size for popup container */
export type HxPopupPaddingB = HxPadding;

export interface HxExtPopupProps<T extends object> {
	mode: HxPopupMode;
	avoidDocumentScroll?: boolean;
	zIndex?: number;
	/** provide your own styles when it is custom */
	transition?: HxPopupTransition;
	/** Whether to show a border around the flex container */
	border?: boolean;
	/** Border radius size for the container corners */
	borderRadius?: HxPopupBorderRadius;
	/** Horizontal (left and right) padding for the container */
	paddingX?: HxPopupPaddingX;
	/** Top padding for the container */
	paddingT?: HxPopupPaddingT;
	/** Bottom padding for the container */
	paddingB?: HxPopupPaddingB;
	/** to control the popup is visible or not */
	visible: boolean;
	/** Optional reactive model */
	$model?: HxObject<T>,
	/**
	 * Path to nested reactive object on $model. If specified, this nested object
	 * will be automatically passed as $model prop to all direct child components,
	 * simplifying data binding in nested layouts.
	 */
	$field?: ModelPath<T>;
}

export type OmittedPopupHTMLProps = HxOmittedAttributes;

export type HxPopupProps<T extends object> = PropsWithoutRef<
	& HxExtPopupProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedPopupHTMLProps, T>
>;

export type HxPopupType = <T extends object>(
	props: HxPopupProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * - Initial State: Mounted → No DOM Node
 *   Component instance is created but has not yet produced its initial render output, thus no DOM nodes exist.
 * - First Render Complete, when `visible` is set to true, Side Effect Updates State to `Rendered` → Full content is rendered but invisible
 *   The component's initial `render` method has executed, the virtual DOM has been reconciled and committed to the actual DOM.
 *   However, visibility is suppressed via CSS or logic.
 * - After `Rendered` Completes, Side Effect Updates State to `Active` → Fully visible
 *   CSS or logical constraints are removed. The component is now fully displayed in the document flow and is interactive.
 * - When `visible` is set to false, State Changes to `Unmounting` → Full content is rendered but invisible
 *   A hide transition is triggered. The component is still in the DOM with its full content,
 *   but is being prepared for removal.
 *   e.g., running exit animations or cleaning-up side effects.
 * - After the `unmounting` animation ends, State Returns to `Mounted` → No DOM Node
 *   The exit transition completes. The component is fully detached from the DOM, its instance is preserved,
 *   and it returns to the initial "mounted but not rendered" state, ready for a potential re-render cycle.
 */
type HxPopupVisible = 'mounted' | 'rendered' | 'active' | 'unmounting';

const lockBody = (popupRef: MutableRefObject<HTMLDivElement | null>): void => {
	if (!document.body.hasAttribute('data-hx-origin-pointer-events')) {
		document.body.setAttribute('data-hx-origin-pointer-events', document.body.style.pointerEvents || 'unset');
	}
	document.body.style.pointerEvents = 'none';
	const lockBodyScroll = () => {
		if (popupRef.current != null) {
			disableBodyScroll(popupRef.current);
		} else {
			setTimeout(lockBodyScroll, 10);
		}
	};
	lockBodyScroll();
};

const showPopup = (
	popupRef: MutableRefObject<HTMLDivElement | null>, visibleRef: MutableRefObject<HxPopupVisible>
): void => {
	const switchToActive = () => {
		if (popupRef.current != null) {
			visibleRef.current = 'active';
			// change attribute to control the animation
			popupRef.current.setAttribute('data-hx-visible', 'active');
		} else {
			setTimeout(switchToActive, 10);
		}
	};
	switchToActive();
};

const unlockBody = (popupRef: MutableRefObject<HTMLDivElement | null>): void => {
	const originValue = document.body.getAttribute('data-hx-origin-pointer-events');
	document.body.removeAttribute('data-hx-origin-pointer-events');
	if (originValue === 'unset') {
		document.body.style.pointerEvents = '';
	} else {
		document.body.style.pointerEvents = originValue ?? '';
	}
	const unlockBodyScroll = () => {
		if (popupRef.current != null) {
			enableBodyScroll(popupRef.current);
		} else {
			setTimeout(unlockBodyScroll, 10);
		}
	};
	unlockBodyScroll();
};

const hidePopup = (
	popupRef: MutableRefObject<HTMLDivElement | null>, visibleRef: MutableRefObject<HxPopupVisible>, context: HxContext
): void => {
	const switchToMounted = () => {
		if (popupRef.current != null) {
			const {any, time} = computeTransitionAndAnimation(popupRef.current);
			if (any) {
				setTimeout(() => {
					visibleRef.current = 'mounted';
					context.forceUpdate();
				}, time);
			} else {
				visibleRef.current = 'mounted';
				context.forceUpdate();
			}
		} else {
			setTimeout(switchToMounted, 10);
		}
	};
	const switchToUnmounting = () => {
		if (popupRef.current != null) {
			visibleRef.current = 'unmounting';
			// change attribute to control the animation
			popupRef.current.setAttribute('data-hx-visible', 'unmounting');
			switchToMounted();
		} else {
			setTimeout(switchToUnmounting, 10);
		}
	};
	switchToUnmounting();
};

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

		const context = useHxContext();
		const visibleRef = useRef<HxPopupVisible>('mounted');
		const popupRef = useDualRef(ref);

		useEffect(() => {
			if (visible) {
				if (visibleRef.current === 'mounted') {
					// for render nothing to render everything
					visibleRef.current = 'rendered';
					context.forceUpdate();
				} else if (visibleRef.current === 'rendered' || visibleRef.current === 'unmounting') {
					if (mode === 'modal' || avoidDocumentScroll) {
						lockBody(popupRef);
					}
					showPopup(popupRef, visibleRef);
				}
			} else {
				if (visibleRef.current === 'rendered') {
					// never show, back to mounted directly
					// for render everything to render nothing
					visibleRef.current = 'mounted';
					context.forceUpdate();
				} else if (visibleRef.current === 'active') {
					if (mode === 'modal' || avoidDocumentScroll) {
						unlockBody(popupRef);
					}
					hidePopup(popupRef, visibleRef, context);
				}
			}
			// eslint-disable-next-line react-hooks/refs,react-hooks/exhaustive-deps
		}, [visible, visibleRef.current, context]);

		// eslint-disable-next-line react-hooks/refs
		if (visibleRef.current === 'mounted') {
			return null;
		}

		const $modelToChild = resolveChildModel($model, $field);
		const restProps = exposePropsToDOM(rest, $model, context);
		const documentScroll = mode !== 'modal' && !avoidDocumentScroll;
		// eslint-disable-next-line react-hooks/refs
		const visibleState = visibleRef.current;

		return createPortal(<div data-hx-portal-root=""
		                         data-hx-theme={context.theme.current()}
		                         data-hx-language={context.language.current()}
		                         style={{zIndex}}>
			<div data-hx-popup-backdrop=""
			     data-hx-popup-backdrop-document-scroll={documentScroll}/>
			<div {...restProps}
			     data-hx-popup=""
			     data-hx-popup-mode={mode}
			     data-hx-popup-transition={transition}
			     data-hx-popup-border={border} data-hx-popup-border-radius={borderRadius}
			     data-hx-popup-padding-x={paddingX}
			     data-hx-popup-padding-t={paddingT} data-hx-popup-padding-b={paddingB}
			     data-hx-visible={visibleState}
			     ref={popupRef}>
				{/* Automatically inject the resolved model into all direct child components */}
				{interposeToChildren({$model: $modelToChild}, children)}
			</div>
		</div>, document.body);
	}) as unknown as HxPopupType;
// @ts-expect-error assign component name
HxPopup.displayName = 'HxPopup';