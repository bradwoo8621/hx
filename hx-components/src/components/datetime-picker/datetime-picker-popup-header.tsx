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
		stateRef.moveYear(-1);
		stateRef.forceUpdate();
	};
	const onNextYearClick = () => {
		stateRef.moveYear(1);
		stateRef.forceUpdate();
	};
	const onYearClick = () => {
		// TODO show year panel
	};

	const onPreviousMonthClick = () => {
		stateRef.moveMonth(-1);
		stateRef.forceUpdate();
	};
	const onNextMonthClick = () => {
		stateRef.moveMonth(1);
		stateRef.forceUpdate();
	};
	const onMonthClick = () => {
		// TODO show month panel
	};

	const {era, year, monthLong: month} = stateRef.formatted();

	return <div data-hx-dtp-panel-header="">
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="prev-year"
		          text={<DoubleArrowLeft/>} onClick={onPreviousYearClick}/>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="prev-month"
		          text={<ChevronLeft/>} onClick={onPreviousMonthClick}/>
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
