import {useEffect, useRef} from 'react';
import {usePopupVisibleRef} from '../popup';

export interface UseHxTableToolbarPopupTriggerOptions {
	closeEvent: string;
}

export const useHxTableToolbarPopupTrigger = (options: UseHxTableToolbarPopupTriggerOptions) => {
	const {closeEvent} = options;

	const ref = useRef<HTMLButtonElement>(null);
	const {context: popupContext, visibleRef: popupVisibleRef} = usePopupVisibleRef({elementRef: ref});
	useEffect(() => {
		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			popupVisibleRef.current.clean();
		};
	}, [popupVisibleRef]);
	useEffect(() => {
		const onClosePopup = () => {
			if (popupVisibleRef.current.isVisible()) {
				popupVisibleRef.current.hide();
			}
		};

		popupContext.on(closeEvent, onClosePopup);

		return () => {
			popupContext.off(closeEvent, onClosePopup);
		};
	}, [closeEvent, popupVisibleRef, popupContext]);

	const onClick = () => {
		if (popupVisibleRef.current.isVisible()) {
			return;
		}
		popupVisibleRef.current.show(false, {position: 'bottom', alignTo: 'right'});
	};

	return {onClick, ref};
};
