import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type  ReactElement, type  RefAttributes} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import {DOMUtils, HxDataPropToAttrValueComputer} from '../../utils';
import {HxSeparatorDefaults} from './defaults';
import type {HxSeparatorProps} from './types';

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
 * - Configurable separator line length (horizontal) or height (vertical), with fixed 1px thickness
 * - Configurable margin spacing around the separator
 * - Reactive visibility state support
 * - Lightweight with minimal DOM footprint
 */
export const HxSeparator =
	forwardRef(<T extends object>(props: HxSeparatorProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {$model, ...rest} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);

		const restProps = DOMUtils.exposePropsToDOM(rest, $model, context, {
			key: 'HxSeparator', default: HxSeparatorDefaults, visible
		});

		return <div {...restProps}
		            data-hx-separator=""
		            data-hx-model-path={ERO.loosePathOf($model)}
		            ref={ref}/>;
	}) as unknown as HxSeparatorType;
// @ts-expect-error assign component name
HxSeparator.displayName = 'HxSeparator';

HxDataPropToAttrValueComputer.create('HxSeparator')
	.propsAsIs({
		direction: 'data-hx-separator-direction',
		size: 'data-hx-separator-size'
	})
	.and('color')
	.register();
