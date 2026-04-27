// @ts-expect-error import React
import React, {type HTMLAttributes} from 'react';
import type {HxHtmlElementProps, HxObject} from '../../types';
import type {OmittedSelectHTMLProps} from '../select';
import {HxTabsDefaults} from './defaults';
import type {HxExtTabsProps} from './types';

export type HxTabsBodyProps<T extends object> =
	& Pick<HxExtTabsProps<T>, 'border' | 'borderRadius' | 'paddingX' | 'paddingT' | 'paddingB' | 'children'>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedSelectHTMLProps, T>
	& {
	$model?: HxObject<T>,
};

export const HxTabsBody = <T extends object>(props: HxTabsBodyProps<T>) => {
	const {
		// $model,
		border, borderRadius = HxTabsDefaults.borderRadius,
		paddingX = HxTabsDefaults.paddingX,
		paddingT = HxTabsDefaults.paddingT, paddingB = HxTabsDefaults.paddingB
		// children
	} = props;

	return <div data-hx-tabs-body=""
	            data-hx-border={border ? '' : (void 0)} data-hx-border-radius={borderRadius}
	            data-hx-padding-x={paddingX} data-hx-padding-t={paddingT} data-hx-padding-b={paddingB}>

	</div>;
};
