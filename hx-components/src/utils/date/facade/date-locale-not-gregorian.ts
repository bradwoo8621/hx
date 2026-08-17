import type {HxLanguageCode} from '../../../contexts';
import type {ComputedMonth, ComputedMonths, ComputedYear, ComputedYears, HxDate} from '../interfaces';
import {DateUtils} from './date';
import {DateLocaleFormatUtils} from './date-locale-format';
import {DateLocaleGregorianProvider} from './date-locale-gregorian';
import {DateMoveUtils} from './date-move';
import {UTCDate} from './utc-date';

export type DateLocaleNotGregorianMonthsOfYearFunctions = Readonly<{
	/**
	 * compute the first day of the calendar month based on a given date.
	 *
	 * returns [first day of the given month, month of calendar]
	 */
	computeFirstDayOfMonth?: (date: UTCDate, lang: HxLanguageCode) => [UTCDate, number];
	asComputedMonth: (date: UTCDate, offset: number, lang: HxLanguageCode) => ComputedMonth;
	/**
	 * move the given first day of a calendar month to (or near) the first day
	 * of the next calendar month; the caller re-anchors to day 1.
	 *
	 * default see {@link DateLocaleNotGregorianHelper#moveToSomedayOfNextMonth}
	 */
	moveToSomedayOfNextMonth?: (firstDayOfThisMonth: UTCDate, nextMonthOfCalendar: number) => UTCDate;
}>;
export type DateLocaleNotGregorianYearsAroundFunctions = Readonly<{
	/**
	 * fix the year of calendar, for example:
	 * - minguo calendar has no year 0,
	 * - year of calendar returned by formatter of japanese calendar has no meaning to computation
	 *
	 * leave this function as undefined if no need to reform the year of calendar by Intl formatter.
	 *
	 * default see {@link DateLocaleNotGregorianHelper#computeYearOfCalendar}
	 *
	 * note the parameter here is NOT reformed year of calendar
	 */
	computeYearOfCalendar?: (date: UTCDate, yearOfCalendar: number) => number;
	/**
	 * compute the first day of the calendar year based on a given date.
	 *
	 * returns [first day of the given year, reformed year of calendar]
	 */
	computeFirstDayOfYear: (
		date: UTCDate, computeYearOfCalendar: DateLocaleNotGregorianYearsAroundFunctions['computeYearOfCalendar'],
		lang: HxLanguageCode) => [UTCDate, number];
	/**
	 * compute the start year of calendar base on given base year of calendar.
	 *
	 * returns [start year of calendar, forwardable, backwardable]
	 *
	 * note the base year here is reformed year of calendar; the first day of the
	 * base year is provided for calendars whose start-year window depends on the
	 * Gregorian date (e.g. era boundaries)
	 */
	computeStartYear: (baseYearOfCalendar: number, firstDayOfBaseYear: UTCDate) => [number, boolean, boolean];
	/**
	 * fix the year offset, for example:
	 * - minguo calendar has no year 0
	 *
	 * leave this function as undefined if the years of calendar by Intl formatter are continuous.
	 * no default, this function is just bypassed to {@link moveToFirstDayOfYearsAround}.
	 *
	 * note the parameters here are reformed year of calendar
	 */
	computeYearOffset?: (baseYearOfCalendar: number, firstYearOfCalendarOfYearsAround: number) => number;
	/**
	 * move the first day of the base calendar year to the first day of the
	 * target calendar year (the first year of the years-around page); the
	 * caller re-anchors to day 1 via the calendar formatter.
	 *
	 * default see {@link DateLocaleNotGregorianHelper#moveToFirstDayOfYearsAround}
	 *
	 * note the parameters here are reformed year of calendar
	 */
	moveToFirstDayOfYearsAround: (
		firstDayOfBaseYearOfCalendar: UTCDate, baseYearOfCalendar: number, firstYearOfCalendarOfYearsAround: number,
		computeYearOffset: DateLocaleNotGregorianYearsAroundFunctions['computeYearOffset'],
		lang: HxLanguageCode) => UTCDate;
	/**
	 * default see {@link DateLocaleNotGregorianHelper#asComputedYear}
	 *
	 * note the parameters here are reformed year of calendar
	 */
	asComputedYear?: (firstDayOfYear: HxDate, baseYearOfCalendar: number, currentYearOfCalendar: number, lang: HxLanguageCode) => ComputedYear;
	/**
	 * move the given first day of a calendar year to (or near) the first day of
	 * the next calendar year; the caller re-anchors to day 1.
	 */
	moveToSomedayOfJanOfNextYear?: (firstDayOfThisYear: UTCDate) => UTCDate;
}>;

