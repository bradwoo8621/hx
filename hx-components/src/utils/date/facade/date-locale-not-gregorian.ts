import type {HxLanguageCode} from '../../../contexts';
import type {ComputedMonth, ComputedMonths, ComputedYear, ComputedYears, HxDate} from '../interfaces';
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
	 * note the parameter here is reformed year of calendar
	 */
	computeStartYear: (baseYearOfCalendar: number) => [number, boolean, boolean];
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
	moveToSomedayOfJanOfNextYear: (firstDayOfThisYear: UTCDate) => UTCDate;
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
		const [startYearOfCalendar, forward, backward] = funcs.computeStartYear(baseYearOfCalendar);
		// move to 1st day, 1st month, start year
		const firstDayOfStartYear = funcs.moveToFirstDayOfYearsAround(firstDayOfBaseYear, baseYearOfCalendar, startYearOfCalendar, funcs.computeYearOffset, lang);

		const asComputedYear = funcs.asComputedYear ?? DateLocaleNotGregorianHelper.asComputedYear;
		const years: Array<ComputedYear> = [];
		years.push(asComputedYear(DateMoveUtils.asHxDate(firstDayOfStartYear), baseYearOfCalendar, currentYearOfCalendar, lang));
		let firstDayOfThisYear = UTCDate.cloneOf(firstDayOfStartYear);
		for (let index = 1; index < DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE; index++) {
			firstDayOfThisYear = funcs.moveToSomedayOfJanOfNextYear(firstDayOfThisYear);
			const [, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfThisYear, lang, false);
			if (dayOfCalendar !== 1) {
				firstDayOfThisYear.setDayOfMonth(firstDayOfThisYear.getDayOfMonth() - (dayOfCalendar - 1));
			}
			years.push(asComputedYear(DateMoveUtils.asHxDate(firstDayOfThisYear), baseYearOfCalendar, currentYearOfCalendar, lang));
		}

		return {forward, backward, years};
	}
}
