// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import {useHxContext} from '../../contexts';
import type {HxRectRange} from '../../types';
import {amendPopupGapToEdge, amendPopupZIndex} from './defaults';
import {HxPopup} from './popup';
import {useHxPopupInternalContext} from './popup-internal-context';
import {type HxPopupProviderProps, useHxPopupContext} from './popup-provider';

export type HxPopupPortalProps = Omit<HxPopupProviderProps, 'trigger' | 'steady'>;

type HxPopupPortalStateRefInvisible = { visible: false };
type HxPopupPortalStateRefVisible = { visible: true; triggerEl: HTMLElement; rectRange: HxRectRange; };
type HxPopupPortalStateRef = HxPopupPortalStateRefInvisible | HxPopupPortalStateRefVisible;

export const HxPopupPortal = (props: HxPopupPortalProps) => {
	const {zIndex, gapToEdge, sameWidthAtMinimum, children, ...rest} = props;

	const context = useHxContext();
	const popupContext = useHxPopupContext();
	const internalContext = useHxPopupInternalContext();
	const stateRef = useRef<HxPopupPortalStateRef>({visible: false});
	/**
	 * Register popup show/hide event listeners
	 */
	useEffect(() => {
		const onReadyToShow = <E extends HTMLElement>(callback: (triggerEl: E, popupRectRange: HxRectRange) => void) => {
			if (stateRef.current.visible) {
				callback(stateRef.current.triggerEl as E, stateRef.current.rectRange);
			}
		};

		/**
		 * Handle popup show event: start position calculation and show animation
		 */
		const onShow = <E extends HTMLElement>(triggerEl: E, popupRectRange: HxRectRange) => {
			stateRef.current.visible = true;
			(stateRef.current as HxPopupPortalStateRefVisible).triggerEl = triggerEl;
			(stateRef.current as HxPopupPortalStateRefVisible).rectRange = popupRectRange;
			context.forceUpdate();
		};

		/**
		 * Handle popup hide event: play exit animation and clean up styles
		 */
		const onHideCompleted = () => {
			stateRef.current.visible = false;
			// @ts-expect-error ignore the type check
			delete (stateRef.current as HxPopupPortalStateRefVisible).triggerEl;
			// @ts-expect-error ignore the type check
			delete (stateRef.current as HxPopupPortalStateRefVisible).rectRange;
			context.forceUpdate();
		};

		internalContext.onReadyToShow(onReadyToShow);
		internalContext.onHideCompleted(onHideCompleted);
		popupContext.onShow(onShow);
		return () => {
			internalContext.offReadyToShow(onReadyToShow);
			internalContext.offHideCompleted(onHideCompleted);
			popupContext.offShow(onShow);
		};
	}, [popupContext, internalContext, context]);

	// eslint-disable-next-line react-hooks/refs
	if (!stateRef.current.visible) {
		return (void 0);
	}

	return <>
		{createPortal(
			<div data-hx-portal-root=""
			     data-hx-theme={context.theme.current()}
			     data-hx-language={context.language.current()}
			     style={{zIndex}}>
				<HxPopup {...rest}
				         zIndex={amendPopupZIndex(zIndex)!}
				         gapToEdge={amendPopupGapToEdge(gapToEdge)!} sameWidthAtMinimum={sameWidthAtMinimum}>
					{children}
				</HxPopup>
			</div>,
			document.body)}
	</>;
};
