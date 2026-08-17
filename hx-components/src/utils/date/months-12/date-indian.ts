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
import {DateInternalUtils} from '../internal';
import type {DateMoveTargetMonthAndDayOfCalendar, DateMoveTargetYearOfCalendar} from '../months-any';
import {DateMove12MonthsProvider} from './date-move-12-months';

export class DateIndianUtils extends DateMove12MonthsProvider implements DateLocaleNotGregorianProvider {
	static readonly INSTANCE = new DateIndianUtils();
	// wires the Saka-specific cell shaping (bc/y10k flags) into the shared months-panel skeleton
	private static readonly MonthsOfYearFuncs: DateLocaleNotGregorianMonthsOfYearFunctions = {
		asComputedMonth: (date: UTCDate, offset: number, lang: HxLanguageCode): ComputedMonth => {
			return DateIndianUtils.INSTANCE.asComputedMonth(date, offset, lang);
		}
	};
	// wires the Saka-specific year anchoring and cell shaping into the shared years-panel skeleton
	private static readonly YearsAroundFuncs: DateLocaleNotGregorianYearsAroundFunctions = {
		computeStartYear: (baseYearOfCalendar: number, firstDayOfBaseYear: UTCDate): [number, boolean, boolean] => {
			return DateIndianUtils.INSTANCE.computeStartYear(baseYearOfCalendar, firstDayOfBaseYear);
		},
		computeFirstDayOfYear: (
			date: UTCDate, _computeYearOfCalendar: DateLocaleNotGregorianYearsAroundFunctions['computeYearOfCalendar'],
			lang: HxLanguageCode) => {
			return DateIndianUtils.INSTANCE.computeFirstDayOfYear(date, lang);
		},
		moveToFirstDayOfYearsAround: DateLocaleNotGregorianHelper.moveToFirstDayOfYearsAround,
		asComputedYear: (firstDayOfYear: HxDate, baseYearOfCalendar: number, currentYearOfCalendar: number, lang: HxLanguageCode): ComputedYear => {
			return DateIndianUtils.INSTANCE.asComputedYear(firstDayOfYear, baseYearOfCalendar, currentYearOfCalendar, lang);
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
		return 'indian';
	}

	/** Returns the list of locales that use the Indian (Saka) calendar. */
	supportedLanguages(): Array<HxLanguageCode> {
		// India (Saka/Indian national calendar)
		return [
			'hi',    // Hindi (India) — Indian national calendar
			'hi-IN', // Hindi, India
			'en-IN'  // India — Indian national calendar (Saka)
		];
	}

	/**
	 * Registers the Indian (Saka) calendar with the locale and move providers.
	 */
	static enable() {
		DateLocaleFormatUtils.enableNotGregorianLocaleProvider(DateIndianUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveProvider(DateIndianUtils.INSTANCE);
	}

	/**
	 * Unregisters the Indian (Saka) calendar from the locale and move providers.
	 */
	static disable() {
		DateLocaleFormatUtils.disableNotGregorianLocaleProvider(DateIndianUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveProvider(DateIndianUtils.INSTANCE);
	}

	/**
	 * Checks whether the given locale should use the Indian (Saka) calendar.
	 *
	 * @param lang - locale code (e.g. {@code 'hi-IN'})
	 * @returns {@code true} when the language uses the calendar
	 */
	accept(lang: HxLanguageCode): boolean {
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
		return DateUtils.isGregorianLeapYear(yearOfCalendar + 78);
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
	static isSaka(date: HxDate): boolean {
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
	static isBeforeSaka(date: HxDate): boolean {
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
	 * @returns the target Saka year, ≥ −78 and ≤ 9921
	 */
	protected computeTargetYearOfCalendar(_date: HxDate, yearOfCalendar: number, yearOffset: number): DateMoveTargetYearOfCalendar {
		const targetYearOfCalendar = Math.min(9921, Math.max(-78, yearOfCalendar + yearOffset));
		return [targetYearOfCalendar > 0 ? 'after' : 'before', targetYearOfCalendar];
	}

	/**
	 * Clamps the target month and day to valid ranges for the Indian (Saka) calendar.
	 *
	 * <p>For the earliest representable Saka year (−78), the month is clamped
	 * to ≥ 10 (Pausa) with day ≥ 11, corresponding to Gregorian 0001/01/01.
	 * For the last representable Saka year (9921), the month is clamped
	 * to ≤ 10 (Pausa) with day ≤ 10, corresponding to Gregorian 9999/12/31.
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
	protected computeTargetMonthAndDayOfCalendar(targetYearOfCalendar: number, monthOfCalendar: number, dayOfCalendar: number): DateMoveTargetMonthAndDayOfCalendar {
		let targetMonthOfCalendar: number;
		if (targetYearOfCalendar === -78) {
			// −78/10/11 is Gregorian 0001/01/01
			targetMonthOfCalendar = Math.max(monthOfCalendar, 10);
			if (targetMonthOfCalendar === 10) {
				return {targetMonthOfCalendar: 10, targetDayOfCalendar: Math.max(11, Math.min(30, dayOfCalendar))};
			}
		} else if (targetYearOfCalendar === 9921) {
			// 9921/10/11–30 is Gregorian 9999/12/22–9999/12/31
			targetMonthOfCalendar = Math.min(monthOfCalendar, 10);
			if (targetMonthOfCalendar === 10) {
				return {targetMonthOfCalendar: 10, targetDayOfCalendar: Math.min(10, dayOfCalendar)};
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
	protected moveDateTo(targetOfCalendar: HxDate): HxDate {
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
				const leapCount = DateInternalUtils.leapYearCountBefore(yearCount + 1);
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
			// noinspection DuplicatedCode
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
		const result = UTCDate.of(1, 0, 1);
		result.setDayOfMonth(result.getDayOfMonth() + totalDays);

		return DateUtils.asHxDate(result);
	}

	/**
	 * Checks whether the previous year is navigable in the Indian (Saka)
	 * calendar.
	 *
	 * <p>The Saka calendar is bounded at Gregorian 0001/01/01, corresponding
	 * to Saka −78/10/11. The initial partial year (Saka −78) contains only
	 * months 10–12 (80 days), so Saka year −77 starts at Gregorian 0001/03/22.
	 * The threshold accounts for the 21-day window in March of year 1 where
	 * the first displayed day still falls in year −78 (year −79 would map to
	 * dates before the epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous Saka year exists
	 */
	isPreviousYearAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 3) || (year === 1 && month === 3 && day > 21);
	}

	/**
	 * Checks whether the next year is navigable in the Indian (Saka)
	 * calendar.
	 *
	 * <p>The Saka calendar is bounded at Gregorian 9999/12/31. Saka year
	 * 9921 starts at Gregorian 9999/03/22, so the threshold accounts for
	 * the 21-day window in March of year 9999 where the last displayed
	 * day still falls in year 9921 (year 9922 would map to dates after
	 * the upper bound).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param lastDayOfCurrentMonthOfGregory   - last displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a next Saka year exists
	 */
	isNextYearAllowed(_lang: HxLanguageCode, lastDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(lastDayOfCurrentMonthOfGregory);
		return year < 9999 || (year === 9999 && month < 3) || (year === 9999 && month === 3 && day < 21);
	}

	/**
	 * Checks whether the previous month is navigable in the Indian (Saka)
	 * calendar.
	 *
	 * <p>The Saka calendar is bounded at Gregorian 0001/01/01, which
	 * corresponds to Saka −78/10/11. Saka month 11 starts at Gregorian
	 * 0001/01/21, so the threshold accounts for the 20-day window in January
	 * of year 1 where the first displayed day still falls in month 10 (month 9
	 * would map to dates before the epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous Saka month exists
	 */
	isPreviousMonthAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 1) || (year === 1 && month === 1 && day > 20);
	}

	/**
	 * Checks whether the next month is navigable in the Indian (Saka)
	 * calendar.
	 *
	 * <p>The Saka calendar is bounded at Gregorian 9999/12/31. Saka year
	 * 9921 month 10 (Pausha) starts at Gregorian 9999/12/22, so the
	 * threshold accounts for the 10-day window in December of year 9999
	 * where the last displayed day still falls in month 10 (month 11
	 * would map to dates after the upper bound).</p>
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
	 * Returns the era label for an Indian (Saka) date.
	 *
	 * <p>Saka-era dates (year ≥ 0) return an empty string (the default era).
	 * Before-Saka dates (year ≤ −1) return a locale-specific abbreviation:
	 * {@code "श.पू."} for Hindi ({@code शक पूर्व}, Before Śaka) and
	 * {@code "B.S."} (Before Saka) for English.</p>
	 *
	 * @param date     - Gregorian date
	 * @param _partsOf - Intl.DateTimeFormat parts callback (unused)
	 * @param lang     - locale, used to select Hindi vs. English era label
	 * @returns the era label or an empty string
	 */
	eraAs(date: UTCDate, _partsOf: () => Array<Intl.DateTimeFormatPart>, lang: HxLanguageCode): HxFormattedEra {
		if (DateIndianUtils.isSaka(DateUtils.asHxDate(date))) {
			return '';
		}
		if (lang === 'hi' || lang.startsWith('hi-')) {
			return 'श.पू.';
		} else {
			return 'B.S.';
		}
	}

	/**
	 * Builds a year label for the Indian (Saka) calendar.
	 *
	 * <p>For Before-Saka dates, the era label from {@link eraAs} is prepended
	 * and the leading minus sign is stripped so the year appears as a positive
	 * number (e.g. {@code "B.S. 1"} instead of {@code "−1"}).</p>
	 *
	 * @param value - the date-time value
	 * @param _era   - era label from {@code eraAs} (overridden in this method)
	 * @param year  - year string from Intl formatting
	 * @param lang  - locale language code
	 * @returns the composed era + year label
	 */
	yearHeaderLabel(value: HxDate, _era: HxFormattedEra, year: HxFormattedYear, lang: HxLanguageCode): string {
		const date = DateUtils.asJsDate(value);
		const era = this.eraAs(date, () => [], lang);
		// Strip the leading minus sign so the year appears as a positive number.
		if (year.startsWith('-')) {
			year = year.substring(1);
		}
		return `${era} ${year}`;
	}

	/**
	 * Moves the given date back to the first day of its calendar month and returns the computed month cell.
	 *
	 * <p>The date is stepped back by the calendar day minus one, which lands on the
	 * first day of the month containing the given date (the day offset between the
	 * Saka and Gregorian representations is constant within a month). Months
	 * outside the representable partial years (Saka −78 months 1-9, Saka 9921
	 * months 11-12) are flagged with {@code bc} / {@code y10k} for the panel.</p>
	 *
	 * <p>Note: the given date is modified in place.</p>
	 *
	 * @param date   - the reference date; modified in place to the first day of its calendar month
	 * @param offset - the month offset of the returned cell relative to the base month
	 * @param lang   - locale code
	 * @returns the computed month cell for the first day of the calendar month
	 */
	private asComputedMonth(date: UTCDate, offset: number, lang: HxLanguageCode): ComputedMonth {
		const [, year, month, day] = DateLocaleFormatUtils.formatDateInNumeric(date, lang, false);
		date.setDayOfMonth(date.getDayOfMonth() - (day - 1));
		const firstDayOfThisMonth = DateMoveUtils.asHxDate(date);
		const bc = year === -78 && month < 10;
		const y10k = year === 9921 && month > 10;
		return {
			key: `${firstDayOfThisMonth.year}-${firstDayOfThisMonth.month}-${firstDayOfThisMonth.day}`,
			label: DateLocaleFormatUtils.formatMonthShort(date, lang, false),
			value: UTCDate.cloneOf(date),
			offset,
			bc,
			y10k
		};
	}

	/**
	 * Computes the 12-month grid for the months panel in the Indian (Saka) calendar.
	 *
	 * <p>Shares the implementation with other non-Gregorian calendars via
	 * {@link DateLocaleNotGregorianHelper#monthsOfYear}; the Saka-specific first-day
	 * anchoring and the {@code bc}/{@code y10k} flags for the partial years −78
	 * and 9921 are injected via {@link DateIndianUtils.MonthsOfYearFuncs}.</p>
	 *
	 * @param date      - the reference date; its year and month determine the grid and the offsets
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the 12 months of the reference date's year
	 */
	monthsOfYear(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		return DateLocaleNotGregorianHelper.monthsOfYear(date, DateIndianUtils.MonthsOfYearFuncs, lang, gregorian);
	}

	/**
	 * Computes the start Saka year of the years-around page, centered on the
	 * given base year and clamped to the calendar bounds [−78, 9921].
	 *
	 * <p>The Saka Era is continuous with no year-0 gap, so the window is simply
	 * {@code baseYear − yearsToStart} (no extra −1 adjustment) and the page is
	 * centered on the base year whenever it is not clamped.</p>
	 *
	 * @param baseYearOfCalendar  - the base Saka year
	 * @param _firstDayOfBaseYear - the first day of the base calendar year (unused)
	 * @returns [start year of calendar, forwardable, backwardable]
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private computeStartYear(baseYearOfCalendar: number, _firstDayOfBaseYear: UTCDate): [number, boolean, boolean] {
		const maxStartYearOfCalendar = 9921 - DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE + 1;
		const minStartYearOfCalendar = -78;
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
	 * Saka months (Chaitra 30, months 2-6 = 31, months 7-12 = 30), then
	 * re-anchors to day 1 via the calendar formatter. The leap-year Chaitra
	 * (31 days) is absorbed by the day re-anchor.</p>
	 *
	 * <p>Note: the bottom-clamped years page anchors its first cell at ICU's
	 * Saka −78/1/1 (Gregorian 1 BCE 3/21) — ICU represents −78 as a full year
	 * while the move semantics start it at −78/10/1 (Gregorian 1 CE 3/22). The
	 * cell date falling before the calendar minimum is expected (same pattern
	 * as the Minguo −1911/1/1 anchor); clicking uses the cell offset, never the
	 * cell date.</p>
	 *
	 * @param date - the reference date; not modified
	 * @param lang - locale code
	 * @returns [the first day of the given date's calendar year, the Saka year]
	 */
	private computeFirstDayOfYear(date: UTCDate, lang: HxLanguageCode): [UTCDate, number] {
		// get calendar year/month
		// eslint-disable-next-line prefer-const
		let [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(date, lang, false);

		const firstDayOfYear = UTCDate.cloneOf(date);

		const daysOfPreviousMonths = [30, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30]
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
	 * <p>The label is the absolute calendar year (the minus sign of Before-Saka
	 * years is stripped since the era badge is displayed separately), the offset
	 * is the plain year difference, and the era badge comes from the formatter
	 * (e.g. {@code 'B.S.'} for pre-Saka years).</p>
	 *
	 * @param firstDayOfYear        - the first day of the cell's calendar year
	 * @param baseYearOfCalendar    - the base year of calendar
	 * @param currentYearOfCalendar - the current year of calendar
	 * @param lang                  - locale code
	 * @returns the computed year cell
	 */
	private asComputedYear(firstDayOfYear: HxDate, baseYearOfCalendar: number, currentYearOfCalendar: number, lang: HxLanguageCode): ComputedYear {
		// noinspection DuplicatedCode
		const value = DateMoveUtils.asJsDate(firstDayOfYear);
		// eslint-disable-next-line prefer-const
		let [eraOfCalendar, yearOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(value, lang, false);

		return {
			key: `${firstDayOfYear.year}-${firstDayOfYear.month}-${firstDayOfYear.day}`,
			era: eraOfCalendar,
			label: '' + Math.abs(yearOfCalendar),
			value,
			offset: yearOfCalendar - baseYearOfCalendar,
			thisYear: yearOfCalendar === currentYearOfCalendar
		};
	}

	/**
	 * Computes the years grid around a reference year for the years panel in the
	 * Indian (Saka) calendar.
	 *
	 * <p>Delegates to the Gregorian provider when the Gregorian calendar is in use.
	 * The window is centered on the reference year and clamped to the Saka
	 * calendar boundaries [−78, 9921] — the Gregorian [1, 9999] shifted by 78.
	 * Each cell holds the first day of its calendar year in ICU semantics, so at
	 * the bottom clamp the first cell may anchor at −78/1/1 (Gregorian 1 BCE
	 * 3/21); clicking uses the cell offset, never the cell date.</p>
	 *
	 * @param baseDate    - the reference date; its year centers the grid window and the offsets
	 * @param currentDate - the current value date; its year marks the "this year" cell
	 * @param lang        - locale code
	 * @param gregorian   - whether the Gregorian calendar is in use
	 * @returns the years around the reference year, with pagination flags
	 */
	yearsAround(baseDate: UTCDate, currentDate: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedYears {
		return DateLocaleNotGregorianHelper.yearsAround(baseDate, currentDate, DateIndianUtils.YearsAroundFuncs, lang, gregorian);
	}
}
