import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type  ReactElement, type  RefAttributes} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import {DOMUtils, HxDataPropToAttrValueComputer, HxDataUtils} from '../../utils';
import {HxFlexDefaults} from './defaults';
import type {HxFlexProps} from './types';

export type HxFlexType = <T extends object>(
	props: HxFlexProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Reactive flexbox layout component for building responsive UI layouts.
 * Provides consistent spacing, borders, and padding based on design system tokens.
 * Supports both horizontal and vertical directions with configurable gaps between items.
 *
 * @example
 * ```tsx
 * // Default horizontal layout with medium gap
 * <HxFlex direction="dir-x" gapX="md">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </HxFlex>
 * ```
 *
 * @example
 * ```tsx
 * // Vertical form layout with border and padding
 * <HxFlex direction="dir-y" gapY="lg" border paddingX="lg" paddingT="md">
 *   <HxInput $model={form} $field="email" />
 *   <HxInput $model={form} $field="password" />
 * </HxFlex>
 * ```
 *
 * @example
 * ```tsx
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
 * ```
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
		const {$model, $field, children, ...rest} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);

		const $modelToChild = HxDataUtils.resolveChildModel($model, $field);
		const restProps = DOMUtils.exposePropsToDOM(rest, $model, context, {
			key: 'HxFlex', default: HxFlexDefaults, visible
		});

		return <div {...restProps}
		            data-hx-flex=""
		            data-hx-model-path={ERO.loosePathOf($model, $field)}
		            ref={ref}>
			{/* Automatically inject the resolved model into all direct child components */}
			{DOMUtils.interposeToChildren({$model: $modelToChild}, children)}
		</div>;
	}) as unknown as HxFlexType;
// @ts-expect-error assign component name
HxFlex.displayName = 'HxFlex';

HxDataPropToAttrValueComputer.create('HxFlex')
	.propsAsIs({
		direction: 'data-hx-flex-direction',
		wrap: 'data-hx-flex-wrap'
	})
	.and(
		'color',
		'alignItems', 'alignContent', 'justifyContent', 'gapX', 'gapY'
	)
	.register();
