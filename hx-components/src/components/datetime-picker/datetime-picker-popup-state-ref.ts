import {ERO} from '@hx/data';
import {useRef} from 'react';
import {type HxLanguageCode, useHxContext} from '../../contexts';
import type {HxDateTimeValue} from '../../types';
import {
	type ComputedDays,
	type ComputedMonths,
	type ComputedWeek,
	type ComputedYears,
	DateLocaleFormatUtils,
	DateLocaleUtils,
	DateMoveUtils,
	DateParseUtils,
	type HxFormattedDay,
	type HxFormattedEra,
	type HxFormattedMonth,
	type HxFormattedWeekdays,
	type HxFormattedYear,
	NumberUtils,
	UTCDate
} from '../../utils';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerPopupProps} from './datetime-picker-popup-types';
import {HxDateTimeUtils} from './datetime-picker-popup-utils';
import {HxDateTimePickerDefaults} from './defaults';
import {
	EvtHxDateTimePicker_SwitchDatePanel,
	EvtHxDateTimePicker_ValueChange,
	EvtHxDateTimePicker_ValueClear,
	type HxDateTimePicker_DatePanel
} from './types';
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
	/** value from model */
	modelValue(): HxDateTimeValue | null | undefined;
	/** value from state, might be different with value from model */
	stateValue(): Required<HxDateTimeValue>;
	formatted(): HxDateTimeFormattedLabels;
	labelOfYear(era: string, year: string): string;
	labelOfMonth(era: string, year: string, month: string): string;
	eraOfDays(days: ComputedDays): Map<UTCDate, string>;
	isPreviousYearAllowed(firstDayOfCurrentMonthOfGregory: UTCDate): boolean;
	isNextYearAllowed(lastDayOfCurrentMonthOfGregory: UTCDate): boolean;
	isPreviousMonthAllowed(firstDayOfCurrentMonthOfGregory: UTCDate): boolean;
	isNextMonthAllowed(lastDayOfCurrentMonthOfGregory: UTCDate): boolean;

	currentDatePanel(): HxDateTimePicker_DatePanel;
	/**
	 * Switch the current date panel.
	 * - if the current panel is the same as the given panel, switch to days,
	 * - otherwise switch to the given panel.
	 *
	 * @param panel       - the target panel
	 * @param notifyEvent - when true, emit the SwitchDatePanel event; when false, only update the panel state
	 *                      (used when the panel itself hides after a selection)
	 */
	switchDatePanel(panel: HxDateTimePicker_DatePanel, notifyEvent: boolean): void;

	gregorian(): boolean;
	language(): HxLanguageCode;

	weekdays(): ComputedWeek;
	days(weekdays: ComputedWeek): ComputedDays;
	months(): ComputedMonths;
	years(): ComputedYears;

	/**
	 * month and day rules:
	 * - try to keep same,
	 * - if current month is 13, and target year doesn't have #13 month, set month to 12,
	 * - if target year + month doesn't have enough days, set day to last day of target year + month.
	 */
	changeYear(yearOffset: number, applyToModel: boolean): void;
	/**
	 * year and day rules:
	 * - change year according to month offset first, e.g.
	 *   - if current month + month offset is in range [1, 12], keep year,
	 *   - if current month + month offset is over range [1, 12], consider if there are the leap years which has 13 months,
	 * - if target year + month doesn't have enough days, set day to last day of target year + month.
	 */
	changeMonth(monthOffset: number, applyToModel: boolean): void;
	/** year/month/day are gregorian */
	changeDayTo(yearOfGregory: number, monthOfGregory: number, dayOfGregory: number): void;
	/** clear model value */
	clearModelValue(): void;

	clearState(): void;
}

export interface HxDateTimePickerPopupCurrentState {
	value?: Required<HxDateTimeValue>;
	formatted?: HxDateTimeFormattedLabels;
	weekdays?: ComputedWeek;
	days?: ComputedDays;
	months?: ComputedMonths;
	years?: ComputedYears;

	panel: HxDateTimePicker_DatePanel;
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
	const stateRef = useRef<HxDateTimePickerPopupCurrentState>({panel: 'days'});

