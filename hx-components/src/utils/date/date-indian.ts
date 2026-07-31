import type {HxLanguageCode} from '../../contexts';
import {DateLocaleUtils} from './date-locale';
import {DateMoveUtils} from './date-move';
import {DateMoveGregoryAndJulianUtils} from './date-move-gregory-and-julian';
import {DateMoveInternalUtils} from './date-move-internal';
import type {MoveDate} from './date-types';

export class DateIndianUtils {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	// noinspection JSUnusedGlobalSymbols
	static calendar(): string {
		return 'indian';
	}

	// noinspection JSUnusedGlobalSymbols
	static supportedLanguages(): string[] {
		// India (Saka/Indian national calendar)
		return [
			'hi',    // Hindi (India) — Indian national calendar
			'hi-IN', // Hindi, India
			'en-IN'  // India — Indian national calendar (Saka)
		];
	}

	static enable() {
		DateLocaleUtils.enableNotGregorianLocaleUtils(DateIndianUtils);
		DateMoveUtils.enableNotGregorianMoveUtils(DateIndianUtils);
	}

	// noinspection JSUnusedGlobalSymbols
	static disable() {
		DateLocaleUtils.disableNotGregorianLocaleUtils(DateIndianUtils);
		DateMoveUtils.disableNotGregorianMoveUtils(DateIndianUtils);
	}

	/** Returns {@code true} when the language uses the Indian (Saka) calendar. */
	// noinspection JSUnusedGlobalSymbols
	static accept(lang: HxLanguageCode): boolean {
		return lang === 'hi'
			|| lang === 'hi-IN'
			|| lang === 'en-IN'
			|| lang.startsWith('hi-')
			|| lang.startsWith('en-IN-');
	}

	/**
	 * Indian (Saka) calendar leap-year check.
	 *
	 * <p>An Indian year is leap when the corresponding Gregorian year
	 * (year + 78) is a Gregorian leap year — i.e. divisible by 4,
	 * except century years (÷100) which are only leap if divisible by 400.
	 * The Indian calendar itself has no year-0 issue: year numbering
	 * includes 0 (…, −1, 0, 1, …).</p>
	 *
	 * @param yearOfCalendar - Indian (Saka) year
	 * @returns {@code true} when the year has 366 days
	 */
	static isLeapYear(yearOfCalendar: number): boolean {
		return DateLocaleUtils.isGregorianLeapYear(yearOfCalendar + 78);
	}

	/**
	 * Checks whether a Gregorian date falls within the Saka era.
	 *
	 * <p>The Saka era begins in Gregorian year 78, on the day after
	 * March 21 (i.e. March 22 in common years, March 21 in leap years),
	 * which corresponds to Saka 0/01/01. The Saka calendar includes
	 * year 0 (…, −1, 0, 1, …). Dates strictly after the boundary
	 * return {@code true}.</p>
	 *
	 * @param date - Gregorian date as {@code {year, month, day}}
	 * @returns {@code true} when the date is after Gregorian 78/03/21
	 */
	// noinspection JSUnusedGlobalSymbols
	static isSaka(date: MoveDate): boolean {
		return date.year > 78 || (date.year === 78 && (date.month > 3 || (date.month === 3 && date.day > 21)));
	}

	/**
	 * Checks whether a Gregorian date falls before the Saka era.
	 *
	 * <p>Dates on or before Gregorian 78/03/21 belong to the
	 * Before Saka era, which starts from Saka −1 and counts
	 * backwards (…, −2, −1, 0, 1, …). The Saka calendar includes
	 * year 0, so there is no gap between the two eras.</p>
	 *
	 * @param date - Gregorian date as {@code {year, month, day}}
	 * @returns {@code true} when the date is on or before Gregorian 78/03/21
	 */
	static isBeforeSaka(date: MoveDate): boolean {
		return date.year < 78 || (date.year === 78 && (date.month < 3 || (date.month === 3 && date.day <= 21)));
	}

	/**
	 * Computes the target Indian (Saka) year after applying an offset.
	 *
	 * <p>The Saka calendar includes year 0 (…, −1, 0, 1, …), so there is
	 * no era-boundary gap to compensate for. The target year is simply
	 * {@code yearOfCalendar + yearOffset}.</p>
	 *
	 * @param _date          - Gregorian date (unused; Saka has no era-boundary logic)
	 * @param yearOfCalendar - current Saka year
	 * @param yearOffset     - number of years to advance (positive) or retreat (negative)
	 * @returns the target Saka year
	 */
	private static computeTargetYearOfCalendar(_date: MoveDate, yearOfCalendar: number, yearOffset: number): number {
		return yearOfCalendar + yearOffset;
	}

