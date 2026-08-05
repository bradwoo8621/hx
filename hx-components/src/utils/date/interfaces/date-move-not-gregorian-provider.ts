import type {HxLanguageCode} from '../../../contexts';
import type {MoveDate} from './date-types';

export interface DateMoveNotGregorianProvider {
	/**
	 * Checks whether the given locale should use this non-Gregorian calendar for move/navigation operations.
	 *
	 * @param lang - locale code (e.g. {@code 'zh-TW'}, {@code 'th-TH'})
	 * @returns {@code true} if this calendar applies to the locale
	 */
	accept(lang: HxLanguageCode): boolean;
	/**
	 * Move a Gregorian date by the given number of years in this non-Gregorian calendar.
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @param lang       - locale, used to format the date in the calendar's representation
	 * @returns the moved date in Gregorian
	 */
	moveYear(date: MoveDate, yearOffset: number, lang: HxLanguageCode): MoveDate;
	/**
	 * Move a Gregorian date by the given number of months in this non-Gregorian calendar.
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @param lang        - locale, used to format the date in the calendar's representation
	 * @returns the moved date in Gregorian
	 */
	moveMonth(date: MoveDate, monthOffset: number, lang: HxLanguageCode): MoveDate;
	/**
	 * Tells the datetime input popup whether the previous year should be navigable from the given
	 * first day of the current month.
	 *
	 * <p>Only needs to be specified when the calendar's year/month/day
	 * boundaries do not align with Gregorian (e.g. the initial partial year of the
	 * Saka or Persian calendar).</p>
	 */
	isPreviousYearAllowed?(lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean;
	/**
	 * Tells the datetime input popup whether the next year should be navigable from the given
	 * last day of the current month.
	 *
	 * <p>Only needs to be specified when the calendar's year/month/day
	 * boundaries do not align with Gregorian (e.g. the final partial year of the
	 * Saka or Persian calendar).</p>
	 */
	isNextYearAllowed?(lang: HxLanguageCode, lastDayOfCurrentMonthOfGregory: Date): boolean;
	/**
	 * Tells the datetime input popup whether the previous month should be navigable from the given
	 * first day of the current month.
	 *
	 * <p>Only needs to be specified when the calendar's year/month/day
	 * boundaries do not align with Gregorian (e.g. the initial partial year
	 * of the Saka or Persian calendar where months 1–9 do not exist).</p>
	 */
	isPreviousMonthAllowed?(lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean;
	/**
	 * Tells the datetime input popup whether the next month should be navigable from the given
	 * last day of the current month.
	 *
	 * <p>Only needs to be specified when the calendar's year/month/day
	 * boundaries do not align with Gregorian (e.g. the final partial year
	 * of the Saka or Persian calendar where months 10–12 do not exist).</p>
	 */
	isNextMonthAllowed?(lang: HxLanguageCode, lastDayOfCurrentMonthOfGregory: Date): boolean;
}
