import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleFormatUtils, DateMoveGregorianProvider, DateUtils, UTCDate} from '../facade';
import type {DateMoveNotGregorianProvider, HxDate} from '../interfaces';
import {DateInternalUtils} from '../internal';

/**
 * Region predicates and year conversion callback used by
 * {@link DateMoveGregorianAndJulianProvider#moveDateToWithRanges} to map a
 * non-Gregorian calendar date to its equivalent Gregorian date.
 *
 * <p>The predicates are evaluated in the order they are defined below.
 * Each predicate receives the calendar year and month and returns
 * {@code true} when the date falls within that offset region.
 * The final {@code else} branch (region 0001/02–0100/02) is implicit and
 * does not need a predicate.</p>
 */
export type GregoryAndJulianMovementRanges = {
	/** Calendar year ≥ 1582/11 — post-reform, same as Gregorian (offset 0). */
	isOrAfter158211: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/** Calendar month is 1582/10 — 21-day month, days 5–14 skipped (special). */
	is158210: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/** Calendar date in [1500/03, 1582/09] — offset +10. */
	isOrBetween150003_158209: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/** Calendar date in [1400/03, 1500/02] — offset +9. */
	isOrBetween140003_150002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/** Calendar date in [1300/03, 1400/02] — offset +8. */
	isOrBetween130003_140002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/** Calendar date in [1100/03, 1300/02] — offset +7. */
	isOrBetween110003_130002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/** Calendar date in [1000/03, 1100/02] — offset +6. */
	isOrBetween100003_110002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/** Calendar date in [0900/03, 1000/02] — offset +5. */
	isOrBetween090003_100002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/** Calendar date in [0700/03, 0900/02] — offset +4. */
	isOrBetween070003_090002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/** Calendar date in [0600/03, 0700/02] — offset +3. */
	isOrBetween060003_070002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/** Calendar date in [0500/03, 0600/02] — offset +2. */
	isOrBetween050003_060002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/** Calendar date in [0300/03, 0500/02] — offset +1. */
	isOrBetween030003_050002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/** Calendar month is 0300/02 — Julian 2/29 → Gregorian 3/1 (special). */
	is030002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/** Calendar date in [0200/03, 0300/01] — same as Gregorian (offset 0). */
	isOrBetween020003_030001: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/** Calendar date in [0100/03, 0200/02] — offset −1. */
	isOrBetween010003_020002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/** Calendar month is 0001/01 — days 1–2 clamped to 3, offset −2 (special). */
	is000101: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	/**
	 * Converts a calendar year to the equivalent Gregorian year.
	 *
	 * @param yearOfCalendar - the calendar year
	 * @returns the equivalent Gregorian year
	 */
	toGregoryYear: (yearOfCalendar: number) => number;
};

/**
 * Shared move (year/month) logic for non-Gregorian calendars that map to
 * Gregorian dates via a Julian–Gregorian offset table (Japanese, Minguo, Buddhist).
 *
 * <p>Subclasses provide a {@link GregoryAndJulianMovementRanges} table defining
 * the offset regions and must implement four abstract methods:
 * {@link computeTargetYearOfCalendar}, {@link computeTargetDayOfCalendar},
 * {@link moveDateTo}, and {@link accept}.</p>
 */
export abstract class DateMoveGregorianAndJulianProvider implements DateMoveNotGregorianProvider {
	protected constructor() {
	}

	/**
	 * Checks whether the given locale should use this calendar for move/navigation operations.
	 *
	 * @param lang - locale code
	 * @returns {@code true} when this calendar applies to the locale
	 */
	abstract accept(lang: HxLanguageCode): boolean;

