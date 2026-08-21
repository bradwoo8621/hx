// @ts-expect-error import React
import React, {type ReactNode, useEffect} from 'react';
import {useHxContext} from '../../contexts';
import {type ComputedDay, StringUtils, UTCDate} from '../../utils';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {
	EvtHxDateTimePicker_ClosePopup,
	EvtHxDateTimePicker_DaySelected,
	EvtHxDateTimePicker_MonthMoved,
	EvtHxDateTimePicker_MonthSelected,
	EvtHxDateTimePicker_YearMoved,
	EvtHxDateTimePicker_YearSelected
} from './types';

export interface HxDatetimePickerPopupDaysProps {
	stateRef: HxDateTimePickerStateRef;
	timeAvailable: boolean;
}

export const HxDatetimePickerPopupDays = (props: HxDatetimePickerPopupDaysProps) => {
	const {stateRef, timeAvailable} = props;

	const context = useHxContext();
	const popupContext = useHxPopupContext();
	useEffect(() => {
		const onStateValueChange = () => {
			context.forceUpdate();
		};

		popupContext.on(EvtHxDateTimePicker_DaySelected, onStateValueChange);
		popupContext.on(EvtHxDateTimePicker_MonthSelected, onStateValueChange);
		popupContext.on(EvtHxDateTimePicker_MonthMoved, onStateValueChange);
		popupContext.on(EvtHxDateTimePicker_YearSelected, onStateValueChange);
		popupContext.on(EvtHxDateTimePicker_YearMoved, onStateValueChange);
		return () => {
			popupContext.off(EvtHxDateTimePicker_DaySelected, onStateValueChange);
			popupContext.off(EvtHxDateTimePicker_MonthSelected, onStateValueChange);
			popupContext.off(EvtHxDateTimePicker_MonthMoved, onStateValueChange);
			popupContext.off(EvtHxDateTimePicker_YearSelected, onStateValueChange);
			popupContext.off(EvtHxDateTimePicker_YearMoved, onStateValueChange);
		};
	}, [popupContext, context]);

	const onDayClick = (date: UTCDate) => () => {
		stateRef.changeDayTo(date.getFullYear(), date.getMonthIndex() + 1, date.getDayOfMonth(), true, !timeAvailable);
		popupContext.emit(EvtHxDateTimePicker_DaySelected);
		if (!timeAvailable) {
			popupContext.emit(EvtHxDateTimePicker_ClosePopup);
		}
	};

	const weekdays = stateRef.weekdays();
	const days = stateRef.days(weekdays);
	const eraOfDays = stateRef.eraOfDays(days);
	const stateDay = stateRef.stateValue();
	const selectedDay = stateRef.modelValue();

	const labelOfYear = (day: ComputedDay): ReactNode => {
		const era = eraOfDays.get(day.value);

		if (StringUtils.isBlank(era)) {
			return day.label;
		} else {
			return <>
				{day.label}
				<span data-hx-dtp-panel-day-era="">{era}</span>
			</>;
		}
	};

	return <div data-hx-dtp-panel-days="">
		{weekdays.week.map(weekday => {
			return <HxLabel data-hx-dtp-panel-weekday-label={weekday.key}
			                data-hx-dtp-panel-weekend={weekday.weekend ? '' : (void 0)}
			                text={weekday.label} key={weekday.key}/>;
		})}
		<span data-hx-dtp-panel-days-header-separator=""/>
		{days.map(day => {
			const date = day.value;
			const isCurrentState = date.getFullYear() === stateDay?.year
				&& (date.getMonthIndex() + 1) === stateDay?.month
				&& date.getDayOfMonth() === stateDay?.day;
			const isCurrent = date.getFullYear() === selectedDay?.year
				&& (date.getMonthIndex() + 1) === selectedDay?.month
				&& date.getDayOfMonth() === selectedDay?.day;
			const bc = date.getFullYear() <= 0;
			const y10k = date.getFullYear() > 9999;
			return <HxLabel data-hx-dtp-panel-day-gregory={day.key}
			                data-hx-dtp-panel-day-bc={bc ? '' : (void 0)}
			                data-hx-dtp-panel-day-y10k={y10k ? '' : (void 0)}
			                data-hx-dtp-panel-weekend={day.weekend ? '' : (void 0)}
			                data-hx-dtp-panel-this-month={day.thisMonth ? '' : (void 0)}
			                data-hx-dtp-panel-state-day={isCurrentState ? '' : (void 0)}
			                data-hx-dtp-panel-model-day={isCurrent ? '' : (void 0)}
			                hoverable={true}
			                text={labelOfYear(day)} key={day.key}
			                onClick={(bc || y10k) ? (void 0) : onDayClick(day.value)}/>;
		})}
	</div>;
};
