// @ts-expect-error import React
import React, {type ReactNode, useContext, useEffect, useState} from 'react';
import {useHxOverlayInstance} from '../../contexts';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';

export type OverlayHideTrigger = 'backdrop-click' | 'escape' | 'programmatic';

export interface HxOverlayInternalContext extends HxReactContext {
	/**
	 * Request the overlay to hide, recording what triggered the request
	 * @param trigger - Source of the hide request, either from the UI or from the caller
	 */
	hide(trigger: OverlayHideTrigger): void;

	/**
	 * Register a listener for hide requests
	 * @param listener - Callback that receives the hide trigger
	 */
	onHide(listener: (trigger: OverlayHideTrigger) => void): void;

	/**
	 * Remove a listener for hide requests
	 * @param listener - Previously registered listener function
	 */
	offHide(listener: (trigger: OverlayHideTrigger) => void): void;

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
		hide(trigger: OverlayHideTrigger): void {
			this.emit('hide', trigger);
		}

		/** @inheritdoc */
		onHide(listener: (trigger: OverlayHideTrigger) => void): void {
			this.on('hide', listener);
		}

		/** @inheritdoc */
		offHide(listener: (trigger: OverlayHideTrigger) => void): void {
			this.off('hide', listener);
		}

		/** @inheritdoc */
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
