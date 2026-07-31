import type {HxLanguageCode} from '../../contexts';
import {DateLocaleUtils} from './date-locale';
import {DateMoveUtils} from './date-move';
import {DateMove13MonthsUtils} from './date-move-13months';
import {DateMoveCopticAndEthiopicUtils} from './date-move-coptic-and-ethiopic';
import {DateMoveInternalUtils} from './date-move-internal';
import type {HxFormattedYear, MoveDate} from './date-types';

export class DateEthiopicUtils {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	// noinspection JSUnusedGlobalSymbols
	static calendar(): string {
		return 'ethiopic';
	}

	// noinspection JSUnusedGlobalSymbols
	static supportedLanguages(): string[] {
		// Ethiopia (Amharic), Eritrea (Tigrinya)
		return ['am-ET', 'ti-ET'];
	}

	static enable() {
		DateLocaleUtils.enableNotGregorianLocaleUtils(DateEthiopicUtils);
		DateMoveUtils.enableNotGregorianMoveUtils(DateEthiopicUtils);
	}

	// noinspection JSUnusedGlobalSymbols
	static disable() {
		DateLocaleUtils.disableNotGregorianLocaleUtils(DateEthiopicUtils);
		DateMoveUtils.disableNotGregorianMoveUtils(DateEthiopicUtils);
	}

	/** Returns {@code true} when the language uses the Ethiopic calendar. */
	// noinspection JSUnusedGlobalSymbols
	static accept(lang: HxLanguageCode): boolean {
		return lang === 'am-ET' || lang.startsWith('am-ET-') || lang === 'ti-ET' || lang.startsWith('ti-ET-');
	}

