// @ts-expect-error import React
import React, {type ReactNode, useContext, useState} from 'react';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';

export interface HxPanelContext extends HxReactContext {
	/**
	 * Ask the panel for its current collapsed state
	 * @param callback - Callback that receives the collapsed state, invoked synchronously
	 */
	checkCollapsed(callback: (collapsed: boolean) => void): void;

	/**
	 * Register a listener that answers collapsed state requests
	 * @param listener - Callback function that handles check requests
	 */
	onCheckCollapsed(listener: (callback: (collapsed: boolean) => void) => void): void;

	/**
	 * Remove a listener that answers collapsed state requests
	 * @param listener - Previously registered listener function
	 */
	offCheckCollapsed(listener: (callback: (collapsed: boolean) => void) => void): void;

	/**
	 * Request the panel to collapse, ignored when already collapsed
	 */
	collapse(): void;

	/**
	 * Register a listener for collapse requests
	 * @param listener - Callback function called when the panel collapses
	 */
	onCollapse(listener: () => void): void;

	/**
	 * Remove a listener for collapse requests
	 * @param listener - Previously registered listener function
	 */
	offCollapse(listener: () => void): void;

	/**
	 * Request the panel to expand, ignored when already expanded
	 */
	expand(): void;

	/**
	 * Register a listener for expand requests
	 * @param listener - Callback function called when the panel expands
	 */
	onExpand(listener: () => void): void;

	/**
	 * Remove a listener for expand requests
	 * @param listener - Previously registered listener function
	 */
	offExpand(listener: () => void): void;
}

const Context = createHxReactContext<HxPanelContext>('HxPanelContext');

export const HxPanelProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	const [panelContext] = useState<HxPanelContext>(() => new class extends AbstractHxReactContext implements HxPanelContext {
		/** @inheritdoc */
		checkCollapsed(callback: (collapsed: boolean) => void): void {
			this.emit('check-collapsed', callback);
		}

		/** @inheritdoc */
		onCheckCollapsed(listener: (callback: (collapsed: boolean) => void) => void): void {
			this.on('check-collapsed', listener);
		}

		/** @inheritdoc */
		offCheckCollapsed(listener: (callback: (collapsed: boolean) => void) => void): void {
			this.off('check-collapsed', listener);
		}

		/** @inheritdoc */
		collapse(): void {
			this.emit('collapse');
		}

		/** @inheritdoc */
		onCollapse(listener: () => void): void {
			this.on('collapse', listener);
		}

		/** @inheritdoc */
		offCollapse(listener: () => void): void {
			this.off('collapse', listener);
		}

		/** @inheritdoc */
		expand(): void {
			this.emit('expand');
		}

		/** @inheritdoc */
		onExpand(listener: () => void): void {
			this.on('expand', listener);
		}

		/** @inheritdoc */
		offExpand(listener: () => void): void {
			this.off('expand', listener);
		}
	});

	return <Context.Provider value={panelContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxPanel = () => useContext(Context);
