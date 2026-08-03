import type {HxLanguageCode} from '../../contexts';
import {DateLocaleUtils} from './date-locale';
import {DateMoveUtils} from './date-move';
import {DateMoveGregoryAndJulianUtils} from './date-move-gregory-and-julian';
import {DateMoveInternalUtils} from './date-move-internal';
import type {MoveDate} from './date-types';

export class DatePersianUtils {
	private static readonly LEAP_REMAINDERS = [1, 5, 9, 13, 17, 22, 26, 30];
	/**
	 * Cumulative leap-year count per mod-33 position in a cycle.
	 *
	 * <p>Each entry {@code CYCL[k]} is the number of leap years among
	 * Persian years whose remainder is ≤ {@code k + 1}. The leap
	 * remainders are {@code {1, 5, 9, 13, 17, 22, 26, 30}}, giving
	 * 8 leap years per 33-year block.</p>
	 *
	 * <pre>
	 * One 33-year cycle (rem 1 → rem 0):
	 *
	 *   A.H. 1288–1320:
	 *     rem  1  →  CYCL[ 0] = 1 (year 1288 leap)
	 *     rem  5  →  CYCL[ 4] = 2 (year 1292 leap)
	 *     rem  9  →  CYCL[ 8] = 3 (year 1296 leap)
	 *     rem 13  →  CYCL[12] = 4 (year 1300 leap)
	 *     rem 17  →  CYCL[16] = 5 (year 1304 leap)
	 *     rem 22  →  CYCL[21] = 6 (year 1309 leap)
	 *     rem 26  →  CYCL[25] = 7 (year 1313 leap)
	 *     rem 30  →  CYCL[29] = 8 (year 1317 leap)
	 *     rem  0  →  CYCL[32] = 8 (year 1320 common — cycle ends)
	 *
	 *   B.H. −32–0:
	 *     rem  1  →  CYCL[ 0] = 1 (year −32 leap)
	 *     rem  5  →  CYCL[ 4] = 2 (year −28 leap)
	 *     rem  9  →  CYCL[ 8] = 3 (year −24 leap)
	 *     rem 13  →  CYCL[12] = 4 (year −20 leap)
	 *     rem 17  →  CYCL[16] = 5 (year −16 leap)
	 *     rem 22  →  CYCL[21] = 6 (year −11 leap)
	 *     rem 26  →  CYCL[25] = 7 (year  −7 leap)
	 *     rem 30  →  CYCL[29] = 8 (year  −3 leap)
	 *     rem  0  →  CYCL[32] = 8 (year   0 common — cycle ends)
	 * </pre>
	 */
	private static readonly LEAP_YEARS_OF_CYCLE: number[] = [
		1, 1, 1, 1,
		2, 2, 2, 2,
		3, 3, 3, 3,
		4, 4, 4, 4,
		5, 5, 5, 5, 5,
		6, 6, 6, 6,
		7, 7, 7, 7,
		8, 8, 8, 8
	];

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	// noinspection JSUnusedGlobalSymbols
	static calendar(): string {
		return 'persian';
	}

	// noinspection JSUnusedGlobalSymbols
	static supportedLanguages(): string[] {
		// Iran & Afghanistan (Persian calendar)
		return [
			'ckb-IR',    // Central Kurdish, Iran. ckb-IQ (Iraq) uses Islamic calendar
			'fa',        // Persian (Farsi), Iran
			'fa-AF',     // Dari (Persian), Afghanistan
			'fa-IR',     // Persian (Farsi), Iran
			'lrc',       // Northern Luri, Iran
			'lrc-IR',    // Northern Luri, Iran
			'mzn',       // Mazanderani, Iran
			'mzn-IR',    // Mazanderani, Iran
			'ps-AF',     // Pashto, Afghanistan. ps-PK (Pakistan) uses Gregorian
			'uz-Arab',   // Uzbek (Arabic script) — follows Persian calendar
			'uz-Arab-AF' // Uzbek (Arabic script), Afghanistan
		];
	}

	static enable() {
		DateLocaleUtils.enableNotGregorianLocaleUtils(DatePersianUtils);
		DateMoveUtils.enableNotGregorianMoveUtils(DatePersianUtils);
	}

