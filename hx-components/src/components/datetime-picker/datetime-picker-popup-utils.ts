import {type HxLanguageCode} from '../../contexts';
import type {HxDateTimeValue, HxDateWeekendDay} from '../../types';
import {DateLocaleUtils, DateUtils, type HxFormattedWeekdays} from '../../utils';
import type {
	ComputedDays,
	ComputedWeek,
	HxDateTimeAnteroposterior,
	HxDateTimeAnteroposteriorYear,
	HxDateTimeAnteroposteriorYearMonth,
	HxDateTimePickerPopupProps
} from './datetime-picker-popup-types';
import {redressFirstDayOfWeek, redressWeekendDays} from './defaults';

export class HxDateTimeUtils {
	private static readonly WeekdaysOfSun: Array<HxDateWeekendDay> = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
	private static readonly WeekdaysOfMon: Array<HxDateWeekendDay> = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
	private static readonly WeekdaysOfTue: Array<HxDateWeekendDay> = ['tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'mon'] as const;
	private static readonly WeekdaysOfWed: Array<HxDateWeekendDay> = ['wed', 'thu', 'fri', 'sat', 'sun', 'mon', 'tue'] as const;
	private static readonly WeekdaysOfThu: Array<HxDateWeekendDay> = ['thu', 'fri', 'sat', 'sun', 'mon', 'tue', 'wed'] as const;
	private static readonly WeekdaysOfFri: Array<HxDateWeekendDay> = ['fri', 'sat', 'sun', 'mon', 'tue', 'wed', 'thu'] as const;
	private static readonly WeekdaysOfSat: Array<HxDateWeekendDay> = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'] as const;
	private static readonly AllWeekdays = {
		sun: HxDateTimeUtils.WeekdaysOfSun,
		mon: HxDateTimeUtils.WeekdaysOfMon,
		tue: HxDateTimeUtils.WeekdaysOfTue,
		wed: HxDateTimeUtils.WeekdaysOfWed,
		thu: HxDateTimeUtils.WeekdaysOfThu,
		fri: HxDateTimeUtils.WeekdaysOfFri,
		sat: HxDateTimeUtils.WeekdaysOfSat
	} as const;
	private static readonly AllWeekdaysToDateStd: Record<HxDateWeekendDay, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
		sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
	};

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Clamps the day field to the last valid day of the Gregorian month when it exceeds the max.
	 * Mutates the given value in place.
	 */
	static fixDayWhenOverLastDayOfMonth(value: Required<HxDateTimeValue>) {
		const {year, month, day} = value;
		if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
			// do nothing
		} else if ([4, 6, 9, 11].includes(month)) {
			if (day === 31) {
				value.day = 30;
			}
		} else if (year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)) {
			// Feb. leap year
			if (day > 29) {
				value.day = 29;
			}
		} else if (day > 28) {
			value.day = 28;
		}
	}

	/**
	 * Clamps a BC date (year ≤ 0) to 0001-01-01, the earliest valid AD date.
	 * Mutates the given date in place.
	 */
	static backToAdWhenBc(date: Date): void {
		if (date.getFullYear() <= 0) {
			date.setDate(1);
			date.setMonth(0);
			date.setFullYear(1);
		}
	}

	/** Returns true if the given date is exactly 0001-01-01, the first day of AD. */
	static firstDayOfAd(date: Date): boolean {
		return date.getFullYear() === 1 && date.getMonth() === 0 && date.getDate() === 1;
	}

	/**
	 * Converts an {@link HxDateTimeValue} to a JavaScript `Date` object.
	 * Month is 1-based in the input and converted to 0-based for `Date`.
	 */
	static asJsDate(value: Required<HxDateTimeValue>): Date {
		const date = new Date();
		date.setSeconds(value.second);
		date.setMinutes(value.minute);
		date.setHours(value.hour);
		date.setFullYear(value.year);
		date.setMonth(value.month - 1);
		date.setDate(value.day);
		return date;
	};

	/**
	 * Resolves the ordered weekday list and weekend set for a locale.
	 * Handles custom `firstDayOfWeek` and `weekendDays` overrides from props.
	 */
	static computeWeekdays<T extends object>(
		weekdays: HxFormattedWeekdays, // sun - sat
		lang: HxLanguageCode,
		firstDayOfWeek?: HxDateTimePickerPopupProps<T>['firstDayOfWeek'],
		weekendDays?: HxDateTimePickerPopupProps<T>['weekendDays']
	): ComputedWeek {
		const computed: ComputedWeek = {week: [], weekends: []};

		const mapped = weekdays.reduce((acc, weekday, index) => {
			const key = HxDateTimeUtils.WeekdaysOfSun[index] as HxDateWeekendDay;
			acc[key] = {label: weekday, weekend: false};
			return acc;
		}, {} as Record<HxDateWeekendDay, { label: string; weekend: boolean }>);

		let firstDayOfWeekOfLang: HxDateWeekendDay | undefined;
		let redressedWeekendDays = redressWeekendDays(weekendDays);
		if (redressedWeekendDays === 'default') {
			const {weekends, firstDayOfWeek} = DateLocaleUtils.getWeekInfo(lang);
			redressedWeekendDays = weekends;
			firstDayOfWeekOfLang = firstDayOfWeek;
		}
		// given
		redressedWeekendDays.forEach(key => {
			mapped[key].weekend = true;
			computed.weekends.push(HxDateTimeUtils.WeekdaysOfSun.indexOf(key) as ComputedWeek['weekends'][number]);
		});

		let redressedFirstDayOfWeek = redressFirstDayOfWeek(firstDayOfWeek) as HxDateWeekendDay | 'default';
		if (redressedFirstDayOfWeek === 'default') {
			if (firstDayOfWeekOfLang != null) {
				redressedFirstDayOfWeek = firstDayOfWeekOfLang;
			} else {
				const {firstDayOfWeek} = DateLocaleUtils.getWeekInfo(lang);
				redressedFirstDayOfWeek = firstDayOfWeek;
			}
		}

		HxDateTimeUtils.AllWeekdays[redressedFirstDayOfWeek].forEach(key => {
			const {label, weekend} = mapped[key];
			computed.week.push({key: key, label, weekend});
		});
		return computed;
	};

	private static computeLeadingPaddingDays(date: Date, firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6) {
		return (date.getDay() - firstDayOfWeek + 7) % 7;
	};

	private static computeTrailingPaddingDays(date: Date, firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6) {
		return 6 - (date.getDay() - firstDayOfWeek + 7) % 7;
	};

	/**
	 * Computes the 42-day grid for the date picker popup.
	 * When `forceGregorian` is true, uses Gregorian month boundaries for fast computation;
	 * otherwise walks day-by-day using locale-aware month labels.
	 *
	 * @param date - A representative date in the target month.
	 * @param lang - Locale for formatting and calendar resolution.
	 * @param forceGregorian - Whether to force Gregorian month computation.
	 * @param week - Resolved weekday ordering and weekend flags.
	 * @returns 42 days (6 weeks × 7 days) as padded entries for the picker grid.
	 */
	static computeDays(date: Date, lang: HxLanguageCode, forceGregorian: boolean, week: ComputedWeek): ComputedDays {
		if (forceGregorian) {
			// quick computation
			const daysOfThisMonth: Array<Date> = new Array(DateUtils.lastDayOfMonth(date.getFullYear(), date.getMonth() + 1))
				.fill(1)
				.map((_, index) => {
					const d = new Date(date);
					d.setDate(index + 1);
					return d;
				});
			const daysBeforeThisMonth: Array<Date> = [];
			const daysAfterThisMonth: Array<Date> = [];
			const firstDayOfWeek = HxDateTimeUtils.AllWeekdaysToDateStd[week.week[0].key];
			let leadingPaddingDays: number;
			let trailingPaddingDays: number;
			const firstDayOfMonth = daysOfThisMonth[0];
			const lastDayOfMonth = daysOfThisMonth[daysOfThisMonth.length - 1];
			if (daysOfThisMonth.length === 28 && firstDayOfMonth.getDay() === firstDayOfWeek) {
				leadingPaddingDays = 7;
				trailingPaddingDays = 7;
			} else {
				leadingPaddingDays = HxDateTimeUtils.computeLeadingPaddingDays(firstDayOfMonth, firstDayOfWeek);
				trailingPaddingDays = HxDateTimeUtils.computeTrailingPaddingDays(lastDayOfMonth, firstDayOfWeek);
			}
			for (let index = 1; index <= leadingPaddingDays; index++) {
				const date = new Date(firstDayOfMonth);
				date.setDate(firstDayOfMonth.getDate() - index);
				daysBeforeThisMonth.unshift(date);
			}
			for (let index = 1; index <= trailingPaddingDays; index++) {
				const date = new Date(lastDayOfMonth);
				date.setDate(lastDayOfMonth.getDate() + index);
				daysAfterThisMonth.push(date);
			}
			const days = [...daysBeforeThisMonth, ...daysOfThisMonth, ...daysAfterThisMonth];
			if (days.length === 35) {
				if (daysBeforeThisMonth.length === 0) {
					const firstDay = days[0];
					for (let index = 1; index <= 7; index++) {
						const date = new Date(firstDay);
						date.setDate(firstDay.getDate() - index);
						days.unshift(date);
					}
				} else {
					const lastDay = days[days.length - 1];
					for (let index = 1; index <= 7; index++) {
						const date = new Date(lastDay);
						date.setDate(lastDay.getDate() + index);
						days.push(date);
					}
				}
			}

			const thisMonth = date.getMonth();
			return days.map(day => {
				return {
					key: `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`,
					label: DateLocaleUtils.formatDay(day, lang, forceGregorian),
					weekend: week.weekends.includes(day.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6),
					value: day,
					thisMonth: day.getMonth() === thisMonth
				};
			});
		} else {
			const daysOfThisMonth = [];
			const daysBeforeThisMonth = [];
			const daysAfterThisMonth = [];
			const [thisMonthLabel, dayLabel] = DateLocaleUtils.formatMonthAndDay(date, lang, false);
			daysOfThisMonth.push({value: date, label: dayLabel, thisMonth: true});
			for (let index = -1; index >= -31; index--) {
				const d = new Date(date);
				d.setDate(date.getDate() + index);
				const [monthLabel, dLabel] = DateLocaleUtils.formatMonthAndDay(d, lang, false);
				if (monthLabel !== thisMonthLabel) {
					break;
				} else {
					daysOfThisMonth.unshift({value: d, label: dLabel, thisMonth: true});
				}
			}
			for (let index = 1; index <= 31; index++) {
				const d = new Date(date);
				d.setDate(date.getDate() + index);
				const [monthLabel, dLabel] = DateLocaleUtils.formatMonthAndDay(d, lang, false);
				if (monthLabel !== thisMonthLabel) {
					break;
				} else {
					daysOfThisMonth.push({value: d, label: dLabel, thisMonth: true});
				}
			}
			const firstDayOfWeek = HxDateTimeUtils.AllWeekdaysToDateStd[week.week[0].key];
			let leadingPaddingDays: number;
			let trailingPaddingDays: number;
			const firstDayOfMonth = daysOfThisMonth[0];
			const lastDayOfMonth = daysOfThisMonth[daysOfThisMonth.length - 1];
			if (daysOfThisMonth.length === 28 && firstDayOfMonth.value.getDay() === firstDayOfWeek) {
				leadingPaddingDays = 7;
				trailingPaddingDays = 7;
			} else {
				leadingPaddingDays = HxDateTimeUtils.computeLeadingPaddingDays(firstDayOfMonth.value, firstDayOfWeek);
				trailingPaddingDays = HxDateTimeUtils.computeTrailingPaddingDays(lastDayOfMonth.value, firstDayOfWeek);
			}
			for (let index = 1; index <= leadingPaddingDays; index++) {
				const date = new Date(firstDayOfMonth.value);
				date.setDate(firstDayOfMonth.value.getDate() - index);
				const dayLabel = DateLocaleUtils.formatDay(date, lang, false);
				daysBeforeThisMonth.unshift({value: date, label: dayLabel, thisMonth: false});
			}
			for (let index = 1; index <= trailingPaddingDays; index++) {
				const date = new Date(lastDayOfMonth.value);
				date.setDate(lastDayOfMonth.value.getDate() + index);
				const dayLabel = DateLocaleUtils.formatDay(date, lang, false);
				daysAfterThisMonth.push({value: date, label: dayLabel, thisMonth: false});
			}
			const days = [...daysBeforeThisMonth, ...daysOfThisMonth, ...daysAfterThisMonth];
			if (days.length === 35) {
				if (daysBeforeThisMonth.length === 0) {
					const firstDay = days[0];
					for (let index = 1; index <= 7; index++) {
						const date = new Date(firstDay.value);
						date.setDate(firstDay.value.getDate() - index);
						const dayLabel = DateLocaleUtils.formatDay(date, lang, false);
						days.unshift({value: date, label: dayLabel, thisMonth: false});
					}
				} else {
					const lastDay = days[days.length - 1];
					for (let index = 1; index <= 7; index++) {
						const date = new Date(lastDay.value);
						date.setDate(lastDay.value.getDate() + index);
						const dayLabel = DateLocaleUtils.formatDay(date, lang, false);
						days.push({value: date, label: dayLabel, thisMonth: false});
					}
				}
			}

			return days.map(day => {
				const value = day.value;
				return {
					key: `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`,
					label: day.label,
					weekend: week.weekends.includes(value.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6),
					value: day.value,
					thisMonth: day.thisMonth
				};
			});
		}
	};
}

