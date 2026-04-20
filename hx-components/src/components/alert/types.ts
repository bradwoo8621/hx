import type {ReactNode} from 'react';
import type {HxComponentDataProps, HxOverlayInstanceHandle, HxOverlayUniqueId, HxSize} from '../../types';

export type AlertWidth = HxSize;

export interface HxAlertContentTemplateProps {
	/** Content to render inside the alert */
	children: ReactNode;

	width?: AlertWidth;

	/** Allow arbitrary data attributes to be passed to the root element */
	[key: `data-${string}`]: string;
}

/**
 * Props interface for alert content component
 */
export interface HxAlertContentProps<T extends object> extends HxAlertContentTemplateProps, HxComponentDataProps<T> {
}

export interface HxAlertBackdropProps {
	/** whether to allow default hide behavior, which are click on backdrop and press esc key */
	defaultHide?: boolean;
}

/**
 * Props interface for alert portal component
 * Extends base component data props with alert-specific properties
 */
export interface HxAlertPortalProps<T extends object> extends HxAlertBackdropProps, HxAlertContentProps<T> {
	/** Optional stack order of the alert for z-index management, defaults to 1000 */
	zIndex?: number;

	/**
	 * Instance handle for the overlay, provided by the overlay context
	 * Once passed, this value should never be changed during component lifecycle
	 */
	$overlayHandle: HxOverlayInstanceHandle;
}

/**
 * Props interface for alert template component
 * Used to register alerts with the overlay system
 */
export interface HxAlertProps extends HxAlertContentTemplateProps, HxAlertBackdropProps {
	/** Unique identifier for the alert within the Hx context */
	id: HxOverlayUniqueId;

	/** Optional stack order of the alert for z-index management, defaults to 1000 */
	zIndex?: number;
}
