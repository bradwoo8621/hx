import type {HxLanguageCode} from '../../../contexts';
import {
	DateLocaleFormatUtils,
	DateLocaleNotGregorianHelper,
	type DateLocaleNotGregorianMonthsOfYearFunctions,
	type DateLocaleNotGregorianYearsAroundFunctions,
	DateMoveUtils,
	DateUtils,
	UTCDate
} from '../facade';
import type {
	ComputedMonth,
	ComputedMonths,
	ComputedYear,
	ComputedYears,
	DateLocaleNotGregorianProvider,
	HxDate,
	HxFormattedEra,
	HxFormattedYear
} from '../interfaces';
import type {DateMoveTargetMonthAndDayOfCalendar, DateMoveTargetYearOfCalendar} from '../months-any';
import {DateMove12MonthsProvider} from './date-move-12-months';

export class DatePersianUtils extends DateMove12MonthsProvider implements DateLocaleNotGregorianProvider {
	protected static readonly LEAP_REMAINDERS: ReadonlyArray<number> = [1, 5, 9, 13, 17, 22, 26, 30];
	/**
	 * ICU's Persian leap-day correction table (persncal.cpp `nonLeapYears`).
	 *
	 * <p>Each entry X overrides the base mod-33 pattern: year X is common and
	 * year X+1 is leap — the leap day shifts forward by one year. ICU applies
	 * the table for years ≥ 1502, and it ends at 2987, so years ≥ 2988 fall
	 * back to the plain mod-33 rule.</p>
	 *
	 * <p>Structural notes (verified against all 78 entries):</p>
	 * <ul>
	 * <li>every entry is a base-leap year: {@code X mod 33 ∈ {9, 13, 17}}, a
	 *     subset of the base leap remainders {@code {1, 5, 9, 13, 17, 22, 26, 30}};</li>
	 * <li>the entries form 44 chains of 4-year-consecutive years, each chain
	 *     moving a run of adjacent base leap days (9 → 13 → 17) one year
	 *     forward: 7 chains of 3 starting at a {@code ≡ 9} year, 20 chains of
	 *     2 starting at a {@code ≡ 13} year, 17 single-entry chains at a
	 *     {@code ≡ 17} year;</li>
	 * <li>a {@code ≡ 17} entry is always a chain tail: its {@code +5} (≡ 22)
	 *     year is never in the table.</li>
	 * </ul>
	 */
	protected static readonly LEAP_CORRECTION_YEARS_OF_CALENDAR: ReadonlySet<number> = new Set([
		1502, 1601, 1634, 1667, 1700, 1733, 1766, 1799, 1832, 1865, 1898, 1931, 1964, 1997, 2030, 2059,
		2063, 2096, 2129, 2158, 2162, 2191, 2195, 2224, 2228, 2257, 2261, 2290, 2294, 2323, 2327, 2356,
		2360, 2389, 2393, 2422, 2426, 2455, 2459, 2488, 2492, 2521, 2525, 2554, 2558, 2587, 2591, 2620,
		2624, 2653, 2657, 2686, 2690, 2719, 2723, 2748, 2752, 2756, 2781, 2785, 2789, 2818, 2822, 2847,
		2851, 2855, 2880, 2884, 2888, 2913, 2917, 2921, 2946, 2950, 2954, 2979, 2983, 2987
	]);
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
	protected static readonly LEAP_YEARS_OF_CYCLE: ReadonlyArray<number> = [
		1, 1, 1, 1,
		2, 2, 2, 2,
		3, 3, 3, 3,
		4, 4, 4, 4,
		5, 5, 5, 5, 5,
		6, 6, 6, 6,
		7, 7, 7, 7,
		8, 8, 8, 8
	];
	static readonly INSTANCE = new DatePersianUtils();
	// wires the Persian-specific cell shaping (bc/y10k flags) into the shared months-panel skeleton
	private static readonly MonthsOfYearFuncs: DateLocaleNotGregorianMonthsOfYearFunctions = {
		asComputedMonth: (date: UTCDate, offset: number, lang: HxLanguageCode): ComputedMonth => {
			return DatePersianUtils.INSTANCE.asComputedMonth(date, offset, lang);
		}
	};
	// wires the Persian-specific year anchoring and cell shaping into the shared years-panel skeleton
	private static readonly YearsAroundFuncs: DateLocaleNotGregorianYearsAroundFunctions = {
		computeStartYear: (baseYearOfCalendar: number, firstDayOfBaseYear: UTCDate): [number, boolean, boolean] => {
			return DatePersianUtils.INSTANCE.computeStartYear(baseYearOfCalendar, firstDayOfBaseYear);
		},
		computeFirstDayOfYear: (
			date: UTCDate, _computeYearOfCalendar: DateLocaleNotGregorianYearsAroundFunctions['computeYearOfCalendar'],
			lang: HxLanguageCode) => {
			return DatePersianUtils.INSTANCE.computeFirstDayOfYear(date, lang);
		},
		moveToFirstDayOfYearsAround: DateLocaleNotGregorianHelper.moveToFirstDayOfYearsAround,
		asComputedYear: (firstDayOfYear: HxDate, baseYearOfCalendar: number, currentYearOfCalendar: number, lang: HxLanguageCode): ComputedYear => {
			return DatePersianUtils.INSTANCE.asComputedYear(firstDayOfYear, baseYearOfCalendar, currentYearOfCalendar, lang);
		}
	};

