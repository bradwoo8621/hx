// @ts-expect-error import React
import React, {type ReactNode} from 'react';
import {UTCDate} from '../../utils';
import {HxButton} from '../button';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {EvtHxDateTimePicker_DaySelected} from './types';

export interface HxDatetimePickerPopupFooterProps {
	stateRef: HxDateTimePickerStateRef;
	clearable: boolean;
	time: boolean;
	todayKey?: ReactNode;
	clearKey?: ReactNode;
	confirmKey?: ReactNode;
}

export const HxDateTimePickerPopupFooter = (props: HxDatetimePickerPopupFooterProps) => {
	const {stateRef, clearable, time, todayKey, clearKey, confirmKey} = props;

	const popupContext = useHxPopupContext();

	const onTodayClick = () => {
		const date = UTCDate.now().toStartOfDay();
		stateRef.changeDayTo(date.getFullYear(), date.getMonthIndex() + 1, date.getDayOfMonth());
		popupContext.emit(EvtHxDateTimePicker_DaySelected);
	};
	const onClearClick = () => {
		stateRef.clearModelValue();
	};
	const onConfirmClick = () => {
		// TODO
	};

	return <div data-hx-dtp-panel-footer="">
		<span data-hx-dtp-panel-footer-separator=""/>
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="today" text={todayKey}
		          onClick={onTodayClick}/>
		{clearable
			? <HxButton variant="ghost" color="danger" tabIndex={-1}
			            data-hx-dtp-panel-btn="clear" text={clearKey}
			            onClick={onClearClick}/>
			: (void 0)}
		{time
			? <HxButton variant="ghost" color="primary" tabIndex={-1}
			            data-hx-dtp-panel-btn="confirm" text={confirmKey}
			            onClick={onConfirmClick}/>
			: (void 0)}
	</div>;
};