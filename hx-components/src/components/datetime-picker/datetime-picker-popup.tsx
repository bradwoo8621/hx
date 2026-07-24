// @ts-expect-error import React
import React, {useRef} from 'react';
import {HxDatetimePickerPopupDays} from './datetime-picker-popup-days';
import {useHxDateTimePickerPopupFocusRef} from './datetime-picker-popup-focus-ref.ts';
import {HxDateTimePickerPopupFooter} from './datetime-picker-popup-footer';
import {HxDatetimePickerPopupHeader} from './datetime-picker-popup-header';
import {useHxDateTimePickerPopupStateRef} from './datetime-picker-popup-state-ref';
import type {HxDateTimePickerPopupProps} from './datetime-picker-popup-types';
import {HxDateTimePickerDefaults} from './defaults';

export const HxDateTimePickerPopup =
	<T extends object>(props: HxDateTimePickerPopupProps<T>) => {
		const {
			visible,
			$model, $field,
			valueFormat, defaultValue,
			// availableParts,
			firstDayOfWeek, weekendDays,
			forceLang,
			clearable,
			todayKey = HxDateTimePickerDefaults.todayKey, clearKey = HxDateTimePickerDefaults.clearKey
		} = props;

		const containerRef = useRef<HTMLDivElement>(null);
		useHxDateTimePickerPopupFocusRef(containerRef);
		const stateRef = useHxDateTimePickerPopupStateRef({
			$model, $field,
			valueFormat, defaultValue,
			forceLang,
			firstDayOfWeek, weekendDays
		});

		// Don't render if popup is hidden
		if (!visible) {
			stateRef.clear();
			return null;
		}

		return <div data-hx-dtp-panel="" tabIndex={-1} ref={containerRef}>
			<HxDatetimePickerPopupHeader stateRef={stateRef}/>
			<HxDatetimePickerPopupDays stateRef={stateRef}/>
			<HxDateTimePickerPopupFooter stateRef={stateRef} clearable={clearable}
			                             todayKey={todayKey} clearKey={clearKey}/>
		</div>;
	};
