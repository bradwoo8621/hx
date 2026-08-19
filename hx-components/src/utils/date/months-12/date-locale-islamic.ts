import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleFormatUtils, DateLocaleNotGregorianHelper, DateUtils, UTCDate} from '../facade';
import type {ComputedMonth, ComputedMonths} from '../interfaces';

export class DateLocaleIslamicHelper {
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
	 * @param somedayOfMonth   - the reference date; modified in place to the first day of its calendar month
	 * @param offsetToBaseMonth - the month offset of the returned cell relative to the base month
	 * @param lang             - locale code
	 * @returns the computed month cell for the first day of the calendar month
	 */
	static asComputedMonth(somedayOfMonth: UTCDate, offsetToBaseMonth: number, lang: HxLanguageCode): ComputedMonth {
		const [, year, month, day] = DateLocaleFormatUtils.formatDateInNumeric(somedayOfMonth, lang, false);
		somedayOfMonth.setDayOfMonth(somedayOfMonth.getDayOfMonth() - (day - 1));
		const firstDayOfThisMonth = DateUtils.asHxDate(somedayOfMonth);
		const bc = year === -640 && month < 5;
		const y10k = year === 9666 && month > 4;
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
}
