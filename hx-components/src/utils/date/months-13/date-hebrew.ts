import type {HxLanguageCode} from '../../../contexts';
import {DateLocaleUtils, DateMoveUtils, DateUtils} from '../facade';
import type {DateLocaleNotGregorianProvider, MoveDate} from '../interfaces';
import type {DateMoveEraOfTargetYear} from '../months-any';
import {DateMove13MonthsProvider} from './date-move-13-months';

export class DateHebrewUtils extends DateMove13MonthsProvider implements DateLocaleNotGregorianProvider {
	static readonly INSTANCE = new DateHebrewUtils();

	protected constructor() {
		super();
	}

	calendar(): string {
		return 'hebrew';
	}

	supportedLanguages(): Array<HxLanguageCode> {
		return [
			'he',   // Hebrew, Israel
			'he-IL' // Hebrew, Israel
		];
	}

	static enable() {
		DateLocaleUtils.enableNotGregorianLocaleUtils(DateHebrewUtils.INSTANCE);
		DateMoveUtils.enableNotGregorianMoveUtils(DateHebrewUtils.INSTANCE);
	}

	// noinspection JSUnusedGlobalSymbols
	static disable() {
		DateLocaleUtils.disableNotGregorianLocaleUtils(DateHebrewUtils.INSTANCE);
		DateMoveUtils.disableNotGregorianMoveUtils(DateHebrewUtils.INSTANCE);
	}

	/** Returns {@code true} when the language uses the Hebrew calendar. */
	accept(lang: HxLanguageCode): boolean {
		return lang === 'he' || lang === 'he-IL'
			|| lang.startsWith('he-');
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static isLeapYear(_yearOfCalendar: number): boolean {
		// TODO
		throw 'Not implemented yet';
	}

	/**
	 * Computes the target Hebrew year after applying an offset.
	 *
	 * <p>The Hebrew calendar uses Anno Mundi (AM) numbering starting from
	 * 3761 BCE = 1 AM. All years are positive, so no era-boundary
	 * compensation is needed. The target year is simply
	 * {@code yearOfCalendar + yearOffset}, clamped to ≥ 3761
	 * (the earliest representable Hebrew year, corresponding to
	 * Gregorian 0001/01/01).</p>
	 *
	 * @param _date          - Gregorian date (unused)
	 * @param yearOfCalendar - current Hebrew year
	 * @param yearOffset     - number of years to advance (positive) or retreat (negative)
	 * @returns the target Hebrew year, ≥ 3761
	 */
	protected computeTargetYearOfCalendar(_date: MoveDate, yearOfCalendar: number, yearOffset: number): [DateMoveEraOfTargetYear, number] {
		const targetYearOfCalendar = Math.max(3761, yearOfCalendar + yearOffset);
		return ['after', targetYearOfCalendar];
	}

	/**
	 * Clamps the target month and day to valid ranges for the Hebrew calendar.
	 *
	 * <p>For the earliest representable Hebrew year (3761), the month is
	 * clamped to ≥ 4 (Tevet) with day ≥ 18, corresponding to Gregorian
	 * 0001/01/01. For all other years the month is kept as-is.</p>
	 *
	 * <p>Hebrew month lengths are either 29 or 30 days, with the total year
	 * length of 353, 354, 355 (common) or 383, 384, 385 (leap) days
	 * depending on whether Cheshvan and Kislev are full or deficient and
	 * whether a leap month (Adar I) is inserted.</p>
	 *
	 * @param targetYearOfCalendar - target Hebrew year
	 * @param monthOfCalendar      - target month (1–13)
	 * @param dayOfCalendar        - desired day of month
	 * @returns the clamped target month and day
	 */
	protected computeTargetMonthAndDayOfCalendar(
		targetYearOfCalendar: number, monthOfCalendar: number, dayOfCalendar: number
	): { targetMonthOfCalendar: number, targetDayOfCalendar: number } {
		let targetMonthOfCalendar: number;
		if (targetYearOfCalendar === 3761) {
			// 3761/04/18 is Gregorian 0001/01/01
			targetMonthOfCalendar = Math.max(monthOfCalendar, 4);
			if (targetMonthOfCalendar === 4) {
				return {targetMonthOfCalendar: 4, targetDayOfCalendar: Math.max(18, Math.min(29, dayOfCalendar))};
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
	 * Checks whether the previous month is navigable in the Hebrew calendar.
	 *
	 * <p>The Hebrew calendar is bounded at Gregorian 0001/01/01, which
	 * corresponds to Hebrew 3761/04/18. Hebrew month 5 (Shevat) starts at
	 * Gregorian 0001/01/13, so the threshold accounts for the 12-day window
	 * in January of year 1 where the first displayed day still falls in
	 * month 4 (month 3 would map to dates before the epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous Hebrew month exists
	 */
	isPreviousMonthAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 1) || (year === 1 && month === 1 && day > 12);
	}

	/**
	 * Checks whether the previous year is navigable in the Hebrew calendar.
	 *
	 * <p>The Hebrew calendar is bounded at Gregorian 0001/01/01, corresponding
	 * to Hebrew 3761/04/18. The initial partial year (3761) starts at month 4,
	 * so Hebrew year 3762 starts at Gregorian 0001/09/06. The threshold
	 * accounts for the 5-day window in September of year 1 where the first
	 * displayed day still falls in year 3761 (year 3760 would map to dates
	 * before the epoch).</p>
	 *
	 * @param _lang                            - locale (unused; era-independent)
	 * @param firstDayOfCurrentMonthOfGregory  - first displayed Gregorian day of the current calendar month
	 * @returns {@code true} when a previous Hebrew year exists
	 */
	isPreviousYearAllowed(_lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean {
		const {year, month, day} = DateUtils.asHxDate(firstDayOfCurrentMonthOfGregory);
		return year > 1 || (year === 1 && month > 9) || (year === 1 && month === 9 && day > 5);
	}
}
