import type {HxDateTimeValue} from '../../../types';
import type {HxDate} from '../interfaces';

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
	 * <p>Month is 1-based in the input and converted to 0-based for `Date`.
	 * Year values < 100 are handled via {@code setFullYear} to avoid the 1900 offset.</p>
	 *
	 * @param value - the date value to convert
	 * @returns a JavaScript {@code Date} object
	 */
	static asJsDate(value: HxDate | Required<HxDateTimeValue>): Date {
		const date = new Date();
		// @ts-expect-error ignore type check
		date.setHours(value.hour ?? 0, value.minute ?? 0, value.second ?? 0);
		date.setFullYear(value.year, value.month - 1, value.day);
		return date;
	};

	/**
	 * Converts a {@code Date} to a {@link HxDate} tuple.
	 *
	 * @param date - the Gregorian date
	 * @returns {@code {year, month, day}} with month 1-indexed
	 */
	static asHxDate(date: Date): HxDate {
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
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
	static backToAdWhenBc(date: Date): void {
		if (date.getFullYear() <= 0) {
			date.setFullYear(1, 0, 1);
		}
	}

	/**
	 * Checks whether the given date is exactly 0001-01-01, the first day of AD.
	 *
	 * @param date - the date to check
	 * @returns {@code true} if the date is 0001-01-01
	 */
	static firstDayOfAd(date: Date): boolean {
		return date.getFullYear() === 1 && date.getMonth() === 0 && date.getDate() === 1;
	}
}
