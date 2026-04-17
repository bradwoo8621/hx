// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import type {HxOverlayInstanceHandle} from '../../types';
import {useHxOverlayInstancesContext} from './overlay-instances';

export interface HxOverlayInstanceContext {
	hide(): void;
}

const Context = createContext<HxOverlayInstanceContext>({} as HxOverlayInstanceContext);
Context.displayName = 'HxOverlayInstanceContext';

export interface HxOverlayInstanceProps {
	/** once passed, never change again */
	$overlayHandle: HxOverlayInstanceHandle;
	children: ReactNode;
}

/**
 * provide a hide function to enable the hide overlay for internal components
 */
export const HxOverlayInstanceProvider = (props: HxOverlayInstanceProps) => {
	const {$overlayHandle, children} = props;

	const overlayInstancesContext = useHxOverlayInstancesContext();
	const [context] = useState<HxOverlayInstanceContext>(() => new class implements HxOverlayInstanceContext {
		hide(): void {
			overlayInstancesContext.hide($overlayHandle);
		}
	}());

	return <Context.Provider value={context}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxOverlayInstance = () => useContext(Context);
