import {EventEmitter} from '@hx/data';
import {createContext} from 'react';

export interface HxReactContext {
	/**
	 * Register custom event listener
	 * @param type - Event name
	 * @param listener - Event callback function
	 */
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

export abstract class AbstractHxReactContext implements HxReactContext {
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
}

export const createHxReactContext = <C extends HxReactContext>(name: string) => {
	const Context = createContext<C>((void 0) as unknown as C);
	Context.displayName = name;
	return Context;
};
