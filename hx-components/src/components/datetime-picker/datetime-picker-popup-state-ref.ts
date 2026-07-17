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
	HxDateTimeAnteroposterior, HxDateTimeAnteroposteriorYear,
	HxDateTimeAnteroposteriorYearMonth,
	HxDateTimePickerPopupProps
} from './datetime-picker-popup-types';
import {HxDateTimeAnteroposteriorUtils, HxDateTimeMoveUtils, HxDateTimeUtils} from './datetime-picker-popup-utils';
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
	changeYearTo(target: HxDateTimeAnteroposteriorYear): void;
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
		const date = HxDateTimeUtils.asJsDate(value);

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
		stateRef.current.anteroposteriorYearMonth = HxDateTimeAnteroposteriorUtils.acquire(HxDateTimeUtils.asJsDate(value), language(), isGregorian());
		return stateRef.current.anteroposteriorYearMonth;
	};

	const weekdays = (): ComputedWeek => {
		return HxDateTimeUtils.computeWeekdays(formatted().weekdays, language(), firstDayOfWeek, weekendDays);
	};
	const days = (weekdays: ComputedWeek): ComputedDays => {
		const gregorian = isGregorian();
		const date = HxDateTimeUtils.asJsDate(valueFromModel());
		return HxDateTimeUtils.computeDays(date, language(), gregorian, weekdays);
	};

	const changeYearTo = (target: HxDateTimeAnteroposteriorYear): void => {
		const value = valueFromModel();
		const gregorian = isGregorian();
		if (gregorian) {
			value.year = target.yearOfGregory;
			HxDateTimeUtils.fixDayWhenOverLastDayOfMonth(value);
		} else {
			const targetDate = HxDateTimeMoveUtils.changeYearToWhenNotGregorian(target, HxDateTimeUtils.asJsDate(value), language());
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
			value.year = target.yearOfGregory;
			value.month = target.monthOfGregory;
			HxDateTimeUtils.fixDayWhenOverLastDayOfMonth(value);
		} else {
			const targetDate = HxDateTimeMoveUtils.changeMonthToWhenNotGregorian(target, HxDateTimeUtils.asJsDate(value), language());
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