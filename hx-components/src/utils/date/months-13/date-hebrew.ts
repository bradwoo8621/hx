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
	ComputedYears,
	DateLocaleNotGregorianProvider,
	DateMoveNotGregorianProvider,
	HxDate
} from '../interfaces';

export class DateHebrewUtils implements DateLocaleNotGregorianProvider, DateMoveNotGregorianProvider {
	protected static readonly LEAP_REMAINDERS: ReadonlyArray<number> = [0, 3, 6, 8, 11, 14, 17];
	/**
	 * Every 19-year Metonic cycle contains exactly 12×12 + 7×13 = 235 months.
	 */
	protected static readonly MONTHS_PER_CYCLE = 235;
	/**
	 * Months per year indexed by position in the 19-year cycle (0 = year % 19).
	 * Leap years at positions {0, 3, 6, 8, 11, 14, 17} have 13 months; the rest have 12.
	 */
	protected static readonly MONTHS_PER_YEAR_OF_CYCLE: ReadonlyArray<number> = [
		13, 12, 12,
		13, 12, 12,
		13, 12,
		13, 12, 12,
		13, 12, 12,
		13, 12, 12,
		13, 12
	];
	static readonly INSTANCE = new DateHebrewUtils();
	private static readonly MonthsOfYearFuncs: DateLocaleNotGregorianMonthsOfYearFunctions = {
		moveToSomedayOfNextMonth: (firstDayOfThisMonth: UTCDate, nextMonthOfCalendar: number): UTCDate => {
			return DateHebrewUtils.INSTANCE.moveToSomedayOfNextMonth(firstDayOfThisMonth, nextMonthOfCalendar);
		},
		asComputedMonth: (date: HxDate, offset: number, currentMonthOfCalendar: number, lang: HxLanguageCode): [UTCDate, ComputedMonth] => {
			return DateHebrewUtils.INSTANCE.asComputedMonth(date, offset, currentMonthOfCalendar, lang);
		}
	};
	// wires the Hebrew-specific year anchoring and cell shaping into the shared years-panel skeleton
	private static readonly YearsAroundFuncs: DateLocaleNotGregorianYearsAroundFunctions = {
		computeFirstDayOfYear: (
			somedayOfYear: UTCDate, _computeYearOfCalendar: DateLocaleNotGregorianYearsAroundFunctions['computeYearOfCalendar'],
			lang: HxLanguageCode): [UTCDate, number] => {
			return DateHebrewUtils.INSTANCE.computeFirstDayOfYear(somedayOfYear, lang);
		},
		computeStartYear: (baseYearOfCalendar: number, firstDayOfBaseYear: UTCDate): [number, boolean, boolean] => {
			return DateHebrewUtils.INSTANCE.computeStartYear(baseYearOfCalendar, firstDayOfBaseYear);
		},
		moveToFirstDayOfYearsAround: (
			firstDayOfBaseYearOfCalendar: UTCDate, baseYearOfCalendar: number, firstYearOfCalendarOfYearsAround: number,
			_computeYearOffset: DateLocaleNotGregorianYearsAroundFunctions['computeYearOffset'],
			lang: HxLanguageCode): UTCDate => {
			return DateHebrewUtils.INSTANCE.moveToFirstDayOfYearsAround(firstDayOfBaseYearOfCalendar, baseYearOfCalendar, firstYearOfCalendarOfYearsAround, lang);
		},
		moveToSomedayOfJanOfNextYear: (firstDayOfThisYear: UTCDate, lang: HxLanguageCode): UTCDate => {
			return DateHebrewUtils.INSTANCE.moveToSomedayOfJanOfNextYear(firstDayOfThisYear, lang);
		}
	};

	/**
	 * Prevents external instantiation; access via {@link INSTANCE}.
	 */
	protected constructor() {
	}

	/** Returns the calendar identifier for {@link Intl.DateTimeFormat}. */
	calendar(): string {
		return 'hebrew';
	}

	/** Returns the list of locales that use the Hebrew calendar. */
	supportedLanguages(): Array<HxLanguageCode> {
		return [
			'he',   // Hebrew, Israel
			'he-IL' // Hebrew, Israel
		];
	}

