import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleUtils, DateMoveUtils} from '../facade';
import type {DateLocaleNotGregorianProvider, HxFormattedEra, MoveDate} from '../interfaces';
import type {
	DateMoveEraOfTargetYearOfCalendar,
	DateMoveTargetMonthAndDayOfCalendar,
	DateMoveTargetYearOfCalendar
} from '../months-any';
import {DateMoveCopticAndEthiopicUtils} from './date-move-coptic-and-ethiopic';

export class DateEthiopicUtils extends DateMoveCopticAndEthiopicUtils implements DateLocaleNotGregorianProvider {
	static readonly INSTANCE = new DateEthiopicUtils();

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

	static enable() {
		DateLocaleUtils.enableNotGregorianLocaleUtils(DateEthiopicUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveUtils(DateEthiopicUtils.INSTANCE);
	}

	static disable() {
		DateLocaleUtils.disableNotGregorianLocaleUtils(DateEthiopicUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveUtils(DateEthiopicUtils.INSTANCE);
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
	 * @returns a tuple of {@code ['ai' | 'bi', year]} identifying the target era and year,
	 *          with the year clamped to ≥ 5493 (Gregorian 1 CE)
	 */
	protected computeTargetYearOfCalendar(date: MoveDate, yearOfCalendar: number, yearOffset: number): DateMoveTargetYearOfCalendar {
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
	protected countDaysBackToEraBoundary(targetOfCalendar: MoveDate): number {
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
	 * @param eraOfTargetYearOfCalendar    - which era the year belongs to: {@code 'after'} (Anno Incarnationis) or {@code 'before'} (Before Incarnation)
	 * @returns equivalent Gregorian date
	 */
	protected moveDateTo(targetOfCalendar: MoveDate, eraOfTargetYearOfCalendar: DateMoveEraOfTargetYearOfCalendar): MoveDate {
		if (eraOfTargetYearOfCalendar === 'after') {
			// Anno Incarnationis (Incarnation Era).
			// Reference point: Ethiopic 1/01/01 = Gregorian 8/08/27.
			// Count days from the epoch forward to the target date, then add
			// that many days to the Gregorian reference date.
			const daysForward = this.countDaysFromEpochTo(targetOfCalendar);
			const firstDayOfAI = new Date();
			firstDayOfAI.setFullYear(8, 7, 27); // August = month 7 (0-indexed)
			firstDayOfAI.setDate(firstDayOfAI.getDate() + daysForward);
			return {
				year: firstDayOfAI.getFullYear(),
				month: firstDayOfAI.getMonth() + 1, // convert back to 1-indexed
				day: firstDayOfAI.getDate()
			};
		} else {
			// Before Incarnation.
			// Reference point: Ethiopic 5500/13/05 = Gregorian 8/08/26.
			// Count days from the target date backward to the boundary, then
			// subtract that many days from the Gregorian reference date.
			const daysBack = this.countDaysBackToEraBoundary(targetOfCalendar);
			const lastDayOfBI = new Date();
			lastDayOfBI.setFullYear(8, 7, 26); // August = month 7 (0-indexed)
			lastDayOfBI.setDate(lastDayOfBI.getDate() - daysBack);
			return {
				year: lastDayOfBI.getFullYear(),
				month: lastDayOfBI.getMonth() + 1, // convert back to 1-indexed
				day: lastDayOfBI.getDate()
			};
		}
	}

	/**
	 * Returns the era label for an Ethiopic date.
	 *
	 * <p>Before-Incarnation dates return {@code "B.I."} (Before Incarnation).
	 * Anno Incarnationis dates return an empty string (no era prefix needed
	 * since A.I. is the default Ethiopic era in Intl formatting).</p>
	 *
	 * @param _lang    - locale (unused; era label is locale-independent)
	 * @param date     - Gregorian date
	 * @param _partsOf - Intl.DateTimeFormat parts callback (unused)
	 * @returns {@code "B.I."} or an empty string
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	eraAs(_lang: HxLanguageCode, date: Date, _partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedEra {
		const d = {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
		if (DateEthiopicUtils.isBeforeIncarnation(d)) {
			return 'B.I.';
		} else {
			return '';
		}
	}
}
