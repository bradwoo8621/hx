import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useState} from 'react';
import type {DialogHandle, HxObject} from '../../types';

export interface HxDialogDispatch {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	emit(type: string, ...args: any[]): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(type: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	off(type: string, listener: (...args: any[]) => void): void;

	show<T extends object>($model: HxObject<T>, callback?: (handle: DialogHandle) => void): void;
	onShow<T extends object>(listener: ($model: HxObject<T>, callback?: (handle: DialogHandle) => void) => void): void;
	offShow<T extends object>(listener: ($model: HxObject<T>, callback?: (handle: DialogHandle) => void) => void): void;
	hide(handle: DialogHandle): void;
	onHide(listener: (handle: DialogHandle) => void): void;
	offHide(listener: (handle: DialogHandle) => void): void;
}

const Context = createContext<HxDialogDispatch>({} as HxDialogDispatch);
Context.displayName = 'HxDialogDispatch';

export interface HxDialogDispatchProviderProps {
	children: ReactNode;
}

export const HxDialogDispatchProvider = (props: HxDialogDispatchProviderProps) => {
	const {children} = props;

	// Create event-driven popup context instance
	const [dispatch] = useState<HxDialogDispatch>(() => new class implements HxDialogDispatch {
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

		show<T extends object>($model: HxObject<T>, callback?: (handle: DialogHandle) => void): void {
			this.events.emit('show-dialog', $model, callback);
		}

		onShow<T extends object>(listener: ($model: HxObject<T>, callback?: (handle: DialogHandle) => void) => void): void {
			this.events.on('show-dialog', listener);
		}

		offShow<T extends object>(listener: ($model: HxObject<T>, callback?: (handle: DialogHandle) => void) => void): void {
			this.events.off('show-dialog', listener);
		}

		hide(handle: DialogHandle): void {
			this.events.emit('hide-dialog', handle);
		}

		onHide(listener: (handle: DialogHandle) => void): void {
			this.events.on('hide-dialog', listener);
		}

		offHide(listener: (handle: DialogHandle) => void): void {
			this.events.off('hide-dialog', listener);
		}
	}());

	return <Context.Provider value={dispatch}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxDialogDispatch = () => useContext(Context);
