import type {HxLanguageCode} from '../contexts';
import {DateLocale} from './date-locale';
import {DateMoveGregoryAndJulianUtils, type GregoryAndJulianMovementRanges} from './date-move-gregory-and-julian';
import {DateMoveInternalUtils} from './date-move-internal';
import type {MoveDate} from './date-move-types';

export class DateMoveThUtils {
	/**
	 * <h3>Offset regions</h3>
	 * <pre>
	 * Buddhist year             Gregorian     Offset   Notes
	 * ≥ 2126 or 2125/11+        ≥ 1583        0        post-reform, same as Gregorian
	 * 2125/10                   1582/10       special  21-day month, days 5–14 skipped
	 * 2043/03 to 2125/09        1500–1582     +10
	 * 1943/03 to 2043/02        1400–1499     +9
	 * 1843/03 to 1943/02        1300–1399     +8
	 * 1643/03 to 1843/02        1100–1299     +7
	 * 1543/03 to 1643/02        1000–1099     +6
	 * 1443/03 to 1543/02         900–999      +5
	 * 1243/03 to 1443/02         700–899      +4
	 * 1143/03 to 1243/02         600–699      +3
	 * 1043/03 to 1143/02         500–599      +2
	 *  843/03 to 1043/02         300–499      +1
	 *  843/02                    300/02       special  Julian 2/29 → Gregorian 3/1
	 *  743/03 to  843/01         200–299       0
	 *  643/03 to  743/02         100–199      –1
	 *  544/02 to  643/02           1–99       –2
	 *  544/01                       1/01      special  days 1–2 clamped to 3 (no year 0)
	 * </pre>
	 */
	private static readonly ToGregoryAndJulianRanges: GregoryAndJulianMovementRanges = {
		// after 2126 (includes), and 2125/11, 2125/12, buddhist is same as gregory exactly
		isOrAfter158211: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar >= 2126 || (yearOfCalendar === 2125 && monthOfCalendar >= 11);
		},
		// 2125/10, buddhist has 21 days (has no day 5-14), gregory is from 1582/10/11 to 1582/10/31
		is158210: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === 2125 && monthOfCalendar === 10;
		},
		// 2043/03 to 2125/09, buddhist (month x/day y) -> gregory (month x/day y + 10)
		isOrBetween150003_158209: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 2043 || (yearOfCalendar === 2043 && monthOfCalendar >= 3);
		},
		// 1943/03 to 2043/02, buddhist (month x/day y) -> gregory (month x/day y + 9)
		isOrBetween140003_150002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1943 || (yearOfCalendar === 1943 && monthOfCalendar >= 3);
		},
		// 1843/03 to 1943/02, buddhist (month x/day y) -> gregory (month x/day y + 8)
		isOrBetween130003_140002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1843 || (yearOfCalendar === 1843 && monthOfCalendar >= 3);
		},
		// 1643/03 to 1843/02, buddhist (month x/day y) -> gregory (month x/day y + 7)
		isOrBetween110003_130002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1643 || (yearOfCalendar === 1643 && monthOfCalendar >= 3);
		},
		// 1543/03 to 1643/02, buddhist (month x/day y) -> gregory (month x/day y + 6)
		isOrBetween100003_110002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1543 || (yearOfCalendar === 1543 && monthOfCalendar >= 3);
		},
		// 1443/03 to 1543/02, buddhist (month x/day y) -> gregory (month x/day y + 5)
		isOrBetween090003_100002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1443 || (yearOfCalendar === 1443 && monthOfCalendar >= 3);
		},
		// 1243/03 to 1443/02, buddhist (month x/day y) -> gregory (month x/day y + 4)
		isOrBetween070003_090002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1243 || (yearOfCalendar === 1243 && monthOfCalendar >= 3);
		},
		// 1143/03 to 1243/02, buddhist (month x/day y) -> gregory (month x/day y + 3)
		isOrBetween060003_070002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1143 || (yearOfCalendar === 1143 && monthOfCalendar >= 3);
		},
		// 1043/03 to 1143/02, buddhist (month x/day y) -> gregory (month x/day y + 2)
		isOrBetween050003_060002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1043 || (yearOfCalendar === 1043 && monthOfCalendar >= 3);
		},
		// 843/03 to 1043/02, buddhist (month x/day y) -> gregory (month x/day y + 1)
		isOrBetween030003_050002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 843 || (yearOfCalendar === 843 && monthOfCalendar >= 3);
		},
		// 843/02 29 days, gregory 300/02 28 days. buddhist 2/1-28 -> gregory 2/1-28; buddhist 2/29 -> gregory 3/1
		is030002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === 843 && monthOfCalendar === 2;
		},
		// 743/03 to 843/01, buddhist is same as gregory exactly
		isOrBetween020003_030001: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 743 || (yearOfCalendar === 743 && monthOfCalendar >= 3);
		},
		// 643/03 to 743/02, buddhist (month x/day y) -> gregory (month x/day y - 1)
		isOrBetween010003_020002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 643 || (yearOfCalendar === 643 && monthOfCalendar >= 3);
		},
		// 544/01, days from 3-31, reset to 3 if given day of calendar is less than 3. buddhist (month x/day y) -> gregory (month x/day y - 2)
		is000101: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === 544 && monthOfCalendar === 1;
		},
		// 544/02 to 643/02, buddhist (month x/day y) -> gregory (month x/day y - 2)
		toGregoryYear: (yearOfCalendar: number) => yearOfCalendar - 543
	};

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/** Returns {@code true} when the language uses the Thai (Buddhist) calendar. */
	// noinspection JSUnusedGlobalSymbols
	static accept(lang: HxLanguageCode): boolean {
		return DateLocale.isTh(lang);
	}

	/**
	 * Clamp a day number to the valid range for the target Buddhist month.
	 *
	 * @see DateMoveGregoryAndJulianUtils#computeTargetDayOfCalendar
	 */
	private static computeTargetDayOfCalendar(targetYearOfCalendar: number, targetMonthOfCalendar: number, dayOfCalendar: number): number {
		return DateMoveGregoryAndJulianUtils.computeTargetDayOfCalendar(
			targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar, DateLocale.isThLeapYear
		);
	}

	/**
	 * Map a Buddhist date to its equivalent Gregorian date.
	 *
	 * @see DateMoveGregoryAndJulianUtils#moveDateTo
	 */
	private static moveDateTo(targetOfCalendar: MoveDate): MoveDate {
		return DateMoveGregoryAndJulianUtils.moveDateTo(targetOfCalendar, DateMoveThUtils.ToGregoryAndJulianRanges);
	}

	/**
	 * Move a Gregorian date by the given number of years in the Buddhist calendar.
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @param lang       - locale, used to format the date in Buddhist representation
	 * @returns the moved date in Gregorian
	 */
	// noinspection JSUnusedGlobalSymbols
	static moveYear(date: MoveDate, yearOffset: number, lang: HxLanguageCode): MoveDate {
		if (yearOffset === 0) {
			return {...date};
		}

		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocale.formatDateInNumeric(DateMoveInternalUtils.asJsDate(date), lang, false);
		const targetYearOfCalendar = Math.max(544, yearOfCalendar + yearOffset);
		const targetDayOfCalendar = DateMoveThUtils.computeTargetDayOfCalendar(targetYearOfCalendar, monthOfCalendar, dayOfCalendar);

		return DateMoveThUtils.moveDateTo({
			year: targetYearOfCalendar, month: monthOfCalendar, day: targetDayOfCalendar
		});
	}

	/**
	 * Move a Gregorian date by the given number of months in the Buddhist calendar.
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @param lang        - locale, used to format the date in Buddhist representation
	 * @returns the moved date in Gregorian
	 */
	// noinspection JSUnusedGlobalSymbols
	static moveMonth(date: MoveDate, monthOffset: number, lang: HxLanguageCode): MoveDate {
		if (monthOffset === 0) {
			return {...date};
		}

		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocale.formatDateInNumeric(DateMoveInternalUtils.asJsDate(date), lang, false);
		// compute target year/month of calendar
		const {
			yearOffset, targetMonthOfCalendar
		} = DateMoveGregoryAndJulianUtils.computeTargetYearAndMonthOfCalendar(monthOfCalendar, monthOffset);
		const targetYearOfCalendar = Math.max(544, yearOfCalendar + yearOffset);
		// compute target day of calendar
		const targetDayOfCalendar = DateMoveThUtils.computeTargetDayOfCalendar(targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar);
		return DateMoveThUtils.moveDateTo({
			year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar
		});
	}
}