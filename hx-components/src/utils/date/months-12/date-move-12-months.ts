import {DateInternalUtils} from '../internal';
import {DateMoveAnyMonthsProvider} from '../months-any';

export abstract class DateMove12MonthsProvider extends DateMoveAnyMonthsProvider {
	protected constructor() {
		super();
	}

	protected computeYearOffsetAndTargetMonth(
		monthOfCalendar: number, monthOffset: number
	): { yearOffset: number, targetMonthOfCalendar: number } {
		return DateInternalUtils.computeYearOffsetAndTargetMonthOfCalendarOn12Months(monthOfCalendar, monthOffset);
	}
}
