import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import type {HxObject, HxTooltipInstanceHandle, HxTooltipProps} from '../../types';
import {HxTooltipPortal} from './portal';

export interface HxTooltipShowOptions<T extends object> {
	targetEl: HTMLElement;
	props: HxTooltipProps;
	$model?: HxObject<T>;
}

/**
 * Interface for tooltip context management system
 * Provides event-driven API for showing/hiding dialogs and other tooltip components
 */
export interface HxTooltipContext {
	/**
	 * Emit an event with arbitrary arguments
	 * @param type - Event name/type
	 * @param args - Additional event arguments
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	emit(type: string, ...args: any[]): void;

	/**
	 * Register an event listener
	 * @param type - Event name/type to listen for
	 * @param listener - Callback function to invoke when event is emitted
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(type: string, listener: (...args: any[]) => void): void;

	/**
	 * Remove an event listener
	 * @param type - Event name/type
	 * @param listener - Callback function to remove
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	off(type: string, listener: (...args: any[]) => void): void;

	show<T extends object>(options: HxTooltipShowOptions<T>, callback: (handle: HxTooltipInstanceHandle) => void): void;

	onShow<T extends object>(listener: (options: HxTooltipShowOptions<T>, callback: (handle: HxTooltipInstanceHandle) => void) => void): void;

	offShow<T extends object>(listener: (options: HxTooltipShowOptions<T>, callback: (handle: HxTooltipInstanceHandle) => void) => void): void;

	hide(handle: HxTooltipInstanceHandle): void;

	onHide(listener: (handle: HxTooltipInstanceHandle) => void): void;

	offHide(listener: (handle: HxTooltipInstanceHandle) => void): void;
}

/**
 * React Context for tooltip management
 * Default value is a no-op implementation that warns when used without provider
 */
const Context = createContext<HxTooltipContext>({} as HxTooltipContext);
Context.displayName = 'HxTooltipContext';

/**
 * Concrete implementation of HxTooltipContext
 * Uses EventEmitter for event-driven communication between tooltip components
 */
class HxOC implements HxTooltipContext {
	/** Event emitter instance for handling all tooltip events */
	private events = new EventEmitter();

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	emit(type: string, ...args: any[]): void {
		this.events.emit(type, ...args);
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	off(type: string, listener: (...args: any[]) => void): void {
		this.events.off(type, listener);
	}

	/** @inheritdoc */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(type: string, listener: (...args: any[]) => void): void {
		this.events.on(type, listener);
	}

	/** @inheritdoc */
	show<T extends object>(options: HxTooltipShowOptions<T>, callback: (handle: HxTooltipInstanceHandle) => void): void {
		this.events.emit('show-tooltip', options, callback);
	}

	/** @inheritdoc */
	onShow<T extends object>(listener: (options: HxTooltipShowOptions<T>, callback: (handle: HxTooltipInstanceHandle) => void) => void): void {
		this.events.on('show-tooltip', listener);
	}

	/** @inheritdoc */
	offShow<T extends object>(listener: (options: HxTooltipShowOptions<T>, callback: (handle: HxTooltipInstanceHandle) => void) => void): void {
		this.events.off('show-tooltip', listener);
	}

	/** @inheritdoc */
	hide(handle: HxTooltipInstanceHandle): void {
		this.events.emit('hide-tooltip', handle);
	}

	/** @inheritdoc */
	onHide(listener: (handle: HxTooltipInstanceHandle) => void): void {
		this.events.on('hide-tooltip', listener);
	}

	/** @inheritdoc */
	offHide(listener: (handle: HxTooltipInstanceHandle) => void): void {
		this.events.off('hide-tooltip', listener);
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
