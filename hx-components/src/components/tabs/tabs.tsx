import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import {exposePropsToDOM, resolveChildModel} from '../../utils';
import {HxTabsBody} from './tabs-body';
import {HxTabsHeader} from './tabs-header';
import type {HxTabsProps} from './types';

export type HxTabsType = <T extends object>(
	props: HxTabsProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

export const HxTabs =
	forwardRef(<T extends object>(props: HxTabsProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			border, borderRadius,
			paddingX, paddingT, paddingB,
			children,
			...rest
		} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);

		const $modelToChild = resolveChildModel($model, $field);
		const restProps = exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            data-hx-tabs=""
		            data-hx-model-path={ERO.loosePathOf($model, $field)}
		            data-hx-visible={(visible ?? true) ? '' : 'no'}
		            ref={ref}>
			<HxTabsHeader $model={$modelToChild} borderRadius={borderRadius}>
				{children}
			</HxTabsHeader>
			<HxTabsBody $model={$modelToChild}
			            border={border} borderRadius={borderRadius}
			            paddingX={paddingX} paddingT={paddingT} paddingB={paddingB}>
				{children}
			</HxTabsBody>
		</div>;
	}) as unknown as HxTabsType;
// @ts-expect-error assign component name
HxTabs.displayName = 'HxTabs';
