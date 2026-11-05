// @ts-expect-error import React
import React, {type ReactNode, useContext, useState} from 'react';
import type {HxComponentMightHaveDataProps, HxTooltipInstanceHandle, HxTooltipProps} from '../../types';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';
import {HxTooltipPortal} from './portal';

export interface HxTooltipShowOptions<T extends object> extends HxComponentMightHaveDataProps<T> {
	targetEl: HTMLElement;
	props: HxTooltipProps;
}

/**
 * Interface for tooltip context management system
 * Provides event-driven API for showing/hiding dialogs and other tooltip components
 */
export interface HxTooltipContext extends HxReactContext {
	/**
	 * Request a tooltip to show for the given target element
	 * @param options - Target element, tooltip props and optional data props
	 * @param callback - Callback that receives the new tooltip instance handle, invoked synchronously
	 */
	show<T extends object>(options: HxTooltipShowOptions<T>, callback: (handle: HxTooltipInstanceHandle) => void): void;

	/**
	 * Register a listener that answers tooltip show requests
	 * @param listener - Callback function that handles show requests and answers through its callback
	 */
	onShow<T extends object>(listener: (options: HxTooltipShowOptions<T>, callback: (handle: HxTooltipInstanceHandle) => void) => void): void;

	/**
	 * Remove a listener that answers tooltip show requests
	 * @param listener - Previously registered listener function
	 */
	offShow<T extends object>(listener: (options: HxTooltipShowOptions<T>, callback: (handle: HxTooltipInstanceHandle) => void) => void): void;

	/**
	 * Request the tooltip instance identified by the handle to hide
	 * @param handle - Handle of the tooltip instance to hide
	 */
	hide(handle: HxTooltipInstanceHandle): void;

	/**
	 * Register a listener for tooltip hide requests
	 * @param listener - Callback function called with the handle of the instance to hide
	 */
	onHide(listener: (handle: HxTooltipInstanceHandle) => void): void;

	/**
	 * Remove a listener for tooltip hide requests
	 * @param listener - Previously registered listener function
	 */
	offHide(listener: (handle: HxTooltipInstanceHandle) => void): void;
}

/**
 * React Context for tooltip management
 * Default value is a no-op implementation that warns when used without provider
 */
const Context = createHxReactContext<HxTooltipContext>('HxTooltipContext');

/**
 * Concrete implementation of HxTooltipContext
 * Uses EventEmitter for event-driven communication between tooltip components
 */
class HxOC extends AbstractHxReactContext implements HxTooltipContext {
	/** @inheritdoc */
	show<T extends object>(options: HxTooltipShowOptions<T>, callback: (handle: HxTooltipInstanceHandle) => void): void {
		this.emit('show-tooltip', options, callback);
	}

	/** @inheritdoc */
	onShow<T extends object>(listener: (options: HxTooltipShowOptions<T>, callback: (handle: HxTooltipInstanceHandle) => void) => void): void {
		this.on('show-tooltip', listener);
	}

	/** @inheritdoc */
	offShow<T extends object>(listener: (options: HxTooltipShowOptions<T>, callback: (handle: HxTooltipInstanceHandle) => void) => void): void {
		this.off('show-tooltip', listener);
	}

	/** @inheritdoc */
	hide(handle: HxTooltipInstanceHandle): void {
		this.emit('hide-tooltip', handle);
	}

	/** @inheritdoc */
	onHide(listener: (handle: HxTooltipInstanceHandle) => void): void {
		this.on('hide-tooltip', listener);
	}

	/** @inheritdoc */
	offHide(listener: (handle: HxTooltipInstanceHandle) => void): void {
		this.off('hide-tooltip', listener);
	}
}

/**
 * Provider component for HxTooltipContext
 * Wraps application to provide tooltip management capabilities to all child components
 * @param props.children - Child components to wrap
 */
export const HxTooltipProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	// Create event-driven popup context instance once on mount
	const [context] = useState<HxTooltipContext>(() => new HxOC());

	return <Context.Provider value={context}>
		<HxTooltipPortal/>
		{children}
	</Context.Provider>;
};

/**
 * React hook to access tooltip context
 * @returns HxTooltipContext instance for showing/hiding tooltips
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useHxTooltip = () => useContext(Context);
