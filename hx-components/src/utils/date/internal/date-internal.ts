export class DateInternalUtils {
	/**
	 * Prevents direct instantiation; all members are accessed statically.
	 */
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Compute the target calendar year offset and month after applying a month
	 * offset, handling month wrap-around (positive and negative).
	 *
	 * @param monthOfCalendar - current calendar month (1-based)
	 * @param monthOffset     - number of months to move (positive = forward, negative = backward)
	 * @returns the year offset and the target month (1–12)
	 */
	static computeYearOffsetAndTargetMonthOfCalendarOn12Months(
		monthOfCalendar: number, monthOffset: number
	): { yearOffset: number, targetMonthOfCalendar: number } {
		// compute target year/month of calendar
		let yearOffset: number;
		let targetMonthOfCalendar = monthOfCalendar + monthOffset;
		if (targetMonthOfCalendar > 0) {
			// target month: 1 - 12 -> 1 - 12; 13 - 24 -> 1 - 12, etc.
			// year offset: 1 - 12 -> 0; 13 - 24 -> 1, etc.
			yearOffset = Math.floor((targetMonthOfCalendar - 1) / 12);
			targetMonthOfCalendar = (targetMonthOfCalendar - 1) % 12 + 1;
		} else {
			// target month: 0 - -11 -> 12 - 1; -12 - -23 -> 12 - 1, etc.
			// year offset: 0 - -11 -> -1; -12 - -23 -> -2, etc.
			yearOffset = Math.floor((targetMonthOfCalendar - 1) / 12);
			targetMonthOfCalendar = (targetMonthOfCalendar % 12) + 12;
		}

		return {yearOffset, targetMonthOfCalendar};
	}

	/**
	 * Compute the target calendar year offset and month after applying a month
	 * offset, handling month wrap-around (positive and negative).
	 *
	 * @param monthOfCalendar - current calendar month (1-based)
	 * @param monthOffset     - number of months to move (positive = forward, negative = backward)
	 * @returns the year offset and the target month (1–13)
	 */
	static computeYearOffsetAndTargetMonthOfCalendarOn13Months(
		monthOfCalendar: number, monthOffset: number
	): { yearOffset: number, targetMonthOfCalendar: number } {
		// compute target year/month of calendar
		let yearOffset: number;
		let targetMonthOfCalendar = monthOfCalendar + monthOffset;
		if (targetMonthOfCalendar > 0) {
			// target month: 1 - 13 -> 1 - 13; 14 - 26 -> 1 - 13, etc.
			// year offset: 1 - 13 -> 0; 14 - 26 -> 1, etc.
			yearOffset = Math.floor((targetMonthOfCalendar - 1) / 13);
			targetMonthOfCalendar = (targetMonthOfCalendar - 1) % 13 + 1;
		} else {
			// target month: 0 - -12 -> 13 - 1; -13 - -25 -> 13 - 1, etc.
			// year offset: 0 - -12 -> -1; -13 - -25 -> -2, etc.
			yearOffset = Math.floor((targetMonthOfCalendar - 1) / 13);
			targetMonthOfCalendar = (targetMonthOfCalendar % 13) + 13;
		}

		return {yearOffset, targetMonthOfCalendar};
	}

	/**
	 * Returns the number of Gregorian leap years in the range {@code [1, year - 1]}.
	 *
	 * <p>Uses the proleptic Gregorian rule: every 4th year is leap, except
	 * century years (÷100) which are only leap if also divisible by 400.
	 * This count is useful for converting a year to the number of days
	 * elapsed since the epoch (often paired with {@code year * 365} for a
	 * total day count).</p>
	 *
	 * @param year - the exclusive upper bound (must be ≥ 1)
	 * @returns number of leap years from year 1 up to {@code year - 1}
	 */
	static leapYearCountBefore(year: number): number {
		const base = year - 1;
		return Math.floor(base / 4) - Math.floor(base / 100) + Math.floor(base / 400);
	}
}