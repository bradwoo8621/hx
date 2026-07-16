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
import type {
	ComputedDays,
	ComputedWeek,
	HxDateTimeAnteroposterior,
	HxDateTimeAnteroposteriorYearMonth,
	HxDateTimePickerPopupProps
} from './datetime-picker-popup-types';
import {
	asJsDate,
	backToAdWhenBc,
	changeMonthToWhenNotGregorian,
	changeYearToWhenNotGregorian,
	computeDays,
	computeWeekdays,
	firstDayOfAd,
	fixDayWhenOverLastDayOfMonth,
	moveMonthBackwardToInSameYearWhenNotGregorian
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

export interface HxDateTimePickerStateRef {
	value(): Required<HxDateTimeValue>;
	formatted(): HxDateTimeFormattedLabels;
	anteroposteriorYearMonth(): HxDateTimeAnteroposterior;

	gregorian(): boolean;
	language(): HxLanguageCode;

	weekdays(): ComputedWeek;
	days(weekdays: ComputedWeek): ComputedDays;

	/** year could be gregorian or any other calendar */
	changeYearTo(target: HxDateTimeAnteroposteriorYearMonth): void;
	/** month could be gregorian or any other calendar */
	changeMonthTo(target: HxDateTimeAnteroposteriorYearMonth): void;
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
	anteroposteriorYearMonth?: HxDateTimeAnteroposterior;
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
	const anteroposteriorYearMonth = (): HxDateTimeAnteroposterior => {
		if (stateRef.current.anteroposteriorYearMonth != null) {
			return stateRef.current.anteroposteriorYearMonth;
		}

		const value = valueFromModel();
		const date = asJsDate(value);
		const gregorian = isGregorian();
		// gregorian calendar
		if (gregorian) {
			const year = date.getFullYear();
			const month = date.getMonth() + 1;
			// year - 1, min is 1.
			const yearOfGregoryOfPreviousYear = year === 1 ? 1 : (year - 1);
			// month is not 1 -> same year
			// month is 1 -> year - 1, min is 1
			const yearOfGregoryOfPreviousMonth = month !== 1 ? year : (year === 1 ? 1 : (year - 1));
			// month is not 1 -> month - 1
			// month is 1, year is 1 -> 1
			// month is 1, year is not 1 -> 12
			const monthOfGregoryOfPreviousMonth = month !== 1 ? (month - 1) : (year === 1 ? 1 : 12);
			// month is not 12 -> same year
			// month is 12 -> year + 1
			const yearOfGregoryOfNextMonth = month !== 12 ? year : (year + 1);
			// month is not 12 -> month + 1
			// month is 12 -> 1
			const monthOfGregoryOfNextMonth = month !== 12 ? (month + 1) : 1;
			const yearOfGregoryOfNextYear = year + 1;
			stateRef.current.anteroposteriorYearMonth = {
				previousYear: {
					yearOfGregory: yearOfGregoryOfPreviousYear, monthOfGregory: 1,
					eraOfCalendar: '', yearOfCalendar: yearOfGregoryOfPreviousYear, monthOfCalendar: 1
				},
				previousMonth: {
					yearOfGregory: yearOfGregoryOfPreviousMonth, monthOfGregory: monthOfGregoryOfPreviousMonth,
					eraOfCalendar: '',
					yearOfCalendar: yearOfGregoryOfPreviousMonth, monthOfCalendar: monthOfGregoryOfPreviousMonth
				},
				current: {
					yearOfGregory: year, monthOfGregory: month,
					eraOfCalendar: '', yearOfCalendar: year, monthOfCalendar: month
				},
				nextMonth: {
					yearOfGregory: yearOfGregoryOfNextMonth, monthOfGregory: monthOfGregoryOfNextMonth,
					eraOfCalendar: '',
					yearOfCalendar: yearOfGregoryOfNextMonth, monthOfCalendar: monthOfGregoryOfNextMonth
				},
				nextYear: {
					yearOfGregory: yearOfGregoryOfNextYear, monthOfGregory: 1,
					eraOfCalendar: '', yearOfCalendar: yearOfGregoryOfNextYear, monthOfCalendar: 1
				}
			};
		}
		// non-gregorian calendar
		else {
			// Like the Gregorian calendar, ensure the earliest date does not go before 0001/01/01.
			// But note that 0001/01/02 being month B of year A does not mean 0001/01/01 is also month B of year A.
			const currentYearOfGregory = date.getFullYear();
			const currentMonthOfGregory = date.getMonth() + 1;
			const currentDayOfGregory = date.getDate();
			const isFirstDayOfAd = currentYearOfGregory === 1 && currentMonthOfGregory === 1 && currentDayOfGregory === 1;

			const lang = language();
			// get era/year/month/day
			const [
				currentEra, currentYearOfCalendar, currentMonthOfCalendar, currentDayOfCalendar
			] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
			const current: HxDateTimeAnteroposteriorYearMonth = {
				yearOfGregory: date.getFullYear(),
				monthOfGregory: date.getMonth() + 1,
				eraOfCalendar: currentEra,
				yearOfCalendar: currentYearOfCalendar,
				monthOfCalendar: currentMonthOfCalendar
			};
			// only two calendars with era: japanese (ja, ja-JP), roc (zh-TW, zh-Hant-TW)
			if (currentEra.length !== 0) {
				// TODO
			}
			// others has no era.
			else {
				// previous year & month
				let previousYear: HxDateTimeAnteroposteriorYearMonth;
				let previousMonth: HxDateTimeAnteroposteriorYearMonth;
				// current day is first day of AD
				if (isFirstDayOfAd) {
					// set current to previous year and month
					previousYear = {...current, monthOfCalendar: 1};
					previousMonth = {...current};
				}
				// current day is not first day of AD
				else {
					// previous month
					const lastDayOfPreviousMonth = new Date(date);
					lastDayOfPreviousMonth.setDate(lastDayOfPreviousMonth.getDate() - currentDayOfCalendar);
					// make sure date is AD
					backToAdWhenBc(lastDayOfPreviousMonth);
					const [, yearOfPreviousMonth, monthOfPreviousMonth] = DateLocaleUtils.formatDateInNumeric(lastDayOfPreviousMonth, lang, false);
					previousMonth = {
						yearOfGregory: lastDayOfPreviousMonth.getFullYear(),
						monthOfGregory: lastDayOfPreviousMonth.getMonth() + 1,
						eraOfCalendar: '',
						yearOfCalendar: yearOfPreviousMonth, monthOfCalendar: monthOfPreviousMonth
					};
					// previous year
					if (previousMonth.yearOfCalendar !== currentYearOfCalendar) {
						// year changed
						previousYear = {
							yearOfGregory: previousMonth.yearOfGregory, monthOfGregory: 1,
							eraOfCalendar: '',
							yearOfCalendar: previousMonth.yearOfCalendar, monthOfCalendar: 1
						};
					} else if (firstDayOfAd(lastDayOfPreviousMonth)) {
						// year not changed, but previous year is BC
						// set this year as previous year
						previousYear = {
							yearOfGregory: previousMonth.yearOfGregory, monthOfGregory: 1,
							eraOfCalendar: '',
							yearOfCalendar: previousMonth.yearOfCalendar, monthOfCalendar: 1
						};
					} else {
						// year not changed, move backward
						const {date, dayOfCalendar} = moveMonthBackwardToInSameYearWhenNotGregorian({
							sourceDate: lastDayOfPreviousMonth, sourceMonthOfCalendar: previousMonth.monthOfCalendar,
							targetMonthOfCalendar: 1,
							lang
						});
						date.setDate(date.getDate() - dayOfCalendar);
						backToAdWhenBc(date);
						const [, yearOfPreviousYear] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
						previousYear = {
							yearOfGregory: date.getFullYear(), monthOfGregory: 1,
							eraOfCalendar: '',
							yearOfCalendar: yearOfPreviousYear, monthOfCalendar: 1
						};
					}
				}

				stateRef.current.anteroposteriorYearMonth = {
					previousYear, previousMonth, current, nextMonth, nextYear
				};
			}
		}
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

	const changeYearTo = (target: HxDateTimeAnteroposteriorYearMonth): void => {
		const value = valueFromModel();
		const gregorian = isGregorian();
		if (gregorian) {
			value.year = yearOfCalendar;
			fixDayWhenOverLastDayOfMonth(value);
		} else {
			const targetDate = changeYearToWhenNotGregorian(eraOfCalendar, yearOfCalendar, asJsDate(value), language());
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
	const changeMonthTo = (target: HxDateTimeAnteroposteriorYearMonth): void => {
		const value = valueFromModel();
		const gregorian = isGregorian();
		if (gregorian) {
			value.year = yearOfCalendar;
			value.month = monthOfCalendar;
			fixDayWhenOverLastDayOfMonth(value);
		} else {
			const targetDate = changeMonthToWhenNotGregorian(eraOfCalendar, yearOfCalendar, monthOfCalendar, asJsDate(value), language());
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