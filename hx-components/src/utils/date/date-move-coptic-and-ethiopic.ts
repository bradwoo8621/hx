import type {MoveDate} from './date-types.ts';

export class DateMoveCopticAndEthiopicUtils {
	/**
	 * Count the number of days from the start of year 1 (1/01/01) to the start
	 * of the given calendar date. Shared by both Coptic (Anno Martyrum) and
	 * Ethiopic (Anno Incarnationis) — used only for positive-era years.
	 *
	 * @param targetOfCalendar - target date as {@code {year, month, day}}, year > 0
	 * @returns number of days from year 1/01/01 to the target date
	 */
	static countDaysFromEpochTo(targetOfCalendar: MoveDate): number {
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
}
