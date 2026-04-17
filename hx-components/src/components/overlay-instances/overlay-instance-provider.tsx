import {EventEmitter} from '@hx/data';
import {nanoid} from 'nanoid';
import {createContext, type ReactNode, useContext, useEffect, useRef, useState} from 'react';
import {useHxContext} from '../../contexts';
import type {HxObject, HxOverlayInstanceHandle, HxOverlayUniqueId} from '../../types';
import {interposeToChildren} from '../../utils';

export interface HxOverlayInstance<T extends object> {
	$model: HxObject<T>;
	$overlayHandle: HxOverlayInstanceHandle;
}

export interface HxOverlayInstancesContext {
	hide(handle: HxOverlayInstanceHandle): void;
	onHide(listener: (handle: HxOverlayInstanceHandle, completedCallback: () => void) => void): void;
	offHide(listener: (handle: HxOverlayInstanceHandle, completedCallback: () => void) => void): void;
}

const Context = createContext<HxOverlayInstancesContext>({} as HxOverlayInstancesContext);
Context.displayName = 'HxOverlayInstancesContext';

export interface HxOverlayInstancesProviderProps {
	id: HxOverlayUniqueId;
	/* must be overlay component, such as dialog, drawer, toast, etc. */
	children: ReactNode;
}

/**
 * allow multiple instances for one overlay.
 * which means the passed-in children is a template of overlay.
 */
export const HxOverlayInstancesProvider = <T extends object>(props: HxOverlayInstancesProviderProps) => {
	const {id: overlayId, children} = props;

	const context = useHxContext();
	const instances = useRef<Array<HxOverlayInstance<T>>>([]);

	// Create event-driven popup context instance
	const [instanceContext] = useState<HxOverlayInstancesContext>(() => new class implements HxOverlayInstancesContext {
		private events = new EventEmitter();

		hide(handle: HxOverlayInstanceHandle): void {
			this.events.emit('hide-instance', handle, () => {
				const index = instances.current.findIndex(instance => instance.$overlayHandle == handle);
				if (index !== -1) {
					instances.current.splice(index, 1);
					context.forceUpdate();
				}
			});
		}

		onHide(listener: (handle: HxOverlayInstanceHandle, completedCallback: () => void) => void): void {
			this.events.on('hide-instance', listener);
		}

		offHide(listener: (handle: HxOverlayInstanceHandle, completedCallback: () => void) => void): void {
			this.events.off('hide-instance', listener);
		}
	}());
	// monitor the show/hide from overlay context
	useEffect(() => {
		const onShow = (id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void) => {
			if (overlayId != id) {
				return;
			}
			const handle = overlayId + '@' + nanoid(10) + '@' + new Date().getTime();
			instances.current.push({$model, $overlayHandle: handle});
			context.forceUpdate();
			callback?.(handle);
		};
		const onHide = (handle: HxOverlayInstanceHandle) => {
			instanceContext.hide(handle);
		};
		context.overlay.onShow(onShow);
		context.overlay.onHide(onHide);

		return () => {
			context.overlay.offShow(onShow);
			context.overlay.offHide(onHide);
		};
	}, [overlayId, instances, instanceContext, context]);

	return <Context.Provider value={instanceContext}>
		{instances.current.map(instance => {
			return interposeToChildren(instance, children);
		})}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxOverlayInstancesContext = () => useContext(Context);
