import {nanoid} from 'nanoid';
// @ts-expect-error import React
import React, {type ReactNode, useContext, useEffect, useRef, useState} from 'react';
import {useHxContext} from '../../contexts';
import type {HxObject, HxOverlayInstanceHandle, HxOverlayUniqueId} from '../../types';
import {AbstractHxReactContext, createHxReactContext, DOMUtils, type HxReactContext, UTCDate} from '../../utils';

export interface HxOverlayInstance {
	$overlayHandle: HxOverlayInstanceHandle;
	node: ReactNode;
}

export interface HxOverlayTemplateContext extends HxReactContext {
	/**
	 * Request the overlay instance identified by the handle to hide
	 * @param handle - Handle of the overlay instance to hide
	 */
	hide(handle: HxOverlayInstanceHandle): void;

	/**
	 * Register a listener for hide requests
	 * @param listener - Callback function called with the handle of the instance to hide
	 */
	onHide(listener: (handle: HxOverlayInstanceHandle) => void): void;

	/**
	 * Remove a listener for hide requests
	 * @param listener - Previously registered listener function
	 */
	offHide(listener: (handle: HxOverlayInstanceHandle) => void): void;

	/**
	 * Notify the template that the hide animation has completed for the instance,
	 * so the instance can be removed
	 * @param handle - Handle of the overlay instance
	 */
	hideComplete(handle: HxOverlayInstanceHandle): void;
}

const Context = createHxReactContext<HxOverlayTemplateContext>('HxOverlayTemplateContext');

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
	const [templateContext] = useState<HxOverlayTemplateContext>(() => new class extends AbstractHxReactContext implements HxOverlayTemplateContext {
		/** @inheritdoc */
		hide(handle: HxOverlayInstanceHandle): void {
			this.emit('hide-instance', handle);
		}

		/** @inheritdoc */
		onHide(listener: (handle: HxOverlayInstanceHandle) => void): void {
			this.on('hide-instance', listener);
		}

		/** @inheritdoc */
		offHide(listener: (handle: HxOverlayInstanceHandle) => void): void {
			this.off('hide-instance', listener);
		}

		/** @inheritdoc */
		hideComplete(handle: HxOverlayInstanceHandle): void {
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
			const handle = overlayId + '@' + nanoid(10) + '@' + UTCDate.now().getTime();
			instances.current.push({
				$overlayHandle: handle,
				// clone here, save performance
				node: DOMUtils.interposeToChildren({
					$model, $overlayHandle: handle, onShow: callback,
					key: handle
				}, children)
			});
			context.forceUpdate();
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