/**
 * Shared months/years-panel skeleton for non-Gregorian calendars.
 *
 * <p>Months and years panels share the same walk-and-re-anchor shape across
 * all non-Gregorian calendars; the calendar-specific parts (first day of
 * month/year, month/year stepping, cell shaping, year reform) are injected via
 * {@link DateLocaleNotGregorianMonthsOfYearFunctions} and
 * {@link DateLocaleNotGregorianYearsAroundFunctions}. Subclasses delegate their
 * {@code monthsOfYear}/{@code yearsAround} here; Gregorian-and-Julian calendars
 * additionally delegate through {@link DateLocaleGregorianAndJulianHelper},
 * which supplies the 1582/10 short-month handling.</p>
 */
export class DateLocaleNotGregorianHelper {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Moves the given date back to the first day of its calendar month.
	 *
	 * <p>Steps back by the calendar day minus one, which lands on the first day
	 * of the month containing the given date.</p>
	 *
	 * @param date - the reference date; not modified
	 * @param lang - locale code
	 * @returns [the first day of the given date's calendar month, the month of calendar]
	 */
	static computeFirstDayOfMonth(date: UTCDate, lang: HxLanguageCode): [UTCDate, number] {
		const [, , month, day] = DateLocaleFormatUtils.formatDateInNumeric(date, lang, false);
		// move to first day of given date's month.
		const firstDayOfBaseMonth = UTCDate.cloneOf(date);
		firstDayOfBaseMonth.setDayOfMonth(date.getDayOfMonth() - (day - 1));

		return [firstDayOfBaseMonth, month];
	}

	/**
	 * Default {@code moveToSomedayOfNextMonth}: steps forward by 31 days, which
	 * lands in the next calendar month for every 30/31-day month.
	 *
	 * @param firstDayOfThisMonth - the first day of the current calendar month; modified in place
	 * @param _nextMonthOfCalendar - the target month of calendar (unused; stepping by 31 days is month-agnostic)
	 * @returns the same instance, moved into the next calendar month
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static moveToSomedayOfNextMonth(firstDayOfThisMonth: UTCDate, _nextMonthOfCalendar: number): UTCDate {
		return firstDayOfThisMonth.setDayOfMonth(firstDayOfThisMonth.getDayOfMonth() + 31);
	}

	/**
	 * Computes the 12-month grid for the months panel of a non-Gregorian calendar.
	 *
	 * <p>Delegates to the Gregorian provider when the Gregorian calendar is in use.
	 * The grid is built by walking from the first day of the base month: months
	 * before it are reached by stepping back one day at a time, months after it by
	 * stepping forward 31 days at a time; each visited date is re-anchored to the
	 * first day of its calendar month via {@code asComputedMonth}.</p>
	 *
	 * @param date      - the reference date; its year and month determine the grid and the offsets
	 * @param funcs     - the calendar-specific first-day and cell-shaping functions
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the 12 months of the reference date's year
	 */
	static monthsOfYear(date: UTCDate, funcs: DateLocaleNotGregorianMonthsOfYearFunctions, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		if (gregorian) {
			return DateLocaleGregorianProvider.monthsOfYear(date, lang);
		}

		// move to first day of given date's month.
		const [firstDayOfBaseMonth, baseMonthOfCalendar] = (funcs.computeFirstDayOfMonth ?? DateLocaleNotGregorianHelper.computeFirstDayOfMonth)(date, lang);

		const months: ComputedMonths = [];
		{
			// before base month
			const tempDate = UTCDate.cloneOf(firstDayOfBaseMonth);
			for (let index = baseMonthOfCalendar - 1; index >= 1; index--) {
				// move to last day of previous month
				tempDate.setDayOfMonth(tempDate.getDayOfMonth() - 1);
				months.unshift(funcs.asComputedMonth(tempDate, index - baseMonthOfCalendar, lang));
			}
		}
		// month of base day
		months.push(funcs.asComputedMonth(firstDayOfBaseMonth, 0, lang));
		// after base month
		{
			const tempDate = UTCDate.cloneOf(firstDayOfBaseMonth);
			for (let index = baseMonthOfCalendar + 1; index <= 12; index++) {
				// make sure jump to next month
				(funcs.moveToSomedayOfNextMonth ?? DateLocaleNotGregorianHelper.moveToSomedayOfNextMonth)(tempDate, index);
				months.push(funcs.asComputedMonth(tempDate, index - baseMonthOfCalendar, lang));
			}
		}

		return months;
	}

	/**
	 * Default {@code computeYearOfCalendar}: the year returned by the Intl
	 * formatter is used as-is (calendars with continuous years).
	 *
	 * @param _date           - the Gregorian date (unused)
	 * @param yearOfCalendar  - the year of calendar as formatted by Intl
	 * @returns the year of calendar unchanged
	 */
	static computeYearOfCalendar(_date: UTCDate, yearOfCalendar: number): number {
		return yearOfCalendar;
	}

	/**
	 * Moves the first day of the base calendar year to the first day of the
	 * target calendar year (the first year of the years-around page), applying
	 * the calendar's {@code computeYearOffset}.
	 *
	 * <p>Like the default {@link #moveToFirstDayOfYearsAround}, walks by 365
	 * days per calendar year and re-anchors to day 1 via the calendar formatter,
	 * but the year offset comes from {@code computeYearOffset} (falling back to
	 * the plain year difference) instead of being recomputed. Needed by
	 * calendars whose year numbering is not continuous across the era boundary,
	 * e.g. the Ethiopic all-positive B.I. 5493–5500 encoding, where the walk
	 * must count across the missing year 0. The result may fall outside the
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
		computeYearOffset: DateLocaleNotGregorianYearsAroundFunctions['computeYearOffset'],
		lang: HxLanguageCode
	): UTCDate {
		const yearOffset = computeYearOffset?.(baseYearOfCalendar, firstYearOfCalendarOfYearsAround) ?? (firstYearOfCalendarOfYearsAround - baseYearOfCalendar);

		const firstDayOfTargetYear = UTCDate.cloneOf(firstDayOfBaseYearOfCalendar);
		// if per page is 50 (in ui, guess 50 years most, otherwise too more years to display), there are 12 leap years,
		// which means 1st. Jan some year - 365 * 50 days => Someday Jan 50 years ago. never be Feb, it's under expecting.
		firstDayOfTargetYear.setDayOfMonth(firstDayOfTargetYear.getDayOfMonth() + 365 * yearOffset);
		const [, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfTargetYear, lang, false);
		if (dayOfCalendar !== 1) {
			firstDayOfTargetYear.setDayOfMonth(firstDayOfTargetYear.getDayOfMonth() - (dayOfCalendar - 1));
		}
		return firstDayOfTargetYear;
	}

	/**
	 * Steps the given date forward by 366 days, which lands on (or near) Jan 1
	 * of the next calendar year; the caller re-anchors to day 1.
	 *
	 * @param firstDayOfThisYear - the first day of the current calendar year; modified in place
	 * @returns the same instance, moved to (or near) the first day of the next calendar year
	 */
	static moveToSomedayOfJanOfNextYear(firstDayOfThisYear: UTCDate): UTCDate {
		return firstDayOfThisYear.setDayOfMonth(firstDayOfThisYear.getDayOfMonth() + 366);
	}

	/**
	 * Default {@code asComputedYear}: shapes a year cell from the first day of
	 * the calendar year, with a linear year offset (calendars with continuous
	 * years).
	 *
	 * @param firstDayOfYear           - the first day of the cell's calendar year
	 * @param baseYearOfCalendar       - the base year of calendar (reformed)
	 * @param currentYearOfCalendar    - the current year of calendar (reformed)
	 * @param lang                     - locale code
	 * @returns the computed year cell
	 */
	static asComputedYear(firstDayOfYear: HxDate, baseYearOfCalendar: number, currentYearOfCalendar: number, lang: HxLanguageCode): ComputedYear {
		const value = DateMoveUtils.asJsDate(firstDayOfYear);
		const [, yearOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(value, lang, false);

		return {
			key: `${firstDayOfYear.year}-${firstDayOfYear.month}-${firstDayOfYear.day}`,
			label: DateLocaleFormatUtils.formatYear(value, lang, false),
			value,
			offset: yearOfCalendar - baseYearOfCalendar,
			thisYear: yearOfCalendar === currentYearOfCalendar
		};
	}

	/**
	 * Computes the years grid around a reference year for the years panel of a
	 * non-Gregorian calendar.
	 *
	 * <p>Delegates to the Gregorian provider when the Gregorian calendar is in use.
	 * The window is centered on the reference year; the calendar-specific start
	 * year, first day and year stepping are injected via {@code funcs}. Each cell
	 * holds the first day of its calendar year in ICU semantics; clicking uses
	 * the cell offset, never the cell date.</p>
	 *
	 * @param baseDate    - the reference date; its year centers the grid window and the offsets
	 * @param currentDate - the current value date; its year marks the "this year" cell
	 * @param funcs       - the calendar-specific year functions
	 * @param lang        - locale code
	 * @param gregorian   - whether the Gregorian calendar is in use
	 * @returns the years around the reference year, with pagination flags
	 */
	static yearsAround(baseDate: UTCDate, currentDate: UTCDate, funcs: DateLocaleNotGregorianYearsAroundFunctions, lang: HxLanguageCode, gregorian: boolean): ComputedYears {
		if (gregorian) {
			return DateLocaleGregorianProvider.yearsAround(baseDate, currentDate, lang);
		}

		const computeYearOfCalendar = funcs.computeYearOfCalendar ?? DateLocaleNotGregorianHelper.computeYearOfCalendar;

		// get current year
		let [, currentYearOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(currentDate, lang, false);
		currentYearOfCalendar = computeYearOfCalendar(currentDate, currentYearOfCalendar);

		// move to first day of calendar of given year
		const [firstDayOfBaseYear, baseYearOfCalendar] = funcs.computeFirstDayOfYear(baseDate, computeYearOfCalendar, lang);
		// compute start year of calendar
		const [startYearOfCalendar, forward, backward] = funcs.computeStartYear(baseYearOfCalendar, firstDayOfBaseYear);
		// move to 1st day, 1st month, start year
		const firstDayOfStartYear = funcs.moveToFirstDayOfYearsAround(firstDayOfBaseYear, baseYearOfCalendar, startYearOfCalendar, funcs.computeYearOffset, lang);

		const moveToSomedayOfJanOfNextYear = funcs.moveToSomedayOfJanOfNextYear ?? DateLocaleNotGregorianHelper.moveToSomedayOfJanOfNextYear;
		const asComputedYear = funcs.asComputedYear ?? DateLocaleNotGregorianHelper.asComputedYear;
		const years: Array<ComputedYear> = [];
		years.push(asComputedYear(DateMoveUtils.asHxDate(firstDayOfStartYear), baseYearOfCalendar, currentYearOfCalendar, lang));
		let firstDayOfThisYear = UTCDate.cloneOf(firstDayOfStartYear);
		for (let index = 1; index < DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE; index++) {
			firstDayOfThisYear = moveToSomedayOfJanOfNextYear(firstDayOfThisYear);
			const [, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfThisYear, lang, false);
			if (dayOfCalendar !== 1) {
				firstDayOfThisYear.setDayOfMonth(firstDayOfThisYear.getDayOfMonth() - (dayOfCalendar - 1));
			}
			years.push(asComputedYear(DateMoveUtils.asHxDate(firstDayOfThisYear), baseYearOfCalendar, currentYearOfCalendar, lang));
		}

		return {forward, backward, years};
	}

	/**
	 * Composes an era + year label for right-to-left locales (Arabic script).
	 *
	 * <p>Before-era years may start with a direction marker (U+200E LRM or
	 * U+061C ALM) followed by a minus sign; the minus sign is stripped since the
	 * era label already indicates the negative era, while the direction marker
	 * is preserved so the number stays displayed left-to-right.</p>
	 *
	 * @param value - the date-time value
	 * @param era   - the era label, or a callback computing it per date/locale
	 * @param year  - the year string from Intl formatting
	 * @param lang  - locale language code
	 * @returns the composed era + year label
	 */
	static labelOfYearOfRtl(value: HxDate, era: string | ((date: UTCDate, lang: HxLanguageCode) => string), year: string, lang: HxLanguageCode): string {
		const date = DateUtils.asJsDate(value);
		era = typeof era === 'string' ? era : era(date, lang);
		// Strip the minus sign while preserving the direction marker (U+200E LRM or U+061C ALM).
		if (year.charCodeAt(0) === 0x200E || year.charCodeAt(0) === 0x061C) {
			if (year[1] === '-') {
				year = year[0] + year.substring(2);
			}
		}
		return `${era} ${year}`;
	}
}
