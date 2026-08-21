import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleFormatUtils, DateMoveUtils, DateUtils, UTCDate} from '../facade';
import type {
	ComputedMonths,
	ComputedYear,
	ComputedYears,
	DateLocaleNotGregorianProvider,
	HxDate,
	HxFormattedEra,
	HxFormattedYear
} from '../interfaces';
import {
	DateLocaleGregorianAndJulianHelper,
	type DateLocaleGregorianAndJulianYearsAroundFunctions
} from './date-locale-gregorian-and-julian';
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
		// after Before-Minguo 329 (includes), and Before-Minguo 330/11, 330/12, roc is same as gregory exactly
		isOrAfter158211: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar >= -329 || (yearOfCalendar === -330 && monthOfCalendar >= 11);
		},
		// Before-Minguo 330/10, roc has 21 days (has no day 5-14), gregory is from 1582/10/11 to 1582/10/31
		is158210: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === -330 && monthOfCalendar === 10;
		},
		// Before-Minguo 412/03 to Before-Minguo 330/09, roc (month x/day y) -> gregory (month x/day y + 10)
		isOrBetween150003_158209: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -412 || (yearOfCalendar === -412 && monthOfCalendar >= 3);
		},
		// Before-Minguo 512/03 to Before-Minguo 412/02, roc (month x/day y) -> gregory (month x/day y + 9)
		isOrBetween140003_150002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -512 || (yearOfCalendar === -512 && monthOfCalendar >= 3);
		},
		// Before-Minguo 612/03 to Before-Minguo 512/02, roc (month x/day y) -> gregory (month x/day y + 8)
		isOrBetween130003_140002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -612 || (yearOfCalendar === -612 && monthOfCalendar >= 3);
		},
		// Before-Minguo 812/03 to Before-Minguo 612/02, roc (month x/day y) -> gregory (month x/day y + 7)
		isOrBetween110003_130002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -812 || (yearOfCalendar === -812 && monthOfCalendar >= 3);
		},
		// Before-Minguo 912/03 to Before-Minguo 812/02, roc (month x/day y) -> gregory (month x/day y + 6)
		isOrBetween100003_110002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -912 || (yearOfCalendar === -912 && monthOfCalendar >= 3);
		},
		// Before-Minguo 1012/03 to Before-Minguo 912/02, roc (month x/day y) -> gregory (month x/day y + 5)
		isOrBetween090003_100002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1012 || (yearOfCalendar === -1012 && monthOfCalendar >= 3);
		},
		// Before-Minguo 1212/03 to Before-Minguo 1012/02, roc (month x/day y) -> gregory (month x/day y + 4)
		isOrBetween070003_090002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1212 || (yearOfCalendar === -1212 && monthOfCalendar >= 3);
		},
		// Before-Minguo 1312/03 to Before-Minguo 1212/02, roc (month x/day y) -> gregory (month x/day y + 3)
		isOrBetween060003_070002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1312 || (yearOfCalendar === -1312 && monthOfCalendar >= 3);
		},
		// Before-Minguo 1412/03 to Before-Minguo 1312/02, roc (month x/day y) -> gregory (month x/day y + 2)
		isOrBetween050003_060002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1412 || (yearOfCalendar === -1412 && monthOfCalendar >= 3);
		},
		// Before-Minguo 1612/03 to Before-Minguo 1412/02, roc (month x/day y) -> gregory (month x/day y + 1)
		isOrBetween030003_050002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1612 || (yearOfCalendar === -1612 && monthOfCalendar >= 3);
		},
		// Before-Minguo 1612/02 29 days, gregory 300/02 28 days. roc 2/1-28 -> gregory 2/1-28; roc 2/29 -> gregory 3/1
		is030002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === -1612 && monthOfCalendar === 2;
		},
		// Before-Minguo 1712/03 to Before-Minguo 1612/01, roc is same as gregory exactly
		isOrBetween020003_030001: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1712 || (yearOfCalendar === -1712 && monthOfCalendar >= 3);
		},
		// Before-Minguo 1812/03 to Before-Minguo 1712/02, roc (month x/day y) -> gregory (month x/day y - 1)
		isOrBetween010003_020002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1812 || (yearOfCalendar === -1812 && monthOfCalendar >= 3);
		},
		// Before-Minguo 1911/01, days from 3-31, reset to 3 if given day of calendar is less than 3. roc (month x/day y) -> gregory (month x/day y - 2)
		is000101: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === -1911 && monthOfCalendar === 1;
		},
		// Before-Minguo 1911/02 to Before-Minguo 1812/02, roc (month x/day y) -> gregory (month x/day y - 2)
		// to gregory year by year of calendar
		toGregoryYear: (yearOfCalendar: number) => yearOfCalendar > 0 ? (yearOfCalendar + 1911) : (yearOfCalendar + 1912)
	};
	static readonly INSTANCE = new DateMinguoUtils();
	private static readonly YearsAroundFuncs: DateLocaleGregorianAndJulianYearsAroundFunctions = {
		computeYearOfCalendar: (date: UTCDate, yearOfCalendar: number): number => {
			return DateMinguoUtils.INSTANCE.computeYearOfCalendar(date, yearOfCalendar);
		},
		computeStartYear: (baseYearOfCalendar: number, firstDayOfBaseYear: UTCDate): [number, boolean, boolean] => {
			return DateMinguoUtils.INSTANCE.computeStartYear(baseYearOfCalendar, firstDayOfBaseYear);
		},
		computeYearOffset: (sourceYearOfCalendar: number, targetYearOfCalendar: number): number => {
			return DateMinguoUtils.INSTANCE.computeYearOffset(sourceYearOfCalendar, targetYearOfCalendar);
		},
		asComputedYear: (firstDayOfYear: HxDate, baseYearOfCalendar: number, currentYearOfCalendar: number, lang: HxLanguageCode): ComputedYear => {
			return DateMinguoUtils.INSTANCE.asComputedYear(firstDayOfYear, baseYearOfCalendar, currentYearOfCalendar, lang);
		}
	};

	/**
	 * Prevents external instantiation; access via {@link INSTANCE}.
	 */
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

	/**
	 * Registers the ROC (Minguo) calendar with the locale and move providers.
	 */
	static enable() {
		DateLocaleFormatUtils.enableNotGregorianLocaleProvider(DateMinguoUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveProvider(DateMinguoUtils.INSTANCE);
	}

	/**
	 * Unregisters the ROC (Minguo) calendar from the locale and move providers.
	 */
	static disable() {
		DateLocaleFormatUtils.disableNotGregorianLocaleProvider(DateMinguoUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveProvider(DateMinguoUtils.INSTANCE);
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
	 * @returns the target ROC year, clamped to ≥ −1911 (Gregorian 1 CE) and ≤ 8088
	 */
	protected computeTargetYearOfCalendar(date: HxDate, yearOfCalendar: number, yearOffset: number): number {
		const yearOfGregory = date.year;
		if (yearOfGregory < 1912) {
			// convert Before-Minguo year of calendar to negative value, which starts from -1
			yearOfCalendar = 0 - yearOfCalendar;
		}
		// noinspection DuplicatedCode
		let targetYearOfCalendar: number;
		if (yearOfCalendar > 0) {
			// Minguo starts from 1
			if (yearOffset > 0) {
				targetYearOfCalendar = yearOfCalendar + yearOffset;
			} else {
				targetYearOfCalendar = yearOfCalendar + yearOffset;
				if (targetYearOfCalendar <= 0) {
					// Before-Minguo starts from -1
					targetYearOfCalendar = targetYearOfCalendar - 1;
				}
			}
		} else if (yearOffset < 0) {
			// Before-Minguo starts from -1
			targetYearOfCalendar = yearOfCalendar + yearOffset;
		} else {
			// Before-Minguo starts from -1
			targetYearOfCalendar = yearOfCalendar + yearOffset;
			if (targetYearOfCalendar >= 0) {
				targetYearOfCalendar = targetYearOfCalendar + 1;
			}
		}
		// ROC −1911/01/03 is Gregorian 0001/01/01
		return Math.min(8088, Math.max(-1911, targetYearOfCalendar));
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
		const targetDayOfCalendar = super.computeTargetDayOfCalendarWithLeapCheck(
			targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar, DateMinguoUtils.isLeapYear
		);
		if (targetYearOfCalendar === -1911 && targetMonthOfCalendar === 1 && targetDayOfCalendar < 3) {
			return 3;
		} else {
			return targetDayOfCalendar;
		}
	}

	/**
	 * Map a ROC calendar date ({@code year}, {@code month}, {@code day}) to a
	 * Gregorian date, accounting for the Julian–Gregorian offset that accumulated
	 * over twelve century-years before the 1582 reform.
	 *
	 * @param targetOfCalendar - ROC date as {@code {year, month, day}}
	 * @returns equivalent Gregorian date
	 */
	protected moveDateTo(targetOfCalendar: HxDate): HxDate {
		return this.moveDateToWithRanges(targetOfCalendar, DateMinguoUtils.ToGregoryAndJulianRanges);
	}

	/**
	 * Extracts the formatted era string from {@link Intl.DateTimeFormat} parts.
	 *
	 * @param _date   - the Gregorian date (unused)
	 * @param partsOf - callback that returns the formatted parts array
	 * @param _lang   - locale (unused)
	 * @returns the formatted era string, or an empty string
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	eraAs(_date: UTCDate, partsOf: () => Array<Intl.DateTimeFormatPart>, _lang: HxLanguageCode): HxFormattedEra {
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
	 * @param date     - the Gregorian date
	 * @param partsOf  - callback that returns the formatted parts array
	 * @param _lang    - locale (unused; the era suffix is locale-independent in ROC)
	 * @returns the year string with its literal suffix (e.g. {@code "113年"})
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	yearAs(date: UTCDate, partsOf: () => Array<Intl.DateTimeFormatPart>, _lang: HxLanguageCode): HxFormattedYear {
		const yearAndLiteral = DateLocaleFormatUtils.findYearAndLiteralFromFormattedParts(partsOf);
		if (yearAndLiteral.found) {
			const {year, literal} = yearAndLiteral;
			return [year, literal].join('');
		} else {
			return String(date.getFullYear());
		}
	}

	/**
	 * Returns the concatenated era + year label without a space.
	 *
	 * <p>Chinese formatting needs no space between the era and the year
	 * (e.g. {@code '民國113年'}); this overrides the default era + year label
	 * which inserts a space.</p>
	 *
	 * @param _value - the picked date value (unused)
	 * @param era    - formatted era string
	 * @param year   - formatted year string
	 * @param _lang  - locale code (unused)
	 * @returns the era + year label (e.g. {@code '民國113年'})
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	yearHeaderLabel(_value: HxDate, era: HxFormattedEra, year: HxFormattedYear, _lang: HxLanguageCode): string {
		return `${era}${year}`;
	}

	/**
	 * Computes the 12-month grid for the months panel in the Minguo calendar.
	 *
	 * <p>Shares the implementation with other Gregorian-and-Julian calendars via
	 * {@link DateLocaleGregorianAndJulianHelper#monthsOfYear}.</p>
	 *
	 * @param somedayOfYear      - the reference date; its year and month determine the grid and the offsets
	 * @param currentDate - the current value date; its year marks the "this month" cell
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the 12 months of the reference date's year
	 */
	monthsOfYear(somedayOfYear: UTCDate, currentDate: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		return DateLocaleGregorianAndJulianHelper.monthsOfYear(somedayOfYear, currentDate, lang, gregorian);
	}

	/**
	 * has no year 0, and formatted year always be positive value, fix it
	 */
	private computeYearOfCalendar(somedayOfYear: UTCDate, yearOfCalendar: number): number {
		if (somedayOfYear.getFullYear() < 1912) {
			return 0 - yearOfCalendar;
		} else {
			return yearOfCalendar;
		}
	}

	/**
	 * Computes the start Minguo year of the years-around page, centered on the
	 * given base year and clamped to the calendar bounds [−1911, 8088].
	 *
	 * <p>The Minguo calendar has no year 0 (the year before 民國1 is 民國前1,
	 * i.e. −1), so when the window crosses the era boundary (base year 1–12)
	 * it shifts back by one extra year.</p>
	 *
	 * @param baseYearOfCalendar  - the base Minguo year (reformed)
	 * @param _firstDayOfBaseYear - the first day of the base calendar year (unused)
	 * @returns [start year of calendar, forwardable, backwardable]
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private computeStartYear(baseYearOfCalendar: number, _firstDayOfBaseYear: UTCDate): [number, boolean, boolean] {
		const maxStartYearOfCalendar = 8088 - DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE + 1;
		const minStartYearOfCalendar = -1911;
		const yearsToStart = Math.floor((DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE - 1) / 2);

		let startYearOfCalendar: number;
		if (baseYearOfCalendar > yearsToStart || baseYearOfCalendar < 0) {
			startYearOfCalendar = Math.min(maxStartYearOfCalendar, Math.max(minStartYearOfCalendar, baseYearOfCalendar - yearsToStart));
		} else {
			// fix the "no year 0" issue
			startYearOfCalendar = Math.min(maxStartYearOfCalendar, Math.max(minStartYearOfCalendar, baseYearOfCalendar - yearsToStart - 1));
		}

		return [
			startYearOfCalendar, startYearOfCalendar !== maxStartYearOfCalendar, startYearOfCalendar !== minStartYearOfCalendar
		];
	}

	/**
	 * Fixes the year offset for the years-around walk across the no-year-0 era
	 * boundary: moving from a Republic-era year to a pre-Republic year counts
	 * one extra year (the gap where year 0 would be).
	 *
	 * @param baseYearOfCalendar           - the base Minguo year (reformed)
	 * @param firstYearOfCalendarOfYearsAround - the first year of the years page (reformed)
	 * @returns the year offset to walk from the base year to the first year
	 */
	private computeYearOffset(baseYearOfCalendar: number, firstYearOfCalendarOfYearsAround: number): number {
		return (firstYearOfCalendarOfYearsAround < 0 && baseYearOfCalendar > 0)
			? (firstYearOfCalendarOfYearsAround - baseYearOfCalendar + 1)
			: (firstYearOfCalendarOfYearsAround - baseYearOfCalendar);
	}

	/**
	 * Shapes a year cell from the first day of the calendar year, with the
	 * offset fixed across the no-year-0 era boundary.
	 *
	 * <p>The cell year is reformed via {@link computeYearOfCalendar} (negative
	 * for pre-Republic years). The label is the formatted Minguo year with a
	 * {@code 前} prefix for the pre-Republic era and the trailing {@code 年}
	 * stripped. The offset compensates the missing year 0 (…, −1, 1, …): a
	 * cell before the era against a Republic-era base year counts one extra
	 * year ({@code year − base + 1}) and vice versa ({@code year − base − 1}).</p>
	 *
	 * @param firstDayOfYear        - the first day of the cell's calendar year
	 * @param baseYearOfCalendar    - the base year of calendar (reformed)
	 * @param currentYearOfCalendar - the current year of calendar (reformed)
	 * @param lang                  - locale code
	 * @returns the computed year cell
	 */
	private asComputedYear(firstDayOfYear: HxDate, baseYearOfCalendar: number, currentYearOfCalendar: number, lang: HxLanguageCode): ComputedYear {
		// noinspection DuplicatedCode
		const value = DateUtils.asUtcDate(firstDayOfYear);
		let [
			// eslint-disable-next-line prefer-const
			eraOfCalendar, yearOfCalendar
		] = DateLocaleFormatUtils.formatDateInNumeric(value, lang, false);
		yearOfCalendar = this.computeYearOfCalendar(value, yearOfCalendar);

		// fixed the "no 0 year" issue
		let offset: number;
		if (yearOfCalendar < 0 && baseYearOfCalendar > 0) {
			offset = yearOfCalendar - baseYearOfCalendar + 1;
		} else if (yearOfCalendar > 0 && baseYearOfCalendar < 0) {
			offset = yearOfCalendar - baseYearOfCalendar - 1;
		} else {
			// same sign
			offset = yearOfCalendar - baseYearOfCalendar;
		}

		return {
			key: `${firstDayOfYear.year}-${firstDayOfYear.month}-${firstDayOfYear.day}`,
			era: eraOfCalendar === '民國前' ? '前' : (void 0),
			label: DateLocaleFormatUtils.formatYear(value, lang, false),
			value,
			offset,
			thisYear: yearOfCalendar === currentYearOfCalendar
		};
	}

	/**
	 * Computes the years grid around a reference year for the years panel in the
	 * Minguo calendar.
	 *
	 * <p>Delegates to the Gregorian provider when the Gregorian calendar is in use.
	 * The window is centered on the reference year and clamped to the Minguo
	 * calendar boundaries [−1911, 8088]. Each cell holds the first day of its
	 * calendar year in ICU semantics, so at the bottom clamp the first cell may
	 * anchor at −1911/1/1 (Gregorian 1 BCE 1/1); clicking uses the cell offset,
	 * never the cell date.</p>
	 *
	 * @param somedayOfYear    - the reference date; its year centers the grid window and the offsets
	 * @param currentDate - the current value date; its year marks the "this year" cell
	 * @param lang        - locale code
	 * @param gregorian   - whether the Gregorian calendar is in use
	 * @returns the years around the reference year, with pagination flags
	 */
	yearsAround(somedayOfYear: UTCDate, currentDate: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedYears {
		return DateLocaleGregorianAndJulianHelper.yearsAround(somedayOfYear, currentDate, DateMinguoUtils.YearsAroundFuncs, lang, gregorian);
	}
}
