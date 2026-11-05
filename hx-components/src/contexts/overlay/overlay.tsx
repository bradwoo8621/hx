// @ts-expect-error import React
import React, {type ReactNode, useContext, useState} from 'react';
import type {HxObject, HxOverlayInstanceHandle, HxOverlayUniqueId} from '../../types';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';

/**
 * Interface for overlay context management system
 * Provides event-driven API for showing/hiding dialogs and other overlay components
 */
export interface HxOverlayContext extends HxReactContext {
	/**
	 * Show an overlay instance by ID
	 * @param id - Unique identifier of the overlay to show
	 * @param $model - Reactive data model to pass to the overlay component
	 * @param callback - Optional callback invoked after overlay is rendered, receives instance handle
	 */
	show<T extends object>(id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void): void;

	/**
	 * Register listener for overlay show events
	 * @param listener - Callback invoked when any overlay is shown
	 */
	onShow<T extends object>(listener: (id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void) => void): void;

	/**
	 * Remove overlay show event listener
	 * @param listener - Callback to remove from show events
	 */
	offShow<T extends object>(listener: (id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void) => void): void;

	/**
	 * Hide an overlay instance
	 * @param handle - Instance handle of the overlay to hide
	 */
	hide(handle: HxOverlayInstanceHandle): void;

	/**
	 * Register listener for overlay hide events
	 * @param listener - Callback invoked when any overlay is hidden
	 */
	onHide(listener: (handle: HxOverlayInstanceHandle) => void): void;

	/**
	 * Remove overlay hide event listener
	 * @param listener - Callback to remove from hide events
	 */
	offHide(listener: (handle: HxOverlayInstanceHandle) => void): void;
}

/**
 * React Context for overlay management
 * Default value is a no-op implementation that warns when used without provider
 */
const Context = createHxReactContext<HxOverlayContext>('HxOverlayContext');

/**
 * Concrete implementation of HxOverlayContext
 * Uses EventEmitter for event-driven communication between overlay components
 */
class HxOC extends AbstractHxReactContext implements HxOverlayContext {
	/** @inheritdoc */
	show<T extends object>(id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void): void {
		this.emit('show-dialog', id, $model, callback);
	}

	/** @inheritdoc */
	onShow<T extends object>(listener: (id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void) => void): void {
		this.on('show-dialog', listener);
	}

	/** @inheritdoc */
	offShow<T extends object>(listener: (id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void) => void): void {
		this.off('show-dialog', listener);
	}

	/** @inheritdoc */
	hide(handle: HxOverlayInstanceHandle): void {
		this.emit('hide-dialog', handle);
	}

	/** @inheritdoc */
	onHide(listener: (handle: HxOverlayInstanceHandle) => void): void {
		this.on('hide-dialog', listener);
	}

	/** @inheritdoc */
	offHide(listener: (handle: HxOverlayInstanceHandle) => void): void {
		this.off('hide-dialog', listener);
	}
}

/**
 * Provider component for HxOverlayContext
 * Wraps application to provide overlay management capabilities to all child components
 * @param props.children - Child components to wrap
 */
export const HxOverlayProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	// Create event-driven popup context instance once on mount
	const [context] = useState<HxOverlayContext>(() => new HxOC());

	return <Context.Provider value={context}>
		{children}
	</Context.Provider>;
};

/**
 * React hook to access overlay context
 * @returns HxOverlayContext instance for showing/hiding overlays
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useHxOverlay = () => useContext(Context);
