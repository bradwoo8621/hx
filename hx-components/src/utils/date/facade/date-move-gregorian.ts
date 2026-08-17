import {DateUtils, UTCDate} from '../facade';
import type {HxDate} from '../interfaces';

export class DateMoveGregorianProvider {
	/**
	 * Prevents direct instantiation; all members are accessed statically.
	 */
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Move a Gregorian date by the given number of years.
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @returns the moved date with year clamped to [1, 9999] and day
	 *          clamped to the last valid day of the target month
	 */
	static moveYear(date: HxDate, yearOffset: number): HxDate {
		const moved = {...date};

		moved.year = Math.min(9999, Math.max(1, moved.year + yearOffset));
		DateUtils.fixDayWhenOverLastDayOfMonth(moved);
		return moved;
	}

	/**
	 * Move a Gregorian date by the given number of months.
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @returns the moved date with year clamped to [1, 9999] and day
	 *          clamped to the last valid day of the target month
	 */
	static moveMonth(date: HxDate, monthOffset: number): HxDate {
		const moved = {...date};

		const targetMonth = moved.month + monthOffset;
		if (monthOffset > 0) {
			// target month:
			// <= 12 -> keep year
			// > 12 and <= 24 -> year + 1
			// ...
			moved.year = moved.year + Math.floor((targetMonth - 1) / 12);
			// target month:
			// 2 - 11 -> mod 12
			// 12 -> mod 12 + 12
			// 13 - 23 -> mod 12
			// 24 -> mod 12 + 12
			// ...
			moved.month = targetMonth % 12;
			moved.month = moved.month === 0 ? 12 : moved.month;
		} else if (targetMonth >= 1) {
			// keep year and use target month directly
			moved.month = targetMonth;
		} else {
			// target month:
			// 0 - -11 -> year - 1
			// -12 - -23 -> year - 2
			// ...
			moved.year = moved.year + Math.floor((targetMonth - 1) / 12);
			// target month:
			// 0 - -11 -> 12 + mod 12
			// -12 - -23 -> 12 + mod 12
			// ...
			moved.month = 12 + targetMonth % 12;
		}

		moved.year = Math.min(9999, Math.max(1, moved.year));

		DateUtils.fixDayWhenOverLastDayOfMonth(moved);
		return moved;
	}

	/**
	 * Checks whether the previous year is navigable from the given first day of the current month.
	 *
	 * <p>Year 1 has no previous year (there is no year 0 in the Gregorian calendar).</p>
	 *
	 * @param firstDayOfCurrentMonthOfGregory - the Gregorian {@code Date} of the first day of the current month
	 * @returns {@code true} when the previous year is allowed
	 */
	static isPreviousYearAllowed(firstDayOfCurrentMonthOfGregory: UTCDate): boolean {
		return firstDayOfCurrentMonthOfGregory.getFullYear() > 1;
	}

	/**
	 * Checks whether the next year is navigable from the given last day of the current month.
	 *
	 * <p>Year 9999 has no next year (the Gregorian calendar is bounded at 9999/12/31).</p>
	 *
	 * @param lastDayOfCurrentMonthOfGregory - the Gregorian {@code Date} of the last day of the current month
	 * @returns {@code true} when the next year is allowed
	 */
	static isNextYearAllowed(lastDayOfCurrentMonthOfGregory: UTCDate): boolean {
		return lastDayOfCurrentMonthOfGregory.getFullYear() < 9999;
	}

	/**
	 * Checks whether the previous month is navigable from the given first day of the current month.
	 *
	 * <p>The only boundary is the epoch itself — 0001/01/01. Year 1 January has no previous month.</p>
	 *
	 * @param firstDayOfCurrentMonthOfGregory - the Gregorian {@code Date} of the first day of the current month
	 * @returns {@code true} when the previous month is allowed
	 */
	static isPreviousMonthAllowed(firstDayOfCurrentMonthOfGregory: UTCDate): boolean {
		return firstDayOfCurrentMonthOfGregory.getFullYear() > 1 || firstDayOfCurrentMonthOfGregory.getMonthIndex() > 0;
	}

	/**
	 * Checks whether the next month is navigable from the given last day of the current month.
	 *
	 * <p>The only boundary is 9999/12/31. December of year 9999 has no next month.</p>
	 *
	 * @param lastDayOfCurrentMonthOfGregory - the Gregorian {@code Date} of the last day of the current month
	 * @returns {@code true} when the next month is allowed
	 */
	static isNextMonthAllowed(lastDayOfCurrentMonthOfGregory: UTCDate): boolean {
		return lastDayOfCurrentMonthOfGregory.getFullYear() < 9999 || lastDayOfCurrentMonthOfGregory.getMonthIndex() < 11;
	}
}