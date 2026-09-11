// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {useHxContext} from '../../contexts';
import {HxDataAttributesUtils, HxDataPropToAttrValueComputer} from '../../utils';
import {HxLabel} from '../label';
import {HxBadgeDefaults} from './defaults';
import type {HxBadgeProps} from './types';

export type HxBadgeType = <T extends object>(
	props: HxBadgeProps<T> & RefAttributes<HTMLSpanElement>
) => ReactElement | null;

/**
 * HxBadge Component
 * Badge component for displaying status indicators, tags, counts and other annotations
 * Built on top of HxLabel for consistent text rendering and reactive capabilities
 */
export const HxBadge =
	forwardRef(<T extends object>(props: HxBadgeProps<T>, ref: ForwardedRef<HTMLSpanElement>) => {
		const {
			$model,
			// filter out a rest object
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			variant, size, borderRadius, color, paddingX,
			...rest
		} = props;

		const context = useHxContext();

		const hxDataAttrs = HxDataAttributesUtils.compute(props, $model, context, 'HxBadge', HxBadgeDefaults);

		return <HxLabel {...rest}
		                data-hx-badge=""
		                opaque={(variant ?? HxBadgeDefaults.variant) === 'solid' ? true : (void 0)}
		                {...hxDataAttrs}
		                ref={ref}/>;
	}) as unknown as HxBadgeType;
// @ts-expect-error assign component name
HxBadge.displayName = 'HxBadge';

HxDataPropToAttrValueComputer.create('HxBadge')
	.propsAsIs({
		variant: 'data-hx-badge-variant',
		size: 'data-hx-badge-size'
	})
	.and('color')
	.register();
