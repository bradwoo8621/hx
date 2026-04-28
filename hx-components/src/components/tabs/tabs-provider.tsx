import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';

/**
 * Context interface for HxTabs component state management and inter-component communication
 * Provides an event-driven API for tab header and body components to interact with the main tabs controller
 * All methods follow the observer pattern with on/off event registration and emit functionality
 */
export interface HxTabsContext {
	/**
	 * Get the currently active tab's index and mark
	 * @param callback - Callback function that receives the active tab index and mark (null if no mark is set)
	 */
	getActive(callback: (index: number, mark: string | null | undefined) => void): void;
	/**
	 * Register a listener for getActive requests
	 * @param listener - Listener function that handles getActive requests
	 */
	onGetActive(listener: (callback: (index: number, mark: (string | null | undefined)) => void) => void): void;
	/**
	 * Unregister a getActive listener
	 * @param listener - The listener function to remove
	 */
	offGetActive(listener: (callback: (index: number, mark: (string | null | undefined)) => void) => void): void;

	/**
	 * Check if a specific tab is currently active
	 * @param markOrIndex - Tab mark (string) or index (number) to check
	 * @param callback - Callback that receives a boolean indicating if the tab is active
	 */
	checkActive(markOrIndex: string | number, callback: (active: boolean) => void): void;
	/**
	 * Register a listener for checkActive requests
	 * @param listener - Listener function that handles checkActive requests
	 */
	onCheckActive(listener: (markOrIndex: string | number, callback: (active: boolean) => void) => void): void;
	/**
	 * Unregister a checkActive listener
	 * @param listener - The listener function to remove
	 */
	offCheckActive(listener: (markOrIndex: string | number, callback: (active: boolean) => void) => void): void;

	/**
	 * Check if a tab can be activated (not disabled and visible)
	 * @param index - Tab index to check
	 * @param mark - Tab mark to check
	 * @param callback - Callback that receives a boolean indicating if the tab can be activated
	 */
	checkActiveable(index: number, mark: string | null | undefined, callback: (activeable: boolean) => void): void;
	/**
	 * Register a listener for checkActiveable requests
	 * @param listener - Listener function that handles checkActiveable requests
	 */
	onCheckActiveable(listener: (index: number, mark: (string | null | undefined), callback: (activeable: boolean) => void) => void): void;
	/**
	 * Unregister a checkActiveable listener
	 * @param listener - The listener function to remove
	 */
	offCheckActiveable(listener: (index: number, mark: string | null | undefined, callback: (activeable: boolean) => void) => void): void;

	/**
	 * Request to activate a specific tab
	 * @param markOrIndex - Tab mark (string) or index (number) to activate
	 */
	active(markOrIndex: string | number): void;
	/**
	 * Register a listener for tab activation requests
	 * @param listener - Listener function that handles activation requests
	 */
	onActive(listener: (markOrIndex: string | number) => void): void;
	/**
	 * Unregister an activation request listener
	 * @param listener - The listener function to remove
	 */
	offActive(listener: (markOrIndex: string | number) => void): void;

	/**
	 * Perform tab activation (called after validation passes)
	 * @param index - Index of the tab to activate
	 * @param mark - Mark of the tab to activate
	 */
	doActive(index: number, mark: string | null | undefined): void;
	/**
	 * Register a listener for when a tab is actually activated
	 * @param listener - Listener function that handles post-activation logic
	 */
	onDoActive(listener: (index: number, mark: (string | null | undefined)) => void): void;
	/**
	 * Unregister a doActive listener
	 * @param listener - The listener function to remove
	 */
	offDoActive(listener: (index: number, mark: string | null | undefined) => void): void;

