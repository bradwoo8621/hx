import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import type {HxObject, HxOverlayInstanceHandle, HxOverlayUniqueId} from '../../types';

export interface HxOverlayContext {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	emit(type: string, ...args: any[]): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(type: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	off(type: string, listener: (...args: any[]) => void): void;

	show<T extends object>(id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void): void;
	onShow<T extends object>(listener: (id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void) => void): void;
	offShow<T extends object>(listener: (id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void) => void): void;

	hide(handle: HxOverlayInstanceHandle): void;
	onHide(listener: (handle: HxOverlayInstanceHandle) => void): void;
	offHide(listener: (handle: HxOverlayInstanceHandle) => void): void;
}

const Context = createContext<HxOverlayContext>({} as HxOverlayContext);
Context.displayName = 'HxOverlayContext';

class HxOC implements HxOverlayContext {
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

	show<T extends object>(id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void): void {
		this.events.emit('show-dialog', id, $model, callback);
	}

	onShow<T extends object>(listener: (id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void) => void): void {
		this.events.on('show-dialog', listener);
	}

	offShow<T extends object>(listener: (id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void) => void): void {
		this.events.off('show-dialog', listener);
	}

	hide(handle: HxOverlayInstanceHandle): void {
		this.events.emit('hide-dialog', handle);
	}

	onHide(listener: (handle: HxOverlayInstanceHandle) => void): void {
		this.events.on('hide-dialog', listener);
	}

	offHide(listener: (handle: HxOverlayInstanceHandle) => void): void {
		this.events.off('hide-dialog', listener);
	}
}

export const HxOverlayProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	// Create event-driven popup context instance
	const [context] = useState<HxOverlayContext>(() => new HxOC());

	return <Context.Provider value={context}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxOverlay = () => useContext(Context);
