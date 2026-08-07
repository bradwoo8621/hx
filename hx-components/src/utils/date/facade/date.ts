import type {HxDateTimeValue} from '../../../types';
import type {HxDate} from '../interfaces';
import {UTCDate} from './utc-date';

export class DateUtils {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Gregorian leap-year rule: divisible by 400, or divisible by 4 but not 100.
	 *
	 * <p>JavaScript {@code Date} uses proleptic Gregorian, so century years
	 * like 1500 are treated as non-leap even though they were leap in the Julian
	 * calendar actually used at that time.</p>
	 *
	 * @param year - the year to check
	 * @returns {@code true} if the year is a leap year under the Gregorian rule
	 */
	static isGregorianLeapYear(year: number): boolean {
		return year % 400 === 0 || (year % 4 === 0 && year % 100 != 0);
	}

	/**
	 * Converts a {@link HxDate} or {@link HxDateTimeValue} to a JavaScript `Date` object.
	 *
	 * <p>Month is 1-based in the input and converted to 0-based for `Date`.</p>
	 *
	 * @param value - the date value to convert
	 * @returns a JavaScript {@code Date} object
	 */
	static asJsDate(value: HxDate | Required<HxDateTimeValue>): UTCDate {
		// @ts-expect-error ignore type check
		return UTCDate.of(value.year, value.month - 1, value.day, value.hour ?? 0, value.minute ?? 0, value.second ?? 0, 0);
	};

	/**
	 * Converts a {@code Date} to a {@link HxDate} tuple.
	 *
	 * @param date - the Gregorian date
	 * @returns {@code {year, month, day}} with month 1-indexed
	 */
	static asHxDate(date: UTCDate): HxDate {
		const year = date.getFullYear();
		const month = date.getMonthIndex() + 1;
		const day = date.getDayOfMonth();
		return {year, month, day};
	}

	/**
	 * Clamps the day field to the last valid day of the target month when it exceeds the maximum.
	 * Mutates the given value in place.
	 *
	 * @param date - the date to clamp (modified in place)
	 */
	static fixDayWhenOverLastDayOfMonth(date: HxDate): void {
		const {year, month, day} = date;
		if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
			// do nothing
		} else if ([4, 6, 9, 11].includes(month)) {
			if (day === 31) {
				date.day = 30;
			}
		} else if (DateUtils.isGregorianLeapYear(year)) {
			// Feb. leap year
			if (day > 29) {
				date.day = 29;
			}
		} else if (day > 28) {
			date.day = 28;
		}
	}

	/**
	 * Clamps a BC date (year ≤ 0) to 0001-01-01, the earliest valid AD date.
	 * Mutates the given date in place.
	 *
	 * @param date - the date to check and potentially clamp (modified in place)
	 */
	static backToAdWhenBc(date: UTCDate): void {
		if (date.getFullYear() <= 0) {
			date.setDatePart(1, 0, 1);
		}
	}

	/**
	 * Checks whether the given date is exactly 0001-01-01, the first day of AD.
	 *
	 * @param date - the date to check
	 * @returns {@code true} if the date is 0001-01-01
	 */
	static firstDayOfAd(date: UTCDate): boolean {
		return date.getFullYear() === 1 && date.getMonthIndex() === 0 && date.getDayOfMonth() === 1;
	}
}
