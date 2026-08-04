import type {HxLanguageCode} from '../../contexts';
import {DateMoveInternalUtils} from './date-move-internal';
import type {MoveDate} from './date-types';

export type GregoryAndJulianMovementRanges = {
	// follow functions will be executed in a fixed order
	isOrAfter158211: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	is158210: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween150003_158209: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween140003_150002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween130003_140002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween110003_130002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween100003_110002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween090003_100002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween070003_090002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween060003_070002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween050003_060002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween030003_050002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	is030002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween020003_030001: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween010003_020002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	is000101: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	// isOrBetween000102_010002 is else, no need to provide
	toGregoryYear: (yearOfCalendar: number) => number;
};

export abstract class DateMoveGregoryAndJulianUtils {
	protected constructor() {
	}

	/**
	 * Clamp a day number to the valid range for a Gregorian/Julian calendar month.
	 *
	 * @param targetYearOfCalendar  - calendar year
	 * @param targetMonthOfCalendar - calendar month (1–12)
	 * @param dayOfCalendar         - desired day of month
	 * @param leap                  - leap-year predicate for the target calendar
	 * @returns the day clamped to the maximum for the target month
	 */
	protected computeTargetDayOfCalendarWithLeapCheck(
		targetYearOfCalendar: number, targetMonthOfCalendar: number, dayOfCalendar: number,
		leap: (yearOfCalendar: number) => boolean
	): number {
		if ([1, 3, 5, 7, 8, 10, 12].includes(targetMonthOfCalendar)) {
			return dayOfCalendar;
		} else if ([4, 6, 9, 11].includes(targetMonthOfCalendar)) {
			return Math.min(dayOfCalendar, 30);
		} else if (leap(targetYearOfCalendar)) {
			return Math.min(dayOfCalendar, 29);
		} else {
			return Math.min(dayOfCalendar, 28);
		}
	}

