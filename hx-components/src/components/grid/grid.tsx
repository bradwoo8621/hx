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
import {useHxContext} from '../../contexts';
import {useDataMonitor, useForceUpdate} from '../../hooks';
import type {
	ComponentDataProps,
	HxBorderRadius,
	HxGap,
	HxHtmlElementProps,
	HxOmittedAttributes,
	HxPadding,
	StdProps
} from '../../types';
import {exposePropsToDOM, interposeToChildren} from '../../utils';
import {HxGridDefaults} from './defaults.ts';

/** Grid column count: supports 12 (default), 15, and 16 column layouts */
export type HxGridColumns = 12 | 15 | 16;
export type HxGridJustifyItems = 'normal' | 'start' | 'end' | 'center' | 'stretch';
export type HxGridJustifyContent =
	| 'normal'
	| 'start' | 'end' | 'center' | 'stretch'
	| 'space-between' | 'space-around' | 'space-evenly';
export type HxGridAlignItems = 'normal' | 'start' | 'end' | 'center' | 'stretch' | 'baseline';
export type HxGridAlignContent =
	| 'normal'
	| 'start' | 'end' | 'center' | 'stretch'
	| 'space-between' | 'space-around' | 'space-evenly';
/** Grid container border radius size from design system */
export type HxGridBorderRadius = HxBorderRadius;
/** Horizontal gap size between grid columns */
export type HxGridGapX = HxGap;
/** Vertical gap size between grid rows */
export type HxGridGapY = HxGap;
/** Horizontal padding size for grid container */
export type HxGridPaddingX = HxPadding;
/** Top padding size for grid container */
export type HxGridPaddingT = HxPadding;
/** Bottom padding size for grid container */
export type HxGridPaddingB = HxPadding;

/**
 * Properties for the HxGrid layout component.
 * Provides responsive grid layout with configurable column count, spacing, and styling.
 */
export interface HxExtGridProps<T extends object>
	extends StdProps<T>, ComponentDataProps<T> {
	/** Number of columns in the grid layout: 12 (default), 15, or 16 */
	columns?: HxGridColumns;
	justifyItems?: HxGridJustifyItems;
	justifyContent?: HxGridJustifyContent;
	alignItems?: HxGridAlignItems;
	alignContent?: HxGridAlignContent;
	/** Whether to show a border around the grid container */
	border?: boolean;
	/** Border radius size for the container corners */
	borderRadius?: HxGridBorderRadius;
	/** Horizontal gap size between grid columns */
	gapX?: HxGridGapX;
	/** Vertical gap size between grid rows */
	gapY?: HxGridGapY;
	/** Horizontal (left and right) padding for the container */
	paddingX?: HxGridPaddingX;
	/** Top padding for the container */
	paddingT?: HxGridPaddingT;
	/** Bottom padding for the container */
	paddingB?: HxGridPaddingB;
	/**
	 * Path to nested reactive object on $model. If specified, this nested object
	 * will be automatically passed as $model prop to all direct child components,
	 * simplifying data binding in nested layouts.
	 */
	$field?: ModelPath<T>;
}

export type OmittedGridHTMLProps = HxOmittedAttributes;

export type HxGridProps<T extends object> = PropsWithoutRef<
	& HxExtGridProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedGridHTMLProps, T>
>;

export type HxGridType = <T extends object>(
	props: HxGridProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Reactive grid layout component for building responsive UI layouts.
 * Provides consistent column-based layout with configurable gaps, borders, and padding
 * based on design system tokens. Supports 12, 15, and 16 column layouts.
 *
 * @component
 * @example
 * // Default 12-column grid layout with medium gap
 * <HxGrid columns={12} gapX="md">
 *   <div data-hx-grid-cols="6">Column 1 (6 columns)</div>
 *   <div data-hx-grid-cols="6">Column 2 (6 columns)</div>
 * </HxGrid>
 *
 * @example
 * // 16-column grid with border and padding
 * <HxGrid columns={16} gapX="sm" gapY="md" border paddingX="lg" paddingT="md">
 *   <div data-hx-grid-cols="4">Sidebar (4 columns)</div>
 *   <div data-hx-grid-cols="12">Main Content (12 columns)</div>
 * </HxGrid>
 *
 * @example
 * // Automatic nested model propagation to children
 * const form = reactive({
 *   user: {
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     email: 'john@example.com'
 *   }
 * });
 * <HxGrid $model={form} $field="user" columns={12} gapX="md">
 *   <HxInput $field="firstName" data-hx-grid-cols="6" />
 *   <HxInput $field="lastName" data-hx-grid-cols="6" />
 *   <HxInput $field="email" data-hx-grid-cols="12" />
 * </HxGrid>
 *
 * @features
 * - Multiple column counts: 12 (default), 15, and 16 column layouts
 * - Configurable horizontal and vertical gap sizes between items (xs to xl)
 * - Optional border and border radius
 * - Built-in padding support for all sides
 * - Reactive visible state management
 * - Automatic nested model propagation to child components via $field prop
 * - Full compatibility with nested grid and flex layouts
 */
export const HxGrid =
	forwardRef(<T extends object>(props: HxGridProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			columns = HxGridDefaults.columns,
			justifyItems = HxGridDefaults.justifyItems, justifyContent = HxGridDefaults.justifyContent,
			alignItems = HxGridDefaults.alignItems, alignContent = HxGridDefaults.alignContent,
			border = HxGridDefaults.border, borderRadius = HxGridDefaults.borderRadius,
			gapX = HxGridDefaults.gapX, gapY = HxGridDefaults.gapY,
			paddingX = HxGridDefaults.paddingX,
			paddingT = HxGridDefaults.paddingT, paddingB = HxGridDefaults.paddingB,
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
		            data-hx-grid=""
		            data-hx-grid-columns={columns}
		            data-hx-grid-justify-items={justifyItems} data-hx-grid-justify-content={justifyContent}
		            data-hx-grid-align-items={alignItems} data-hx-grid-align-content={alignContent}
		            data-hx-grid-border={border} data-hx-grid-border-radius={borderRadius}
		            data-hx-grid-gap-x={gapX} data-hx-grid-gap-y={gapY}
		            data-hx-grid-padding-x={paddingX}
		            data-hx-grid-padding-t={paddingT} data-hx-grid-padding-b={paddingB}
		            data-hx-visible={visible ?? true}
		            ref={ref}>
			{/* Automatically inject the resolved model into all direct child components */}
			{interposeToChildren({$model: $modelToChild}, children)}
		</div>;
	}) as unknown as HxGridType;
// @ts-expect-error assign component name
HxGrid.displayName = 'HxGrid';
