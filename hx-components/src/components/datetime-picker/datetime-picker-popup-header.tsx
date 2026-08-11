// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {HxButton} from '../button';
import {ChevronLeft, ChevronRight, DoubleArrowLeft, DoubleArrowRight} from '../icons';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {
	type HxDateTimePicker_DatePanel,
	EvtHxDateTimePicker_SwitchDatePanel,
	EvtHxDateTimePicker_UpdateDaysPanel,
	EvtHxDateTimePicker_UpdateYearsPanel,
	HxDateTimePicker_YearsPerPanel
} from './types';

export interface HxDatetimePickerPopupHeaderProps {
	stateRef: HxDateTimePickerStateRef;
}

export const HxDatetimePickerPopupHeader = (props: HxDatetimePickerPopupHeaderProps) => {
	const {stateRef} = props;

	const popupContext = useHxPopupContext();
	const containerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const onSwitchDatePanel = (panel: HxDateTimePicker_DatePanel) => {
			if (panel === 'days') {
				containerRef.current?.querySelectorAll(':scope > button').forEach(btn => {
					btn.setAttribute('data-hx-dtp-panel-btn-visible', '');
				});
			} else if (panel === 'months') {
				containerRef.current?.querySelectorAll(':scope > button').forEach(btn => {
					btn.removeAttribute('data-hx-dtp-panel-btn-visible');
				});
			} else if (panel === 'years') {
				containerRef.current?.querySelector(':scope > button[data-hx-dtp-panel-btn="prev-year"]')?.setAttribute('data-hx-dtp-panel-btn-visible', '');
				containerRef.current?.querySelector(':scope > button[data-hx-dtp-panel-btn="prev-month"]')?.removeAttribute('data-hx-dtp-panel-btn-visible');
				containerRef.current?.querySelector(':scope > button[data-hx-dtp-panel-btn="next-month"]')?.removeAttribute('data-hx-dtp-panel-btn-visible');
				containerRef.current?.querySelector(':scope > button[data-hx-dtp-panel-btn="next-year"]')?.setAttribute('data-hx-dtp-panel-btn-visible', '');
			}
		};
		const onUpdateDayPanel = () => {
			stateRef.forceUpdate();
		};
		const onUpdateYearPanel = () => {
			stateRef.forceUpdate();
		};

		popupContext.on(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
		popupContext.on(EvtHxDateTimePicker_UpdateDaysPanel, onUpdateDayPanel);
		popupContext.on(EvtHxDateTimePicker_UpdateYearsPanel, onUpdateYearPanel);
		return () => {
			popupContext.off(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
			popupContext.off(EvtHxDateTimePicker_UpdateDaysPanel, onUpdateDayPanel);
			popupContext.off(EvtHxDateTimePicker_UpdateYearsPanel, onUpdateYearPanel);
		};
	}, [popupContext, stateRef]);

	const onPreviousYearClick = () => {
		if (stateRef.currentDatePanel() === 'years') {
			stateRef.changeYear(HxDateTimePicker_YearsPerPanel * -1, false);
			popupContext.emit(EvtHxDateTimePicker_UpdateYearsPanel);
		} else {
			stateRef.changeYear(-1, false);
		}
		stateRef.forceUpdate();
	};
	const onNextYearClick = () => {
		if (stateRef.currentDatePanel() === 'years') {
			stateRef.changeYear(HxDateTimePicker_YearsPerPanel, false);
			popupContext.emit(EvtHxDateTimePicker_UpdateYearsPanel);
		} else {
			stateRef.changeYear(1, false);
		}
		stateRef.forceUpdate();
	};
	const onYearClick = () => {
		stateRef.switchDatePanel('years');
	};

	const onPreviousMonthClick = () => {
		stateRef.changeMonth(-1, false);
		stateRef.forceUpdate();
	};
	const onNextMonthClick = () => {
		stateRef.changeMonth(1, false);
		stateRef.forceUpdate();
	};
	const onMonthClick = () => {
		stateRef.switchDatePanel('months');
	};

	const {era, year, monthLong: month} = stateRef.formatted();
	const weekdays = stateRef.weekdays();
	const days = stateRef.days(weekdays);

	const currentDatePanel = stateRef.currentDatePanel();
	let disallowPreviousYear: boolean;
	let disallowPreviousMonth: boolean;
	let disallowNextMonth: boolean;
	let disallowNextYear: boolean;
	if (currentDatePanel === 'days') {
		const firstDayOfCurrentMonthOfGregory = days.find(d => d.thisMonth)!.value;
		disallowPreviousYear = !stateRef.isPreviousYearAllowed(firstDayOfCurrentMonthOfGregory);
		disallowPreviousMonth = !stateRef.isPreviousMonthAllowed(firstDayOfCurrentMonthOfGregory);
		const lastDayOfCurrentMonthOfGregory = [...days].reverse().find(d => d.thisMonth)!.value;
		disallowNextMonth = !stateRef.isNextMonthAllowed(lastDayOfCurrentMonthOfGregory);
		disallowNextYear = !stateRef.isNextYearAllowed(lastDayOfCurrentMonthOfGregory);
	} else if (currentDatePanel === 'years') {
		const years = stateRef.years();
		disallowPreviousYear = !years.backward;
		disallowPreviousMonth = true;
		disallowNextMonth = true;
		disallowNextYear = !years.forward;
	} else {
		disallowPreviousYear = true;
		disallowPreviousMonth = true;
		disallowNextMonth = true;
		disallowNextYear = true;
	}

	const monthLabel = stateRef.labelOfMonth(era, year, month);
	const yearLabel = stateRef.labelOfYear(era, year);

	return <div data-hx-dtp-panel-header="" ref={containerRef}>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="prev-year"
		          data-hx-dtp-panel-btn-disabled={disallowPreviousYear ? '' : (void 0)}
		          data-hx-dtp-panel-btn-visible=""
		          text={<DoubleArrowLeft/>}
		          $disabled={disallowPreviousYear}
		          onClick={disallowPreviousYear ? (void 0) : onPreviousYearClick}/>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="prev-month"
		          data-hx-dtp-panel-btn-disabled={disallowPreviousMonth ? '' : (void 0)}
		          data-hx-dtp-panel-btn-visible=""
		          text={<ChevronLeft/>}
		          $disabled={disallowPreviousMonth}
		          onClick={disallowPreviousMonth ? (void 0) : onPreviousMonthClick}/>
		<HxLabel indent={true} clickable={true} data-hx-dtp-panel-btn="month"
		         text={monthLabel} onClick={onMonthClick}/>
		<HxLabel indent={true} clickable={true} data-hx-dtp-panel-btn="year"
		         text={yearLabel} onClick={onYearClick}/>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="next-month"
		          data-hx-dtp-panel-btn-disabled={disallowNextMonth ? '' : (void 0)}
		          data-hx-dtp-panel-btn-visible=""
		          text={<ChevronRight/>}
		          $disabled={disallowNextMonth}
		          onClick={disallowNextMonth ? (void 0) : onNextMonthClick}/>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="next-year"
		          data-hx-dtp-panel-btn-disabled={disallowNextYear ? '' : (void 0)}
		          data-hx-dtp-panel-btn-visible=""
		          text={<DoubleArrowRight/>}
		          $disabled={disallowNextYear}
		          onClick={disallowNextYear ? (void 0) : onNextYearClick}/>
	</div>;
};