	// the locale
	const language = (): HxLanguageCode => {
		if (calendarLocale === DateLocaleFormatUtils.GREGORY) {
			return context.language.current();
		} else if (calendarLocale == null || calendarLocale.trim().length === 0) {
			return context.language.current();
		} else {
			return calendarLocale;
		}
	};
	// the calendar
	const isGregorian = (): boolean => {
		if (calendarLocale === DateLocaleFormatUtils.GREGORY) {
			return true;
		} else if (calendarLocale == null || calendarLocale.trim().length === 0) {
			return HxDateTimePickerDefaults.forceGregorian;
		} else {
			return DateLocaleFormatUtils.isUsingGregoryCalendar(language());
		}
	};
	const modelValue = (): HxDateTimeValue | null | undefined => {
		const value = ERO.getValue($model, $field);
		if (value == null || (typeof value === 'string' && value.trim().length === 0)) {
			return (void 0);
		} else {
			const parsed = parseModelValue(value, valueFormat);
			if (parsed === false) {
				return (void 0);
			} else {
				return DateParseUtils.fromParsed(parsed);
			}
		}
	};
	const validModelValue = (): Required<HxDateTimeValue> => {
		const value = ERO.getValue($model, $field);
		let parsedValue: Required<HxDateTimeValue>;
		if (value == null || (typeof value === 'string' && value.trim().length === 0)) {
			parsedValue = DateParseUtils.fulfillWithDefault({}, defaultValue);
		} else {
			const parsed = parseModelValue(value, valueFormat);
			if (parsed === false) {
				parsedValue = DateParseUtils.fulfillWithDefault({}, defaultValue);
			} else {
				parsedValue = DateParseUtils.fulfillWithDefault(DateParseUtils.fromParsed(parsed), defaultValue);
			}
		}
		return parsedValue;
	};
	const stateValue = (): Required<HxDateTimeValue> => {
		if (stateRef.current.value != null) {
			return stateRef.current.value;
		}

		stateRef.current.value = validModelValue();
		return stateRef.current.value;
	};
	// clear time part of state value, to avoid the format impact (unique to start of day)
	const stateDateValue = (): Required<HxDateTimeValue> => {
		const value = stateValue();
		return {...value, hour: 0, minute: 0, second: 0};
	};
	const formatted = (): HxDateTimeFormattedLabels => {
		if (stateRef.current.formatted != null) {
			return stateRef.current.formatted;
		}

		const value = stateDateValue();
		const date = DateMoveUtils.asJsDate(value);

		const lang = language();
		const gregorian = isGregorian();
		const [era, year, month, day, weekdays] = DateLocaleFormatUtils.formatDate(date, lang, gregorian);
		const formattedYear = (era.length === 0 && NumberUtils.isANumber(year)) ? year.padStart(4, '0') : year;
		const monthLong = DateLocaleFormatUtils.formatMonthLong(date, lang, gregorian);

		stateRef.current.formatted = {era, year: formattedYear, month, monthLong, day, weekdays};
		return stateRef.current.formatted;
	};
	const labelOfYear = (era: string, year: string): string => {
		return DateLocaleUtils.labelOfYear(language(), isGregorian(), stateDateValue(), era, year);
	};
	const labelOfMonth = (era: string, year: string, month: string): string => {
		return DateLocaleUtils.labelOfMonth(language(), isGregorian(), stateDateValue(), era, year, month);
	};
	const eraOfDays = (days: ComputedDays): Map<UTCDate, string> => {
		return DateLocaleUtils.eraOfDays(language(), isGregorian(), days);
	};
	const isPreviousYearAllowed = (firstDayOfCurrentMonthOfGregory: UTCDate): boolean => {
		return DateMoveUtils.isPreviousYearAllowed(language(), isGregorian(), firstDayOfCurrentMonthOfGregory);
	};
	const isNextYearAllowed = (lastDayOfCurrentMonthOfGregory: UTCDate): boolean => {
		return DateMoveUtils.isNextYearAllowed(language(), isGregorian(), lastDayOfCurrentMonthOfGregory);
	};
	const isPreviousMonthAllowed = (firstDayOfCurrentMonthOfGregory: UTCDate): boolean => {
		return DateMoveUtils.isPreviousMonthAllowed(language(), isGregorian(), firstDayOfCurrentMonthOfGregory);
	};
	const isNextMonthAllowed = (lastDayOfCurrentMonthOfGregory: UTCDate): boolean => {
		return DateMoveUtils.isNextMonthAllowed(language(), isGregorian(), lastDayOfCurrentMonthOfGregory);
	};

