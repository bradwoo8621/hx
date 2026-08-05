import type {HxLanguageCode} from '../../../contexts';
import type {HxDateTimeValue} from '../../../types';
import type {DateMoveNotGregorianProvider, MoveDate} from '../interfaces';
import {DateUtils} from './date';
import {DateMoveGregorianProvider} from './date-move-gregorian';

export class DateMoveUtils {
	private static readonly NOT_GREGORY_MOVE_UTILS: Array<DateMoveNotGregorianProvider> = [];

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Register a non-Gregorian move provider for date arithmetic (year/month movement).
	 *
	 * @param utils - the provider instance to register
	 * @returns the {@link DateMoveUtils} class for chaining
	 */
	static enableNotGregorianMoveUtils(utils: DateMoveNotGregorianProvider): typeof DateMoveUtils {
		if (!DateMoveUtils.NOT_GREGORY_MOVE_UTILS.includes(utils)) {
			DateMoveUtils.NOT_GREGORY_MOVE_UTILS.push(utils);
		}
		return DateMoveUtils;
	}

	/**
	 * Unregister a previously registered non-Gregorian move provider.
	 *
	 * @param utils - the provider instance to unregister
	 * @returns the {@link DateMoveUtils} class for chaining
	 */
	static disableNotGregorianMoveUtils(utils: DateMoveNotGregorianProvider): typeof DateMoveUtils {
		const index = DateMoveUtils.NOT_GREGORY_MOVE_UTILS.indexOf(utils);
		if (index !== -1) {
			DateMoveUtils.NOT_GREGORY_MOVE_UTILS.splice(index, 1);
		}
		return DateMoveUtils;
	}

	/**
	 * Find the registered non-Gregorian move provider that accepts the given locale.
	 *
	 * @param lang - locale code
	 * @returns the matching provider, or {@code undefined} if none registered
	 */
	static findNotGregorianUtils(lang: HxLanguageCode): DateMoveNotGregorianProvider | undefined {
		return DateMoveUtils.NOT_GREGORY_MOVE_UTILS.find(utils => utils.accept(lang));
	}

	/**
	 * Converts a {@link MoveDate} or {@link HxDateTimeValue} to a JavaScript `Date` object.
	 * Month is 1-based in the input and converted to 0-based for `Date`.
	 */
	static asJsDate(value: MoveDate | Required<HxDateTimeValue>): Date {
		return DateUtils.asJsDate(value);
	};

	/**
	 * Converts a JavaScript {@link Date} object to a {@link MoveDate}.
	 * Month is 0-based in the input (`Date`) and converted to 1-based for {@link MoveDate}.
	 */
	static asHxDate(date: Date): MoveDate {
		return DateUtils.asHxDate(date);
	}

	/**
	 * Move a date by the given number of years, dispatching to the appropriate
	 * calendar strategy based on the Gregorian flag and locale.
	 *
	 * Falls back to today's date (as a placeholder) when no matching non-Gregorian
	 * strategy is registered for the given locale.
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @param lang       - locale, determines which calendar strategy to use
	 * @param gregorian  - if {@code true}, use Gregorian arithmetic directly
	 * @returns the moved date in Gregorian
	 */
	static moveYear(date: MoveDate, yearOffset: number, lang: HxLanguageCode, gregorian: boolean): MoveDate {
		if (yearOffset === 0) {
			return {...date};
		}

		// gregorian
		if (gregorian) {
			return DateMoveGregorianProvider.moveYear(date, yearOffset);
		}
		// non-gregorian
		const Utils = DateMoveUtils.findNotGregorianUtils(lang);
		if (Utils != null) {
			return Utils.moveYear(date, yearOffset, lang);
		}
		// non-gregorian, but no not-gregory move utils supporting, fallback to gregory
		else {
			return DateMoveGregorianProvider.moveYear(date, yearOffset);
		}
	}

	/**
	 * Move a date by the given number of months, dispatching to the appropriate
	 * calendar strategy based on the Gregorian flag and locale.
	 *
	 * Falls back to today's date (as a placeholder) when no matching non-Gregorian
	 * strategy is registered for the given locale.
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @param lang        - locale, determines which calendar strategy to use
	 * @param gregorian   - if {@code true}, use Gregorian arithmetic directly
	 * @returns the moved date in Gregorian
	 */
	static moveMonth(date: MoveDate, monthOffset: number, lang: HxLanguageCode, gregorian: boolean): MoveDate {
		if (monthOffset === 0) {
			return {...date};
		}

		// gregorian
		if (gregorian) {
			return DateMoveGregorianProvider.moveMonth(date, monthOffset);
		}
		// non-gregorian
		const Utils = DateMoveUtils.findNotGregorianUtils(lang);
		if (Utils != null) {
			return Utils.moveMonth(date, monthOffset, lang);
		}
		// non-gregorian, but no not-gregory move utils supporting, fallback to gregory
		else {
			return DateMoveGregorianProvider.moveMonth(date, monthOffset);
		}
	}

