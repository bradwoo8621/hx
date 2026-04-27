// @ts-expect-error import React
import React from 'react';
import {useDataMonitor} from '../../hooks';
import type {HxObject} from '../../types';
import type {HxTab, HxTabsBorderRadius} from './types';

export type HxTabHeaderProps<T extends object> =
	& Omit<HxTab<T>, 'defaultActive' | 'content'>
	& {
	border?: boolean;
	borderRadius?: HxTabsBorderRadius;
	$model?: HxObject<T>,
	index: number;
};

export const HxTabHeader = <T extends object>(props: HxTabHeaderProps<T>) => {
	const {
		mark: givenMark,
	} = props;

	const {visible, disabled} = useDataMonitor(props);

	const mark = givenMark || (void 0);

	return <div data-hx-tab-header=""
	            data-hx-tab-mark={mark}
	            data-hx-visible={(visible ?? true) ? '' : 'no'}
	            data-hx-disabled={(disabled ?? false) ? '' : (void 0)}>
	</div>;
};