	const currentDatePanel = (): HxDateTimePicker_DatePanel => {
		return stateRef.current.panel;
	};
	/**
	 * Switch the current date panel.
	 * - if the current panel is the same as the given panel, switch to days,
	 * - otherwise switch to the given panel.
	 *
	 * @param panel       - the target panel
	 * @param notifyEvent - when true, emit the SwitchDatePanel event; when false, only update the panel state
	 *                      (used when the panel itself hides after a selection)
	 */
	const switchDatePanel = (panel: HxDateTimePicker_DatePanel, notifyEvent: boolean) => {
		if (stateRef.current.panel === panel) {
			stateRef.current.panel = 'days';
		} else {
			stateRef.current.panel = panel;
		}
		if (notifyEvent) {
			popupContext.emit(EvtHxDateTimePicker_SwitchDatePanel, stateRef.current.panel);
		}
	};

	const weekdays = (): ComputedWeek => {
		if (stateRef.current.weekdays == null) {
			stateRef.current.weekdays = HxDateTimeUtils.computeWeekdays(formatted().weekdays, language(), firstDayOfWeek, weekendDays);
		}
		return stateRef.current.weekdays;
	};
	const days = (weekdays: ComputedWeek): ComputedDays => {
		if (stateRef.current.days == null) {
			const gregorian = isGregorian();
			const date = DateMoveUtils.asJsDate(stateDateValue());
			stateRef.current.days = HxDateTimeUtils.computeDays(date, language(), gregorian, weekdays);
		}
		return stateRef.current.days;
	};
	const months = (): ComputedMonths => {
		if (stateRef.current.months == null) {
			const gregorian = isGregorian();
			const date = DateMoveUtils.asJsDate(stateDateValue());
			stateRef.current.months = HxDateTimeUtils.computeMonths(date, language(), gregorian);
		}
		return stateRef.current.months;
	};
	const years = (): ComputedYears => {
		if (stateRef.current.years == null) {
			const gregorian = isGregorian();
			const dateOfModel = DateMoveUtils.asJsDate(validModelValue());
			const date = DateMoveUtils.asJsDate(stateDateValue());
			stateRef.current.years = HxDateTimeUtils.computeYears(date, dateOfModel, language(), gregorian);
		}
		return stateRef.current.years;
	};

	const clearCacheButValue = () => {
		delete stateRef.current.formatted;
		delete stateRef.current.weekdays;
		delete stateRef.current.days;
		delete stateRef.current.months;
		delete stateRef.current.years;
	};
	const clearCacheAndApplyToModel = (value: Required<HxDateTimeValue>) => {
		// clear cache
		clearCacheButValue();
		// notify
		popupContext.emit(EvtHxDateTimePicker_ValueChange, value);
	};
	const changeYear = (yearOffset: number, applyToModel: boolean): void => {
		if (yearOffset === 0) {
			return;
		}

		const gregorian = isGregorian();
		const lang = language();
		const moved = DateMoveUtils.moveYear(stateDateValue(), yearOffset, lang, gregorian);

		const value = stateValue();
		value.year = moved.year;
		value.month = moved.month;
		value.day = moved.day;

		if (applyToModel) {
			clearCacheAndApplyToModel(value);
		} else {
			clearCacheButValue();
		}
	};
	const changeMonth = (monthOffset: number, applyToModel: boolean): void => {
		if (monthOffset === 0) {
			return;
		}

		const gregorian = isGregorian();
		const lang = language();
		const moved = DateMoveUtils.moveMonth(stateDateValue(), monthOffset, lang, gregorian);

		const value = stateValue();
		value.year = moved.year;
		value.month = moved.month;
		value.day = moved.day;

		if (applyToModel) {
			clearCacheAndApplyToModel(value);
		} else {
			clearCacheButValue();
		}
	};
	const changeDayTo = (yearOfGregory: number, monthOfGregory: number, dayOfGregory: number): void => {
		const value = stateValue();
		value.year = yearOfGregory;
		value.month = monthOfGregory;
		value.day = dayOfGregory;
		clearCacheAndApplyToModel(value);
	};

	const clearModelValue = (): void => {
		popupContext.emit(EvtHxDateTimePicker_ValueClear);
	};

	const clearAllCached = (): void => {
		clearCacheButValue();
		delete stateRef.current.value;
	};

	return {
		modelValue, stateValue,

		formatted, labelOfYear, labelOfMonth, eraOfDays,
		isPreviousYearAllowed, isNextYearAllowed, isPreviousMonthAllowed, isNextMonthAllowed,

		currentDatePanel, switchDatePanel,

		gregorian: isGregorian, language,

		weekdays, days, months, years,

		changeYear, changeMonth, changeDayTo,
		clearModelValue,

		clearState: clearAllCached
	};
};
