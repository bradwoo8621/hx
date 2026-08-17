import type {HxLanguageCode} from '../../../contexts';
import {
	DateLocaleFormatUtils,
	DateLocaleNotGregorianHelper,
	type DateLocaleNotGregorianMonthsOfYearFunctions,
	type DateLocaleNotGregorianYearsAroundFunctions,
	DateMoveUtils,
	DateUtils,
	UTCDate
} from '../facade';
import type {
	ComputedMonth,
	ComputedMonths,
	ComputedYear,
	ComputedYears,
	DateLocaleNotGregorianProvider,
	HxDate,
	HxFormattedEra
} from '../interfaces';
import type {DateMoveTargetMonthAndDayOfCalendar, DateMoveTargetYearOfCalendar} from '../months-any';
import {DateLocaleCopticAndEthiopicHelper} from './date-locale-coptic-and-ethiopic';
import {DateMoveCopticAndEthiopicUtils} from './date-move-coptic-and-ethiopic';

export class DateCopticUtils extends DateMoveCopticAndEthiopicUtils implements DateLocaleNotGregorianProvider {
	static readonly INSTANCE = new DateCopticUtils();
	// wires the Coptic-specific cell shaping (bc/y10k flags) into the shared months-panel skeleton
	private static readonly MonthsOfYearFuncs: DateLocaleNotGregorianMonthsOfYearFunctions = {
		asComputedMonth: (date: UTCDate, offset: number, lang: HxLanguageCode): ComputedMonth => {
			return DateCopticUtils.INSTANCE.asComputedMonth(date, offset, lang);
		}
	};
	// wires the Coptic-specific year reform, anchoring and cell shaping into the shared years-panel skeleton
	private static readonly YearsAroundFuncs: DateLocaleNotGregorianYearsAroundFunctions = {
		computeYearOfCalendar: (date: UTCDate, yearOfCalendar: number): number => {
			return DateCopticUtils.INSTANCE.computeYearOfCalendar(date, yearOfCalendar);
		},
		computeStartYear: (baseYearOfCalendar: number, firstDayOfBaseYear: UTCDate): [number, boolean, boolean] => {
			return DateCopticUtils.INSTANCE.computeStartYear(baseYearOfCalendar, firstDayOfBaseYear);
		},
		computeYearOffset: (baseYearOfCalendar: number, firstYearOfCalendarOfYearsAround: number): number => {
			return DateCopticUtils.INSTANCE.computeYearOffset(baseYearOfCalendar, firstYearOfCalendarOfYearsAround);
		},
		computeFirstDayOfYear: (
			date: UTCDate, computeYearOfCalendar: DateLocaleNotGregorianYearsAroundFunctions['computeYearOfCalendar'],
			lang: HxLanguageCode): [UTCDate, number] => {
			return DateLocaleCopticAndEthiopicHelper.computeFirstDayOfYear(date, computeYearOfCalendar, lang);
		},
		moveToFirstDayOfYearsAround: (
			firstDayOfBaseYearOfCalendar: UTCDate,
			baseYearOfCalendar: number, firstYearOfCalendarOfYearsAround: number,
			computeYearOffset: DateLocaleNotGregorianYearsAroundFunctions['computeYearOffset'],
			lang: HxLanguageCode
		) => {
			return DateLocaleNotGregorianHelper.moveToFirstDayOfYearsAround(firstDayOfBaseYearOfCalendar, baseYearOfCalendar, firstYearOfCalendarOfYearsAround, computeYearOffset, lang);
		},
		asComputedYear: (firstDayOfYear: HxDate, baseYearOfCalendar: number, currentYearOfCalendar: number, lang: HxLanguageCode): ComputedYear => {
			return DateCopticUtils.INSTANCE.asComputedYear(firstDayOfYear, baseYearOfCalendar, currentYearOfCalendar, lang);
		}
	};

	protected constructor() {
		super();
	}

	/** Returns the calendar identifier for {@link Intl.DateTimeFormat}. */
	calendar(): string {
		return 'coptic';
	}

	/** Returns the list of locales that use the Coptic calendar. */
	supportedLanguages(): Array<HxLanguageCode> {
		// Egypt (Coptic calendar)
		return ['ar-EG'];
	}

