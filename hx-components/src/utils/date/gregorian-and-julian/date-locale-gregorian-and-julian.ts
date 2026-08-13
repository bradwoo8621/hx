import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleFormatUtils, DateLocaleGregorianProvider, DateMoveUtils, UTCDate} from '../facade';
import type {ComputedMonths} from '../interfaces';

/**
 * Shared months-panel implementation for Gregorian-and-Julian calendars.
 *
 * <p>Calendars in this family already extend {@link DateMoveGregorianAndJulianProvider}
 * for move operations, so — since single inheritance forbids a second base class —
 * the locale side is provided as a static utility that subclasses delegate to.</p>
 */
export class DateLocaleGregorianAndJulianHelper {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Computes the 12-month grid for the months panel in a Gregorian-and-Julian calendar.
	 *
	 * <p>Delegates to the Gregorian provider when the Gregorian calendar is in use.
	 * The reference day is moved back to stay within the calendar month of the given
	 * date; the 1582/10 short month (21 days, days 5-14 skipped by the Gregorian
	 * reform) is handled so the reference day remains inside the month.</p>
	 *
	 * @param date      - the reference date; its year and month determine the grid and the offsets
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the 12 months of the reference date's year
	 */
	static monthsOfYear(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		if (gregorian) {
			return DateLocaleGregorianProvider.monthsOfYear(date, lang);
		}

		// month is 1-12
		const [, , month, day] = DateLocaleFormatUtils.formatDateInNumeric(date, lang, false);
		// move to first day of given date's month.
		// handle the short month of 1582/10
		const daysToFirstDay = (date.getFullYear() === 1582 && date.getMonthIndex() === 9 && day > 4) ? (day - 11) : (day - 1);
		const firstDayOfMonth = date.setDayOfMonth(date.getDayOfMonth() - daysToFirstDay);
		const baseDay = DateMoveUtils.asHxDate(firstDayOfMonth);
		return new Array(12)
			.fill(1)
			// compute offset to given month
			.map((_, index) => index - month + 1)
			.map(offset => {
				const firstDayOfThisMonth = DateMoveUtils.moveMonth(baseDay, offset, lang, false);
				const value = DateMoveUtils.asJsDate(firstDayOfThisMonth);
				return {
					key: `${firstDayOfThisMonth.year}-${firstDayOfThisMonth.month}-${firstDayOfThisMonth.day}`,
					label: DateLocaleFormatUtils.formatMonthShort(value, lang, gregorian),
					value,
					offset,
					bc: false,
					y10k: false
				};
			});
	}
}
