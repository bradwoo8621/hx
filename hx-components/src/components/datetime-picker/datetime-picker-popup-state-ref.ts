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
	DateUtils,
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
	type HxDateTimePicker_DatePanel,
	type HxDateTimePickerProps
} from './types';
import {parseModelValue} from './utils';

/**
 * Options of {@link useHxDateTimePickerPopupStateRef}: the popup props that
 * affect the picker state (model binding, value format, calendar and week layout).
 */
export type HxDatetimePickerPopupStateRefOptions<T extends object> =
	Pick<HxDateTimePickerPopupProps<T>,
		| '$model' | '$field'
		| 'valueFormat' | 'defaultValue'
		| 'calendarLocale'
		| 'firstDayOfWeek' | 'weekendDays'
	> & Required<Pick<HxDateTimePickerProps<T>, 'valueSyncMode'>>;

/**
 * Locale-aware formatted labels of the current state value.
 */
export interface HxDateTimeFormattedLabels {
	/** formatted era string (empty for Gregorian) */
	era: HxFormattedEra;
	/** formatted year string (with its literal suffix, e.g. {@code '令和7年'}) */
	year: HxFormattedYear;
	/** formatted month string (with its literal suffix, e.g. {@code '5月'}) */
	month: HxFormattedMonth;
	/** long-form month label used by the popup header month button */
	monthLong: HxFormattedMonth;
	/** formatted day string */
	day: HxFormattedDay;
	/** 7 weekday labels starting from Sunday */
	weekdays: HxFormattedWeekdays;
}

/**
 * The state facade of the datetime picker popup: value access, formatted
 * labels, panel navigation bounds, computed grids and move operations.
 */
export interface HxDateTimePickerStateRef {
	/**
	 * Returns the value from the model.
	 *
	 * @returns the model value, or {@code null}/{@code undefined} when empty
	 */
	modelValue(): HxDateTimeValue | null | undefined;
	/**
	 * Returns the value from the internal state, which may differ from the
	 * model value (e.g. after navigation without applying to the model).
	 *
	 * @returns the fulfilled state value
	 */
	stateValue(): Required<HxDateTimeValue>;
	/**
	 * Returns the formatted labels of the state value.
	 *
	 * @returns the formatted era/year/month/day/weekdays labels
	 */
	formatted(): HxDateTimeFormattedLabels;
	/**
	 * Computes the year label for the popup header.
	 *
	 * @param era  - formatted era string
	 * @param year - formatted year string
	 * @returns the year label (e.g. {@code '令和7年'})
	 */
	yearHeaderLabel(era: HxFormattedEra, year: HxFormattedYear): string;
	/**
	 * Computes the month label for the popup header.
	 *
	 * @param era   - formatted era string
	 * @param year  - formatted year string
	 * @param month - formatted month string
	 * @returns the month label
	 */
	monthHeaderLabel(era: HxFormattedEra, year: HxFormattedYear, month: HxFormattedMonth): string;
	/**
	 * Computes a map of era transitions across the given 42-day grid, so days
	 * that cross an era boundary (e.g. a Japanese era change) can be annotated.
	 *
	 * @param days - the 42-day grid of the displayed month
	 * @returns a map of {@link UTCDate} to era string, or empty when all days share the same era
	 */
	eraOfDays(days: ComputedDays): Map<UTCDate, string>;
	/**
	 * Checks whether the previous year is navigable from the first day of the
	 * current calendar month.
	 *
	 * @param firstDayOfCurrentMonthOfGregory - the Gregorian first day of the current calendar month
	 * @returns {@code true} when the previous year is allowed
	 */
	isPreviousYearAllowed(firstDayOfCurrentMonthOfGregory: UTCDate): boolean;
	/**
	 * Checks whether the next year is navigable from the last day of the
	 * current calendar month.
	 *
	 * @param lastDayOfCurrentMonthOfGregory - the Gregorian last day of the current calendar month
	 * @returns {@code true} when the next year is allowed
	 */
	isNextYearAllowed(lastDayOfCurrentMonthOfGregory: UTCDate): boolean;
	/**
	 * Checks whether the previous month is navigable from the first day of the
	 * current calendar month.
	 *
	 * @param firstDayOfCurrentMonthOfGregory - the Gregorian first day of the current calendar month
	 * @returns {@code true} when the previous month is allowed
	 */
	isPreviousMonthAllowed(firstDayOfCurrentMonthOfGregory: UTCDate): boolean;
	/**
	 * Checks whether the next month is navigable from the last day of the
	 * current calendar month.
	 *
	 * @param lastDayOfCurrentMonthOfGregory - the Gregorian last day of the current calendar month
	 * @returns {@code true} when the next month is allowed
	 */
	isNextMonthAllowed(lastDayOfCurrentMonthOfGregory: UTCDate): boolean;

