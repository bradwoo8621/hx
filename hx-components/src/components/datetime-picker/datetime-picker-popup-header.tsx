// @ts-expect-error import React
import React from 'react';
import {HxButton} from '../button';
import {ChevronLeft, ChevronRight, DoubleArrowLeft, DoubleArrowRight} from '../icons';
import {HxLabel} from '../label';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';

export interface HxDatetimePickerPopupHeaderProps {
	stateRef: HxDateTimePickerStateRef;
}

export const HxDatetimePickerPopupHeader = (props: HxDatetimePickerPopupHeaderProps) => {
	const {stateRef} = props;

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

	const firstDayOfCurrentMonthOfGregory = days.find(d => d.thisMonth)!.value;
	const disallowPreviousYear = !stateRef.isPreviousYearAllowed(firstDayOfCurrentMonthOfGregory);
	const disallowPreviousMonth = !stateRef.isPreviousMonthAllowed(firstDayOfCurrentMonthOfGregory);
	const lastDayOfCurrentMonthOfGregory = [...days].reverse().find(d => d.thisMonth)!.value;
	const disallowNextMonth = !stateRef.isNextMonthAllowed(lastDayOfCurrentMonthOfGregory);
	const disallowNextYear = !stateRef.isNextYearAllowed(lastDayOfCurrentMonthOfGregory);

	const monthLabel = stateRef.labelOfMonth(era, year, month);
	const yearLabel = stateRef.labelOfYear(era, year);

	return <div data-hx-dtp-panel-header="">
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="prev-year"
		          data-hx-dtp-panel-btn-disabled={disallowPreviousYear ? '' : (void 0)}
		          text={<DoubleArrowLeft/>}
		          $disabled={disallowPreviousYear}
		          onClick={disallowPreviousYear ? (void 0) : onPreviousYearClick}/>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="prev-month"
		          data-hx-dtp-panel-btn-disabled={disallowPreviousMonth ? '' : (void 0)}
		          text={<ChevronLeft/>}
		          $disabled={disallowPreviousMonth}
		          onClick={disallowPreviousMonth ? (void 0) : onPreviousMonthClick}/>
		<HxLabel indent={true} clickable={true} data-hx-dtp-panel-btn="month"
		         text={monthLabel} onClick={onMonthClick}/>
		<HxLabel indent={true} clickable={true} data-hx-dtp-panel-btn="year"
		         text={yearLabel} onClick={onYearClick}/>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="next-month"
		          data-hx-dtp-panel-btn-disabled={disallowNextMonth ? '' : (void 0)}
		          text={<ChevronRight/>}
		          $disabled={disallowNextMonth}
		          onClick={disallowNextMonth ? (void 0) : onNextMonthClick}/>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="next-year"
		          data-hx-dtp-panel-btn-disabled={disallowNextYear ? '' : (void 0)}
		          text={<DoubleArrowRight/>}
		          $disabled={disallowNextYear}
		          onClick={disallowNextYear ? (void 0) : onNextYearClick}/>
	</div>;
};
