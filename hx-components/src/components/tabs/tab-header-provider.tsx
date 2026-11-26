// @ts-expect-error import React
import React, {type ReactNode, useContext, useState} from 'react';
import {type HxContext, HxHierarchyProvider} from '../../contexts';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';

export interface HxTabHeaderContext extends HxReactContext {
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

const Context = createHxReactContext<HxTabHeaderContext>('HxTabHeaderContext');

class HxTabHeaderContextImpl extends AbstractHxReactContext implements HxTabHeaderContext {
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
}

export const HxTabHeaderProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	/**
	 * Initialize the tab context with an event emitter implementation
	 * Uses useState to ensure the context instance is only created once per tabs component
	 */
	const [tabHeaderContext] = useState<HxTabHeaderContext>(() => new HxTabHeaderContextImpl());

	return <Context.Provider value={tabHeaderContext}>
		<HxHierarchyProvider context={tabHeaderContext} contextDisplayName="HxTabHeaderContext">
			{children}
		</HxHierarchyProvider>
	</Context.Provider>;
};

/**
 * To allow components within a tab to actively initiate the action of activating this tab.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useHxTabHeader = () => useContext(Context);

// eslint-disable-next-line react-refresh/only-export-components
export const findClosestHxTabHeader = (context: HxContext): HxTabHeaderContext | undefined => {
	// noinspection CssInvalidHtmlTagReference
	return context.hierarchy?.closest<HxTabHeaderContext>('HxTabHeaderContext') ?? (void 0);
};
