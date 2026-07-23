import {ERO} from '@hx/data';
import {useRef} from 'react';
import {type HxLanguageCode, useHxContext} from '../../contexts';
import type {HxDateTimeValue} from '../../types';
import {
	DateLocaleUtils,
	DateMoveUtils,
	DateUtils,
	type HxFormattedDay,
	type HxFormattedEra,
	type HxFormattedMonth,
	type HxFormattedWeekdays,
	type HxFormattedYear
} from '../../utils';
import {useHxPopupContext} from '../popup';
import type {ComputedDays, ComputedWeek, HxDateTimePickerPopupProps} from './datetime-picker-popup-types';
import {HxDateTimeUtils} from './datetime-picker-popup-utils';
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

	/**
	 * month and day rules:
	 * - try to keep same,
	 * - if current month is 13, and target year doesn't have #13 month, set month to 12,
	 * - if target year + month doesn't have enough days, set day to last day of target year + month.
	 *
	 * @param yearOffset offset years.
	 */
	changeYear(yearOffset: number): void;
	/**
	 * year and day rules:
	 * - change year according to month offset first, e.g.
	 *   - if current month + month offset is in range [1, 12], keep year,
	 *   - if current month + month offset is over range [1, 12], consider if there are the leap years which has 13 months,
	 * - if target year + month doesn't have enough days, set day to last day of target year + month.
	 */
	changeMonth(monthOffset: number): void;
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
		const date = HxDateTimeUtils.asJsDate(value);

		const lang = language();
		const gregorian = isGregorian();
		const [era, year, month, day, weekdays] = DateLocaleUtils.formatDate(date, lang, gregorian);
		const formattedYear = era.length === 0 ? year.padStart(4, '0') : year;
		const monthLong = DateLocaleUtils.formatMonthLong(date, lang, gregorian);

		stateRef.current.formatted = {era, year: formattedYear, month, monthLong, day, weekdays};
		return stateRef.current.formatted;
	};

	const weekdays = (): ComputedWeek => {
		return HxDateTimeUtils.computeWeekdays(formatted().weekdays, language(), firstDayOfWeek, weekendDays);
	};
	const days = (weekdays: ComputedWeek): ComputedDays => {
		const gregorian = isGregorian();
		const date = HxDateTimeUtils.asJsDate(valueFromModel());
		return HxDateTimeUtils.computeDays(date, language(), gregorian, weekdays);
	};

	const clearCacheButValue = () => {
		delete stateRef.current.formatted;
	};
	const clearCacheAndNotify = (value: Required<HxDateTimeValue>) => {
		// clear cache
		clearCacheButValue();
		// notify
		popupContext.emit(EvtHxDateTimePicker_ValueChange, value);
	};
	const changeYear = (yearOffset: number): void => {
		if (yearOffset === 0) {
			return;
		}

		const value = valueFromModel();
		const gregorian = isGregorian();
		const lang = language();
		const moved = DateMoveUtils.moveYear(value, yearOffset, lang, gregorian);
		value.year = moved.year;
		value.month = moved.month;
		value.day = moved.day;
		clearCacheAndNotify(value);
	};
	const changeMonth = (monthOffset: number): void => {
		if (monthOffset === 0) {
			return;
		}

		const value = valueFromModel();
		const gregorian = isGregorian();
		const lang = language();
		const moved = DateMoveUtils.moveMonth(value, monthOffset, lang, gregorian);
		value.year = moved.year;
		value.month = moved.month;
		value.day = moved.day;
		clearCacheAndNotify(value);
	};
	const changeDayTo = (yearOfGregory: number, monthOfGregory: number, dayOfGregory: number): void => {
		const value = valueFromModel();
		value.year = yearOfGregory;
		value.month = monthOfGregory;
		value.day = dayOfGregory;
		clearCacheAndNotify(value);
	};

	const clearModelValue = (): void => {
		popupContext.emit(EvtHxDateTimePicker_ValueClear);
	};

	const forceUpdate = (): void => {
		context.forceUpdate();
	};

	const clear = (): void => {
		clearCacheButValue();
		delete stateRef.current.value;
	};

	return {
		value: valueFromModel, formatted,

		gregorian: isGregorian, language,

		weekdays, days,

		changeYear, changeMonth, changeDayTo,
		clearModelValue,

		forceUpdate,

		clear
	};
};