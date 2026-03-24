import {ERO, type ModelPath} from '@hx/data';
// @ts-expect-error React import is provided by the framework
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type PropsWithoutRef,
	type ReactElement,
	type RefAttributes
} from 'react';
import {createPortal} from 'react-dom';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useForceUpdate} from '../../hooks';
import type {HxHtmlElementProps, HxObject, HxOmittedAttributes, StdProps} from '../../types';
import {exposePropsToDOM, interposeToChildren} from '../../utils';

export interface HxExtPopupProps<T extends object>
	extends StdProps<T> {
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

export const HxPopup =
	forwardRef(<T extends object>(props: HxPopupProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			children,
			...rest
		} = props;

		// noinspection DuplicatedCode
		const context = useHxContext();
		const {visible} = useDataMonitor(props);
		const forceUpdate = useForceUpdate();

		// Resolve the model to pass to child components
		let $modelToChild = $model;
		if ($model != null && $field != null && $field.length !== 0) {
			// If $field is specified, extract the nested reactive object from the parent model
			$modelToChild = ERO.getValue($model, $field);
		}
		const restProps = exposePropsToDOM(rest, $model, context, forceUpdate);

		return <>
			{createPortal(<div data-hx-portal-root="">
				<div {...restProps}
				     data-hx-popup=""
				     data-hx-visible={visible ?? true}
				     ref={ref}>
					{/* Automatically inject the resolved model into all direct child components */}
					{interposeToChildren({$model: $modelToChild}, children)}
				</div>
			</div>, document.body)}
		</>;
	}) as unknown as HxPopupType;
// @ts-expect-error assign component name
HxPopup.displayName = 'HxPopup';