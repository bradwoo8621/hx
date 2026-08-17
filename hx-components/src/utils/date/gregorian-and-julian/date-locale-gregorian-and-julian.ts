import type {HxLanguageCode} from '../../../contexts';
import {
	DateLocaleFormatUtils,
	DateLocaleNotGregorianHelper,
	type DateLocaleNotGregorianYearsAroundFunctions,
	DateMoveUtils,
	UTCDate
} from '../facade';
import type {ComputedMonth, ComputedMonths, ComputedYears} from '../interfaces';

export type DateLocaleGregorianAndJulianYearsAroundFunctions = Omit<
	DateLocaleNotGregorianYearsAroundFunctions,
	'computeFirstDayOfYear' | 'moveToFirstDayOfYearsAround'
>;

/**
 * Shared months/years-panel implementation for Gregorian-and-Julian calendars.
 *
 * <p>Calendars in this family already extend {@link DateMoveGregorianAndJulianProvider}
 * for move operations, so — since single inheritance forbids a second base class —
 * the locale side is provided as a static utility that subclasses delegate to.
 * The panel functions build on the generic {@link DateLocaleNotGregorianHelper}
 * skeleton, adding the 1582/10 short-month handling that is specific to
 * Gregorian-and-Julian calendars.</p>
 */
export class DateLocaleGregorianAndJulianHelper {
	/**
	 * Prevents direct instantiation; all members are accessed statically.
	 */
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Moves the given date back to the first day of its calendar month.
	 *
	 * <p>Steps back by the calendar day minus one, which lands on the first day
	 * of the month containing the given date. The 1582/10 short month (21 days,
	 * days 5-14 skipped by the Gregorian reform) is handled so that dates in the
	 * second half (Gregorian Oct 15-31) step back to Oct 11, the first day of
	 * the short month, instead of Gregorian Oct 1.</p>
	 *
	 * @param somedayOfMonth - the reference date; not modified
	 * @param lang - locale code
	 * @returns [the first day of the given date's calendar month, the month of calendar]
	 */
	static computeFirstDayOfMonth(somedayOfMonth: UTCDate, lang: HxLanguageCode): [UTCDate, number] {
		const [, , month, day] = DateLocaleFormatUtils.formatDateInNumeric(somedayOfMonth, lang, false);
		// move to first day of given date's month.
		// handle the short month of 1582/10
		const daysToFirstDay = (somedayOfMonth.getFullYear() === 1582 && somedayOfMonth.getMonthIndex() === 9 && somedayOfMonth.getDayOfMonth() > 14) ? (day - 11) : (day - 1);
		const firstDayOfBaseMonth = UTCDate.cloneOf(somedayOfMonth);
		firstDayOfBaseMonth.setDayOfMonth(firstDayOfBaseMonth.getDayOfMonth() - daysToFirstDay);

		return [firstDayOfBaseMonth, month];
	}

	/**
	 * Moves the given date back to the first day of its calendar month and returns the computed month cell.
	 *
	 * <p>The date is stepped back by the calendar day minus one, which lands on the
	 * first day of the month containing the given date (the day offset between the
	 * calendar and Gregorian representations is constant within a month). The
	 * 1582/10 short month (21 days, days 5-14 skipped by the Gregorian reform) is
	 * handled like in {@link #monthsOfYear}: dates in the second half of the short
	 * month (Gregorian Oct 15-31) step back to Oct 11, the first day of the short
	 * month.</p>
	 *
	 * <p>Note: the given date is modified in place.</p>
	 *
	 * @param somedayOfMonth   - the reference date; modified in place to the first day of its calendar month
	 * @param offsetToBaseMonth - the month offset of the returned cell relative to the base month
	 * @param lang   - locale code
	 * @returns the computed month cell for the first day of the calendar month
	 */
	static asComputedMonth(somedayOfMonth: UTCDate, offsetToBaseMonth: number, lang: HxLanguageCode): ComputedMonth {
		const [, , , day] = DateLocaleFormatUtils.formatDateInNumeric(somedayOfMonth, lang, false);
		const daysToFirstDay = (somedayOfMonth.getFullYear() === 1582 && somedayOfMonth.getMonthIndex() === 9 && somedayOfMonth.getDayOfMonth() > 14)
			? (day - 11)
			: (day - 1);
		somedayOfMonth.setDayOfMonth(somedayOfMonth.getDayOfMonth() - daysToFirstDay);
		const firstDayOfThisMonth = DateMoveUtils.asHxDate(somedayOfMonth);
		return {
			key: `${firstDayOfThisMonth.year}-${firstDayOfThisMonth.month}-${firstDayOfThisMonth.day}`,
			label: DateLocaleFormatUtils.formatMonthShort(somedayOfMonth, lang, false),
			value: UTCDate.cloneOf(somedayOfMonth),
			offset: offsetToBaseMonth,
			bc: false,
			y10k: false
		};
	}

	/**
	 * Computes the 12-month grid for the months panel in a Gregorian-and-Julian calendar.
	 *
	 * <p>Delegates to the Gregorian provider when the Gregorian calendar is in use.
	 * The grid is built by walking from the first day of the base month: months
	 * before it are reached by stepping back one day at a time, months after it by
	 * stepping forward 31 days at a time; each visited date is re-anchored to the
	 * first day of its calendar month via {@link #asComputedMonth}.
	 * The 1582/10 short month (21 days, days 5-14 skipped by the Gregorian reform)
	 * is handled so the reference day remains inside the month.</p>
	 *
	 * @param date      - the reference date; its year and month determine the grid and the offsets
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the 12 months of the reference date's year
	 */
	static monthsOfYear(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		return DateLocaleNotGregorianHelper.monthsOfYear(date, {
			computeFirstDayOfMonth: DateLocaleGregorianAndJulianHelper.computeFirstDayOfMonth,
			asComputedMonth: DateLocaleGregorianAndJulianHelper.asComputedMonth
		}, lang, gregorian);
	}

	/**
	 * Moves the given date back to the first day of its calendar year.
	 *
	 * <p>Steps back by the calendar day minus one plus the days of the previous
	 * calendar months, landing on (or near) Jan 1 of the given date's calendar
	 * year, then re-anchors to day 1 via the calendar formatter. The 1582/10
	 * short month adds a 10-day compensation so the estimate stays in January
	 * when the base date falls in the post-reform part of 1582. The returned
	 * date may fall outside the Gregorian [0001, 9999] range at the calendar
	 * edges.</p>
	 *
	 * @param somedayOfYear         - the reference date; not modified
	 * @param computeYearOfCalendar - optional year reform (e.g. Minguo no-year-0)
	 * @param lang                  - locale code
	 * @returns [the first day of the given date's calendar year, the reformed year of calendar]
	 */
	static computeFirstDayOfYear(
		somedayOfYear: UTCDate, computeYearOfCalendar: DateLocaleNotGregorianYearsAroundFunctions['computeYearOfCalendar'],
		lang: HxLanguageCode): [UTCDate, number] {
		// get calendar year/month
		// eslint-disable-next-line prefer-const
		let [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(somedayOfYear, lang, false);
		yearOfCalendar = computeYearOfCalendar?.(somedayOfYear, yearOfCalendar) ?? yearOfCalendar;

		const firstDayOfYear = UTCDate.cloneOf(somedayOfYear);

		// Non-leap February (28) is the conservative estimate: a leap-year February
		// (29) leaves a 1-day error that the day re-anchor below absorbs, while the
		// estimate never overshoots past the calendar year start.
		const daysOfPreviousMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30]
			.slice(0, monthOfCalendar - 1).reduce((c, v) => c + v, 0);
		if (somedayOfYear.getFullYear() === 1582
			&& (somedayOfYear.getMonthIndex() > 9 || (somedayOfYear.getMonthIndex() === 9 && somedayOfYear.getDayOfMonth() > 14))) {
			// after short month, or the second part of short month
			firstDayOfYear.setDayOfMonth(firstDayOfYear.getDayOfMonth() - (dayOfCalendar - 1) - daysOfPreviousMonths + 10);
		} else {
			firstDayOfYear.setDayOfMonth(firstDayOfYear.getDayOfMonth() - (dayOfCalendar - 1) - daysOfPreviousMonths);
		}
		[, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfYear, lang, false);
		if (dayOfCalendar !== 1) {
			firstDayOfYear.setDayOfMonth(firstDayOfYear.getDayOfMonth() - (dayOfCalendar - 1));
		}
		return [firstDayOfYear, yearOfCalendar];
	}

	/**
	 * Moves the first day of the base calendar year to the first day of the
	 * target calendar year (the first year of the years-around page).
	 *
	 * <p>Walks by 365 days per calendar year (reformed years, so the day
	 * arithmetic stays valid across the era/no-year-0 boundaries), then
	 * re-anchors to day 1 via the calendar formatter. When the walk crosses the
	 * 1582 reform — base year after 1582 and target year in 1582 or earlier —
	 * the 10 skipped days are compensated (-355 instead of -365 for the target
	 * year) so the estimate stays in January. The result may fall outside the
	 * Gregorian [0001, 9999] range at the calendar edges.</p>
	 *
	 * @param firstDayOfBaseYearOfCalendar - the first day of the base calendar year
	 * @param baseYearOfCalendar           - the base year of calendar (reformed)
	 * @param firstYearOfCalendarOfYearsAround - the first year of the years page (reformed)
	 * @param computeYearOffset            - optional no-year-0 offset fix
	 * @param lang                         - locale code
	 * @returns the first day of the target calendar year
	 */
	static moveToFirstDayOfYearsAround(
		firstDayOfBaseYearOfCalendar: UTCDate, baseYearOfCalendar: number, firstYearOfCalendarOfYearsAround: number,
		computeYearOffset: DateLocaleGregorianAndJulianYearsAroundFunctions['computeYearOffset'],
		lang: HxLanguageCode
	): UTCDate {
		const yearOffset = computeYearOffset?.(baseYearOfCalendar, firstYearOfCalendarOfYearsAround) ?? (firstYearOfCalendarOfYearsAround - baseYearOfCalendar);

		const firstDayOfTargetYear = UTCDate.cloneOf(firstDayOfBaseYearOfCalendar);
		// if per page is 50 (in ui, guess 50 years most, otherwise too more years to display), there are 12 leap years,
		// which means 1st. Jan some year - 365 * 50 days => Someday Jan 50 years ago. never be Feb, it's under expecting.
		if (firstDayOfBaseYearOfCalendar.getFullYear() > 1582 && (firstDayOfBaseYearOfCalendar.getFullYear() + yearOffset) <= 1582) {
			firstDayOfTargetYear.setDayOfMonth(firstDayOfTargetYear.getDayOfMonth() - 355 + 365 * (yearOffset + 1));
		} else {
			firstDayOfTargetYear.setDayOfMonth(firstDayOfTargetYear.getDayOfMonth() + 365 * yearOffset);
		}
		const [, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfTargetYear, lang, false);
		if (dayOfCalendar !== 1) {
			firstDayOfTargetYear.setDayOfMonth(firstDayOfTargetYear.getDayOfMonth() - (dayOfCalendar - 1));
		}
		return firstDayOfTargetYear;
	}

	/**
	 * Computes the years grid around a reference year for the years panel in a
	 * Gregorian-and-Julian calendar.
	 *
	 * <p>Delegates to the Gregorian provider when the Gregorian calendar is in use.
	 * The window is centered on the reference year; the calendar-specific start
	 * year, year stepping and cell shaping are injected via {@code funcs}, while
	 * the first-day anchoring and the 1582/10 short-month compensation are
	 * supplied by this helper. Each cell holds the first day of its calendar year
	 * in ICU semantics; clicking uses the cell offset, never the cell date.</p>
	 *
	 * @param baseDate    - the reference date; its year centers the grid window and the offsets
	 * @param currentDate - the current value date; its year marks the "this year" cell
	 * @param funcs       - the calendar-specific year functions (start year, year stepping, cell shaping)
	 * @param lang        - locale code
	 * @param gregorian   - whether the Gregorian calendar is in use
	 * @returns the years around the reference year, with pagination flags
	 */
	static yearsAround(baseDate: UTCDate, currentDate: UTCDate, funcs: DateLocaleGregorianAndJulianYearsAroundFunctions, lang: HxLanguageCode, gregorian: boolean): ComputedYears {
		return DateLocaleNotGregorianHelper.yearsAround(
			baseDate, currentDate,
			{
				...funcs,
				computeFirstDayOfYear: DateLocaleGregorianAndJulianHelper.computeFirstDayOfYear,
				moveToFirstDayOfYearsAround: DateLocaleGregorianAndJulianHelper.moveToFirstDayOfYearsAround
			},
			lang, gregorian
		);
	}
}
