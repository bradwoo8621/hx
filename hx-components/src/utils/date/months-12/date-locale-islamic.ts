import type {HxLanguageCode} from '../../../contexts';
import {
	DateLocaleFormatUtils,
	DateLocaleNotGregorianHelper,
	type DateLocaleNotGregorianYearsAroundFunctions,
	DateUtils,
	UTCDate
} from '../facade';
import type {ComputedMonth, ComputedMonths, ComputedYear, ComputedYears, HxDate} from '../interfaces';

export class DateLocaleIslamicHelper {
	// wires the Islamic-specific year anchoring and cell shaping into the shared years-panel skeleton
	private static readonly YearsAroundFuncs: DateLocaleNotGregorianYearsAroundFunctions = {
		computeFirstDayOfYear: DateLocaleIslamicHelper.computeFirstDayOfYear,
		computeStartYear: DateLocaleIslamicHelper.computeStartYear,
		moveToFirstDayOfYearsAround: DateLocaleIslamicHelper.moveToFirstDayOfYearsAround,
		asComputedYear: DateLocaleIslamicHelper.asComputedYear
	};

	/**
	 * Prevents direct instantiation; all members are accessed statically.
	 */
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Shapes a months-panel cell from the first day of an Islamic month,
	 * flagging the partial years at the calendar bounds: year −640 starts
	 * at month 5 (months 1–4 are before the epoch) and year 9666 ends at
	 * month 4 (months 5–12 are beyond Gregorian 9999).
	 *
	 * @param somedayOfMonth   - the reference date; the first day of its calendar month is computed and returned
	 * @param offsetToBaseMonth - the month offset of the returned cell relative to the base month
	 * @param lang             - locale code
	 * @returns [the first day of the given date's calendar month, the computed month cell]
	 */
	static asComputedMonth(somedayOfMonth: HxDate, offsetToBaseMonth: number, lang: HxLanguageCode): [UTCDate, ComputedMonth] {
		const firstDayOfMonth = DateUtils.asUtcDate(somedayOfMonth);
		const [, year, month, day] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfMonth, lang, false);
		firstDayOfMonth.setDayOfMonth(firstDayOfMonth.getDayOfMonth() - (day - 1));
		const bc = year === -640 && month < 5;
		const y10k = year === 9666 && month > 4;
		return [
			firstDayOfMonth,
			{
				key: `${firstDayOfMonth.getFullYear()}-${firstDayOfMonth.getMonthIndex() + 1}-${firstDayOfMonth.getDayOfMonth()}`,
				label: DateLocaleFormatUtils.formatMonthShort(firstDayOfMonth, lang, false),
				value: UTCDate.cloneOf(firstDayOfMonth),
				offset: offsetToBaseMonth,
				bc,
				y10k
			}
		];
	}