	/**
	 * Returns the currently shown date panel.
	 *
	 * @returns the current panel ({@code 'days'}, {@code 'months'} or {@code 'years'})
	 */
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

	/**
	 * Checks whether the Gregorian calendar is in use.
	 *
	 * @returns {@code true} when the resolved calendar is Gregorian
	 */
	gregorian(): boolean;
	/**
	 * Returns the resolved locale code.
	 *
	 * @returns the locale code
	 */
	language(): HxLanguageCode;

	/**
	 * Computes the resolved weekday ordering and weekend flags.
	 *
	 * @returns the computed weekday grid configuration
	 */
	weekdays(): ComputedWeek;
	/**
	 * Computes the 42-day grid of the displayed calendar month.
	 *
	 * @param weekdays - the resolved weekday configuration
	 * @returns the 42-day grid
	 */
	days(weekdays: ComputedWeek): ComputedDays;
	/**
	 * Computes the months grid of the displayed calendar year.
	 *
	 * @returns the months grid
	 */
	months(): ComputedMonths;
	/**
	 * Computes the years grid around the displayed calendar year.
	 *
	 * @returns the years grid with pagination flags
	 */
	years(): ComputedYears;

	syncValueImmediate(): boolean;
	/**
	 * Move the state value by the given number of years, applying the calendar's
	 * month and day rules:
	 * - try to keep the month and day the same,
	 * - if the current month is 13 and the target year has no 13th month, set the month to 12,
	 * - if the target year + month has no enough days, set the day to the last day of the target year + month.
	 *
	 * @param yearOffset   - number of years to move (positive = forward, negative = backward)
	 * @param applyToModelOnSyncImmediate - when {@code true}, apply the moved value to the model; otherwise only update the state
	 */
	changeYear(yearOffset: number, applyToModelOnSyncImmediate: boolean): void;
	/**
	 * Move the state value by the given number of months, applying the calendar's
	 * year and day rules:
	 * - change the year according to the month offset first, e.g.
	 *   - if the current month + month offset stays in range [1, 12], keep the year,
	 *   - if the current month + month offset leaves range [1, 12], consider leap years with 13 months,
	 * - if the target year + month has no enough days, set the day to the last day of the target year + month.
	 *
	 * @param monthOffset  - number of months to move (positive = forward, negative = backward)
	 * @param applyToModelOnSyncImmediate - when {@code true}, apply the moved value to the model; otherwise only update the state
	 */
	changeMonth(monthOffset: number, applyToModelOnSyncImmediate: boolean): void;
	/**
	 * Sets the state value to the given date and applies it to the model.
	 *
	 * @param yearOfGregory  - the Gregorian year
	 * @param monthOfGregory - the Gregorian month (1-based)
	 * @param dayOfGregory   - the Gregorian day of month
	 * @param applyToModelOnSyncImmediate - when {@code true}, apply the moved value to the model; otherwise only update the state
	 * @param force - force sync to model
	 */
	changeDayTo(yearOfGregory: number, monthOfGregory: number, dayOfGregory: number, applyToModelOnSyncImmediate: boolean, force: boolean): void;
	/**
	 * Sets the time part of the state value and applies it to the model.
	 *
	 * @param hour   - the hour (0-23)
	 * @param minute - the minute (0-59)
	 * @param second - the second (0-59)
	 * @param applyToModelOnSyncImmediate - when {@code true}, apply the moved value to the model; otherwise only update the state
	 */
	changeTimeTo(hour: number, minute: number, second: number, applyToModelOnSyncImmediate: boolean): void;
	/**
	 * synchronize state value to model
	 */
	syncToModel(): void;
	/**
	 * Clears the model value.
	 */
	clearModelValue(): void;

	/**
	 * Clears all cached state (value, formatted labels and computed grids);
	 * the next access re-reads from the model.
	 */
	clearState(): void;
}

/**
 * The internal cached state of the popup, kept in a {@link useRef} so the
 * values survive re-renders and are only recomputed when invalidated.
 */
export interface HxDateTimePickerPopupCurrentState {
	/** the state value (fulfilled); may differ from the model value */
	value?: Required<HxDateTimeValue>;
	/** cached formatted labels */
	formatted?: HxDateTimeFormattedLabels;
	/** cached weekday configuration */
	weekdays?: ComputedWeek;
	/** cached 42-day grid */
	days?: ComputedDays;
	/** cached months grid */
	months?: ComputedMonths;
	/** cached years grid */
	years?: ComputedYears;

	/** the currently shown date panel */
	panel: HxDateTimePicker_DatePanel;
}

