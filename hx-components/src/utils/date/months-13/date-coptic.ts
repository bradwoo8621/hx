import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleUtils, DateMoveUtils, DateUtils} from '../facade';
import type {DateLocaleNotGregorianProvider, HxFormattedEra, MoveDate} from '../interfaces';
import type {DateMoveTargetMonthAndDayOfCalendar, DateMoveTargetYearOfCalendar} from '../months-any';
import {DateMoveCopticAndEthiopicUtils} from './date-move-coptic-and-ethiopic';

export class DateCopticUtils extends DateMoveCopticAndEthiopicUtils implements DateLocaleNotGregorianProvider {
	static readonly INSTANCE = new DateCopticUtils();

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

	static enable() {
		DateLocaleUtils.enableNotGregorianLocaleUtils(DateCopticUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveUtils(DateCopticUtils.INSTANCE);
	}

	static disable() {
		DateLocaleUtils.disableNotGregorianLocaleUtils(DateCopticUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveUtils(DateCopticUtils.INSTANCE);
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
	static isAnnoMartyrum(date: MoveDate): boolean {
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
	static isBeforeDiocletian(date: MoveDate): boolean {
		return date.year < 284 || (date.year === 284 && (date.month < 8 || (date.month === 8 && date.day <= 28)));
	}

	/**
	 * Returns the era label for a Coptic date.
	 *
	 * <p>Before-Diocletian dates return {@code "B.D."} (Before Diocletian).
	 * Anno Martyrum dates return an empty string (no era prefix needed
	 * since A.M. is the default Coptic era in Intl formatting).</p>
	 *
	 * @param _lang    - locale (unused; era label is locale-independent)
	 * @param date     - Gregorian date
	 * @param _partsOf - Intl.DateTimeFormat parts callback (unused)
	 * @returns {@code "B.D."} or an empty string
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	eraAs(_lang: HxLanguageCode, date: Date, _partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedEra {
		const d = DateUtils.asHxDate(date);
		if (DateCopticUtils.isBeforeDiocletian(d)) {
			return 'B.D.';
		} else {
			return '';
		}
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
	protected computeTargetYearOfCalendar(date: MoveDate, yearOfCalendar: number, yearOffset: number): DateMoveTargetYearOfCalendar {
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
	protected countDaysBackToEraBoundary(targetOfCalendar: MoveDate): number {
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
	protected moveDateTo(targetOfCalendar: MoveDate): MoveDate {
		const {year: targetYearOfCalendar} = targetOfCalendar;

		if (targetYearOfCalendar > 0) {
			// Anno Martyrum (Diocletian era).
			// Reference point: Coptic 1/01/01 = Gregorian 284/08/29.
			// Count days from the epoch forward to the target date, then add
			// that many days to the Gregorian reference date.
			const daysForward = this.countDaysFromEpochTo(targetOfCalendar);
			const firstDayOfAM = new Date(284, 7, 29); // August = month 7 (0-indexed)
			firstDayOfAM.setDate(firstDayOfAM.getDate() + daysForward);
			return DateUtils.asHxDate(firstDayOfAM);
		} else {
			// Before Diocletian.
			// Reference point: Coptic −1/13/05 = Gregorian 284/08/28.
			// Count days from the target date backward to the boundary, then
			// subtract that many days from the Gregorian reference date.
			const daysBack = this.countDaysBackToEraBoundary(targetOfCalendar);
			const lastDayOfBD = new Date(284, 7, 28); // August = month 7 (0-indexed)
			lastDayOfBD.setDate(lastDayOfBD.getDate() - daysBack);
			return DateUtils.asHxDate(lastDayOfBD);
		}
	}
}
