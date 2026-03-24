import {ERO, type ModelPath} from '@hx/data';
// @ts-expect-error React import is provided by the framework
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type PropsWithoutRef,
	type ReactElement,
	type RefAttributes,
	useEffect,
	useState
} from 'react';
import {createPortal} from 'react-dom';
import {useHxContext} from '../../contexts';
import {useForceUpdate} from '../../hooks';
import type {HxHtmlElementProps, HxObject, HxOmittedAttributes} from '../../types';
import {exposePropsToDOM, interposeToChildren} from '../../utils';
import {HxPopupDefaults} from './defaults.ts';

export interface HxExtPopupProps<T extends object> {
	avoidDocumentScroll?: boolean;
	zIndex?: number;
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
 * - render but never show: crouch
 * - visible is true, or changed to true: prime -> appear
 * - visible changed to false: hide -> crouch
 */
type HxPopupVisible = 'crouch' | 'prime' | 'appear' | 'hide';

interface HxPopupState {
	visible: HxPopupVisible;
}

export const HxPopup =
	forwardRef(<T extends object>(props: HxPopupProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			avoidDocumentScroll = HxPopupDefaults.avoidDocumentScroll,
			zIndex = HxPopupDefaults.zIndex,
			visible,
			children,
			...rest
		} = props;

		// noinspection DuplicatedCode
		const context = useHxContext();
		const [state, setState] = useState<HxPopupState>({visible: 'crouch'});
		const forceUpdate = useForceUpdate();
		useEffect(() => {
			if (state.visible === 'crouch' && visible) {
				setState(state => ({...state, visible: 'prime'}));
			} else if (state.visible === 'prime' && visible) {
				setState(state => ({...state, visible: 'appear'}));
			} else if (state.visible === 'prime' && !visible) {
				// never show, back to crouch directly
				setState(state => ({...state, visible: 'crouch'}));
			} else if (state.visible === 'appear' && !visible) {
				setState(state => ({...state, visible: 'hide'}));
			} else if (state.visible === 'hide' && !visible) {
				setState(state => ({...state, visible: 'crouch'}));
			} else if (state.visible === 'hide' && visible) {
				setState(state => ({...state, visible: 'appear'}));
			}
		}, [avoidDocumentScroll, visible, state.visible]);

		// Resolve the model to pass to child components
		let $modelToChild = $model;
		if ($model != null && $field != null && $field.length !== 0) {
			// If $field is specified, extract the nested reactive object from the parent model
			$modelToChild = ERO.getValue($model, $field);
		}
		const restProps = exposePropsToDOM(rest, $model, context, forceUpdate);

		return <>
			{createPortal(<div data-hx-portal-root="" style={{zIndex}}>
				<div data-hx-popup-backdrop=""
				     data-hx-popup-backdrop-document-scroll={!avoidDocumentScroll}/>
				<div {...restProps}
				     data-hx-popup=""
				     data-hx-visible={state.visible}
				     ref={ref}>
					{/* Automatically inject the resolved model into all direct child components */}
					{interposeToChildren({$model: $modelToChild}, children)}
				</div>
			</div>, document.body)}
		</>;
	}) as unknown as HxPopupType;
// @ts-expect-error assign component name
HxPopup.displayName = 'HxPopup';