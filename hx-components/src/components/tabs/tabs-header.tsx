// @ts-expect-error import React
import React, {type HTMLAttributes} from 'react';
import type {HxHtmlElementProps, HxObject} from '../../types';
import type {OmittedSelectHTMLProps} from '../select';
import {HxTabHeader} from './tab-header';
import type {HxExtTabsProps} from './types';

export type HxTabsHeaderProps<T extends object> =
	& Pick<HxExtTabsProps<T>, 'border' | 'borderRadius' | 'children'>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedSelectHTMLProps, T>
	& {
	$model?: HxObject<T>,
};

export const HxTabsHeader = <T extends object>(props: HxTabsHeaderProps<T>) => {
	const {
		$model,
		border, borderRadius,
		children
	} = props;

	return <div data-hx-tabs-header=""
	            data-hx-border-radius={borderRadius}>
		{children.map((child, index) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const {defaultActive, content, ...rest} = child;
			return <HxTabHeader {...rest} $model={$model} index={index}
			                    border={border} borderRadius={borderRadius}
			                    key={index}/>;
		})}
	</div>;
};
