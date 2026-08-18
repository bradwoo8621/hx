import type {HxLanguageCode} from '../../../contexts';
import type {DateMoveNotGregorianProvider, HxDate} from '../interfaces';
import {DateMoveGregorianProvider} from './date-move-gregorian';
import {UTCDate} from './utc-date';

export class DateMoveUtils {
	/** Registered non-Gregorian move providers, consulted in registration order. */
	private static readonly NOT_GREGORY_MOVE_PROVIDERS: Array<DateMoveNotGregorianProvider> = [];

	/**
	 * Prevents direct instantiation; all members are accessed statically.
	 */
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
	 * Move a date by the given number of years, dispatching to the appropriate
	 * calendar strategy based on the Gregorian flag and locale.
	 *
	 * Falls back to the Gregorian move logic when no matching non-Gregorian
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
	 * Falls back to the Gregorian move logic when no matching non-Gregorian
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