	/**
	 * Ethiopic calendar leap-year check.
	 *
	 * <p>Leap years occur every 4th year in the Ethiopic calendar.
	 * Since the era numbering uses all-positive years (A.I. 1+,
	 * B.I. 5493–5500), leap years are always years ≡ 3 mod 4:
	 * A.I. 3, 7, 11, … and B.I. 5499, 5495, 5491, …</p>
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
	static isAnnoIncarnationis(date: MoveDate): boolean {
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
	static isBeforeIncarnation(date: MoveDate): boolean {
		return date.year < 8 || (date.year === 8 && (date.month < 8 || (date.month === 8 && date.day <= 26)));
	}

	/**
	 * Formats the Ethiopic year, prepending a {@code "B.I."} prefix for
	 * Before-Incarnation dates.
	 *
	 * <p>For Anno Incarnationis dates the year is returned as-is from the
	 * Intl.DateTimeFormat parts. For Before Incarnation dates the prefix
	 * {@code "B.I."} (Before Incarnation) is prepended — e.g.
	 * {@code "B.I. 5493"} for Ethiopic year 5493.</p>
	 *
	 * @param _lang   - locale (unused; formatting is locale-independent)
	 * @param date    - Gregorian date
	 * @param partsOf - callback producing Intl.DateTimeFormat parts
	 * @returns the formatted year, with {@code "B.I."} prefix when applicable
	 */
	// noinspection JSUnusedGlobalSymbols
	static yearAs(_lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedYear {
		const yearAndLiteral = DateLocaleUtils.findYearAndLiteralFromFormattedParts(partsOf);
		if (yearAndLiteral.found) {
			const {year} = yearAndLiteral;
			const d = {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
			if (DateEthiopicUtils.isBeforeIncarnation(d)) {
				return `B.I. ${year}`;
			} else {
				return year;
			}
		} else {
			return String(date.getFullYear());
		}
	}

	/**
	 * Converts an Ethiopic calendar year to a target year after applying an offset,
	 * handling the non-existent year 0 in the Ethiopic (Incarnation Era) calendar.
	 *
	 * <p>The Ethiopic era uses all-positive year numbers: A.I. 1+
	 * (Anno Incarnationis) and B.I. 5493–5500 (Before Incarnation).
	 * This method handles crossing the era boundary (arithmetic year ≤ 0 → B.I. 5500,
	 * B.I. 5500 → A.I. 1), ensuring the result stays in a valid Ethiopic year.</p>
	 *
	 * @param date           - original Gregorian date, used to detect the Incarnation era boundary
	 * @param yearOfCalendar - current Ethiopic year (all-positive: A.I. 1+, B.I. 5493–5500)
	 * @param yearOffset     - number of years to move (positive = forward, negative = backward)
	 * @returns a tuple of {@code ['ai' | 'bi', year]} identifying the target era and year,
	 *          with the year clamped to ≥ 5493 (Gregorian 1 CE)
	 */
	private static convertYearOfCalendar(date: MoveDate, yearOfCalendar: number, yearOffset: number): ['ai' | 'bi', number] {
		if (DateEthiopicUtils.isAnnoIncarnationis(date)) {
			// ethiopic starts from 1
			if (yearOffset > 0) {
				return ['ai', yearOfCalendar + yearOffset];
			} else {
				const targetYearOfCalendar = yearOfCalendar + yearOffset;
				if (targetYearOfCalendar <= 0) {
					// ethiopic Before Incarnation starts from 5500, and 5499, 5498, ...
					return ['bi', targetYearOfCalendar + 5500];
				} else {
					return ['ai', targetYearOfCalendar];
				}
			}
		} else if (yearOffset < 0) {
			// ethiopic Before Incarnation starts from 5500, and 5499, 5498, ...
			// till gregory 0001/01/01, which is ethiopic 5493/05/08
			return ['bi', Math.max(5493, yearOfCalendar + yearOffset)];
		} else if (yearOffset > (5500 - yearOfCalendar)) {
			return ['ai', yearOffset - (5500 - yearOfCalendar)];
		} else {
			// ethiopic Before Incarnation starts from 5500, and 5499, 5498, ...
			return ['bi', yearOfCalendar + yearOffset];
		}
	}

	/**
	 * Clamp a day number to the valid range for the target Ethiopic month.
	 *
	 * <p>Ethiopic months 1–12 each have 30 days. Month 13 (Pagumēn /
	 * Epagomenal) has 5 days in common years and 6 days in leap years.
	 * Leap-year detection delegates to {@link DateEthiopicUtils.isLeapYear}.</p>
	 *
	 * @param targetYearOfCalendar  - target Ethiopic year (all-positive: A.I. 1+, B.I. 5493–5500)
	 * @param monthOfCalendar       - target month (1–13)
	 * @param dayOfCalendar         - desired day of month
	 * @returns the clamped target month and day of the Ethiopic calendar
	 */
	private static computeTargetMonthAndDayOfCalendar(
		targetYearOfCalendar: number, monthOfCalendar: number, dayOfCalendar: number
	): { targetMonthOfCalendar: number, targetDayOfCalendar: number } {
		let targetMonthOfCalendar: number;
		if (targetYearOfCalendar === 5493) {
			// 5493/05/08 is gregory 0001/01/01
			targetMonthOfCalendar = Math.max(monthOfCalendar, 5);
			if (targetMonthOfCalendar === 5) {
				return {targetMonthOfCalendar: 5, targetDayOfCalendar: Math.max(8, dayOfCalendar)};
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
	private static countDaysBackToEraBoundary(targetOfCalendar: MoveDate): number {
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
	 * Map an Ethiopic calendar date ({@code year}, {@code month}, {@code day}) to a
	 * Gregorian date, accounting for the Julian–Gregorian offset that accumulated
	 * over twelve century-years before the 1582 reform.
	 *
	 * @param targetOfCalendar - Ethiopic date as {@code {year, month, day}}
	 * @param eraOfEthiopic    - which era the year belongs to: {@code 'ai'} (Anno Incarnationis) or {@code 'bi'} (Before Incarnation)
	 * @returns equivalent Gregorian date
	 */
	private static moveDateTo(targetOfCalendar: MoveDate, eraOfEthiopic: 'ai' | 'bi'): MoveDate {
		if (eraOfEthiopic === 'ai') {
			// Anno Incarnationis (Incarnation Era).
			// Reference point: Ethiopic 1/01/01 = Gregorian 8/08/27.
			// Count days from the epoch forward to the target date, then add
			// that many days to the Gregorian reference date.
			const daysForward = DateMoveCopticAndEthiopicUtils.countDaysFromEpochTo(targetOfCalendar);
			const gregorian = new Date(8, 7, 27); // August = month 7 (0-indexed)
			gregorian.setDate(gregorian.getDate() + daysForward);
			return {
				year: gregorian.getFullYear(),
				month: gregorian.getMonth() + 1, // convert back to 1-indexed
				day: gregorian.getDate()
			};
		} else {
			// Before Incarnation.
			// Reference point: Ethiopic 5500/13/05 = Gregorian 8/08/26.
			// Count days from the target date backward to the boundary, then
			// subtract that many days from the Gregorian reference date.
			const daysBack = DateEthiopicUtils.countDaysBackToEraBoundary(targetOfCalendar);
			const gregorian = new Date(8, 7, 26); // August = month 7 (0-indexed)
			gregorian.setDate(gregorian.getDate() - daysBack);
			return {
				year: gregorian.getFullYear(),
				month: gregorian.getMonth() + 1, // convert back to 1-indexed
				day: gregorian.getDate()
			};
		}
	}

	/**
	 * Move a Gregorian date by the given number of years in the Ethiopic calendar.
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @param lang       - locale, used to format the date in Ethiopic representation
	 * @returns the moved date in Gregorian
	 */
	// noinspection JSUnusedGlobalSymbols
	static moveYear(date: MoveDate, yearOffset: number, lang: HxLanguageCode): MoveDate {
		if (yearOffset === 0) {
			return {...date};
		}

		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(DateMoveInternalUtils.asJsDate(date), lang, false);
		const [eraOfEthiopic, targetYearOfCalendar] = DateEthiopicUtils.convertYearOfCalendar(date, yearOfCalendar, yearOffset);
		// compute target month and day of calendar
		const {
			targetMonthOfCalendar, targetDayOfCalendar
		} = DateEthiopicUtils.computeTargetMonthAndDayOfCalendar(targetYearOfCalendar, monthOfCalendar, dayOfCalendar);

		return DateEthiopicUtils.moveDateTo({
			year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar
		}, eraOfEthiopic);
	}

	/**
	 * Move a Gregorian date by the given number of months in the Ethiopic calendar.
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @param lang        - locale, used to format the date in Ethiopic representation
	 * @returns the moved date in Gregorian
	 */
	// noinspection JSUnusedGlobalSymbols
	static moveMonth(date: MoveDate, monthOffset: number, lang: HxLanguageCode): MoveDate {
		if (monthOffset === 0) {
			return {...date};
		}

		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(DateMoveInternalUtils.asJsDate(date), lang, false);
		// compute target year/month of calendar
		const {
			yearOffset, tryToTargetMonthOfCalendar
		} = DateMove13MonthsUtils.computeYearOffsetAndTargetMonthOfCalendar(monthOfCalendar, monthOffset);
		const [eraOfEthiopic, targetYearOfCalendar] = DateEthiopicUtils.convertYearOfCalendar(date, yearOfCalendar, yearOffset);
		// compute target month and day of calendar
		const {
			targetMonthOfCalendar, targetDayOfCalendar
		} = DateEthiopicUtils.computeTargetMonthAndDayOfCalendar(targetYearOfCalendar, tryToTargetMonthOfCalendar, dayOfCalendar);
		return DateEthiopicUtils.moveDateTo({
			year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar
		}, eraOfEthiopic);
	}
}
