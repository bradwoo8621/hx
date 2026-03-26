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
import type {HxBorderRadius, HxHtmlElementProps, HxObject, HxOmittedAttributes, HxPadding} from '../../types';
import {computeTransitionAndAnimation, exposePropsToDOM, interposeToChildren, resolveChildModel} from '../../utils';
import {HxPopupDefaults} from './defaults';
import {BodyScrollLock} from './scroll-lock';

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

type HxPopupVisibleMode = 'prepared' | 'mounted' | 'active' | 'unmounting';

interface HxPopupVisibleRef {
	visible: boolean;
	last: HxPopupVisibleMode;
	now: HxPopupVisibleMode;
}

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
		const fixedModeRef = useRef(mode);
		const visibleRef = useRef<HxPopupVisibleRef>(
			visible
				? {visible, last: 'active', now: 'active'}
				: {visible, last: 'prepared', now: 'prepared'});
		const popupRef = useDualRef(ref);

		useEffect(() => {
			if (mode !== fixedModeRef.current) {
				console.error(`HxPopup mode[fixed=${fixedModeRef.current}, new=${mode}] cannot be changed, it is fixed after initialized.`);
			}
		}, [mode]);
		useEffect(() => {
			// console.log('handle visible ref now change', visibleRef.current.visible, visibleRef.current.last, visibleRef.current.now);
			// basically, beside the first round (now is prepared or active)
			switch (visibleRef.current.now) {
				case 'prepared': {
					if (visibleRef.current.last !== 'prepared') {
						// transit from other, could be one of following:
						// - from mounted: Not yet actually displayed, it directly returns to prepared because the passed visible becomes false.
						// - from active: No transition or animation detected, skipping the animation phase and disappearing directly.
						// - from unmounting: Disappear with an animation phase, vanishing after the animation ends.
						// unlock body scroll
						BodyScrollLock.unlock();
					}
					break;
				}
				case 'mounted': {
					// The only possibility is constructing from the beginning of the disappearance.
					visibleRef.current.last = 'mounted';
					visibleRef.current.now = 'active';
					// change attribute to control the transition or animation
					popupRef.current!.setAttribute('data-hx-visible', 'active');
					// mount popup, lock body scroll
					if (fixedModeRef.current === 'modal') {
						BodyScrollLock.lock();
					}
					break;
				}
				case 'active': {
					// transit from other, could be one of following:
					// - from mounted: Normal case, it will not trigger side effect, so handled on trigger time. see above case.
					// - from unmounting: Not yet actually disappeared, it directly returns to active because the passed visible becomes true.
					// - from prepared: Never
					if (visibleRef.current.last === 'active') {
						// initialized as active, lock body scroll
						if (fixedModeRef.current === 'modal') {
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
			// console.log('visible ref now change handled', visibleRef.current.visible, visibleRef.current.last, visibleRef.current.now);
			// eslint-disable-next-line react-hooks/refs
		}, [popupRef, fixedModeRef, visibleRef.current.now]);
		useEffect(() => {
			// console.log('handle visible change', visible, visibleRef.current.visible, visibleRef.current.last, visibleRef.current.now);
			if (visible) {
				visibleRef.current.visible = true;
				switch (visibleRef.current.now) {
					case 'prepared': {
						visibleRef.current.last = 'prepared';
						visibleRef.current.now = 'mounted';
						context.forceUpdate();
						break;
					}
					case 'unmounting': {
						visibleRef.current.last = 'unmounting';
						visibleRef.current.now = 'active';
						// change attribute to control the transition or animation
						popupRef.current!.setAttribute('data-hx-visible', 'active');
						break;
					}
					case 'mounted':
					case 'active':
					default: {
						// do nothing
						break;
					}
				}
			} else {
				visibleRef.current.visible = false;
				switch (visibleRef.current.now) {
					case 'mounted': {
						visibleRef.current.last = 'mounted';
						visibleRef.current.now = 'prepared';
						context.forceUpdate();
						break;
					}
					case 'active': {
						visibleRef.current.last = 'active';
						visibleRef.current.now = 'unmounting';
						const {any, time} = computeTransitionAndAnimation(popupRef.current!);
						if (any) {
							setTimeout(() => {
								if (visibleRef.current.now === 'unmounting') {
									visibleRef.current.last = 'unmounting';
									visibleRef.current.now = 'prepared';
									context.forceUpdate();
								}
							}, time);
							// change attribute to control the transition or animation
							popupRef.current!.setAttribute('data-hx-visible', 'unmounting');
						} else {
							// no transition or animation
							visibleRef.current.last = 'active';
							visibleRef.current.now = 'prepared';
							context.forceUpdate();
						}
						break;
					}
					case 'prepared':
					case 'unmounting':
					default: {
						// do nothing
					}
				}
			}
			// console.log('visible change handled', visible, visibleRef.current.visible, visibleRef.current.last, visibleRef.current.now);
		}, [context, popupRef, visible]);

		// console.log('render stage', visible, visibleRef.current.visible, visibleRef.current.last, visibleRef.current.now);

		// eslint-disable-next-line react-hooks/refs
		if (visibleRef.current.now === 'prepared') {
			return null;
		}

		const $modelToChild = resolveChildModel($model, $field);
		const restProps = exposePropsToDOM(rest, $model, context);
		const documentScroll = mode !== 'modal' && !avoidDocumentScroll;

		return createPortal(<div data-hx-portal-root=""
		                         data-hx-theme={context.theme.current()}
		                         data-hx-language={context.language.current()}
		                         style={{zIndex}}>
				<div data-hx-popup-backdrop=""
				     data-hx-popup-backdrop-document-scroll={documentScroll}/>
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