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
import type {
	DateMoveEraOfTargetYearOfCalendar,
	DateMoveTargetMonthAndDayOfCalendar,
	DateMoveTargetYearOfCalendar
} from '../months-any';
import {DateLocaleCopticAndEthiopicHelper} from './date-locale-coptic-and-ethiopic';
import {DateMoveCopticAndEthiopicUtils} from './date-move-coptic-and-ethiopic';

export class DateEthiopicUtils extends DateMoveCopticAndEthiopicUtils implements DateLocaleNotGregorianProvider {
	static readonly INSTANCE = new DateEthiopicUtils();
	// wires the Ethiopic-specific cell shaping (bc/y10k flags) into the shared months-panel skeleton
	private static readonly MonthsOfYearFuncs: DateLocaleNotGregorianMonthsOfYearFunctions = {
		asComputedMonth: (date: UTCDate, offset: number, lang: HxLanguageCode): ComputedMonth => {
			return DateEthiopicUtils.INSTANCE.asComputedMonth(date, offset, lang);
		}
	};
	// wires the Ethiopic-specific year anchoring and cell shaping into the shared years-panel skeleton
	private static readonly YearsAroundFuncs: DateLocaleNotGregorianYearsAroundFunctions = {
		computeStartYear: (baseYearOfCalendar: number, firstDayOfBaseYear: UTCDate): [number, boolean, boolean] => {
			return DateEthiopicUtils.INSTANCE.computeStartYear(baseYearOfCalendar, firstDayOfBaseYear);
		},
		computeYearOffset: (baseYearOfCalendar: number, firstYearOfCalendarOfYearsAround: number): number => {
			return DateEthiopicUtils.INSTANCE.computeYearOffset(baseYearOfCalendar, firstYearOfCalendarOfYearsAround);
		},
		computeFirstDayOfYear: (
			date: UTCDate, computeYearOfCalendar: DateLocaleNotGregorianYearsAroundFunctions['computeYearOfCalendar'],
			lang: HxLanguageCode) => {
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
			return DateEthiopicUtils.INSTANCE.asComputedYear(firstDayOfYear, baseYearOfCalendar, currentYearOfCalendar, lang);
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
		return 'ethiopic';
	}

	/** Returns the list of locales that use the Ethiopic calendar. */
	supportedLanguages(): Array<HxLanguageCode> {
		return [
			'am-ET', // Ethiopia (Amharic)
			'ti-ET'  // Eritrea (Tigrinya)
		];
	}

	/**
	 * Registers the Ethiopic calendar with the locale and move providers.
	 */
	static enable() {
		DateLocaleFormatUtils.enableNotGregorianLocaleProvider(DateEthiopicUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveProvider(DateEthiopicUtils.INSTANCE);
	}

	/**
	 * Unregisters the Ethiopic calendar from the locale and move providers.
	 */
	static disable() {
		DateLocaleFormatUtils.disableNotGregorianLocaleProvider(DateEthiopicUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveProvider(DateEthiopicUtils.INSTANCE);
	}

	/**
	 * Checks whether the given locale should use the Ethiopic calendar.
	 *
	 * @param lang - locale code (e.g. {@code 'am-ET'})
	 * @returns {@code true} when the language uses the calendar
	 */
	accept(lang: HxLanguageCode): boolean {
		return lang === 'am-ET' || lang.startsWith('am-ET-') || lang === 'ti-ET' || lang.startsWith('ti-ET-');
	}

	/**
	 * Ethiopic calendar leap-year check.
	 *
	 * <p>Leap years occur every 4th year in the Ethiopic calendar.
	 * Since the era numbering uses all-positive years (A.I. 1+,
	 * B.I. 5493–5500), leap years are always years ≡ 3 mod 4:
	 * A.I. 3, 7, 11, … and B.I. 5499, 5495, 5491, …</p>
	 *
	 * @param yearOfCalendar - Ethiopic year (all-positive: A.I. 1+, B.I. 5493–5500)
	 * @returns {@code true} when the year has 366 days (month 13 has 6 days)
	 */
	static isLeapYear(yearOfCalendar: number): boolean {
		return (yearOfCalendar + 1) % 4 === 0;
	}

	/**
	 * Checks whether a Gregorian date falls within the Anno Incarnationis
	 * (Amätä Məhrät / Year of Mercy) era.
	 *
	 * <p>The Incarnation Era begins at Ethiopic 1/01/01 (Gregorian 8/08/27).
	 * Dates on or after that boundary return {@code true}.</p>
	 *
	 * @param date - Gregorian date as {@code {year, month, day}}
	 * @returns {@code true} when the date is on or after Gregorian 8/08/27
	 */
	// noinspection JSUnusedGlobalSymbols
	static isAnnoIncarnationis(date: HxDate): boolean {
		return date.year > 8 || (date.year === 8 && (date.month > 8 || (date.month === 8 && date.day > 26)));
	}

	/**
	 * Checks whether a Gregorian date falls before the Incarnation Era.
	 *
	 * <p>Dates on or before Ethiopic 5500/13/05 (Gregorian 8/08/26) are
	 * Before Incarnation. The Ethiopic calendar skips year 0:
	 * B.I. 5500 is followed directly by A.I. 1.</p>
	 *
	 * @param date - Gregorian date as {@code {year, month, day}}
	 * @returns {@code true} when the date is before Gregorian 8/08/27
	 */
	static isBeforeIncarnation(date: HxDate): boolean {
		return date.year < 8 || (date.year === 8 && (date.month < 8 || (date.month === 8 && date.day <= 26)));
	}

	/**
	 * Computes the target Ethiopic year after applying an offset, handling the
	 * non-existent year 0 in the Ethiopic (Incarnation Era) calendar.
	 *
	 * <p>The Ethiopic era uses all-positive year numbers: A.I. 1+
	 * (Anno Incarnationis) and B.I. 5493–5500 (Before Incarnation).
	 * This method handles crossing the era boundary (arithmetic year ≤ 0 → B.I. 5500,
	 * B.I. 5500 → A.I. 1), ensuring the result stays in a valid Ethiopic year.</p>
	 *
	 * @param date           - original Gregorian date, used to detect the Incarnation era boundary
	 * @param yearOfCalendar - current Ethiopic year (all-positive: A.I. 1+, B.I. 5493–5500)
	 * @param yearOffset     - number of years to move (positive = forward, negative = backward)
	 * @returns a tuple of {@code ['after' | 'before', year]} identifying the target era and year,
	 *          with the year clamped to ≥ 5493 (Gregorian 1 CE) and ≤ 9992 (Gregorian 9999/12/31)
	 */
	protected computeTargetYearOfCalendar(date: HxDate, yearOfCalendar: number, yearOffset: number): DateMoveTargetYearOfCalendar {
		if (DateEthiopicUtils.isAnnoIncarnationis(date)) {
			// ethiopic starts from 1
			if (yearOffset > 0) {
				return ['after', Math.min(9992, yearOfCalendar + yearOffset)];
			} else {
				const targetYearOfCalendar = yearOfCalendar + yearOffset;
				if (targetYearOfCalendar <= 0) {
					// ethiopic Before Incarnation starts from 5500, and 5499, 5498, ...
					return ['before', Math.max(5493, targetYearOfCalendar + 5500)];
				} else {
					return ['after', Math.min(9992, targetYearOfCalendar)];
				}
			}
		} else if (yearOffset < 0) {
			// ethiopic Before Incarnation starts from 5500, and 5499, 5498, ...
			// till Gregorian 0001/01/01, which is ethiopic 5493/05/08
			return ['before', Math.max(5493, yearOfCalendar + yearOffset)];
		} else if (yearOffset > (5500 - yearOfCalendar)) {
			return ['after', Math.min(9992, yearOffset - (5500 - yearOfCalendar))];
		} else {
			// ethiopic Before Incarnation starts from 5500, and 5499, 5498, ...
			return ['before', Math.max(5493, yearOfCalendar + yearOffset)];
		}
	}

	/**
	 * Clamp a day number to the valid range for the target Ethiopic month.
	 *
	 * <p>For the earliest representable year (5493, Before Incarnation), the month
	 * is clamped to ≥ 5 with day ≥ 8, corresponding to Gregorian 0001/01/01.
	 * For the last representable year (9992, Anno Incarnationis), the month
	 * is clamped to ≤ 2 with day ≤ 21, corresponding to Gregorian 9999/12/31.
	 * For all other years the month is kept as-is.</p>
	 *
	 * <p>Ethiopic months 1–12 each have 30 days. Month 13 (Pagumēn /
	 * Epagomenal) has 5 days in common years and 6 days in leap years.
	 * Leap-year detection delegates to {@link DateEthiopicUtils.isLeapYear}.</p>
	 *
	 * @param targetYearOfCalendar         - target Ethiopic year (all-positive: A.I. 1+, B.I. 5493–5500)
	 * @param monthOfCalendar              - target month (1–13)
	 * @param dayOfCalendar                - desired day of month
	 * @param eraOfTargetYearOfCalendar    - which era the year belongs to: {@code 'after'} (Anno Incarnationis) or {@code 'before'} (Before Incarnation)
	 * @returns the clamped target month and day of the Ethiopic calendar
	 */
	protected computeTargetMonthAndDayOfCalendar(targetYearOfCalendar: number, monthOfCalendar: number, dayOfCalendar: number, eraOfTargetYearOfCalendar: DateMoveEraOfTargetYearOfCalendar): DateMoveTargetMonthAndDayOfCalendar {
		let targetMonthOfCalendar: number;
		if (eraOfTargetYearOfCalendar === 'before' && targetYearOfCalendar === 5493) {
			// 5493/05/08 is Gregorian 0001/01/01
			targetMonthOfCalendar = Math.max(monthOfCalendar, 5);
			if (targetMonthOfCalendar === 5) {
				return {targetMonthOfCalendar: 5, targetDayOfCalendar: Math.max(8, dayOfCalendar)};
			}
		} else if (eraOfTargetYearOfCalendar === 'after' && targetYearOfCalendar === 9992) {
			// 9992 starts at Gregorian 9999/11/11, month 2 day 21 is Gregorian 9999/12/31
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
		} else if (DateEthiopicUtils.isLeapYear(targetYearOfCalendar)) {
			targetDayOfCalendar = Math.min(dayOfCalendar, 6);
		} else {
			targetDayOfCalendar = Math.min(dayOfCalendar, 5);
		}

		return {targetMonthOfCalendar, targetDayOfCalendar};
	}

	/**
	 * Count the number of days from the start of the given Ethiopic date
	 * (Before Incarnation) backward to the start of Ethiopic 5500/13/05,
	 * which is immediately before the Incarnation era boundary.
	 *
	 * @param targetOfCalendar - target Ethiopic date as {@code {year, month, day}}, year in B.I. range (5493–5500)
	 * @returns number of days from the target date to Ethiopic 5500/13/05
	 */
	protected countDaysBackToEraBoundary(targetOfCalendar: HxDate): number {
		const {year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar} = targetOfCalendar;
		// Days from the start of the year to the start of the target date
		const daysToTarget = (targetMonthOfCalendar - 1) * 30 + (targetDayOfCalendar - 1);

		if (targetYearOfCalendar === 5500) {
			// The target lies within year 5500 itself.
			// Distance from target to 5500/13/05 is simply the difference
			// between the two positions within the same year.
			// 5500/13/05 is the 365th (last) day of this common year.
			// 364 = 365 - 1
			return 364 - daysToTarget;
		} else if (targetYearOfCalendar === 5499) {
			// Year 5499 is leap (366 days). No intermediate years between
			// 5499 and 5500. Remaining in 5499 plus all days in 5500 up to 13/05.
			// 364 = 365 - 1
			return 364 + 366 - daysToTarget;
		}

		// Target year is 5498 or earlier — intermediate years exist between target year and year 5500.

		// Step 1: days remaining in the target year after the target date
		const daysInTargetYear = DateEthiopicUtils.isLeapYear(targetYearOfCalendar) ? 366 : 365;
		let totalDays = daysInTargetYear - daysToTarget;

		// Step 2: full intermediate years between target (<= 5498) year and year 5500
		// (years from targetYear + 1 up to 5499)
		const firstFullYear = targetYearOfCalendar + 1;
		const lastFullYear = 5499;
		const yearCount = lastFullYear - firstFullYear + 1;
		// Leap year in Before Incarnation: year ≡ 3 (mod 4) — same as A.I.
		// lastFullYear (5499) is leap, and leap years repeat every 4 years,
		// so the leap count in [first, 5499] is floor((5499 − first) / 4) + 1.
		const leapCount = Math.floor((lastFullYear - firstFullYear) / 4) + 1;
		totalDays += yearCount * 365 + leapCount;

		// Step 3: days in year 5500 from 1/01 to 13/05 (exclusive of 13/05 itself).
		// Twelve 30-day months + 4 days of month 13 = 364 days.
		totalDays += 364;

		return totalDays;
	}

	/**
	 * Map an Ethiopic calendar date to its equivalent Gregorian date by counting
	 * days from a fixed epoch reference point.
	 *
	 * <p>Anno Incarnationis: counts days forward from Ethiopic 1/01/01
	 * (Gregorian 0008/08/27) to the target date.</p>
	 * <p>Before Incarnation: counts days backward from the B.I./A.I. era
	 * boundary to the target date.</p>
	 *
	 * @param targetOfCalendar             - Ethiopic date as {@code {year, month, day}}
	 * @param _lang                        - locale, used to format the date in the calendar's representation
	 * @param eraOfTargetYearOfCalendar    - which era the year belongs to: {@code 'after'} (Anno Incarnationis) or {@code 'before'} (Before Incarnation)
	 * @returns equivalent Gregorian date
	 */
	protected moveDateTo(targetOfCalendar: HxDate, _lang: HxLanguageCode, eraOfTargetYearOfCalendar: DateMoveEraOfTargetYearOfCalendar): HxDate {
		if (eraOfTargetYearOfCalendar === 'after') {
			// Anno Incarnationis (Incarnation Era).
			// Reference point: Ethiopic 1/01/01 = Gregorian 8/08/27.
			// Count days from the epoch forward to the target date, then add
			// that many days to the Gregorian reference date.
			const daysForward = this.countDaysFromEpochTo(targetOfCalendar);
			const firstDayOfAI = UTCDate.of(8, 7, 27); // August = month 7 (0-indexed)
			firstDayOfAI.setDayOfMonth(firstDayOfAI.getDayOfMonth() + daysForward);
			return DateUtils.asHxDate(firstDayOfAI);
		} else {
			// Before Incarnation.
			// Reference point: Ethiopic 5500/13/05 = Gregorian 8/08/26.
			// Count days from the target date backward to the boundary, then
			// subtract that many days from the Gregorian reference date.
			const daysBack = this.countDaysBackToEraBoundary(targetOfCalendar);
			const lastDayOfBI = UTCDate.of(8, 7, 26); // August = month 7 (0-indexed)
			lastDayOfBI.setDayOfMonth(lastDayOfBI.getDayOfMonth() - daysBack);
			return DateUtils.asHxDate(lastDayOfBI);
		}
	}

	/**
	 * Returns the era label for an Ethiopic date.
	 *
	 * <p>Before-Incarnation dates return the pre-era abbreviation in each
	 * language's rendering style: {@code "ዓ.ዓ."} (ዓመተ ዓለም, "Year of the World")
	 * for Amharic (am-*), whose months render in Ge'ez throughout, and
	 * {@code "A.A."} — the Latin transliteration of the same abbreviation — for
	 * Tigrinya (ti-*), whose pre-Incarnation months render in Latin
	 * transliteration (e.g. "Meskerem"). Anno Incarnationis dates return an
	 * empty string (no era prefix needed since A.I. is the default Ethiopic
	 * era in Intl formatting).</p>
	 *
	 * @param date     - Gregorian date
	 * @param _partsOf - Intl.DateTimeFormat parts callback (unused)
	 * @param lang     - locale, used to select the Ge'ez vs. transliterated era label
	 * @returns {@code "ዓ.ዓ."}, {@code "A.A."}, or an empty string
	 */
	eraAs(date: UTCDate, _partsOf: () => Array<Intl.DateTimeFormatPart>, lang: HxLanguageCode): HxFormattedEra {
		const d = DateUtils.asHxDate(date);
		if (DateEthiopicUtils.isBeforeIncarnation(d)) {
			return (lang === 'ti' || lang.startsWith('ti-')) ? 'A.A.' : 'ዓ.ዓ.';
		} else {
			return '';
		}
	}

	/**
	 * Composes the year label for the Ethiopic output.
	 *
	 * <p>The era comes from {@link eraAs} ({@code 'ዓ.ዓ.'} for Amharic,
	 * {@code 'A.A.'} for Tigrinya Before-Incarnation dates, empty otherwise)
	 * and is joined with the formatted year by a space. Before-Incarnation
	 * years are all-positive (5493–5500), so no minus-sign stripping is
	 * needed.</p>
	 *
	 * @param value - the date-time value
	 * @param era   - era label from {@code eraAs} (overridden in this method)
	 * @param year  - year string from Intl formatting
	 * @param lang  - locale language code
	 * @returns the composed era + year label
	 */
	labelOfYear(value: HxDate, era: string, year: string, lang: HxLanguageCode): string {
		const date = DateUtils.asJsDate(value);
		era = this.eraAs(date, () => [], lang);
		return `${era} ${year}`;
	}

	/**
	 * Shapes a month cell from a date in the target month, re-anchoring it to
	 * the first day of its calendar month.
	 *
	 * <p>Months whose first day falls in Gregorian year 0 (1 BCE) up to
	 * November — i.e. months 1-4 of the earliest B.I. year (5493) — are
	 * flagged with {@code bc}, and months of the last representable year
	 * (Ethiopic 9992, months 3-13) with {@code y10k} for the panel.</p>
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
		const y10k = year === 9992 && month > 2;
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
	 * Computes the 13-month grid for the months panel in the Ethiopic calendar.
	 *
	 * <p>Shares the implementation with the Coptic calendar via
	 * {@link DateLocaleCopticAndEthiopicHelper#monthsOfYear}; the Ethiopic-specific
	 * cell shaping and the {@code bc}/{@code y10k} flags for the partial years
	 * 5493 and 9992 are injected via {@link DateEthiopicUtils.MonthsOfYearFuncs}.</p>
	 *
	 * @param date      - the reference date; its year and month determine the grid and the offsets
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the 13 months of the reference date's year
	 */
	monthsOfYear(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		return DateLocaleCopticAndEthiopicHelper.monthsOfYear(date, DateEthiopicUtils.MonthsOfYearFuncs, lang, gregorian);
	}

	/**
	 * Computes the start Ethiopic year of the years-around page, centered on the
	 * given base year.
	 *
	 * <p>The window is centered on the base year. When the centered start would
	 * fall at or below year 0 — base year near the start of the Incarnation era
	 * (A.I. 1–12) — it is mirrored into the Before-Incarnation range
	 * ({@code 5500 + start}, clamped to ≥ 5493). When the base year's first day
	 * still falls before the Incarnation era start (Gregorian year < 8, i.e. the
	 * Before-Incarnation base years 5493–5500), the start is clamped to ≥ 5493.
	 * Otherwise, the start year is clamped only at the top of the calendar
	 * ({@code 9992 − YEARS_AROUND_PER_PAGE + 1}).</p>
	 *
	 * @param baseYearOfCalendar - the base Ethiopic year
	 * @param firstDayOfBaseYear - the first day of the base calendar year
	 * @returns [start year of calendar, forwardable, backwardable]
	 */
	private computeStartYear(baseYearOfCalendar: number, firstDayOfBaseYear: UTCDate): [number, boolean, boolean] {
		const maxStartYearOfCalendar = 9992 - DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE + 1;
		const minStartYearOfCalendar = 5493;
		const yearsToStart = Math.floor((DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE - 1) / 2);

		let startYearOfCalendar = baseYearOfCalendar - yearsToStart;
		if (startYearOfCalendar <= 0) {
			startYearOfCalendar = Math.max(minStartYearOfCalendar, 5500 + startYearOfCalendar);
			return [startYearOfCalendar, true, startYearOfCalendar !== minStartYearOfCalendar];
		} else if (firstDayOfBaseYear.getFullYear() < 8) {
			startYearOfCalendar = Math.max(minStartYearOfCalendar, startYearOfCalendar);
			return [startYearOfCalendar, true, startYearOfCalendar !== minStartYearOfCalendar];
		} else {
			startYearOfCalendar = Math.min(maxStartYearOfCalendar, startYearOfCalendar);
			return [startYearOfCalendar, startYearOfCalendar !== maxStartYearOfCalendar, true];
		}
	}

	/**
	 * Computes the year offset for the years-around walk from the base year to
	 * the first year of the page.
	 *
	 * <p>When the walk starts in the Before-Incarnation range (first year ≥
	 * 5493) and the base year lies before it, the offset counts across the
	 * no-year-0 boundary ({@code −(base + (5500 − first))}); otherwise it is
	 * the plain year difference ({@code first − base}). Note the offset is
	 * currently ignored by the default
	 * {@link DateLocaleNotGregorianHelper#moveToFirstDayOfYearsAround}.</p>
	 *
	 * @param baseYearOfCalendar           - the base Ethiopic year
	 * @param firstYearOfCalendarOfYearsAround - the first year of the years page
	 * @returns the year offset to walk from the base year to the first year
	 */
	private computeYearOffset(baseYearOfCalendar: number, firstYearOfCalendarOfYearsAround: number): number {
		if (firstYearOfCalendarOfYearsAround >= 5493 && baseYearOfCalendar < firstYearOfCalendarOfYearsAround) {
			return 0 - (baseYearOfCalendar + (5500 - firstYearOfCalendarOfYearsAround));
		} else {
			return firstYearOfCalendarOfYearsAround - baseYearOfCalendar;
		}
	}

	/**
	 * Shapes a year cell from the first day of the calendar year, with the
	 * offset fixed across the no-year-0 era boundary.
	 *
	 * <p>The cell year is the Intl-formatted year (all-positive: A.I. 1+,
	 * B.I. 5493–5500). Since the years-around walk counts in continuous
	 * arithmetic years, Before-Incarnation years are mapped to the arithmetic
	 * space ({@code N − 5500} → −7..0) before computing the offset, so a B.I.
	 * cell against an A.I. base year yields the same negative offset the walk
	 * used (e.g. B.I. 5493 against A.I. 1 → −8), and clicking selects the same
	 * year (see {@link DateEthiopicUtils.computeTargetYearOfCalendar}).</p>
	 *
	 * @param firstDayOfYear        - the first day of the cell's calendar year
	 * @param baseYearOfCalendar    - the base year of calendar
	 * @param currentYearOfCalendar - the current year of calendar
	 * @param lang                  - locale code
	 * @returns the computed year cell
	 */
	private asComputedYear(firstDayOfYear: HxDate, baseYearOfCalendar: number, currentYearOfCalendar: number, lang: HxLanguageCode): ComputedYear {
		const value = DateMoveUtils.asJsDate(firstDayOfYear);
		const [eraOfCalendar, yearOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(value, lang, false);
		// map all-positive B.I. years (5493–5500) into the continuous arithmetic
		// space (N − 5500 → −7..0) so offsets stay correct across the era boundary
		const arithmeticYear = yearOfCalendar >= 5493 ? yearOfCalendar - 5500 : yearOfCalendar;
		const arithmeticBase = baseYearOfCalendar >= 5493 ? baseYearOfCalendar - 5500 : baseYearOfCalendar;
		return {
			key: `${firstDayOfYear.year}-${firstDayOfYear.month}-${firstDayOfYear.day}`,
			era: eraOfCalendar,
			label: DateLocaleFormatUtils.formatYear(value, lang, false),
			value,
			offset: arithmeticYear - arithmeticBase,
			thisYear: yearOfCalendar === currentYearOfCalendar
		};
	}

	/**
	 * Computes the years grid around a reference year for the years panel in the
	 * Ethiopic calendar.
	 *
	 * <p>Delegates to the Gregorian provider when the Gregorian calendar is in use.
	 * The window is centered on the reference year and clamped to the Ethiopic
	 * calendar bounds (B.I. 5493–5500, A.I. 1–9992), with the start year
	 * mirrored into the Before-Incarnation range when it crosses the era start
	 * (see {@link DateEthiopicUtils.computeStartYear}). Each cell holds the first
	 * day of its calendar year in ICU semantics, so at the bottom clamp the
	 * first cell may anchor at 5493/1/1 (Gregorian 1 BCE 8/27); clicking uses
	 * the cell offset, never the cell date.</p>
	 *
	 * @param baseDate    - the reference date; its year centers the grid window and the offsets
	 * @param currentDate - the current value date; its year marks the "this year" cell
	 * @param lang        - locale code
	 * @param gregorian   - whether the Gregorian calendar is in use
	 * @returns the years around the reference year, with pagination flags
	 */
	yearsAround(baseDate: UTCDate, currentDate: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedYears {
		return DateLocaleNotGregorianHelper.yearsAround(baseDate, currentDate, DateEthiopicUtils.YearsAroundFuncs, lang, gregorian);
	}
}
