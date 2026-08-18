import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleFormatUtils, DateMoveUtils, DateUtils, UTCDate} from '../facade';
import type {DateLocaleNotGregorianProvider, DateMoveNotGregorianProvider, HxDate} from '../interfaces';

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
}
