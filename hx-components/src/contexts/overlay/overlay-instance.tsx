import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useEffect, useState} from 'react';
import type {HxOverlayInstanceHandle} from '../../types';
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
export interface HxOverlayInstanceInnerContext extends HxOverlayInstanceContext {
	onHide(listener: () => void): void;
	offHide(listener: () => void): void;
	hideComplete(): void;
}

const Context = createContext<HxOverlayInstanceInnerContext>({} as HxOverlayInstanceInnerContext);
Context.displayName = 'HxOverlayInstanceContext';

export interface HxOverlayInstanceProps {
	/** once passed, never change again */
	$overlayHandle: HxOverlayInstanceHandle;
	children: ReactNode;
}

/**
 * provide a hide function to enable the hide overlay for internal components
 */
export const HxOverlayInstanceProvider = (props: HxOverlayInstanceProps) => {
	const {$overlayHandle, children} = props;

	const templateContext = useHxOverlayTemplate();
	const [instanceContext] = useState<HxOverlayInstanceInnerContext>(() => new class implements HxOverlayInstanceInnerContext {
		private events = new EventEmitter();

		hide(): void {
			this.events.emit('hide');
		}

		onHide(listener: () => void): void {
			this.events.on('hide', listener);
		}

		offHide(listener: () => void): void {
			this.events.off('hide', listener);
		}

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

	return <Context.Provider value={instanceContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxOverlayInstance = () => useContext(Context);
