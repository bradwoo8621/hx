// @ts-expect-error import React
import React, {type HTMLAttributes} from 'react';
import type {HxHtmlElementProps, HxObject} from '../../types';
import type {OmittedSelectHTMLProps} from '../select';
import type {HxExtTabsProps} from './types';

export type HxTabsHeaderProps<T extends object> =
	& Pick<HxExtTabsProps<T>, 'borderRadius' | 'children'>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedSelectHTMLProps, T>
	& {
	$model?: HxObject<T>,
};

export const HxTabsHeader = <T extends object>(props: HxTabsHeaderProps<T>) => {
	const {
		// $model,
		borderRadius
		// children
	} = props;

	return <div data-hx-tabs-header=""
	            data-hx-border-radius={borderRadius}>

	</div>;
};
