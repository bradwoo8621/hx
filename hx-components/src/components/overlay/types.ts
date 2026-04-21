import type {ReactNode} from 'react';
import type {HxComponentDataProps, HxOverlayInstanceHandle, HxOverlayUniqueId, HxSize} from '../../types';

export type OverlayWidth = HxSize;
export type OverlayHeight = HxSize;

export type HxOverlayType =
	| 'alert'
	| 'dialog'
	| 'drawer-top' | 'drawer-left' | 'drawer-right' | 'drawer-bottom'
	| 'toast-tl' | 'toast-tr' | 'toast-br' | 'toast-bl';

export interface HxOverlayContentTemplateProps {
	/** Content to render inside the overlay */
	children: ReactNode;

	role: HxOverlayType;
	width?: OverlayWidth;
	maxHeight?: OverlayHeight;

	/** Allow arbitrary data attributes to be passed to the root element */
	[key: `data-${string}`]: string;
}

/**
 * Props interface for overlay content component
 */
export interface HxOverlayContentProps<T extends object> extends HxOverlayContentTemplateProps, HxComponentDataProps<T> {
}

export interface HxOverlayBackdropProps {
	role: HxOverlayType;
	/** whether to allow hide when click on backdrop */
	hideOnClickBackdrop?: boolean;
	/** whether to allow hide when press escape key */
	hideOnEscape?: boolean;
}

/**
 * Props interface for overlay portal component
 * Extends base component data props with overlay-specific properties
 */
export interface HxOverlayPortalProps<T extends object> extends HxOverlayBackdropProps, HxOverlayContentProps<T> {
	/** Optional stack order of the overlay for z-index management, defaults to 1000 */
	zIndex?: number;

	/**
	 * Instance handle for the overlay, provided by the overlay context
	 * Once passed, this value should never be changed during component lifecycle
	 */
	$overlayHandle: HxOverlayInstanceHandle;
}

/**
 * Props interface for overlay template component
 * Used to register overlays with the overlay system
 */
export interface HxOverlayProps extends HxOverlayContentTemplateProps, HxOverlayBackdropProps {
	/** Unique identifier for the overlay within the Hx context */
	id: HxOverlayUniqueId;

	/** Optional stack order of the overlay for z-index management, defaults to 1000 */
	zIndex?: number;
}
