import type {HxLanguageCode} from '../../../contexts';
import type {HxDateTimeValue} from '../../../types';
import type {DateMoveNotGregorianProvider, HxDate} from '../interfaces';
import {DateUtils} from './date';
import {DateLocaleFormatUtils} from './date-locale-format';
import {DateMoveGregorianProvider} from './date-move-gregorian';
import {UTCDate} from './utc-date';

export class DateMoveUtils {
	private static readonly NOT_GREGORY_MOVE_PROVIDERS: Array<DateMoveNotGregorianProvider> = [];

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Register a non-Gregorian move provider for date arithmetic (year/month movement).
	 *
	 * @param utils - the provider instance to register
	 * @returns the {@link DateMoveUtils} class for chaining
	 */
	static enableNotGregorianMoveProvider(utils: DateMoveNotGregorianProvider): typeof DateMoveUtils {
		if (!DateMoveUtils.NOT_GREGORY_MOVE_PROVIDERS.includes(utils)) {
			DateMoveUtils.NOT_GREGORY_MOVE_PROVIDERS.push(utils);
		}
		return DateMoveUtils;
	}

	/**
	 * Unregister a previously registered non-Gregorian move provider.
	 *
	 * @param utils - the provider instance to unregister
	 * @returns the {@link DateMoveUtils} class for chaining
	 */
	static disableNotGregorianMoveProvider(utils: DateMoveNotGregorianProvider): typeof DateMoveUtils {
		const index = DateMoveUtils.NOT_GREGORY_MOVE_PROVIDERS.indexOf(utils);
		if (index !== -1) {
			DateMoveUtils.NOT_GREGORY_MOVE_PROVIDERS.splice(index, 1);
		}
		return DateMoveUtils;
	}

	/**
	 * Find the registered non-Gregorian move provider that accepts the given locale.
	 *
	 * @param lang - locale code
	 * @returns the matching provider, or {@code undefined} if none registered
	 */
	static findNotGregorianProvider(lang: HxLanguageCode): DateMoveNotGregorianProvider | undefined {
		return DateMoveUtils.NOT_GREGORY_MOVE_PROVIDERS.find(utils => utils.accept(lang));
	}

	/**
	 * Converts a {@link HxDate} or {@link HxDateTimeValue} to a JavaScript `Date` object.
	 * Month is 1-based in the input and converted to 0-based for `Date`.
	 */
	static asJsDate(value: HxDate | Required<HxDateTimeValue>): UTCDate {
		return DateUtils.asJsDate(value);
	};

