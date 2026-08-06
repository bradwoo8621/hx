import {DateInternalUtils} from '../internal';
import {DateMoveAnyMonthsProvider, type DateMoveYearOffsetAndTargetMonthOfCalendar} from '../months-any';

export abstract class DateMove12MonthsProvider extends DateMoveAnyMonthsProvider {
	protected constructor() {
		super();
	}

	protected computeYearOffsetAndTargetMonth(monthOfCalendar: number, monthOffset: number): DateMoveYearOffsetAndTargetMonthOfCalendar {
		return DateInternalUtils.computeYearOffsetAndTargetMonthOfCalendarOn12Months(monthOfCalendar, monthOffset);
	}
}