	/**
	 * Map a calendar date to its equivalent Gregorian date, accounting for the
	 * Julian–Gregorian offset that accumulated over twelve century-years before
	 * the 1582 reform.
	 *
	 * Uses the provided {@code ranges} object to determine the offset region and
	 * to convert the calendar year to the Gregorian year.
	 *
	 * @param targetOfCalendar - calendar date as {@code {year, month, day}}
	 * @param ranges           - region predicates and year conversion callback
	 * @returns equivalent Gregorian date
	 */
	protected moveDateToWithRanges(targetOfCalendar: MoveDate, ranges: GregoryAndJulianMovementRanges): MoveDate {
		type Movement = {
			type: 'assign' | 'date';
			year: number;
			/** month is gregory month + 1 (starts from 1) */
			month: number;
			day: number;
		};

		const {year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar} = targetOfCalendar;
		// move!
		let movement: Movement;
		// after 1582/11 (includes): exactly same as gregory
		if (ranges.isOrAfter158211(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'assign',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetOfCalendar.month, day: targetOfCalendar.day
			};
		}
		// 1582/10, calendar month has 21 days (has no day 5-14), gregory is from 1582/10/11 to 1582/10/31
		else if (ranges.is158210(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'assign',
				year: 1582, month: 10,
				day: targetDayOfCalendar <= 4 ? (10 + targetDayOfCalendar) : (targetDayOfCalendar <= 14 ? 14 : targetDayOfCalendar)
			};
		}
		// 1500/03 to 1582/09, calendar (month x/day y) -> gregory (month x/day y + 10)
		else if (ranges.isOrBetween150003_158209(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 10
			};
		}
		// 1400/03 to 1500/02, calendar (month x/day y) -> gregory (month x/day y + 9)
		else if (ranges.isOrBetween140003_150002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 9
			};
		}
		// 1300/03 to 1400/02, calendar (month x/day y) -> gregory (month x/day y + 8)
		else if (ranges.isOrBetween130003_140002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 8
			};
		}
		// 1100/03 to 1300/02, calendar (month x/day y) -> gregory (month x/day y + 7)
		else if (ranges.isOrBetween110003_130002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 7
			};
		}
		// 1000/03 to 1100/02, calendar (month x/day y) -> gregory (month x/day y + 6)
		else if (ranges.isOrBetween100003_110002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 6
			};
		}
		// 900/03 to 1000/02, calendar (month x/day y) -> gregory (month x/day y + 5)
		else if (ranges.isOrBetween090003_100002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 5
			};
		}
		// 700/03 to 900/02, calendar (month x/day y) -> gregory (month x/day y + 4)
		else if (ranges.isOrBetween070003_090002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 4
			};
		}
		// 600/03 to 700/02, calendar (month x/day y) -> gregory (month x/day y + 3)
		else if (ranges.isOrBetween060003_070002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 3
			};
		}
		// 500/03 to 600/02, calendar (month x/day y) -> gregory (month x/day y + 2)
		else if (ranges.isOrBetween050003_060002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 2
			};
		}
		// 300/03 to 500/02, calendar (month x/day y) -> gregory (month x/day y + 1)
		else if (ranges.isOrBetween030003_050002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 1
			};
		}
		// 300/02 29 days, gregory 300/02 28 days. calendar 2/1-28 -> gregory 2/1-28; calendar 2/29 -> gregory 3/1
		else if (ranges.is030002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {type: 'date', year: 300, month: 2, day: targetDayOfCalendar};
		}
		// 200/03 to 300/01, calendar is same as gregory exactly
		else if (ranges.isOrBetween020003_030001(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'assign',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetOfCalendar.month, day: targetOfCalendar.day
			};
		}
		// 100/03 to 200/02, calendar (month x/day y) -> gregory (month x/day y - 1)
		else if (ranges.isOrBetween010003_020002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar - 1
			};
		}
		// 0001/01, days from 3-31, reset to 3 if given day of calendar is less than 3. calendar (month x/day y) -> gregory (month x/day y - 2)
		else if (ranges.is000101(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'assign',
				year: 1, month: 1, day: (targetDayOfCalendar < 3 ? 3 : targetDayOfCalendar) - 2
			};
		}
		// 0001/02 to 100/02, calendar (month x/day y) -> gregory (month x/day y - 2)
		else {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar - 2
			};
		}

		switch (movement.type) {
			case 'assign': {
				const moved = {year: movement.year, month: movement.month, day: movement.day};
				DateMoveInternalUtils.fixDayWhenOverLastDayOfMonth(moved);
				return moved;
			}
			case 'date':
			default: {
				let toDate: Date;
				const year = movement.year;
				if (year < 100) {
					toDate = new Date();
					toDate.setFullYear(year, movement.month - 1, movement.day);
				} else {
					toDate = new Date(year, movement.month - 1, movement.day);
				}
				return {
					year: toDate.getFullYear(),
					month: toDate.getMonth() + 1,
					day: toDate.getDate()
				};
			}
		}
	}

	/**
	 * Checks whether the previous month is navigable for calendars that use
	 * the Gregorian/Julian offset table (Japanese, Minguo, Buddhist).
	 *
	 * <p>The boundary is the epoch itself (0001/01/01) plus a 29-day window
	 * in January of year 1. This accounts for the day-offset between the
	 * calendar and Gregorian — e.g. Buddhist month 2 starts on Gregorian
	 * 1/01/30, so its "previous month" button should be enabled even though
	 * it falls in January of year 1.</p>
	 *
	 * @param _lang                            - locale (unused)
	 * @param firstDayOfCurrentMonthOfGregory  - the Gregorian {@code Date} of
	 *                                            the first day of the current month
	 * @returns {@code true} when the previous month is allowed
	 */
	isPreviousMonthAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean {
		const {year, month, day} = DateMoveInternalUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 1) || (year === 1 && month === 1 && day > 29);
	}

	/**
	 * Checks whether the previous year is navigable for calendars that use
	 * the Gregorian/Julian offset table (Japanese, Minguo, Buddhist).
	 *
	 * <p>The boundary is late December of year 1 — calendars whose next year
	 * starts on Gregorian 1/12/30 or later have a valid previous year. For
	 * example, Buddhist year 2 starts on Gregorian 1/12/30, so year 1 is a
	 * valid "previous year" from year 2.</p>
	 *
	 * @param _lang                            - locale (unused)
	 * @param firstDayOfCurrentMonthOfGregory  - the Gregorian {@code Date} of
	 *                                            the first day of the current month
	 * @returns {@code true} when the previous year is allowed
	 */
	isPreviousYearAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean {
		const {year, month, day} = DateMoveInternalUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month === 12 && day > 29);
	}
}