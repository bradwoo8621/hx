// @ts-expect-error import React
import React, {useRef} from 'react';
import type {HxParsedDateTimeFormat} from '../../types';
import {type HxExtDateTimePickerProps} from './types';

export type HxDateTimePickerPopupProps<T extends object> =
	& Pick<HxExtDateTimePickerProps<T>, | 'firstDayOfWeek' | 'nowKey' | 'clearKey'>
	& {
	/** Whether the popup is visible */
	visible: boolean;
	availableParts: Omit<HxParsedDateTimeFormat, 'sequence'>;
};

export const HxDateTimePickerPopup =
	<T extends object>(props: HxDateTimePickerPopupProps<T>) => {
		const {
			visible
			// availableParts, firstDayOfWeek = HxDateTimePickerDefaults.firstDayOfWeek,
			// nowKey = HxDateTimePickerDefaults.nowKey, clearKey = HxDateTimePickerDefaults.clearKey
		} = props;

		// const context = useHxContext();
		// const popupContext = useHxPopupContext();
		const containerRef = useRef<HTMLDivElement>(null);

		// Don't render if popup is hidden
		if (!visible) {
			return null;
		}

		// TODO
		return <div data-hx-dtp-panel="" tabIndex={-1} ref={containerRef}>
		</div>;
	};
