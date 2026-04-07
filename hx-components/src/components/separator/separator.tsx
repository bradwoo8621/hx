// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type PropsWithoutRef,
	type  ReactElement,
	type  RefAttributes
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import type {
	HxColor,
	HxDirection,
	HxHtmlElementProps,
	HxMargin,
	HxObject,
	HxOmittedAttributes,
	HxSize,
	StdProps
} from '../../types';
import {exposePropsToDOM} from '../../utils';
import {HxSeparatorDefaults} from './defaults';

/** Separator direction: horizontal (dir-x) or vertical (dir-y) */
export type HxSeparatorDirection = HxDirection;
/** Separator color: uses design system color palette */
export type HxSeparatorColor = HxColor;
/** Separator size: controls the length/height of the separator */
export type HxSeparatorSize = HxSize;
/** Horizontal margin size around the separator */
export type HxSeparatorMarginX = HxMargin;
/** Vertical margin size around the separator */
export type HxSeparatorMarginY = HxMargin;

/**
 * Properties for the HxSeparator component.
 * Provides a visual divider between content sections with configurable direction, color, and spacing.
 */
export interface HxExtSeparatorProps<T extends object>
	extends StdProps<T> {
	/** Separator orientation: horizontal (dir-x) or vertical (dir-y) */
	direction?: HxSeparatorDirection;
	/** Color of the separator line */
	color?: HxSeparatorColor;
	/** Size of the separator: controls thickness (horizontal) or height (vertical) */
	size?: HxSeparatorSize;
	/** Horizontal margin spacing on left and right sides */
	marginX?: HxSeparatorMarginX;
	/** Vertical margin spacing on top and bottom sides */
	marginY?: HxSeparatorMarginY;
	/** Optional reactive model */
	$model?: HxObject<T>,
}

export type OmittedSeparatorHTMLProps =
	| 'children'
	| HxOmittedAttributes;

export type HxSeparatorProps<T extends object> = PropsWithoutRef<
	& HxExtSeparatorProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedSeparatorHTMLProps, T>
>;

export type HxSeparatorType = <T extends object>(
	props: HxSeparatorProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Separator component for visually dividing content sections.
 * Creates a horizontal or vertical line divider with configurable color and spacing.
 *
 * @example
 * ```tsx
 * // Horizontal separator between sections
 * <div>
 *   <p>Section 1 content</p>
 *   <HxSeparator marginY="md" />
 *   <p>Section 2 content</p>
 * </div>
 * ```
 *
 * @example
 * ```tsx
 * // Vertical separator between columns
 * <div style={{display: 'flex'}}>
 *   <div style={{flex: 1}}>Column 1</div>
 *   <HxSeparator direction="dir-y" marginX="md" />
 *   <div style={{flex: 1}}>Column 2</div>
 * </div>
 * ```
 *
 * @example
 * ```tsx
 * // Colored separator
 * <HxSeparator color="primary" marginY="sm" />
 * ```
 *
 * @features
 * - Supports both horizontal and vertical directions
 * - Uses design system color palette for consistent styling
 * - Configurable separator size (thickness/height)
 * - Configurable margin spacing around the separator
 * - Reactive visibility state support
 * - Lightweight with minimal DOM footprint
 */
export const HxSeparator =
	forwardRef(<T extends object>(props: HxSeparatorProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model,
			direction = HxSeparatorDefaults.direction,
			color = HxSeparatorDefaults.color, size = HxSeparatorDefaults.size,
			marginX = HxSeparatorDefaults.marginX, marginY = HxSeparatorDefaults.marginY,
			...rest
		} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);

		const restProps = exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            data-hx-separator=""
		            data-hx-separator-direction={direction}
		            data-hx-color={color} data-hx-separator-size={size}
		            data-hx-separator-margin-x={marginX} data-hx-separator-margin-y={marginY}
		            data-hx-visible={(visible ?? true) ? '' : (void 0)}
		            ref={ref}/>;
	}) as unknown as HxSeparatorType;
// @ts-expect-error assign component name
HxSeparator.displayName = 'HxSeparator';