	/**
	 * Default {@code moveToSomedayOfNextMonth}: steps forward by 30 days,
	 * which lands in the next calendar month for every Islamic month —
	 * a 29-day month lands on day 2 of the next month, a 30-day month on
	 * its day 1 — and the caller re-anchors to day 1.
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
	 * Computes the start year of the years-around window.
	 *
	 * <p>The window is simply {@code baseYear − yearsToStart}, clamped to the
	 * Islamic calendar bounds [−640, 9666]: year −640 is the first Islamic year
	 * (partial, months 1–4 are before the epoch) and year 9666 is the last
	 * (partial, months 5–12 are beyond Gregorian 9999), so the page is centered
	 * on the base year whenever it is not clamped.</p>
	 *
	 * @param baseYearOfCalendar  - the base Islamic year
	 * @param _firstDayOfBaseYear - the first day of the base calendar year (unused)
	 * @returns [start year of calendar, forwardable, backwardable]
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static computeStartYear(baseYearOfCalendar: number, _firstDayOfBaseYear: UTCDate): [number, boolean, boolean] {
		const maxStartYearOfCalendar = 9666 - DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE + 1;
		const minStartYearOfCalendar = -640;
		const yearsToStart = Math.floor((DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE - 1) / 2);

		const startYearOfCalendar = Math.min(maxStartYearOfCalendar, Math.max(minStartYearOfCalendar, baseYearOfCalendar - yearsToStart));

		return [
			startYearOfCalendar, startYearOfCalendar !== maxStartYearOfCalendar, startYearOfCalendar !== minStartYearOfCalendar
		];
	}

	/**
	 * Computes the 12-month grid for the months panel of the datetime input popup.
	 *
	 * <p>Delegates to the shared walk-and-re-anchor skeleton
	 * ({@link DateLocaleNotGregorianHelper#monthsOfYear}) with the Islamic
	 * month cell shaping and the 30-day month stepping; the Gregorian grid
	 * is used when the Gregorian calendar is in force.</p>
	 *
	 * @param somedayOfYear - the reference date; its year and month determine the grid and the offsets
	 * @param lang          - locale code
	 * @param gregorian     - whether the Gregorian calendar is in use
	 * @returns the 12 months of the reference date's year
	 */
	static monthsOfYear(somedayOfYear: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		return DateLocaleNotGregorianHelper.monthsOfYear(somedayOfYear, {
			asComputedMonth: DateLocaleIslamicHelper.asComputedMonth,
			moveToSomedayOfNextMonth: DateLocaleIslamicHelper.moveToSomedayOfNextMonth
		}, lang, gregorian);
	}

