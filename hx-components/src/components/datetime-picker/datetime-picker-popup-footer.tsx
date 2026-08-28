// @ts-expect-error import React
import React, {type MouseEvent, type ReactNode} from 'react';
import {UTCDate} from '../../utils';
import {HxButton} from '../button';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {
	EvtHxDateTimePicker_ClosePopup,
	EvtHxDateTimePicker_DaySelected,
	EvtHxDateTimePicker_HoverChange
} from './types';

export interface HxDatetimePickerPopupFooterProps {
	stateRef: HxDateTimePickerStateRef;
	clearable: boolean;
	time: boolean;
	todayKey?: ReactNode;
	clearKey?: ReactNode;
	confirmKey?: ReactNode;
}

export const HxDateTimePickerPopupFooter = (props: HxDatetimePickerPopupFooterProps) => {
	const {stateRef, clearable, todayKey, clearKey, confirmKey} = props;

	const popupContext = useHxPopupContext();

	const onTodayClick = () => {
		const date = UTCDate.now().toStartOfDay();
		stateRef.changeDayTo(date.getFullYear(), date.getMonthIndex() + 1, date.getDayOfMonth(), true, false);
		popupContext.emit(EvtHxDateTimePicker_DaySelected);
	};
	const onClearClick = () => {
		stateRef.clearModelValue();
		popupContext.emit(EvtHxDateTimePicker_ClosePopup);
	};
	const onConfirmClick = () => {
		stateRef.syncToModel();
		popupContext.emit(EvtHxDateTimePicker_ClosePopup);
	};
	const onAnyMouseEnter = (ev: MouseEvent<HTMLSpanElement>) => {
		popupContext.emit(EvtHxDateTimePicker_HoverChange, ev.target);
	};

	return <div data-hx-dtp-panel-footer="">
		<span data-hx-dtp-panel-footer-separator=""/>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="today" text={todayKey}
		          onClick={onTodayClick} onMouseEnter={onAnyMouseEnter}/>
		{clearable
			? <HxButton variant="ghost" color="danger" tabIndex={-1}
			            data-hx-dtp-panel-btn="clear" text={clearKey}
			            onClick={onClearClick}
			            onMouseEnter={onAnyMouseEnter}/>
			: (void 0)}
		{stateRef.syncValueImmediate()
			? (void 0)
			: <HxButton variant="ghost" color="primary" tabIndex={-1}
			            data-hx-dtp-panel-btn="confirm" text={confirmKey}
			            onClick={onConfirmClick}
			            onMouseEnter={onAnyMouseEnter}/>}
	</div>;
};