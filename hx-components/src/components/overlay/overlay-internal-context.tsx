// @ts-expect-error import React
import React, {type ReactNode, useContext, useEffect, useState} from 'react';
import {useHxOverlayInstance} from '../../contexts';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';

export type OverlayHideTrigger = 'backdrop-click' | 'escape' | 'programmatic';

export interface HxOverlayInternalContext extends HxReactContext {
	/**
	 * Request the overlay to hide, recording what triggered the request
	 * @param trigger - Source of the hide request, either from the UI or from the caller
	 * @param callback - Tell the invoker the hide command is accepted or not
	 */
	hide(trigger: OverlayHideTrigger, callback: (accepted: boolean) => void): void;

	/**
	 * Register a listener for hide requests
	 * @param listener - Callback that receives the hide trigger
	 */
	onHide(listener: (trigger: OverlayHideTrigger, callback: (accepted: boolean) => void) => void): void;

	/**
	 * Remove a listener for hide requests
	 * @param listener - Previously registered listener function
	 */
	offHide(listener: (trigger: OverlayHideTrigger, callback: (accepted: boolean) => void) => void): void;

	/**
	 * Notify the overlay instance that the hide animation has completed
	 */
	hideComplete(): void;
}

const Context = createHxReactContext<HxOverlayInternalContext>('HxOverlayInternalContext');

export interface HxOverlayInternalContextProps {
	children: ReactNode;
}

export const HxOverlayInternalContextProvider = (props: HxOverlayInternalContextProps) => {
	const {children} = props;

	const instanceContext = useHxOverlayInstance();
	const [internalContext] = useState<HxOverlayInternalContext>(() => new class extends AbstractHxReactContext implements HxOverlayInternalContext {
		/** @inheritdoc */
		hide(trigger: OverlayHideTrigger, callback: (accepted: boolean) => void): void {
			this.emit('hide', trigger, callback);
		}

		/** @inheritdoc */
		onHide(listener: (trigger: OverlayHideTrigger, callback: (accepted: boolean) => void) => void): void {
			this.on('hide', listener);
		}

		/** @inheritdoc */
		offHide(listener: (trigger: OverlayHideTrigger, callback: (accepted: boolean) => void) => void): void {
			this.off('hide', listener);
		}

		/** @inheritdoc */
		hideComplete(): void {
			instanceContext.hideComplete();
		}
	}());
	useEffect(() => {
		const onHide = (callback: (accepted: boolean) => void) => {
			internalContext.hide('programmatic', callback);
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
