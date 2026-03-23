import {ERO, type ModelPath} from '@hx/data';
// @ts-expect-error React import is provided by the framework
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type PropsWithoutRef,
	type  ReactElement,
	type  RefAttributes
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useForceUpdate} from '../../hooks';
import type {
	ComponentDataProps,
	HxBorderRadius,
	HxHtmlElementProps,
	HxOmittedAttributes,
	HxPadding,
	StdProps
} from '../../types';
import {exposePropsToDOM, interposeToChildren} from '../../utils';
import {HxBoxDefaults} from './defaults';

/** Box container border radius size from design system */
export type HxBoxBorderRadius = HxBorderRadius;
/** Horizontal padding size for box container */
export type HxBoxPaddingX = HxPadding;
/** Top padding size for box container */
export type HxBoxPaddingT = HxPadding;
/** Bottom padding size for box container */
export type HxBoxPaddingB = HxPadding;

/**
 * Properties for the HxBox layout component.
 * Provides flexible container layout with configurable borders, and padding.
 */
export interface HxExtBoxProps<T extends object>
	extends StdProps<T>, ComponentDataProps<T> {
	/** Whether to show a border around the box container */
	border?: boolean;
	/** Border radius size for the container corners */
	borderRadius?: HxBoxBorderRadius;
	/** Horizontal (left and right) padding for the container */
	paddingX?: HxBoxPaddingX;
	/** Top padding for the container */
	paddingT?: HxBoxPaddingT;
	/** Bottom padding for the container */
	paddingB?: HxBoxPaddingB;
	/**
	 * Path to nested reactive object on $model. If specified, this nested object
	 * will be automatically passed as $model prop to all direct child components,
	 * simplifying data binding in nested layouts.
	 */
	$field?: ModelPath<T>;
}

export type OmittedBoxHTMLProps = HxOmittedAttributes;

export type HxBoxProps<T extends object> = PropsWithoutRef<
	& HxExtBoxProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedBoxHTMLProps, T>
>;

export type HxBoxType = <T extends object>(
	props: HxBoxProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Generic box container component for wrapping content with consistent styling.
 * Provides a flexible container with configurable border, border radius, and padding.
 * Supports reactive model propagation to child components like other layout components.
 *
 * @component
 * @example
 * // Basic box with border and padding
 * <HxBox border paddingX="md" paddingY="md">
 *   <p>Content inside a box with border</p>
 * </HxBox>
 *
 * @example
 * // Card-like box with rounded corners and padding
 * <HxBox border borderRadius="lg" paddingX="lg" paddingT="lg" paddingB="lg">
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </HxBox>
 *
 * @example
 * // Automatic model propagation to children
 * <HxBox $model={formModel} $field="user">
 *   <HxInput $field="firstName" />
 *   <HxInput $field="lastName" />
 * </HxBox>
 *
 * @features
 * - Configurable border and border radius from design system
 * - Full range of padding sizes (xs to xl) for all sides
 * - Reactive visibility state support
 * - Automatic nested model propagation to child components via $field prop
 * - Compatible with all other Hx layout components
 */
export const HxBox =
	forwardRef(<T extends object>(props: HxBoxProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			border = HxBoxDefaults.border, borderRadius = HxBoxDefaults.borderRadius,
			paddingX = HxBoxDefaults.paddingX,
			paddingT = HxBoxDefaults.paddingT, paddingB = HxBoxDefaults.paddingB,
			children,
			...rest
		} = props;

		// noinspection DuplicatedCode
		const context = useHxContext();
		const {visible} = useDataMonitor(props);
		const forceUpdate = useForceUpdate();

		// Resolve the model to pass to child components
		let $modelToChild = $model;
		if ($field != null && $field.length !== 0) {
			// If $field is specified, extract the nested reactive object from the parent model
			$modelToChild = ERO.getValue($model, $field);
		}
		const restProps = exposePropsToDOM(rest, $model, context, forceUpdate);

		return <div {...restProps}
		            data-hx-box=""
		            data-hx-box-border={border} data-hx-box-border-radius={borderRadius}
		            data-hx-box-padding-x={paddingX}
		            data-hx-box-padding-t={paddingT} data-hx-box-padding-b={paddingB}
		            data-hx-visible={visible ?? true}
		            ref={ref}>
			{/* Automatically inject the resolved model into all direct child components */}
			{interposeToChildren({$model: $modelToChild}, children)}
		</div>;
	}) as unknown as HxBoxType;
// @ts-expect-error assign component name
HxBox.displayName = 'HxBox';
