// @ts-expect-error import React
import React, {type ReactNode, useContext, useEffect, useState} from 'react';
import type {HxOverlayInstanceHandle} from '../../types';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';
import {useHxOverlayTemplate} from './overlay-template';

/**
 * exposed overlay instance context
 */
export interface HxOverlayInstanceContext {
	hide(): void;
}

/**
 * inner overlay instance context
 */
export interface HxOverlayInstanceInnerContext extends HxOverlayInstanceContext, HxReactContext {
	/**
	 * Register a listener for hide requests
	 * @param listener - Callback function called when the overlay should hide
	 */
	onHide(listener: () => void): void;

	/**
	 * Remove a listener for hide requests
	 * @param listener - Previously registered listener function
	 */
	offHide(listener: () => void): void;

	/**
	 * Notify the overlay template that the hide animation has completed for this instance
	 */
	hideComplete(): void;
}

const Context = createHxReactContext<HxOverlayInstanceInnerContext>('HxOverlayInstanceContext');

export interface HxOverlayInstanceProps {
	/** once passed, never change again */
	$overlayHandle: HxOverlayInstanceHandle;
	/** on first show callback */
	onShow?: (handle: HxOverlayInstanceHandle) => void;
	children: ReactNode;
}

/**
 * provide a hide function to enable the hide overlay for internal components
 */
export const HxOverlayInstanceProvider = (props: HxOverlayInstanceProps) => {
	const {$overlayHandle, onShow, children} = props;

	const templateContext = useHxOverlayTemplate();
	const [instanceContext] = useState<HxOverlayInstanceInnerContext>(() => new class extends AbstractHxReactContext implements HxOverlayInstanceInnerContext {
		hide(): void {
			this.emit('hide');
		}

		/** @inheritdoc */
		onHide(listener: () => void): void {
			this.on('hide', listener);
		}

		/** @inheritdoc */
		offHide(listener: () => void): void {
			this.off('hide', listener);
		}

		/** @inheritdoc */
		hideComplete(): void {
			templateContext.hideComplete($overlayHandle);
		}
	}());
	useEffect(() => {
		const onHide = (handle: HxOverlayInstanceHandle) => {
			if (handle !== $overlayHandle) {
				return;
			}

			instanceContext.hide();
		};

		templateContext.onHide(onHide);

		return () => {
			templateContext.offHide(onHide);
		};
	}, [$overlayHandle, templateContext, instanceContext]);
	useEffect(() => {
		// only once, never call again even it changed
		onShow?.($overlayHandle);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <Context.Provider value={instanceContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxOverlayInstance = () => useContext(Context);
