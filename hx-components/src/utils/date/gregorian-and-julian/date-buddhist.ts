import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleUtils, DateMoveUtils, DateUtils} from '../facade';
import type {DateLocaleNotGregorianProvider, MoveDate} from '../interfaces';
import {
	DateMoveGregorianAndJulianProvider,
	type GregoryAndJulianMovementRanges
} from './date-move-gregorian-and-julian';

export class DateBuddhistUtils extends DateMoveGregorianAndJulianProvider implements DateLocaleNotGregorianProvider {
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
	protected static readonly ToGregoryAndJulianRanges: GregoryAndJulianMovementRanges = {
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
	static readonly INSTANCE = new DateBuddhistUtils();

	protected constructor() {
		super();
	}

	/** Returns the calendar identifier for {@link Intl.DateTimeFormat}. */
	calendar(): string {
		return 'buddhist';
	}

	/** Returns the list of locales that use the Thai Buddhist calendar. */
	supportedLanguages(): Array<HxLanguageCode> {
		return [
			'th',   // Thai Buddhist calendar (B.E.)
			'th-TH' // Thai, Thailand
		];
	}

	static enable() {
		DateLocaleUtils.enableNotGregorianLocaleUtils(DateBuddhistUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveUtils(DateBuddhistUtils.INSTANCE);
	}

	static disable() {
		DateLocaleUtils.disableNotGregorianLocaleUtils(DateBuddhistUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveUtils(DateBuddhistUtils.INSTANCE);
	}

	/**
	 * Checks whether the given locale should use the Thai Buddhist calendar.
	 *
	 * @param lang - locale code (e.g. {@code 'th-TH'})
	 * @returns {@code true} when the language uses the Buddhist calendar
	 */
	accept(lang: HxLanguageCode): boolean {
		return lang === 'th-TH'
			|| lang === 'th'
			|| lang.startsWith('th-');
	}

	/**
	 * Thai Buddhist (Buddhist Era) calendar leap-year check.
	 *
	 * <p>Converts the Buddhist calendar year to the equivalent Gregorian year by
	 * subtracting 543 (B.E. 544 = A.D. 1), then chooses the appropriate rule
	 * based on the Gregorian reform boundary:</p>
	 * <ul>
	 * <li>Before 1582: Julian rule (every 4th year is leap, including century years)</li>
	 * <li>1582 onward:  Gregorian rule (divisible by 400, or by 4 but not 100)</li>
	 * </ul>
	 *
	 * @param yearOfCalendar - Buddhist Era year
	 * @returns {@code true} if the year is a leap year
	 */
	static isLeapYear(yearOfCalendar: number): boolean {
		const year = yearOfCalendar - 543;
		if (year < 1582) {
			return DateMoveGregorianAndJulianProvider.isJulianLeapYear(year);
		} else {
			return DateUtils.isGregorianLeapYear(year);
		}
	}

	/**
	 * Computes the target Buddhist Era year after applying an offset.
	 *
	 * <p>The Buddhist calendar has a simple linear year system with no era
	 * boundaries — B.E. 544 = A.D. 1. The result is clamped to a minimum
	 * of 544 (the first year of the Buddhist Era).</p>
	 *
	 * @param _date           - Gregorian date (unused; the Buddhist calendar has no era transitions)
	 * @param yearOfCalendar  - current Buddhist Era year
	 * @param yearOffset      - number of years to move (positive = forward, negative = backward)
	 * @returns the target Buddhist Era year, clamped to ≥ 544
	 */
	protected computeTargetYearOfCalendar(_date: MoveDate, yearOfCalendar: number, yearOffset: number): number {
		return Math.min(10542, Math.max(544, yearOfCalendar + yearOffset));
	}

	/**
	 * Clamp a day number to the valid range for a Gregorian/Julian month.
	 *
	 * <p>Delegates to {@link DateMoveGregorianAndJulianProvider#computeTargetDayOfCalendarWithLeapCheck}
	 * with Buddhist-era leap-year detection ({@link DateBuddhistUtils.isLeapYear}),
	 * which applies Julian rule before 1582 and Gregorian rule from 1582 onward.</p>
	 *
	 * @param targetYearOfCalendar - Buddhist calendar year
	 * @param targetMonthOfCalendar - calendar month (1–12)
	 * @param dayOfCalendar        - desired day of month
	 * @returns day clamped to valid range for the target month
	 */
	protected computeTargetDayOfCalendar(targetYearOfCalendar: number, targetMonthOfCalendar: number, dayOfCalendar: number): number {
		return super.computeTargetDayOfCalendarWithLeapCheck(
			targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar, DateBuddhistUtils.isLeapYear
		);
	}

	/**
	 * Map a Buddhist calendar date to its equivalent Gregorian date,
	 * accounting for the Julian–Gregorian offset that accumulated over
	 * twelve century-years before the 1582 reform.
	 *
	 * <p>Uses {@link DateMoveGregorianAndJulianProvider#moveDateToWithRanges} with the
	 * Buddhist era offset table ({@link ToGregoryAndJulianRanges}).</p>
	 *
	 * @param targetOfCalendar - Buddhist date as {@code {year, month, day}}
	 * @returns equivalent Gregorian date
	 */
	protected moveDateTo(targetOfCalendar: MoveDate): MoveDate {
		return this.moveDateToWithRanges(targetOfCalendar, DateBuddhistUtils.ToGregoryAndJulianRanges);
	}
}