	/**
	 * Clamps the target month and day to valid ranges for the Indian (Saka) calendar.
	 *
	 * <p>For the earliest representable Saka year (−78), the month is clamped
	 * to ≥ 10 (Pausa) with day ≥ 11, corresponding to Gregorian 0001/01/01.
	 * For all other years the month is kept as-is.</p>
	 *
	 * <p>Saka month lengths:</p>
	 * <ul>
	 * <li>Month 1 (Chaitra): 30 days (31 in leap year)</li>
	 * <li>Months 2–6: 31 days</li>
	 * <li>Months 7–12: 30 days</li>
	 * </ul>
	 *
	 * @param targetYearOfCalendar - target Saka year
	 * @param monthOfCalendar      - target month (1–12)
	 * @param dayOfCalendar        - desired day of month
	 * @returns the clamped target month and day
	 */
	private static computeTargetMonthAndDayOfCalendar(
		targetYearOfCalendar: number, monthOfCalendar: number, dayOfCalendar: number
	): { targetMonthOfCalendar: number, targetDayOfCalendar: number } {
		let targetMonthOfCalendar: number;
		if (targetYearOfCalendar === -78) {
			// −78/10/11 is Gregorian 0001/01/01
			targetMonthOfCalendar = Math.max(monthOfCalendar, 10);
			if (targetMonthOfCalendar === 10) {
				return {targetMonthOfCalendar: 10, targetDayOfCalendar: Math.max(11, Math.min(30, dayOfCalendar))};
			}
		} else {
			// otherwise keep the target month same as given month
			targetMonthOfCalendar = monthOfCalendar;
		}

		let targetDayOfCalendar: number;
		if (targetMonthOfCalendar >= 7) {
			targetDayOfCalendar = Math.min(30, dayOfCalendar);
		} else if (targetMonthOfCalendar > 1) {
			targetDayOfCalendar = dayOfCalendar;
		} else if (DateIndianUtils.isLeapYear(targetYearOfCalendar)) {
			targetDayOfCalendar = dayOfCalendar;
		} else {
			targetDayOfCalendar = Math.min(30, dayOfCalendar);
		}

		return {targetMonthOfCalendar, targetDayOfCalendar};
	}

	/**
	 * Map an Indian (Saka) calendar date to its equivalent Gregorian date.
	 *
	 * <p>The Saka epoch starts at Gregorian 78/03/22 (Saka 0/01/01 in a common
	 * year, or 78/03/21 in a leap year). Conversion is a straightforward
	 * year + 78 mapping from Saka to Gregorian, with no Julian-era overlap.</p>
	 *
	 * @param targetOfCalendar - Saka date as {@code {year, month, day}}
	 * @returns equivalent Gregorian date
	 */
	private static moveDateTo(targetOfCalendar: MoveDate): MoveDate {
		// TODO
	}

	/**
	 * Move a Gregorian date by the given number of years in the Indian calendar.
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @param lang       - locale, used to format the date in Indian (Saka) representation
	 * @returns the moved date in Gregorian
	 */
	// noinspection JSUnusedGlobalSymbols
	static moveYear(date: MoveDate, yearOffset: number, lang: HxLanguageCode): MoveDate {
		if (yearOffset === 0) {
			return {...date};
		}

		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(DateMoveInternalUtils.asJsDate(date), lang, false);
		const targetYearOfCalendar = DateIndianUtils.computeTargetYearOfCalendar(date, yearOfCalendar, yearOffset);
		// compute target month and day of calendar
		const {
			targetMonthOfCalendar, targetDayOfCalendar
		} = DateIndianUtils.computeTargetMonthAndDayOfCalendar(targetYearOfCalendar, monthOfCalendar, dayOfCalendar);

		return DateIndianUtils.moveDateTo({
			year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar
		});
	}

	/**
	 * Move a Gregorian date by the given number of months in the Indian calendar.
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @param lang        - locale, used to format the date in Indian (Saka) representation
	 * @returns the moved date in Gregorian
	 */
	// noinspection JSUnusedGlobalSymbols
	static moveMonth(date: MoveDate, monthOffset: number, lang: HxLanguageCode): MoveDate {
		if (monthOffset === 0) {
			return {...date};
		}

		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(DateMoveInternalUtils.asJsDate(date), lang, false);
		// compute target year/month of calendar
		const {
			yearOffset, targetMonthOfCalendar: tryToTargetMonthOfCalendar
		} = DateMoveGregoryAndJulianUtils.computeYearOffsetAndTargetMonthOfCalendar(monthOfCalendar, monthOffset);
		const targetYearOfCalendar = DateIndianUtils.computeTargetYearOfCalendar(date, yearOfCalendar, yearOffset);
		// compute target month and day of calendar
		const {
			targetMonthOfCalendar, targetDayOfCalendar
		} = DateIndianUtils.computeTargetMonthAndDayOfCalendar(targetYearOfCalendar, tryToTargetMonthOfCalendar, dayOfCalendar);
		return DateIndianUtils.moveDateTo({
			year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar
		});
	}
}