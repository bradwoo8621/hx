import {type HxLanguageCode} from '../../contexts';
import type {HxDateTimeValue, HxDateWeekendDay} from '../../types';
import {DateLocaleUtils, DateUtils, type HxFormattedWeekdays} from '../../utils';
import type {ComputedDays, ComputedWeek, HxDateTimePickerPopupProps} from './datetime-picker-popup-types';
import {redressFirstDayOfWeek, redressWeekendDays} from './defaults';

/**
 * Clamps the day field to the last valid day of the Gregorian month when it exceeds the max.
 * Mutates the given value in place.
 */
export const fixDayWhenOverLastDayOfMonth = (value: Required<HxDateTimeValue>) => {
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
};

/**
 * Converts an {@link HxDateTimeValue} to a JavaScript `Date` object.
 * Month is 1-based in the input and converted to 0-based for `Date`.
 */
export const asJsDate = (value: Required<HxDateTimeValue>): Date => {
	return new Date(value.year, value.month - 1, value.day, value.hour, value.minute, value.second);
};

const WeekdaysOfSun: Array<HxDateWeekendDay> = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const WeekdaysOfMon: Array<HxDateWeekendDay> = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const WeekdaysOfTue: Array<HxDateWeekendDay> = ['tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'mon'] as const;
const WeekdaysOfWed: Array<HxDateWeekendDay> = ['wed', 'thu', 'fri', 'sat', 'sun', 'mon', 'tue'] as const;
const WeekdaysOfThu: Array<HxDateWeekendDay> = ['thu', 'fri', 'sat', 'sun', 'mon', 'tue', 'wed'] as const;
const WeekdaysOfFri: Array<HxDateWeekendDay> = ['fri', 'sat', 'sun', 'mon', 'tue', 'wed', 'thu'] as const;
const WeekdaysOfSat: Array<HxDateWeekendDay> = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'] as const;
const AllWeekdays = {
	sun: WeekdaysOfSun,
	mon: WeekdaysOfMon,
	tue: WeekdaysOfTue,
	wed: WeekdaysOfWed,
	thu: WeekdaysOfThu,
	fri: WeekdaysOfFri,
	sat: WeekdaysOfSat
} as const;
const AllWeekdaysToDateStd: Record<HxDateWeekendDay, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
	sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
};

/**
 * Resolves the ordered weekday list and weekend set for a locale.
 * Handles custom `firstDayOfWeek` and `weekendDays` overrides from props.
 */
