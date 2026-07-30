import {DateMoveInternalUtils} from './date-move-internal';
import type {MoveDate} from './date-types';

export class DateMoveGregorianUtils {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	static accept(gregorian: boolean): boolean {
		return gregorian;
	}

	/**
	 * @param date in gregorian
	 * @param yearOffset year offset
	 */
	static moveYear(date: MoveDate, yearOffset: number): MoveDate {
		const moved = {...date};

		moved.year = moved.year + yearOffset;
		DateMoveInternalUtils.fixDayWhenOverLastDayOfMonth(moved);
		return moved;
	}

	/**
	 * @param date in gregorian
	 * @param monthOffset month offset
	 */
	static moveMonth(date: MoveDate, monthOffset: number): MoveDate {
		const moved = {...date};

		const targetMonth = moved.month + monthOffset;
		if (monthOffset > 0) {
			// target month:
			// <= 12 -> keep year
			// > 12 and <= 24 -> year + 1
			// ...
			moved.year = moved.year + Math.floor((targetMonth - 1) / 12);
			// target month:
			// 2 - 11 -> mod 12
			// 12 -> mod 12 + 12
			// 13 - 23 -> mod 12
			// 24 -> mod 12 + 12
			// ...
			moved.month = targetMonth % 12;
			moved.month = moved.month === 0 ? 12 : moved.month;
		} else if (targetMonth >= 1) {
			// keep year and use target month directly
			moved.month = targetMonth;
		} else {
			// target month:
			// 0 - -11 -> year - 1
			// -12 - -23 -> year - 2
			// ...
			moved.year = moved.year + Math.floor((targetMonth - 1) / 12);
			// target month:
			// 0 - -11 -> 12 + mod 12
			// -12 - -23 -> 12 + mod 12
			// ...
			moved.month = 12 + targetMonth % 12;
		}
		DateMoveInternalUtils.fixDayWhenOverLastDayOfMonth(moved);
		return moved;
	}
}