// @ts-expect-error import React
import React, {type ReactNode, useContext, useState} from 'react';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';
import type {HxSelectOption} from './types';

export interface HxSelectOptionsContext extends HxReactContext {
	/**
	 * Ask the options holder for the loaded state and current options
	 * @param callback - Callback that receives the loaded state and options, invoked synchronously
	 */
	askOptions(callback: (loaded: boolean, options: Array<HxSelectOption>) => void): void;

	/**
	 * Register a listener that answers options requests
	 * @param listener - Callback function that handles ask options requests
	 */
	onAskOptions(listener: (callback: (loaded: boolean, options: Array<HxSelectOption>) => void) => void): void;

	/**
	 * Remove a listener that answers options requests
	 * @param listener - Previously registered listener function
	 */
	offAskOptions(listener: (callback: (loaded: boolean, options: Array<HxSelectOption>) => void) => void): void;

	/**
	 * Notify listeners that the initial options were loaded
	 * @param options - Loaded options
	 */
	optionsLoad(options: Array<HxSelectOption>): void;

	/**
	 * Register a listener for initial options load
	 * @param listener - Callback function called with the loaded options
	 */
	onOptionsLoad(listener: (options: Array<HxSelectOption>) => void): void;

	/**
	 * Remove a listener for initial options load
	 * @param listener - Previously registered listener function
	 */
	offOptionsLoad(listener: (options: Array<HxSelectOption>) => void): void;

	/**
	 * Notify listeners that the value should be synchronised after dependent options changed
	 * @param value - New value, null to clear the current value
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	valueChange(value: any): void;

	/**
	 * Register a listener for value synchronisation requests
	 * @param listener - Callback function called with the new value
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onValueChange(listener: (value: any) => void): void;

	/**
	 * Remove a listener for value synchronisation requests
	 * @param listener - Previously registered listener function
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	offValueChange(listener: (value: any) => void): void;

	/**
	 * Notify listeners that options were reloaded because a dependency changed
	 * @param options - Reloaded options
	 */
	optionsChange(options: Array<HxSelectOption>): void;

	/**
	 * Register a listener for dependent options reload
	 * @param listener - Callback function called with the reloaded options
	 */
	onOptionsChange(listener: (options: Array<HxSelectOption>) => void): void;

	/**
	 * Remove a listener for dependent options reload
	 * @param listener - Previously registered listener function
	 */
	offOptionsChange(listener: (options: Array<HxSelectOption>) => void): void;
}

const Context = createHxReactContext<HxSelectOptionsContext>('HxSelectOptionsContext');

export const HxSelectOptionsProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	// Create event-driven popup context instance
	const [popupContext] = useState<HxSelectOptionsContext>(() => new class extends AbstractHxReactContext implements HxSelectOptionsContext {
		/** @inheritdoc */
		askOptions(callback: (loaded: boolean, options: Array<HxSelectOption>) => void): void {
			this.emit('ask-options', callback);
		}

		/** @inheritdoc */
		onAskOptions(listener: (callback: (loaded: boolean, options: Array<HxSelectOption>) => void) => void): void {
			this.on('ask-options', listener);
		}

		/** @inheritdoc */
		offAskOptions(listener: (callback: (loaded: boolean, options: Array<HxSelectOption>) => void) => void): void {
			this.off('ask-options', listener);
		}

		/** @inheritdoc */
		optionsLoad(options: Array<HxSelectOption>): void {
			this.emit('options-load', options);
		}

		/** @inheritdoc */
		onOptionsLoad(listener: (options: Array<HxSelectOption>) => void): void {
			this.on('options-load', listener);
		}

		/** @inheritdoc */
		offOptionsLoad(listener: (options: Array<HxSelectOption>) => void): void {
			this.off('options-load', listener);
		}

		/** @inheritdoc */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		valueChange(value: any): void {
			this.emit('value-change', value);
		}

		/** @inheritdoc */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onValueChange(listener: (value: any) => void): void {
			this.on('value-change', listener);
		}

		/** @inheritdoc */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		offValueChange(listener: (value: any) => void): void {
			this.off('value-change', listener);
		}

		/** @inheritdoc */
		optionsChange(options: Array<HxSelectOption>): void {
			this.emit('options-change', options);
		}

		/** @inheritdoc */
		onOptionsChange(listener: (options: Array<HxSelectOption>) => void): void {
			this.on('options-change', listener);
		}

		/** @inheritdoc */
		offOptionsChange(listener: (options: Array<HxSelectOption>) => void): void {
			this.off('options-change', listener);
		}
	}());

	return <Context.Provider value={popupContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxSelectOptions = () => useContext(Context);