	/**
	 * Converts a JavaScript {@link Date} object to a {@link HxDate}.
	 * Month is 0-based in the input (`Date`) and converted to 1-based for {@link HxDate}.
	 */
	static asHxDate(date: UTCDate): HxDate {
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
	static moveYear(date: HxDate, yearOffset: number, lang: HxLanguageCode, gregorian: boolean): HxDate {
		if (yearOffset === 0) {
			return {...date};
		}

		if (gregorian) {
			return DateMoveGregorianProvider.moveYear(date, yearOffset);
		} else {
			return DateMoveUtils.findNotGregorianProvider(lang)?.moveYear(date, yearOffset, lang)
				?? DateMoveGregorianProvider.moveYear(date, yearOffset);
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
	static moveMonth(date: HxDate, monthOffset: number, lang: HxLanguageCode, gregorian: boolean): HxDate {
		if (monthOffset === 0) {
			return {...date};
		}

		if (gregorian) {
			return DateMoveGregorianProvider.moveMonth(date, monthOffset);
		} else {
			return DateMoveUtils.findNotGregorianProvider(lang)?.moveMonth(date, monthOffset, lang)
				?? DateMoveGregorianProvider.moveMonth(date, monthOffset);
		}
	}

	/**
	 * Moves the given date to the 1st day of January of the target calendar year.
	 *
	 * <p>The month is resolved in the calendar representation, the date is moved to
	 * January of the target year, and the day is set back to the 1st. January is
	 * always a full month, so the day is preserved as-is and the 1582/10 short
	 * month never interferes with the day adjustment.</p>
	 *
	 * <p>Note: the returned date is not guaranteed to stay within 0001/01/01-9999/12/31.</p>
	 *
	 * @param date       - the reference date (Gregorian)
	 * @param yearOffset - number of calendar years to move (positive = forward, negative = backward)
	 * @param lang       - locale code
	 * @param gregorian  - whether the Gregorian calendar is in use
	 * @returns the 1st day of January of the target calendar year (Gregorian)
	 */
	static moveToJan1OfCalendar(date: HxDate, yearOffset: number, lang: HxLanguageCode, gregorian: boolean): HxDate {
		const [, , month] = DateLocaleFormatUtils.formatDateInNumeric(DateMoveUtils.asJsDate(date), lang, gregorian);
		let moved = DateMoveUtils.moveMonth(date, 1 - month, lang, gregorian);
		moved = DateMoveUtils.moveYear(moved, yearOffset, lang, gregorian);
		const [, , , day] = DateLocaleFormatUtils.formatDateInNumeric(DateMoveUtils.asJsDate(date), lang, gregorian);
		const target = DateMoveUtils.asJsDate(moved);
		target.setDayOfMonth(target.getDayOfMonth() - (day - 1));
		return DateMoveUtils.asHxDate(target);
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
	static isPreviousYearAllowed(lang: HxLanguageCode, gregorian: boolean, firstDayOfCurrentMonthOfGregory: UTCDate): boolean {
		if (gregorian) {
			return DateMoveGregorianProvider.isPreviousYearAllowed(firstDayOfCurrentMonthOfGregory);
		} else {
			return DateMoveUtils.findNotGregorianProvider(lang)?.isPreviousYearAllowed?.(lang, firstDayOfCurrentMonthOfGregory)
				?? DateMoveGregorianProvider.isPreviousYearAllowed(firstDayOfCurrentMonthOfGregory);
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
	static isNextYearAllowed(lang: HxLanguageCode, gregorian: boolean, lastDayOfCurrentMonthOfGregory: UTCDate): boolean {
		if (gregorian) {
			return DateMoveGregorianProvider.isNextYearAllowed(lastDayOfCurrentMonthOfGregory);
		} else {
			return DateMoveUtils.findNotGregorianProvider(lang)?.isNextYearAllowed?.(lang, lastDayOfCurrentMonthOfGregory)
				?? DateMoveGregorianProvider.isNextYearAllowed(lastDayOfCurrentMonthOfGregory);
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
	static isPreviousMonthAllowed(lang: HxLanguageCode, gregorian: boolean, firstDayOfCurrentMonthOfGregory: UTCDate): boolean {
		if (gregorian) {
			return DateMoveGregorianProvider.isPreviousMonthAllowed(firstDayOfCurrentMonthOfGregory);
		} else {
			return DateMoveUtils.findNotGregorianProvider(lang)?.isPreviousMonthAllowed?.(lang, firstDayOfCurrentMonthOfGregory)
				?? DateMoveGregorianProvider.isPreviousMonthAllowed(firstDayOfCurrentMonthOfGregory);
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
	static isNextMonthAllowed(lang: HxLanguageCode, gregorian: boolean, lastDayOfCurrentMonthOfGregory: UTCDate): boolean {
		if (gregorian) {
			return DateMoveGregorianProvider.isNextMonthAllowed(lastDayOfCurrentMonthOfGregory);
		} else {
			return DateMoveUtils.findNotGregorianProvider(lang)?.isNextMonthAllowed?.(lang, lastDayOfCurrentMonthOfGregory)
				?? DateMoveGregorianProvider.isNextMonthAllowed(lastDayOfCurrentMonthOfGregory);
		}
	}
}
