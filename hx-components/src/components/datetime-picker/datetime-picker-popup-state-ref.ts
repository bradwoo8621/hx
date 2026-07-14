import {ERO} from '@hx/data';
import {useRef} from 'react';
import {type HxLanguageCode, useHxContext} from '../../contexts';
import type {HxDateTimeValue} from '../../types';
import {
	DateLocaleUtils,
	DateUtils,
	type HxFormattedDay,
	type HxFormattedEra,
	type HxFormattedMonth,
	type HxFormattedWeekdays,
	type HxFormattedYear
} from '../../utils';
import {useHxPopupContext} from '../popup';
import type {ComputedDays, ComputedWeek, HxDateTimePickerPopupProps} from './datetime-picker-popup-types';
import {asJsDate, computeDays, computeWeekdays, fixDayWhenOverLastDayOfMonth} from './datetime-picker-popup-utils';
import {HxDateTimePickerDefaults} from './defaults';
import {EvtHxDateTimePicker_ValueChange, EvtHxDateTimePicker_ValueClear} from './types';
import {parseModelValue} from './utils';

export type HxDatetimePickerPopupStateRefOptions<T extends object> =
	Pick<HxDateTimePickerPopupProps<T>,
		| '$model' | '$field'
		| 'valueFormat' | 'defaultValue'
		| 'forceLang'
		| 'firstDayOfWeek' | 'weekendDays'
	>;

export interface HxDateTimeFormattedLabels {
	era: HxFormattedEra;
	year: HxFormattedYear;
	month: HxFormattedMonth;
	monthLong: HxFormattedMonth;
	day: HxFormattedDay;
	weekdays: HxFormattedWeekdays;
}

export interface HxDateTimePickerStateRef {
	value(): Required<HxDateTimeValue>;
	formatted(): HxDateTimeFormattedLabels;

	gregorian(): boolean;
	language(): HxLanguageCode;

	weekdays(): ComputedWeek;
	days(weekdays: ComputedWeek): ComputedDays;

	changeYearTo(year: number): void;
	changeMonthTo(month: number): void;

	setDayTo(year: number, month: number, day: number): void;

	clearValue(): void;

	forceUpdate(): void;

	clear(): void;
}

export interface HxDateTimePickerPopupCurrentState {
	value?: Required<HxDateTimeValue>;
	formatted?: HxDateTimeFormattedLabels;
}

export const useHxDateTimePickerPopupStateRef = <T extends object>(options: HxDatetimePickerPopupStateRefOptions<T>): HxDateTimePickerStateRef => {
	const {
		$model, $field,
		valueFormat, defaultValue,
		forceLang,
		firstDayOfWeek, weekendDays
	} = options;

	const context = useHxContext();
	const popupContext = useHxPopupContext();
	const stateRef = useRef<HxDateTimePickerPopupCurrentState>({});

	const isGregorian = () => {
		if (forceLang === 'gregory') {
			return true;
		} else if (forceLang == null || forceLang.trim().length === 0) {
			return HxDateTimePickerDefaults.forceGregorian;
		} else {
			return false;
		}
	};
	const language = (): HxLanguageCode => {
		if (forceLang === 'gregory') {
			return context.language.current();
		} else if (forceLang == null || forceLang.trim().length === 0) {
			return context.language.current();
		} else {
			return forceLang;
		}
	};
	const readFromModel = () => {
		if (stateRef.current.value != null) {
			return stateRef.current.value;
		}

		const value = ERO.getValue($model, $field);
		let parsedValue: Required<HxDateTimeValue>;
		if (value == null || (typeof value === 'string' && value.trim().length === 0)) {
			parsedValue = DateUtils.fulfillWithDefault({}, defaultValue);
		} else {
			const parsed = parseModelValue(value, valueFormat);
			if (parsed === false) {
				parsedValue = DateUtils.fulfillWithDefault({}, defaultValue);
			} else {
				parsedValue = DateUtils.fulfillWithDefault(DateUtils.fromParsed(parsed), defaultValue);
			}
		}
		stateRef.current.value = parsedValue;
		return parsedValue;
	};
	const formatted = () => {
		if (stateRef.current.formatted != null) {
			return stateRef.current.formatted;
		}

		const value = readFromModel();
		const date = asJsDate(value);

		const lang = language();
		const gregorian = isGregorian();
		const [era, year, month, day, weekdays] = DateLocaleUtils.formatDate(date, lang, gregorian);
		const monthLong = DateLocaleUtils.formatMonthLong(date, lang, gregorian);

		stateRef.current.formatted = {era, year, month, monthLong, day, weekdays};
		return stateRef.current.formatted;
	};

	const weekdays = (): ComputedWeek => {
		return computeWeekdays(formatted().weekdays, language(), firstDayOfWeek, weekendDays);
	};
	const days = (weekdays: ComputedWeek): ComputedDays => {
		const gregorian = isGregorian();
		const date = asJsDate(readFromModel());
		return computeDays(date, language(), gregorian, weekdays);
	};

	const changeYearTo = (year: number) => {
		const value = readFromModel();
		value.year = year;
		fixDayWhenOverLastDayOfMonth(value);
		popupContext.emit(EvtHxDateTimePicker_ValueChange, value);
	};
	const changeMonthTo = (month: number) => {
		const value = readFromModel();
		if (month === 0) {
			// to December of previous year
			value.year = value.year - 1;
			value.month = 12;
		} else if (month === 13) {
			// to January of next year
			value.year = value.year + 1;
			value.month = 1;
		} else {
			value.month = month;
		}
		fixDayWhenOverLastDayOfMonth(value);
		popupContext.emit(EvtHxDateTimePicker_ValueChange, value);
	};

	const setDayTo = (year: number, month: number, day: number) => {
		const value = readFromModel();
		value.year = year;
		value.month = month;
		value.day = day;
		popupContext.emit(EvtHxDateTimePicker_ValueChange, value);
	};

	const clearValue = () => {
		popupContext.emit(EvtHxDateTimePicker_ValueClear);
	};

	const forceUpdate = () => {
		context.forceUpdate();
	};

	const clear = () => {
		delete stateRef.current.formatted;
		delete stateRef.current.value;
	};

	return {
		value: readFromModel, formatted,

		gregorian: isGregorian, language,

		weekdays, days,

		changeYearTo, changeMonthTo,
		setDayTo,
		clearValue,

		forceUpdate,

		clear
	};
};