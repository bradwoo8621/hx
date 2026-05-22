import {EventEmitter} from '@hx/data';
import {nanoid} from 'nanoid';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useEffect, useRef, useState} from 'react';
import {useHxContext} from '../../contexts';
import type {HxObject, HxOverlayInstanceHandle, HxOverlayUniqueId} from '../../types';
import {DOMUtils} from '../../utils';

export interface HxOverlayInstance {
	$overlayHandle: HxOverlayInstanceHandle;
	node: ReactNode;
}

export interface HxOverlayTemplateContext {
	hide(handle: HxOverlayInstanceHandle): void;
	onHide(listener: (handle: HxOverlayInstanceHandle) => void): void;
	offHide(listener: (handle: HxOverlayInstanceHandle) => void): void;
	hideComplete(handle: HxOverlayInstanceHandle): void;
}

const Context = createContext<HxOverlayTemplateContext>({} as HxOverlayTemplateContext);
Context.displayName = 'HxOverlayTemplateContext';

export interface HxOverlayTemplateProviderProps {
	id: HxOverlayUniqueId;
	/* must be overlay content template, such as dialog, drawer, toast, etc. */
	children: ReactNode;
}

/**
 * allow multiple instances for one overlay template.
 * which means the passed-in children is a template of overlay.
 */
export const HxOverlayTemplateProvider = <T extends object>(props: HxOverlayTemplateProviderProps) => {
	const {id: overlayId, children} = props;

	const context = useHxContext();
	const instances = useRef<Array<HxOverlayInstance>>([]);

	// Create event-driven popup context instance
	const [templateContext] = useState<HxOverlayTemplateContext>(() => new class implements HxOverlayTemplateContext {
		private events = new EventEmitter();

		hide(handle: HxOverlayInstanceHandle): void {
			this.events.emit('hide-instance', handle);
		}

		onHide(listener: (handle: HxOverlayInstanceHandle) => void): void {
			this.events.on('hide-instance', listener);
		}

		offHide(listener: (handle: HxOverlayInstanceHandle) => void): void {
			this.events.off('hide-instance', listener);
		}

		hideComplete(handle: HxOverlayInstanceHandle) {
			const index = instances.current.findIndex(instance => instance.$overlayHandle == handle);
			if (index !== -1) {
				instances.current.splice(index, 1);
				context.forceUpdate();
			}
		}
	}());
	// monitor the show/hide from overlay context
	useEffect(() => {
		const onShow = (id: HxOverlayUniqueId, $model: HxObject<T>, callback?: (handle: HxOverlayInstanceHandle) => void) => {
			if (overlayId != id) {
				return;
			}
			const handle = overlayId + '@' + nanoid(10) + '@' + new Date().getTime();
			instances.current.push({
				$overlayHandle: handle,
				// clone here, save performance
				node: DOMUtils.interposeToChildren({$model, $overlayHandle: handle, key: handle}, children)
			});
			context.forceUpdate();
			callback?.(handle);
		};
		const onHide = (handle: HxOverlayInstanceHandle) => {
			templateContext.hide(handle);
		};
		context.overlay.onShow(onShow);
		context.overlay.onHide(onHide);

		return () => {
			context.overlay.offShow(onShow);
			context.overlay.offHide(onHide);
		};
	}, [overlayId, instances, templateContext, context, children]);

	return <Context.Provider value={templateContext}>
		{instances.current.map(instance => instance.node)}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxOverlayTemplate = () => useContext(Context);