	/**
	 * Registers the Coptic calendar with the locale and move providers.
	 */
	static enable() {
		DateLocaleFormatUtils.enableNotGregorianLocaleProvider(DateCopticUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveProvider(DateCopticUtils.INSTANCE);
	}

	/**
	 * Unregisters the Coptic calendar from the locale and move providers.
	 */
	static disable() {
		DateLocaleFormatUtils.disableNotGregorianLocaleProvider(DateCopticUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveProvider(DateCopticUtils.INSTANCE);
	}

	/**
	 * Checks whether the given locale should use the Coptic calendar.
	 *
	 * @param lang - locale code (e.g. {@code 'ar-EG'})
	 * @returns {@code true} when the language uses the calendar
	 */
	accept(lang: HxLanguageCode): boolean {
		return lang === 'ar-EG' || lang.startsWith('ar-EG-');
	}

	/**
	 * Coptic (Anno Martyrum / Diocletian era) calendar leap-year check.
	 *
	 * <p>In the Coptic calendar, a leap year occurs every 4th year. Because
	 * there is no year 0, the congruence class shifts by 1 across the era
	 * boundary: Anno Martyrum years ≡ 3 mod 4 (3, 7, 11, …) and Before
	 * Diocletian years ≡ 2 mod 4 (−2, −6, −10, …).</p>
	 *
	 * @param yearOfCalendar - Coptic year (positive = Anno Martyrum, negative = Before Diocletian)
	 * @returns {@code true} when the year has 366 days (month 13 has 6 days)
	 */
	static isLeapYear(yearOfCalendar: number): boolean {
		if (yearOfCalendar > 0) {
			return (yearOfCalendar + 1) % 4 === 0;
		} else {
			return (yearOfCalendar - 2) % 4 === 0;
		}
	}

	/**
	 * Checks whether a Gregorian date falls within the Anno Martyrum era.
	 *
	 * <p>Anno Martyrum begins at Coptic 1/01/01 (Gregorian 284/08/29).
	 * Dates strictly after that boundary return {@code true}.</p>
	 *
	 * @param date - Gregorian date as {@code {year, month, day}}
	 * @returns {@code true} when the date is on or after Gregorian 284/08/29
	 */
	// noinspection JSUnusedGlobalSymbols
	static isAnnoMartyrum(date: HxDate): boolean {
		return date.year > 284 || (date.year === 284 && (date.month > 8 || (date.month === 8 && date.day > 28)));
	}

	/**
	 * Checks whether a Gregorian date falls before the Anno Martyrum era.
	 *
	 * <p>Dates on or before Coptic −1/13/05 (Gregorian 284/08/28) are
	 * Before Diocletian. The Coptic calendar has no year 0: −1
	 * (Before Diocletian) is followed directly by 1 (Anno Martyrum).</p>
	 *
	 * @param date - Gregorian date as {@code {year, month, day}}
	 * @returns {@code true} when the date is before Gregorian 284/08/29
	 */
	static isBeforeDiocletian(date: HxDate): boolean {
		return date.year < 284 || (date.year === 284 && (date.month < 8 || (date.month === 8 && date.day <= 28)));
	}

	/**
	 * Computes the target Coptic year after applying an offset, handling the
	 * non-existent year 0 in the Coptic (Anno Martyrum) calendar.
	 *
	 * <p>The Coptic era starts at Diocletian year 1 (284/285 CE). There is
	 * no year 0 — the year before A.M. 1 is defined as −1 (Before Diocletian).
	 * This method compensates for the gap when the offset crosses the year 0
	 * boundary, ensuring the result stays in a valid Coptic year.</p>
	 *
	 * @param date           - original Gregorian date, used to detect the Diocletian era boundary
	 * @param yearOfCalendar - current Coptic year (positive = Anno Martyrum, negative = Before Diocletian)
	 * @param yearOffset     - number of years to move (positive = forward, negative = backward)
	 * @returns the target Coptic year, clamped to ≥ −284 (Gregorian 1 CE) and ≤ 9716 (Gregorian 9999/12/31)
	 */
	protected computeTargetYearOfCalendar(date: HxDate, yearOfCalendar: number, yearOffset: number): DateMoveTargetYearOfCalendar {
		if (DateCopticUtils.isBeforeDiocletian(date)) {
			// convert coptic year of calendar to negative value, which starts from -1
			yearOfCalendar = 0 - yearOfCalendar;
		}
		// noinspection DuplicatedCode
		let targetYearOfCalendar: number;
		if (yearOfCalendar > 0) {
			// coptic starts from 1
			if (yearOffset > 0) {
				targetYearOfCalendar = yearOfCalendar + yearOffset;
			} else {
				targetYearOfCalendar = yearOfCalendar + yearOffset;
				if (targetYearOfCalendar <= 0) {
					// coptic Before Diocletian starts from -1
					targetYearOfCalendar = targetYearOfCalendar - 1;
				}
			}
		} else if (yearOffset < 0) {
			// coptic Before Diocletian starts from -1
			targetYearOfCalendar = yearOfCalendar + yearOffset;
		} else {
			// coptic Before Diocletian starts from -1
			targetYearOfCalendar = yearOfCalendar + yearOffset;
			if (targetYearOfCalendar >= 0) {
				targetYearOfCalendar = targetYearOfCalendar + 1;
			}
		}
		// Coptic −284/05/08 is Gregorian 0001/01/01
		targetYearOfCalendar = Math.min(9716, Math.max(-284, targetYearOfCalendar));
		return [targetYearOfCalendar > 0 ? 'after' : 'before', targetYearOfCalendar];
	}

	/**
	 * Clamp a day number to the valid range for the target Coptic month.
	 *
	 * <p>For the earliest representable year (−284), the month is clamped
	 * to ≥ 5 with day ≥ 8, corresponding to Gregorian 0001/01/01.
	 * For the last representable year (9716), the month is clamped
	 * to ≤ 2 with day ≤ 21, corresponding to Gregorian 9999/12/31.
	 * For all other years the month is kept as-is.</p>
	 *
	 * <p>Coptic months 1–12 each have 30 days. Month 13 (Pi Kogi Enavot /
	 * Epagomenal) has 5 days in common years and 6 days in leap years.
	 * Leap-year detection delegates to {@link DateCopticUtils.isLeapYear}.</p>
	 *
	 * @param targetYearOfCalendar  - target Coptic year (positive = Anno Martyrum, negative = Before Diocletian)
	 * @param monthOfCalendar       - target month (1–13)
	 * @param dayOfCalendar         - desired day of month
	 * @returns the clamped target month and day of the Coptic calendar
	 */
	protected computeTargetMonthAndDayOfCalendar(targetYearOfCalendar: number, monthOfCalendar: number, dayOfCalendar: number): DateMoveTargetMonthAndDayOfCalendar {
		let targetMonthOfCalendar: number;
		if (targetYearOfCalendar === -284) {
			// -284/05/08 is gregory 0001/01/01
			targetMonthOfCalendar = Math.max(monthOfCalendar, 5);
			if (targetMonthOfCalendar === 5) {
				return {targetMonthOfCalendar: 5, targetDayOfCalendar: Math.max(8, dayOfCalendar)};
			}
		} else if (targetYearOfCalendar === 9716) {
			// 9716 starts at Gregorian 9999/11/11, month 2 day 21 is Gregorian 9999/12/31
			targetMonthOfCalendar = Math.min(monthOfCalendar, 2);
			if (targetMonthOfCalendar === 2) {
				return {targetMonthOfCalendar: 2, targetDayOfCalendar: Math.min(21, dayOfCalendar)};
			}
		} else {
			// otherwise keep the target month same as given month
			targetMonthOfCalendar = monthOfCalendar;
		}

		let targetDayOfCalendar: number;
		if (13 !== targetMonthOfCalendar) {
			targetDayOfCalendar = dayOfCalendar;
		} else if (DateCopticUtils.isLeapYear(targetYearOfCalendar)) {
			targetDayOfCalendar = Math.min(dayOfCalendar, 6);
		} else {
			targetDayOfCalendar = Math.min(dayOfCalendar, 5);
		}

		return {targetMonthOfCalendar, targetDayOfCalendar};
	}

	/**
	 * Count the number of days from the start of the given Coptic date
	 * (Before Diocletian) backward to the start of Coptic −1/13/05, which is
	 * immediately before the Diocletian era boundary.
	 *
	 * @param targetOfCalendar - target Coptic date as {@code {year, month, day}}, year ≤ −1
	 * @returns number of days from the target date to Coptic −1/13/05
	 */
	protected countDaysBackToEraBoundary(targetOfCalendar: HxDate): number {
		const {year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar} = targetOfCalendar;
		// Days from the start of the year to the start of the target date
		const daysToTarget = (targetMonthOfCalendar - 1) * 30 + (targetDayOfCalendar - 1);

		if (targetYearOfCalendar === -1) {
			// The target lies within year −1 itself.
			// Distance from target to −1/13/05 is simply the difference
			// between the two positions within the same year.
			// −1/13/05 is the 365th (last) day of this common year.
			// 364 = 365 - 1
			return 364 - daysToTarget;
		} else if (targetYearOfCalendar === -2) {
			// Year −2 is leap (366 days). No intermediate years between
			// −2 and −1. Remaining in −2 plus all days in −1 up to 13/05.
			// 364 = 365 - 1
			return 364 + 366 - daysToTarget;
		}

		// Target year is −3 or earlier — intermediate years exist between target year and year −1.

		// Step 1: days remaining in the target year after the target date
		const daysInTargetYear = DateCopticUtils.isLeapYear(targetYearOfCalendar) ? 366 : 365;
		let totalDays = daysInTargetYear - daysToTarget;

		// Step 2: full intermediate years between target (<= -3) year and year −1
		// (years from targetYear + 1 up to −2)
		const firstFullYear = targetYearOfCalendar + 1;
		const lastFullYear = -2;
		const yearCount = lastFullYear - firstFullYear + 1;
		// Leap year in Before Diocletian: year ≡ 2 (mod 4).
		// lastFullYear (−2) is leap, and leap years repeat every 4 years,
		// so the leap count in [first, −2] is floor((−2 − first) / 4) + 1.
		const leapCount = Math.floor((lastFullYear - firstFullYear) / 4) + 1;
		totalDays += yearCount * 365 + leapCount;

		// Step 3: days in year −1 from 1/01 to 13/05 (exclusive of 13/05 itself).
		// Twelve 30-day months + 4 days of month 13 = 364 days.
		totalDays += 364;

		return totalDays;
	}

	/**
	 * Map a Coptic calendar date to its equivalent Gregorian date by counting
	 * days from a fixed epoch reference point.
	 *
	 * <p>Anno Martyrum: counts days forward from Coptic 1/01/01
	 * (Gregorian 284/08/29) to the target date.</p>
	 * <p>Before Diocletian: counts days backward from Coptic −1/13/05
	 * (Gregorian 284/08/28) to the target date.</p>
	 *
	 * @param targetOfCalendar - Coptic date as {@code {year, month, day}}
	 * @returns equivalent Gregorian date
	 */
	protected moveDateTo(targetOfCalendar: HxDate): HxDate {
		const {year: targetYearOfCalendar} = targetOfCalendar;

		if (targetYearOfCalendar > 0) {
			// Anno Martyrum (Diocletian era).
			// Reference point: Coptic 1/01/01 = Gregorian 284/08/29.
			// Count days from the epoch forward to the target date, then add
			// that many days to the Gregorian reference date.
			const daysForward = this.countDaysFromEpochTo(targetOfCalendar);
			const firstDayOfAM = UTCDate.of(284, 7, 29); // August = month 7 (0-indexed)
			firstDayOfAM.setDayOfMonth(firstDayOfAM.getDayOfMonth() + daysForward);
			return DateUtils.asHxDate(firstDayOfAM);
		} else {
			// Before Diocletian.
			// Reference point: Coptic −1/13/05 = Gregorian 284/08/28.
			// Count days from the target date backward to the boundary, then
			// subtract that many days from the Gregorian reference date.
			const daysBack = this.countDaysBackToEraBoundary(targetOfCalendar);
			const lastDayOfBD = UTCDate.of(284, 7, 28); // August = month 7 (0-indexed)
			lastDayOfBD.setDayOfMonth(lastDayOfBD.getDayOfMonth() - daysBack);
			return DateUtils.asHxDate(lastDayOfBD);
		}
	}

	/**
	 * Returns the era label for a Coptic date.
	 *
	 * <p>Before-Diocletian dates return {@code "ق.د"} (Before Diocletian,
	 * قبل دقلديانوس) — the calendar supports only {@code ar-EG}, so the era
	 * label is Arabic, matching the Persian calendar's {@code "ق.هـ"} style.
	 * Anno Martyrum dates return an empty string (no era prefix needed since
	 * A.M. is the default Coptic era in Intl formatting).</p>
	 *
	 * @param date     - Gregorian date
	 * @param _partsOf - Intl.DateTimeFormat parts callback (unused)
	 * @param _lang    - locale (unused; the calendar supports only ar-EG)
	 * @returns {@code "ق.د"} or an empty string
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	eraAs(date: UTCDate, _partsOf: () => Array<Intl.DateTimeFormatPart>, _lang: HxLanguageCode): HxFormattedEra {
		const d = DateUtils.asHxDate(date);
		if (DateCopticUtils.isBeforeDiocletian(d)) {
			return 'ق.د';
		} else {
			return '';
		}
	}

	/**
	 * Shapes a month cell from a date in the target month, re-anchoring it to
	 * the first day of its calendar month.
	 *
	 * <p>Months outside the representable partial years (Coptic −284 months
	 * 1-4, Coptic 9716 months 3-13) are flagged with {@code bc} / {@code y10k}
	 * for the panel.</p>
	 *
	 * @param date   - the reference date; modified in place to the first day of its calendar month
	 * @param offset - the month offset of the returned cell relative to the base month
	 * @param lang   - locale code
	 * @returns the computed month cell for the first day of the calendar month
	 */
	private asComputedMonth(date: UTCDate, offset: number, lang: HxLanguageCode): ComputedMonth {
		const [, year, month, day] = DateLocaleFormatUtils.formatDateInNumeric(date, lang, false);
		date.setDayOfMonth(date.getDayOfMonth() - (day - 1));
		const firstDayOfThisMonth = DateMoveUtils.asHxDate(date);
		const bc = date.getFullYear() === 0 && date.getMonthIndex() < 11;
		const y10k = year === 9716 && month > 2;
		return {
			key: `${firstDayOfThisMonth.year}-${firstDayOfThisMonth.month}-${firstDayOfThisMonth.day}`,
			label: DateLocaleFormatUtils.formatMonthShort(date, lang, false),
			value: UTCDate.cloneOf(date),
			offset,
			bc,
			y10k
		};
	}

	/**
	 * Computes the 13-month grid for the months panel in the Coptic calendar.
	 *
	 * <p>Shares the implementation with the Ethiopic calendar via
	 * {@link DateLocaleCopticAndEthiopicHelper#monthsOfYear}; the Coptic-specific
	 * cell shaping and the {@code bc}/{@code y10k} flags for the partial years
	 * −284 and 9716 are injected via {@link DateCopticUtils.MonthsOfYearFuncs}.</p>
	 *
	 * @param date      - the reference date; its year and month determine the grid and the offsets
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the 13 months of the reference date's year
	 */
	monthsOfYear(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		return DateLocaleCopticAndEthiopicHelper.monthsOfYear(date, DateCopticUtils.MonthsOfYearFuncs, lang, gregorian);
	}

	/**
	 * Reforms the year returned by the Intl formatter: Before-Diocletian dates
	 * (before Gregorian 284/08/29) are negated so the calendar year is negative
	 * (starting from −1), matching the internal era encoding.
	 *
	 * @param date           - the Gregorian date
	 * @param yearOfCalendar - the year of calendar as formatted by Intl (positive for both eras)
	 * @returns the reformed year of calendar (negative for Before Diocletian)
	 */
	private computeYearOfCalendar(date: UTCDate, yearOfCalendar: number): number {
		if (date.getFullYear() < 284
			|| (date.getFullYear() === 284 && date.getMonthIndex() < 7)
			|| (date.getFullYear() === 284 && date.getMonthIndex() === 7 && date.getDayOfMonth() < 29)) {
			return -yearOfCalendar;
		} else {
			return yearOfCalendar;
		}
	}

	/**
	 * Computes the start Coptic year of the years-around page, centered on the
	 * given base year and clamped to the calendar bounds [−284, 9716].
	 *
	 * <p>The Coptic calendar has no year 0 (Before-Diocletian −1 is followed
	 * directly by Anno Martyrum 1), so when the window crosses the era boundary
	 * (base positive, start ≤ 0) it shifts back by one extra year.</p>
	 *
	 * @param baseYearOfCalendar  - the base Coptic year (reformed)
	 * @param _firstDayOfBaseYear - the first day of the base calendar year (unused)
	 * @returns [start year of calendar, forwardable, backwardable]
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private computeStartYear(baseYearOfCalendar: number, _firstDayOfBaseYear: UTCDate): [number, boolean, boolean] {
		const maxStartYearOfCalendar = 9716 - DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE + 1;
		const minStartYearOfCalendar = -284;
		const yearsToStart = Math.floor((DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE - 1) / 2);

		let startYearOfCalendar = baseYearOfCalendar - yearsToStart;
		if (baseYearOfCalendar > 0 && startYearOfCalendar <= 0) {
			startYearOfCalendar = startYearOfCalendar - 1;
		}
		startYearOfCalendar = Math.min(maxStartYearOfCalendar, Math.max(minStartYearOfCalendar, startYearOfCalendar));

		return [
			startYearOfCalendar, startYearOfCalendar !== maxStartYearOfCalendar, startYearOfCalendar !== minStartYearOfCalendar
		];
	}

	/**
	 * Fixes the year offset for the years-around walk across the no-year-0 era
	 * boundary: moving from an Anno Martyrum year to a Before-Diocletian year
	 * counts one extra year (the gap where year 0 would be).
	 *
	 * @param baseYearOfCalendar           - the base Coptic year (reformed)
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
	 * for Before Diocletian). The offset compensates the missing year 0: a cell
	 * before the era against an Anno Martyrum base year counts one extra year
	 * ({@code year − base + 1}) and vice versa ({@code year − base − 1}), so
	 * clicking a Before-Diocletian cell selects the same reformed year.</p>
	 *
	 * @param firstDayOfYear        - the first day of the cell's calendar year
	 * @param baseYearOfCalendar    - the base year of calendar (reformed)
	 * @param currentYearOfCalendar - the current year of calendar (reformed)
	 * @param lang                  - locale code
	 * @returns the computed year cell
	 */
	private asComputedYear(firstDayOfYear: HxDate, baseYearOfCalendar: number, currentYearOfCalendar: number, lang: HxLanguageCode): ComputedYear {
		// noinspection DuplicatedCode
		const value = DateMoveUtils.asJsDate(firstDayOfYear);
		// eslint-disable-next-line prefer-const
		let [eraOfCalendar, yearOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(value, lang, false);
		yearOfCalendar = this.computeYearOfCalendar(value, yearOfCalendar);

		// fixed the "no 0 year" issue
		// noinspection DuplicatedCode
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
			era: eraOfCalendar,
			label: DateLocaleFormatUtils.formatYear(value, lang, false),
			value,
			offset,
			thisYear: yearOfCalendar === currentYearOfCalendar
		};
	}

	/**
	 * Computes the years grid around a reference year for the years panel in the
	 * Coptic calendar.
	 *
	 * <p>Delegates to the Gregorian provider when the Gregorian calendar is in use.
	 * The window is centered on the reference year and clamped to the Coptic
	 * calendar boundaries [−284, 9716]. Each cell holds the first day of its
	 * calendar year in ICU semantics, so at the bottom clamp the first cell may
	 * anchor at −284/1/1 (Gregorian 1 BCE 8/29); clicking uses the cell offset,
	 * never the cell date.</p>
	 *
	 * @param baseDate    - the reference date; its year centers the grid window and the offsets
	 * @param currentDate - the current value date; its year marks the "this year" cell
	 * @param lang        - locale code
	 * @param gregorian   - whether the Gregorian calendar is in use
	 * @returns the years around the reference year, with pagination flags
	 */
	yearsAround(baseDate: UTCDate, currentDate: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedYears {
		return DateLocaleNotGregorianHelper.yearsAround(baseDate, currentDate, DateCopticUtils.YearsAroundFuncs, lang, gregorian);
	}
}
