import type {HxLanguageCode} from '../../../contexts';
import type {HxDateTimeValue} from '../../../types';
import {DateLocaleFormatUtils, DateMoveUtils, DateUtils, UTCDate} from '../facade';
import type {
	ComputedDays,
	DateLocaleNotGregorianProvider,
	HxDate,
	HxFormattedEra,
	HxFormattedYear
} from '../interfaces';
import {
	DateMoveGregorianAndJulianProvider,
	type GregoryAndJulianMovementRanges
} from './date-move-gregorian-and-julian';

export class DateJapaneseUtils extends DateMoveGregorianAndJulianProvider implements DateLocaleNotGregorianProvider {
	/**
	 * <h3>Offset regions</h3>
	 * <pre>
	 * Japanese year              Gregorian     Offset   Notes
	 * ≥ 1583 or 1582/11+          ≥ 1583        0        post-reform, same as Gregorian
	 * 1582/10                     1582/10       special  21-day month, days 5–14 skipped
	 * 1500/03 to 1582/09          1500–1582     +10
	 * 1400/03 to 1500/02          1400–1499     +9
	 * 1300/03 to 1400/02          1300–1399     +8
	 * 1100/03 to 1300/02          1100–1299     +7
	 * 1000/03 to 1100/02          1000–1099     +6
	 *  900/03 to 1000/02           900–999      +5
	 *  700/03 to  900/02           700–899      +4
	 *  600/03 to  700/02           600–699      +3
	 *  500/03 to  600/02           500–599      +2
	 *  300/03 to  500/02           300–499      +1
	 *  300/02                      300/02       special  Julian 2/29 → Gregorian 3/1
	 *  200/03 to  300/01           200–299       0
	 *  100/03 to  200/02           100–199      –1
	 *    1/02 to  100/02             1–99       –2
	 *    1/01                         1/01      special  days 1–2 clamped to 3 (no year 0)
	 * </pre>
	 */
	protected static readonly ToGregoryAndJulianRanges: GregoryAndJulianMovementRanges = {
		// after 1583 (includes), and 1582/11, 1582/12, japanese is same as gregory exactly
		isOrAfter158211: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar >= 1583 || (yearOfCalendar === 1582 && monthOfCalendar >= 11);
		},
		// 1582/10, japanese has 21 days (has no day 5-14), gregory is from 1582/10/11 to 1582/10/31
		is158210: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === 1582 && monthOfCalendar === 10;
		},
		// 1500/03 to 1582/09, japanese (month x/day y) -> gregory (month x/day y + 10)
		isOrBetween150003_158209: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1500 || (yearOfCalendar === 1500 && monthOfCalendar >= 3);
		},
		// 1400/03 to 1500/02, japanese (month x/day y) -> gregory (month x/day y + 9)
		isOrBetween140003_150002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1400 || (yearOfCalendar === 1400 && monthOfCalendar >= 3);
		},
		// 1300/03 to 1400/02, japanese (month x/day y) -> gregory (month x/day y + 8)
		isOrBetween130003_140002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1300 || (yearOfCalendar === 1300 && monthOfCalendar >= 3);
		},
		// 1100/03 to 1300/02, japanese (month x/day y) -> gregory (month x/day y + 7)
		isOrBetween110003_130002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1100 || (yearOfCalendar === 1100 && monthOfCalendar >= 3);
		},
		// 1000/03 to 1100/02, japanese (month x/day y) -> gregory (month x/day y + 6)
		isOrBetween100003_110002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1000 || (yearOfCalendar === 1000 && monthOfCalendar >= 3);
		},
		// 900/03 to 1000/02, japanese (month x/day y) -> gregory (month x/day y + 5)
		isOrBetween090003_100002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 900 || (yearOfCalendar === 900 && monthOfCalendar >= 3);
		},
		// 700/03 to 900/02, japanese (month x/day y) -> gregory (month x/day y + 4)
		isOrBetween070003_090002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 700 || (yearOfCalendar === 700 && monthOfCalendar >= 3);
		},
		// 600/03 to 700/02, japanese (month x/day y) -> gregory (month x/day y + 3)
		isOrBetween060003_070002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 600 || (yearOfCalendar === 600 && monthOfCalendar >= 3);
		},
		// 500/03 to 600/02, japanese (month x/day y) -> gregory (month x/day y + 2)
		isOrBetween050003_060002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 500 || (yearOfCalendar === 500 && monthOfCalendar >= 3);
		},
		// 300/03 to 500/02, japanese (month x/day y) -> gregory (month x/day y + 1)
		isOrBetween030003_050002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 300 || (yearOfCalendar === 300 && monthOfCalendar >= 3);
		},
		// 300/02 29 days, gregory 300/02 28 days. japanese 2/1-28 -> gregory 2/1-28; japanese 2/29 -> gregory 3/1
		is030002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === 300 && monthOfCalendar === 2;
		},
		// 200/03 to 300/01, japanese is same as gregory exactly
		isOrBetween020003_030001: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 200 || (yearOfCalendar === 200 && monthOfCalendar >= 3);
		},
		// 100/03 to 200/02, japanese (month x/day y) -> gregory (month x/day y - 1)
		isOrBetween010003_020002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 100 || (yearOfCalendar === 100 && monthOfCalendar >= 3);
		},
		// 0001/01, days from 3-31, reset to 3 if given day of calendar is less than 3. japanese (month x/day y) -> gregory (month x/day y - 2)
		is000101: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === 1 && monthOfCalendar === 1;
		},
		// 0001/02 to 100/02, japanese (month x/day y) -> gregory (month x/day y - 2)
		toGregoryYear: (yearOfCalendar: number) => yearOfCalendar
	};
	static readonly INSTANCE = new DateJapaneseUtils();

	protected constructor() {
		super();
	}

	/** Returns the calendar identifier for {@link Intl.DateTimeFormat}. */
	calendar(): string {
		return 'japanese';
	}

	/** Returns the list of locales that use the Japanese Imperial calendar. */
	supportedLanguages(): Array<HxLanguageCode> {
		return [
			'ja',   // Japanese Imperial calendar (era-based)
			'ja-JP' // Japanese, Japan
		];
	}

	static enable() {
		DateLocaleFormatUtils.enableNotGregorianLocaleProvider(DateJapaneseUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveProvider(DateJapaneseUtils.INSTANCE);
	}

	static disable() {
		DateLocaleFormatUtils.disableNotGregorianLocaleProvider(DateJapaneseUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveProvider(DateJapaneseUtils.INSTANCE);
	}

	/**
	 * Checks whether the given locale should use the Japanese Imperial calendar.
	 *
	 * @param lang - locale code (e.g. {@code 'ja-JP'})
	 * @returns {@code true} when the language uses the Japanese calendar
	 */
	accept(lang: HxLanguageCode): boolean {
		return lang === 'ja-JP'
			|| lang === 'ja'
			|| lang.startsWith('ja-');
	}

	/**
	 * Japanese calendar leap-year check.
	 *
	 * <p>The Japanese calendar year is really a mess, so use the Gregorian year.
	 * The appropriate rule is selected based on the Gregorian reform boundary:</p>
	 * <ul>
	 * <li>Before 1582: Julian rule (every 4th year is leap, including century years)</li>
	 * <li>1582 onward:  Gregorian rule (divisible by 400, or by 4 but not 100)</li>
	 * </ul>
	 *
	 * @param yearOfGregory - Gregorian year
	 * @returns {@code true} if the year is a leap year
	 */
	static isLeapYear(yearOfGregory: number): boolean {
		if (yearOfGregory < 1582) {
			return DateMoveGregorianAndJulianProvider.isJulianLeapYear(yearOfGregory);
		} else {
			return DateUtils.isGregorianLeapYear(yearOfGregory);
		}
	}

	/**
	 * Computes the target Japanese sequential year after applying a year offset.
	 *
	 * <p>The Julian–Gregorian offset causes dates near the year boundary
	 * (early January, late December) to belong to a different Japanese
	 * calendar year than their Gregorian year suggests. This method corrects
	 * the Gregorian year before adding {@code yearOffset}.</p>
	 *
	 * <pre>
	 * Gregorian years   Boundary days      Adj   Julian offset
	 * ────────────────────────────────────────────────────────
	 * ≥ 1583            —                  ±0    post-reform
	 * 1501–1582         Jan 1–10           −1    +10
	 * 1401–1500         Jan 1–9            −1    +9
	 * 1301–1400         Jan 1–8            −1    +8
	 * 1101–1300         Jan 1–7            −1    +7
	 * 1001–1100         Jan 1–6            −1    +6
	 *  901–1000         Jan 1–5            −1    +5
	 *  701– 900         Jan 1–4            −1    +4
	 *  601– 700         Jan 1–3            −1    +3
	 *  501– 600         Jan 1–2            −1    +2
	 *  301– 500         Jan 1              −1    +1
	 *  200– 300         —                  ±0     0
	 *  100– 199         Dec 31             +1    −1
	 *    1–  99         Dec 30–31          +1    −2
	 * </pre>
	 *
	 * @param date            - Gregorian date (year, month, day are used to determine the era boundary)
	 * @param _yearOfCalendar - intentionally unused; the Japanese calendar derives the year from the Gregorian date directly
	 * @param yearOffset      - number of years to advance (positive) or retreat (negative)
	 * @returns the adjusted sequential year, clamped to [1, 9999]
	 * @see ToGregoryAndJulianRanges
	 */
	protected computeTargetYearOfCalendar(date: HxDate, _yearOfCalendar: number, yearOffset: number): number {
		let targetYearOfCalendar: number;
		const {year, month, day} = date;
		if (year >= 1583) {
			targetYearOfCalendar = year + yearOffset;
		} else if ((year > 1500 && month === 1 && day <= 10)
			|| (year > 1400 && month === 1 && day <= 9)
			|| (year > 1300 && month === 1 && day <= 8)
			|| (year > 1100 && month === 1 && day <= 7)
			|| (year > 1000 && month === 1 && day <= 6)
			|| (year > 900 && month === 1 && day <= 5)
			|| (year > 700 && month === 1 && day <= 4)
			|| (year > 600 && month === 1 && day <= 3)
			|| (year > 500 && month === 1 && day <= 2)
			|| (year > 300 && month === 1 && day === 1)) {
			targetYearOfCalendar = year - 1 + yearOffset;
		} else if (year >= 200) {
			targetYearOfCalendar = year + yearOffset;
		} else if ((year >= 100 && month === 12 && day === 31)
			|| (year < 100 && month === 12 && day >= 30)) {
			targetYearOfCalendar = year + 1 + yearOffset;
		} else {
			targetYearOfCalendar = year + yearOffset;
		}
		return Math.min(9999, Math.max(1, targetYearOfCalendar));
	}

	/**
	 * Clamp a day number to the valid range for the target Japanese month.
	 *
	 * <p>Delegates to {@link DateMoveGregorianAndJulianProvider#computeTargetDayOfCalendarWithLeapCheck}
	 * with Japanese-era leap-year detection ({@link DateJapaneseUtils.isLeapYear}).</p>
	 *
	 * @param targetYearOfCalendar  - Japanese sequential year
	 * @param targetMonthOfCalendar - calendar month (1–12)
	 * @param dayOfCalendar         - desired day of month
	 * @returns day clamped to valid range for the target month
	 */
	protected computeTargetDayOfCalendar(targetYearOfCalendar: number, targetMonthOfCalendar: number, dayOfCalendar: number): number {
		return super.computeTargetDayOfCalendarWithLeapCheck(
			targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar, DateJapaneseUtils.isLeapYear
		);
	}

	/**
	 * Map a Japanese calendar date to its equivalent Gregorian date,
	 * accounting for the Julian–Gregorian offset that accumulated over
	 * twelve century-years before the 1582 reform.
	 *
	 * <p>Uses {@link DateMoveGregorianAndJulianProvider#moveDateToWithRanges} with the
	 * Japanese era offset table ({@link ToGregoryAndJulianRanges}).</p>
	 *
	 * @param targetOfCalendar - Japanese date as {@code {year, month, day}}
	 * @returns equivalent Gregorian date
	 */
	protected moveDateTo(targetOfCalendar: HxDate): HxDate {
		return super.moveDateToWithRanges(targetOfCalendar, DateJapaneseUtils.ToGregoryAndJulianRanges);
	}

	/**
	 * Extracts the formatted era string for the Japanese Imperial calendar.
	 *
	 * <ul>
	 * <li>Gregorian 645/01/03 and earlier: returns {@code '西暦'}</li>
	 * <li>Era is 大化 and year part is zero or negative: returns {@code '西暦'}</li>
	 * <li>Otherwise: follows the formatted era from {@link Intl.DateTimeFormat} parts</li>
	 * </ul>
	 *
	 * @param date    - the Gregorian date
	 * @param partsOf - callback that returns the formatted parts array
	 * @param _lang   - locale code (unused)
	 * @returns the formatted era string, or {@code '西暦'} for pre-era dates
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	eraAs(date: UTCDate, partsOf: () => Array<Intl.DateTimeFormatPart>, _lang: HxLanguageCode): HxFormattedEra {
		const year = date.getFullYear();
		if (year < 645 || (year === 645 && date.getMonthIndex() === 0 && date.getDayOfMonth() < 4)) {
			return '西暦';
		}
		const parts = partsOf();
		const partIndex = parts.findIndex(part => part.type === 'era');
		if (partIndex !== -1) {
			const era = parts[partIndex].value;
			if (era === '大化') {
				const year = parts.find(part => part.type === 'year');
				if (year?.value === '0' || year?.value?.startsWith('-')) {
					return '西暦';
				}
			}
			return era;
		} else {
			return '';
		}
	}

	/**
	 * Extracts the formatted year string for the Japanese Imperial calendar.
	 *
	 * <ul>
	 * <li>Gregorian year < 100: appends {@code '年'} after the full Gregorian year</li>
	 * <li>Formatted year part is negative or zero: falls back to Gregorian year + {@code '年'}</li>
	 * <li>Otherwise: returns the formatted year with its literal suffix</li>
	 * </ul>
	 *
	 * @param date    - the Gregorian date
	 * @param partsOf - callback that returns the formatted parts array
	 * @param _lang   - locale code (unused)
	 * @returns the formatted year string (e.g. {@code '令和7年'})
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	yearAs(date: UTCDate, partsOf: () => Array<Intl.DateTimeFormatPart>, _lang: HxLanguageCode): HxFormattedYear {
		const year = date.getFullYear();
		if (year < 100) {
			return `${year}年`;
		}
		const yearAndLiteral = DateLocaleFormatUtils.findYearAndLiteralFromFormattedParts(partsOf);
		if (yearAndLiteral.found) {
			// eslint-disable-next-line prefer-const
			let {year, literal} = yearAndLiteral;
			if (year.startsWith('-') || year === '0') {
				return `${date.getFullYear()}年`;
			}
			return [year, literal].join('');
		} else {
			return String(date.getFullYear());
		}
	}

	/**
	 * Builds a year label for the Japanese Imperial calendar by deriving the
	 * era and year from the first day of the given month.
	 *
	 * <p>Because an era transition can occur mid-month in the Japanese calendar,
	 * the era name and year number of an arbitrary day within the month may not
	 * match the era prevailing on the first day. This method adjusts the given
	 * date back to the first day of the month, resolves the correct era and year
	 * from there, and composes them into a label such as "令和7年".</p>
	 *
	 * @param value - the date-time value whose month is used as the reference
	 * @param _era  - intentionally unused; the era is derived from the first day of the month
	 * @param _year - the year string to use when constructing the formatted year portion
	 * @param lang  - the locale language code for era/year formatting
	 * @returns the concatenated era name and formatted year string (e.g. "令和7年")
	 */
	labelOfYear(value: Required<HxDateTimeValue>, _era: string, _year: string, lang: HxLanguageCode): string {
		const date = DateUtils.asJsDate(value);
		const [, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(date, lang, false);
		date.setDayOfMonth(date.getDayOfMonth() - dayOfCalendar + 1);
		const [eraOfFirstDay, yearOfFirstDay] = DateLocaleFormatUtils.formatDateInNumeric(date, lang, false);
		const yearStr = DateLocaleFormatUtils.yearAs(lang, date, () => {
			return [
				{type: 'year', value: `${yearOfFirstDay}`},
				{type: 'literal', value: '年'}
			];
		});
		return `${eraOfFirstDay}${yearStr}`;
	}

	/**
	 * Detects an era transition within a calendar month's days and returns a map
	 * of the first day of the new era to its era name.
	 *
	 * <p>In the Japanese Imperial calendar, an era change can occur mid-month
	 * (e.g., when an emperor abdicates or passes away). This method checks whether
	 * the first and last days of a given month belong to different eras, and if so,
	 * uses binary search to locate the exact day when the new era begins.</p>
	 *
	 * <h4>Special case</h4>
	 * <p>August 9, 1387, marks the transition from 至徳 (Shitoku) to 嘉慶 (Kakei).
	 * Due to the unusual offset mapping of the Julian-to-Gregorian conversion in
	 * that period, the binary search cannot reliably locate the boundary. A hardcoded
	 * lookup is used instead: day 22 (index 21) → 至徳, day 23 (index 22) → 嘉慶.</p>
	 *
	 * @param days - the computed days array for the calendar month
	 * @param lang - the locale language code for era name formatting
	 * @returns an empty Map if no era transition occurs in this month; otherwise a
	 *          Map with a single entry mapping the first {@link Date} of the new era
	 *          to its formatted era name string
	 */
	eraOfDays(days: ComputedDays, lang: HxLanguageCode): Map<UTCDate, string> {
		const daysOfThisMonth = days.filter(day => day.thisMonth);
		const firstDay = daysOfThisMonth[0].value;
		const [eraOfFirstDay] = DateLocaleFormatUtils.formatDateInNumeric(firstDay, lang, false);
		const lastDay = daysOfThisMonth[daysOfThisMonth.length - 1].value;
		const [eraOfLastDay] = DateLocaleFormatUtils.formatDateInNumeric(lastDay, lang, false);
		if (eraOfFirstDay === eraOfLastDay) {
			return new Map<UTCDate, string>();
		} else {
			const map = new Map<UTCDate, string>();
			// special case for 至徳
			if (firstDay.getFullYear() === 1387 && firstDay.getMonthIndex() === 7 && firstDay.getDayOfMonth() === 9) {
				map.set(daysOfThisMonth[21].value, '至徳');
				map.set(daysOfThisMonth[22].value, '嘉慶');
			} else {
				let startIndex = 0;
				let endIndex = daysOfThisMonth.length - 1;
				let foundDay: UTCDate = lastDay;
				while (startIndex <= endIndex) {
					const index = Math.floor((startIndex + endIndex) / 2);
					const [eraOfMidDay] = DateLocaleFormatUtils.formatDateInNumeric(daysOfThisMonth[index].value, lang, false);
					if (eraOfMidDay === eraOfFirstDay) {
						startIndex = index + 1;
					} else {
						foundDay = daysOfThisMonth[index].value;
						endIndex = index - 1;
					}
				}
				map.set(foundDay, eraOfLastDay);
			}
			return map;
		}
	}
}