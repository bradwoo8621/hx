import type {ReactNode} from 'react';
import type {HxComponentDataProps, HxOverlayInstanceHandle, HxOverlayUniqueId} from '../../types';

export interface HxDialogPortalProps<T extends object> extends HxComponentDataProps<T> {
	zIndex: number;

	/** once passed, never change again */
	$overlayHandle: HxOverlayInstanceHandle;
	children: ReactNode;
	[key: `data-${string}`]: string;
}

export interface HxDialogInstanceProps<T extends object> extends HxDialogPortalProps<T> {
	/** unique overlay id in a hx context */
	id: HxOverlayUniqueId;
}
