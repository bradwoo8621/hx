import {type HxLanguageCode} from '../../contexts';
import type {HxDateTimeValue, HxDateWeekendDay} from '../../types';
import {DateLocaleUtils, DateUtils, type HxFormattedWeekdays} from '../../utils';
import type {ComputedDays, ComputedWeek} from './datetime-picker-popup-types';
import {redressFirstDayOfWeek, redressWeekendDays} from './defaults';
import type {HxDateFirstDayOfWeek, HxDateWeekendDays} from './types';

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
	static computeWeekdays(
		weekdays: HxFormattedWeekdays, // sun - sat
		lang: HxLanguageCode,
		firstDayOfWeek?: HxDateFirstDayOfWeek,
		weekendDays?: HxDateWeekendDays
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
	 * When `gregorian` is true, uses Gregorian month boundaries for fast computation;
	 * otherwise walks day-by-day using locale-aware month labels.
	 *
	 * @param date - A representative date in the target month.
	 * @param lang - Locale for formatting and calendar resolution.
	 * @param gregorian - Whether to force Gregorian month computation.
	 * @param week - Resolved weekday ordering and weekend flags.
	 * @returns 42 days (6 weeks × 7 days) as padded entries for the picker grid.
	 */
	static computeDays(date: Date, lang: HxLanguageCode, gregorian: boolean, week: ComputedWeek): ComputedDays {
		if (gregorian) {
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
					label: DateLocaleUtils.formatDay(day, lang, gregorian),
					weekend: week.weekends.includes(day.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6),
					value: day,
					thisMonth: day.getMonth() === thisMonth
				};
			});
		} else {
			const daysOfThisMonth: Array<{ value: Date, label: string, thisMonth: true }> = [];
			const daysBeforeThisMonth: Array<{ value: Date, label: string, thisMonth: false }> = [];
			const daysAfterThisMonth: Array<{ value: Date, label: string, thisMonth: false }> = [];
			// get label of this month and day
			const [thisMonthLabel, dayLabel] = DateLocaleUtils.formatMonthAndDay(date, lang, false);
			daysOfThisMonth.push({value: date, label: dayLabel, thisMonth: true});
			// get leading days in this month
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
			// get trailing days in this month
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
			// compute days padding of first and last week
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
			// pad days to first week
			for (let index = 1; index <= leadingPaddingDays; index++) {
				const date = new Date(firstDayOfMonth.value);
				date.setDate(firstDayOfMonth.value.getDate() - index);
				const dayLabel = DateLocaleUtils.formatDay(date, lang, false);
				daysBeforeThisMonth.unshift({value: date, label: dayLabel, thisMonth: false});
			}
			// pad days to last week
			for (let index = 1; index <= trailingPaddingDays; index++) {
				const date = new Date(lastDayOfMonth.value);
				date.setDate(lastDayOfMonth.value.getDate() + index);
				const dayLabel = DateLocaleUtils.formatDay(date, lang, false);
				daysAfterThisMonth.push({value: date, label: dayLabel, thisMonth: false});
			}
			// combine computed days
			let days = [...daysBeforeThisMonth, ...daysOfThisMonth, ...daysAfterThisMonth];
			// padding weeks to 6
			while (days.length < 42) {
				if (daysBeforeThisMonth.length < daysAfterThisMonth.length) {
					const firstDay = days[0];
					for (let index = 1; index <= 7; index++) {
						const date = new Date(firstDay.value);
						date.setDate(firstDay.value.getDate() - index);
						const dayLabel = DateLocaleUtils.formatDay(date, lang, false);
						daysBeforeThisMonth.unshift({value: date, label: dayLabel, thisMonth: false});
					}
				} else {
					const lastDay = days[days.length - 1];
					for (let index = 1; index <= 7; index++) {
						const date = new Date(lastDay.value);
						date.setDate(lastDay.value.getDate() + index);
						const dayLabel = DateLocaleUtils.formatDay(date, lang, false);
						daysAfterThisMonth.push({value: date, label: dayLabel, thisMonth: false});
					}
				}
				days = [...daysBeforeThisMonth, ...daysOfThisMonth, ...daysAfterThisMonth];
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