	/**
	 * Moves the given date back to the first day of its calendar year.
	 *
	 * <p>Steps back by the calendar day minus one plus {@code 29 × (month − 1)}
	 * days, then re-anchors to day 1 via the calendar formatter. Islamic months
	 * are 29 or 30 days, so the 29-day-per-month estimate undershoots by at most
	 * one day per month and the re-anchor absorbs the difference, always landing
	 * on Muharram 1. The result may fall outside the Gregorian [0001, 9999]
	 * range at the calendar edges (the bottom-clamped page anchors its first
	 * cell at −640/1/1, Gregorian 1 BCE 8/17, before the calendar's first
	 * representable days).</p>
	 *
	 * @param somedayOfYear         - the reference date; not modified
	 * @param _computeYearOfCalendar - the optional year reform callback (unused; Islamic years are continuous)
	 * @param lang                  - locale code
	 * @returns [the first day of the given date's calendar year, the Islamic year]
	 */
	static computeFirstDayOfYear(
		somedayOfYear: UTCDate, _computeYearOfCalendar: DateLocaleNotGregorianYearsAroundFunctions['computeYearOfCalendar'],
		lang: HxLanguageCode): [UTCDate, number] {
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
	 * Moves the first day of the base calendar year to (near) the first day of
	 * the target calendar year, the first year of the years-around page.
	 *
	 * <p>Contract see
	 * {@link DateLocaleNotGregorianYearsAroundFunctions#moveToFirstDayOfYearsAround}.
	 * Only the backward direction is supported
	 * ({@code firstYearOfCalendarOfYearsAround ≤ baseYearOfCalendar}, i.e.
	 * yearOffset ≤ 0, which is always the case since {@link #computeStartYear}
	 * windows backward from the base year): stepping 353 days per year
	 * undershoots the real 354/355-day years, so a positive yearOffset would
	 * land in months 8-12 of the year before the target year, where none of the
	 * month checks below applies.</p>
	 *
	 * <p>The estimate is sized for 50 years per page (in ui, guess 50 years
	 * most, otherwise too many years to display): since there are 353/354/355
	 * days per year, most of them 354/355, the max error is 98 days (2 × 49),
	 * and since the base is Jan 1st of the base year and the min days of the
	 * first 3 months are 87, the max result is 04/12 of the target year — the
	 * month checks below then back off to Jan of the target year, followed by a
	 * day-1 re-anchor via the calendar formatter.</p>
	 *
	 * @param firstDayOfBaseYearOfCalendar - the first day of the base calendar year; not modified
	 * @param baseYearOfCalendar           - the base year of calendar
	 * @param firstYearOfCalendarOfYearsAround - the first year of the years page; must be ≤ {@code baseYearOfCalendar}
	 * @param _computeYearOffset           - the optional no-year-0 offset fix (unused; the plain year difference is used)
	 * @param lang                         - locale code
	 * @returns the first day of the target calendar year
	 */
	static moveToFirstDayOfYearsAround(
		firstDayOfBaseYearOfCalendar: UTCDate, baseYearOfCalendar: number, firstYearOfCalendarOfYearsAround: number,
		_computeYearOffset: DateLocaleNotGregorianYearsAroundFunctions['computeYearOffset'],
		lang: HxLanguageCode
	): UTCDate {
		const yearOffset = firstYearOfCalendarOfYearsAround - baseYearOfCalendar;

		const firstDayOfTargetYear = UTCDate.cloneOf(firstDayOfBaseYearOfCalendar);
		firstDayOfTargetYear.setDayOfMonth(firstDayOfTargetYear.getDayOfMonth() + 353 * yearOffset);
		// eslint-disable-next-line prefer-const
		let [, , monthOfCalendar, dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfTargetYear, lang, false);
		if (monthOfCalendar === 4) {
			firstDayOfTargetYear.setDayOfMonth(firstDayOfTargetYear.getDayOfMonth() - (dayOfCalendar - 1) - 87);
		} else if (monthOfCalendar === 3) {
			firstDayOfTargetYear.setDayOfMonth(firstDayOfTargetYear.getDayOfMonth() - (dayOfCalendar - 1) - 58);
		} else if (monthOfCalendar === 2) {
			firstDayOfTargetYear.setDayOfMonth(firstDayOfTargetYear.getDayOfMonth() - (dayOfCalendar - 1) - 29);
		}
		[, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfTargetYear, lang, false);
		if (dayOfCalendar !== 1) {
			firstDayOfTargetYear.setDayOfMonth(firstDayOfTargetYear.getDayOfMonth() - (dayOfCalendar - 1));
		}
		return firstDayOfTargetYear;
	}

	/**
	 * Shapes a year cell from the first day of the calendar year.
	 *
	 * <p>The label is the formatted calendar year with the minus sign stripped
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
	static asComputedYear(firstDayOfYear: HxDate, baseYearOfCalendar: number, currentYearOfCalendar: number, lang: HxLanguageCode): ComputedYear {
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
	 * Computes the years grid around a reference year for the years panel of an
	 * Islamic calendar.
	 *
	 * <p>Delegates to the shared walk-and-re-anchor skeleton
	 * ({@link DateLocaleNotGregorianHelper#yearsAround}) with the Islamic year
	 * anchoring and cell shaping; the Gregorian grid is used when the Gregorian
	 * calendar is in force. The window is centered on the reference year and
	 * clamped to the Islamic calendar boundaries [−640, 9666]; each cell holds
	 * the first day of its calendar year in ICU semantics, so at the bottom
	 * clamp the first cell may anchor at −640/1/1 (Gregorian 1 BCE 8/17, before
	 * the calendar's first representable days); clicking uses the cell offset,
	 * never the cell date.</p>
	 *
	 * @param baseDate    - the reference date; its year centers the grid window and the offsets
	 * @param currentDate - the current value date; its year marks the "this year" cell
	 * @param lang        - locale code
	 * @param gregorian   - whether the Gregorian calendar is in use
	 * @returns the years around the reference year, with pagination flags
	 */
	static yearsAround(baseDate: UTCDate, currentDate: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedYears {
		return DateLocaleNotGregorianHelper.yearsAround(baseDate, currentDate, DateLocaleIslamicHelper.YearsAroundFuncs, lang, gregorian);
	}
}
