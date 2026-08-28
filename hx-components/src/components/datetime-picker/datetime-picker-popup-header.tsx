// @ts-expect-error import React
import React, {type MouseEvent, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {DateLocaleFormatUtils} from '../../utils';
import {HxButton} from '../button';
import {ChevronLeft, ChevronRight, DoubleArrowLeft, DoubleArrowRight} from '../icons';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {
	EvtHxDateTimePicker_DaySelected,
	EvtHxDateTimePicker_HoverChange,
	EvtHxDateTimePicker_MonthMoved,
	EvtHxDateTimePicker_MonthSelected,
	EvtHxDateTimePicker_SwitchDatePanel,
	EvtHxDateTimePicker_YearMoved,
	EvtHxDateTimePicker_YearSelected,
	type HxDateTimePicker_DatePanel
} from './types';

export interface HxDatetimePickerPopupHeaderProps {
	stateRef: HxDateTimePickerStateRef;
}

export const HxDatetimePickerPopupHeader = (props: HxDatetimePickerPopupHeaderProps) => {
	const {stateRef} = props;

	const context = useHxContext();
	const popupContext = useHxPopupContext();
	const containerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const onSwitchDatePanel = (_panel: HxDateTimePicker_DatePanel) => {
			context.forceUpdate();
		};
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const onStateValueChange = (_panel?: HxDateTimePicker_DatePanel) => {
			context.forceUpdate();
		};

		popupContext.on(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
		popupContext.on(EvtHxDateTimePicker_DaySelected, onStateValueChange);
		popupContext.on(EvtHxDateTimePicker_MonthSelected, onStateValueChange);
		popupContext.on(EvtHxDateTimePicker_MonthMoved, onStateValueChange);
		popupContext.on(EvtHxDateTimePicker_YearSelected, onStateValueChange);
		popupContext.on(EvtHxDateTimePicker_YearMoved, onStateValueChange);
		return () => {
			popupContext.off(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
			popupContext.off(EvtHxDateTimePicker_DaySelected, onStateValueChange);
			popupContext.off(EvtHxDateTimePicker_MonthSelected, onStateValueChange);
			popupContext.off(EvtHxDateTimePicker_MonthMoved, onStateValueChange);
			popupContext.off(EvtHxDateTimePicker_YearSelected, onStateValueChange);
			popupContext.off(EvtHxDateTimePicker_YearMoved, onStateValueChange);
		};
	}, [popupContext, context, stateRef]);

	const onPreviousYearClick = () => {
		if (stateRef.currentDatePanel() === 'years') {
			stateRef.changeYear(-DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE, false);
		} else {
			stateRef.changeYear(-1, false);
		}
		popupContext.emit(EvtHxDateTimePicker_YearMoved);
	};
	const onNextYearClick = () => {
		if (stateRef.currentDatePanel() === 'years') {
			stateRef.changeYear(DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE, false);
		} else {
			stateRef.changeYear(1, false);
		}
		popupContext.emit(EvtHxDateTimePicker_YearMoved);
	};
	const onYearClick = () => {
		stateRef.switchDatePanel('years', true);
	};

	const onPreviousMonthClick = () => {
		stateRef.changeMonth(-1, false);
		popupContext.emit(EvtHxDateTimePicker_MonthMoved);
	};
	const onNextMonthClick = () => {
		stateRef.changeMonth(1, false);
		popupContext.emit(EvtHxDateTimePicker_MonthMoved);
	};
	const onMonthClick = () => {
		stateRef.switchDatePanel('months', true);
	};
	const onAnyMouseEnter = (ev: MouseEvent<HTMLSpanElement>) => {
		popupContext.emit(EvtHxDateTimePicker_HoverChange, ev.target);
	};

	const {era, year, monthLong: month} = stateRef.formatted();
	const weekdays = stateRef.weekdays();
	const days = stateRef.days(weekdays);

	const currentDatePanel = stateRef.currentDatePanel();
	let disallowPreviousYear: boolean, previousYearVisible: boolean;
	let disallowPreviousMonth: boolean, previousMonthVisible: boolean;
	let disallowNextMonth: boolean, nextMonthVisible: boolean;
	let disallowNextYear: boolean, nextYearVisible: boolean;
	if (currentDatePanel === 'days') {
		const firstDayOfCurrentMonthOfGregory = days.find(d => d.thisMonth)!.value;
		disallowPreviousYear = !stateRef.isPreviousYearAllowed(firstDayOfCurrentMonthOfGregory);
		disallowPreviousMonth = !stateRef.isPreviousMonthAllowed(firstDayOfCurrentMonthOfGregory);
		const lastDayOfCurrentMonthOfGregory = [...days].reverse().find(d => d.thisMonth)!.value;
		disallowNextMonth = !stateRef.isNextMonthAllowed(lastDayOfCurrentMonthOfGregory);
		disallowNextYear = !stateRef.isNextYearAllowed(lastDayOfCurrentMonthOfGregory);
		previousYearVisible = previousMonthVisible = nextMonthVisible = nextYearVisible = true;
	} else if (currentDatePanel === 'years') {
		const years = stateRef.years();
		disallowPreviousYear = !years.backward;
		previousYearVisible = true;
		disallowPreviousMonth = disallowNextMonth = true;
		previousMonthVisible = nextMonthVisible = false;
		disallowNextYear = !years.forward;
		nextYearVisible = true;
	} else {
		disallowPreviousYear = disallowPreviousMonth = disallowNextMonth = disallowNextYear = true;
		previousYearVisible = previousMonthVisible = nextMonthVisible = nextYearVisible = false;
	}

	const monthLabel = stateRef.monthHeaderLabel(era, year, month);
	const yearLabel = stateRef.yearHeaderLabel(era, year);

	return <div data-hx-dtp-panel-header="" ref={containerRef}>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="prev-year"
		          data-hx-dtp-panel-btn-disabled={disallowPreviousYear ? '' : (void 0)}
		          data-hx-dtp-panel-btn-visible={previousYearVisible ? '' : (void 0)}
		          text={<DoubleArrowLeft/>}
		          $disabled={disallowPreviousYear}
		          onClick={disallowPreviousYear ? (void 0) : onPreviousYearClick}
		          onMouseEnter={disallowPreviousYear ? (void 0) : onAnyMouseEnter}/>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="prev-month"
		          data-hx-dtp-panel-btn-disabled={disallowPreviousMonth ? '' : (void 0)}
		          data-hx-dtp-panel-btn-visible={previousMonthVisible ? '' : (void 0)}
		          text={<ChevronLeft/>}
		          $disabled={disallowPreviousMonth}
		          onClick={disallowPreviousMonth ? (void 0) : onPreviousMonthClick}
		          onMouseEnter={disallowPreviousMonth ? (void 0) : onAnyMouseEnter}/>
		<HxLabel indent={true} clickable={true} data-hx-dtp-panel-btn="month"
		         text={monthLabel} onClick={onMonthClick} onMouseEnter={onAnyMouseEnter}/>
		<HxLabel indent={true} clickable={true} data-hx-dtp-panel-btn="year"
		         text={yearLabel} onClick={onYearClick} onMouseEnter={onAnyMouseEnter}/>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="next-month"
		          data-hx-dtp-panel-btn-disabled={disallowNextMonth ? '' : (void 0)}
		          data-hx-dtp-panel-btn-visible={nextMonthVisible ? '' : (void 0)}
		          text={<ChevronRight/>}
		          $disabled={disallowNextMonth}
		          onClick={disallowNextMonth ? (void 0) : onNextMonthClick}
		          onMouseEnter={disallowNextMonth ? (void 0) : onAnyMouseEnter}/>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="next-year"
		          data-hx-dtp-panel-btn-disabled={disallowNextYear ? '' : (void 0)}
		          data-hx-dtp-panel-btn-visible={nextYearVisible ? '' : (void 0)}
		          text={<DoubleArrowRight/>}
		          $disabled={disallowNextYear}
		          onClick={disallowNextYear ? (void 0) : onNextYearClick}
		          onMouseEnter={disallowNextYear ? (void 0) : onAnyMouseEnter}/>
	</div>;
};
