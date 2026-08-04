export class DateMoveOnMonthUtils {
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
	): { yearOffset: number, tryToTargetMonthOfCalendar: number } {
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

		return {yearOffset, tryToTargetMonthOfCalendar: targetMonthOfCalendar};
	}
}
