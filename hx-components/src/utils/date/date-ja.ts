import type {HxLanguageCode} from '../../contexts';
import type {HxDateTimeValue} from '../../types';
import {DateLocaleUtils} from './date-locale';
import {DateMoveUtils} from './date-move';
import {DateMoveGregoryAndJulianUtils, type GregoryAndJulianMovementRanges} from './date-move-gregory-and-julian';
import {DateMoveInternalUtils} from './date-move-internal';
import type {ComputedDays, HxFormattedEra, HxFormattedYear, MoveDate} from './date-types';

export class DateJaUtils {
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
	private static readonly ToGregoryAndJulianRanges: GregoryAndJulianMovementRanges = {
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

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	// noinspection JSUnusedGlobalSymbols
	static calendar(): string {
		return 'japanese';
	}

	// noinspection JSUnusedGlobalSymbols
	static supportedLanguages(): string[] {
		return [
			'ja',   // Japanese Imperial calendar (era-based)
			'ja-JP' // Japanese, Japan
		];
	}

	static enable() {
		DateLocaleUtils.enableNotGregorianLocaleUtils(DateJaUtils);
		DateMoveUtils.enableNotGregorianMoveUtils(DateJaUtils);
	}

	// noinspection JSUnusedGlobalSymbols
	static disable() {
		DateLocaleUtils.disableNotGregorianLocaleUtils(DateJaUtils);
		DateMoveUtils.disableNotGregorianMoveUtils(DateJaUtils);
	}

	/** Returns {@code true} when the language uses the Japanese calendar. */
	// noinspection JSUnusedGlobalSymbols
	static accept(lang: HxLanguageCode): boolean {
		return lang === 'ja-JP'
			|| lang === 'ja'
			|| lang.startsWith('ja-');
	}

	/**
	 * Japanese calendar leap-year check.
	 *
	 * The Japanese calendar year is really a mess, so use the Gregorian year.
	 * The appropriate rule is selected based on the Gregorian reform boundary:
	 * - Before 1582: Julian rule (every 4th year is leap, including century years)
	 * - 1582 onward:  Gregorian rule (divisible by 400, or by 4 but not 100)
	 */
	static isLeapYear(yearOfGregory: number): boolean {
		if (yearOfGregory < 1582) {
			return DateLocaleUtils.isJulianLeapYear(yearOfGregory);
		} else {
			return DateLocaleUtils.isGregorianLeapYear(yearOfGregory);
		}
	}

	/**
	 * - before Gregorian 645/1/3 (includes): 西暦
	 * - era is 大化, year part is zero or negative: 西暦
	 * - otherwise follows formatted era
	 */
	// noinspection JSUnusedGlobalSymbols
	static eraAs(_lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedEra {
		const year = date.getFullYear();
		if (year < 645 || (year === 645 && date.getMonth() === 0 && date.getDate() < 4)) {
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
	 * - Gregorian year < 100, then append 年 after full Gregorian year
	 * - year part is negative or zero, then append 年 after Gregorian year
	 */
	// noinspection JSUnusedGlobalSymbols
	static yearAs(_lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedYear {
		const year = date.getFullYear();
		if (year < 100) {
			return `${year}年`;
		}
		const yearAndLiteral = DateLocaleUtils.findYearAndLiteralFromFormattedParts(partsOf);
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
	 * Convert a Gregorian date to a sequential calendar year for year-offset movement.
	 *
	 * Because the Julian–Gregorian offset pushes calendar dates backward by a number
	 * of days, dates in early January may still fall into the previous calendar year.
	 * This method corrects that by subtracting 1 from the Gregorian year in the
	 * early-January window, and reverts the adjustment for negative-offset ranges
	 * where the calendar year runs ahead of the Gregorian year at the December boundary.
	 *
	 * <h3>Adjustment rules</h3>
	 *
	 * | Gregorian year | January day range | Adjustment | Notes |
	 * |---|---|---|---|
	 * | ≥ 1583 | — | ±0 | post-reform, same year |
	 * | 1501–1582 | day ≤ 10 | −1 | Julian offset +10 |
	 * | 1401–1500 | day ≤ 9 | −1 | Julian offset +9 |
	 * | 1301–1400 | day ≤ 8 | −1 | Julian offset +8 |
	 * | 1101–1300 | day ≤ 7 | −1 | Julian offset +7 |
	 * | 1001–1100 | day ≤ 6 | −1 | Julian offset +6 |
	 * | 901–1000 | day ≤ 5 | −1 | Julian offset +5 |
	 * | 701–900 | day ≤ 4 | −1 | Julian offset +4 |
	 * | 601–700 | day ≤ 3 | −1 | Julian offset +3 |
	 * | 501–600 | day ≤ 2 | −1 | Julian offset +2 |
	 * | 301–500 | day = 1 | −1 | Julian offset +1 |
	 * | 200–300 | — | ±0 | Julian offset 0 |
	 * | 100–199 | Dec 31 | +1 | Julian offset −1 (year-end boundary) |
	 * | 1–99 | Dec 30/31 | +1 | Julian offset −2 |
	 */
	static convertYearOfCalendar(date: MoveDate): number {
		const {year, month, day} = date;
		if (year >= 1583) {
			return year;
		} else if (year > 1500 && month === 1 && day <= 10) {
			return year - 1;
		} else if (year > 1400 && month === 1 && day <= 9) {
			return year - 1;
		} else if (year > 1300 && month === 1 && day <= 8) {
			return year - 1;
		} else if (year > 1100 && month === 1 && day <= 7) {
			return year - 1;
		} else if (year > 1000 && month === 1 && day <= 6) {
			return year - 1;
		} else if (year > 900 && month === 1 && day <= 5) {
			return year - 1;
		} else if (year > 700 && month === 1 && day <= 4) {
			return year - 1;
		} else if (year > 600 && month === 1 && day <= 3) {
			return year - 1;
		} else if (year > 500 && month === 1 && day <= 2) {
			return year - 1;
		} else if (year > 300 && month === 1 && day === 1) {
			return year - 1;
		} else if (year >= 200) {
			return year;
		} else if (year >= 100 && month === 12 && day === 31) {
			return year + 1;
		} else if (year < 100 && month === 12 && day >= 30) {
			return year + 1;
		} else {
			return year;
		}
	}

	/**
	 * Clamp a day number to the valid range for the target Japanese month.
	 *
	 * @see DateMoveGregoryAndJulianUtils#computeTargetDayOfCalendar
	 */
	static computeTargetDayOfCalendar(targetYearOfCalendar: number, targetMonthOfCalendar: number, dayOfCalendar: number): number {
		return DateMoveGregoryAndJulianUtils.computeTargetDayOfCalendar(
			targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar, DateJaUtils.isLeapYear
		);
	}

	/**
	 * Map a Japanese calendar date to its equivalent Gregorian date.
	 *
	 * @see DateMoveGregoryAndJulianUtils#moveDateTo
	 */
	private static moveDateTo(targetOfCalendar: MoveDate): MoveDate {
		return DateMoveGregoryAndJulianUtils.moveDateTo(targetOfCalendar, DateJaUtils.ToGregoryAndJulianRanges);
	}

	/**
	 * Move a Gregorian date by the given number of years in the Japanese calendar.
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @param lang       - locale, used to format the date in Japanese representation
	 * @returns the moved date in Gregorian
	 */
	// noinspection JSUnusedGlobalSymbols
	static moveYear(date: MoveDate, yearOffset: number, lang: HxLanguageCode): MoveDate {
		if (yearOffset === 0) {
			return {...date};
		}

		const [, , monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(DateMoveInternalUtils.asJsDate(date), lang, false);
		const targetYearOfCalendar = Math.max(1, DateJaUtils.convertYearOfCalendar(date) + yearOffset);
		const targetDayOfCalendar = DateJaUtils.computeTargetDayOfCalendar(targetYearOfCalendar, monthOfCalendar, dayOfCalendar);

		return DateJaUtils.moveDateTo({
			year: targetYearOfCalendar, month: monthOfCalendar, day: targetDayOfCalendar
		});
	}

	/**
	 * Move a Gregorian date by the given number of months in the Japanese calendar.
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @param lang        - locale, used to format the date in Japanese representation
	 * @returns the moved date in Gregorian
	 */
	// noinspection JSUnusedGlobalSymbols
	static moveMonth(date: MoveDate, monthOffset: number, lang: HxLanguageCode): MoveDate {
		if (monthOffset === 0) {
			return {...date};
		}

		const [, , monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(DateMoveInternalUtils.asJsDate(date), lang, false);
		// compute target year/month of calendar
		const {
			yearOffset, targetMonthOfCalendar
		} = DateMoveGregoryAndJulianUtils.computeYearOffsetAndTargetMonthOfCalendar(monthOfCalendar, monthOffset);
		const targetYearOfCalendar = Math.max(1, DateJaUtils.convertYearOfCalendar(date) + yearOffset);
		// compute target day of calendar
		const targetDayOfCalendar = DateJaUtils.computeTargetDayOfCalendar(targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar);
		return DateJaUtils.moveDateTo({
			year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar
		});
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
	 * @param lang - the locale language code for era/year formatting
	 * @param value - the date-time value whose month is used as the reference
	 * @param _era - intentionally unused; the era is derived from the first day of the month
	 * @param _year - the year string to use when constructing the formatted year portion
	 * @returns the concatenated era name and formatted year string (e.g. "令和7年")
	 */
	// noinspection JSUnusedGlobalSymbols
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static labelOfYear(lang: HxLanguageCode, value: Required<HxDateTimeValue>, _era: string, _year: string): string {
		const date = DateMoveInternalUtils.asJsDate(value);
		const [, , , dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
		date.setDate(date.getDate() - dayOfCalendar + 1);
		const [eraOfFirstDay, yearOfFirstDay] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
		const yearStr = DateLocaleUtils.yearAs(lang, date, () => {
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
	 * @param lang - the locale language code for era name formatting
	 * @param days - the computed days array for the calendar month
	 * @returns an empty Map if no era transition occurs in this month; otherwise a
	 *          Map with a single entry mapping the first {@link Date} of the new era
	 *          to its formatted era name string
	 */
	// noinspection JSUnusedGlobalSymbols
	static eraOfDays(lang: HxLanguageCode, days: ComputedDays): Map<Date, string> {
		const daysOfThisMonth = days.filter(day => day.thisMonth);
		const firstDay = daysOfThisMonth[0].value;
		const [eraOfFirstDay] = DateLocaleUtils.formatDateInNumeric(firstDay, lang, false);
		const lastDay = daysOfThisMonth[daysOfThisMonth.length - 1].value;
		const [eraOfLastDay] = DateLocaleUtils.formatDateInNumeric(lastDay, lang, false);
		if (eraOfFirstDay === eraOfLastDay) {
			return new Map<Date, string>();
		} else {
			const map = new Map<Date, string>();
			// special case for 至徳
			if (firstDay.getFullYear() === 1387 && firstDay.getMonth() === 7 && firstDay.getDate() === 9) {
				map.set(daysOfThisMonth[21].value, '至徳');
				map.set(daysOfThisMonth[22].value, '嘉慶');
			} else {
				let startIndex = 0;
				let endIndex = daysOfThisMonth.length - 1;
				let foundDay: Date = lastDay;
				while (startIndex <= endIndex) {
					const index = Math.floor((startIndex + endIndex) / 2);
					const [eraOfMidDay] = DateLocaleUtils.formatDateInNumeric(daysOfThisMonth[index].value, lang, false);
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