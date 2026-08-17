import {DateInternalUtils} from '../internal';
import {DateMoveAnyMonthsProvider, type DateMoveYearOffsetAndTargetMonthOfCalendar} from '../months-any';

export abstract class DateMove12MonthsProvider extends DateMoveAnyMonthsProvider {
	/**
	 * Prevents external instantiation; subclasses provide the calendar logic.
	 */
	protected constructor() {
		super();
	}

	/**
	 * Computes the target calendar year offset and month after applying a month
	 * offset, for calendars with 12 months per year.
	 *
	 * @param monthOfCalendar - current calendar month (1-based)
	 * @param monthOffset     - number of months to move (positive = forward, negative = backward)
	 * @returns the year offset and the target month of calendar (1–12)
	 */
	protected computeYearOffsetAndTargetMonth(monthOfCalendar: number, monthOffset: number): DateMoveYearOffsetAndTargetMonthOfCalendar {
		return DateInternalUtils.computeYearOffsetAndTargetMonthOfCalendarOn12Months(monthOfCalendar, monthOffset);
	}
}
