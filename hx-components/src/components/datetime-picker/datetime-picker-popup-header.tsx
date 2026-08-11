// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {HxButton} from '../button';
import {ChevronLeft, ChevronRight, DoubleArrowLeft, DoubleArrowRight} from '../icons';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {type EvtHxDateTimePicker_DatePanel, EvtHxDateTimePicker_SwitchDatePanel} from './types';

export interface HxDatetimePickerPopupHeaderProps {
	stateRef: HxDateTimePickerStateRef;
}

export const HxDatetimePickerPopupHeader = (props: HxDatetimePickerPopupHeaderProps) => {
	const {stateRef} = props;

	const popupContext = useHxPopupContext();
	const containerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const onSwitchDatePanel = (panel: EvtHxDateTimePicker_DatePanel) => {
			if (panel === 'days') {
				containerRef.current?.querySelectorAll(':scope > button').forEach(btn => {
					btn.setAttribute('data-hx-dtp-panel-btn-visible', '');
				});
			} else {
				containerRef.current?.querySelectorAll(':scope > button').forEach(btn => {
					btn.removeAttribute('data-hx-dtp-panel-btn-visible');
				});
			}
		};

		popupContext.on(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
		return () => {
			popupContext.off(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
		};
	}, [popupContext, stateRef]);

	const onPreviousYearClick = () => {
		stateRef.changeYear(-1);
		stateRef.forceUpdate();
	};
	const onNextYearClick = () => {
		stateRef.changeYear(1);
		stateRef.forceUpdate();
	};
	const onYearClick = () => {
		stateRef.switchDatePanel('years');
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
		stateRef.switchDatePanel('months');
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