	// noinspection JSUnusedGlobalSymbols
	static disable() {
		DateLocaleUtils.disableNotGregorianLocaleUtils(DatePersianUtils);
		DateMoveUtils.disableNotGregorianMoveUtils(DatePersianUtils);
	}

	/** Returns {@code true} when the language uses the Persian calendar. */
	// noinspection JSUnusedGlobalSymbols
	static accept(lang: HxLanguageCode): boolean {
		return lang === 'ckb-IR'
			|| lang === 'fa' || lang === 'fa-AF' || lang === 'fa-IR'
			|| lang === 'lrc' || lang === 'lrc-IR'
			|| lang === 'mzn' || lang === 'mzn-IR'
			|| lang === 'ps-AF'
			|| lang === 'uz-Arab' || lang === 'uz-Arab-AF'
			|| lang.startsWith('fa-')
			|| lang.startsWith('lrc-')
			|| lang.startsWith('mzn-')
			|| lang.startsWith('uz-Arab-');
	}

	/**
	 * Persian calendar leap-year check using the 33-year cycle of 8 leap years.
	 *
	 * <p>A Persian year is leap when {@code year % 33} yields one of
	 * {@code {1, 5, 9, 13, 17, 22, 26, 30}}. The cycle has 7 four-year
	 * intervals and one five-year interval (30 → 1 of the next cycle).
	 * In a leap year the 12th month (Esfand) has 30 days instead of 29.</p>
	 *
	 * <p>Negative years use {@code ((year % 33) + 33) % 33} to normalize
	 * JavaScript's negative-remainder semantics into the 0–32 range
	 * before checking the remainder set.</p>
	 *
	 * <pre>
	 * One complete 33-year cycle (A.H. 1288–1317):
	 *   year 1288 → mod  1 = leap  (4 years since 1284)
	 *   year 1292 → mod  5 = leap  (4 years since 1288)
	 *   year 1296 → mod  9 = leap  (4 years since 1292)
	 *   year 1300 → mod 13 = leap  (4 years since 1296)
	 *   year 1304 → mod 17 = leap  (4 years since 1300)
	 *   year 1309 → mod 22 = leap  (5 years since 1304)
	 *   year 1313 → mod 26 = leap  (4 years since 1309)
	 *   year 1317 → mod 30 = leap  (4 years since 1313)
	 *   — next leap: 1321 → mod 1  (4 years since 1317)
	 *
	 * Year 0:
	 *   year 0 → mod 0 = common (not in the leap remainder set)
	 *
	 * Before Hijra — one complete 33-year cycle (−32 to −3):
	 *   year −32 → mod  1 = leap  (4 years since −36)
	 *   year −28 → mod  5 = leap  (4 years since −32)
	 *   year −24 → mod  9 = leap  (4 years since −28)
	 *   year −20 → mod 13 = leap  (4 years since −24)
	 *   year −16 → mod 17 = leap  (4 years since −20)
	 *   year −11 → mod 22 = leap  (5 years since −16)
	 *   year  −7 → mod 26 = leap  (4 years since −11)
	 *   year  −3 → mod 30 = leap  (4 years since −7)
	 *   — next leap: year 1 → mod 1  (4 years since −3,
	 *     skipping year 0 which is not a leap year)
	 * </pre>
	 *
	 * @param yearOfCalendar - Persian year (may be negative; includes year 0)
	 * @returns {@code true} when Esfand has 30 days (year has 366 days)
	 */
	static isLeapYear(yearOfCalendar: number): boolean {
		return DatePersianUtils.LEAP_REMAINDERS.includes(((yearOfCalendar % 33) + 33) % 33);
	}

	/**
	 * Checks whether a Gregorian date falls within the Anno Hegirae era
	 * (Persian year ≥ 1).
	 *
	 * <p>The Persian epoch is the Hijra (622 CE). Persian year 1 begins
	 * on the spring equinox, Gregorian 0622/03/21. Year numbering
	 * includes 0: … −1, 0, 1, … — year 0 belongs to Before Hijra
	 * (B.H.), year 1 is the first year of A.H.</p>
	 *
	 * @param date - Gregorian date as {@code {year, month, day}}
	 * @returns {@code true} when the date is on or after Gregorian 0622/03/21
	 */
	// noinspection JSUnusedGlobalSymbols
	static isAnnoHegirae(date: MoveDate): boolean {
		return date.year > 622 || (date.year === 622 && (date.month > 3 || (date.month === 3 && date.day >= 21)));
	}

