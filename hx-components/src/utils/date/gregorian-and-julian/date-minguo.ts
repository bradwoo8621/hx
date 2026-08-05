import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleUtils, DateMoveUtils, DateUtils} from '../facade';
import type {DateLocaleNotGregorianProvider, HxFormattedEra, HxFormattedYear, MoveDate} from '../interfaces';
import {
	DateMoveGregorianAndJulianProvider,
	type GregoryAndJulianMovementRanges
} from './date-move-gregorian-and-julian';

export class DateMinguoUtils extends DateMoveGregorianAndJulianProvider implements DateLocaleNotGregorianProvider {
	/**
	 * <h3>Offset regions</h3>
	 * <pre>
	 * ROC year                  Gregorian     Offset   Notes
	 * ≥ -329 or -330/11+        ≥ 1583        0        post-reform, same as Gregorian
	 * -330/10                   1582/10       special  21-day month, days 5–14 skipped
	 * -412/03 to -330/09        1500–1582     +10
	 * -512/03 to -412/02        1400–1499     +9
	 * -612/03 to -512/02        1300–1399     +8
	 * -812/03 to -612/02        1100–1299     +7
	 * -912/03 to -812/02        1000–1099     +6
	 * -1012/03 to -912/02        900–999      +5
	 * -1212/03 to -1012/02       700–899      +4
	 * -1312/03 to -1212/02       600–699      +3
	 * -1412/03 to -1312/02       500–599      +2
	 * -1612/03 to -1412/02       300–499      +1
	 * -1612/02                   300/02       special  Julian 2/29 → Gregorian 3/1
	 * -1712/03 to -1612/01       200–299       0
	 * -1812/03 to -1712/02       100–199      –1
	 * -1911/02 to -1812/02         1–99       –2
	 * -1911/01                      1/01      special  days 1–2 clamped to 3 (no year 0)
	 * </pre>
	 */
	protected static readonly ToGregoryAndJulianRanges: GregoryAndJulianMovementRanges = {
		// after 民國前 329 (includes), and 民國前 330/11, 330/12, roc is same as gregory exactly
		isOrAfter158211: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar >= -329 || (yearOfCalendar === -330 && monthOfCalendar >= 11);
		},
		// 民國前 330/10, roc has 21 days (has no day 5-14), gregory is from 1582/10/11 to 1582/10/31
		is158210: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === -330 && monthOfCalendar === 10;
		},
		// 民國前 412/03 to 民國前 330/09, roc (month x/day y) -> gregory (month x/day y + 10)
		isOrBetween150003_158209: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -412 || (yearOfCalendar === -412 && monthOfCalendar >= 3);
		},
		// 民國前 512/03 to 民國前 412/02, roc (month x/day y) -> gregory (month x/day y + 9)
		isOrBetween140003_150002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -512 || (yearOfCalendar === -512 && monthOfCalendar >= 3);
		},
		// 民國前 612/03 to 民國前 512/02, roc (month x/day y) -> gregory (month x/day y + 8)
		isOrBetween130003_140002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -612 || (yearOfCalendar === -612 && monthOfCalendar >= 3);
		},
		// 民國前 812/03 to 民國前 612/02, roc (month x/day y) -> gregory (month x/day y + 7)
		isOrBetween110003_130002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -812 || (yearOfCalendar === -812 && monthOfCalendar >= 3);
		},
		// 民國前 912/03 to 民國前 812/02, roc (month x/day y) -> gregory (month x/day y + 6)
		isOrBetween100003_110002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -912 || (yearOfCalendar === -912 && monthOfCalendar >= 3);
		},
		// 民國前 1012/03 to 民國前 912/02, roc (month x/day y) -> gregory (month x/day y + 5)
		isOrBetween090003_100002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1012 || (yearOfCalendar === -1012 && monthOfCalendar >= 3);
		},
		// 民國前 1212/03 to 民國前 1012/02, roc (month x/day y) -> gregory (month x/day y + 4)
		isOrBetween070003_090002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1212 || (yearOfCalendar === -1212 && monthOfCalendar >= 3);
		},
		// 民國前 1312/03 to 民國前 1212/02, roc (month x/day y) -> gregory (month x/day y + 3)
		isOrBetween060003_070002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1312 || (yearOfCalendar === -1312 && monthOfCalendar >= 3);
		},
		// 民國前 1412/03 to 民國前 1312/02, roc (month x/day y) -> gregory (month x/day y + 2)
		isOrBetween050003_060002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1412 || (yearOfCalendar === -1412 && monthOfCalendar >= 3);
		},
		// 民國前 1612/03 to 民國前 1412/02, roc (month x/day y) -> gregory (month x/day y + 1)
		isOrBetween030003_050002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1612 || (yearOfCalendar === -1612 && monthOfCalendar >= 3);
		},
		// 民國前 1612/02 29 days, gregory 300/02 28 days. roc 2/1-28 -> gregory 2/1-28; roc 2/29 -> gregory 3/1
		is030002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === -1612 && monthOfCalendar === 2;
		},
		// 民國前 1712/03 to 民國前 1612/01, roc is same as gregory exactly
		isOrBetween020003_030001: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1712 || (yearOfCalendar === -1712 && monthOfCalendar >= 3);
		},
		// 民國前 1812/03 to 民國前 1712/02, roc (month x/day y) -> gregory (month x/day y - 1)
		isOrBetween010003_020002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1812 || (yearOfCalendar === -1812 && monthOfCalendar >= 3);
		},
		// 民國前 1911/01, days from 3-31, reset to 3 if given day of calendar is less than 3. roc (month x/day y) -> gregory (month x/day y - 2)
		is000101: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === -1911 && monthOfCalendar === 1;
		},
		// 民國前 1911/02 to 民國前 1812/02, roc (month x/day y) -> gregory (month x/day y - 2)
		// to gregory year by year of calendar
		toGregoryYear: (yearOfCalendar: number) => yearOfCalendar > 0 ? (yearOfCalendar + 1911) : (yearOfCalendar + 1912)
	};
	static readonly INSTANCE = new DateMinguoUtils();

	protected constructor() {
		super();
	}

	/** Returns the calendar identifier for {@link Intl.DateTimeFormat}. */
	calendar(): string {
		return 'roc';
	}

	/** Returns the list of locales that use the ROC (Minguo) calendar. */
	supportedLanguages(): Array<HxLanguageCode> {
		return [
			'zh-Hant-TW', // Taiwan — Minguo calendar
			'zh-TW'       // Taiwan — Minguo calendar
		];
	}

	static enable() {
		DateLocaleUtils.enableNotGregorianLocaleUtils(DateMinguoUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveUtils(DateMinguoUtils.INSTANCE);
	}

	static disable() {
		DateLocaleUtils.disableNotGregorianLocaleUtils(DateMinguoUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveUtils(DateMinguoUtils.INSTANCE);
	}

	/**
	 * Checks whether the given locale should use the ROC (Minguo) calendar.
	 *
	 * @param lang - locale code (e.g. {@code 'zh-TW'})
	 * @returns {@code true} when the language uses the ROC calendar
	 */
	accept(lang: HxLanguageCode): boolean {
		return lang === 'zh-TW'
			|| lang === 'zh-Hant-TW'
			|| lang.startsWith('zh-TW-')
			|| lang.startsWith('zh-Hant-TW-');
	}

	/**
	 * ROC (Minguo) calendar leap-year check.
	 *
	 * <p>Converts the ROC calendar year to the equivalent Gregorian year, then chooses
	 * the appropriate rule based on the Gregorian reform boundary:</p>
	 * <ul>
	 * <li>Before 1582: Julian rule (every 4th year is leap, including century years)</li>
	 * <li>1582 onward:  Gregorian rule (divisible by 400, or by 4 but not 100)</li>
	 * </ul>
	 *
	 * @param yearOfCalendar - ROC year (positive = Minguo, negative = Before-Minguo)
	 * @returns {@code true} if the year is a leap year
	 */
	static isLeapYear(yearOfCalendar: number): boolean {
		const year = yearOfCalendar >= 1 ? (yearOfCalendar + 1911) : (yearOfCalendar + 1912);
		if (year < 1582) {
			return DateMoveGregorianAndJulianProvider.isJulianLeapYear(year);
		} else {
			return DateUtils.isGregorianLeapYear(year);
		}
	}

	/**
	 * Computes the target ROC year after applying an offset.
	 *
	 * ROC uses two eras: Minguo (≥ 1, 1912 CE+) and Before-Minguo (≤ −1, < 1912 CE).
	 * The internal representation uses positive for Minguo and negative for Before-Minguo.
	 * This method handles the non-existent year 0 (Minguo 1 → Before-Minguo -1).
	 *
	 * @param date            - current Gregorian date (year is used to determine the era)
	 * @param yearOfCalendar - current ROC year (positive = Minguo, negative = Before-Minguo)
	 * @param yearOffset     - number of years to move (positive = forward, negative = backward)
	 * @returns the target ROC year, clamped to ≥ -1911 (Gregorian 1 CE)
	 */
	protected computeTargetYearOfCalendar(date: MoveDate, yearOfCalendar: number, yearOffset: number): number {
		const yearOfGregory = date.year;
		if (yearOfGregory < 1912) {
			// convert 民國前 year of calendar to negative value, which starts from -1
			yearOfCalendar = 0 - yearOfCalendar;
		}
		// noinspection DuplicatedCode
		let targetYearOfCalendar: number;
		if (yearOfCalendar > 0) {
			// 民國 starts from 1
			if (yearOffset > 0) {
				targetYearOfCalendar = yearOfCalendar + yearOffset;
			} else {
				targetYearOfCalendar = yearOfCalendar + yearOffset;
				if (targetYearOfCalendar <= 0) {
					// 民國前 starts from -1
					targetYearOfCalendar = targetYearOfCalendar - 1;
				}
			}
		} else if (yearOffset < 0) {
			// 民國前 starts from -1
			targetYearOfCalendar = yearOfCalendar + yearOffset;
		} else {
			// 民國前 starts from -1
			targetYearOfCalendar = yearOfCalendar + yearOffset;
			if (targetYearOfCalendar >= 0) {
				targetYearOfCalendar = targetYearOfCalendar + 1;
			}
		}
		// ROC −1911/01/03 is Gregorian 0001/01/01
		return Math.max(-1911, targetYearOfCalendar);
	}

	/**
	 * Clamp a day number to the valid range for the target ROC month.
	 *
	 * Month lengths follow the Gregorian/Julian pattern (Jan=31, Feb=28/29, …)
	 * but are expressed in the ROC calendar. Leap-year detection delegates to
	 * {@link DateMinguoUtils.isLeapYear}, which applies Julian rule before 1582
	 * and Gregorian rule from 1582 onward.
	 *
	 * @param targetYearOfCalendar  - target ROC year (negative = Before-Minguo)
	 * @param targetMonthOfCalendar - target month (1–12)
	 * @param dayOfCalendar         - desired day of month
	 * @returns the day clamped to the maximum for the target month
	 */
	protected computeTargetDayOfCalendar(targetYearOfCalendar: number, targetMonthOfCalendar: number, dayOfCalendar: number): number {
		return super.computeTargetDayOfCalendarWithLeapCheck(
			targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar, DateMinguoUtils.isLeapYear
		);
	}

	/**
	 * Map a ROC calendar date ({@code year}, {@code month}, {@code day}) to a
	 * Gregorian date, accounting for the Julian–Gregorian offset that accumulated
	 * over twelve century-years before the 1582 reform.
	 *
	 * @param targetOfCalendar - ROC date as {@code {year, month, day}}
	 * @returns equivalent Gregorian date
	 */
	protected moveDateTo(targetOfCalendar: MoveDate): MoveDate {
		return this.moveDateToWithRanges(targetOfCalendar, DateMinguoUtils.ToGregoryAndJulianRanges);
	}

	/**
	 * Extracts the formatted era string from {@link Intl.DateTimeFormat} parts.
	 *
	 * @param _lang   - locale (unused)
	 * @param _date   - the Gregorian date (unused)
	 * @param partsOf - callback that returns the formatted parts array
	 * @returns the formatted era string, or an empty string
	 */
	eraAs(_lang: HxLanguageCode, _date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedEra {
		const parts = partsOf();
		const partIndex = parts.findIndex(part => part.type === 'era');
		if (partIndex !== -1) {
			return parts[partIndex].value;
		} else {
			return '';
		}
	}

	/**
	 * Extracts the formatted year and its following literal from
	 * {@link Intl.DateTimeFormat} parts, returning them joined together.
	 *
	 * <p>Falls back to the Gregorian full year when the formatted parts
	 * cannot be parsed.</p>
	 *
	 * @param _lang    - locale (unused; the era suffix is locale-independent in ROC)
	 * @param date     - the Gregorian date
	 * @param partsOf  - callback that returns the formatted parts array
	 * @returns the year string with its literal suffix (e.g. {@code "113年"})
	 */
	yearAs(_lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedYear {
		const yearAndLiteral = DateLocaleUtils.findYearAndLiteralFromFormattedParts(partsOf);
		if (yearAndLiteral.found) {
			// eslint-disable-next-line prefer-const
			let {year, literal} = yearAndLiteral;
			return [year, literal].join('');
		} else {
			return String(date.getFullYear());
		}
	}
}
