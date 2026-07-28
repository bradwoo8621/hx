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
		const formattedYear = era.length === 0 ? year.padStart(4, '0') : year;
		const monthLong = DateLocaleUtils.formatMonthLong(date, lang, gregorian);

		stateRef.current.formatted = {era, year: formattedYear, month, monthLong, day, weekdays};
		return stateRef.current.formatted;
	};
	const labelOfYear = (era: string, year: string): string => {
		const lang = language();
		const gregorian = isGregorian();
		if (!gregorian && DateLocaleUtils.isJa(lang)) {
			const value = stateValue();
			const date = DateMoveUtils.asJsDate(value);
			const [, , , dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
			date.setDate(date.getDate() - dayOfCalendar + 1);
			const [eraOfFirstDay, yearOfFirstDay] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
			year = DateLocaleUtils.yearAs(lang, date, () => {
				return [
					{type: 'year', value: `${yearOfFirstDay}`},
					{type: 'literal', value: '年'}
				];
			});
			return `${eraOfFirstDay}${year}`;
		} else {
			return `${era}${year}`;
		}
	};
	const labelOfMonth = (_era: string, _year: string, month: string): string => {
		return month;
	};
	const eraOfDays = (days: ComputedDays): Map<Date, string> => {
		const lang = language();
		const gregorian = isGregorian();
		if (!gregorian && DateLocaleUtils.isJa(lang)) {
			const daysOfThisMonth = days.filter(day => day.thisMonth);
			const firstDay = daysOfThisMonth[0].value;
			const [eraOfFirstDay] = DateLocaleUtils.formatDateInNumeric(firstDay, lang, false);
			const lastDay = daysOfThisMonth[daysOfThisMonth.length - 1].value;
			const [eraOfLastDay] = DateLocaleUtils.formatDateInNumeric(lastDay, lang, false);
			if (eraOfFirstDay === eraOfLastDay) {
				return new Map<Date, string>();
			} else {
				const map = new Map<Date, string>();
				// special case for 至徳
				if (firstDay.getFullYear() === 1387 && firstDay.getMonth() === 7 && firstDay.getDate() === 9) {
					map.set(daysOfThisMonth[21].value, '至徳');
					map.set(daysOfThisMonth[22].value, '嘉慶');
				} else {
					const dayOfFirstDay = firstDay.getDate();
					// find the first day of next era, binary search?
					if (firstDay.getMonth() === 11) {
						firstDay.setFullYear(firstDay.getFullYear() + 1, 0, 0);
					}
					// first day and last day not count in
					const days = (firstDay.getDate() - dayOfFirstDay) + (lastDay.getDate() - 1);
					// TODO
					console.log(days);
				}
				return map;
			}
		} else {
			return new Map<Date, string>();
		}
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