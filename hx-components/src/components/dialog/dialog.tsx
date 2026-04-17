// @ts-expect-error import React
import React from 'react';
import {HxOverlayInstancesProvider} from '../../contexts';
import {HxDialogPortal} from './dialog-portal';
import type {HxDialogInstanceProps} from './types';

export const HxDialog = <T extends object>(props: HxDialogInstanceProps<T>) => {
	const {
		id,
		children,
		...rest
	} = props;

	return <HxOverlayInstancesProvider id={id}>
		<HxDialogPortal {...rest}>
			{children}
		</HxDialogPortal>
	</HxOverlayInstancesProvider>;
};
