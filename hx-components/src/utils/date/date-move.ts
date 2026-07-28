import type {HxLanguageCode} from '../../contexts';
import type {HxDateTimeValue} from '../../types';
import {DateMoveGregorianUtils} from './date-move-gregorian';
import {DateMoveInternalUtils} from './date-move-internal';
import {DateMoveJaUtils} from './date-move-ja';
import {DateMoveThUtils} from './date-move-th';
import type {MoveDate} from './date-move-types';
import {DateMoveZhTWUtils} from './date-move-zh-tw';

export class DateMoveUtils {
	private static NotGregorianMoveUtils = [
		DateMoveZhTWUtils,
		DateMoveJaUtils,
		DateMoveThUtils
	];

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Converts a {@link MoveDate} or {@link HxDateTimeValue} to a JavaScript `Date` object.
	 * Month is 1-based in the input and converted to 0-based for `Date`.
	 */
	static asJsDate(value: MoveDate | Required<HxDateTimeValue>): Date {
		return DateMoveInternalUtils.asJsDate(value);
	};

	/**
	 * Clamps the day field to the last valid day of the Gregorian month when it exceeds the max.
	 * Mutates the given value in place.
	 */
	static fixDayWhenOverLastDayOfMonth(date: MoveDate): void {
		return DateMoveInternalUtils.fixDayWhenOverLastDayOfMonth(date);
	}

	/**
	 * Clamps a BC date (year ≤ 0) to 0001-01-01, the earliest valid AD date.
	 * Mutates the given date in place.
	 */
	static backToAdWhenBc(date: Date): void {
		DateMoveInternalUtils.backToAdWhenBc(date);
	}

	/** Returns true if the given date is exactly 0001-01-01, the first day of AD. */
	static firstDayOfAd(date: Date): boolean {
		return DateMoveInternalUtils.firstDayOfAd(date);
	}

	/**
	 * Move a date by the given number of years, dispatching to the appropriate
	 * calendar strategy based on the Gregorian flag and locale.
	 *
	 * Falls back to today's date (as a placeholder) when no matching non-Gregorian
	 * strategy is registered for the given locale.
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @param lang       - locale, determines which calendar strategy to use
	 * @param gregorian  - if {@code true}, use Gregorian arithmetic directly
	 * @returns the moved date in Gregorian
	 */
	static moveYear(date: MoveDate, yearOffset: number, lang: HxLanguageCode, gregorian: boolean): MoveDate {
		if (yearOffset === 0) {
			return {...date};
		}

		// gregorian
		if (DateMoveGregorianUtils.accept(gregorian)) {
			return DateMoveGregorianUtils.moveYear(date, yearOffset);
		}
		// non-gregorian
		const Utils = DateMoveUtils.NotGregorianMoveUtils.find(utils => utils.accept(lang));
		if (Utils != null) {
			return Utils.moveYear(date, yearOffset, lang);
		}
		// non-gregorian, others
		else {
			const targetDate = new Date();
			// TODO
			return {
				year: targetDate.getFullYear(),
				month: targetDate.getMonth() + 1,
				day: targetDate.getDate()
			};
		}
	}

	/**
	 * Move a date by the given number of months, dispatching to the appropriate
	 * calendar strategy based on the Gregorian flag and locale.
	 *
	 * Falls back to today's date (as a placeholder) when no matching non-Gregorian
	 * strategy is registered for the given locale.
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @param lang        - locale, determines which calendar strategy to use
	 * @param gregorian   - if {@code true}, use Gregorian arithmetic directly
	 * @returns the moved date in Gregorian
	 */
	static moveMonth(date: MoveDate, monthOffset: number, lang: HxLanguageCode, gregorian: boolean): MoveDate {
		if (monthOffset === 0) {
			return {...date};
		}

		// gregorian
		if (DateMoveGregorianUtils.accept(gregorian)) {
			return DateMoveGregorianUtils.moveMonth(date, monthOffset);
		}
		// non-gregorian
		const Utils = DateMoveUtils.NotGregorianMoveUtils.find(utils => utils.accept(lang));
		if (Utils != null) {
			return Utils.moveMonth(date, monthOffset, lang);
		}
		// non-gregorian, others
		else {
			const targetDate = new Date();
			// TODO
			return {
				year: targetDate.getFullYear(),
				month: targetDate.getMonth() + 1,
				day: targetDate.getDate()
			};
		}
	}
}