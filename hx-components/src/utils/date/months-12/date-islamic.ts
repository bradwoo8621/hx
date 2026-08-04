import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleUtils, DateMoveUtils, DateUtils} from '../facade';
import type {DateLocaleNotGregorianProvider, MoveDate} from '../interfaces';
import type {DateMoveEraOfTargetYear} from '../months-any';
import {DateMove12MonthsProvider} from './date-move-12-months';

export class DateIslamicUtils extends DateMove12MonthsProvider implements DateLocaleNotGregorianProvider {
	static readonly INSTANCE = new DateIslamicUtils();

	protected constructor() {
		super();
	}

	calendar(): string {
		return 'islamic';
	}

	supportedLanguages(): Array<HxLanguageCode> {
		return [
			'ar-DZ', // Algeria,
			'ar-MA', // Morocco,
			'ar-TN' // Tunisia
		];
	}

	static enable() {
		DateLocaleUtils.enableNotGregorianLocaleUtils(DateIslamicUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveUtils(DateIslamicUtils.INSTANCE);
	}

	// noinspection JSUnusedGlobalSymbols
	static disable() {
		DateLocaleUtils.disableNotGregorianLocaleUtils(DateIslamicUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveUtils(DateIslamicUtils.INSTANCE);
	}

	/** Returns {@code true} when the language uses the Islamic calendar. */
	accept(lang: HxLanguageCode): boolean {
		return lang === 'ar-DZ' || lang === 'ar-MA' || lang === 'ar-TN'
			|| lang.startsWith('ar-DZ-') || lang.startsWith('ar-MA-') || lang.startsWith('ar-TN-');
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
		return date.year > 622 || (date.year === 622 && (date.month > 7 || (date.month === 7 && date.day >= 18)));
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
		return date.year < 622 || (date.year === 622 && (date.month < 7 || (date.month === 7 && date.day < 18)));
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
				return {targetMonthOfCalendar: 5, targetDayOfCalendar: Math.max(20, Math.min(30, dayOfCalendar))};
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
	 * Checks whether the previous month is navigable in the Islamic (tabular)
	 * calendar.
	 *
	 * <p>The Islamic calendar is bounded at Gregorian 0001/01/01, which
	 * corresponds to Islamic −640/05/20. Islamic month 6 (Jumada al-Thani)
	 * starts at Gregorian 0001/01/12, so the threshold accounts for the 11-day
	 * window in January of year 1 where the first displayed day still falls in
	 * month 5 (month 4 would map to dates before the epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous Islamic month exists
	 */
	isPreviousMonthAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 1) || (year === 1 && month === 1 && day > 11);
	}

	/**
	 * Checks whether the previous year is navigable in the Islamic (tabular)
	 * calendar.
	 *
	 * <p>The Islamic calendar is bounded at Gregorian 0001/01/01, corresponding
	 * to Islamic −640/05/20. The initial partial year (−640) contains only
	 * months 5–12, so Islamic year −639 starts at Gregorian 0001/08/06.
	 * The threshold accounts for the 5-day window in August of year 1 where
	 * the first displayed day still falls in year −640 (year −641 would map
	 * to dates before the epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous Islamic year exists
	 */
	isPreviousYearAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 8) || (year === 1 && month === 8 && day > 5);
	}
}
