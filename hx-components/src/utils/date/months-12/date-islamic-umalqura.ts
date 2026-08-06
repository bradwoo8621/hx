import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleUtils, DateMoveUtils, DateUtils} from '../facade';
import type {DateLocaleNotGregorianProvider, MoveDate} from '../interfaces';
import type {DateMoveTargetMonthAndDayOfCalendar} from '../months-any';
import {DateMoveIslamicSharedUtils} from './date-move-islamic-shared';

export class DateIslamicUmalquraUtils extends DateMoveIslamicSharedUtils implements DateLocaleNotGregorianProvider {
	protected static readonly DAYS_OF_MONTH_OF_FIRST_CALENDAR_YEAR: ReadonlyArray<number> = [0, 13, 42, 72, 101, 131, 160, 190];
	static readonly INSTANCE = new DateIslamicUmalquraUtils();

	protected constructor() {
		super();
	}

	calendar(): string {
		return 'islamic-umalqura';
	}

	supportedLanguages(): Array<HxLanguageCode> {
		return [
			'ar-OM', // Oman
			'ar-SA', // Saudi Arabia
			'ar-SD', // Sudan
			'ar-YE'  // Yemen
		];
	}

	static enable() {
		DateLocaleUtils.enableNotGregorianLocaleUtils(DateIslamicUmalquraUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveUtils(DateIslamicUmalquraUtils.INSTANCE);
	}

	static disable() {
		DateLocaleUtils.disableNotGregorianLocaleUtils(DateIslamicUmalquraUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveUtils(DateIslamicUmalquraUtils.INSTANCE);
	}

	/** Returns {@code true} when the language uses the Islamic calendar. */
	accept(lang: HxLanguageCode): boolean {
		return lang === 'ar-OM' || lang === 'ar-SA'
			|| lang === 'ar-SD' || lang === 'ar-YE'
			|| lang.startsWith('ar-OM-') || lang.startsWith('ar-SA-')
			|| lang.startsWith('ar-SD-') || lang.startsWith('ar-YE-');
	}

	/**
	 * Checks whether a Gregorian date falls within the Anno Hegirae era
	 * (Islamic year ≥ 1).
	 *
	 * <p>The Islamic calendar epoch is the Hijra (622 CE). Islamic year 1
	 * (1 AH) begins at Gregorian 0622/07/19. Year 0 exists between the
	 * two eras (…, −1 BH, 0, 1 AH, …).</p>
	 *
	 * @param date - Gregorian date as {@code {year, month, day}}
	 * @returns {@code true} when the date is on or after Gregorian 0622/07/19
	 */
	// noinspection JSUnusedGlobalSymbols
	static isAnnoHegirae(date: MoveDate): boolean {
		return date.year > 622 || (date.year === 622 && (date.month > 7 || (date.month === 7 && date.day >= 19)));
	}

	/**
	 * Checks whether a Gregorian date falls before the Anno Hegirae era
	 * (Islamic year ≤ 0).
	 *
	 * <p>Dates strictly before Gregorian 0622/07/19 belong to Before Hijra
	 * (B.H.) or year 0. Year 0 (Gregorian 0621/07/28 through
	 * 0622/07/18) is included in the Before Hijra era.</p>
	 *
	 * @param date - Gregorian date as {@code {year, month, day}}
	 * @returns {@code true} when the date is before Gregorian 0622/07/19
	 */
	// noinspection JSUnusedGlobalSymbols
	static isBeforeHijra(date: MoveDate): boolean {
		return date.year < 622 || (date.year === 622 && (date.month < 7 || (date.month === 7 && date.day < 19)));
	}

	/**
	 * Clamps the target month and day to valid ranges for the Islamic calendar.
	 *
	 * <p>For the earliest representable Islamic year (−640), the month is clamped
	 * to ≥ 5 (Jumada al-Ula) with day ≥ 18, corresponding to Gregorian
	 * 0001/01/01. For the last representable Islamic year (9666), the month
	 * is clamped to ≤ 4 (Rabi' al-Thani) with day ≤ 2, corresponding to
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
	// noinspection DuplicatedCode
	protected computeTargetMonthAndDayOfCalendar(targetYearOfCalendar: number, monthOfCalendar: number, dayOfCalendar: number): DateMoveTargetMonthAndDayOfCalendar {
		let targetMonthOfCalendar: number;
		if (targetYearOfCalendar === -640) {
			// −640/05/20 is Gregorian 0001/01/01
			targetMonthOfCalendar = Math.max(monthOfCalendar, 5);
			if (targetMonthOfCalendar === 5) {
				return {targetMonthOfCalendar: 5, targetDayOfCalendar: Math.max(18, Math.min(30, dayOfCalendar))};
			}
		} else if (targetYearOfCalendar === 9666) {
			// 9666 starts at Gregorian 9999/10/04, month 4 day 2 is Gregorian 9999/12/31
			targetMonthOfCalendar = Math.min(monthOfCalendar, 4);
			if (targetMonthOfCalendar === 4) {
				return {targetMonthOfCalendar: 4, targetDayOfCalendar: Math.min(2, dayOfCalendar)};
			}
		} else {
			// otherwise keep the target month same as given month
			targetMonthOfCalendar = monthOfCalendar;
		}

		// don't know the days of target month yet, assume max day is 30.
		return {targetMonthOfCalendar, targetDayOfCalendar: Math.min(dayOfCalendar, 30)};
	}

	protected getDaysOfFirstCalendarYear(): number {
		return 219;
	}

	protected getDaysOfPastMonthsOfFirstCalendarYear(monthOfCalendar: number): number {
		return DateIslamicUmalquraUtils.DAYS_OF_MONTH_OF_FIRST_CALENDAR_YEAR[monthOfCalendar - 5];
	}

	protected getDaysOffsetOfMonthOfFirstCalendarYear(monthOfCalendar: number, dayOfCalendar: number): number {
		return monthOfCalendar === 5 ? (dayOfCalendar - 18) : (dayOfCalendar - 1);
	}

	/**
	 * Checks whether the previous year is navigable in the Islamic Umalqura calendar.
	 *
	 * <p>The Islamic Umalqura calendar is bounded at Gregorian 0001/01/01,
	 * corresponding to Islamic −640/05/18. The initial partial year (−640)
	 * contains only months 5–12, so Islamic year −639 starts at Gregorian
	 * 0001/08/08. The threshold accounts for the 7-day window in August of
	 * year 1 where the first displayed day still falls in year −640 (year −641
	 * would map to dates before the epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous Islamic year exists
	 */
	isPreviousYearAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 8) || (year === 1 && month === 8 && day > 7);
	}

