// @ts-expect-error import React
import React, {type ReactNode, useContext, useState} from 'react';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';
import type {HxPopupRenderOptions} from './popup-provider';

export interface HxPopupInternalContext extends HxReactContext {
	/**
	 * Ask for the pending show request
	 * @param callback - Callback that receives the trigger element and options, invoked synchronously when the popup is visible
	 */
	readyToShow<E extends HTMLElement>(callback: (triggerEl: E, options: HxPopupRenderOptions) => void): void;

	/**
	 * Register a listener that answers show requests
	 * @param listener - Callback function that handles ready to show requests
	 */
	onReadyToShow<E extends HTMLElement>(listener: (callback: (triggerEl: E, options: HxPopupRenderOptions) => void) => void): void;

	/**
	 * Remove a listener that answers show requests
	 * @param listener - Previously registered listener function
	 */
	offReadyToShow<E extends HTMLElement>(listener: (callback: (triggerEl: E, options: HxPopupRenderOptions) => void) => void): void;

	/**
	 * Notify listeners that the popup has finished its hide animation and is fully hidden
	 */
	hideCompleted(): void;

	/**
	 * Register a listener for hide completion notifications
	 * @param listener - Callback function called when the popup becomes fully hidden
	 */
	onHideCompleted(listener: () => void): void;

	/**
	 * Remove a listener for hide completion notifications
	 * @param listener - Previously registered listener function
	 */
	offHideCompleted(listener: () => void): void;
}

/** Popup context instance */
const Context = createHxReactContext<HxPopupInternalContext>('HxPopupInternalContext');

export interface HxPopupInternalProviderProps {
	children: ReactNode;
}

export const HxPopupInternalProvider = (props: HxPopupInternalProviderProps) => {
	const {children} = props;

	const [context] = useState<HxPopupInternalContext>(() => new class extends AbstractHxReactContext implements HxPopupInternalContext {
		/** @inheritdoc */
		readyToShow<E extends HTMLElement>(callback: (triggerEl: E, options: HxPopupRenderOptions) => void): void {
			this.emit('ready-to-show', callback);
		}

		/** @inheritdoc */
		onReadyToShow<E extends HTMLElement>(listener: (callback: (triggerEl: E, options: HxPopupRenderOptions) => void) => void): void {
			this.on('ready-to-show', listener);
		}

		/** @inheritdoc */
		offReadyToShow<E extends HTMLElement>(listener: (callback: (triggerEl: E, options: HxPopupRenderOptions) => void) => void): void {
			this.off('ready-to-show', listener);
		}

		/** @inheritdoc */
		hideCompleted(): void {
			this.emit('hide-completed');
		}

		/** @inheritdoc */
		onHideCompleted(listener: () => void): void {
			this.on('hide-completed', listener);
		}

		/** @inheritdoc */
		offHideCompleted(listener: () => void): void {
			this.off('hide-completed', listener);
		}
	}());

	return <Context.Provider value={context}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxPopupInternalContext = () => useContext(Context);