	/**
	 * Notify that a tab's active state has changed (fired for both activated and deactivated tabs)
	 * @param active - True if the tab is now active, false if it was deactivated
	 * @param index - Index of the tab whose state changed
	 * @param mark - Mark of the tab whose state changed
	 */
	activeChanged(active: boolean, index: number, mark: string | null | undefined): void;
	/**
	 * Register a listener for tab active state changes
	 * @param listener - Listener function that handles state change events
	 */
	onActiveChanged(listener: (active: boolean, index: number, mark: string | null | undefined) => void): void;
	/**
	 * Unregister an active state change listener
	 * @param listener - The listener function to remove
	 */
	offActiveChanged(listener: (active: boolean, index: number, mark: string | null | undefined) => void): void;
}

/**
 * React Context instance for HxTabs state management
 * Provides the event-driven API to all child components of the tabs
 */
const Context = createContext<HxTabsContext>({} as HxTabsContext);
Context.displayName = 'HxTabsContext';

/**
 * HxTabs Provider Component
 * Wraps the tabs component tree and provides the tabs context to all child components
 * Creates a new event emitter instance to manage all tab state and communication
 * @param props.children - Child components to wrap with the tabs context
 */
export const HxTabsProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	/**
	 * Initialize the tabs context with an event emitter implementation
	 * Uses useState to ensure the context instance is only created once per tabs component
	 */
	const [tabsContext] = useState<HxTabsContext>(() => new class implements HxTabsContext {
		/** Event emitter instance to manage all tab-related events */
		private events = new EventEmitter();

		getActive(callback: (index: number, mark: (string | null | undefined)) => void): void {
			this.events.emit('get-active', callback);
		}

		onGetActive(listener: (callback: (index: number, mark: (string | null | undefined)) => void) => void): void {
			this.events.on('get-active', listener);
		}

		offGetActive(listener: (callback: (index: number, mark: (string | null | undefined)) => void) => void): void {
			this.events.off('get-active', listener);
		}

		checkActive(markOrIndex: string | number, callback: (active: boolean) => void): void {
			this.events.emit('check-active', markOrIndex, callback);
		}

		onCheckActive(listener: (markOrIndex: string | number, callback: (active: boolean) => void) => void): void {
			this.events.on('check-active', listener);
		}

		offCheckActive(listener: (markOrIndex: string | number, callback: (active: boolean) => void) => void): void {
			this.events.off('check-active', listener);
		}

		checkActiveable(index: number, mark: string | null | undefined, callback: (activeable: boolean) => void): void {
			this.events.emit('check-activeable', index, mark, callback);
		}

		onCheckActiveable(listener: (index: number, mark: (string | null | undefined), callback: (activeable: boolean) => void) => void): void {
			this.events.on('check-activeable', listener);
		}

		offCheckActiveable(listener: (index: number, mark: (string | null | undefined), callback: (activeable: boolean) => void) => void): void {
			this.events.off('check-activeable', listener);
		}

		active(markOrIndex: string | number): void {
			this.events.emit('active', markOrIndex);
		}

		onActive(listener: (markOrIndex: (string | number)) => void): void {
			this.events.on('active', listener);
		}

		offActive(listener: (markOrIndex: (string | number)) => void): void {
			this.events.off('active', listener);
		}

		doActive(index: number, mark: string | null | undefined): void {
			this.events.emit('do-active', index, mark);
		}

		onDoActive(listener: (index: number, mark: (string | null | undefined)) => void): void {
			this.events.on('do-active', listener);
		}

		offDoActive(listener: (index: number, mark: (string | null | undefined)) => void): void {
			this.events.off('do-active', listener);
		}

		activeChanged(active: boolean, index: number, mark: string | null | undefined): void {
			this.events.emit('active-changed', active, index, mark);
		}

		onActiveChanged(listener: (active: boolean, index: number, mark: string | null | undefined) => void): void {
			this.events.on('active-changed', listener);
		}

		offActiveChanged(listener: (active: boolean, index: number, mark: string | null | undefined) => void): void {
			this.events.off('active-changed', listener);
		}
	});

	return <Context.Provider value={tabsContext}>
		{children}
	</Context.Provider>;
};

/**
 * Custom hook to access the HxTabs context
 * Must be used within a child component of HxTabsProvider
 * @returns The HxTabs context instance with all event methods
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useHxTabs = () => useContext(Context);