	/**
	 * Checks whether a Gregorian date falls before the Anno Hegirae era
	 * (Persian year ≤ 0).
	 *
	 * <p>Dates strictly before Gregorian 0622/03/21 belong to Before Hijra
	 * (B.H.), including year 0. The Persian calendar includes year 0,
	 * so there is no gap between the two eras.</p>
	 *
	 * @param date - Gregorian date as {@code {year, month, day}}
	 * @returns {@code true} when the date is before Gregorian 0622/03/21
	 */
	// noinspection JSUnusedGlobalSymbols
	static isBeforeHijra(date: MoveDate): boolean {
		return date.year < 622 || (date.year === 622 && (date.month < 3 || (date.month === 3 && date.day < 21)));
	}

	/**
	 * Computes the target Persian year after applying an offset.
	 *
	 * <p>The Persian calendar includes year 0 (…, −1, 0, 1, …), so there is
	 * no era-boundary gap to compensate for. The target year is simply
	 * {@code yearOfCalendar + yearOffset}, clamped to ≥ −621 (the first
	 * representable Persian year, corresponding to Gregorian 0001/01/01).</p>
	 *
	 * @param _date          - Gregorian date (unused; Persian has no era-boundary logic)
	 * @param yearOfCalendar - current Persian year
	 * @param yearOffset     - number of years to advance (positive) or retreat (negative)
	 * @returns the target Persian year, ≥ −621
	 */
	private static computeTargetYearOfCalendar(_date: MoveDate, yearOfCalendar: number, yearOffset: number): number {
		const targetYearOfCalendar = yearOfCalendar + yearOffset;
		return Math.max(-621, targetYearOfCalendar);
	}

	/**
	 * Clamps the target month and day to valid ranges for the Persian calendar.
	 *
	 * <p>For the earliest representable Persian year (−621), the month is clamped
	 * to ≥ 10 (Dey) with day ≥ 11, corresponding to Gregorian 0001/01/01.
	 * For all other years the month is kept as-is.</p>
	 *
	 * <p>Persian month lengths:</p>
	 * <ul>
	 * <li>Months 1–6 (Farvardin–Shahrivar): 31 days</li>
	 * <li>Months 7–11 (Mehr–Bahman): 30 days</li>
	 * <li>Month 12 (Esfand): 29 days (30 in leap year)</li>
	 * </ul>
	 *
	 * @param targetYearOfCalendar - target Persian year
	 * @param monthOfCalendar      - target month (1–12)
	 * @param dayOfCalendar        - desired day of month
	 * @returns the clamped target month and day
	 */
	private static computeTargetMonthAndDayOfCalendar(
		targetYearOfCalendar: number, monthOfCalendar: number, dayOfCalendar: number
	): { targetMonthOfCalendar: number, targetDayOfCalendar: number } {
		let targetMonthOfCalendar: number;
		if (targetYearOfCalendar === -621) {
			// −621/10/11 is Gregorian 0001/01/01
			targetMonthOfCalendar = Math.max(monthOfCalendar, 10);
			if (targetMonthOfCalendar === 10) {
				return {targetMonthOfCalendar: 10, targetDayOfCalendar: Math.max(11, Math.min(30, dayOfCalendar))};
			}
		} else {
			// otherwise keep the target month same as given month
			targetMonthOfCalendar = monthOfCalendar;
		}

		let targetDayOfCalendar: number;
		if (targetMonthOfCalendar <= 6) {
			targetDayOfCalendar = dayOfCalendar;
		} else if (targetMonthOfCalendar < 12) {
			targetDayOfCalendar = Math.min(30, dayOfCalendar);
		} else if (DatePersianUtils.isLeapYear(targetYearOfCalendar)) {
			targetDayOfCalendar = Math.min(30, dayOfCalendar);
		} else {
			targetDayOfCalendar = Math.min(29, dayOfCalendar);
		}

		return {targetMonthOfCalendar, targetDayOfCalendar};
	}

