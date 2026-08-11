// @ts-expect-error import React
import React, {useEffect} from 'react';
import {UTCDate} from '../../utils';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {EvtHxDateTimePicker_UpdateDaysPanel} from './types';

export interface HxDatetimePickerPopupDaysProps {
	stateRef: HxDateTimePickerStateRef;
}

export const HxDatetimePickerPopupDays = (props: HxDatetimePickerPopupDaysProps) => {
	const {stateRef} = props;

	const popupContext = useHxPopupContext();
	useEffect(() => {
		const onUpdateDayPanel = () => {
			stateRef.forceUpdate();
		};
		popupContext.on(EvtHxDateTimePicker_UpdateDaysPanel, onUpdateDayPanel);
		return () => {
			popupContext.off(EvtHxDateTimePicker_UpdateDaysPanel, onUpdateDayPanel);
		};
	}, [popupContext, stateRef]);

	const onDayClick = (date: UTCDate) => () => {
		stateRef.changeDayTo(date.getFullYear(), date.getMonthIndex() + 1, date.getDayOfMonth());
		stateRef.forceUpdate();
	};

	const weekdays = stateRef.weekdays();
	const days = stateRef.days(weekdays);
	const eraOfDays = stateRef.eraOfDays(days);
	// TODO get value from model when value changed only on day selected
	const selectedDay = stateRef.value();

	return <div data-hx-dtp-panel-days="">
		{weekdays.week.map(weekday => {
			return <HxLabel data-hx-dtp-panel-weekday-label={weekday.key}
			                data-hx-dtp-panel-weekend={weekday.weekend ? '' : (void 0)}
			                text={weekday.label} key={weekday.key}/>;
		})}
		<span data-hx-dtp-panel-days-header-separator=""/>
		{days.map(day => {
			const date = day.value;
			const isCurrent = date.getFullYear() === selectedDay.year
				&& (date.getMonthIndex() + 1) === selectedDay.month
				&& date.getDayOfMonth() === selectedDay.day;
			const bc = date.getFullYear() <= 0;
			const y10k = date.getFullYear() > 9999;
			return <HxLabel data-hx-dtp-panel-day-gregory={day.key}
			                data-hx-dtp-panel-day-bc={bc ? '' : (void 0)}
			                data-hx-dtp-panel-day-y10k={y10k ? '' : (void 0)}
			                data-hx-dtp-panel-day-era={eraOfDays.get(date)}
			                data-hx-dtp-panel-weekend={day.weekend ? '' : (void 0)}
			                data-hx-dtp-panel-this-month={day.thisMonth ? '' : (void 0)}
			                data-hx-dtp-panel-current-value={isCurrent ? '' : (void 0)}
			                hoverable={true}
			                text={day.label} key={day.key}
			                onClick={(bc || y10k) ? (void 0) : onDayClick(day.value)}/>;
		})}
		<span data-hx-dtp-panel-days-header-separator=""/>
	</div>;
};