	/**
	 * Registers the Hebrew calendar with the locale and move providers.
	 */
	static enable() {
		DateLocaleFormatUtils.enableNotGregorianLocaleProvider(DateHebrewUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveProvider(DateHebrewUtils.INSTANCE);
	}

	/**
	 * Unregisters the Hebrew calendar from the locale and move providers.
	 */
	static disable() {
		DateLocaleFormatUtils.disableNotGregorianLocaleProvider(DateHebrewUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveProvider(DateHebrewUtils.INSTANCE);
	}

	/** Returns {@code true} when the language uses the Hebrew calendar. */
	accept(lang: HxLanguageCode): boolean {
		return lang === 'he' || lang === 'he-IL'
			|| lang.startsWith('he-');
	}

	/**
	 * Hebrew calendar leap-year check using the 19-year Metonic cycle.
	 *
	 * <p>Every 19 Hebrew years contain exactly 7 leap years, corresponding to the
	 * remainder set {@code {0, 3, 6, 8, 11, 14, 17}} of {@code year % 19}.
	 * A leap year has 13 months (Adar I + Adar II) instead of 12.</p>
	 *
	 * @param yearOfCalendar - Hebrew year (Anno Mundi, always ≥ 3761 in this codebase)
	 * @returns {@code true} when the year contains 13 months
	 */
	static isLeapYear(yearOfCalendar: number): boolean {
		return DateHebrewUtils.LEAP_REMAINDERS.includes(yearOfCalendar % 19);
	}

	/**
	 * Map a Hebrew calendar date to its equivalent Gregorian date.
	 *
	 * <p>Uses {@link Intl.DateTimeFormat} to anchor on Gregorian Jan 1,
	 * then strides forward or backward by 29–30 day estimates to reach
	 * the target month, and finally corrects the residual day difference.</p>
	 *
	 * <p>Relies on two invariants tested across Gregorian years 1–20000:</p>
	 * <ul>
	 * <li>Gregorian Jan 1 always falls in Hebrew months 1–5.</li>
	 * <li>The Hebrew year on Jan 1 is always Gregorian year + 3760.</li>
	 * </ul>
	 *
	 * @param targetOfCalendar - Hebrew date as {@code {year, month, day}}
	 * @param lang             - locale code for {@link Intl.DateTimeFormat}
	 * @returns the equivalent Gregorian date
	 */
	protected moveDateTo(targetOfCalendar: HxDate, lang: HxLanguageCode): HxDate {
		// eslint-disable-next-line prefer-const
		let {year: yearOfCalendar, month: monthOfCalendar, day: dayOfCalendar} = targetOfCalendar;
		if (yearOfCalendar === 3761) {
			monthOfCalendar = Math.max(4, monthOfCalendar);
			if (monthOfCalendar === 4) {
				dayOfCalendar = Math.max(18, dayOfCalendar);
			}
		} else if (yearOfCalendar === 13760) {
			// 13760 starts at Gregorian 9999/11/04, month 2 day 28 is Gregorian 9999/12/31
			monthOfCalendar = Math.min(2, monthOfCalendar);
			if (monthOfCalendar === 2) {
				dayOfCalendar = Math.min(28, dayOfCalendar);
			}
		}

		// Construct Gregorian Jan 1 of the corresponding Gregorian year.
		const targetDate = UTCDate.of(yearOfCalendar - 3760, 0, 1);

		// Get the Hebrew month and day for that Gregorian Jan 1.
		const [, , monthOfCalendarOfGregoryBaseDay, dayOfCalendarOfGregoryBaseDay] = DateLocaleFormatUtils.formatDateInNumeric(targetDate, lang, false);

		// Keep month 13 (Adar II) in leap years; clamp to 12 otherwise.
		monthOfCalendar = (monthOfCalendar === 13 && DateHebrewUtils.isLeapYear(yearOfCalendar)) ? 13 : Math.min(12, monthOfCalendar);

		// Stride from the month containing Jan 1 to the target month.
		//
		// The prefix `getDate() - dayOfGregoryBaseDay + 1` walks back from
		// Jan 1 to the first day of the Hebrew month that contains it.
		// Example: Jan 1 = month 4 day 12 → first of month 4 = Jan 1 − 11.
		//
		// Forward:  `+ monthDiff * 30` strides ahead.  30 is safe because
		// Hebrew months are 29–30 days; 30 never undershoots.
		//
		// Backward: `− monthDiff * 29` strides back.  29 is safe because
		// if the actual month was 30 days we still land within the previous
		// month (day 2 rather than day 1), which the day correction fixes.
		if (monthOfCalendar > monthOfCalendarOfGregoryBaseDay) {
			targetDate.setDayOfMonth(targetDate.getDayOfMonth() - dayOfCalendarOfGregoryBaseDay + 1 + (monthOfCalendar - monthOfCalendarOfGregoryBaseDay) * 30);
		} else if (monthOfCalendar < monthOfCalendarOfGregoryBaseDay) {
			targetDate.setDayOfMonth(targetDate.getDayOfMonth() - dayOfCalendarOfGregoryBaseDay + 1 - (monthOfCalendarOfGregoryBaseDay - monthOfCalendar) * 29);
		}

		// Get the current Hebrew day at the estimated Gregorian date.
		const [, , , dayOfCalendarOfSomedayOfTarget] = DateLocaleFormatUtils.formatDateInNumeric(targetDate, lang, false);

		// Adjust to reach the target Hebrew day.
		if (dayOfCalendar <= 29) {
			targetDate.setDayOfMonth(targetDate.getDayOfMonth() - dayOfCalendarOfSomedayOfTarget + dayOfCalendar);
		} else {
			// Day 30: month 12 (Adar / Adar I) has 30 days. Month 13 (Adar II)
			// never reaches 30 days — the overflow check below handles that.
			targetDate.setDayOfMonth(targetDate.getDayOfMonth() - dayOfCalendarOfSomedayOfTarget + 30);
			// Verify — if adding 30 pushed us into the next month, roll back to 29.
			const [, , monthOfCalendarOfMightSomedayOfTarget] = DateLocaleFormatUtils.formatDateInNumeric(targetDate, lang, false);
			if (monthOfCalendarOfMightSomedayOfTarget !== monthOfCalendar) {
				targetDate.setDayOfMonth(targetDate.getDayOfMonth() - 1);
			}
		}

		return DateUtils.asHxDate(targetDate);
	}

	/**
	 * Move a Gregorian date by the given number of years in the Hebrew calendar.
	 *
	 * <p>Resolves the current Hebrew year via {@link Intl.DateTimeFormat}, clamps the
	 * target year to ≥ 3761, then delegates to {@link #moveDateTo} for the
	 * month/day estimation and Gregorian mapping.</p>
	 *
	 * <p>Clamped to Hebrew year [3761, 13760] (Gregorian 0001/01/01 to 9999/12/31).</p>
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @param lang       - locale, determines which calendar to use
	 * @returns the moved date in Gregorian
	 */
	moveYear(date: HxDate, yearOffset: number, lang: HxLanguageCode): HxDate {
		if (yearOffset === 0) {
			return {...date};
		}

		// Get the current Hebrew date from the Gregorian date.
		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(DateUtils.asUtcDate(date), lang, false);

		return this.moveDateTo({
			// Compute target Hebrew year, clamped to ≥ 3761.
			year: Math.min(13760, Math.max(3761, yearOfCalendar + yearOffset)),
			month: monthOfCalendar, day: dayOfCalendar
		}, lang);
	}

	/**
	 * Move a Gregorian date by the given number of months in the Hebrew calendar.
	 *
	 * <p>Computes the target Hebrew year and month arithmetically (using the
	 * 19-year Metonic cycle and a per-cycle-month lookup table), then delegates
	 * to {@link #moveDateTo} for the Gregorian mapping.</p>
	 *
	 * <p>Full 19-year cycles (235 months each) are subtracted first, leaving at
	 * most 18 individual years to walk through via the {@link #MONTHS_PER_YEAR_OF_CYCLE}
	 * lookup. Clamped to Hebrew year [3761, 13760].</p>
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @param lang        - locale, determines which calendar to use
	 * @returns the moved date in Gregorian
	 */
	moveMonth(date: HxDate, monthOffset: number, lang: HxLanguageCode): HxDate {
		if (monthOffset === 0) {
			return {...date};
		}

		// Get the current Hebrew date from the Gregorian date.
		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(DateUtils.asUtcDate(date), lang, false);

		// Compute the target year and month.
		let targetYearOfCalendar = yearOfCalendar;
		let targetMonthOfCalendar: number;

		if (monthOffset > 0) {
			// ── Forward ──────────────────────────────────────────────
			const monthsInCurrentYear = DateHebrewUtils.isLeapYear(yearOfCalendar) ? 13 : 12;
			if (monthOfCalendar + monthOffset <= monthsInCurrentYear) {
				targetMonthOfCalendar = monthOfCalendar + monthOffset;
				return this.moveDateTo({
					year: targetYearOfCalendar, month: targetMonthOfCalendar, day: dayOfCalendar
				}, lang);
			}
			// Step into the next year at month 1.
			let remainingMonthCount = Math.abs(monthOffset) - (monthsInCurrentYear - monthOfCalendar + 1);
			targetYearOfCalendar++;

			// Strip full 19-year cycles (235 months each), leaving at most 18 years.
			if (remainingMonthCount >= DateHebrewUtils.MONTHS_PER_CYCLE) {
				const cycles = Math.floor(remainingMonthCount / DateHebrewUtils.MONTHS_PER_CYCLE);
				targetYearOfCalendar += cycles * 19;
				remainingMonthCount %= DateHebrewUtils.MONTHS_PER_CYCLE;
			}

			// Distribute remaining months using the per-cycle-month lookup.
			if (remainingMonthCount === 0) {
				targetMonthOfCalendar = 1;
			} else {
				// Walk forward year by year, consuming full years and wrapping the cycle index.
				let index = targetYearOfCalendar % 19;
				while (true) {
					const monthsOfThisYear = DateHebrewUtils.MONTHS_PER_YEAR_OF_CYCLE[index];
					if (remainingMonthCount >= monthsOfThisYear) {
						remainingMonthCount -= monthsOfThisYear;
						targetYearOfCalendar++;
						index = index + 1;
						index = index > 18 ? 0 : index; // wrap around cycle boundary
					} else {
						break;
					}
				}
				targetMonthOfCalendar = remainingMonthCount + 1;
			}
		} else {
			// ── Backward ─────────────────────────────────────────────
			if (monthOfCalendar + monthOffset >= 1) {
				targetMonthOfCalendar = monthOfCalendar + monthOffset;
				return this.moveDateTo({
					year: targetYearOfCalendar, month: targetMonthOfCalendar, day: dayOfCalendar
				}, lang);
			}
			// Step into the previous year at its last month.
			let remainingMonthCount = Math.abs(monthOffset) - monthOfCalendar;
			targetYearOfCalendar--;

			// Strip full 19-year cycles (235 months each), leaving at most 18 years.
			if (remainingMonthCount >= DateHebrewUtils.MONTHS_PER_CYCLE) {
				const cycles = Math.floor(remainingMonthCount / DateHebrewUtils.MONTHS_PER_CYCLE);
				targetYearOfCalendar -= cycles * 19;
				remainingMonthCount %= DateHebrewUtils.MONTHS_PER_CYCLE;
			}

			// Distribute remaining months using the per-cycle-month lookup.
			if (remainingMonthCount === 0) {
				targetMonthOfCalendar = DateHebrewUtils.isLeapYear(targetYearOfCalendar) ? 13 : 12;
			} else {
				// Walk backward year by year, consuming full years and wrapping the cycle index.
				let index = targetYearOfCalendar % 19;
				while (true) {
					const monthsOfThisYear = DateHebrewUtils.MONTHS_PER_YEAR_OF_CYCLE[index];
					if (remainingMonthCount >= monthsOfThisYear) {
						remainingMonthCount -= monthsOfThisYear;
						targetYearOfCalendar--;
						index = index - 1;
						index = index < 0 ? 18 : index; // wrap around cycle boundary
					} else {
						break;
					}
				}
				targetMonthOfCalendar = (DateHebrewUtils.isLeapYear(targetYearOfCalendar) ? 13 : 12) - remainingMonthCount;
			}
		}

		// Clamp to the representable Hebrew year range.
		targetYearOfCalendar = Math.min(13760, Math.max(3761, targetYearOfCalendar));

		return this.moveDateTo({year: targetYearOfCalendar, month: targetMonthOfCalendar, day: dayOfCalendar}, lang);
	}

	/**
	 * Checks whether the previous year is navigable in the Hebrew calendar.
	 *
	 * <p>The Hebrew calendar is bounded at Gregorian 0001/01/01, corresponding
	 * to Hebrew 3761/04/18. The initial partial year (3761) starts at month 4,
	 * so Hebrew year 3762 starts at Gregorian 0001/09/06. The threshold
	 * accounts for the 5-day window in September of year 1 where the first
	 * displayed day still falls in year 3761 (year 3760 would map to dates
	 * before the epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous Hebrew year exists
	 */
	isPreviousYearAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 9) || (year === 1 && month === 9 && day > 5);
	}

