import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import {exposePropsToDOM} from '../../utils';
import {HxTabsDefaults} from './defaults';
import type {HxTabsProps, HxTabsType} from './types';

export const HxTabs =
	forwardRef(<T extends object>(props: HxTabsProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			border, borderRadius = HxTabsDefaults.borderRadius,
			paddingX = HxTabsDefaults.paddingX,
			paddingT = HxTabsDefaults.paddingT, paddingB = HxTabsDefaults.paddingB,
			...rest
		} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);

		// const $modelToChild = resolveChildModel($model, $field);
		const restProps = exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            data-hx-tabs=""
		            data-hx-model-path={ERO.loosePathOf($model, $field)}
		            data-hx-border={border ? '' : (void 0)} data-hx-border-radius={borderRadius}
		            data-hx-padding-x={paddingX} data-hx-padding-t={paddingT} data-hx-padding-b={paddingB}
		            data-hx-visible={(visible ?? true) ? '' : 'no'}
		            ref={ref}>
			{/* Automatically inject the resolved model into all direct child components */}
			{/*{interposeToChildren({$model: $modelToChild}, children)}*/}
		</div>;
	}) as unknown as HxTabsType;
// @ts-expect-error assign component name
HxTabs.displayName = 'HxTabs';
