import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleUtils, DateUtils} from '../facade';
import type {DateMoveNotGregorianProvider, MoveDate} from '../interfaces';

/**
 * Identifies which side of the era boundary the target year falls on.
 *
 * <p>Used by calendars whose era transition affects the Gregorian mapping
 * (e.g. Coptic Anno Martyrum / Before Diocletian, Ethiopic Anno Incarnationis /
 * Before Incarnation).</p>
 *
 * - {@code 'before'} — Before the era boundary (negative era)
 * - {@code 'after'}  — After the era boundary (positive era)
 */
export type DateMoveEraOfTargetYearOfCalendar = 'before' | 'after';
export type DateMoveTargetYearOfCalendar = [DateMoveEraOfTargetYearOfCalendar, number];
export type DateMoveYearOffsetAndTargetMonthOfCalendar = { yearOffset: number; targetMonthOfCalendar: number };
export type DateMoveTargetMonthAndDayOfCalendar = { targetMonthOfCalendar: number; targetDayOfCalendar: number };

/**
 * Shared move (year/month) logic for non-Gregorian calendars with an arbitrary
 * number of months per year.
 *
 * <p>Subclasses must implement four abstract methods:
 * {@link accept}, {@link computeTargetYearOfCalendar},
 * {@link computeTargetMonthAndDayOfCalendar}, and {@link moveDateTo}.</p>
 */
export abstract class DateMoveAnyMonthsProvider implements DateMoveNotGregorianProvider {
	protected constructor() {
	}

	/**
	 * Checks whether the given locale should use this calendar for move/navigation operations.
	 *
	 * @param lang - locale code
	 * @returns {@code true} when this calendar applies to the locale
	 */
	abstract accept(lang: HxLanguageCode): boolean;

	/**
	 * Computes the target calendar year after applying a year offset.
	 *
	 * @param _date          - Gregorian date (used for era-boundary detection by some calendars)
	 * @param yearOfCalendar - current calendar year
	 * @param yearOffset     - number of years to move (positive = forward, negative = backward)
	 * @returns a tuple of {@code [era, year]} where {@code era} is
	 *          {@code 'before'} or {@code 'after'} the era boundary, and
	 *          {@code year} is the clamped target calendar year
	 */
	protected abstract computeTargetYearOfCalendar(_date: MoveDate, yearOfCalendar: number, yearOffset: number): DateMoveTargetYearOfCalendar;

	/**
	 * Clamps the target month and day to valid ranges for this calendar.
	 *
	 * <p>Subclasses should handle partial initial years (earliest representable date),
	 * month-length variations, and leap-year adjustments.</p>
	 *
	 * @param targetYearOfCalendar       - target calendar year
	 * @param monthOfCalendar            - desired month (1-based)
	 * @param dayOfCalendar              - desired day of month
	 * @param eraOfTargetYearOfCalendar  - which era the target year belongs to
	 * @returns the clamped target month and day
	 */
	protected abstract computeTargetMonthAndDayOfCalendar(targetYearOfCalendar: number, monthOfCalendar: number, dayOfCalendar: number, eraOfTargetYearOfCalendar: DateMoveEraOfTargetYearOfCalendar): DateMoveTargetMonthAndDayOfCalendar;

	/**
	 * Map a calendar date to its equivalent Gregorian date.
	 *
	 * @param targetOfCalendar           - calendar date as {@code {year, month, day}}
	 * @param eraOfTargetYearOfCalendar  - which era the target year belongs to
	 * @returns equivalent Gregorian date
	 */
	protected abstract moveDateTo(targetOfCalendar: MoveDate, eraOfTargetYearOfCalendar: DateMoveEraOfTargetYearOfCalendar): MoveDate;

	/**
	 * Move a Gregorian date by the given number of years in this non-Gregorian calendar.
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @param lang       - locale, used to format the date in the calendar's representation
	 * @returns the moved date in Gregorian
	 */
	moveYear(date: MoveDate, yearOffset: number, lang: HxLanguageCode): MoveDate {
		if (yearOffset === 0) {
			return {...date};
		}

		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(DateUtils.asJsDate(date), lang, false);
		const [eraOfTargetYearOfCalendar, targetYearOfCalendar] = this.computeTargetYearOfCalendar(date, yearOfCalendar, yearOffset);
		// compute target month and day of calendar
		const {
			targetMonthOfCalendar, targetDayOfCalendar
		} = this.computeTargetMonthAndDayOfCalendar(targetYearOfCalendar, monthOfCalendar, dayOfCalendar, eraOfTargetYearOfCalendar);

		return this.moveDateTo({
			year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar
		}, eraOfTargetYearOfCalendar);
	}

	protected abstract computeYearOffsetAndTargetMonth(monthOfCalendar: number, monthOffset: number): DateMoveYearOffsetAndTargetMonthOfCalendar;

	/**
	 * Move a Gregorian date by the given number of months in this non-Gregorian calendar.
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @param lang        - locale, used to format the date in the calendar's representation
	 * @returns the moved date in Gregorian
	 */
	moveMonth(date: MoveDate, monthOffset: number, lang: HxLanguageCode): MoveDate {
		if (monthOffset === 0) {
			return {...date};
		}

		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(DateUtils.asJsDate(date), lang, false);
		// compute target year/month of calendar
		const {
			yearOffset, targetMonthOfCalendar: tryToTargetMonthOfCalendar
		} = this.computeYearOffsetAndTargetMonth(monthOfCalendar, monthOffset);
		const [eraOfTargetYearOfCalendar, targetYearOfCalendar] = this.computeTargetYearOfCalendar(date, yearOfCalendar, yearOffset);
		// compute target month and day of calendar
		const {
			targetMonthOfCalendar, targetDayOfCalendar
		} = this.computeTargetMonthAndDayOfCalendar(targetYearOfCalendar, tryToTargetMonthOfCalendar, dayOfCalendar, eraOfTargetYearOfCalendar);
		return this.moveDateTo({
			year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar
		}, eraOfTargetYearOfCalendar);
	}
}
