import {EventEmitter} from '@hx/data';
// @ts-expect-error import React
import React, {createContext, type ReactNode, useContext, useEffect, useState} from 'react';
import {useHxOverlayInstance} from '../../contexts';

export type OverlayHideTrigger = 'backdrop-click' | 'escape' | 'programmatic';

export interface HxOverlayInternalContext {
	hide: (trigger: OverlayHideTrigger) => void;
	onHide: (listener: (trigger: OverlayHideTrigger) => void) => void;
	offHide: (listener: (trigger: OverlayHideTrigger) => void) => void;
	hideComplete(): void;
}

const Context = createContext<HxOverlayInternalContext>({} as HxOverlayInternalContext);
Context.displayName = 'HxOverlayInternalContext';

export interface HxOverlayInternalContextProps {
	children: ReactNode;
}

export const HxOverlayInternalContextProvider = (props: HxOverlayInternalContextProps) => {
	const {children} = props;

	const instanceContext = useHxOverlayInstance();
	const [internalContext] = useState<HxOverlayInternalContext>(() => new class implements HxOverlayInternalContext {
		private events = new EventEmitter();

		hide(trigger: OverlayHideTrigger): void {
			this.events.emit('hide', trigger);
		}

		onHide(listener: (trigger: OverlayHideTrigger) => void): void {
			this.events.on('hide', listener);
		}

		offHide(listener: (trigger: OverlayHideTrigger) => void): void {
			this.events.off('hide', listener);
		}

		hideComplete(): void {
			instanceContext.hideComplete();
		}
	}());
	useEffect(() => {
		const onHide = () => {
			internalContext.hide('programmatic');
		};

		instanceContext.onHide(onHide);

		return () => {
			instanceContext.offHide(onHide);
		};
	}, [instanceContext, internalContext]);

	return <Context.Provider value={internalContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxOverlayInternalContext = () => useContext(Context);
