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
import {
	asJsDate,
	changeMonthToWhenNotGregorian,
	changeYearToWhenNotGregorian,
	computeDays,
	computeWeekdays,
	fixDayWhenOverLastDayOfMonth
} from './datetime-picker-popup-utils';
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

export interface HxDateTimeAnteroposteriorYearMonth {
	currentYear: number;
	previousYear: number;
	nextYear: number;
	currentMonth: number;
	previousMonth: number;
	nextMonth: number;
}

export interface HxDateTimePickerStateRef {
	value(): Required<HxDateTimeValue>;
	formatted(): HxDateTimeFormattedLabels;
	anteroposteriorYearMonth(): HxDateTimeAnteroposteriorYearMonth;

	gregorian(): boolean;
	language(): HxLanguageCode;

	weekdays(): ComputedWeek;
	days(weekdays: ComputedWeek): ComputedDays;

	/** year could be gregorian or any other calendar */
	changeYearTo(yearOfCalendar: number): void;
	/** month could be gregorian or any other calendar */
	changeMonthTo(yearOfCalendar: number, monthOfCalendar: number): void;
	/** year/month/day are gregorian */
	changeDayTo(yearOfGregory: number, monthOfGregory: number, dayOfGregory: number): void;
	/** clear model value */
	clearModelValue(): void;

	forceUpdate(): void;

	clear(): void;
}

export interface HxDateTimePickerPopupCurrentState {
	value?: Required<HxDateTimeValue>;
	formatted?: HxDateTimeFormattedLabels;
	anteroposteriorYearMonth?: HxDateTimeAnteroposteriorYearMonth;
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

	const isGregorian = (): boolean => {
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
	const valueFromModel = (): Required<HxDateTimeValue> => {
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
	const formatted = (): HxDateTimeFormattedLabels => {
		if (stateRef.current.formatted != null) {
			return stateRef.current.formatted;
		}

		const value = valueFromModel();
		const date = asJsDate(value);

		const lang = language();
		const gregorian = isGregorian();
		const [era, year, month, day, weekdays] = DateLocaleUtils.formatDate(date, lang, gregorian);
		const monthLong = DateLocaleUtils.formatMonthLong(date, lang, gregorian);

		stateRef.current.formatted = {era, year, month, monthLong, day, weekdays};
		return stateRef.current.formatted;
	};
	const anteroposteriorYearMonth = (): HxDateTimeAnteroposteriorYearMonth => {
		if (stateRef.current.anteroposteriorYearMonth != null) {
			return stateRef.current.anteroposteriorYearMonth;
		}

		const value = valueFromModel();
		const date = asJsDate(value);
		const gregorian = isGregorian();
		if (gregorian) {
			const year = date.getFullYear();
			const month = date.getMonth() + 1;
			return {
				previousYear: Math.max(1, year - 1),
				currentYear: year,
				nextYear: year + 1,
				previousMonth: month === 1 ? 12 : (month - 1),
				currentMonth: month,
				nextMonth: month === 12 ? 1 : (month + 1)
			};
		}

		const lang = language();
		const [year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
		// min year is 1 of given calendar
		const previousYear = Math.max(1, year - 1);
		const nextYear = year + 1;
		let previousMonth: number;
		let nextMonth: number;
		if (month === 1) {
			// check if there is #13 month in previous year
			// move day to last day of previous month
			const lastDayOfPreviousMonth = new Date(date);
			lastDayOfPreviousMonth.setDate(lastDayOfPreviousMonth.getDate() - day);
			const [, lastMonthOfPreviousYear] = DateLocaleUtils.formatDateInNumeric(lastDayOfPreviousMonth, lang, false);
			previousMonth = lastMonthOfPreviousYear;
			nextMonth = 2;
		} else if (month === 12) {
			// check if there is #13 month in this year
			// the last day of this month could be 29/30/31, in any calendar
			// so set date to 32 will make month change to next month
			const somedayOfNextMonth = new Date(date);
			somedayOfNextMonth.setDate(somedayOfNextMonth.getDate() + (32 - day));
			const [, firstMonthOfNextYear] = DateLocaleUtils.formatDateInNumeric(somedayOfNextMonth, lang, false);
			previousMonth = 11;
			nextMonth = firstMonthOfNextYear;
		} else if (month === 13) {
			previousMonth = 12;
			nextMonth = 1;
		} else {
			previousMonth = month - 1;
			nextMonth = month + 1;
		}

		stateRef.current.anteroposteriorYearMonth = {
			previousYear, currentYear: year, nextYear,
			previousMonth, currentMonth: month, nextMonth
		};
		return stateRef.current.anteroposteriorYearMonth;
	};

	const weekdays = (): ComputedWeek => {
		return computeWeekdays(formatted().weekdays, language(), firstDayOfWeek, weekendDays);
	};
	const days = (weekdays: ComputedWeek): ComputedDays => {
		const gregorian = isGregorian();
		const date = asJsDate(valueFromModel());
		return computeDays(date, language(), gregorian, weekdays);
	};

	const changeYearTo = (yearOfCalendar: number): void => {
		const value = valueFromModel();
		const gregorian = isGregorian();
		if (gregorian) {
			value.year = yearOfCalendar;
			fixDayWhenOverLastDayOfMonth(value);
		} else {
			const targetDate = changeYearToWhenNotGregorian(yearOfCalendar, asJsDate(value), language());
			value.year = targetDate.getFullYear();
			value.month = targetDate.getMonth() + 1;
			value.day = targetDate.getDate();
		}
		// clear cache
		delete stateRef.current.anteroposteriorYearMonth;
		delete stateRef.current.formatted;
		// notify
		popupContext.emit(EvtHxDateTimePicker_ValueChange, value);
	};
	const changeMonthTo = (yearOfCalendar: number, monthOfCalendar: number): void => {
		const value = valueFromModel();
		const gregorian = isGregorian();
		if (gregorian) {
			value.year = yearOfCalendar;
			value.month = monthOfCalendar;
			fixDayWhenOverLastDayOfMonth(value);
		} else {
			const targetDate = changeMonthToWhenNotGregorian(yearOfCalendar, monthOfCalendar, asJsDate(value), language());
			value.year = targetDate.getFullYear();
			value.month = targetDate.getMonth() + 1;
			value.day = targetDate.getDate();
		}
		// clear cache
		delete stateRef.current.anteroposteriorYearMonth;
		delete stateRef.current.formatted;
		// notify
		popupContext.emit(EvtHxDateTimePicker_ValueChange, value);
	};

	const changeDayTo = (yearOfGregory: number, monthOfGregory: number, dayOfGregory: number): void => {
		const value = valueFromModel();
		value.year = yearOfGregory;
		value.month = monthOfGregory;
		value.day = dayOfGregory;
		popupContext.emit(EvtHxDateTimePicker_ValueChange, value);
	};

	const clearModelValue = (): void => {
		popupContext.emit(EvtHxDateTimePicker_ValueClear);
	};

	const forceUpdate = (): void => {
		context.forceUpdate();
	};

	const clear = (): void => {
		delete stateRef.current.anteroposteriorYearMonth;
		delete stateRef.current.formatted;
		delete stateRef.current.value;
	};

	return {
		value: valueFromModel, formatted, anteroposteriorYearMonth,

		gregorian: isGregorian, language,

		weekdays, days,

		changeYearTo, changeMonthTo, changeDayTo,
		clearModelValue,

		forceUpdate,

		clear
	};
};