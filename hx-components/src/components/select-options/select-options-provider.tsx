import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import type {HxSelectOption} from './types';

export interface HxSelectOptionsContext {
	optionsLoad(options: Array<HxSelectOption>): void;
	onOptionsLoad(listener: (options: Array<HxSelectOption>) => void): void;
	offOptionsLoad(listener: (options: Array<HxSelectOption>) => void): void;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	valueChange(value: any): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onValueChange(listener: (value: any) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	offValueChange(listener: (value: any) => void): void;

	optionsChange(options: Array<HxSelectOption>): void;
	onOptionsChange(listener: (options: Array<HxSelectOption>) => void): void;
	offOptionsChange(listener: (options: Array<HxSelectOption>) => void): void;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(type: string, listener: (...args: any[]) => void): void;

	/**
	 * Remove custom event listener
	 * @param type - Event name
	 * @param listener - Previously registered callback function
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	off(type: string, listener: (...args: any[]) => void): void;

	/**
	 * Emit custom event
	 * @param type - Event name
	 * @param args - Event arguments to pass to listeners
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	emit(type: string, ...args: any[]): void;
}

const Context = createContext<HxSelectOptionsContext>({} as HxSelectOptionsContext);
Context.displayName = 'HxSelectOptionsContext';

export const HxSelectOptionsProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	// Create event-driven popup context instance
	const [popupContext] = useState<HxSelectOptionsContext>(() => new class implements HxSelectOptionsContext {
		private events = new EventEmitter();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		emit(type: string, ...args: any[]): void {
			this.events.emit(type, ...args);
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		off(type: string, listener: (...args: any[]) => void): void {
			this.events.off(type, listener);
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		on(type: string, listener: (...args: any[]) => void): void {
			this.events.on(type, listener);
		}

		optionsLoad(options: Array<HxSelectOption>): void {
			this.events.emit('options-load', options);
		}

		onOptionsLoad(listener: (options: Array<HxSelectOption>) => void): void {
			this.events.on('options-load', listener);
		}

		offOptionsLoad(listener: (options: Array<HxSelectOption>) => void): void {
			this.events.off('options-load', listener);
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		valueChange(value: any): void {
			this.events.emit('value-change', value);
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onValueChange(listener: (value: any) => void): void {
			this.events.on('value-change', listener);
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		offValueChange(listener: (value: any) => void): void {
			this.events.off('value-change', listener);
		}

		optionsChange(options: Array<HxSelectOption>): void {
			this.events.emit('options-change', options);
		}

		onOptionsChange(listener: (options: Array<HxSelectOption>) => void): void {
			this.events.on('options-change', listener);
		}

		offOptionsChange(listener: (options: Array<HxSelectOption>) => void): void {
			this.events.off('options-change', listener);
		}
	}());

	return <Context.Provider value={popupContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxSelectOptionsContext = () => useContext(Context);
