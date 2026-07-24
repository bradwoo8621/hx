import {type RefObject, useEffect} from 'react';
import {useHxPopupContext} from '../popup';
import {EvtHxDateTimePicker_ArrowKey} from './types';

// TODO control popup focus
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useHxDateTimePickerPopupFocusRef = (_containerRef: RefObject<HTMLDivElement>) => {
	const popupContext = useHxPopupContext();
	useEffect(() => {
		const onArrowKey = (direction: 'up' | 'down' | 'left' | 'right') => {
			// TODO
			console.log('arrow key direction: ', direction);
		};
		popupContext.on(EvtHxDateTimePicker_ArrowKey, onArrowKey);

		return () => {
			popupContext.off(EvtHxDateTimePicker_ArrowKey, onArrowKey);
		};
	}, [popupContext]);
};