	/**
	 * Prevents external instantiation; access via {@link INSTANCE}.
	 */
	protected constructor() {
		super();
	}

	/** Returns the calendar identifier for {@link Intl.DateTimeFormat}. */
	calendar(): string {
		return 'persian';
	}

	/** Returns the list of locales that use the Persian calendar. */
	supportedLanguages(): Array<HxLanguageCode> {
		return [
			'ckb-IR',    // Central Kurdish, Iran. ckb-IQ (Iraq) uses Islamic calendar
			'fa-AF',     // Dari (Persian), Afghanistan. fa-TJ uses Cyrillic + Gregorian
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

	/**
	 * Registers the Persian calendar with the locale and move providers.
	 */
	static enable() {
		DateLocaleFormatUtils.enableNotGregorianLocaleProvider(DatePersianUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveProvider(DatePersianUtils.INSTANCE);
	}

	/**
	 * Unregisters the Persian calendar from the locale and move providers.
	 */
	static disable() {
		DateLocaleFormatUtils.disableNotGregorianLocaleProvider(DatePersianUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveProvider(DatePersianUtils.INSTANCE);
	}

	/**
	 * Checks whether the given locale should use the Persian calendar.
	 *
	 * @param lang - locale code (e.g. {@code 'fa-IR'})
	 * @returns {@code true} when the language uses the calendar
	 */
	accept(lang: HxLanguageCode): boolean {
		return lang === 'ckb-IR'
			|| lang === 'fa-AF' || lang === 'fa-IR'
			|| lang === 'lrc' || lang === 'lrc-IR'
			|| lang === 'mzn' || lang === 'mzn-IR'
			|| lang === 'ps-AF'
			|| lang === 'uz-Arab' || lang === 'uz-Arab-AF'
			|| lang.startsWith('ckb-IR-')
			|| lang.startsWith('fa-AF-') || lang.startsWith('fa-IR-')
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
	 * @param yearOfCalendar - Persian year (maybe negative; includes year 0)
	 * @returns {@code true} when Esfand has 30 days (year has 366 days)
	 */
	static isLeapYear(yearOfCalendar: number): boolean {
		// ICU (persncal.cpp isLeapYear): the base mod-33 rule, overridden by the
		// leap-correction table for years ≥ 1502 — a table entry X makes year X
		// common and year X+1 leap (the leap day shifts forward by one year).
		if (yearOfCalendar >= 1502 && DatePersianUtils.LEAP_CORRECTION_YEARS_OF_CALENDAR.has(yearOfCalendar)) {
			return false;
		}
		if (yearOfCalendar > 1502 && DatePersianUtils.LEAP_CORRECTION_YEARS_OF_CALENDAR.has(yearOfCalendar - 1)) {
			return true;
		}
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
	static isAnnoHegirae(date: HxDate): boolean {
		return date.year > 622 || (date.year === 622 && (date.month > 3 || (date.month === 3 && date.day >= 21)));
	}

	/**
	 * Checks whether a Gregorian date falls within the inclusive range
	 * of year 0 or the Anno Hegirae era (Persian year ≥ 0).
	 *
	 * <p>Unlike {@link isAnnoHegirae} which starts at year 1, this method
	 * includes year 0 (Before Hijra). The boundary is Gregorian 0621/03/21.</p>
	 *
	 * @param date - Gregorian date as {@code {year, month, day}}
	 * @returns {@code true} when the date is on or after Gregorian 0621/03/21
	 */
	// noinspection JSUnusedGlobalSymbols
	static isZeroOrAnnoHegirae(date: HxDate): boolean {
		return date.year > 621 || (date.year === 621 && (date.month > 3 || (date.month === 3 && date.day >= 21)));
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
	static isBeforeHijra(date: HxDate): boolean {
		return date.year < 622 || (date.year === 622 && (date.month < 3 || (date.month === 3 && date.day < 21)));
	}

	/**
	 * Checks whether a Gregorian date falls strictly before year 0
	 * (Persian year ≤ −1).
	 *
	 * <p>Unlike {@link isBeforeHijra} which includes year 0, this method
	 * returns {@code true} only for dates before Gregorian 0621/03/21,
	 * i.e. Persian years −1 and earlier.</p>
	 *
	 * @param date - Gregorian date as {@code {year, month, day}}
	 * @returns {@code true} when the date is before Gregorian 0621/03/21
	 */
	static isBeforeHijraAndNotZero(date: HxDate): boolean {
		return date.year < 621 || (date.year === 621 && (date.month < 3 || (date.month === 3 && date.day < 21)));
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
	 * @returns the target Persian year, ≥ −621 and ≤ 9378
	 */
	protected computeTargetYearOfCalendar(_date: HxDate, yearOfCalendar: number, yearOffset: number): DateMoveTargetYearOfCalendar {
		const targetYearOfCalendar = Math.min(9378, Math.max(-621, yearOfCalendar + yearOffset));
		return [targetYearOfCalendar > 0 ? 'after' : 'before', targetYearOfCalendar];
	}

	/**
	 * Clamps the target month and day to valid ranges for the Persian calendar.
	 *
	 * <p>For the earliest representable Persian year (−621), the month is clamped
	 * to ≥ 10 (Dey) with day ≥ 11, corresponding to Gregorian 0001/01/01.
	 * For the last representable Persian year (9378), the month is clamped
	 * to ≤ 10 (Dey) with day ≤ 10, corresponding to Gregorian 9999/12/31.
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
	protected computeTargetMonthAndDayOfCalendar(targetYearOfCalendar: number, monthOfCalendar: number, dayOfCalendar: number): DateMoveTargetMonthAndDayOfCalendar {
		let targetMonthOfCalendar: number;
		if (targetYearOfCalendar === -621) {
			// −621/10/11 is Gregorian 0001/01/01
			targetMonthOfCalendar = Math.max(monthOfCalendar, 10);
			if (targetMonthOfCalendar === 10) {
				return {targetMonthOfCalendar: 10, targetDayOfCalendar: Math.max(11, Math.min(30, dayOfCalendar))};
			}
		} else if (targetYearOfCalendar === 9378) {
			// 9378/10/11–30 is Gregorian 9999/12/22–9999/12/31
			targetMonthOfCalendar = Math.min(monthOfCalendar, 10);
			if (targetMonthOfCalendar === 10) {
				return {targetMonthOfCalendar: 10, targetDayOfCalendar: Math.min(10, dayOfCalendar)};
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
	 * <p><b>The big picture.</b> The total day count is the sum of three
	 * independent parts, and each part stays correct under the ICU leap-day
	 * correction table ({@link #LEAP_CORRECTION_YEARS_OF_CALENDAR}):</p>
	 *
	 * <ol>
	 * <li><b>The partial year −621</b> (months 10–12) contributes a fixed
	 *     79 days — Persian −621/10/11, the earliest representable date, is
	 *     Gregorian 0001/01/01.</li>
	 * <li><b>The full years −620 … targetYear − 1</b> contribute
	 *     {@code yearCount × 365} days plus one extra day per leap year.
	 *     This is the only part the correction table touches, and only by a
	 *     single day — see below.</li>
	 * <li><b>The days within the target year</b>: months 1–11 have fixed
	 *     lengths and the 12th month (Esfand) has 29 or 30 days exactly as
	 *     {@link #isLeapYear} decides, so no correction is needed here.</li>
	 * </ol>
	 *
	 * <p><b>Step 2 — leap-year counting.</b> Persian −621 is common, so the
	 * 33-year cycle aligns at −620 ({@code −620 mod 33 = 7}, not a leap
	 * remainder and not in the correction table). Every block of 33 years
	 * starting there contains exactly one full leap cycle — 8 leap years —
	 * whether or not the correction table applies: a correction moves one
	 * leap day from X to X+1, and the two years still sum to 731 days, so
	 * complete blocks cancel out. The block count is therefore simply
	 * {@code floor(yearCount / 33) × 8}.</p>
	 *
	 * <p>The remainder of the block (fewer than 33 years) is counted via
	 * {@link #LEAP_YEARS_OF_CYCLE}, a prefix-sum table. Because every block
	 * starts at mod 7, the year before the remainder block is always mod 6;
	 * the remainder's last year (targetYear − 1) is looked up by its own
	 * remainder, and the difference of the two prefix sums yields the leap
	 * years in the remainder (wrapping around the mod-0 boundary when the
	 * remainder crosses it).</p>
	 *
	 * <p><b>Why the correction needs only one day.</b> A correction entry X
	 * makes year X common and year X+1 leap. The two years keep the same
	 * total day count, so the error appears only at the cut-off: when the
	 * target year is exactly X+1, the leap day has moved into the target
	 * year — outside the counted range — and the base count is one day too
	 * large. Subtracting one day fixes it; every other target year contains
	 * either both years of the pair (no net change) or neither.</p>
	 *
	 * @param targetOfCalendar - Persian date as {@code {year, month, day}}
	 * @returns equivalent Gregorian date
	 */
	protected moveDateTo(targetOfCalendar: HxDate): HxDate {
		const {year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar} = targetOfCalendar;

		/*
		 * Count days from Gregorian 0001/01/01 (the epoch) to the target
		 * Persian date. See the JSDoc above for the big picture; the four
		 * steps below implement it.
		 */
		let totalDays: number;

		// noinspection GrazieInspection
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
			// Full 33-year blocks contribute 8 leap years each (the cycle
			// aligns at −620; see the JSDoc). The remainder block is counted
			// from LEAP_YEARS_OF_CYCLE, whose index maps a remainder to the
			// number of leap years up to it:
			//   - the year before the remainder block is always mod 6 (index 5),
			//   - the remainder's last year (targetYear − 1) is looked up by
			//     its own remainder (mod 0 → index 32, else index = mod − 1),
			//   - an index below 5 crosses the mod-0 boundary, so the two
			//     segments on each side of it are added separately.
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

			// A correction entry X moves the leap day from X to X+1; when the
			// target year is exactly X+1 the leap day lies outside the counted
			// range and the base count is one day too large (see the JSDoc).
			if (targetYearOfCalendar > 1502 && DatePersianUtils.LEAP_CORRECTION_YEARS_OF_CALENDAR.has(targetYearOfCalendar - 1)) {
				totalDays -= 1;
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
		const result = UTCDate.of(1, 0, 1);
		result.setDayOfMonth(result.getDayOfMonth() + totalDays);

		return DateUtils.asHxDate(result);
	}

	/**
	 * Checks whether the previous year is navigable in the Persian calendar.
	 *
	 * <p>The Persian calendar is bounded at Gregorian 0001/01/01, corresponding
	 * to Persian −621/10/11. The initial partial year (−621) contains only
	 * months 10–12 (79 days: 20 + 30 + 29), so Persian year −620 starts at
	 * Gregorian 0001/03/21. The threshold accounts for the 20-day window in
	 * March of year 1 where the first displayed day still falls in year −621
	 * (year −622 would map to dates before the epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous Persian year exists
	 */
	isPreviousYearAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 3) || (year === 1 && month === 3 && day > 20);
	}

	/**
	 * Checks whether the next year is navigable in the Persian calendar.
	 *
	 * <p>The Persian calendar is bounded at Gregorian 9999/12/31.
	 * Persian year 9378 starts at Gregorian 9999/03/21, so the
	 * threshold accounts for the 20-day window in March of year 9999
	 * where the last displayed day still falls in year 9378 (year
	 * 9379 would map to dates after the upper bound).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param lastDayOfCurrentMonthOfGregory   - last displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a next Persian year exists
	 */
	isNextYearAllowed(_lang: HxLanguageCode, lastDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(lastDayOfCurrentMonthOfGregory);
		return year < 9999 || (year === 9999 && month < 3) || (year === 9999 && month === 3 && day < 21);
	}

	/**
	 * Checks whether the previous month is navigable in the Persian calendar.
	 *
	 * <p>The Persian calendar is bounded at Gregorian 0001/01/01, which
	 * corresponds to Persian −621/10/11. Persian month 11 (Bahman) starts at
	 * Gregorian 0001/01/21, so the threshold accounts for the 20-day window in
	 * January of year 1 where the first displayed day still falls in month 10
	 * (month 9 would map to dates before the epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous Persian month exists
	 */
	isPreviousMonthAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 1) || (year === 1 && month === 1 && day > 20);
	}

	/**
	 * Checks whether the next month is navigable in the Persian calendar.
	 *
	 * <p>The Persian calendar is bounded at Gregorian 9999/12/31.
	 * Persian year 9378 month 10 starts at Gregorian 9999/12/22, so
	 * the threshold accounts for the 10-day window in December of year
	 * 9999 where the last displayed day still falls in month 10
	 * (month 11 would map to dates after the upper bound).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param lastDayOfCurrentMonthOfGregory   - last displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a next month exists
	 */
	isNextMonthAllowed(_lang: HxLanguageCode, lastDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(lastDayOfCurrentMonthOfGregory);
		return year < 9999 || (year === 9999 && month < 12) || (year === 9999 && month === 12 && day < 22);
	}

	/**
	 * Returns the era label for a Persian date.
	 *
	 * <p>Dates before year 0 (year ≤ −1) return a locale-specific era label:
	 * {@code "B.H."} (Before Hijra) for ckb (year/weekday in English), lrc, mzn, ps-AF (their Intl output
	 * is Latin-based), and {@code "ق.هـ"} (Persian abbreviation for
	 * {@code قبل از هجرت}) for all other locales (fa, fa-AF, uz-Arab; uz-Arab has year/date/weekday in Arabic, only month in English)
	 * which use Arabic script. Year 0 and A.H. dates return an empty string.</p>
	 *
	 * @param date     - Gregorian date
	 * @param _partsOf - Intl.DateTimeFormat parts callback (unused)
	 * @param lang     - locale, used to select Latin vs. Arabic era label
	 * @returns {@code "B.H."}, {@code "ق.هـ"}, or an empty string
	 */
	eraAs(date: UTCDate, _partsOf: () => Array<Intl.DateTimeFormatPart>, lang: HxLanguageCode): HxFormattedEra {
		const d = DateUtils.asHxDate(date);
		if (DatePersianUtils.isBeforeHijraAndNotZero(d)) {
			// ckb (year/weekday in English, only month in Arabic), lrc, mzn, ps-AF → 'B.H.'
			// fa, fa-AF (all Arabic script), uz-Arab (year/date/weekday in Arabic, only month in English) → 'ق.هـ'
			if (lang === 'ckb-IR' || lang.startsWith('ckb-IR-')
				|| lang === 'lrc' || lang.startsWith('lrc-')
				|| lang === 'mzn' || lang.startsWith('mzn-')
				|| lang === 'ps-AF' || lang.startsWith('ps-AF-')) {
				return 'B.H.';
			} else {
				return 'ق.هـ';
			}
		} else {
			return '';
		}
	}

	/**
	 * Builds a year label for the Persian calendar, preserving the LTR mark
	 * that {@link Intl.DateTimeFormat} prepends in RTL contexts.
	 *
	 * <p>The Intl output may start with a U+200E (LRM) marker followed by a
	 * U+2212 (minus sign) for Before-Hijra years. The LRM is preserved to
	 * keep the number displayed left-to-right, while the minus sign is
	 * stripped since the era label ({@code "ق.هـ"}) already indicates the
	 * negative era.</p>
	 *
	 * @param value - the date-time value
	 * @param _era  - era label from {@code eraAs} (overridden in this method)
	 * @param year  - year string from Intl formatting
	 * @param lang  - locale language code
	 * @returns the composed era + year label
	 */
	yearHeaderLabel(value: HxDate, _era: HxFormattedEra, year: HxFormattedYear, lang: HxLanguageCode): string {
		const date = DateUtils.asUtcDate(value);
		const era = this.eraAs(date, () => [], lang);
		year = DateLocaleNotGregorianHelper.reformYearLabel(year);
		return `${era} ${year}`;
	}

	/**
	 * Shapes a month cell from a date in the target month, re-anchoring it to
	 * the first day of its calendar month.
	 *
	 * <p>Months outside the representable partial years (Persian −621 months
	 * 1-9, Persian 9378 months 11-12) are flagged with {@code bc} / {@code y10k}
	 * for the panel.</p>
	 *
	 * @param somedayOfMonth   - the reference date; modified in place to the first day of its calendar month
	 * @param offsetToBaseMonth - the month offset of the returned cell relative to the base month
	 * @param lang   - locale code
	 * @returns the computed month cell for the first day of the calendar month
	 */
	private asComputedMonth(somedayOfMonth: UTCDate, offsetToBaseMonth: number, lang: HxLanguageCode): ComputedMonth {
		const [, year, month, day] = DateLocaleFormatUtils.formatDateInNumeric(somedayOfMonth, lang, false);
		somedayOfMonth.setDayOfMonth(somedayOfMonth.getDayOfMonth() - (day - 1));
		const firstDayOfThisMonth = DateUtils.asHxDate(somedayOfMonth);
		const bc = year === -621 && month < 10;
		const y10k = year === 9378 && month > 10;
		return {
			key: `${firstDayOfThisMonth.year}-${firstDayOfThisMonth.month}-${firstDayOfThisMonth.day}`,
			label: DateLocaleFormatUtils.formatMonthShort(somedayOfMonth, lang, false),
			value: UTCDate.cloneOf(somedayOfMonth),
			offset: offsetToBaseMonth,
			bc,
			y10k
		};
	}

	/**
	 * Computes the 12-month grid for the months panel in the Persian calendar.
	 *
	 * <p>Shares the implementation with other non-Gregorian calendars via
	 * {@link DateLocaleNotGregorianHelper#monthsOfYear}; the Persian-specific
	 * first-day anchoring and the {@code bc}/{@code y10k} flags for the partial
	 * years −621 and 9378 are injected via {@link DatePersianUtils.MonthsOfYearFuncs}.</p>
	 *
	 * @param somedayOfYear      - the reference date; its year and month determine the grid and the offsets
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the 12 months of the reference date's year
	 */
	monthsOfYear(somedayOfYear: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		return DateLocaleNotGregorianHelper.monthsOfYear(somedayOfYear, DatePersianUtils.MonthsOfYearFuncs, lang, gregorian);
	}

	/**
	 * Computes the start Persian year of the years-around page, centered on the
	 * given base year and clamped to the calendar bounds [−621, 9378].
	 *
	 * <p>The Persian calendar is continuous with no year-0 gap, so the window is
	 * simply {@code baseYear − yearsToStart} (no extra −1 adjustment) and the
	 * page is centered on the base year whenever it is not clamped.</p>
	 *
	 * @param baseYearOfCalendar  - the base Persian year
	 * @param _firstDayOfBaseYear - the first day of the base calendar year (unused)
	 * @returns [start year of calendar, forwardable, backwardable]
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private computeStartYear(baseYearOfCalendar: number, _firstDayOfBaseYear: UTCDate): [number, boolean, boolean] {
		const maxStartYearOfCalendar = 9378 - DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE + 1;
		const minStartYearOfCalendar = -621;
		const yearsToStart = Math.floor((DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE - 1) / 2);

		const startYearOfCalendar = Math.min(maxStartYearOfCalendar, Math.max(minStartYearOfCalendar, baseYearOfCalendar - yearsToStart));

		return [
			startYearOfCalendar, startYearOfCalendar !== maxStartYearOfCalendar, startYearOfCalendar !== minStartYearOfCalendar
		];
	}

	/**
	 * Moves the given date back to the first day of its calendar year.
	 *
	 * <p>Steps back by the calendar day minus one plus the days of the previous
	 * Persian months (months 1-6 = 31, months 7-11 = 30; the 29/30-day month 12
	 * is absorbed by the day re-anchor), then re-anchors to day 1 via the
	 * calendar formatter. The result may fall outside the Gregorian [0001, 9999]
	 * range at the calendar edges (the bottom-clamped page anchors its first
	 * cell at −621/1/1, Gregorian 1 BCE 3/21).</p>
	 *
	 * @param somedayOfYear - the reference date; not modified
	 * @param lang - locale code
	 * @returns [the first day of the given date's calendar year, the Persian year]
	 */
	private computeFirstDayOfYear(somedayOfYear: UTCDate, lang: HxLanguageCode): [UTCDate, number] {
		// get calendar year/month
		// eslint-disable-next-line prefer-const
		let [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(somedayOfYear, lang, false);

		const firstDayOfYear = UTCDate.cloneOf(somedayOfYear);

		const daysOfPreviousMonths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30]
			.slice(0, monthOfCalendar - 1).reduce((c, v) => c + v, 0);
		// noinspection DuplicatedCode
		firstDayOfYear.setDayOfMonth(firstDayOfYear.getDayOfMonth() - (dayOfCalendar - 1) - daysOfPreviousMonths);
		[, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfYear, lang, false);
		if (dayOfCalendar !== 1) {
			firstDayOfYear.setDayOfMonth(firstDayOfYear.getDayOfMonth() - (dayOfCalendar - 1));
		}
		return [firstDayOfYear, yearOfCalendar];
	}

	/**
	 * Shapes a year cell from the first day of the calendar year.
	 *
	 * <p>The label is the formatted calendar year with minus sign stripped
	 * (ASCII {@code '-'} or U+2212) since the era badge is displayed separately
	 * (e.g. {@code 'ق.هـ'} for Before-Hijra years); the offset is the plain year
	 * difference.</p>
	 *
	 * @param firstDayOfYear        - the first day of the cell's calendar year
	 * @param baseYearOfCalendar    - the base year of calendar
	 * @param currentYearOfCalendar - the current year of calendar
	 * @param lang                  - locale code
	 * @returns the computed year cell
	 */
	private asComputedYear(firstDayOfYear: HxDate, baseYearOfCalendar: number, currentYearOfCalendar: number, lang: HxLanguageCode): ComputedYear {
		// noinspection DuplicatedCode
		const value = DateUtils.asUtcDate(firstDayOfYear);
		const [eraOfCalendar, yearOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(value, lang, false);

		return {
			key: `${firstDayOfYear.year}-${firstDayOfYear.month}-${firstDayOfYear.day}`,
			era: eraOfCalendar,
			label: DateLocaleNotGregorianHelper.reformYearLabel(DateLocaleFormatUtils.formatYear(value, lang, false)),
			value,
			offset: yearOfCalendar - baseYearOfCalendar,
			thisYear: yearOfCalendar === currentYearOfCalendar
		};
	}

	/**
	 * Computes the years grid around a reference year for the years panel in the
	 * Persian calendar.
	 *
	 * <p>Delegates to the Gregorian provider when the Gregorian calendar is in use.
	 * The window is centered on the reference year and clamped to the Persian
	 * calendar boundaries [−621, 9378]. Each cell holds the first day of its
	 * calendar year in ICU semantics, so at the bottom clamp the first cell may
	 * anchor at −621/1/1 (Gregorian 1 BCE 3/21); clicking uses the cell offset,
	 * never the cell date.</p>
	 *
	 * @param baseDate    - the reference date; its year centers the grid window and the offsets
	 * @param currentDate - the current value date; its year marks the "this year" cell
	 * @param lang        - locale code
	 * @param gregorian   - whether the Gregorian calendar is in use
	 * @returns the years around the reference year, with pagination flags
	 */
	yearsAround(baseDate: UTCDate, currentDate: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedYears {
		return DateLocaleNotGregorianHelper.yearsAround(baseDate, currentDate, DatePersianUtils.YearsAroundFuncs, lang, gregorian);
	}
}
