// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import type {HxDateTimeValue, HxParsedDateTimeFormat} from '../../types';
import {useHxPopupContext} from '../popup';
import {EvtHxDateTimePicker_GetCurrentValue, type HxExtDateTimePickerProps} from './types';

export type HxDateTimePickerPopupProps<T extends object> =
	& Pick<HxExtDateTimePickerProps<T>, | 'firstDayOfWeek' | 'forceGregorian' | 'nowKey' | 'clearKey'>
	& {
	/** Whether the popup is visible */
	visible: boolean;
	availableParts: Omit<HxParsedDateTimeFormat, 'sequence'>;
};

interface HxDateTimePickerPopupValueState {
	get: boolean;
	value?: HxDateTimeValue | null;
}

export const HxDateTimePickerPopup =
	<T extends object>(props: HxDateTimePickerPopupProps<T>) => {
		const {
			visible
			// availableParts,
			// firstDayOfWeek = HxDateTimePickerDefaults.firstDayOfWeek,
			// forceGregorian = HxDateTimePickerDefaults.forceGregorian,
			// nowKey = HxDateTimePickerDefaults.nowKey, clearKey = HxDateTimePickerDefaults.clearKey
		} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();
		const currentValueRef = useRef<HxDateTimePickerPopupValueState>({get: false});
		const containerRef = useRef<HTMLDivElement>(null);
		useEffect(() => {
			if (visible) {
				popupContext.emit(EvtHxDateTimePicker_GetCurrentValue, (value?: Required<HxDateTimeValue> | null) => {
					currentValueRef.current.get = true;
					currentValueRef.current.value = value;
					context.forceUpdate();
				});
			} else {
				// no need to force update when visible switch from true to false
				currentValueRef.current.get = false;
				delete currentValueRef.current.value;
			}
		}, [context, popupContext, visible]);

		// Don't render if popup is hidden
		if (!visible) {
			return null;
		}

		// eslint-disable-next-line react-hooks/refs
		if (!currentValueRef.current.get) {
			return false;
		}

		// TODO
		return <div data-hx-dtp-panel="" tabIndex={-1} ref={containerRef}>
		</div>;
	};
