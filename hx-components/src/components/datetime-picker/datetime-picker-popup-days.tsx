// @ts-expect-error import React
import React, {useEffect} from 'react';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {EvtHxDateTimePicker_ArrowKey} from './types.ts';

export interface HxDatetimePickerPopupDaysProps {
	stateRef: HxDateTimePickerStateRef;
}

export const HxDatetimePickerPopupDays = (props: HxDatetimePickerPopupDaysProps) => {
	const {stateRef} = props;

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

	const onDayClick = (date: Date) => () => {
		stateRef.setDayTo(date.getFullYear(), date.getMonth() + 1, date.getDate());
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
			const isCurrent = day.value.getFullYear() === selectedDay.year
				&& (day.value.getMonth() + 1) === selectedDay.month
				&& day.value.getDate() === selectedDay.day;
			return <HxLabel data-hx-dtp-panel-day-label={day.key}
			                data-hx-dtp-panel-weekend={day.weekend ? '' : (void 0)}
			                data-hx-dtp-panel-this-month={day.thisMonth ? '' : (void 0)}
			                data-hx-dtp-panel-current-value={isCurrent ? '' : (void 0)}
			                hoverable={true}
			                text={day.label} key={day.key}
			                onClick={onDayClick(day.value)}/>;
		})}
		<span data-hx-dtp-panel-days-header-separator=""/>
	</div>;
};
