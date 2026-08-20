import type {HxLanguageCode} from '../../../contexts';
import {
	DateLocaleFormatUtils,
	DateLocaleNotGregorianHelper,
	type DateLocaleNotGregorianMonthsOfYearFunctions,
	type DateLocaleNotGregorianYearsAroundFunctions,
	DateUtils,
	UTCDate
} from '../facade';
import type {ComputedMonths} from '../interfaces';

/**
 * Shared months/years-panel pieces for the Coptic and Ethiopic calendars.
 *
 * <p>Both calendars use 12 × 30-day months plus a 13th intercalary month
 * (Pi Kogi Enavot / Pagumēn), so the months panel extends the generic
 * {@link DateLocaleNotGregorianHelper} skeleton with a 13th cell, and the
 * first day of the calendar year is reached by subtracting the completed
 * 30-day months. Subclasses delegate their {@code monthsOfYear}/
 * {@code yearsAround} here.</p>
 */
export class DateLocaleCopticAndEthiopicHelper {
	/**
	 * Prevents direct instantiation; all members are accessed statically.
	 */
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Default {@code moveToSomedayOfNextMonth}: steps forward by 30 days,
	 * which lands exactly on the first day of the next calendar month for
	 * every 30-day Coptic/Ethiopic month (or on the first day of the
	 * following year's Thout when the intercalary month does not exist);
	 * the caller re-anchors to day 1.
	 *
	 * @param firstDayOfThisMonth - the first day of the current calendar month; modified in place
	 * @param _nextMonthOfCalendar - the target month of calendar (unused; stepping by 30 days is month-agnostic)
	 * @returns the same instance, moved into the next calendar month
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static moveToSomedayOfNextMonth(firstDayOfThisMonth: UTCDate, _nextMonthOfCalendar: number): UTCDate {
		return firstDayOfThisMonth.setDayOfMonth(firstDayOfThisMonth.getDayOfMonth() + 30);
	}

	/**
	 * Computes the 13-month grid for the months panel in the Coptic or Ethiopic
	 * calendar.
	 *
	 * <p>Delegates to the Gregorian provider when the Gregorian calendar is in
	 * use. The shared skeleton walks the 12 regular months; the 13th month's
	 * cell is appended by stepping the 12th month's first day forward by 30
	 * days (12 × 30-day months) and re-anchoring to its first day via
	 * {@code asComputedMonth}.</p>
	 *
	 * @param somedayOfYear      - the reference date; its year and month determine the grid and the offsets
	 * @param funcs     - the calendar-specific first-day and cell-shaping functions
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the 13 months of the reference date's year
	 */
	static monthsOfYear(somedayOfYear: UTCDate, funcs: DateLocaleNotGregorianMonthsOfYearFunctions, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		const months = DateLocaleNotGregorianHelper.monthsOfYear(somedayOfYear, {
			moveToSomedayOfNextMonth: DateLocaleCopticAndEthiopicHelper.moveToSomedayOfNextMonth,
			...funcs
		}, lang, gregorian);

		if (months.length < 13) {
			// #13 month: the shared skeleton walks 12 months;
			// but note if the given someday is #13 month, this logic is unnecessary.

			// step the 12th month's first day forward by 30 days (12 × 30-day months)
			// and re-anchor to the 13th month's first day.
			// Clone first — the value is shared with the 12th cell.
			const lastMonth = months[months.length - 1];
			const tempDate = UTCDate.cloneOf(lastMonth.value);
			tempDate.setDayOfMonth(tempDate.getDayOfMonth() + 30);
			const [, month] = funcs.asComputedMonth(DateUtils.asHxDate(tempDate), lastMonth.offset + 1, lang);
			months.push(month);
		}
		return months;
	}

	/**
	 * Moves the given date back to the first day of its calendar year.
	 *
	 * <p>Steps back by the calendar day minus one plus the completed months
	 * (12 × 30-day months), then re-anchors to day 1 via the calendar
	 * formatter; the 13th month's 5/6 days are absorbed by the day re-anchor.
	 * The returned year of calendar is reformed via {@code computeYearOfCalendar}
	 * (e.g. Coptic negates Before-Diocletian years), so the years panel always
	 * works with the continuous arithmetic year space.</p>
	 *
	 * @param somedayOfYear                 - the reference date; not modified
	 * @param computeYearOfCalendar - optional year reform (e.g. Coptic no-year-0)
	 * @param lang                 - locale code
	 * @returns [the first day of the given date's calendar year, the reformed year of calendar]
	 */
	static computeFirstDayOfYear(
		somedayOfYear: UTCDate, computeYearOfCalendar: DateLocaleNotGregorianYearsAroundFunctions['computeYearOfCalendar'],
		lang: HxLanguageCode): [UTCDate, number] {
		// get calendar year/month
		// eslint-disable-next-line prefer-const
		let [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(somedayOfYear, lang, false);

		const firstDayOfYear = UTCDate.cloneOf(somedayOfYear);

		const daysOfPreviousMonths = 30 * (monthOfCalendar - 1);
		// noinspection DuplicatedCode
		firstDayOfYear.setDayOfMonth(firstDayOfYear.getDayOfMonth() - (dayOfCalendar - 1) - daysOfPreviousMonths);
		[, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfYear, lang, false);
		if (dayOfCalendar !== 1) {
			firstDayOfYear.setDayOfMonth(firstDayOfYear.getDayOfMonth() - (dayOfCalendar - 1));
		}
		return [firstDayOfYear, computeYearOfCalendar?.(somedayOfYear, yearOfCalendar) ?? yearOfCalendar];
	}
}