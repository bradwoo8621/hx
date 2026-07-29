import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import type {HxRectRange} from '../../types';

export interface HxPopupInternalContext {
	readyToShow<E extends HTMLElement>(callback: (triggerEl: E, popupRectRange: HxRectRange) => void): void;
	onReadyToShow<E extends HTMLElement>(listener: (callback: (triggerEl: E, popupRectRange: HxRectRange) => void) => void): void;
	offReadyToShow<E extends HTMLElement>(listener: (callback: (triggerEl: E, popupRectRange: HxRectRange) => void) => void): void;

	hideCompleted(): void;
	onHideCompleted(listener: () => void): void;
	offHideCompleted(listener: () => void): void;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(type: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	off(type: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	emit(type: string, ...args: any[]): void;
}

/** Popup context instance */
const Context = createContext<HxPopupInternalContext>({} as HxPopupInternalContext);
Context.displayName = 'HxPopupInternalContext';

export interface HxPopupInternalProviderProps {
	children: ReactNode;
}

export const HxPopupInternalProvider = (props: HxPopupInternalProviderProps) => {
	const {children} = props;

	const [context] = useState<HxPopupInternalContext>(() => new class implements HxPopupInternalContext {
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

		readyToShow<E extends HTMLElement>(callback: (triggerEl: E, popupRectRange: HxRectRange) => void): void {
			this.events.emit('ready-to-show', callback);
		}

		onReadyToShow<E extends HTMLElement>(listener: (callback: (triggerEl: E, popupRectRange: HxRectRange) => void) => void): void {
			this.events.on('ready-to-show', listener);
		}

		offReadyToShow<E extends HTMLElement>(listener: (callback: (triggerEl: E, popupRectRange: HxRectRange) => void) => void): void {
			this.events.off('ready-to-show', listener);
		}

		hideCompleted(): void {
			this.events.emit('hide-completed');
		}

		onHideCompleted(listener: () => void): void {
			this.events.on('hide-completed', listener);
		}

		offHideCompleted(listener: () => void): void {
			this.events.off('hide-completed', listener);
		}
	}());

	return <Context.Provider value={context}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxPopupInternalContext = () => useContext(Context);