	/**
	 * Julian calendar leap-year rule: every year divisible by 4 is a leap year.
	 *
	 * <p>Only valid for years before 1582 (the Gregorian reform). After 1582,
	 * use the Gregorian rule instead.</p>
	 *
	 * @param year - the year to check (must be < 1582)
	 * @returns {@code true} if the year is a leap year under the Julian rule
	 */
	static isJulianLeapYear(year: number): boolean {
		return year < 1582 && year % 4 === 0;
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
	protected moveDateToWithRanges(targetOfCalendar: HxDate, ranges: GregoryAndJulianMovementRanges): HxDate {
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
				DateUtils.fixDayWhenOverLastDayOfMonth(moved);
				return moved;
			}
			case 'date':
			default: {
				const toDate = UTCDate.of(movement.year, movement.month - 1, movement.day);
				return DateUtils.asHxDate(toDate);
			}
		}
	}

	/**
	 * Computes the target calendar year after applying a year offset, handling era
	 * boundaries and non-existent year-zero gaps where applicable.
	 *
	 * @param _date          - Gregorian date (used for era-boundary detection)
	 * @param yearOfCalendar - current calendar year
	 * @param yearOffset     - number of years to move (positive = forward, negative = backward)
	 * @returns the target calendar year, clamped to the earliest representable year
	 */
	protected abstract computeTargetYearOfCalendar(_date: HxDate, yearOfCalendar: number, yearOffset: number): number;

	/**
	 * Clamps a day number to the valid range for the target calendar month.
	 *
	 * @param targetYearOfCalendar  - target calendar year
	 * @param targetMonthOfCalendar - target month (1–12)
	 * @param dayOfCalendar         - desired day of month
	 * @returns the day clamped to the maximum for the target month
	 */
	protected abstract computeTargetDayOfCalendar(targetYearOfCalendar: number, targetMonthOfCalendar: number, dayOfCalendar: number): number;

	/**
	 * Map a calendar date to its equivalent Gregorian date using the offset table.
	 *
	 * @param targetOfCalendar - calendar date as {@code {year, month, day}}
	 * @returns equivalent Gregorian date
	 */
	protected abstract moveDateTo(targetOfCalendar: HxDate): HxDate;

	/**
	 * Move a Gregorian date by the given number of years in this non-Gregorian calendar.
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @param lang       - locale, used to format the date in the calendar's representation
	 * @returns the moved date in Gregorian
	 */
	moveYear(date: HxDate, yearOffset: number, lang: HxLanguageCode): HxDate {
		if (yearOffset === 0) {
			return {...date};
		}

		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(DateUtils.asJsDate(date), lang, false);
		const targetYearOfCalendar = this.computeTargetYearOfCalendar(date, yearOfCalendar, yearOffset);
		const targetDayOfCalendar = this.computeTargetDayOfCalendar(targetYearOfCalendar, monthOfCalendar, dayOfCalendar);

		return this.moveDateTo({
			year: targetYearOfCalendar, month: monthOfCalendar, day: targetDayOfCalendar
		});
	}

	/**
	 * Move a Gregorian date by the given number of months in this non-Gregorian calendar.
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @param lang        - locale, used to format the date in the calendar's representation
	 * @returns the moved date in Gregorian
	 */
	moveMonth(date: HxDate, monthOffset: number, lang: HxLanguageCode): HxDate {
		if (monthOffset === 0) {
			return {...date};
		}

		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(DateUtils.asJsDate(date), lang, false);
		// compute target year/month of calendar
		const {
			yearOffset, targetMonthOfCalendar
		} = DateInternalUtils.computeYearOffsetAndTargetMonthOfCalendarOn12Months(monthOfCalendar, monthOffset);
		const targetYearOfCalendar = this.computeTargetYearOfCalendar(date, yearOfCalendar, yearOffset);
		// compute target day of calendar
		const targetDayOfCalendar = this.computeTargetDayOfCalendar(targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar);
		return this.moveDateTo({
			year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar
		});
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
	isPreviousYearAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month === 12 && day > 29);
	}

	/**
	 * Checks whether the next year is navigable for calendars that use
	 * the Gregorian/Julian offset table (Japanese, Minguo, Buddhist).
	 *
	 * <p>Delegates to {@link DateMoveGregorianProvider#isNextYearAllowed}
	 * since the calendar epoch aligns with the Gregorian upper bound.</p>
	 *
	 * @param _lang                           - locale (unused)
	 * @param lastDayOfCurrentMonthOfGregory  - the Gregorian {@code Date} of
	 *                                           the last day of the current month
	 * @returns {@code true} when the next year is allowed
	 */
	isNextYearAllowed(_lang: HxLanguageCode, lastDayOfCurrentMonthOfGregory: UTCDate): boolean {
		return DateMoveGregorianProvider.isNextYearAllowed(lastDayOfCurrentMonthOfGregory);
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
	isPreviousMonthAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 1) || (year === 1 && month === 1 && day > 29);
	}

	/**
	 * Checks whether the next month is navigable for calendars that use
	 * the Gregorian/Julian offset table (Japanese, Minguo, Buddhist).
	 *
	 * <p>Delegates to {@link DateMoveGregorianProvider#isNextMonthAllowed}
	 * since the calendar epoch aligns with the Gregorian upper bound.</p>
	 *
	 * @param _lang                           - locale (unused)
	 * @param lastDayOfCurrentMonthOfGregory  - the Gregorian {@code Date} of
	 *                                           the last day of the current month
	 * @returns {@code true} when the next month is allowed
	 */
	isNextMonthAllowed(_lang: HxLanguageCode, lastDayOfCurrentMonthOfGregory: UTCDate): boolean {
		return DateMoveGregorianProvider.isNextMonthAllowed(lastDayOfCurrentMonthOfGregory);
	}
}