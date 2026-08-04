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

	/** Returns {@code true} when the language uses the Islamic calendar. */
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
		const targetYearOfCalendar = Math.max(3761, yearOfCalendar + yearOffset);
		return ['after', targetYearOfCalendar];
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
		if (targetYearOfCalendar === 3761) {
			// −640/05/20 is Gregorian 0001/01/01
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
		return year > 1 || (year === 1 && month > 1) || (year === 1 && month === 1 && day > 12);
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
		return year > 1 || (year === 1 && month > 9) || (year === 1 && month === 9 && day > 5);
	}
}
