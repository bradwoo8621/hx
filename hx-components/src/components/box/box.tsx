import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type  ReactElement, type  RefAttributes} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import {DOMUtils, HxDataPropToAttrValueComputer, HxDataUtils} from '../../utils';
import {HxBoxDefaults} from './defaults';
import type {HxBoxProps} from './types';

export type HxBoxType = <T extends object>(
	props: HxBoxProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Generic box container component for wrapping content with consistent styling.
 * Provides a flexible container with configurable border, border radius, and padding.
 * Supports reactive model propagation to child components like other layout components.
 *
 * @example
 * ```tsx
 * // Basic box with border and padding
 * <HxBox border paddingX="md" paddingY="md">
 *   <p>Content inside a box with border</p>
 * </HxBox>
 * ```
 *
 * @example
 * ```tsx
 * // Card-like box with rounded corners and padding
 * <HxBox border borderRadius="lg" paddingX="lg" paddingT="lg" paddingB="lg">
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </HxBox>
 * ```
 *
 * @example
 * ```tsx
 * // Automatic model propagation to children
 * <HxBox $model={formModel} $field="user">
 *   <HxInput $field="firstName" />
 *   <HxInput $field="lastName" />
 * </HxBox>
 * ```
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
		const {$model, $field, children, ...rest} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);

		const $modelToChild = HxDataUtils.resolveChildModel($model, $field);
		const restProps = DOMUtils.exposePropsToDOM(rest, $model, context, {
			key: 'HxBox', default: HxBoxDefaults, visible
		});

		return <div {...restProps}
		            data-hx-box=""
		            data-hx-model-path={ERO.loosePathOf($model, $field)}
		            ref={ref}>
			{/* Automatically inject the resolved model into all direct child components */}
			{DOMUtils.interposeToChildren({$model: $modelToChild}, children)}
		</div>;
	}) as unknown as HxBoxType;
// @ts-expect-error assign component name
HxBox.displayName = 'HxBox';

HxDataPropToAttrValueComputer.create('HxBox').and('color').register();
