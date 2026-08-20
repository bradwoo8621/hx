import type {HxLanguageCode} from '../../../contexts';
import {
	DateLocaleFormatUtils,
	DateLocaleGregorianProvider,
	DateLocaleNotGregorianHelper,
	DateMoveUtils,
	DateUtils,
	UTCDate
} from '../facade';
import type {
	ComputedDays,
	ComputedMonth,
	ComputedMonths,
	ComputedYear,
	ComputedYears,
	DateLocaleNotGregorianProvider,
	HxDate,
	HxFormattedEra,
	HxFormattedYear
} from '../interfaces';
import {DateLocaleGregorianAndJulianHelper} from './date-locale-gregorian-and-julian';
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

	/**
	 * Prevents external instantiation; access via {@link INSTANCE}.
	 */
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

	/**
	 * Registers the Japanese Imperial calendar with the locale and move providers.
	 */
	static enable() {
		DateLocaleFormatUtils.enableNotGregorianLocaleProvider(DateJapaneseUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveProvider(DateJapaneseUtils.INSTANCE);
	}

	/**
	 * Unregisters the Japanese Imperial calendar from the locale and move providers.
	 */
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
		const targetDayOfCalendar = super.computeTargetDayOfCalendarWithLeapCheck(
			targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar, DateJapaneseUtils.isLeapYear
		);
		if (targetYearOfCalendar === 1 && targetMonthOfCalendar === 1 && targetDayOfCalendar < 3) {
			return 3;
		} else {
			return targetDayOfCalendar;
		}
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
	 * <p>The Seireki (西暦) era uses year numbers offset from the Gregorian
	 * year (Seireki year = Gregorian year − 644), so its negative and zero
	 * year parts are converted back to Gregorian years: {@code 644 + year}
	 * for negative parts, {@code '644年'} for zero, and {@code '643年'} for
	 * the first-year ({@code 元}) part before Gregorian 645. Other eras keep
	 * the formatted year with its literal suffix; when no year part is found
	 * the full Gregorian year is used.</p>
	 *
	 * @param date    - the Gregorian date
	 * @param partsOf - callback that returns the formatted parts array
	 * @param _lang   - locale code (unused)
	 * @returns the formatted year string (e.g. {@code '7年'})
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	yearAs(date: UTCDate, partsOf: () => Array<Intl.DateTimeFormatPart>, _lang: HxLanguageCode): HxFormattedYear {
		const yearAndLiteral = DateLocaleFormatUtils.findYearAndLiteralFromFormattedParts(partsOf);
		if (yearAndLiteral.found) {
			// eslint-disable-next-line prefer-const
			let {year, literal} = yearAndLiteral;
			if (year.startsWith('-')) {
				return `${644 + Number(year)}年`;
			} else if (year === '0') {
				return '644年';
			} else if (year === '元' && date.getFullYear() < 645) {
				return '643年';
			} else {
				return [year, literal].join('');
			}
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
	yearHeaderLabel(value: HxDate, _era: HxFormattedEra, _year: HxFormattedYear, lang: HxLanguageCode): string {
		const date = DateUtils.asUtcDate(value);
		const [, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(date, lang, false);
		// The 1582 reform month has only 21 days (10/11-10/31, days 5-14 skipped).
		// In its first half the calendar day equals the Gregorian day minus 10, in
		// its second half the calendar day equals the Gregorian day, so the plain
		// walk-back below would land on 10/01; the month actually starts on 10/11,
		// hence the extra 10 days.
		if (date.getFullYear() === 1582 && date.getMonthIndex() === 9 && date.getDayOfMonth() > 14) {
			date.setDayOfMonth(date.getDayOfMonth() - dayOfCalendar + 1 + 10);
		} else {
			date.setDayOfMonth(date.getDayOfMonth() - dayOfCalendar + 1);
		}
		const [eraOfFirstDay, yearOfFirstDay] = DateLocaleFormatUtils.formatDate(date, lang, false);
		console.log(yearOfFirstDay);
		return `${eraOfFirstDay}${yearOfFirstDay}`;
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

	/**
	 * Shapes a months-panel cell from the first day of a Japanese month.
	 *
	 * <p>Moves the given date back to the first day of its calendar month
	 * (with the 1582/10 special case: that month has 21 days, the Gregorian
	 * October days 5–14 are skipped), then derives the era display:
	 * {@code era} is the era of the month's first day when it differs from
	 * the previous month's (January always shows the year's era), and
	 * {@code eras} lists the additional era names appearing inside the
	 * month. The only month with three eras — 1387/8, from the Nanboku-chō
	 * era overlap — is handled explicitly; otherwise the next month's first
	 * day is probed, since an era change inside this month always shows up
	 * there whatever the month length.</p>
	 *
	 * @param somedayOfMonth                     - the reference date; modified in place to the first day of its calendar month
	 * @param eraOfCalendarOfYearOrPreviousMonth - the era of the year's first month, or of the previous month; used to decide whether this month's era needs display
	 * @param offsetToBaseMonth                  - the month offset of the returned cell relative to the base month
	 * @param lang                               - locale code
	 * @returns the computed month cell for the first day of the calendar month
	 */
	private asComputedMonth(
		somedayOfMonth: UTCDate, eraOfCalendarOfYearOrPreviousMonth: HxFormattedEra | undefined, offsetToBaseMonth: number,
		lang: HxLanguageCode): ComputedMonth {
		// noinspection DuplicatedCode
		const [, , , day] = DateLocaleFormatUtils.formatDateInNumeric(somedayOfMonth, lang, false);
		const daysToFirstDay = (somedayOfMonth.getFullYear() === 1582 && somedayOfMonth.getMonthIndex() === 9 && somedayOfMonth.getDayOfMonth() > 14)
			? (day - 11)
			: (day - 1);
		if (daysToFirstDay !== 0) {
			// move to first day of month
			somedayOfMonth.setDayOfMonth(somedayOfMonth.getDayOfMonth() - daysToFirstDay);
		}
		const [eraOfCalendarOfMonth, , monthOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(somedayOfMonth, lang, false);

		let eras: Array<string> | undefined = (void 0);
		if (somedayOfMonth.getFullYear() === 1387 && monthOfCalendar === 8) {
			// the only case with 3 eras in one month, caused by the Nanboku-chō
			// period when the Southern and Northern courts changed era names
			// independently, so two changes could land in one month; since the
			// Meiji one-era-per-reign rule an era change happens only on
			// abdication or death, making such a month impossible today.
			// anchor on the calendar month/day (not the Gregorian day) so the
			// hardcode still applies if the ICU era table is ever revised.
			eras = ['至徳', '嘉慶'];
		} else {
			// probe the next month's first day: an era change inside this
			// month always shows up there, whatever the month length
			const firstDayOfNextMonth = UTCDate.cloneOf(somedayOfMonth);
			firstDayOfNextMonth.setDayOfMonth(firstDayOfNextMonth.getDayOfMonth() + 31);
			const [, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfNextMonth, lang, false);
			firstDayOfNextMonth.setDayOfMonth(firstDayOfNextMonth.getDayOfMonth() - (dayOfCalendar - 1));
			const [eraOfNextMonthStart] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfNextMonth, lang, false);
			if (eraOfNextMonthStart !== eraOfCalendarOfMonth) {
				eras = [eraOfNextMonthStart];
			}
		}
		let era: string | undefined = (void 0);
		if (eras != null) {
			// show the era of this month when there is more era of this month
			era = eraOfCalendarOfMonth;
		} else if (monthOfCalendar === 1) {
			// always show the era of year at first month
			era = eraOfCalendarOfYearOrPreviousMonth;
		} else if (eraOfCalendarOfMonth !== eraOfCalendarOfYearOrPreviousMonth) {
			// only show era when the era of first day of this month is not same as the era of first day of previous month
			era = eraOfCalendarOfMonth;
		}

		const firstDayOfThisMonth = DateUtils.asHxDate(somedayOfMonth);

		return {
			key: `${firstDayOfThisMonth.year}-${firstDayOfThisMonth.month}-${firstDayOfThisMonth.day}`,
			era, eras,
			label: DateLocaleFormatUtils.formatMonthShort(somedayOfMonth, lang, false),
			value: UTCDate.cloneOf(somedayOfMonth),
			offset: offsetToBaseMonth,
			bc: false,
			y10k: false
		};
	}

	/**
	 * Computes the 12-month grid for the months panel of the datetime input popup.
	 *
	 * <p>The grid is built month by month: January is anchored first (its era
	 * is the year's era), the months before the base month are walked back by
	 * 28 days per month and re-anchored to their first day, then the base
	 * month and the months after it are walked forward by 31 days. The era of
	 * each month is propagated forward, so a month shows its era only when it
	 * differs from the previous one. The 1582/10 short month is handled by the
	 * shared Gregorian-and-Julian first-day helper; the Gregorian grid is used
	 * when the Gregorian calendar is in force.</p>
	 *
	 * @param somedayOfYear - the reference date; its year and month determine the grid and the offsets
	 * @param lang          - locale code
	 * @param gregorian     - whether the Gregorian calendar is in use
	 * @returns the 12 months of the reference date's year
	 */
	monthsOfYear(somedayOfYear: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		if (gregorian) {
			return DateLocaleGregorianProvider.monthsOfYear(somedayOfYear, lang);
		}

		// move to first day of given date's month.
		const [firstDayOfBaseMonth, baseMonthOfCalendar] = DateLocaleGregorianAndJulianHelper.computeFirstDayOfMonth(somedayOfYear, lang);

		let eraOfCalendarOfYearOrPreviousMonth: HxFormattedEra | undefined;
		const months: ComputedMonths = [];
		{
			// Jan, split from before loop to get the era of year (by first day of this year)
			const tempDate = UTCDate.cloneOf(firstDayOfBaseMonth);
			// move to someday of Jan
			tempDate.setDayOfMonth(tempDate.getDayOfMonth() - 28 * (baseMonthOfCalendar - 1));
			const [, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(tempDate, lang, false);
			if (dayOfCalendar !== 1) {
				// move to first day of month
				tempDate.setDayOfMonth(tempDate.getDayOfMonth() - (dayOfCalendar - 1));
			}
			// get era of year
			[eraOfCalendarOfYearOrPreviousMonth] = DateLocaleFormatUtils.formatDateInNumeric(tempDate, lang, false);
			const computedMonth = this.asComputedMonth(tempDate, eraOfCalendarOfYearOrPreviousMonth, 1 - baseMonthOfCalendar, lang);
			months.push(computedMonth);
		}
		{
			// before base month
			for (let index = 2, endIndex = baseMonthOfCalendar - 1; index <= endIndex; index++) {
				const tempDate = UTCDate.cloneOf(firstDayOfBaseMonth);
				// move to last day of previous month
				tempDate.setDayOfMonth(tempDate.getDayOfMonth() - 28 * (baseMonthOfCalendar - index));
				const computedMonth = this.asComputedMonth(tempDate, eraOfCalendarOfYearOrPreviousMonth, index - baseMonthOfCalendar, lang);
				months.push(computedMonth);
				if (computedMonth.era != null) {
					// when era of month is same as previous, the era of computed month is undefined
					// then keep the origin, otherwise set as era of this month
					eraOfCalendarOfYearOrPreviousMonth = computedMonth.era;
				}
			}
		}
		// month of base day
		if (baseMonthOfCalendar !== 1) {
			const computedMonth = this.asComputedMonth(firstDayOfBaseMonth, eraOfCalendarOfYearOrPreviousMonth, 0, lang);
			months.push(computedMonth);
			if (computedMonth.era != null) {
				// when era of month is same as previous, the era of computed month is undefined
				// then keep the origin, otherwise set as era of this month
				eraOfCalendarOfYearOrPreviousMonth = computedMonth.era;
			}
		}
		// after base month
		{
			const tempDate = UTCDate.cloneOf(firstDayOfBaseMonth);
			for (let index = baseMonthOfCalendar + 1; index <= 12; index++) {
				// make sure jump to next month
				DateLocaleNotGregorianHelper.moveToSomedayOfNextMonth(tempDate, index);
				const computedMonth = this.asComputedMonth(tempDate, eraOfCalendarOfYearOrPreviousMonth, index - baseMonthOfCalendar, lang);
				months.push(computedMonth);
				if (computedMonth.era != null) {
					// when era of month is same as previous, the era of computed month is undefined
					// then keep the origin, otherwise set as era of this month
					eraOfCalendarOfYearOrPreviousMonth = computedMonth.era;
				}
			}
		}

		return months;
	}

	/**
	 * Converts the formatted era-internal year to the sequential calendar
	 * year used for computation.
	 *
	 * <p>The Japanese calendar is Gregorian-based, so the sequential year is
	 * the Gregorian year with the pre-reform boundary corrections (the
	 * year-internal number returned by the formatter has no meaning for
	 * computation).</p>
	 *
	 * @param somedayOfYear  - the reference date
	 * @param yearOfCalendar - the year of calendar as formatted by Intl (era-internal, meaningless for computation)
	 * @returns the sequential calendar year
	 */
	private computeYearOfCalendar(somedayOfYear: UTCDate, yearOfCalendar: number): number {
		return this.computeTargetYearOfCalendar(DateUtils.asHxDate(somedayOfYear), yearOfCalendar, 0);
	}

	/**
	 * Computes the start year of the years-around window.
	 *
	 * <p>The window is simply {@code baseYear − yearsToStart}, clamped to the
	 * Japanese calendar bounds [1, 9999], so the page is centered on the base
	 * year whenever it is not clamped.</p>
	 *
	 * @param baseYearOfCalendar  - the base sequential Japanese year
	 * @param _firstDayOfBaseYear - the first day of the base calendar year (unused)
	 * @returns [start year of calendar, forwardable, backwardable]
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private computeStartYear(baseYearOfCalendar: number, _firstDayOfBaseYear: UTCDate): [number, boolean, boolean] {
		const maxStartYearOfCalendar = 9999 - DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE + 1;
		const minStartYearOfCalendar = 1;
		const yearsToStart = Math.floor((DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE - 1) / 2);

		const startYearOfCalendar = Math.min(maxStartYearOfCalendar, Math.max(minStartYearOfCalendar, baseYearOfCalendar - yearsToStart));

		return [
			startYearOfCalendar, startYearOfCalendar !== maxStartYearOfCalendar, startYearOfCalendar !== minStartYearOfCalendar
		];
	}

	/**
	 * Shapes a year cell from the first day of the calendar year.
	 *
	 * <p>The era of the year's first day is returned for propagation to the
	 * following year, and is shown on the cell when it differs from the
	 * previous year's (unless additional eras are present, in which case the
	 * first-day era is always shown). {@code eras} lists the additional era
	 * names appearing inside the year; the only years with three eras — 749
	 * (天平/天平感宝/天平勝宝) and 1387 (元中/至徳/嘉慶, from the Nanboku-chō
	 * era overlap) — are handled explicitly, since the Meiji
	 * one-era-per-reign rule makes such years impossible today; otherwise
	 * the next year's first day is probed, because an era change inside this
	 * year always shows up there. The label is the formatted year, with
	 * Seireki years converted back to Gregorian years.</p>
	 *
	 * @param firstDayOfYear        - the first day of the cell's calendar year
	 * @param baseYearOfCalendar    - the base year of calendar
	 * @param currentYearOfCalendar - the current year of calendar
	 * @param eraOfPreviousYear     - the era of the previous year's first day, used to decide whether this year's era needs display
	 * @param lang                  - locale code
	 * @returns [the era of the year's first day, the computed year cell]
	 */
	private asComputedYear(
		firstDayOfYear: HxDate, baseYearOfCalendar: number, currentYearOfCalendar: number, eraOfPreviousYear: HxFormattedEra,
		lang: HxLanguageCode): [HxFormattedEra, ComputedYear] {
		const value = DateUtils.asUtcDate(firstDayOfYear);
		const yearOfCalendar = this.computeTargetYearOfCalendar(firstDayOfYear, -1, 0);

		const [eraOfFirstDay, yearOfFirstDay] = DateLocaleFormatUtils.formatDate(DateUtils.asUtcDate(firstDayOfYear), lang, false);

		// compute the era of last day
		let eras: Array<string> | undefined = (void 0);
		// the only two cases with 3 eras in one year; since the
		// Meiji one-era-per-reign rule an era change happens only on
		// abdication or death, making such a year impossible today.
		// anchor on the calendar year (not the Gregorian day) so the
		// hardcode still applies if the ICU era table is ever revised.
		if (yearOfCalendar === 1387) {
			eras = ['至徳', '嘉慶'];
		} else if (yearOfCalendar === 749) {
			// should be 天平感宝 and 天平勝宝, and the era of first day is 天平.
			// so for saving space, using 感宝 and 勝宝 instead
			eras = ['感宝', '勝宝'];
		} else {
			// move to last day of this year
			const lastDayOfYear = UTCDate.cloneOf(value);
			lastDayOfYear.setDayOfMonth(lastDayOfYear.getDayOfMonth() + 366);
			const [, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(lastDayOfYear, lang, false);
			lastDayOfYear.setDayOfMonth(lastDayOfYear.getDayOfMonth() - dayOfCalendar);
			const [eraOfLastDay] = DateLocaleFormatUtils.formatDate(lastDayOfYear, lang, false);
			if (eraOfLastDay !== eraOfFirstDay) {
				eras = [eraOfLastDay];
			}
		}

		return [
			eraOfFirstDay,
			{
				key: `${firstDayOfYear.year}-${firstDayOfYear.month}-${firstDayOfYear.day}`,
				era: (eraOfFirstDay === eraOfPreviousYear && eras == null) ? (void 0) : eraOfFirstDay,
				eras,
				label: yearOfFirstDay,
				value,
				offset: yearOfCalendar - baseYearOfCalendar,
				thisYear: yearOfCalendar === currentYearOfCalendar
			}
		];
	}

	/**
	 * Computes the years grid around a reference year for the years panel of
	 * the Japanese calendar.
	 *
	 * <p>Delegates to the Gregorian provider when the Gregorian calendar is
	 * in use. The window is centered on the reference year and clamped to
	 * the Japanese calendar bounds [1, 9999]; each cell holds the first day
	 * of its calendar year in ICU semantics and the era of each year is
	 * propagated forward, so a year shows its era only when it differs from
	 * the previous one; clicking uses the cell offset, never the cell
	 * date.</p>
	 *
	 * @param baseDate    - the reference date; its year centers the grid window and the offsets
	 * @param currentDate - the current value date; its year marks the "this year" cell
	 * @param lang        - locale code
	 * @param gregorian   - whether the Gregorian calendar is in use
	 * @returns the years around the reference year, with pagination flags
	 */
	yearsAround(baseDate: UTCDate, currentDate: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedYears {
		if (gregorian) {
			return DateLocaleGregorianProvider.yearsAround(baseDate, currentDate, lang);
		}

		// get current year
		let [, currentYearOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(currentDate, lang, false);
		currentYearOfCalendar = this.computeYearOfCalendar(currentDate, currentYearOfCalendar);

		// move to first day of calendar of given year
		const [firstDayOfBaseYear, baseYearOfCalendar] = DateLocaleGregorianAndJulianHelper.computeFirstDayOfYear(baseDate, (somedayOfYear, yearOfCalendar) => {
			return this.computeYearOfCalendar(somedayOfYear, yearOfCalendar);
		}, lang);
		// compute start year of calendar
		const [startYearOfCalendar, forward, backward] = this.computeStartYear(baseYearOfCalendar, firstDayOfBaseYear);
		// move to 1st day, 1st month, start year
		const firstDayOfStartYear = DateLocaleGregorianAndJulianHelper.moveToFirstDayOfYearsAround(firstDayOfBaseYear, baseYearOfCalendar, startYearOfCalendar, (void 0), lang);

		const years: Array<ComputedYear> = [];
		let eraOfPreviousYear: HxFormattedEra;
		// pass empty string, make sure to show the era of first year
		const [era, computedYear] = this.asComputedYear(DateUtils.asHxDate(firstDayOfStartYear), baseYearOfCalendar, currentYearOfCalendar, '', lang);
		eraOfPreviousYear = era;
		years.push(computedYear);
		let firstDayOfThisYear = UTCDate.cloneOf(firstDayOfStartYear);
		for (let index = 1; index < DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE; index++) {
			firstDayOfThisYear = DateLocaleNotGregorianHelper.moveToSomedayOfJanOfNextYear(firstDayOfThisYear, lang);
			const [, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(firstDayOfThisYear, lang, false);
			if (dayOfCalendar !== 1) {
				firstDayOfThisYear.setDayOfMonth(firstDayOfThisYear.getDayOfMonth() - (dayOfCalendar - 1));
			}
			const [era, computedYear] = this.asComputedYear(DateUtils.asHxDate(firstDayOfThisYear), baseYearOfCalendar, currentYearOfCalendar, eraOfPreviousYear, lang);
			years.push(computedYear);
			eraOfPreviousYear = era;
		}

		return {forward, backward, years};
	}
}
