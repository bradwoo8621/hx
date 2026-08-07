import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleUtils, DateMoveUtils, DateUtils, UTCDate} from '../facade';
import type {DateLocaleNotGregorianProvider, HxDate} from '../interfaces';
import type {DateMoveTargetMonthAndDayOfCalendar} from '../months-any';
import {DateMoveIslamicSharedUtils} from './date-move-islamic-shared';

export class DateIslamicUtils extends DateMoveIslamicSharedUtils implements DateLocaleNotGregorianProvider {
	protected static readonly DAYS_OF_MONTH_OF_FIRST_CALENDAR_YEAR: ReadonlyArray<number> = [0, 11, 41, 70, 100, 129, 159, 188];
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

	static disable() {
		DateLocaleUtils.disableNotGregorianLocaleUtils(DateIslamicUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveUtils(DateIslamicUtils.INSTANCE);
	}

	/** Returns {@code true} when the language uses the Islamic calendar. */
	accept(lang: HxLanguageCode): boolean {
		return lang === 'ar-DZ' || lang === 'ar-MA' || lang === 'ar-TN'
			|| lang.startsWith('ar-DZ-') || lang.startsWith('ar-MA-') || lang.startsWith('ar-TN-');
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
	// noinspection JSUnusedGlobalSymbols
	static isAnnoHegirae(date: HxDate): boolean {
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
	// noinspection JSUnusedGlobalSymbols
	static isBeforeHijra(date: HxDate): boolean {
		return date.year < 622 || (date.year === 622 && (date.month < 7 || (date.month === 7 && date.day < 18)));
	}

	/**
	 * Clamps the target month and day to valid ranges for the Islamic calendar.
	 *
	 * <p>For the earliest representable Islamic year (−640), the month is clamped
	 * to ≥ 5 (Jumada al-Ula) with day ≥ 20, corresponding to Gregorian
	 * 0001/01/01. For the last representable Islamic year (9666), the month
	 * is clamped to ≤ 3 (Rabi' al-Awwal) with day ≤ 30, corresponding to
	 * Gregorian 9999/12/31. For all other years the month is kept as-is.</p>
	 *
	 * <p>The exact days of each Islamic month cannot be determined without
	 * lunar observation or a leap-year table, so all months are assumed to
	 * have at most 30 days; the day is clamped accordingly.</p>
	 *
	 * @param targetYearOfCalendar - target Islamic year
	 * @param monthOfCalendar      - target month (1–12)
	 * @param dayOfCalendar        - desired day of month
	 * @returns the clamped target month and day
	 */
	protected computeTargetMonthAndDayOfCalendar(targetYearOfCalendar: number, monthOfCalendar: number, dayOfCalendar: number): DateMoveTargetMonthAndDayOfCalendar {
		let targetMonthOfCalendar: number;
		if (targetYearOfCalendar === -640) {
			// −640/05/20 is Gregorian 0001/01/01
			targetMonthOfCalendar = Math.max(monthOfCalendar, 5);
			if (targetMonthOfCalendar === 5) {
				return {targetMonthOfCalendar: 5, targetDayOfCalendar: Math.max(20, Math.min(30, dayOfCalendar))};
			}
		} else if (targetYearOfCalendar === 9666) {
			// 9666 starts at Gregorian 9999/10/04, month 4 day 1 is Gregorian 9999/12/31 (month 4 has only 1 day)
			targetMonthOfCalendar = Math.min(monthOfCalendar, 4);
			if (targetMonthOfCalendar === 4) {
				return {targetMonthOfCalendar: 4, targetDayOfCalendar: 1};
			}
		} else {
			// otherwise keep the target month same as given month
			targetMonthOfCalendar = monthOfCalendar;
		}

		// don't know the days of target month yet, assume max day is 30.
		return {targetMonthOfCalendar, targetDayOfCalendar: Math.min(dayOfCalendar, 30)};
	}

	protected getDaysOfFirstCalendarYear(): number {
		return 217;
	}

	protected getDaysOfPastMonthsOfFirstCalendarYear(monthOfCalendar: number): number {
		return DateIslamicUtils.DAYS_OF_MONTH_OF_FIRST_CALENDAR_YEAR[monthOfCalendar - 5];
	}

	protected getDaysOffsetOfMonthOfFirstCalendarYear(monthOfCalendar: number, dayOfCalendar: number): number {
		return monthOfCalendar === 5 ? (dayOfCalendar - 20) : (dayOfCalendar - 1);
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
	isPreviousYearAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 8) || (year === 1 && month === 8 && day > 5);
	}

	/**
	 * Checks whether the next year is navigable in the Islamic (tabular)
	 * calendar.
	 *
	 * <p>The Islamic calendar is bounded at Gregorian 9999/12/31.
	 * Islamic year 9666 (the last Islamic year containing 9999/12/31)
	 * starts at Gregorian 9999/10/04, so the threshold disallows
	 * next-year navigation from that point onward (Islamic year 9667
	 * would map to dates after the upper bound).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param lastDayOfCurrentMonthOfGregory   - last displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a next Islamic year exists
	 */
	isNextYearAllowed(_lang: HxLanguageCode, lastDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(lastDayOfCurrentMonthOfGregory);
		return year < 9999 || (year === 9999 && month < 10) || (year === 9999 && month === 10 && day < 4);
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
	isPreviousMonthAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 1) || (year === 1 && month === 1 && day > 11);
	}

	/**
	 * Checks whether the next month is navigable in the Islamic (tabular)
	 * calendar.
	 *
	 * <p>The Islamic calendar is bounded at Gregorian 9999/12/31.
	 * The last Islamic month containing 9999/12/31 (month 03) starts
	 * at Gregorian 9999/12/02, so the threshold disallows next-month
	 * navigation from that point onward (month 04 would map to dates
	 * after the upper bound).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param lastDayOfCurrentMonthOfGregory   - last displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a next Islamic month exists
	 */
	isNextMonthAllowed(_lang: HxLanguageCode, lastDayOfCurrentMonthOfGregory: UTCDate): boolean {
		const {year, month, day} = DateUtils.asHxDate(lastDayOfCurrentMonthOfGregory);
		return year < 9999 || (year === 9999 && month < 12) || (year === 9999 && month === 12 && day < 31);
	}
}
