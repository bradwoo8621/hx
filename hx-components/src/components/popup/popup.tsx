import {ERO, type ModelPath} from '@hx/data';
// @ts-expect-error import React
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
		const [state, setState] = useState<HxPopupState>({visible: 'mounted'});

		useEffect(() => {
			if (state.visible === 'mounted' && visible) {
				setState(state => ({...state, visible: 'rendered'}));
			} else if (state.visible === 'rendered' && visible) {
				setState(state => ({...state, visible: 'active'}));
			} else if (state.visible === 'rendered' && !visible) {
				// never show, back to mounted directly
				setState(state => ({...state, visible: 'mounted'}));
			} else if (state.visible === 'active' && !visible) {
				setState(state => ({...state, visible: 'unmounting'}));
			} else if (state.visible === 'unmounting' && !visible) {
				setState(state => ({...state, visible: 'mounted'}));
			} else if (state.visible === 'unmounting' && visible) {
				setState(state => ({...state, visible: 'active'}));
			}
		}, [avoidDocumentScroll, visible, state.visible]);

		// Resolve the model to pass to child components
		let $modelToChild = $model;
		if ($model != null && $field != null && $field.length !== 0) {
			// If $field is specified, extract the nested reactive object from the parent model
			$modelToChild = ERO.getValue($model, $field);
		}
		const restProps = exposePropsToDOM(rest, $model, context);

		return <>
			{createPortal(<div data-hx-portal-root=""
			                   data-hx-theme={context.theme.current()}
			                   data-hx-language={context.language.current()}
			                   style={{zIndex}}>
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