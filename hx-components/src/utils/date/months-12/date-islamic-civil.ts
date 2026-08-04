import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleUtils, DateMoveUtils, DateUtils} from '../facade';
import type {DateLocaleNotGregorianProvider, MoveDate} from '../interfaces';
import type {DateMoveEraOfTargetYear} from '../months-any';
import {DateMove12MonthsProvider} from './date-move-12-months';

export class DateIslamicCivilUtils extends DateMove12MonthsProvider implements DateLocaleNotGregorianProvider {
	static readonly INSTANCE = new DateIslamicCivilUtils();

	protected constructor() {
		super();
	}

	calendar(): string {
		return 'islamic-civil';
	}

	supportedLanguages(): Array<HxLanguageCode> {
		return [
			'ar-AE', // United Arab Emirates
			'ar-BH', // Bahrain
			'ar-IQ', // Iraq
			'ar-KW', // Kuwait
			'ar-LB', // Lebanon
			'ar-QA', // Qatar
			'ar-SY'  // Syria
		];
	}

	static enable() {
		DateLocaleUtils.enableNotGregorianLocaleUtils(DateIslamicCivilUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveUtils(DateIslamicCivilUtils.INSTANCE);
	}

	// noinspection JSUnusedGlobalSymbols
	static disable() {
		DateLocaleUtils.disableNotGregorianLocaleUtils(DateIslamicCivilUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveUtils(DateIslamicCivilUtils.INSTANCE);
	}

	/** Returns {@code true} when the language uses the Islamic calendar. */
	accept(lang: HxLanguageCode): boolean {
		return lang === 'ar-AE' || lang === 'ar-BH' || lang === 'ar-IQ'
			|| lang === 'ar-KW' || lang === 'ar-LB' || lang === 'ar-QA'
			|| lang === 'ar-SY'
			|| lang.startsWith('ar-AE-') || lang.startsWith('ar-BH-') || lang.startsWith('ar-IQ-')
			|| lang.startsWith('ar-KW-') || lang.startsWith('ar-LB-') || lang.startsWith('ar-QA-')
			|| lang.startsWith('ar-SY-');
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static isLeapYear(_yearOfCalendar: number): boolean {
		// TODO
		throw 'Not implemented yet';
	}

	/**
	 * Checks whether a Gregorian date falls within the Anno Hegirae era
	 * (Islamic year ≥ 1).
	 *
	 * <p>The Islamic calendar epoch is the Hijra (622 CE). Islamic year 1
	 * (1 AH) begins at Gregorian 0622/07/18. Year 0 exists between the
	 * two eras (…, −1 BH, 0, 1 AH, …).</p>
	 *
	 * @param date - Gregorian date as {@code {year, month, day}}
	 * @returns {@code true} when the date is on or after Gregorian 0622/07/18
	 */
	static isAnnoHegirae(date: MoveDate): boolean {
		return date.year > 622 || (date.year === 622 && (date.month > 7 || (date.month === 7 && date.day >= 19)));
	}

	/**
	 * Checks whether a Gregorian date falls before the Anno Hegirae era
	 * (Islamic year ≤ 0).
	 *
	 * <p>Dates strictly before Gregorian 0622/07/18 belong to Before Hijra
	 * (B.H.) or year 0. Year 0 (Gregorian 0621/07/28 through
	 * 0622/07/17) is included in the Before Hijra era.</p>
	 *
	 * @param date - Gregorian date as {@code {year, month, day}}
	 * @returns {@code true} when the date is before Gregorian 0622/07/18
	 */
	static isBeforeHijra(date: MoveDate): boolean {
		return date.year < 622 || (date.year === 622 && (date.month < 7 || (date.month === 7 && date.day < 19)));
	}

	/**
	 * Computes the target Islamic year after applying an offset.
	 *
	 * <p>The Islamic year numbering includes year 0 (…, −1, 0, 1, …),
	 * so no era-boundary compensation is needed. The target year is
	 * simply {@code yearOfCalendar + yearOffset}, clamped to ≥ −640
	 * (the earliest representable Islamic year, corresponding to
	 * Gregorian 0001/01/01).</p>
	 *
	 * @param _date          - Gregorian date (unused)
	 * @param yearOfCalendar - current Islamic year
	 * @param yearOffset     - number of years to advance (positive) or retreat (negative)
	 * @returns the target Islamic year, ≥ −640
	 */
	protected computeTargetYearOfCalendar(_date: MoveDate, yearOfCalendar: number, yearOffset: number): [DateMoveEraOfTargetYear, number] {
		const targetYearOfCalendar = Math.max(-640, yearOfCalendar + yearOffset);
		return [targetYearOfCalendar > 0 ? 'after' : 'before', targetYearOfCalendar];
	}

	/**
	 * Clamps the target month and day to valid ranges for the Islamic calendar.
	 *
	 * <p>For the earliest representable Islamic year (−640), the month is clamped
	 * to ≥ 5 (Jumada al-Ula) with day ≥ 20, corresponding to Gregorian
	 * 0001/01/01. For all other years the month is kept as-is.</p>
	 *
	 * <p>Islamic month lengths are either 29 or 30 days, determined by lunar
	 * observation. Each month alternates roughly between 29 and 30 days,
	 * though consecutive 29-day or 30-day months do occur.</p>
	 *
	 * @param targetYearOfCalendar - target Islamic year
	 * @param monthOfCalendar      - target month (1–12)
	 * @param dayOfCalendar        - desired day of month
	 * @returns the clamped target month and day
	 */
	protected computeTargetMonthAndDayOfCalendar(
		targetYearOfCalendar: number, monthOfCalendar: number, dayOfCalendar: number
	): { targetMonthOfCalendar: number, targetDayOfCalendar: number } {
		let targetMonthOfCalendar: number;
		if (targetYearOfCalendar === -640) {
			// −640/05/20 is Gregorian 0001/01/01
			targetMonthOfCalendar = Math.max(monthOfCalendar, 5);
			if (targetMonthOfCalendar === 5) {
				return {targetMonthOfCalendar: 5, targetDayOfCalendar: Math.max(18, Math.min(30, dayOfCalendar))};
			}
		} else {
			// otherwise keep the target month same as given month
			targetMonthOfCalendar = monthOfCalendar;
		}

		// let targetDayOfCalendar: number;
		// TODO
		//
		// return {targetMonthOfCalendar, targetDayOfCalendar};
		console.log(targetMonthOfCalendar);
		throw 'Not implemented yet';
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected moveDateTo(_targetOfCalendar: MoveDate): MoveDate {
		// TODO
		throw 'Not implemented yet';
	}

	/**
	 * Checks whether the previous month is navigable in the Indian (Saka)
	 * calendar.
	 *
	 * <p>The Saka calendar is bounded at Gregorian 0001/01/01, which
	 * corresponds to Saka −78/10/11. Saka month 11 starts at Gregorian
	 * 0001/01/21, so the threshold accounts for the 20-day window in January
	 * of year 1 where the first displayed day still falls in month 10 (month 9
	 * would map to dates before the epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous Saka month exists
	 */
	isPreviousMonthAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 1) || (year === 1 && month === 1 && day > 13);
	}

	/**
	 * Checks whether the previous year is navigable in the Indian (Saka)
	 * calendar.
	 *
	 * <p>The Saka calendar is bounded at Gregorian 0001/01/01, corresponding
	 * to Saka −78/10/11. The initial partial year (Saka −78) contains only
	 * months 10–12 (80 days), so Saka year −77 starts at Gregorian 0001/03/22.
	 * The threshold accounts for the 21-day window in March of year 1 where
	 * the first displayed day still falls in year −78 (year −79 would map to
	 * dates before the epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous Saka year exists
	 */
	isPreviousYearAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 8) || (year === 1 && month === 8 && day > 7);
	}
}