export const useHxDateTimePickerPopupStateRef = <T extends object>(options: HxDatetimePickerPopupStateRefOptions<T>): HxDateTimePickerStateRef => {
	const {
		$model, $field,
		valueFormat, defaultValue,
		calendarLocale,
		firstDayOfWeek, weekendDays,
		valueSyncMode
	} = options;

	const context = useHxContext();
	const popupContext = useHxPopupContext();
	const stateRef = useRef<HxDateTimePickerPopupCurrentState>({panel: 'days'});

	const syncValueImmediate = () => valueSyncMode === 'immediate';
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
		const date = DateUtils.asUtcDate(value);

		const lang = language();
		const gregorian = isGregorian();
		const [era, year, month, day, weekdays] = DateLocaleFormatUtils.formatDate(date, lang, gregorian);
		const formattedYear = (era.length === 0 && NumberUtils.isANumber(year)) ? year.padStart(4, '0') : year;
		const monthLong = DateLocaleFormatUtils.formatMonthLong(date, lang, gregorian);

		stateRef.current.formatted = {era, year: formattedYear, month, monthLong, day, weekdays};
		return stateRef.current.formatted;
	};
	const yearHeaderLabel = (era: string, year: string): string => {
		return DateLocaleUtils.yearHeaderLabel(language(), isGregorian(), stateDateValue(), era, year);
	};
	const monthHeaderLabel = (era: string, year: string, month: string): string => {
		return DateLocaleUtils.monthHeaderLabel(language(), isGregorian(), stateDateValue(), era, year, month);
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
			const date = DateUtils.asUtcDate(stateDateValue());
			stateRef.current.days = HxDateTimeUtils.computeDays(date, language(), gregorian, weekdays);
		}
		return stateRef.current.days;
	};
	const months = (): ComputedMonths => {
		if (stateRef.current.months == null) {
			const gregorian = isGregorian();
			const dateOfModel = DateUtils.asUtcDate(validModelValue());
			const date = DateUtils.asUtcDate(stateDateValue());
			stateRef.current.months = HxDateTimeUtils.computeMonths(date, dateOfModel, language(), gregorian);
		}
		return stateRef.current.months;
	};
	const years = (): ComputedYears => {
		if (stateRef.current.years == null) {
			const gregorian = isGregorian();
			const dateOfModel = DateUtils.asUtcDate(validModelValue());
			const date = DateUtils.asUtcDate(stateDateValue());
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
	const changeYear = (yearOffset: number, applyToModelOnSyncImmediate: boolean): void => {
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

		if (applyToModelOnSyncImmediate && syncValueImmediate()) {
			clearCacheAndApplyToModel(value);
		} else {
			clearCacheButValue();
		}
	};
	const changeMonth = (monthOffset: number, applyToModelOnSyncImmediate: boolean): void => {
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

		if (applyToModelOnSyncImmediate && syncValueImmediate()) {
			clearCacheAndApplyToModel(value);
		} else {
			clearCacheButValue();
		}
	};
	const changeDayTo = (yearOfGregory: number, monthOfGregory: number, dayOfGregory: number, applyToModelOnSyncImmediate: boolean, force: boolean): void => {
		const value = stateValue();
		value.year = yearOfGregory;
		value.month = monthOfGregory;
		value.day = dayOfGregory;
		if (force || (applyToModelOnSyncImmediate && syncValueImmediate())) {
			clearCacheAndApplyToModel(value);
		} else {
			clearCacheButValue();
		}
	};
	const changeTimeTo = (hour: number, minute: number, second: number, applyToModelOnSyncImmediate: boolean): void => {
		const value = stateValue();
		value.hour = hour;
		value.minute = minute;
		value.second = second;
		if (applyToModelOnSyncImmediate && syncValueImmediate()) {
			// notify
			popupContext.emit(EvtHxDateTimePicker_ValueChange, value);
		}
	};
	const syncToModel = () => {
		popupContext.emit(EvtHxDateTimePicker_ValueChange, stateValue());
	};
	const clearModelValue = (): void => {
		clearAllCached();
		popupContext.emit(EvtHxDateTimePicker_ValueClear);
	};

	const clearAllCached = (): void => {
		clearCacheButValue();
		delete stateRef.current.value;
	};

	return {
		modelValue, stateValue,

		formatted, yearHeaderLabel, monthHeaderLabel, eraOfDays,
		isPreviousYearAllowed, isNextYearAllowed, isPreviousMonthAllowed, isNextMonthAllowed,

		currentDatePanel, switchDatePanel,

		gregorian: isGregorian, language,

		weekdays, days, months, years,

		syncValueImmediate,
		changeYear, changeMonth, changeDayTo, changeTimeTo,
		syncToModel, clearModelValue,

		clearState: clearAllCached
	};
};
