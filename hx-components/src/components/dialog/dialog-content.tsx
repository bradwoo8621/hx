// @ts-expect-error import React
import React, {useRef} from 'react';
import {interposeToChildren} from '../../utils';
import type {HxDialogPortalProps} from './types';

export type HxDialogContentProps<T extends object> = Omit<HxDialogPortalProps<T>, '$overlayHandle' | 'zIndex'>;

export const HxDialogContent = <T extends object>(props: HxDialogContentProps<T>) => {
	const {
		$model, children,
		...rest
	} = props;

	const ref = useRef<HTMLDivElement | null>(null);

	return <div {...rest} data-hx-dialog="" role="dialog" ref={ref}>
		{interposeToChildren({$model}, children)}
	</div>;
};
