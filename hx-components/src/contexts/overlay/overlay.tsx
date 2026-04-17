// @ts-expect-error import React
import React, {type ReactNode, useState} from 'react';
import {type HxDialogDispatch, HxDialogDispatchProvider, useHxDialogDispatch} from './dialog-dispatch';

export interface HxOverlayProviderProps {
	children: ReactNode;
}

export const HxOverlayProvider = (props: HxOverlayProviderProps) => {
	const {children} = props;

	return <HxDialogDispatchProvider>
		{children}
	</HxDialogDispatchProvider>;
};

export interface HxOverlay {
	dialog: HxDialogDispatch;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useHxOverlay = (): HxOverlay => {
	const dialog = useHxDialogDispatch();

	const [context] = useState<HxOverlay>({
		dialog
	});

	return context;
};
