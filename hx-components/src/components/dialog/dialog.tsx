// @ts-expect-error import React
import React, {type ReactNode, useRef} from 'react';
import type {HxComponentDataProps, HxDialogUniqueId} from '../../types';
import {interposeToChildren} from '../../utils';

export interface HxDialogProps<T extends object> extends HxComponentDataProps<T> {
	/** unique name in a hx context */
	id: HxDialogUniqueId;
	zIndex: number;

	/** Content to render inside the popup */
	children: ReactNode;
	[key: `data-${string}`]: string;
}

type RenderState = 'hidden' | 'prepare' | 'prepared' | 'active' | 'hide';

export const HxDialog = <T extends object>(props: HxDialogProps<T>) => {
	const {
		$model,
		zIndex,
		children,
		...rest
	} = props;

	// const context = useHxContext();
	const renderStateRef = useRef<RenderState>('hidden');
	const ref = useRef<HTMLDivElement | null>(null);

	return <div {...rest} data-hx-dialog="" role="dialog"
		// eslint-disable-next-line react-hooks/refs
		        data-hx-dialog-state={renderStateRef.current}
		        style={{zIndex}}
		        ref={ref}>
		{interposeToChildren({$model}, children)}
	</div>;
};
