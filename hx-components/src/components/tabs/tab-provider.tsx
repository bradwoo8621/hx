// @ts-expect-error import React
import React, {type ReactNode, useContext, useState} from 'react';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';

export interface HxTabContext extends HxReactContext {
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

const Context = createHxReactContext<HxTabContext>('HxTabContext');

export const HxTabProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	/**
	 * Initialize the tab context with an event emitter implementation
	 * Uses useState to ensure the context instance is only created once per tabs component
	 */
	const [tabContext] = useState<HxTabContext>(() => new class extends AbstractHxReactContext implements HxTabContext {
		/** @inheritdoc */
		checkActive(callback: (active: boolean) => void): void {
			this.emit('check-active', callback);
		}

		/** @inheritdoc */
		onCheckActive(listener: (callback: (active: boolean) => void) => void): void {
			this.on('check-active', listener);
		}

		/** @inheritdoc */
		offCheckActive(listener: (callback: (active: boolean) => void) => void): void {
			this.off('check-active', listener);
		}

		/** @inheritdoc */
		active(): void {
			this.emit('active');
		}

		/** @inheritdoc */
		onActive(listener: () => void): void {
			this.on('active', listener);
		}

		/** @inheritdoc */
		offActive(listener: () => void): void {
			this.off('active', listener);
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
