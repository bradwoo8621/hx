import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleUtils} from '../facade';
import type {DateLocaleNotGregorianProvider, MoveDate} from '../interfaces';
import type {DateMoveTargetYearOfCalendar} from '../months-any';
import {DateMove12MonthsProvider} from './date-move-12-months';

export abstract class DateMoveIslamicSharedUtils extends DateMove12MonthsProvider implements DateLocaleNotGregorianProvider {
	/**
	 * Computes the target Islamic year after applying an offset.
	 *
	 * <p>The Islamic year numbering includes year 0 (…, −1, 0, 1, …),
	 * so no era-boundary compensation is needed. The target year is
	 * simply {@code yearOfCalendar + yearOffset}, clamped to ≥ −640
	 * (the earliest representable Islamic year, corresponding to
	 * Gregorian 0001/01/01) and ≤ 9666 (the last representable Islamic
	 * year, corresponding to Gregorian 9999/12/31).</p>
	 *
	 * @param _date          - Gregorian date (unused)
	 * @param yearOfCalendar - current Islamic year
	 * @param yearOffset     - number of years to advance (positive) or retreat (negative)
	 * @returns the target Islamic year, ≥ −640 and ≤ 9666
	 */
	protected computeTargetYearOfCalendar(_date: MoveDate, yearOfCalendar: number, yearOffset: number): DateMoveTargetYearOfCalendar {
		const targetYearOfCalendar = Math.min(9666, Math.max(-640, yearOfCalendar + yearOffset));
		return [targetYearOfCalendar > 0 ? 'after' : 'before', targetYearOfCalendar];
	}

	protected abstract getDaysOfFirstCalendarYear(): number;

	protected abstract getDaysOfPastMonthsOfFirstCalendarYear(monthOfCalendar: number): number;

	protected moveDateTo(targetOfCalendar: MoveDate, lang: HxLanguageCode): MoveDate {
		const {year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar} = targetOfCalendar;

		if (targetYearOfCalendar > -640) {
			// move year first
			// set start date of gregory
			const date = new Date();
			date.setFullYear(1, 0, 1);
			// compute the jumping days
			let days = this.getDaysOfFirstCalendarYear();
			const yearsBefore = targetYearOfCalendar + 640 - 1;
			// assume 2/3 is 354 days, and 1/3 is 355 days.
			days += yearsBefore * 354 + Math.floor(yearsBefore / 3);
			// first move
			date.setDate(days - 1);
			// get date of calendar after moving
			let [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
			// check year
			while (yearOfCalendar !== targetYearOfCalendar) {
				const daysToMonth1 = dayOfCalendar + (monthOfCalendar - 1) * 29;
				if (yearOfCalendar < targetYearOfCalendar) {
					const years = targetYearOfCalendar - yearOfCalendar;
					// assume 2/3 is 354 days, and 1/3 is 355 days.
					const daysToTargetYear = years * 354 + Math.floor(years / 3);
					// back to someday of first month, and add days of these years
					date.setDate(date.getDate() - daysToMonth1 + 1 + daysToTargetYear);
				} else {
					const daysToTargetYear = (yearOfCalendar - targetYearOfCalendar) * 353;
					// back to someday of first month, and minus days of these years
					// note here count 353 days for each year, to make sure not overshooting
					date.setDate(date.getDate() - daysToMonth1 + 1 - daysToTargetYear);
				}
				[, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
			}
			// now year matched
			if (monthOfCalendar < targetMonthOfCalendar) {
				// max add 11 months, count 30 days for each month
				// backward to day 1, and add days of months
				// always jump to target month by one shoot!
				date.setDate(date.getDate() - dayOfCalendar + 1 + (targetMonthOfCalendar - monthOfCalendar) * 30);
			} else if (monthOfCalendar > targetMonthOfCalendar) {
				// max minus 11 months, count 29 days for each month
				// forward to day 28, and minus days of months
				// always jump to target month by one shoot!
				date.setDate(date.getDate() + (28 - dayOfCalendar) - (monthOfCalendar - targetMonthOfCalendar) * 29);
			}
			[, , monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
			// no year and month matched
			if (dayOfCalendar >= targetDayOfCalendar) {
				// target day is available, move
				date.setDate(date.getDate() - (dayOfCalendar - targetDayOfCalendar));
			} else if (targetDayOfCalendar === 30) {
				// check the day 30 is available
				date.setDate(date.getDate() + (30 - dayOfCalendar));
				const [, , triedMonthOfCalendar] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
				if (triedMonthOfCalendar !== monthOfCalendar) {
					// not available, backward 1 day
					date.setDate(date.getDate() - 1);
				}
			} else {
				date.setDate(date.getDate() + (targetDayOfCalendar - dayOfCalendar));
			}

			return {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
		} else {
			const daysOfPastMonths = this.getDaysOfPastMonthsOfFirstCalendarYear(targetMonthOfCalendar);
			const date = new Date();
			date.setFullYear(1, 0, 1);
			date.setDate(daysOfPastMonths + targetOfCalendar.day);
			return {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
		}
	}
}
