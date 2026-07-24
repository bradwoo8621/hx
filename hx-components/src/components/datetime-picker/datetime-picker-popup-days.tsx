// @ts-expect-error import React
import React from 'react';
import {HxLabel} from '../label';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';

export interface HxDatetimePickerPopupDaysProps {
	stateRef: HxDateTimePickerStateRef;
}

export const HxDatetimePickerPopupDays = (props: HxDatetimePickerPopupDaysProps) => {
	const {stateRef} = props;

	const onDayClick = (date: Date) => () => {
		stateRef.changeDayTo(date.getFullYear(), date.getMonth() + 1, date.getDate());
		stateRef.forceUpdate();
	};

	const weekdays = stateRef.weekdays();
	const days = stateRef.days(weekdays);
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
				&& (date.getMonth() + 1) === selectedDay.month
				&& date.getDate() === selectedDay.day;
			const bc = date.getFullYear() <= 0;
			return <HxLabel data-hx-dtp-panel-day-gregory={day.key}
			                data-hx-dtp-panel-day-bc={bc ? '' : (void 0)}
			                data-hx-dtp-panel-weekend={day.weekend ? '' : (void 0)}
			                data-hx-dtp-panel-this-month={day.thisMonth ? '' : (void 0)}
			                data-hx-dtp-panel-current-value={isCurrent ? '' : (void 0)}
			                hoverable={true}
			                text={day.label} key={day.key}
			                onClick={bc ? (void 0) : onDayClick(day.value)}/>;
		})}
		<span data-hx-dtp-panel-days-header-separator=""/>
	</div>;
};
