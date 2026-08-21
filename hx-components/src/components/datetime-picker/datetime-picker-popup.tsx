// @ts-expect-error import React
import React, {useRef} from 'react';
import {HxDatetimePickerPopupDays} from './datetime-picker-popup-days';
import {useHxDateTimePickerPopupFocusRef} from './datetime-picker-popup-focus-ref';
import {HxDateTimePickerPopupFooter} from './datetime-picker-popup-footer';
import {HxDatetimePickerPopupHeader} from './datetime-picker-popup-header';
import {HxDatetimePickerPopupMonths} from './datetime-picker-popup-months';
import {useHxDateTimePickerPopupStateRef} from './datetime-picker-popup-state-ref';
import {HxDatetimePickerPopupTime} from './datetime-picker-popup-time';
import type {HxDateTimePickerPopupProps} from './datetime-picker-popup-types';
import {HxDatetimePickerPopupYears} from './datetime-picker-popup-years';
import {HxDateTimePickerDefaults} from './defaults';

export const HxDateTimePickerPopup =
	<T extends object>(props: HxDateTimePickerPopupProps<T>) => {
		const {
			visible,
			$model, $field,
			valueFormat, defaultValue, availableParts,
			firstDayOfWeek, weekendDays,
			calendarLocale,
			clearable,
			todayKey = HxDateTimePickerDefaults.todayKey,
			clearKey = HxDateTimePickerDefaults.clearKey, confirmKey = HxDateTimePickerDefaults.confirmKey
		} = props;

		const containerRef = useRef<HTMLDivElement>(null);
		useHxDateTimePickerPopupFocusRef(containerRef);
		const stateRef = useHxDateTimePickerPopupStateRef({
			$model, $field,
			valueFormat, defaultValue,
			calendarLocale,
			firstDayOfWeek, weekendDays
		});

		// Don't render if popup is hidden
		if (!visible) {
			stateRef.clearState();
			return null;
		}

		return <div data-hx-dtp-panel="" tabIndex={-1} ref={containerRef}>
			<HxDatetimePickerPopupHeader stateRef={stateRef}/>
			<HxDatetimePickerPopupDays stateRef={stateRef} timeAvailable={availableParts.hasTime}/>
			{availableParts.hasTime
				? <HxDatetimePickerPopupTime stateRef={stateRef}/>
				: (void 0)}
			<HxDatetimePickerPopupMonths stateRef={stateRef}/>
			<HxDatetimePickerPopupYears stateRef={stateRef}/>
			<HxDateTimePickerPopupFooter stateRef={stateRef} clearable={clearable} time={availableParts.hasTime}
			                             todayKey={todayKey} clearKey={clearKey} confirmKey={confirmKey}/>
		</div>;
	};
