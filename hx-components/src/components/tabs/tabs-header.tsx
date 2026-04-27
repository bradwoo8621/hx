// @ts-expect-error import React
import React from 'react';
import type {HxObject} from '../../types';
import {HxTabHeader} from './tab-header';
import type {HxExtTabsProps} from './types';

export type HxTabsHeaderProps<T extends object> =
	& Pick<HxExtTabsProps<T>, 'border' | 'borderRadius' | 'content'>
	& { $model?: HxObject<T> };

export const HxTabsHeader = <T extends object>(props: HxTabsHeaderProps<T>) => {
	const {
		$model,
		border, borderRadius,
		content
	} = props;

	return <div data-hx-tabs-header=""
	            data-hx-border-radius={borderRadius}>
		{content.map((child, index) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const {defaultActive, body, ...rest} = child;
			return <HxTabHeader {...rest} $model={$model} index={index}
			                    border={border} borderRadius={borderRadius}
			                    key={index}/>;
		})}
	</div>;
};