	/**
	 * Checks whether the next year is navigable in the Hebrew calendar.
	 *
	 * <p>The Hebrew calendar is bounded at Gregorian 9999/12/31.
	 * Hebrew year 13760 starts at Gregorian 9999/11/04, so the
	 * threshold accounts for the 58-day window in November of year
	 * 9999 where the last displayed day still falls in year 13760
	 * (year 13761 would map to dates after the upper bound).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param lastDayOfCurrentMonthOfGregory   - last displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a next Hebrew year exists
	 */
	isNextYearAllowed(_lang: HxLanguageCode, lastDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(lastDayOfCurrentMonthOfGregory);
		return year < 9999 || (year === 9999 && month < 11) || (year === 9999 && month === 11 && day < 4);
	}

	/**
	 * Checks whether the previous month is navigable in the Hebrew calendar.
	 *
	 * <p>The Hebrew calendar is bounded at Gregorian 0001/01/01, which
	 * corresponds to Hebrew 3761/04/18. Hebrew month 5 (Shevat) starts at
	 * Gregorian 0001/01/13, so the threshold accounts for the 12-day window
	 * in January of year 1 where the first displayed day still falls in
	 * month 4 (month 3 would map to dates before the epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous Hebrew month exists
	 */
	isPreviousMonthAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 1) || (year === 1 && month === 1 && day > 12);
	}

	/**
	 * Checks whether the next month is navigable in the Hebrew calendar.
	 *
	 * <p>The Hebrew calendar is bounded at Gregorian 9999/12/31.
	 * Hebrew year 13760 month 2 starts at Gregorian 9999/12/04, so
	 * the threshold accounts for the 28-day window in December of year
	 * 9999 where the last displayed day still falls in month 2 (month
	 * 3 would map to dates after the upper bound).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param lastDayOfCurrentMonthOfGregory   - last displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a next month exists
	 */
	isNextMonthAllowed(_lang: HxLanguageCode, lastDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(lastDayOfCurrentMonthOfGregory);
		return year < 9999 || (year === 9999 && month < 12) || (year === 9999 && month === 12 && day < 4);
	}

	/**
	 * Default {@code moveToSomedayOfNextMonth}: steps forward by 30 days,
	 * which lands in the next calendar month for every Hebrew month —
	 * a 29-day month lands on day 2 of the next month, a 30-day month on
	 * its day 1 — and the caller re-anchors to day 1.
	 *
	 * @param firstDayOfThisMonth - the first day of the current calendar month; modified in place
	 * @param _nextMonthOfCalendar - the target month of calendar (unused; stepping by 30 days is month-agnostic)
	 * @returns the same instance, moved into the next calendar month
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private moveToSomedayOfNextMonth(firstDayOfThisMonth: UTCDate, _nextMonthOfCalendar: number): UTCDate {
		return firstDayOfThisMonth.setDayOfMonth(firstDayOfThisMonth.getDayOfMonth() + 30);
	}

	/**
	 * Shapes a months-panel cell from the first day of a Hebrew month,
	 * flagging the partial years at the calendar bounds: year 3761 starts
	 * at month 4 (months 1–3 are before the epoch, Gregorian 0001/01/01 =
	 * 3761/4/18) and year 13760 ends at month 2 (months 3–12 are beyond
	 * Gregorian 9999/12/31 = 13760/2/28).
	 *
	 * <p>Months are numbered in the civil sequence starting at Tishrei
	 * (month 1); in a leap year Adar is split into Adar I (6) and Adar II
	 * (7) and Elul shifts to month 13.</p>
	 *
	 * @param somedayOfMonth   - the reference date; the first day of its calendar month is computed and returned
	 * @param offsetToBaseMonth - the month offset of the returned cell relative to the base month
	 * @param currentMonthOfCalendar - current month of calendar
	 * @param lang             - locale code
	 * @returns [the first day of the given date's calendar month, the computed month cell]
	 */
	private asComputedMonth(somedayOfMonth: HxDate, offsetToBaseMonth: number, currentMonthOfCalendar: number, lang: HxLanguageCode): [UTCDate, ComputedMonth] {
		const firstDayOfMonth = DateUtils.asUtcDate(somedayOfMonth);
		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfMonth, lang, false);
		firstDayOfMonth.setDayOfMonth(firstDayOfMonth.getDayOfMonth() - (dayOfCalendar - 1));
		const bc = yearOfCalendar === 3761 && monthOfCalendar < 4;
		const y10k = yearOfCalendar === 13760 && monthOfCalendar > 2;
		return [
			firstDayOfMonth,
			{
				key: `${firstDayOfMonth.getFullYear()}-${firstDayOfMonth.getMonthIndex() + 1}-${firstDayOfMonth.getDayOfMonth()}`,
				label: DateLocaleFormatUtils.formatMonthShort(firstDayOfMonth, lang, false),
				value: UTCDate.cloneOf(firstDayOfMonth),
				offset: offsetToBaseMonth,
				bc,
				y10k,
				thisMonth: monthOfCalendar === currentMonthOfCalendar
			}
		];
	}

	/**
	 * Computes the months grid for the months panel of the datetime input popup.
	 *
	 * <p>Delegates to the shared walk-and-re-anchor skeleton
	 * ({@link DateLocaleNotGregorianHelper#monthsOfYear}) with the Hebrew
	 * month cell shaping and the 30-day month stepping; the Gregorian grid
	 * is used when the Gregorian calendar is in force. The skeleton walks
	 * 12 months; when the base year is a leap year, the 13th month (Elul,
	 * after the Adar I / Adar II split) is appended by stepping the 12th
	 * month's first day forward by 30 days — month 12 is always a 30-day
	 * Av — and checking the landing month. When the base date itself is in
	 * month 13, the skeleton's grid already covers all 13 months and no
	 * append happens.</p>
	 *
	 * @param somedayOfYear - the reference date; its year and month determine the grid and the offsets
	 * @param currentDate - the current value date; its year marks the "this month" cell
	 * @param lang          - locale code
	 * @param gregorian     - whether the Gregorian calendar is in use
	 * @returns the 12 or 13 months of the reference date's year
	 */
	monthsOfYear(somedayOfYear: UTCDate, currentDate: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		const months = DateLocaleNotGregorianHelper.monthsOfYear(somedayOfYear, currentDate, DateHebrewUtils.MonthsOfYearFuncs, lang, gregorian);
		if (months.length < 13) {
			// #13 month: the shared skeleton walks 12 months;
			// but note if the given someday is #13 month, this logic is unnecessary.

			// step the 12th month's first day forward by 30 days (the #12 month has 30 days if there is #13 month)
			// and re-anchor to the 13th month's first day.
			// Clone first — the value is shared with the 12th cell.
			const lastMonth = months[months.length - 1];
			const tempDate = UTCDate.cloneOf(lastMonth.value);
			tempDate.setDayOfMonth(tempDate.getDayOfMonth() + 30);
			// check the #13 month exists or not
			const [, , monthOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(tempDate, lang, false);
			if (monthOfCalendar === 13) {
				const [, , currentMonthOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(currentDate, lang, false);
				const [, month] = this.asComputedMonth(DateUtils.asHxDate(tempDate), lastMonth.offset + 1, currentMonthOfCalendar, lang);
				months.push(month);
			}
		}
		return months;
	}

	/**
	 * Moves the given date back to the first day of its calendar year.
	 *
	 * <p>Steps back by the calendar day minus one plus {@code 29 × (month − 1)}
	 * days, then re-anchors to day 1 via the calendar formatter. Hebrew months
	 * are 29 or 30 days, so the 29-day-per-month estimate undershoots by at most
	 * one day per month and the re-anchor absorbs the difference, always landing
	 * on Tishrei 1 (month 1 of the civil sequence).</p>
	 *
	 * @param somedayOfYear - the reference date; not modified
	 * @param lang          - locale code
	 * @returns [the first day of the given date's calendar year, the Hebrew year]
	 */
	private computeFirstDayOfYear(somedayOfYear: UTCDate, lang: HxLanguageCode): [UTCDate, number] {
		// get calendar year/month
		// noinspection DuplicatedCode
		let [
			,
			// eslint-disable-next-line prefer-const
			yearOfCalendar, monthOfCalendar,
			dayOfCalendar
		] = DateLocaleFormatUtils.formatDateInNumeric(somedayOfYear, lang, false);

		const firstDayOfYear = UTCDate.cloneOf(somedayOfYear);

		// month has 29/30 days
		const daysOfPreviousMonths = 29 * (monthOfCalendar - 1);
		// noinspection DuplicatedCode
		firstDayOfYear.setDayOfMonth(firstDayOfYear.getDayOfMonth() - (dayOfCalendar - 1) - daysOfPreviousMonths);
		[, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfYear, lang, false);
		if (dayOfCalendar !== 1) {
			firstDayOfYear.setDayOfMonth(firstDayOfYear.getDayOfMonth() - (dayOfCalendar - 1));
		}
		return [firstDayOfYear, yearOfCalendar];
	}

	/**
	 * Computes the start year of the years-around window.
	 *
	 * <p>The window is simply {@code baseYear − yearsToStart}, clamped to the
	 * Hebrew calendar bounds [3761, 13760]: year 3761 is the first Hebrew year
	 * (partial, months 1–3 are before the epoch) and year 13760 is the last
	 * (partial, months 3–12 are beyond Gregorian 9999), so the page is centered
	 * on the base year whenever it is not clamped.</p>
	 *
	 * @param baseYearOfCalendar  - the base Hebrew year
	 * @param _firstDayOfBaseYear - the first day of the base calendar year (unused)
	 * @returns [start year of calendar, forwardable, backwardable]
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private computeStartYear(baseYearOfCalendar: number, _firstDayOfBaseYear: UTCDate): [number, boolean, boolean] {
		const maxStartYearOfCalendar = 13760 - DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE + 1;
		const minStartYearOfCalendar = 3761;
		const yearsToStart = Math.floor((DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE - 1) / 2);

		const startYearOfCalendar = Math.min(maxStartYearOfCalendar, Math.max(minStartYearOfCalendar, baseYearOfCalendar - yearsToStart));

		return [
			startYearOfCalendar, startYearOfCalendar !== maxStartYearOfCalendar, startYearOfCalendar !== minStartYearOfCalendar
		];
	}

	/**
	 * Moves the first day of the base calendar year to (near) the first day of
	 * the target calendar year, the first year of the years-around page.
	 *
	 * <p>Contract see
	 * {@link DateLocaleNotGregorianYearsAroundFunctions#moveToFirstDayOfYearsAround}.
	 * Hebrew years are 353/354/355 days (common) or 383/384/385 days (leap),
	 * so stepping 353 days per year can miss the target year by up to a leap
	 * month; the year is corrected iteratively — re-walking by the remaining
	 * year difference — until the formatted year matches, then the month is
	 * walked back to Tishrei 1 via 29-day-per-month steps (months are 29/30
	 * days) and a final day-1 re-anchor via the calendar formatter.</p>
	 *
	 * @param firstDayOfBaseYearOfCalendar - the first day of the base calendar year; not modified
	 * @param baseYearOfCalendar           - the base year of calendar
	 * @param firstYearOfCalendarOfYearsAround - the first year of the years page
	 * @param lang                         - locale code
	 * @returns the first day of the target calendar year
	 */
	private moveToFirstDayOfYearsAround(
		firstDayOfBaseYearOfCalendar: UTCDate, baseYearOfCalendar: number, firstYearOfCalendarOfYearsAround: number,
		lang: HxLanguageCode
	): UTCDate {
		let yearOffset = firstYearOfCalendarOfYearsAround - baseYearOfCalendar;

		const firstDayOfTargetYear = UTCDate.cloneOf(firstDayOfBaseYearOfCalendar);
		// days of year could be 353/354/355/383/384/385
		// so minus days to first year
		firstDayOfTargetYear.setDayOfMonth(firstDayOfTargetYear.getDayOfMonth() + 353 * yearOffset);
		let [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfTargetYear, lang, false);
		while (yearOfCalendar !== firstYearOfCalendarOfYearsAround) {
			yearOffset = firstYearOfCalendarOfYearsAround - yearOfCalendar;
			firstDayOfTargetYear.setDayOfMonth(firstDayOfTargetYear.getDayOfMonth() + 353 * yearOffset);
			[, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfTargetYear, lang, false);
		}
		// check month, days of month could be 29/30
		while (monthOfCalendar !== 1) {
			const monthOffset = monthOfCalendar - 1;
			firstDayOfTargetYear.setDayOfMonth(firstDayOfTargetYear.getDayOfMonth() - 29 * monthOffset);
			[, , monthOfCalendar, dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfTargetYear, lang, false);
		}
		if (dayOfCalendar !== 1) {
			firstDayOfTargetYear.setDayOfMonth(firstDayOfTargetYear.getDayOfMonth() - (dayOfCalendar - 1));
		}
		return firstDayOfTargetYear;
	}

	/**
	 * Steps the given date forward by 355 days, which lands on (or near) Tishrei
	 * 1 of the next calendar year — in a leap year it lands in month 13 (Elul),
	 * so the 30-day leap month is skipped before the caller re-anchors to day 1.
	 *
	 * @param firstDayOfThisYear - the first day of the current calendar year; modified in place
	 * @param lang               - locale code
	 * @returns the same instance, moved to (or near) the first day of the next calendar year
	 */
	private moveToSomedayOfJanOfNextYear(firstDayOfThisYear: UTCDate, lang: HxLanguageCode): UTCDate {
		firstDayOfThisYear.setDayOfMonth(firstDayOfThisYear.getDayOfMonth() + 355);
		// after add 355 days, month could be 13 or 1
		const [, , monthOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfThisYear, lang, false);
		if (monthOfCalendar !== 1) {
			// move to Jan, next year
			firstDayOfThisYear.setDayOfMonth(firstDayOfThisYear.getDayOfMonth() + 30);
		}

		return firstDayOfThisYear;
	}

	/**
	 * Computes the years grid around a reference year for the years panel of the
	 * Hebrew calendar.
	 *
	 * <p>Delegates to the shared walk-and-re-anchor skeleton
	 * ({@link DateLocaleNotGregorianHelper#yearsAround}) with the Hebrew year
	 * anchoring and cell shaping; the Gregorian grid is used when the Gregorian
	 * calendar is in force. The window is centered on the reference year and
	 * clamped to the Hebrew calendar boundaries [3761, 13760]; each cell holds
	 * the first day of its calendar year in ICU semantics; clicking uses the
	 * cell offset, never the cell date.</p>
	 *
	 * @param somedayOfYear    - the reference date; its year centers the grid window and the offsets
	 * @param currentDate - the current value date; its year marks the "this year" cell
	 * @param lang        - locale code
	 * @param gregorian   - whether the Gregorian calendar is in use
	 * @returns the years around the reference year, with pagination flags
	 */
	yearsAround(somedayOfYear: UTCDate, currentDate: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedYears {
		return DateLocaleNotGregorianHelper.yearsAround(somedayOfYear, currentDate, DateHebrewUtils.YearsAroundFuncs, lang, gregorian);
	}
}
