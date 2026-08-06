import {DateInternalUtils} from '../internal';
import {DateMoveAnyMonthsProvider, type DateMoveYearOffsetAndTargetMonthOfCalendar} from '../months-any';

export abstract class DateMove13MonthsProvider extends DateMoveAnyMonthsProvider {
	protected constructor() {
		super();
	}

	protected computeYearOffsetAndTargetMonth(monthOfCalendar: number, monthOffset: number): DateMoveYearOffsetAndTargetMonthOfCalendar {
		return DateInternalUtils.computeYearOffsetAndTargetMonthOfCalendarOn13Months(monthOfCalendar, monthOffset);
	}
}
