import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import {DOMUtils, HxDataPropToAttrValueComputer, HxDataUtils} from '../../utils';
import {HxGridDefaults} from './defaults';
import type {HxGridProps} from './types';

export type HxGridType = <T extends object>(
	props: HxGridProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * Reactive grid layout component for building responsive UI layouts.
 * Provides consistent column-based layout with configurable gaps, borders, and padding
 * based on design system tokens. Supports 12, 15, and 16 column layouts.
 *
 * @example
 * ```tsx
 * // Default 12-column grid layout with medium gap
 * <HxGrid columns={12} gapX="md">
 *   <div data-hx-grid-cell-cols="6">Column 1 (6 columns)</div>
 *   <div data-hx-grid-cell-cols="6">Column 2 (6 columns)</div>
 * </HxGrid>
 * ```
 *
 * @example
 * ```tsx
 * // 16-column grid with border and padding
 * <HxGrid columns={16} gapX="sm" gapY="md" border paddingX="lg" paddingT="md">
 *   <div data-hx-grid-cell-cols="4">Sidebar (4 columns)</div>
 *   <div data-hx-grid-cell-cols="12">Main Content (12 columns)</div>
 * </HxGrid>
 * ```
 *
 * @example
 * ```tsx
 * // Automatic nested model propagation to children
 * const form = reactive({
 *   user: {
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     email: 'john@example.com'
 *   }
 * });
 * <HxGrid $model={form} $field="user" columns={12} gapX="md">
 *   <HxInput $field="firstName" data-hx-grid-cell-cols="6" />
 *   <HxInput $field="lastName" data-hx-grid-cell-cols="6" />
 *   <HxInput $field="email" data-hx-grid-cell-cols="12" />
 * </HxGrid>
 * ```
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
		const {$model, $field, children, ...rest} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);

		const $modelToChild = HxDataUtils.resolveChildModel($model, $field);
		const restProps = DOMUtils.exposePropsToDOM(rest, $model, context, {
			key: 'HxGrid', default: HxGridDefaults, visible
		});

		return <div {...restProps}
		            data-hx-grid=""
		            data-hx-model-path={ERO.loosePathOf($model, $field)}
		            ref={ref}>
			{/* Automatically inject the resolved model into all direct child components */}
			{DOMUtils.interposeToChildren({$model: $modelToChild}, children)}
		</div>;
	}) as unknown as HxGridType;
// @ts-expect-error assign component name
HxGrid.displayName = 'HxGrid';

HxDataPropToAttrValueComputer.create('HxGrid')
	.propsAsIs({columns: 'data-hx-grid-columns'})
	.and(
		'color',
		'alignItems', 'alignContent', 'justifyItems', 'justifyContent', 'gapX', 'gapY'
	)
	.register();
