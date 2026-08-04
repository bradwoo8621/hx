import type {HxLanguageCode} from '../../../contexts';
import {DateUtils} from '../facade';
import type {MoveDate} from '../interfaces';
import {DateMove13MonthsProvider} from './date-move-13-months';

export abstract class DateMoveCopticAndEthiopicUtils extends DateMove13MonthsProvider {
	protected constructor() {
		super();
	}

	/**
	 * Count the number of days from the start of year 1 (1/01/01) to the start
	 * of the given calendar date. Shared by both Coptic (Anno Martyrum) and
	 * Ethiopic (Anno Incarnationis) — used only for positive-era years.
	 *
	 * @param targetOfCalendar - target date as {@code {year, month, day}}, year > 0
	 * @returns number of days from year 1/01/01 to the target date
	 */
	protected countDaysFromEpochTo(targetOfCalendar: MoveDate): number {
		const {year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar} = targetOfCalendar;
		// Full years before the target year: [1, year-1], all Anno Incarnationis.
		// A Ethiopic leap year is year ≡ 3 (mod 4) in this era.
		// Leap years in Anno Incarnationis are 3, 7, 11, … = 4k − 1 (k ≥ 1).
		// In range [1, N], the count is floor((N + 1) / 4) = floor(year / 4)
		// when N = year − 1.
		const yearsBefore = targetYearOfCalendar - 1;
		const leapYearCount = Math.floor(targetYearOfCalendar / 4);

		// Every year contributes 365 base days; leap years contribute 1 extra.
		let totalDays = yearsBefore * 365 + leapYearCount;

		// Days within the target year up to (but not including) the target date.
		// Months 1–12 each have 30 days. Month 13 days are handled separately
		// by computeTargetMonthAndDayOfCalendar before this is called.
		totalDays += (targetMonthOfCalendar - 1) * 30;
		totalDays += (targetDayOfCalendar - 1);

		return totalDays;
	}

	/**
	 * Checks whether the previous month is navigable in the Coptic or Ethiopic
	 * calendar.
	 *
	 * <p>Both calendars are bounded at Gregorian 0001/01/01 — Coptic
	 * −284/05/08 and Ethiopic 5493/05/08. Month 6 starts at Gregorian
	 * 0001/01/24 in both calendars, so the threshold accounts for the 23-day
	 * window in January of year 1 where the first displayed day still falls
	 * in month 5 (month 4 would map to dates before the epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous month exists
	 */
	isPreviousMonthAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 1) || (year === 1 && month === 1 && day > 23);
	}

	/**
	 * Checks whether the previous year is navigable in the Coptic or Ethiopic
	 * calendar.
	 *
	 * <p>Both calendars are bounded at Gregorian 0001/01/01 — Coptic
	 * −284/05/08 and Ethiopic 5493/05/08. The next year (Coptic −283,
	 * Ethiopic 5494) starts at Gregorian 0001/08/27, so the threshold accounts
	 * for the 26-day window in August of year 1 where the first displayed day
	 * still falls in the earliest year (year −285 or 5492 would map to dates
	 * before the epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous year exists
	 */
	isPreviousYearAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 8) || (year === 1 && month === 8 && day > 26);
	}
}
