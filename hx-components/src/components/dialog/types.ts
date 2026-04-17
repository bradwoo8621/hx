import type {ReactNode} from 'react';
import type {HxComponentDataProps, HxOverlayInstanceHandle, HxOverlayUniqueId} from '../../types';

export interface HxDialogPortalProps<T extends object> extends HxComponentDataProps<T> {
	$overlayHandle: HxOverlayInstanceHandle;

	zIndex: number;

	/** Content to render inside the popup */
	children: ReactNode;
	[key: `data-${string}`]: string;
}

export interface HxDialogInstanceProps<T extends object> extends HxDialogPortalProps<T> {
	/** unique overlay id in a hx context */
	id: HxOverlayUniqueId;
}
