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

	moveYear(year: number): void;
	moveMonth(month: number): void;

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
	const readFromModel = (): Required<HxDateTimeValue> => {
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

	/** ymd values after not-gregorian format */
	type FormattedNotGregorianDate = { year: number; month: number; day: number };
	type MoveCheckResult = 'add' | 'minus' | 'match';
	const moveWhenNotGregorian = (options: {
		from: Date; offsetDays: number;
		check: (source: FormattedNotGregorianDate, target: FormattedNotGregorianDate) => MoveCheckResult;
	}): Date => {
		const {from, offsetDays, check} = options;

		const lang = language();
		const [year, month, day] = DateLocaleUtils.formatDateInNumeric(from, lang, false);

		let result: MoveCheckResult;
		const targetDate = new Date(from);
		targetDate.setDate(targetDate.getDate() + offsetDays);
		do {
			const [targetYear, targetMonth, targetDay] = DateLocaleUtils.formatDateInNumeric(targetDate, lang, false);
			result = check({year, month, day}, {year: targetYear, month: targetMonth, day: targetDay});
			if (result === 'add') {
				targetDate.setDate(targetDate.getDate() + 1);
			} else if (result === 'minus') {
				targetDate.setDate(targetDate.getDate() - 1);
			}
		} while (result !== 'match');

		return targetDate;
	};
	const moveYear = (offset: number): void => {
		const value = readFromModel();
		const gregorian = isGregorian();
		if (gregorian) {
			value.year = value.year + offset;
			fixDayWhenOverLastDayOfMonth(value);
		} else {
			const targetDate = moveWhenNotGregorian({
				from: asJsDate(value), offsetDays: 365 * offset,
				check: (source: FormattedNotGregorianDate, target: FormattedNotGregorianDate): MoveCheckResult => {
					const distance = target.year - source.year;
					if (distance === offset) {
						if (target.month < source.month) {
							return 'add';
						} else if (target.month > source.month) {
							return 'minus';
						} else {
							return 'match';
						}
					} else if (distance < offset) {
						return target.year > source.year ? 'add' : 'minus';
					} else {
						return target.year > source.year ? 'minus' : 'add';
					}
				}
			});
			value.year = targetDate.getFullYear();
			value.month = targetDate.getMonth() + 1;
			value.day = targetDate.getDate();
		}
		popupContext.emit(EvtHxDateTimePicker_ValueChange, value);
	};
	const moveMonth = (offset: number): void => {
		const value = readFromModel();
		const gregorian = isGregorian();
		if (gregorian) {
			const targetMonth = value.month + offset;
			if (targetMonth <= 0) {
				// 0 -> 12, -1 -> 11, ..., -11 -> 1; -1 year
				// -12 -> 12, -13 -> 11, ..., -23 -> 1; -2 year
				value.year = value.year - Math.ceil((1 - targetMonth) / 12);
				value.month = 12 - Math.floor(Math.abs(targetMonth) % 12);
			} else if (targetMonth > 12) {
				// 13 -> 1, 14 -> 2, ..., 24 -> 12; +1 year
				// 25 -> 1, 26 -> 2, ..., 36 -> 12; +2 year
				value.year = value.year + Math.floor((targetMonth - 1) / 12);
				value.month = (targetMonth - 1) % 12 + 1;
			} else {
				// year not change, assign month directly
				value.month = targetMonth;
			}
			fixDayWhenOverLastDayOfMonth(value);
		} else {
			const targetDate = moveWhenNotGregorian({
				from: asJsDate(value), offsetDays: 30 * offset,
				check: (source: FormattedNotGregorianDate, target: FormattedNotGregorianDate): MoveCheckResult => {

				}
			});
			value.year = targetDate.getFullYear();
			value.month = targetDate.getMonth() + 1;
			value.day = targetDate.getDate();
		}
		popupContext.emit(EvtHxDateTimePicker_ValueChange, value);
	};

	const setDayTo = (year: number, month: number, day: number): void => {
		const value = readFromModel();
		value.year = year;
		value.month = month;
		value.day = day;
		popupContext.emit(EvtHxDateTimePicker_ValueChange, value);
	};

	const clearValue = (): void => {
		popupContext.emit(EvtHxDateTimePicker_ValueClear);
	};

	const forceUpdate = (): void => {
		context.forceUpdate();
	};

	const clear = (): void => {
		delete stateRef.current.formatted;
		delete stateRef.current.value;
	};

	return {
		value: readFromModel, formatted,

		gregorian: isGregorian, language,

		weekdays, days,

		moveYear, moveMonth,
		setDayTo,
		clearValue,

		forceUpdate,

		clear
	};
};