	/**
	 * Map a Persian calendar date to its equivalent Gregorian date by counting
	 * days from a fixed epoch reference point.
	 *
	 * <p>The epoch is Persian −621/10/11 = Gregorian 0001/01/01. Days are
	 * accumulated forward: the initial partial year (−621) contributes 79 days
	 * (months 10–12), each full Persian year adds 365 or 366 days based on the
	 * 33-year leap cycle, and days within the target year are summed by month.</p>
	 *
	 * <p>Leap-year counting uses the 33-year cycle observable: any consecutive
	 * 33 Persian years contain exactly 8 leap years, so full 33-year blocks
	 * are counted directly ({@code floor(yearCount/33) × 8}) and the remainder
	 * is iterated.</p>
	 *
	 * @param targetOfCalendar - Persian date as {@code {year, month, day}}
	 * @returns equivalent Gregorian date
	 */
	private static moveDateTo(targetOfCalendar: MoveDate): MoveDate {
		const {year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar} = targetOfCalendar;

		/*
		 * Count days from Gregorian 0001/01/01 (the epoch) to the target Persian date.
		 *
		 * The epoch corresponds to Persian −621/10/11 — the earliest representable
		 * Persian date, which is the first day the Gregorian calendar exists (year 1).
		 *
		 * Approach:
		 *   1. Persian year −621 is a partial year (months 10–12, 79 days total).
		 *   2. Each full Persian year from −620 onward adds 365 or 366 days.
		 *   3. Days within the target year are summed by month.
		 *   4. The total is added to 0001/01/01 via JS Date arithmetic.
		 */
		let totalDays: number;

		if (targetYearOfCalendar === -621) {
			/*
			 * Persian −621 is the initial partial year. It has only 3 months:
			 *
			 *   Month 10 (Dey):      20 days — day 11 through day 30.
			 *   Month 11 (Bahman):   30 days.
			 *   Month 12 (Esfand):   29 days (−621 is not a leap year).
			 *
			 * Day 11 of month 10 = Gregorian 0001/01/01 = offset 0.
			 *
			 * Examples:
			 *   −621/10/20 → offset = 20 − 11 = 9
			 *   −621/11/05 → offset = 20 + 5 − 1 = 24
			 *   −621/12/10 → offset = 50 + 10 − 1 = 59
			 */
			if (targetMonthOfCalendar === 10) {
				totalDays = targetDayOfCalendar - 11;
			} else if (targetMonthOfCalendar === 11) {
				totalDays = 20 + targetDayOfCalendar - 1;
			} else {
				// month 12 (Esfand, 29 days)
				totalDays = 50 + targetDayOfCalendar - 1;
			}
		} else {
			/*
			 * For all years after −621, start with the 79 days from the initial
			 * partial year, then add full years and the days within the target year.
			 */
			// ── Step 1: initial partial year ──
			totalDays = 79;

			// ── Step 2: full Persian years from −620 up to (targetYear − 1) ──
			//
			//   yearCount = (targetYear − 1) − (−620) + 1 = targetYear + 620
			//
			// Every 33 consecutive Persian years contain exactly 8 leap years,
			// so full 33-year blocks are O(1) via floor(yearCount / 33) × 8.
			//
			// The remaining years (yearCount % 33) always start at a year
			// whose mod-33 is 7 (because −620 ≡ 7 mod 33). Their leap count
			// is looked up from LEAP_YEARS_OF_CYCLE, a prefix-sum array
			// where CYCL[k] = number of leap remainders ≤ (k + 1).
			//
			//   previousYearIndexOfNonCycle  → index for the year BEFORE the remainder block
			//   previousYearIndexOfTargetYear → index for the LAST full year (targetYear − 1)
			//   CYCL[end] − CYCL[start]      → leap years in (start, end] of remainder space
			//   (no wrap)                     → 8 − CYCL[start] + CYCL[end]
			//   (wrap, end < start).
			//
			// Total days for full years = yearCount × 365 + leapCount.
			const yearCount = targetYearOfCalendar + 620;
			if (yearCount > 0) {
				const fullCycles = Math.floor(yearCount / 33);
				let leapCount = fullCycles * 8;

				// First remainder year always has mod 7 (≡ −620 mod 33).
				// Its previous year is mod 6 → index 5 in CYCL (mapping mod→index: subtract 1).
				const previousYearIndexOfNonCycle = 5;
				const leapYearsPastBeforeNonCycle = DatePersianUtils.LEAP_YEARS_OF_CYCLE[previousYearIndexOfNonCycle];

				// Last full year is targetYear − 1. Map its mod to a CYCL index:
				//   mod 0 → index 32 (last entry),  mod>0 → index = mod − 1.
				let previousYearIndexOfTargetYear = (((targetYearOfCalendar - 1) % 33) + 33) % 33;
				previousYearIndexOfTargetYear = previousYearIndexOfTargetYear === 0 ? 32 : (previousYearIndexOfTargetYear - 1);
				const leapYearsPastBeforeTargetYear = DatePersianUtils.LEAP_YEARS_OF_CYCLE[previousYearIndexOfTargetYear];

				if (previousYearIndexOfTargetYear < previousYearIndexOfNonCycle) {
					// Remainder wraps around mod 0: two segments on each side of the boundary.
					leapCount += leapYearsPastBeforeTargetYear + 8 - leapYearsPastBeforeNonCycle;
				} else if (previousYearIndexOfTargetYear !== previousYearIndexOfNonCycle) {
					// Remainder is a single contiguous segment in mod space.
					leapCount += leapYearsPastBeforeTargetYear - leapYearsPastBeforeNonCycle;
				}
				// Equal → no remainder years, add nothing.

				totalDays += yearCount * 365 + leapCount;
			}

			// ── Step 3: days within the target Persian year ──
			//
			// Persian month lengths:
			//   Months 1–6 (Farvardin–Shahrivar): 31 days each
			//   Months 7–11 (Mehr–Bahman):        30 days each
			//   Month 12 (Esfand):                 29 days (30 in leap year)
			//
			// We accumulate the days of completed months before the target month,
			// then add (targetDay − 1) for the days elapsed in the target month.

			// Month 1 (Farvardin): always 31 days.
			if (targetMonthOfCalendar > 1) {
				totalDays += 31;
			}
			// Months 2–6: each 31 days.
			// noinspection DuplicatedCode
			if (targetMonthOfCalendar > 2) {
				totalDays += (targetMonthOfCalendar > 6 ? 5 : (targetMonthOfCalendar - 2)) * 31;
			}
			// Months 7–11: each 30 days.
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
	 * Move a Gregorian date by the given number of years in the Persian calendar.
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @param lang       - locale, used to format the date in Persian representation
	 * @returns the moved date in Gregorian
	 */
	// noinspection JSUnusedGlobalSymbols
	static moveYear(date: MoveDate, yearOffset: number, lang: HxLanguageCode): MoveDate {
		if (yearOffset === 0) {
			return {...date};
		}

		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(DateMoveInternalUtils.asJsDate(date), lang, false);
		const targetYearOfCalendar = DatePersianUtils.computeTargetYearOfCalendar(date, yearOfCalendar, yearOffset);
		// compute target month and day of calendar
		const {
			targetMonthOfCalendar, targetDayOfCalendar
		} = DatePersianUtils.computeTargetMonthAndDayOfCalendar(targetYearOfCalendar, monthOfCalendar, dayOfCalendar);

		return DatePersianUtils.moveDateTo({
			year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar
		});
	}

	/**
	 * Move a Gregorian date by the given number of months in the Persian calendar.
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @param lang        - locale, used to format the date in Persian representation
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
		const targetYearOfCalendar = DatePersianUtils.computeTargetYearOfCalendar(date, yearOfCalendar, yearOffset);
		// compute target month and day of calendar
		const {
			targetMonthOfCalendar, targetDayOfCalendar
		} = DatePersianUtils.computeTargetMonthAndDayOfCalendar(targetYearOfCalendar, tryToTargetMonthOfCalendar, dayOfCalendar);
		return DatePersianUtils.moveDateTo({
			year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar
		});
	}
}