export const computeWeekdays = <T extends object>(
	weekdays: HxFormattedWeekdays, // sun - sat
	lang: HxLanguageCode,
	firstDayOfWeek?: HxDateTimePickerPopupProps<T>['firstDayOfWeek'],
	weekendDays?: HxDateTimePickerPopupProps<T>['weekendDays']
): ComputedWeek => {
	const computed: ComputedWeek = {week: [], weekends: []};

	const mapped = weekdays.reduce((acc, weekday, index) => {
		const key = WeekdaysOfSun[index] as HxDateWeekendDay;
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
		computed.weekends.push(WeekdaysOfSun.indexOf(key) as ComputedWeek['weekends'][number]);
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

	AllWeekdays[redressedFirstDayOfWeek].forEach(key => {
		const {label, weekend} = mapped[key];
		computed.week.push({key: key, label, weekend});
	});
	return computed;
};

const computeLeadingPaddingDays = (date: Date, firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
	return (date.getDay() - firstDayOfWeek + 7) % 7;
};
const computeTrailingPaddingDays = (date: Date, firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
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
export const computeDays = (date: Date, lang: HxLanguageCode, forceGregorian: boolean, week: ComputedWeek): ComputedDays => {
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
		const firstDayOfWeek = AllWeekdaysToDateStd[week.week[0].key];
		let leadingPaddingDays: number;
		let trailingPaddingDays: number;
		const firstDayOfMonth = daysOfThisMonth[0];
		const lastDayOfMonth = daysOfThisMonth[daysOfThisMonth.length - 1];
		if (daysOfThisMonth.length === 28 && firstDayOfMonth.getDay() === firstDayOfWeek) {
			leadingPaddingDays = 7;
			trailingPaddingDays = 7;
		} else {
			leadingPaddingDays = computeLeadingPaddingDays(firstDayOfMonth, firstDayOfWeek);
			trailingPaddingDays = computeTrailingPaddingDays(lastDayOfMonth, firstDayOfWeek);
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
		const firstDayOfWeek = AllWeekdaysToDateStd[week.week[0].key];
		let leadingPaddingDays: number;
		let trailingPaddingDays: number;
		const firstDayOfMonth = daysOfThisMonth[0];
		const lastDayOfMonth = daysOfThisMonth[daysOfThisMonth.length - 1];
		if (daysOfThisMonth.length === 28 && firstDayOfMonth.value.getDay() === firstDayOfWeek) {
			leadingPaddingDays = 7;
			trailingPaddingDays = 7;
		} else {
			leadingPaddingDays = computeLeadingPaddingDays(firstDayOfMonth.value, firstDayOfWeek);
			trailingPaddingDays = computeTrailingPaddingDays(lastDayOfMonth.value, firstDayOfWeek);
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

export interface MovedDate {
	date: Date;
	yearOfCalendar: number;
	monthOfCalendar: number;
	dayOfCalendar: number;
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
export const moveMonthForwardToInSameYearWhenNotGregorian = (options: {
	sourceDate: Date; sourceMonthOfCalendar: number; targetMonthOfCalendar: number; lang: HxLanguageCode;
}): MovedDate => {
	const {sourceDate, sourceMonthOfCalendar, targetMonthOfCalendar, lang} = options;

	const date = new Date(sourceDate);
	date.setDate(date.getDate() + (targetMonthOfCalendar - sourceMonthOfCalendar) * 29);
	let [year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
	while (month !== targetMonthOfCalendar) {
		date.setDate(date.getDate() + 29);
		[year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
	}
	return {date, yearOfCalendar: year, monthOfCalendar: month, dayOfCalendar: day};
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
export const moveMonthBackwardToInSameYearWhenNotGregorian = (options: {
	sourceDate: Date; sourceMonthOfCalendar: number; targetMonthOfCalendar: number; lang: HxLanguageCode;
}): MovedDate => {
	const {sourceDate, sourceMonthOfCalendar, targetMonthOfCalendar, lang} = options;

	const date = new Date(sourceDate);
	date.setDate(date.getDate() + (targetMonthOfCalendar - sourceMonthOfCalendar) * 29);
	let [year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
	while (month !== targetMonthOfCalendar) {
		date.setDate(date.getDate() - 29);
		[year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
	}
	return {date, yearOfCalendar: year, monthOfCalendar: month, dayOfCalendar: day};
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
export const moveYearToWhenNotGregorian = (options: {
	sourceDate: Date; sourceYearOfCalendar: number; targetYearOfCalendar: number; lang: HxLanguageCode;
}): MovedDate => {
	const {sourceDate, sourceYearOfCalendar, targetYearOfCalendar, lang} = options;

	// there is at least 353 days for one year (353, 354, 355, 365, 366, 383, 384, 385).
	const date = new Date(sourceDate);
	let yearOfDate = sourceYearOfCalendar;

	while (yearOfDate !== targetYearOfCalendar) {
		const diff = targetYearOfCalendar - yearOfDate;
		// use 353 to make sure never over jumping year
		date.setDate(date.getDate() + diff * 353);
		[yearOfDate] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
	}

	const [year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
	return {date, yearOfCalendar: year, monthOfCalendar: month, dayOfCalendar: day};
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
export const moveMonthToWhenNotGregorian = (options: {
	sourceDate: Date; sourceMonthOfCalendar: number; targetMonthOfCalendar: number; lang: HxLanguageCode;
}): MovedDate => {
	const {sourceDate, sourceMonthOfCalendar, targetMonthOfCalendar, lang} = options;

	let date = new Date(sourceDate);
	// source month is before target month
	if (sourceMonthOfCalendar < targetMonthOfCalendar) {
		if (targetMonthOfCalendar === 13) {
			// test the #13 month existing in given year of calendar. if not, the target month should be set to 12
			if (sourceMonthOfCalendar !== 12) {
				// try to move to #12 month first
				date = moveMonthForwardToInSameYearWhenNotGregorian({
					sourceDate: date, sourceMonthOfCalendar, targetMonthOfCalendar: 12, lang
				}).date;
			}
			// possible days in #12 month is 29, 30, 31, so set date as 32 to make sure month move to next
			const [, , day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
			const dateOfM13 = new Date(date);
			dateOfM13.setDate(dateOfM13.getDate() + (32 - day));
			const [, month] = DateLocaleUtils.formatDateInNumeric(dateOfM13, lang, false);
			if (month === 13) {
				date = dateOfM13;
			}
		} else {
			date = moveMonthForwardToInSameYearWhenNotGregorian({
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
			const [, , day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
			date.setDate(date.getDate() - day);
			date = moveMonthBackwardToInSameYearWhenNotGregorian({
				sourceDate: date, sourceMonthOfCalendar: 12, targetMonthOfCalendar, lang
			}).date;
		} else {
			date = moveMonthBackwardToInSameYearWhenNotGregorian({
				sourceDate: date,
				sourceMonthOfCalendar,
				targetMonthOfCalendar,
				lang
			}).date;
		}
	}

	const [year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
	return {date, yearOfCalendar: year, monthOfCalendar: month, dayOfCalendar: day};
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
export const moveDayToWhenNotGregorian = (options: {
	sourceDate: Date; sourceDayOfCalendar: number; targetDayOfCalendar: number; lang: HxLanguageCode;
}): MovedDate => {
	const {sourceDate, sourceDayOfCalendar, targetDayOfCalendar, lang} = options;

	let date = new Date(sourceDate);
	// source day is before target day
	if (sourceDayOfCalendar < targetDayOfCalendar) {
		const [, sourceMonth] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
		date.setDate(date.getDate() + (targetDayOfCalendar - sourceDayOfCalendar));
		const [, month] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
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
					const [, month] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
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

	const [year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
	return {date, yearOfCalendar: year, monthOfCalendar: month, dayOfCalendar: day};
};

/**
 * Changes the non-Gregorian year while preserving the month and day as much as possible.
 * - If the current month is 13 and the target year has no 13th month, falls back to month 12.
 * - If the current day exceeds the target month length, falls back to the last valid day.
 *
 * @param yearOfCalendar - Target non-Gregorian year.
 * @param sourceDate - The current date.
 * @param lang - Locale for calendar resolution.
 * @returns A new `Date` set to the corresponding point in the target non-Gregorian year.
 */
export const changeYearToWhenNotGregorian = (yearOfCalendar: number, sourceDate: Date, lang: HxLanguageCode): Date => {
	// year changed, try to keep month and day
	// - for month, if current is 13, and not #13 month in given year, then change to 12
	// - for day, if not this day in the changed year + month, then change to last day of changed year + month
	const [year, month, day] = DateLocaleUtils.formatDateInNumeric(sourceDate, lang, false);
	let moved = moveYearToWhenNotGregorian({
		sourceDate, sourceYearOfCalendar: year, targetYearOfCalendar: yearOfCalendar, lang
	});
	moved = moveMonthToWhenNotGregorian({
		sourceDate: moved.date, sourceMonthOfCalendar: moved.monthOfCalendar, targetMonthOfCalendar: month, lang
	});
	moved = moveDayToWhenNotGregorian({
		sourceDate: moved.date, sourceDayOfCalendar: moved.dayOfCalendar, targetDayOfCalendar: day, lang
	});
	return moved.date;
};

/**
 * Changes the non-Gregorian year and month while preserving the day as much as possible.
 * - If the target month 13 does not exist in the target year, falls back to month 12.
 * - If the current day exceeds the target month length, falls back to the last valid day.
 *
 * @param yearOfCalendar - Target non-Gregorian year.
 * @param monthOfCalendar - Target non-Gregorian month (1–13).
 * @param sourceDate - The current date.
 * @param lang - Locale for calendar resolution.
 * @returns A new `Date` set to the corresponding point in the target non-Gregorian year/month.
 */
export const changeMonthToWhenNotGregorian = (yearOfCalendar: number, monthOfCalendar: number, sourceDate: Date, lang: HxLanguageCode): Date => {
	// year changed, try to keep month and day
	// - for month, if current is 13, and not #13 month in given year, then change to 12
	// - for day, if not this day in the changed year + month, then change to last day of changed year + month
	const [year, , day] = DateLocaleUtils.formatDateInNumeric(sourceDate, lang, false);
	let moved = moveYearToWhenNotGregorian({
		sourceDate, sourceYearOfCalendar: year, targetYearOfCalendar: yearOfCalendar, lang
	});
	moved = moveMonthToWhenNotGregorian({
		sourceDate: moved.date, sourceMonthOfCalendar: moved.monthOfCalendar, targetMonthOfCalendar: monthOfCalendar,
		lang
	});
	moved = moveDayToWhenNotGregorian({
		sourceDate: moved.date, sourceDayOfCalendar: moved.dayOfCalendar, targetDayOfCalendar: day, lang
	});
	return moved.date;
};