	/**
	 * Checks whether the previous year is navigable from the given first day
	 * of the current month.
	 *
	 * <p>For Gregorian calendars the previous year is disallowed for any
	 * month in year 1 (there is no year 0). For non-Gregorian calendars
	 * this delegates to the locale plugin's {@code isPreviousYearAllowed}
	 * hook, falling back to the Gregorian epoch when no hook is registered.</p>
	 *
	 * @param lang                            - locale language code
	 * @param gregorian                       - whether the calendar is Gregorian
	 * @param firstDayOfCurrentMonthOfGregory - the Gregorian {@code Date} of the first day of the current calendar month
	 * @returns {@code true} when the previous year is allowed
	 */
	static isPreviousYearAllowed(lang: HxLanguageCode, gregorian: boolean, firstDayOfCurrentMonthOfGregory: Date): boolean {
		if (gregorian) {
			return DateMoveGregorianProvider.isPreviousYearAllowed(firstDayOfCurrentMonthOfGregory);
		}
		const utils = DateMoveUtils.findNotGregorianUtils(lang);
		if (utils != null && utils.isPreviousYearAllowed != null) {
			return utils.isPreviousYearAllowed(lang, firstDayOfCurrentMonthOfGregory);
		} else {
			return DateMoveGregorianProvider.isPreviousYearAllowed(firstDayOfCurrentMonthOfGregory);
		}
	}

	/**
	 * Checks whether the next year is navigable from the given last day
	 * of the current month.
	 *
	 * <p>For Gregorian calendars the next year is disallowed for any
	 * month in year 9999. For non-Gregorian calendars this delegates to
	 * the locale plugin's {@code isNextYearAllowed} hook, falling back to
	 * the Gregorian upper bound when no hook is registered.</p>
	 *
	 * @param lang                            - locale language code
	 * @param gregorian                       - whether the calendar is Gregorian
	 * @param lastDayOfCurrentMonthOfGregory  - the Gregorian {@code Date} of the last day of the current calendar month
	 * @returns {@code true} when the next year is allowed
	 */
	static isNextYearAllowed(lang: HxLanguageCode, gregorian: boolean, lastDayOfCurrentMonthOfGregory: Date): boolean {
		if (gregorian) {
			return DateMoveGregorianProvider.isNextYearAllowed(lastDayOfCurrentMonthOfGregory);
		}
		const utils = DateMoveUtils.findNotGregorianUtils(lang);
		if (utils != null && utils.isNextYearAllowed != null) {
			return utils.isNextYearAllowed(lang, lastDayOfCurrentMonthOfGregory);
		} else {
			return DateMoveGregorianProvider.isNextYearAllowed(lastDayOfCurrentMonthOfGregory);
		}
	}

	/**
	 * Checks whether the previous month is navigable from the given first day
	 * of the current month.
	 *
	 * <p>For Gregorian calendars the only boundary is the epoch itself
	 * (0001/01/01). For non-Gregorian calendars this delegates to the
	 * locale plugin's {@code isPreviousMonthAllowed} hook, falling back
	 * to the Gregorian epoch boundary when no hook is registered.</p>
	 *
	 * @param lang                            - locale language code
	 * @param gregorian                       - whether the calendar is Gregorian
	 * @param firstDayOfCurrentMonthOfGregory - the Gregorian {@code Date} of the first day of the current calendar month
	 * @returns {@code true} when the previous month is allowed
	 */
	static isPreviousMonthAllowed(lang: HxLanguageCode, gregorian: boolean, firstDayOfCurrentMonthOfGregory: Date): boolean {
		if (gregorian) {
			return DateMoveGregorianProvider.isPreviousMonthAllowed(firstDayOfCurrentMonthOfGregory);
		}
		const utils = DateMoveUtils.findNotGregorianUtils(lang);
		if (utils != null && utils.isPreviousMonthAllowed != null) {
			return utils.isPreviousMonthAllowed(lang, firstDayOfCurrentMonthOfGregory);
		} else {
			return DateMoveGregorianProvider.isPreviousMonthAllowed(firstDayOfCurrentMonthOfGregory);
		}
	}

	/**
	 * Checks whether the next month is navigable from the given last day
	 * of the current month.
	 *
	 * <p>For Gregorian calendars the next month is disallowed only when
	 * the last day is 9999/12/31. For non-Gregorian calendars this
	 * delegates to the locale plugin's {@code isNextMonthAllowed} hook,
	 * falling back to the Gregorian version when no hook is registered.</p>
	 *
	 * @param lang                            - locale language code
	 * @param gregorian                       - whether the calendar is Gregorian
	 * @param lastDayOfCurrentMonthOfGregory  - the Gregorian {@code Date} of the last day of the current calendar month
	 * @returns {@code true} when the next month is allowed
	 */
	static isNextMonthAllowed(lang: HxLanguageCode, gregorian: boolean, lastDayOfCurrentMonthOfGregory: Date): boolean {
		if (gregorian) {
			return DateMoveGregorianProvider.isNextMonthAllowed(lastDayOfCurrentMonthOfGregory);
		}
		const utils = DateMoveUtils.findNotGregorianUtils(lang);
		if (utils != null && utils.isNextMonthAllowed != null) {
			return utils.isNextMonthAllowed(lang, lastDayOfCurrentMonthOfGregory);
		} else {
			return DateMoveGregorianProvider.isNextMonthAllowed(lastDayOfCurrentMonthOfGregory);
		}
	}
}
