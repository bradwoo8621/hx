import type {ReactNode} from 'react';
import type {HxComponentDataProps, HxOverlayInstanceHandle, HxOverlayUniqueId} from '../../types';

/**
 * Props interface for dialog portal component
 * Extends base component data props with dialog-specific properties
 */
export interface HxDialogPortalProps<T extends object> extends HxComponentDataProps<T> {
	/** Optional stack order of the dialog for z-index management, defaults to 1000 */
	zIndex?: number;

	/**
	 * Instance handle for the overlay, provided by the overlay context
	 * Once passed, this value should never be changed during component lifecycle
	 */
	$overlayHandle: HxOverlayInstanceHandle;

	/** Content to render inside the dialog */
	children: ReactNode;

	/** Allow arbitrary data attributes to be passed to the root element */
	[key: `data-${string}`]: string;
}

/**
 * Props interface for dialog template component
 * Used to register dialogs with the overlay system
 */
export interface HxDialogInstanceProps {
	/** Unique identifier for the dialog within the Hx context */
	id: HxOverlayUniqueId;

	/** Optional stack order of the dialog for z-index management, defaults to 1000 */
	zIndex?: number;

	/** Content to render inside the dialog */
	children: ReactNode;

	/** Allow arbitrary data attributes to be passed to the root element */
	[key: `data-${string}`]: string;
}
