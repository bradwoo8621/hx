import type {ReactNode} from 'react';
import type {HxComponentDataProps, HxOverlayInstanceHandle, HxOverlayUniqueId, HxSize} from '../../types';

export type DialogWidth = HxSize;
export type DialogHeight = HxSize;

export interface HxDialogContentTemplateProps {
	/** Content to render inside the dialog */
	children: ReactNode;

	width?: DialogWidth;
	maxHeight?: DialogHeight;

	/** Allow arbitrary data attributes to be passed to the root element */
	[key: `data-${string}`]: string;
}

/**
 * Props interface for dialog content component
 */
export interface HxDialogContentProps<T extends object> extends HxDialogContentTemplateProps, HxComponentDataProps<T> {
}

export interface HxDialogBackdropProps {
	/** whether to allow default hide behavior, which are click on backdrop and press esc key */
	defaultHide?: boolean;
}

/**
 * Props interface for dialog portal component
 * Extends base component data props with dialog-specific properties
 */
export interface HxDialogPortalProps<T extends object> extends HxDialogBackdropProps, HxDialogContentProps<T> {
	/** Optional stack order of the dialog for z-index management, defaults to 1000 */
	zIndex?: number;

	/**
	 * Instance handle for the overlay, provided by the overlay context
	 * Once passed, this value should never be changed during component lifecycle
	 */
	$overlayHandle: HxOverlayInstanceHandle;
}

/**
 * Props interface for dialog template component
 * Used to register dialogs with the overlay system
 */
export interface HxDialogProps extends HxDialogContentTemplateProps, HxDialogBackdropProps {
	/** Unique identifier for the dialog within the Hx context */
	id: HxOverlayUniqueId;

	/** Optional stack order of the dialog for z-index management, defaults to 1000 */
	zIndex?: number;
}