	/**
	 * Checks whether the next year is navigable in the Islamic Umalqura
	 * calendar.
	 *
	 * <p>The Islamic Umalqura calendar is bounded at Gregorian 9999/12/31.
	 * Islamic year 9666 (the last Islamic Umalqura year containing 9999/12/31)
	 * starts at Gregorian 9999/10/02, so the threshold disallows
	 * next-year navigation from that point onward (Islamic year 9667
	 * would map to dates after the upper bound).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param lastDayOfCurrentMonthOfGregory   - last displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a next Islamic Umalqura year exists
	 */
	isNextYearAllowed(_lang: HxLanguageCode, lastDayOfCurrentMonthOfGregory: Date): boolean {
		const {year, month, day} = DateUtils.asHxDate(lastDayOfCurrentMonthOfGregory);
		return year < 9999 || (year === 9999 && month < 10) || (year === 9999 && month === 10 && day < 2);
	}

	/**
	 * Checks whether the previous month is navigable in the Islamic Umalqura calendar.
	 *
	 * <p>The Islamic Umalqura calendar is bounded at Gregorian 0001/01/01,
	 * which corresponds to Islamic −640/05/18. Islamic month 6 (Jumada
	 * al-Thani) starts at Gregorian 0001/01/14, so the threshold accounts
	 * for the 13-day window in January of year 1 where the first displayed
	 * day still falls in month 5 (month 4 would map to dates before the
	 * epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous Islamic month exists
	 */
	isPreviousMonthAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 1) || (year === 1 && month === 1 && day > 13);
	}

	/**
	 * Checks whether the next month is navigable in the Islamic Umalqura
	 * calendar.
	 *
	 * <p>The Islamic Umalqura calendar is bounded at Gregorian 9999/12/31.
	 * The last Islamic Umalqura month containing 9999/12/31 starts at
	 * Gregorian 9999/12/30, so the threshold disallows next-month
	 * navigation from that point onward (the next Islamic Umalqura month
	 * would map to dates after the upper bound).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param lastDayOfCurrentMonthOfGregory   - last displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a next Islamic Umalqura month exists
	 */
	isNextMonthAllowed(_lang: HxLanguageCode, lastDayOfCurrentMonthOfGregory: Date): boolean {
		const {year, month, day} = DateUtils.asHxDate(lastDayOfCurrentMonthOfGregory);
		return year < 9999 || (year === 9999 && month < 12) || (year === 9999 && month === 12 && day < 30);
	}
}
