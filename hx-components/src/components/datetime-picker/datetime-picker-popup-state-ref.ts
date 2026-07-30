import {ERO} from '@hx/data';
import {useRef} from 'react';
import {type HxLanguageCode, useHxContext} from '../../contexts';
import type {HxDateTimeValue} from '../../types';
import {
	type ComputedDays,
	type ComputedWeek,
	DateLocaleUtils,
	DateMoveUtils,
	DateUtils,
	type HxFormattedDay,
	type HxFormattedEra,
	type HxFormattedMonth,
	type HxFormattedWeekdays,
	type HxFormattedYear,
	NumberUtils
} from '../../utils';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerPopupProps} from './datetime-picker-popup-types';
import {HxDateTimeUtils} from './datetime-picker-popup-utils';
import {HxDateTimePickerDefaults} from './defaults';
import {EvtHxDateTimePicker_ValueChange, EvtHxDateTimePicker_ValueClear} from './types';
import {parseModelValue} from './utils';

export type HxDatetimePickerPopupStateRefOptions<T extends object> =
	Pick<HxDateTimePickerPopupProps<T>,
		| '$model' | '$field'
		| 'valueFormat' | 'defaultValue'
		| 'calendarLocale'
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
	labelOfYear(era: string, year: string): string;
	labelOfMonth(era: string, year: string, month: string): string;
	eraOfDays(days: ComputedDays): Map<Date, string>;

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
		calendarLocale,
		firstDayOfWeek, weekendDays
	} = options;

	const context = useHxContext();
	const popupContext = useHxPopupContext();
	const stateRef = useRef<HxDateTimePickerPopupCurrentState>({});

	// the locale
	const language = (): HxLanguageCode => {
		if (calendarLocale === DateLocaleUtils.GREGORY) {
			return context.language.current();
		} else if (calendarLocale == null || calendarLocale.trim().length === 0) {
			return context.language.current();
		} else {
			return calendarLocale;
		}
	};
	// the calendar
	const isGregorian = (): boolean => {
		if (calendarLocale === DateLocaleUtils.GREGORY) {
			return true;
		} else if (calendarLocale == null || calendarLocale.trim().length === 0) {
			return HxDateTimePickerDefaults.forceGregorian;
		} else {
			return DateLocaleUtils.isUsingGregoryCalendar(language());
		}
	};
	const stateValue = (): Required<HxDateTimeValue> => {
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

		const value = stateValue();
		const date = DateMoveUtils.asJsDate(value);

		const lang = language();
		const gregorian = isGregorian();
		const [era, year, month, day, weekdays] = DateLocaleUtils.formatDate(date, lang, gregorian);
		const formattedYear = (era.length === 0 && NumberUtils.isANumber(year)) ? year.padStart(4, '0') : year;
		const monthLong = DateLocaleUtils.formatMonthLong(date, lang, gregorian);

		stateRef.current.formatted = {era, year: formattedYear, month, monthLong, day, weekdays};
		return stateRef.current.formatted;
	};
	const labelOfYear = (era: string, year: string): string => {
		return DateLocaleUtils.labelOfYear(language(), isGregorian(), stateValue(), era, year);
	};
	const labelOfMonth = (era: string, year: string, month: string): string => {
		return DateLocaleUtils.labelOfMonth(language(), isGregorian(), stateValue(), era, year, month);
	};
	const eraOfDays = (days: ComputedDays): Map<Date, string> => {
		return DateLocaleUtils.eraOfDays(language(), isGregorian(), days);
	};

	const weekdays = (): ComputedWeek => {
		return HxDateTimeUtils.computeWeekdays(formatted().weekdays, language(), firstDayOfWeek, weekendDays);
	};
	const days = (weekdays: ComputedWeek): ComputedDays => {
		const gregorian = isGregorian();
		const date = DateMoveUtils.asJsDate(stateValue());
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

		const value = stateValue();
		const gregorian = isGregorian();
		const lang = language();
		const moved = DateMoveUtils.moveYear(value, yearOffset, lang, gregorian);
		value.year = moved.year;
		value.month = moved.month;
		value.day = moved.day;
		// TODO don't notify when value changed only on day selected
		clearCacheAndNotify(value);
	};
	const changeMonth = (monthOffset: number): void => {
		if (monthOffset === 0) {
			return;
		}

		const value = stateValue();
		const gregorian = isGregorian();
		const lang = language();
		const moved = DateMoveUtils.moveMonth(value, monthOffset, lang, gregorian);
		value.year = moved.year;
		value.month = moved.month;
		value.day = moved.day;
		// TODO don't notify when value changed only on day selected
		clearCacheAndNotify(value);
	};
	const changeDayTo = (yearOfGregory: number, monthOfGregory: number, dayOfGregory: number): void => {
		const value = stateValue();
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
		value: stateValue, formatted, labelOfYear, labelOfMonth, eraOfDays,

		gregorian: isGregorian, language,

		weekdays, days,

		changeYear, changeMonth, changeDayTo,
		clearModelValue,

		forceUpdate,

		clear
	};
};