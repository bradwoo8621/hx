// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import type {HxDateTimeValue, HxParsedDateTimeFormat} from '../../types';
import {DateLocaleUtils} from '../../utils';
import {HxButton} from '../button';
import {ChevronLeft, ChevronRight, DoubleArrowLeft, DoubleArrowRight} from '../icons';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import {HxDateTimePickerDefaults} from './defaults';
import {EvtHxDateTimePicker_GetCurrentValue, type HxExtDateTimePickerProps} from './types';

export type HxDateTimePickerPopupProps<T extends object> =
	& Pick<HxExtDateTimePickerProps<T>, | 'firstDayOfWeek' | 'forceGregorian' | 'nowKey' | 'clearKey'>
	& {
	/** Whether the popup is visible */
	visible: boolean;
	availableParts: Omit<HxParsedDateTimeFormat, 'sequence'>;
};

type HxDateTimePickerPopupValueStateNotInitialized = { get: false };
type HxDateTimePickerPopupValueStateInitialized = { get: true, value: Required<HxDateTimeValue> };
type HxDateTimePickerPopupValueState =
	HxDateTimePickerPopupValueStateNotInitialized
	| HxDateTimePickerPopupValueStateInitialized;

const isStateInitialized = (state: HxDateTimePickerPopupValueState): state is HxDateTimePickerPopupValueStateInitialized => {
	return state.get;
};

const asJsDate = (value: Required<HxDateTimeValue>): Date => {
	return new Date(Date.UTC(value.year, value.month - 1, value.day, value.hour, value.minute, value.second));
};

export const HxDateTimePickerPopup =
	<T extends object>(props: HxDateTimePickerPopupProps<T>) => {
		const {
			visible,
			// availableParts,
			// firstDayOfWeek = HxDateTimePickerDefaults.firstDayOfWeek,
			forceGregorian = HxDateTimePickerDefaults.forceGregorian
			// nowKey = HxDateTimePickerDefaults.nowKey, clearKey = HxDateTimePickerDefaults.clearKey
		} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();
		const currentValueRef = useRef<HxDateTimePickerPopupValueState>({get: false});
		const containerRef = useRef<HTMLDivElement>(null);
		useEffect(() => {
			if (visible) {
				popupContext.emit(EvtHxDateTimePicker_GetCurrentValue, (value: Required<HxDateTimeValue>) => {
					currentValueRef.current = {get: true, value};
					context.forceUpdate();
				});
			} else {
				// no need to force update when visible switch from true to false
				currentValueRef.current = {get: false};
			}
		}, [context, popupContext, visible]);

		// Don't render if popup is hidden
		if (!visible) {
			return null;
		}

		// eslint-disable-next-line react-hooks/refs
		if (!isStateInitialized(currentValueRef.current)) {
			return false;
		}

		const currentValue = currentValueRef.current.value;
		const onYearChange = (year: number) => {
			currentValue.year = year;
		};
		const onMonthChange = (month: number) => {
			if (month === 0) {
				// to December of previous year
				currentValue.year = currentValue.year - 1;
				currentValue.month = 12;
			} else if (month === 13) {
				// to January of next year
				currentValue.year = currentValue.year + 1;
				currentValue.month = 1;
			} else {
				currentValue.month = month;
			}
			context.forceUpdate();
		};
		const onPreviousYearClick = () => {
			onYearChange(currentValue.year - 1);
		};
		const onNextYearClick = () => {
			onYearChange(currentValue.year + 1);
		};
		const onPreviousMonthClick = () => {
			onMonthChange(currentValue.month - 1);
		};
		const onNextMonthClick = () => {
			onMonthChange(currentValue.month + 1);
		};

		const lang = context.language.current();
		// eslint-disable-next-line react-hooks/refs
		const [, year, month] = DateLocaleUtils.formatDate(asJsDate(currentValue), lang, forceGregorian);

		return <div data-hx-dtp-panel="" tabIndex={-1} ref={containerRef}>
			<div data-hx-dtp-panel-header="">
				<HxButton data-hx-button-svg-icon="" variant="ghost" text={<DoubleArrowLeft/>}
				          onClick={onPreviousYearClick}/>
				<HxButton data-hx-button-svg-icon="" variant="ghost" text={<ChevronLeft/>}
				          onClick={onPreviousMonthClick}/>
				<HxLabel text={year}/>
				<HxLabel text={month}/>
				<HxButton data-hx-button-svg-icon="" variant="ghost" text={<ChevronRight/>}
				          onClick={onNextMonthClick}/>
				<HxButton data-hx-button-svg-icon="" variant="ghost" text={<DoubleArrowRight/>}
				          onClick={onNextYearClick}/>
			</div>
		</div>;
	};
