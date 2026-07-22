// @ts-expect-error import React
import React, {useEffect} from 'react';
import {HxButton} from '../button';
import {ChevronLeft, ChevronRight, DoubleArrowLeft, DoubleArrowRight} from '../icons';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {EvtHxDateTimePicker_ArrowKey} from './types';

export interface HxDatetimePickerPopupHeaderProps {
	stateRef: HxDateTimePickerStateRef;
}

export const HxDatetimePickerPopupHeader = (props: HxDatetimePickerPopupHeaderProps) => {
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

	const onPreviousYearClick = () => {
		stateRef.changeYear(-1);
		stateRef.forceUpdate();
	};
	const onNextYearClick = () => {
		stateRef.changeYear(1);
		stateRef.forceUpdate();
	};
	const onYearClick = () => {
		// TODO show year panel
	};

	const onPreviousMonthClick = () => {
		stateRef.changeMonth(-1);
		stateRef.forceUpdate();
	};
	const onNextMonthClick = () => {
		stateRef.changeMonth(1);
		stateRef.forceUpdate();
	};
	const onMonthClick = () => {
		// TODO show month panel
	};

	const {era, year, monthLong: month} = stateRef.formatted();
	const weekdays = stateRef.weekdays();
	const days = stateRef.days(weekdays);
	const yearOfFirstDay = days[0].value.getFullYear();
	const monthOfFirstDay = days[0].value.getMonth() + 1;
	const dayOfFirstDay = days[0].value.getDate();
	// first day of days is B.C., or 0001/01/01, previous month is not allowed
	const disallowPreviousMonth = yearOfFirstDay <= 0 || (yearOfFirstDay === 1 && monthOfFirstDay === 1 && dayOfFirstDay === 1);
	// TODO how to check the previous year is allowed,
	//  seems have to check (year/month/day below are calendar):
	//  - when first day of current year is before A.D. 0001/01/01 -> disallowed
	//  - check the year of A.D. 0001/01/01,
	//    - if it is not the previous year of current -> allowed
	//    - check the month of A.D. 0001/01/01,
	//      - if month is less than or equals current month -> allowed
	//      - otherwise -> disallowed
	const disallowPreviousYear = disallowPreviousMonth;

	return <div data-hx-dtp-panel-header="">
		<HxButton variant="ghost" color="primary" tabIndex={-1}
		          data-hx-dtp-panel-btn="prev-year"
		          data-hx-dtp-panel-btn-disabled={disallowPreviousYear ? '' : (void 0)}
		          text={<DoubleArrowLeft/>}
		          $disabled={disallowPreviousYear}
		          onClick={disallowPreviousYear ? (void 0) : onPreviousYearClick}/>
		<HxButton variant="ghost" color="primary" tabIndex={-1}
		          data-hx-dtp-panel-btn="prev-month"
		          data-hx-dtp-panel-btn-disabled={disallowPreviousMonth ? '' : (void 0)}
		          text={<ChevronLeft/>}
		          $disabled={disallowPreviousMonth}
		          onClick={disallowPreviousMonth ? (void 0) : onPreviousMonthClick}/>
		<HxLabel indent={true} clickable={true} data-hx-dtp-panel-btn="month"
		         text={month} onClick={onMonthClick}/>
		<HxLabel indent={true} clickable={true} data-hx-dtp-panel-btn="year"
		         text={`${era}${year}`} onClick={onYearClick}/>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="next-month"
		          text={<ChevronRight/>} onClick={onNextMonthClick}/>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="next-year"
		          text={<DoubleArrowRight/>} onClick={onNextYearClick}/>
	</div>;
};
