// @ts-expect-error import React
import React, {type ReactNode} from 'react';
import {HxButton} from '../button';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';

export interface HxDatetimePickerPopupFooterProps {
	stateRef: HxDateTimePickerStateRef;
	clearable: boolean;
	todayKey?: ReactNode;
	clearKey?: ReactNode;
}

export const HxDateTimePickerPopupFooter = (props: HxDatetimePickerPopupFooterProps) => {
	const {stateRef, clearable, todayKey, clearKey} = props;

	const onTodayClick = () => {
		const date = new Date();
		stateRef.changeDayTo(date.getFullYear(), date.getMonth() + 1, date.getDate());
		stateRef.forceUpdate();
	};
	const onClearClick = () => {
		stateRef.clearModelValue();
	};

	return <div data-hx-dtp-panel-footer="">
		<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="today" text={todayKey}
		          onClick={onTodayClick}/>
		{/* TODO time part (hns) */}
		{clearable
			? <HxButton variant="ghost" color="danger" tabIndex={-1}
			            data-hx-dtp-panel-btn="clear" text={clearKey}
			            onClick={onClearClick}/>
			: (void 0)}
	</div>;
};