export interface HxDateWithYmdCalendar {
	date: Date;
	yearOfCalendar: number;
	monthOfCalendar: number;
	dayOfCalendar: number;
}

export class HxDateTimeMoveUtils {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Moves the date forward within the same non-Gregorian calendar year to the given month.
	 * Uses 29-day steps (minimum non-Gregorian month length) to avoid overshooting.
	 *
	 * @param options.sourceDate - The source date.
	 * @param options.sourceMonthOfCalendar - Non-Gregorian month of the source date (1–12).
	 * @param options.targetMonthOfCalendar - Target non-Gregorian month, must be > source month (1–12).
	 * @param options.lang - Locale for calendar resolution.
	 * @returns The moved date with its updated non-Gregorian year/month/day.
	 */
	static moveMonthForwardToInSameYearWhenNotGregorian(options: {
		sourceDate: Date; sourceMonthOfCalendar: number; targetMonthOfCalendar: number; lang: HxLanguageCode;
	}): HxDateWithYmdCalendar {
		const {sourceDate, sourceMonthOfCalendar, targetMonthOfCalendar, lang} = options;

		const date = new Date(sourceDate);
		date.setDate(date.getDate() + (targetMonthOfCalendar - sourceMonthOfCalendar) * 29);
		let [, year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
		while (month !== targetMonthOfCalendar) {
			date.setDate(date.getDate() + 29);
			[, year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
		}
		return {date: date, yearOfCalendar: year, monthOfCalendar: month, dayOfCalendar: day};
	};

	/**
	 * Moves the date backward within the same non-Gregorian calendar year to the given month.
	 * Uses 29-day steps (minimum non-Gregorian month length) to avoid overshooting.
	 *
	 * @param options.sourceDate - The source date.
	 * @param options.sourceMonthOfCalendar - Non-Gregorian month of the source date (1–12).
	 * @param options.targetMonthOfCalendar - Target non-Gregorian month, must be < source month (1–12).
	 * @param options.lang - Locale for calendar resolution.
	 * @returns The moved date with its updated non-Gregorian year/month/day.
	 */
	static moveMonthBackwardToInSameYearWhenNotGregorian(options: {
		sourceDate: Date; sourceMonthOfCalendar: number; targetMonthOfCalendar: number; lang: HxLanguageCode;
	}): HxDateWithYmdCalendar {
		const {sourceDate, sourceMonthOfCalendar, targetMonthOfCalendar, lang} = options;

		const date = new Date(sourceDate);
		date.setDate(date.getDate() + (targetMonthOfCalendar - sourceMonthOfCalendar) * 29);
		let [, year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
		while (month !== targetMonthOfCalendar) {
			date.setDate(date.getDate() - 29);
			[, year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
		}
		return {date: date, yearOfCalendar: year, monthOfCalendar: month, dayOfCalendar: day};
	};

	/**
	 * Moves the date to the given non-Gregorian calendar year.
	 * Uses a while-loop with 353-day steps (minimum days per year) to converge without overshooting.
	 * The resulting month and day are arbitrary — callers should follow up with month/day alignment.
	 *
	 * @param options.sourceDate - The source date.
	 * @param options.sourceYearOfCalendar - Non-Gregorian year of the source date.
	 * @param options.targetYearOfCalendar - Target non-Gregorian year.
	 * @param options.lang - Locale for calendar resolution.
	 * @returns The moved date with its updated non-Gregorian year/month/day.
	 */
	static moveYearToWhenNotGregorian(options: {
		sourceDate: Date; sourceYearOfCalendar: number; targetYearOfCalendar: number; lang: HxLanguageCode;
	}): HxDateWithYmdCalendar {
		const {sourceDate, sourceYearOfCalendar, targetYearOfCalendar, lang} = options;

		// there is at least 353 days for one year (353, 354, 355, 365, 366, 383, 384, 385).
		const date = new Date(sourceDate);
		let yearOfDate = sourceYearOfCalendar;

		while (yearOfDate !== targetYearOfCalendar) {
			const diff = targetYearOfCalendar - yearOfDate;
			// use 353 to make sure never over jumping year
			date.setDate(date.getDate() + diff * 353);
			[, yearOfDate] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
		}

		const [, year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
		return {date: date, yearOfCalendar: year, monthOfCalendar: month, dayOfCalendar: day};
	};

	/**
	 * Moves the date to the given non-Gregorian month within the same calendar year.
	 * If the target month 13 does not exist (no leap month in that year), falls back to month 12.
	 * When the source is month 13, first steps back to month 12 before moving to the target.
	 *
	 * @param options.sourceDate - The source date.
	 * @param options.sourceMonthOfCalendar - Non-Gregorian month of the source date (1–13).
	 * @param options.targetMonthOfCalendar - Target non-Gregorian month (1–13).
	 * @param options.lang - Locale for calendar resolution.
	 * @returns The moved date with its updated non-Gregorian year/month/day.
	 */
	static moveMonthToWhenNotGregorian(options: {
		sourceDate: Date; sourceMonthOfCalendar: number; targetMonthOfCalendar: number; lang: HxLanguageCode;
	}): HxDateWithYmdCalendar {
		const {sourceDate, sourceMonthOfCalendar, targetMonthOfCalendar, lang} = options;

		let date = new Date(sourceDate);
		// source month is before target month
		if (sourceMonthOfCalendar < targetMonthOfCalendar) {
			if (targetMonthOfCalendar === 13) {
				// test the #13 month existing in given year of calendar. if not, the target month should be set to 12
				if (sourceMonthOfCalendar !== 12) {
					// try to move to #12 month first
					date = HxDateTimeMoveUtils.moveMonthForwardToInSameYearWhenNotGregorian({
						sourceDate: date, sourceMonthOfCalendar, targetMonthOfCalendar: 12, lang
					}).date;
				}
				// possible days in #12 month is 29, 30, 31, so set date as 32 to make sure month move to next
				const [, , , day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
				const dateOfM13 = new Date(date);
				dateOfM13.setDate(dateOfM13.getDate() + (32 - day));
				const [, , month] = DateLocaleUtils.formatDateInNumeric(dateOfM13, lang, false);
				if (month === 13) {
					date = dateOfM13;
				}
			} else {
				date = HxDateTimeMoveUtils.moveMonthForwardToInSameYearWhenNotGregorian({
					sourceDate: date,
					sourceMonthOfCalendar,
					targetMonthOfCalendar,
					lang
				}).date;
			}
		}
		// source month is after target month
		else if (sourceMonthOfCalendar > targetMonthOfCalendar) {
			if (sourceMonthOfCalendar === 13) {
				// move month to #12 month first
				const [, , , day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
				date.setDate(date.getDate() - day);
				date = HxDateTimeMoveUtils.moveMonthBackwardToInSameYearWhenNotGregorian({
					sourceDate: date, sourceMonthOfCalendar: 12, targetMonthOfCalendar, lang
				}).date;
			} else {
				date = HxDateTimeMoveUtils.moveMonthBackwardToInSameYearWhenNotGregorian({
					sourceDate: date,
					sourceMonthOfCalendar,
					targetMonthOfCalendar,
					lang
				}).date;
			}
		}

		const [, year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
		return {date: date, yearOfCalendar: year, monthOfCalendar: month, dayOfCalendar: day};
	};

	/**
	 * Moves the date to the given non-Gregorian day within the same month.
	 * If the target day exceeds the month length, falls back to the last valid day of the month
	 * (probed from candidate values: 30, 29, 28, 6, 5).
	 *
	 * @param options.sourceDate - The source date.
	 * @param options.sourceDayOfCalendar - Non-Gregorian day of the source date (1–31).
	 * @param options.targetDayOfCalendar - Target non-Gregorian day (1–31).
	 * @param options.lang - Locale for calendar resolution.
	 * @returns The moved date with its updated non-Gregorian year/month/day.
	 */
	static moveDayToWhenNotGregorian(options: {
		sourceDate: Date; sourceDayOfCalendar: number; targetDayOfCalendar: number; lang: HxLanguageCode;
	}): HxDateWithYmdCalendar {
		const {sourceDate, sourceDayOfCalendar, targetDayOfCalendar, lang} = options;

		let date = new Date(sourceDate);
		// source day is before target day
		if (sourceDayOfCalendar < targetDayOfCalendar) {
			const [, , sourceMonth] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
			date.setDate(date.getDate() + (targetDayOfCalendar - sourceDayOfCalendar));
			const [, , month] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
			if (month !== sourceMonth) {
				// this month has no target day, replace with last day of this month
				// the possible last day of month is one of 5/6/28/29/30/31.
				// but since source day less than target day (max value is 31), so 31 is no need to count in.
				// and day which greater than target day is no need to try, will change the month to next, so filter it
				// and if day which less than or equals source day is fine, no need to test
				for (const dayOfCalendar of [30, 29, 28, 6, 5].filter(d => d < targetDayOfCalendar)) {
					date = new Date(sourceDate);
					if (dayOfCalendar <= sourceDayOfCalendar) {
						date.setDate(date.getDate() + (dayOfCalendar - sourceDayOfCalendar));
						break;
					} else {
						date.setDate(date.getDate() + (dayOfCalendar - sourceDayOfCalendar));
						const [, , month] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
						if (month === sourceMonth) {
							break;
						}
					}
				}
			}
		}
		// target day is after origin day
		else if (sourceDayOfCalendar > targetDayOfCalendar) {
			// set to target day
			date.setDate(date.getDate() + (targetDayOfCalendar - sourceDayOfCalendar));
		}

		const [, year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
		return {date: date, yearOfCalendar: year, monthOfCalendar: month, dayOfCalendar: day};
	};

	/**
	 * Changes the non-Gregorian year while preserving the month and day as much as possible.
	 * - If the current month is 13 and the target year has no 13th month, falls back to month 12.
	 * - If the current day exceeds the target month length, falls back to the last valid day.
	 *
	 * @param target - Target non-Gregorian year.
	 * @param sourceDate - The current date.
	 * @param lang - Locale for calendar resolution.
	 * @returns A new `Date` set to the corresponding point in the target non-Gregorian year.
	 */
	static changeYearToWhenNotGregorian(target: HxDateTimeAnteroposteriorYear, sourceDate: Date, lang: HxLanguageCode): Date {
		// year changed, try to keep month and day
		// - for month, if current is 13, and not #13 month in given year, then change to 12
		// - for day, if not this day in the changed year + month, then change to last day of changed year + month
		const [, year, month, day] = DateLocaleUtils.formatDateInNumeric(sourceDate, lang, false);
		let moved = HxDateTimeMoveUtils.moveYearToWhenNotGregorian({
			sourceDate, sourceYearOfCalendar: year, targetYearOfCalendar: target.yearOfCalendar, lang
		});
		moved = HxDateTimeMoveUtils.moveMonthToWhenNotGregorian({
			sourceDate: moved.date, sourceMonthOfCalendar: moved.monthOfCalendar, targetMonthOfCalendar: month, lang
		});
		moved = HxDateTimeMoveUtils.moveDayToWhenNotGregorian({
			sourceDate: moved.date, sourceDayOfCalendar: moved.dayOfCalendar, targetDayOfCalendar: day, lang
		});
		return moved.date;
	};

	/**
	 * Changes the non-Gregorian year and month while preserving the day as much as possible.
	 * - If the target month 13 does not exist in the target year, falls back to month 12.
	 * - If the current day exceeds the target month length, falls back to the last valid day.
	 *
	 * @param target - Target non-Gregorian year and month (1–13).
	 * @param sourceDate - The current date.
	 * @param lang - Locale for calendar resolution.
	 * @returns A new `Date` set to the corresponding point in the target non-Gregorian year/month.
	 */
	static changeMonthToWhenNotGregorian(target: HxDateTimeAnteroposteriorYearMonth, sourceDate: Date, lang: HxLanguageCode): Date {
		// year changed, try to keep month and day
		// - for month, if current is 13, and not #13 month in given year, then change to 12
		// - for day, if not this day in the changed year + month, then change to last day of changed year + month
		const [, year, , day] = DateLocaleUtils.formatDateInNumeric(sourceDate, lang, false);
		let moved = HxDateTimeMoveUtils.moveYearToWhenNotGregorian({
			sourceDate, sourceYearOfCalendar: year, targetYearOfCalendar: target.yearOfCalendar, lang
		});
		moved = HxDateTimeMoveUtils.moveMonthToWhenNotGregorian({
			sourceDate: moved.date,
			sourceMonthOfCalendar: moved.monthOfCalendar,
			targetMonthOfCalendar: target.monthOfCalendar,
			lang
		});
		moved = HxDateTimeMoveUtils.moveDayToWhenNotGregorian({
			sourceDate: moved.date, sourceDayOfCalendar: moved.dayOfCalendar, targetDayOfCalendar: day, lang
		});
		return moved.date;
	};

}

export class HxDateTimeAnteroposteriorUtils {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Computes the anteroposterior navigation coordinates for the Gregorian calendar.
	 * The earliest year is clamped to 1 (AD 1) for previous-year navigation.
	 */
	static gregorian = (date: Date): HxDateTimeAnteroposterior => {
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		// year - 1, min is 1.
		const yearOfGregoryOfPreviousYear = year === 1 ? 1 : (year - 1);
		// month is not 1 -> same year
		// month is 1 -> year - 1, min is 1
		const yearOfGregoryOfPreviousMonth = month !== 1 ? year : (year === 1 ? 1 : (year - 1));
		// month is not 1 -> month - 1
		// month is 1, year is 1 -> 1
		// month is 1, year is not 1 -> 12
		const monthOfGregoryOfPreviousMonth = month !== 1 ? (month - 1) : (year === 1 ? 1 : 12);
		// month is not 12 -> same year
		// month is 12 -> year + 1
		const yearOfGregoryOfNextMonth = month !== 12 ? year : (year + 1);
		// month is not 12 -> month + 1
		// month is 12 -> 1
		const monthOfGregoryOfNextMonth = month !== 12 ? (month + 1) : 1;
		const yearOfGregoryOfNextYear = year + 1;
		return {
			previousYear: {
				yearOfGregory: yearOfGregoryOfPreviousYear, monthOfGregory: 1,
				eraOfCalendar: '', yearOfCalendar: yearOfGregoryOfPreviousYear, monthOfCalendar: 1
			},
			previousMonth: {
				yearOfGregory: yearOfGregoryOfPreviousMonth, monthOfGregory: monthOfGregoryOfPreviousMonth,
				eraOfCalendar: '',
				yearOfCalendar: yearOfGregoryOfPreviousMonth, monthOfCalendar: monthOfGregoryOfPreviousMonth
			},
			current: {
				yearOfGregory: year, monthOfGregory: month,
				eraOfCalendar: '', yearOfCalendar: year, monthOfCalendar: month
			},
			nextMonth: {
				yearOfGregory: yearOfGregoryOfNextMonth, monthOfGregory: monthOfGregoryOfNextMonth,
				eraOfCalendar: '',
				yearOfCalendar: yearOfGregoryOfNextMonth, monthOfCalendar: monthOfGregoryOfNextMonth
			},
			nextYear: {
				yearOfGregory: yearOfGregoryOfNextYear, monthOfGregory: 1,
				eraOfCalendar: '', yearOfCalendar: yearOfGregoryOfNextYear, monthOfCalendar: 1
			}
		};
	};

	/**
	 * - some of japanese calendar's month and day follow gregory calendar, some not.
	 * - there might be one era, two era, three era in one gregory month.
	 * - new era starts in middle of gregory month.
	 * - month and day are continuous even the era is changed.
	 *
	 * - before year 645: fallback to gregory.
	 * - 645/01/01 - 645/01/03: fallback to gregory. next month and next year follows japanese calendar.
	 * - 645/01/04 - 645/02/03: japanese calendar. previous month and previous year follows gregory.
	 * - 645/02/04 - 646/01/04: japanese calendar. previous month follows japanese calendar, previous year follows gregory.
	 * - after 645/02/03: japanese calendar.
	 *
	 * - year 645 has 13 months, the first is 645/01/01 - 645/01/03, follows 12 months of 大化元年
	 */
	static ja = (
		date: Date, lang: HxLanguageCode, current: HxDateTimeAnteroposteriorYearMonth, dayOfCalendarOfCurrent: number
	): HxDateTimeAnteroposterior => {
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		// fallback to gregory
		if (year < 645) {
			// back to gregory
			return HxDateTimeAnteroposteriorUtils.gregorian(date);
		}
		// last month of fallback to gregory
		else if (year === 645 && month === 1 && day <= 3) {
			// special month, only has 3 days,
			// 645/01/04 is 大化1/01/01.
			return {
				previousYear: {
					yearOfGregory: 644, monthOfGregory: 1,
					eraOfCalendar: '西暦',
					yearOfCalendar: 644, monthOfCalendar: 1
				},
				previousMonth: {
					yearOfGregory: 644, monthOfGregory: 12,
					eraOfCalendar: '西暦',
					yearOfCalendar: 644, monthOfCalendar: 12
				},
				current: {
					yearOfGregory: 645, monthOfGregory: 1,
					eraOfCalendar: '西暦',
					yearOfCalendar: 645, monthOfCalendar: 1
				},
				nextMonth: {
					yearOfGregory: 645, monthOfGregory: 1,
					eraOfCalendar: '大化',
					yearOfCalendar: 1, monthOfCalendar: 1
				},
				// make it be 13 months for year 645, special case
				nextYear: {
					yearOfGregory: 646, monthOfGregory: 1,
					eraOfCalendar: '大化',
					yearOfCalendar: 2, monthOfCalendar: 1
				}
			};
		}
		// first month of 大化元年
		else if (year === 645 && ((month === 1 && day > 3) || (month === 2 && day < 4))) {
			// special month, the previous month is back to gregory.
			// 645/01/04 is 大化1/01/01.
			// 645/02/03 is 大化1/01/31.
			return {
				// make it be 13 months for year 645, special case
				previousYear: {
					yearOfGregory: 644, monthOfGregory: 1,
					eraOfCalendar: '西暦',
					yearOfCalendar: 644, monthOfCalendar: 1
				},
				previousMonth: {
					yearOfGregory: 645, monthOfGregory: 1,
					eraOfCalendar: '西暦',
					yearOfCalendar: 645, monthOfCalendar: 1
				},
				current,
				nextMonth: {
					yearOfGregory: 645, monthOfGregory: 2,
					eraOfCalendar: '大化',
					yearOfCalendar: 1, monthOfCalendar: 2
				},
				// make it be 13 months for year 645, special case
				nextYear: {
					yearOfGregory: 646, monthOfGregory: 1,
					eraOfCalendar: '大化',
					yearOfCalendar: 2, monthOfCalendar: 1
				}
			};
		}
		// #2 - #12 months of 大化元年
		else if (year === 645 || (year === 646 && month === 1 && day <= 3)) {
			const previousMonth = HxDateTimeAnteroposteriorUtils.previousMonthNotGregorianNoEra(date, lang, dayOfCalendarOfCurrent);
			const nextMonth = HxDateTimeAnteroposteriorUtils.nextMonthNotGregorianNoEra(date, lang, dayOfCalendarOfCurrent);
			const [eraOfNextYear, yearOfCalendarOfNextYear] = DateLocaleUtils.formatDateInNumeric(new Date(646, 0, 4), lang, false);
			return {
				// make it be 13 months for year 645, special case
				previousYear: {
					yearOfGregory: 644, monthOfGregory: 1,
					eraOfCalendar: '西暦',
					yearOfCalendar: 644, monthOfCalendar: 1
				},
				previousMonth: previousMonth.ym,
				current,
				nextMonth: nextMonth.ym,
				// make it be 13 months for year 645, special case
				nextYear: {
					yearOfGregory: 646, monthOfGregory: 1,
					eraOfCalendar: eraOfNextYear,
					yearOfCalendar: yearOfCalendarOfNextYear, monthOfCalendar: 1
				}
			};
		}
		// japanese calendar
		else {
			// TODO
		}
	};

	/**
	 * Computes the anteroposterior navigation coordinates for the Minguo (ROC) calendar.
	 * Derives era (民國/民國前) and year from the Gregorian coordinates. Years ≥ 1912 use
	 * the positive Minguo era; earlier years use 民國前 (1-based: 1911 → 民國前1).
	 */
	static twMinguo = (date: Date): HxDateTimeAnteroposterior => {
		const anteroposterior = HxDateTimeAnteroposteriorUtils.gregorian(date);
		Object.keys(anteroposterior).forEach(key => {
			const data = anteroposterior[key as keyof HxDateTimeAnteroposterior];
			data.yearOfCalendar = data.yearOfCalendar >= 1912 ? (data.yearOfCalendar - 1911) : (1912 - data.yearOfCalendar);
			data.eraOfCalendar = data.yearOfGregory >= 1912 ? '民國' : '民國前';
		});
		return anteroposterior;
	};

	/** Dispatches era-based anteroposterior computation to the Japanese or Minguo calendar handler. */
	static notGregorianWithEra = (
		date: Date, lang: HxLanguageCode, current: HxDateTimeAnteroposteriorYearMonth, dayOfCalendarOfCurrent: number
	): HxDateTimeAnteroposterior => {
		if (lang === 'ja' || lang.startsWith('ja-')) {
			return HxDateTimeAnteroposteriorUtils.ja(date, lang, current, dayOfCalendarOfCurrent);
		} else {
			return HxDateTimeAnteroposteriorUtils.twMinguo(date);
		}
	};

	/**
	 * Finds the previous month in a non-Gregorian, non-era calendar.
	 * Subtracts the current day-of-month to land on the last day of the previous month,
	 * then resolves its calendar year and month via {@link DateLocaleUtils.formatDateInNumeric}.
	 */
	static previousMonthNotGregorianNoEra = (
		date: Date, lang: HxLanguageCode, dayOfCalendarOfCurrent: number
	): { date: Date, ym: HxDateTimeAnteroposteriorYearMonth } => {
		// previous month
		const lastDayOfPreviousMonth = new Date(date);
		lastDayOfPreviousMonth.setDate(lastDayOfPreviousMonth.getDate() - dayOfCalendarOfCurrent);
		// make sure date is AD
		HxDateTimeUtils.backToAdWhenBc(lastDayOfPreviousMonth);
		const [
			, yearOfCalendarOfPreviousMonth, monthOfCalendarOfPreviousMonth
		] = DateLocaleUtils.formatDateInNumeric(lastDayOfPreviousMonth, lang, false);
		return {
			date: lastDayOfPreviousMonth,
			ym: {
				yearOfGregory: lastDayOfPreviousMonth.getFullYear(),
				monthOfGregory: lastDayOfPreviousMonth.getMonth() + 1,
				eraOfCalendar: '',
				yearOfCalendar: yearOfCalendarOfPreviousMonth, monthOfCalendar: monthOfCalendarOfPreviousMonth
			}
		};
	};

	/**
	 * Finds the previous calendar year in a non-Gregorian, non-era calendar.
	 * Three cases: (a) previous month crossed a year boundary → use its year;
	 * (b) previous month is AD 0001-01-01 → fall back to current year;
	 * (c) normal → move backward to month 1, then subtract one day to reach the previous year's last day.
	 */
	static previousYearNotGregorianNoEra = (
		somedayOfPreviousMonth: Date, previousMonth: HxDateTimeAnteroposteriorYearMonth,
		lang: HxLanguageCode,
		current: HxDateTimeAnteroposteriorYearMonth
	): { date: Date, ym: HxDateTimeAnteroposteriorYear } => {
		const someday = new Date(somedayOfPreviousMonth);
		if (previousMonth.yearOfCalendar !== current.yearOfCalendar) {
			// year changed
			return {
				date: someday,
				ym: {
					yearOfGregory: previousMonth.yearOfGregory, monthOfGregory: 1,
					eraOfCalendar: '',
					yearOfCalendar: previousMonth.yearOfCalendar, monthOfCalendar: 1
				}
			};
		} else if (HxDateTimeUtils.firstDayOfAd(someday)) {
			// year not changed, but previous year is BC
			// set this year as previous year
			return {
				date: someday,
				ym: {
					yearOfGregory: previousMonth.yearOfGregory, monthOfGregory: 1,
					eraOfCalendar: '',
					yearOfCalendar: previousMonth.yearOfCalendar, monthOfCalendar: 1
				}
			};
		} else {
			// year not changed, move backward
			const {
				date, dayOfCalendar
			} = HxDateTimeMoveUtils.moveMonthBackwardToInSameYearWhenNotGregorian({
				sourceDate: someday, sourceMonthOfCalendar: previousMonth.monthOfCalendar,
				targetMonthOfCalendar: 1,
				lang
			});
			date.setDate(date.getDate() - dayOfCalendar);
			HxDateTimeUtils.backToAdWhenBc(date);
			const [, yearOfCalendarOfPreviousYear] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
			return {
				date: date, ym: {
					yearOfGregory: date.getFullYear(), monthOfGregory: 1,
					eraOfCalendar: '',
					yearOfCalendar: yearOfCalendarOfPreviousYear, monthOfCalendar: 1
				}
			};
		}
	};

	/**
	 * Finds the next month in a non-Gregorian, non-era calendar.
	 * Adds (32 - currentDay) days to land in the next Gregorian month, then resolves
	 * the calendar year, month, and day via {@link DateLocaleUtils.formatDateInNumeric}.
	 */
	static nextMonthNotGregorianNoEra = (
		date: Date, lang: HxLanguageCode, dayOfCalendarOfCurrent: number
	): { date: Date, ym: HxDateTimeAnteroposteriorYearMonth, dayOfCalendarOfNextMonth: number } => {
		// next month
		const somedayOfNextMonth = new Date(date);
		// Days of #13 month could be one of 29/6/5, and days of #1 - #12 month could be one of 31/30/29/28.
		// Set day to 32 (max of 31/30/29/28/6/5) via offset, which adds
		// - 1-4 days (32 - 31/30/29/28), day 1-4 of next month.
		// - 26-27 days (32 - 6/5), day 26-27 of next month.
		// Guarantees landing in the next month without overshooting to the next of next month.
		somedayOfNextMonth.setDate(somedayOfNextMonth.getDate() + (32 - dayOfCalendarOfCurrent));
		const [
			, yearOfCalendarOfNextMonth, monthOfCalendarOfNextMonth, dayOfCalendarOfNextMonth
		] = DateLocaleUtils.formatDateInNumeric(somedayOfNextMonth, lang, false);
		return {
			date: somedayOfNextMonth,
			ym: {
				yearOfGregory: somedayOfNextMonth.getFullYear(),
				monthOfGregory: somedayOfNextMonth.getMonth() + 1,
				eraOfCalendar: '',
				yearOfCalendar: yearOfCalendarOfNextMonth, monthOfCalendar: monthOfCalendarOfNextMonth
			},
			dayOfCalendarOfNextMonth
		};
	};

	/**
	 * Navigates from month 13 (Hebrew leap-year Elul or Ethiopic/Coptic Pagume) to month 1
	 * of the next calendar year. Adds (30 - day) days; since month 13 has at most 29 days,
	 * this always lands in the next year's month 1.
	 */
	static nextYearOfM13NotGregorianNoEra = (
		date: Date, dayOfCalendar: number, lang: HxLanguageCode
	): { date: Date, ym: HxDateTimeAnteroposteriorYear } => {
		// Days of #13 month could be one of 29/6/5, and days of #1 month is 30.
		// Set day to 30 (max of 29/6/5) via offset, which adds
		// - Hebrew leap year: 1 day (30 - 29), day 1 of next month.
		// - Ethiopic/Coptic: 24-25 days (30 - 5/6), day 24-25 of next month.
		// Guarantees landing in the next month without overshooting to the next of next month.
		const somedayOfNextYear = new Date(date);
		somedayOfNextYear.setDate(somedayOfNextYear.getDate() + (30 - dayOfCalendar));
		const [
			, yearOfCalendarOfNextYear
		] = DateLocaleUtils.formatDateInNumeric(somedayOfNextYear, lang, false);
		return {
			date: somedayOfNextYear,
			ym: {
				yearOfGregory: somedayOfNextYear.getFullYear(), monthOfGregory: 1,
				eraOfCalendar: '',
				yearOfCalendar: yearOfCalendarOfNextYear, monthOfCalendar: 1
			}
		};
	};

	/**
	 * Navigates from month 12 to month 1 of the next calendar year (or month 13 if a leap month exists).
	 * Adds (32 - day) days; since month 12 has at most 31 days, this always lands in the next month.
	 * If the result is month 13, delegates to {@link nextYearOfM13NotGregorianNoEra}.
	 */
	static nextYearOfM12NotGregorianNoEra = (
		date: Date, dayOfCalendar: number, lang: HxLanguageCode
	): { date: Date, ym: HxDateTimeAnteroposteriorYear } => {
		// Days of #13 month could be one of 29/6/5, and days of #12 month could be one of 31/30/29.
		// Set day to 32 via offset, which adds
		// - 1-3 days (32 - 31/30/29), day 1-3 of next month (could be #13, or #1 of next year).
		const somedayOfNextYear = new Date(date);
		somedayOfNextYear.setDate(somedayOfNextYear.getDate() + (32 - dayOfCalendar));
		const [
			, yearOfCalendarOfNextYear, monthOfCalendarOfNextYear, dayOfCalendarOfNextYear
		] = DateLocaleUtils.formatDateInNumeric(somedayOfNextYear, lang, false);
		if (monthOfCalendarOfNextYear === 1) {
			// year changed
			return {
				date: somedayOfNextYear,
				ym: {
					yearOfGregory: somedayOfNextYear.getFullYear(), monthOfGregory: 1,
					eraOfCalendar: '',
					yearOfCalendar: yearOfCalendarOfNextYear, monthOfCalendar: 1
				}
			};
		} else {
			// year not changed, it's #13 month
			return HxDateTimeAnteroposteriorUtils.nextYearOfM13NotGregorianNoEra(somedayOfNextYear, dayOfCalendarOfNextYear, lang);
		}
	};

	/**
	 * Computes the full anteroposterior navigation (previous year/month, next year/month)
	 * for a non-Gregorian calendar that has no era (e.g. Buddhist, Islamic, Hebrew, etc.).
	 * Uses the current calendar year/month/day derived from {@link DateLocaleUtils.formatDateInNumeric}.
	 */
	static notGregorianNoEra = (
		date: Date, lang: HxLanguageCode, current: HxDateTimeAnteroposteriorYearMonth, dayOfCalendarOfCurrent: number
	): HxDateTimeAnteroposterior => {
		const currentYearOfGregory = date.getFullYear();
		const currentMonthOfGregory = date.getMonth() + 1;
		const currentDayOfGregory = date.getDate();
		const isFirstDayOfAd = currentYearOfGregory === 1 && currentMonthOfGregory === 1 && currentDayOfGregory === 1;

		// previous month, previous year
		let previousYear: HxDateTimeAnteroposteriorYear;
		let previousMonth: HxDateTimeAnteroposteriorYearMonth;
		// current day is first day of AD
		if (isFirstDayOfAd) {
			// set current to previous year and month
			previousYear = {...current, monthOfGregory: 1, monthOfCalendar: 1};
			previousMonth = {...current};
		}
		// current day is not first day of AD
		else {
			const computedPreviousMonth = HxDateTimeAnteroposteriorUtils.previousMonthNotGregorianNoEra(date, lang, dayOfCalendarOfCurrent);
			previousMonth = computedPreviousMonth.ym;
			const computedPreviousYear = HxDateTimeAnteroposteriorUtils.previousYearNotGregorianNoEra(computedPreviousMonth.date, previousMonth, lang, current);
			previousYear = computedPreviousYear.ym;
		}

		// next month
		const computedNextMonth = HxDateTimeAnteroposteriorUtils.nextMonthNotGregorianNoEra(date, lang, dayOfCalendarOfCurrent);
		const nextMonth = computedNextMonth.ym;
		const somedayOfNextMonth = computedNextMonth.date;
		const dayOfCalendarOfNextMonth = computedNextMonth.dayOfCalendarOfNextMonth;
		// next year
		let nextYear: HxDateTimeAnteroposteriorYear;
		if (nextMonth.yearOfCalendar !== current.yearOfCalendar) {
			// year already changed
			nextYear = {...nextMonth, monthOfGregory: 1, monthOfCalendar: 1};
		} else if (nextMonth.monthOfCalendar === 13) {
			nextYear = HxDateTimeAnteroposteriorUtils.nextYearOfM13NotGregorianNoEra(somedayOfNextMonth, dayOfCalendarOfNextMonth, lang).ym;
		} else if (nextMonth.monthOfCalendar === 12) {
			nextYear = HxDateTimeAnteroposteriorUtils.nextYearOfM12NotGregorianNoEra(somedayOfNextMonth, dayOfCalendarOfNextMonth, lang).ym;
		} else {
			// #1 - #11 month
			const {
				date: somedayOfMonth12, dayOfCalendar: dayOfCalendarOfSomedayOfMonth12
			} = HxDateTimeMoveUtils.moveMonthForwardToInSameYearWhenNotGregorian({
				sourceDate: somedayOfNextMonth, sourceMonthOfCalendar: nextMonth.monthOfCalendar,
				targetMonthOfCalendar: 12,
				lang
			});
			nextYear = HxDateTimeAnteroposteriorUtils.nextYearOfM12NotGregorianNoEra(somedayOfMonth12, dayOfCalendarOfSomedayOfMonth12, lang).ym;
		}

		return {previousYear, previousMonth, current, nextMonth, nextYear};
	};

	/**
	 * Computes the anteroposterior navigation for any non-Gregorian calendar.
	 * Dispatches to the era-aware handler (Japanese/Minguo) or the no-era handler.
	 */
	static notGregorian = (date: Date, lang: HxLanguageCode): HxDateTimeAnteroposterior => {
		// Like the Gregorian calendar, ensure the earliest date does not go before 0001/01/01.
		// But note that 0001/01/02 being month B of year A does not mean 0001/01/01 is also month B of year A.
		// get era/year/month/day
		const [
			eraOfCurrent, yearOfCalendarOfCurrent, monthOfCalendarOfCurrent, dayOfCalendarOfCurrent
		] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
		const current: HxDateTimeAnteroposteriorYearMonth = {
			yearOfGregory: date.getFullYear(), monthOfGregory: date.getMonth() + 1,
			eraOfCalendar: eraOfCurrent,
			yearOfCalendar: yearOfCalendarOfCurrent, monthOfCalendar: monthOfCalendarOfCurrent
		};
		if (eraOfCurrent.length !== 0) {
			// only two calendars with era: japanese (ja, ja-JP), roc (zh-TW, zh-Hant-TW)
			return HxDateTimeAnteroposteriorUtils.notGregorianWithEra(date, lang, current, dayOfCalendarOfCurrent);
		} else {
			return HxDateTimeAnteroposteriorUtils.notGregorianNoEra(date, lang, current, dayOfCalendarOfCurrent);
		}
	};

	/** Entry point: dispatches anteroposterior computation to the Gregorian or non-Gregorian handler. */
	static acquire = (date: Date, lang: HxLanguageCode, gregorian: boolean): HxDateTimeAnteroposterior => {
		if (gregorian) {
			return HxDateTimeAnteroposteriorUtils.gregorian(date);
		} else {
			return HxDateTimeAnteroposteriorUtils.notGregorian(date, lang);
		}
	};
}