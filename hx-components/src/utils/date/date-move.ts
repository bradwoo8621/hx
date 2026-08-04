import type {HxLanguageCode} from '../../contexts';
import type {HxDateTimeValue} from '../../types';
import {DateMoveGregorianUtils} from './date-move-gregorian';
import {DateMoveInternalUtils} from './date-move-internal';
import type {MoveDate} from './date-types';

export interface NotGregorianMoveUtils {
	accept(lang: HxLanguageCode): boolean;
	moveYear(date: MoveDate, yearOffset: number, lang: HxLanguageCode): MoveDate;
	moveMonth(date: MoveDate, monthOffset: number, lang: HxLanguageCode): MoveDate;
}

export class DateMoveUtils {
	private static readonly NOT_GREGORY_MOVE_UTILS: Array<NotGregorianMoveUtils> = [];

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	static enableNotGregorianMoveUtils(utils: NotGregorianMoveUtils): typeof DateMoveUtils {
		if (!DateMoveUtils.NOT_GREGORY_MOVE_UTILS.includes(utils)) {
			DateMoveUtils.NOT_GREGORY_MOVE_UTILS.push(utils);
		}
		return DateMoveUtils;
	}

	static disableNotGregorianMoveUtils(utils: NotGregorianMoveUtils): typeof DateMoveUtils {
		const index = DateMoveUtils.NOT_GREGORY_MOVE_UTILS.indexOf(utils);
		if (index !== -1) {
			DateMoveUtils.NOT_GREGORY_MOVE_UTILS.splice(index, 1);
		}
		return DateMoveUtils;
	}

	static findNotGregoryUtils(lang: HxLanguageCode): NotGregorianMoveUtils | undefined {
		return DateMoveUtils.NOT_GREGORY_MOVE_UTILS.find(utils => utils.accept(lang));
	}

	/**
	 * Converts a {@link MoveDate} or {@link HxDateTimeValue} to a JavaScript `Date` object.
	 * Month is 1-based in the input and converted to 0-based for `Date`.
	 */
	static asJsDate(value: MoveDate | Required<HxDateTimeValue>): Date {
		return DateMoveInternalUtils.asJsDate(value);
	};

	/**
	 * Converts a JavaScript {@link Date} object to a {@link MoveDate}.
	 * Month is 0-based in the input (`Date`) and converted to 1-based for {@link MoveDate}.
	 */
	static asHxDate(date: Date): MoveDate {
		return DateMoveInternalUtils.asHxDate(date);
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
		const Utils = DateMoveUtils.findNotGregoryUtils(lang);
		if (Utils != null) {
			return Utils.moveYear(date, yearOffset, lang);
		}
		// non-gregorian, but no not-gregory move utils supporting, fallback to gregory
		else {
			return DateMoveGregorianUtils.moveYear(date, yearOffset);
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
		const Utils = DateMoveUtils.findNotGregoryUtils(lang);
		if (Utils != null) {
			return Utils.moveMonth(date, monthOffset, lang);
		}
		// non-gregorian, but no not-gregory move utils supporting, fallback to gregory
		else {
			return DateMoveGregorianUtils.moveMonth(date, monthOffset);
		}
	}
}
