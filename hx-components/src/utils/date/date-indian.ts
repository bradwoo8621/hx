import type {HxLanguageCode} from '../../contexts';
import {DateLocaleUtils} from './date-locale';
import {DateMoveUtils} from './date-move';
import {DateMoveGregoryAndJulianUtils} from './date-move-gregory-and-julian';
import {DateMoveInternalUtils} from './date-move-internal';
import type {HxFormattedEra, MoveDate} from './date-types';

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
	// noinspection JSUnusedGlobalSymbols
	static isBeforeSaka(date: MoveDate): boolean {
		return date.year < 78 || (date.year === 78 && (date.month < 3 || (date.month === 3 && date.day <= 21)));
	}

	static eraAs(_lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedEra {
		if (DateIndianUtils.isSaka({year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()})) {
			return '';
		}

		const parts = partsOf();
		const partIndex = parts.findIndex(part => part.type === 'era');
		if (partIndex !== -1) {
			return `${parts[partIndex].value} `;
		} else {
			return '';
		}
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
	 * Map an Indian (Saka) calendar date to its equivalent Gregorian date by
	 * counting days from a fixed epoch reference point.
	 *
	 * <p>The epoch is Saka −78/10/11 = Gregorian 0001/01/01. Days are
	 * accumulated forward: the initial partial year (−78) contributes 80 days,
	 * each full Saka year adds 365 or 366 days based on the Gregorian leap rule
	 * for (Saka year + 78), and days within the target year are summed by month.</p>
	 *
	 * @param targetOfCalendar - Saka date as {@code {year, month, day}}
	 * @returns equivalent Gregorian date
	 */
	private static moveDateTo(targetOfCalendar: MoveDate): MoveDate {
		const {year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar} = targetOfCalendar;

		/*
		 * Count days from Gregorian 0001/01/01 (the epoch) to the target Saka date.
		 *
		 * The epoch corresponds to Saka −78/10/11 — the earliest representable
		 * Saka date, which is the first day the Gregorian calendar exists (year 1).
		 *
		 * Approach:
		 *   1. Saka year −78 is a partial year (only months 10–12, 80 days total).
		 *   2. Each full Saka year from −77 onward adds 365 or 366 days.
		 *   3. Days within the target year are summed by month.
		 *   4. The total is added to 0001/01/01 via JS Date arithmetic.
		 */
		let totalDays: number;

		if (targetYearOfCalendar === -78) {
			/*
			 * Saka −78 is the initial partial year. It has only 3 months:
			 *
			 *   Month 10 (Pausa):   20 days — day 11 through day 30.
			 *   Month 11 (Magha):   30 days.
			 *   Month 12 (Phalguna):30 days.
			 *
			 * Day 11 of month 10 = Gregorian 0001/01/01 = offset 0.
			 *
			 * Examples:
			 *   −78/10/20 → offset = 20 − 11 = 9   (9th day after epoch)
			 *   −78/11/05 → offset = 20 + 5 − 1 = 24
			 *   −78/12/10 → offset = 50 + 10 − 1 = 59
			 */
			if (targetMonthOfCalendar === 10) {
				totalDays = targetDayOfCalendar - 11;
			} else if (targetMonthOfCalendar === 11) {
				totalDays = 20 + targetDayOfCalendar - 1;
			} else {
				// month 12
				totalDays = 50 + targetDayOfCalendar - 1;
			}
		} else {
			/*
			 * For all years after −78, start with the 80 days from the initial
			 * partial year, then add full years and the days within the target year.
			 */
			// ── Step 1: initial partial year ──
			totalDays = 80;

			// ── Step 2: full Saka years from −77 up to (targetYear − 1) ──
			//
			// The number of full years between Saka −77 and targetYear−1 is:
			//   yearCount = (targetYear − 1) − (−77) + 1 = targetYear + 77
			//
			// Each Saka year Y is a leap year when Gregorian year (Y + 78) is.
			// For the range [−77, targetYear−1], the Gregorian range is
			// [1, targetYear + 77] = [1, yearCount] (inclusive).
			//
			//   leapYearCountBefore(N) → leap years in [1, N−1]
			//   leapYearCountBefore(yearCount + 1) → leap years in [1, yearCount]
			//
			// Total days for full years = yearCount × 365 + leapCount.
			const yearCount = targetYearOfCalendar + 77;
			if (yearCount > 0) {
				const leapCount = DateLocaleUtils.leapYearCountBefore(yearCount + 1);
				totalDays += yearCount * 365 + leapCount;
			}

			// ── Step 3: days within the target Saka year ──
			//
			// Saka month lengths:
			//   Month 1 (Chaitra):   30 days (31 in a leap year)
			//   Months 2–6:          31 days each
			//   Months 7–12:         30 days each
			//
			// We accumulate the days of completed months before the target month,
			// then add (targetDay − 1) for the days elapsed in the target month.

			// Month 1 (Chaitra): add only if past month 1.
			if (targetMonthOfCalendar > 1) {
				totalDays += DateIndianUtils.isLeapYear(targetYearOfCalendar) ? 31 : 30;
			}
			// Months 2–6: each 31 days. Count = min(5, targetMonth − 2).
			//   If targetMonth ≤ 2, nothing to add.
			//   If targetMonth ≥ 7, all 5 months (2–6) are complete → 5 × 31.
			if (targetMonthOfCalendar > 2) {
				totalDays += (targetMonthOfCalendar > 6 ? 5 : (targetMonthOfCalendar - 2)) * 31;
			}
			// Months 7–12: each 30 days. Only applies when past month 7.
			//   Count = targetMonth − 7.
			if (targetMonthOfCalendar > 7) {
				totalDays += (targetMonthOfCalendar - 7) * 30;
			}
			// Days elapsed in the current month (day 1 = 0 days elapsed).
			totalDays += targetDayOfCalendar - 1;
		}

		// ── Step 4: add accumulated days to Gregorian 0001/01/01 ──
		//
		// Use setFullYear() to safely set year 1 (< 100), then advance by
		// totalDays. JS Date handles month/year rollover automatically.
		const result = new Date();
		result.setFullYear(1, 0, 1);
		result.setDate(result.getDate() + totalDays);

		return {
			year: result.getFullYear(),
			month: result.getMonth() + 1,
			day: result.getDate()
		};
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