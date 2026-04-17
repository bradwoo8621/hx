import {EventEmitter} from '@hx/data';
import {nanoid} from 'nanoid';
import {createContext, type ReactNode, useContext, useEffect, useState} from 'react';
import {useHxContext} from '../../contexts';
import type {HxDialogHandle, HxDialogUniqueId, HxObject} from '../../types';

export interface HxDialogContext {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(type: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	off(type: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	emit(type: string, ...args: any[]): void;
	hide(): void;
}

const Context = createContext<HxDialogContext>({} as HxDialogContext);
Context.displayName = 'HxDialogContext';

export interface HxDialogProviderProps {
	id: HxDialogUniqueId;
	children: ReactNode;
}

export interface HxDialogProviderState<T extends object> {
	$model?: HxObject<T>;
	handle?: HxDialogHandle;
	visible: boolean;
}

export const HxDialogProvider = <T extends object>(props: HxDialogProviderProps) => {
	const {id: dialogId, children} = props;

	const context = useHxContext();
	const [state, setState] = useState<HxDialogProviderState<T>>({visible: false});
	// Create event-driven popup context instance
	const [dialogContext] = useState<HxDialogContext>(() => new class implements HxDialogContext {
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

		hide(): void {
			setState(state => ({$model: state.$model, visible: false}));
		}
	}());
	useEffect(() => {
		const onShow = (id: HxDialogUniqueId, $model: HxObject<T>, callback?: (handle: HxDialogHandle) => void) => {
			if (dialogId != id) {
				return;
			}
			const handle = dialogId + '@' + nanoid(10);
			setState({$model, handle, visible: true});
			callback?.(handle);
		};
		const onHide = (handle: HxDialogHandle) => {
			if (state.handle == null && state.handle !== handle) {
				return;
			}
			dialogContext.hide();
		};
		context.dialog.onShow(onShow);
		context.dialog.onHide(onHide);

		return () => {
			context.dialog.offShow(onShow);
			context.dialog.offHide(onHide);
		};
	}, [dialogId, context, dialogContext, state.handle]);

	return <Context.Provider value={dialogContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxDialogContext = () => useContext(Context);
