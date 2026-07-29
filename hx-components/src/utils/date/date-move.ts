import type {HxLanguageCode} from '../../contexts';
import type {HxDateTimeValue} from '../../types';
import {DateMoveGregorianUtils} from './date-move-gregorian';
import {DateMoveInternalUtils} from './date-move-internal';
import type {MoveDate} from './date-move-types';

export interface NotGregorianMoveUtils {
	accept(lang: HxLanguageCode): boolean;
	moveYear(date: MoveDate, yearOffset: number, lang: HxLanguageCode): MoveDate;
	moveMonth(date: MoveDate, monthOffset: number, lang: HxLanguageCode): MoveDate;
}

export class DateMoveUtils {
	private static readonly NotGregorianMoveUtils: Array<NotGregorianMoveUtils> = [];

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	static enableNotGregorianMoveUtils(utils: NotGregorianMoveUtils): typeof DateMoveUtils {
		if (!DateMoveUtils.NotGregorianMoveUtils.includes(utils)) {
			DateMoveUtils.NotGregorianMoveUtils.push(utils);
		}
		return DateMoveUtils;
	}

	static disableNotGregorianMoveUtils(utils: NotGregorianMoveUtils): typeof DateMoveUtils {
		const index = DateMoveUtils.NotGregorianMoveUtils.indexOf(utils);
		if (index !== -1) {
			DateMoveUtils.NotGregorianMoveUtils.splice(index, 1);
		}
		return DateMoveUtils;
	}

	/**
	 * Converts a {@link MoveDate} or {@link HxDateTimeValue} to a JavaScript `Date` object.
	 * Month is 1-based in the input and converted to 0-based for `Date`.
	 */
	static asJsDate(value: MoveDate | Required<HxDateTimeValue>): Date {
		return DateMoveInternalUtils.asJsDate(value);
	};

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