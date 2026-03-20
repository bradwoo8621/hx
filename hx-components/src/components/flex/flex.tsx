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
	HxDirection,
	HxGap,
	HxHtmlElementProps,
	HxOmittedAttributes,
	HxPadding,
	StdProps
} from '../../types';
import {interposeToChildren, safeToDom, wrapToReactEvents} from '../../utils';
import {HxFlexDefaults} from './defaults.ts';

/** Flex container direction: horizontal (row) or vertical (column) */
export type HxFlexDirection = HxDirection;
export type HxFlexJustifyContent =
	| 'normal'
	| 'start' | 'end' | 'center'
	| 'space-between' | 'space-around' | 'space-evenly';
export type HxFlexAlignItems = 'normal' | 'start' | 'end' | 'center' | 'stretch' | 'baseline';
export type HxFlexAlignContent = 'normal' | 'start' | 'end' | 'center' | 'stretch' | 'space-between' | 'space-around';
/** Flex container border radius size from design system */
export type HxFlexBorderRadius = HxBorderRadius;
/** Horizontal gap size between flex items */
export type HxFlexGapX = HxGap;
/** Vertical gap size between flex items */
export type HxFlexGapY = HxGap;
/** Horizontal padding size for flex container */
export type HxFlexPaddingX = HxPadding;
/** Top padding size for flex container */
export type HxFlexPaddingT = HxPadding;
/** Bottom padding size for flex container */
export type HxFlexPaddingB = HxPadding;

/**
 * Properties for the HxFlex layout component.
 * Provides flexible container layout with configurable spacing, borders, and padding.
 */
export interface HxExtFlexProps<T extends object>
	extends StdProps<T>, ComponentDataProps<T> {
	/** Flex container direction: 'dir-x' for horizontal, 'dir-y' for vertical */
	direction?: HxFlexDirection;
	wrap?: boolean;
	justifyContent?: HxFlexJustifyContent;
	alignItems?: HxFlexAlignItems;
	alignContent?: HxFlexAlignContent;
	/** Whether to show a border around the flex container */
	border?: boolean;
	/** Border radius size for the container corners */
	borderRadius?: HxFlexBorderRadius;
	/** Horizontal gap size between child items */
	gapX?: HxFlexGapX;
	/** Vertical gap size between child items */
	gapY?: HxFlexGapY;
	/** Horizontal (left and right) padding for the container */
	paddingX?: HxFlexPaddingX;
	/** Top padding for the container */
	paddingT?: HxFlexPaddingT;
	/** Bottom padding for the container */
	paddingB?: HxFlexPaddingB;
	/**
	 * Path to nested reactive object on $model. If specified, this nested object
	 * will be automatically passed as $model prop to all direct child components,
	 * simplifying data binding in nested layouts.
	 */
	$field?: ModelPath<T>;
}

export type OmittedFlexHTMLProps = HxOmittedAttributes;

export type HxFlexProps<T extends object> = PropsWithoutRef<
	& HxExtFlexProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedFlexHTMLProps, T>
>;

export type HxFlexType = <T extends object>(
	props: HxFlexProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Reactive flexbox layout component for building responsive UI layouts.
 * Provides consistent spacing, borders, and padding based on design system tokens.
 * Supports both horizontal and vertical directions with configurable gaps between items.
 *
 * @component
 * @example
 * // Default horizontal layout with medium gap
 * <HxFlex direction="dir-x" gapX="md">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </HxFlex>
 *
 * @example
 * // Vertical form layout with border and padding
 * <HxFlex direction="dir-y" gapY="lg" border paddingX="lg" paddingT="md">
 *   <HxInput $model={form} $field="email" />
 *   <HxInput $model={form} $field="password" />
 * </HxFlex>
 *
 * @example
 * // Automatic nested model propagation to children
 * const form = reactive({
 *   user: {
 *     name: 'John',
 *     email: 'john@example.com'
 *   }
 * });
 * // All child inputs automatically receive user as $model
 * <HxFlex $model={form} $field="user" direction="dir-y" gapY="md">
 *   <HxInput $field="name" /> // Equivalent to <HxInput $model={form.user} $field="name" />
 *   <HxInput $field="email" /> // Equivalent to <HxInput $model={form.user} $field="email" />
 * </HxFlex>
 *
 * @features
 * - Two layout directions: horizontal (dir-x) and vertical (dir-y)
 * - Configurable gap sizes between items (xs to xl)
 * - Optional border and border radius
 * - Built-in padding support for all sides
 * - Reactive visible state management
 * - Automatic nested model propagation to child components via $field prop
 * - Full compatibility with nested flex layouts
 */
export const HxFlex =
	forwardRef(<T extends object>(props: HxFlexProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			direction = HxFlexDefaults.direction, wrap = HxFlexDefaults.wrap,
			justifyContent = HxFlexDefaults.justifyContent,
			alignItems = HxFlexDefaults.alignItems, alignContent = HxFlexDefaults.alignContent,
			border = HxFlexDefaults.border, borderRadius = HxFlexDefaults.borderRadius,
			gapX = HxFlexDefaults.gapX, gapY = HxFlexDefaults.gapY,
			paddingX = HxFlexDefaults.paddingX,
			paddingT = HxFlexDefaults.paddingT, paddingB = HxFlexDefaults.paddingB,
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
		const restProps = safeToDom(wrapToReactEvents(rest, $model, context, forceUpdate));

		return <div {...restProps}
		            data-hx-flex=""
		            data-hx-flex-direction={direction} data-hx-flex-wrap={wrap}
		            data-hx-flex-justify-content={justifyContent}
		            data-hx-flex-align-items={alignItems} data-hx-flex-align-content={alignContent}
		            data-hx-flex-border={border} data-hx-flex-border-radius={borderRadius}
		            data-hx-flex-gap-x={gapX} data-hx-flex-gap-y={gapY}
		            data-hx-flex-padding-x={paddingX}
		            data-hx-flex-padding-t={paddingT} data-hx-flex-padding-b={paddingB}
		            data-hx-visible={visible ?? true}
		            ref={ref}>
			{/* Automatically inject the resolved model into all direct child components */}
			{interposeToChildren({$model: $modelToChild}, children)}
		</div>;
	}) as unknown as HxFlexType;
// @ts-expect-error assign component name
HxFlex.displayName = 'HxFlex';
