import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleFormatUtils, DateMoveUtils, UTCDate} from '../facade';
import type {ComputedYear, HxDate} from '../interfaces';

/**
 * Shared years-panel pieces for 12-month calendars (Indian, Persian).
 *
 * <p>These calendars use continuous year systems with no era/no-year-0 gaps
 * and no 1582 short-month handling, so the years-around walk reduces to a
 * plain 365-day step plus a day re-anchor. The year-cell shape is shared too,
 * with the era label injected via {@code labelOfYear}.</p>
 */
export class DateLocale12MonthsHelper {
	protected constructor() {
	}

	static moveToFirstDayOfYearsAround(firstDayOfBaseYearOfCalendar: UTCDate, baseYearOfCalendar: number, firstYearOfCalendarOfYearsAround: number, lang: HxLanguageCode): UTCDate {
		const yearOffset = firstYearOfCalendarOfYearsAround - baseYearOfCalendar;

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
	 * Shapes a year cell from the first day of the calendar year.
	 *
	 * <p>The label is composed via the injected {@code labelOfYear} so years
	 * before the era (e.g. Before-Saka or pre-Islamic Persian years) carry the
	 * era prefix. These calendars are continuous with no year-0 gap, so the
	 * cell offset is the plain year difference.</p>
	 *
	 * @param firstDayOfYear        - the first day of the cell's calendar year
	 * @param baseYearOfCalendar    - the base year of calendar
	 * @param currentYearOfCalendar - the current year of calendar
	 * @param labelOfYear           - composes the cell label from the era and year
	 * @param lang                  - locale code
	 * @returns the computed year cell
	 */
	static asComputedYear(
		firstDayOfYear: HxDate, baseYearOfCalendar: number, currentYearOfCalendar: number,
		labelOfYear: (value: HxDate, era: string, year: string, lang: HxLanguageCode) => string,
		lang: HxLanguageCode): ComputedYear {
		const value = DateMoveUtils.asJsDate(firstDayOfYear);
		const [eraOfCalendar, yearOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(value, lang, false);

		return {
			key: `${firstDayOfYear.year}-${firstDayOfYear.month}-${firstDayOfYear.day}`,
			label: labelOfYear(firstDayOfYear, eraOfCalendar, '' + yearOfCalendar, lang),
			value,
			offset: yearOfCalendar - baseYearOfCalendar,
			thisYear: yearOfCalendar === currentYearOfCalendar
		};
	}
}
