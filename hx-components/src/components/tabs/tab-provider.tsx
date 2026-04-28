import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';

export interface HxTabContext {
	/**
	 * Check if tab is currently active
	 * @param callback - Callback that receives a boolean indicating if the tab is active
	 */
	checkActive(callback: (active: boolean) => void): void;
	/**
	 * Register a listener for checkActive requests
	 * @param listener - Listener function that handles checkActive requests
	 */
	onCheckActive(listener: (callback: (active: boolean) => void) => void): void;
	/**
	 * Unregister a checkActive listener
	 * @param listener - The listener function to remove
	 */
	offCheckActive(listener: (callback: (active: boolean) => void) => void): void;

	/**
	 * Request to activate  tab
	 */
	active(): void;
	/**
	 * Register a listener for tab activation requests
	 * @param listener - Listener function that handles activation requests
	 */
	onActive(listener: () => void): void;
	/**
	 * Unregister an activation request listener
	 * @param listener - The listener function to remove
	 */
	offActive(listener: () => void): void;
}

const Context = createContext<HxTabContext>({} as HxTabContext);
Context.displayName = 'HxTabContext';

export const HxTabProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	/**
	 * Initialize the tab context with an event emitter implementation
	 * Uses useState to ensure the context instance is only created once per tabs component
	 */
	const [tabContext] = useState<HxTabContext>(() => new class implements HxTabContext {
		private events = new EventEmitter();

		checkActive(callback: (active: boolean) => void): void {
			this.events.emit('check-active', callback);
		}

		onCheckActive(listener: (callback: (active: boolean) => void) => void): void {
			this.events.on('check-active', listener);
		}

		offCheckActive(listener: (callback: (active: boolean) => void) => void): void {
			this.events.off('check-active', listener);
		}

		active(): void {
			this.events.emit('active');
		}

		onActive(listener: () => void): void {
			this.events.on('active', listener);
		}

		offActive(listener: () => void): void {
			this.events.off('active', listener);
		}
	});

	return <Context.Provider value={tabContext}>
		{children}
	</Context.Provider>;
};

/**
 * To allow components within a tab to actively initiate the action of activating this tab.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useHxTab = () => useContext(Context);
