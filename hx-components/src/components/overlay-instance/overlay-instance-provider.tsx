import {EventEmitter} from '@hx/data';
import {nanoid} from 'nanoid';
import {createContext, type ReactNode, useContext, useEffect, useState} from 'react';
import {useHxContext} from '../../contexts';
import type {HxOverlayInstanceHandle, HxOverlayUniqueId, HxObject} from '../../types';

export interface HxOverlayInstanceContext {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(type: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	off(type: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	emit(type: string, ...args: any[]): void;
	hide(): void;
}

const Context = createContext<HxOverlayInstanceContext>({} as HxOverlayInstanceContext);
Context.displayName = 'HxOverlayInstanceContext';

export interface HxOverlayInstanceProviderProps {
	id: HxOverlayUniqueId;
	children: ReactNode;
}

export interface HxOverlayInstanceProviderState<T extends object> {
	$model?: HxObject<T>;
	handle?: HxOverlayInstanceHandle;
	visible: boolean;
}

export const HxDialogProvider = <T extends object>(props: HxOverlayInstanceProviderProps) => {
	const {id: dialogId, children} = props;

	const context = useHxContext();
	const [state, setState] = useState<HxOverlayInstanceProviderState<T>>({visible: false});
	// Create event-driven popup context instance
	const [instanceContext] = useState<HxOverlayInstanceContext>(() => new class implements HxOverlayInstanceContext {
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
		const onShow = (id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void) => {
			if (dialogId != id) {
				return;
			}
			const handle = dialogId + '@' + nanoid(10);
			setState({$model, handle, visible: true});
			callback?.(handle);
		};
		const onHide = (handle: HxOverlayInstanceHandle) => {
			if (state.handle == null && state.handle !== handle) {
				return;
			}
			instanceContext.hide();
		};
		context.overlay.onShow(onShow);
		context.overlay.onHide(onHide);

		return () => {
			context.overlay.offShow(onShow);
			context.overlay.offHide(onHide);
		};
	}, [dialogId, context, instanceContext, state.handle]);

	return <Context.Provider value={instanceContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxOverlayInstanceContext = () => useContext(Context);
