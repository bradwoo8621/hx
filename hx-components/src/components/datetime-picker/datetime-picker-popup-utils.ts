import {type HxLanguageCode} from '../../contexts';
import type {HxDateWeekendDay} from '../../types';
import {
	type ComputedDays,
	type ComputedMonths,
	type ComputedWeek,
	type ComputedYears,
	DateLocaleUtils,
	DateParseUtils,
	type HxFormattedWeekdays,
	UTCDate
} from '../../utils';
import {redressFirstDayOfWeek, redressWeekendDays} from './defaults';
import type {HxDateFirstDayOfWeek, HxDateWeekendDays} from './types';

export class HxDateTimeUtils {
	private static readonly WeekdaysOfSun: ReadonlyArray<HxDateWeekendDay> = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
	private static readonly WeekdaysOfMon: ReadonlyArray<HxDateWeekendDay> = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
	private static readonly WeekdaysOfTue: ReadonlyArray<HxDateWeekendDay> = ['tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'mon'];
	private static readonly WeekdaysOfWed: ReadonlyArray<HxDateWeekendDay> = ['wed', 'thu', 'fri', 'sat', 'sun', 'mon', 'tue'];
	private static readonly WeekdaysOfThu: ReadonlyArray<HxDateWeekendDay> = ['thu', 'fri', 'sat', 'sun', 'mon', 'tue', 'wed'];
	private static readonly WeekdaysOfFri: ReadonlyArray<HxDateWeekendDay> = ['fri', 'sat', 'sun', 'mon', 'tue', 'wed', 'thu'];
	private static readonly WeekdaysOfSat: ReadonlyArray<HxDateWeekendDay> = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
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

	private static computeLeadingPaddingDays(date: UTCDate, firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6) {
		return (date.getDay() - firstDayOfWeek + 7) % 7;
	};

	private static computeTrailingPaddingDays(date: UTCDate, firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6) {
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
	static computeDays(date: UTCDate, lang: HxLanguageCode, gregorian: boolean, week: ComputedWeek): ComputedDays {
		if (gregorian) {
			// quick computation
			const daysOfThisMonth: Array<UTCDate> = new Array(DateParseUtils.lastDayOfMonth(date.getFullYear(), date.getMonthIndex() + 1))
				.fill(1)
				.map((_, index) => UTCDate.cloneOf(date).setDayOfMonth(index + 1));
			const daysBeforeThisMonth: Array<UTCDate> = [];
			const daysAfterThisMonth: Array<UTCDate> = [];
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
				const date = UTCDate.cloneOf(firstDayOfMonth).setDayOfMonth(firstDayOfMonth.getDayOfMonth() - index);
				daysBeforeThisMonth.unshift(date);
			}
			for (let index = 1; index <= trailingPaddingDays; index++) {
				const date = UTCDate.cloneOf(lastDayOfMonth).setDayOfMonth(lastDayOfMonth.getDayOfMonth() + index);
				daysAfterThisMonth.push(date);
			}
			const days = [...daysBeforeThisMonth, ...daysOfThisMonth, ...daysAfterThisMonth];
			if (days.length === 35) {
				if (daysBeforeThisMonth.length === 0) {
					const firstDay = days[0];
					for (let index = 1; index <= 7; index++) {
						const date = UTCDate.cloneOf(firstDay).setDayOfMonth(firstDay.getDayOfMonth() - index);
						days.unshift(date);
					}
				} else {
					const lastDay = days[days.length - 1];
					for (let index = 1; index <= 7; index++) {
						const date = UTCDate.cloneOf(lastDay).setDayOfMonth(lastDay.getDayOfMonth() + index);
						days.push(date);
					}
				}
			}

			const thisMonth = date.getMonthIndex();
			return days.map(day => {
				return {
					key: `${day.getFullYear()}-${day.getMonthIndex() + 1}-${day.getDayOfMonth()}`,
					label: DateLocaleUtils.formatDay(day, lang, gregorian),
					weekend: week.weekends.includes(day.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6),
					value: day,
					thisMonth: day.getMonthIndex() === thisMonth
				};
			});
		} else {
			const daysOfThisMonth: Array<{ value: UTCDate, label: string, thisMonth: true }> = [];
			const daysBeforeThisMonth: Array<{ value: UTCDate, label: string, thisMonth: false }> = [];
			const daysAfterThisMonth: Array<{ value: UTCDate, label: string, thisMonth: false }> = [];
			// get label of this month and day
			const [thisMonthLabel, dayLabel] = DateLocaleUtils.formatMonthAndDay(date, lang, false);
			daysOfThisMonth.push({value: date, label: dayLabel, thisMonth: true});
			// get leading days in this month
			for (let index = -1; index >= -31; index--) {
				const d = UTCDate.cloneOf(date).setDayOfMonth(date.getDayOfMonth() + index);
				const [monthLabel, dLabel] = DateLocaleUtils.formatMonthAndDay(d, lang, false);
				if (monthLabel !== thisMonthLabel) {
					break;
				} else {
					daysOfThisMonth.unshift({value: d, label: dLabel, thisMonth: true});
				}
			}
			// get trailing days in this month
			for (let index = 1; index <= 31; index++) {
				const d = UTCDate.cloneOf(date).setDayOfMonth(date.getDayOfMonth() + index);
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
				const date = UTCDate.cloneOf(firstDayOfMonth.value).setDayOfMonth(firstDayOfMonth.value.getDayOfMonth() - index);
				const dayLabel = DateLocaleUtils.formatDay(date, lang, false);
				daysBeforeThisMonth.unshift({value: date, label: dayLabel, thisMonth: false});
			}
			// pad days to last week
			for (let index = 1; index <= trailingPaddingDays; index++) {
				const date = UTCDate.cloneOf(lastDayOfMonth.value).setDayOfMonth(lastDayOfMonth.value.getDayOfMonth() + index);
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
						const date = UTCDate.cloneOf(firstDay.value).setDayOfMonth(firstDay.value.getDayOfMonth() - index);
						const dayLabel = DateLocaleUtils.formatDay(date, lang, false);
						daysBeforeThisMonth.unshift({value: date, label: dayLabel, thisMonth: false});
					}
				} else {
					const lastDay = days[days.length - 1];
					for (let index = 1; index <= 7; index++) {
						const date = UTCDate.cloneOf(lastDay.value).setDayOfMonth(lastDay.value.getDayOfMonth() + index);
						const dayLabel = DateLocaleUtils.formatDay(date, lang, false);
						daysAfterThisMonth.push({value: date, label: dayLabel, thisMonth: false});
					}
				}
				days = [...daysBeforeThisMonth, ...daysOfThisMonth, ...daysAfterThisMonth];
			}

			return days.map(day => {
				const value = day.value;
				return {
					key: `${value.getFullYear()}-${value.getMonthIndex() + 1}-${value.getDayOfMonth()}`,
					label: day.label,
					weekend: week.weekends.includes(value.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6),
					value: day.value,
					thisMonth: day.thisMonth
				};
			});
		}
	};

	static computeMonths(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		if (gregorian) {
			const year = date.getFullYear();
			const monthIndex = date.getMonthIndex();
			return new Array(12)
				.fill(1)
				.map((_, index) => UTCDate.of(year, index, 1))
				.map(month => {
					return {
						key: `${year}-${month.getMonthIndex() + 1}-1`,
						label: DateLocaleUtils.formatMonth(month, lang, true),
						value: month,
						offset: monthIndex - month.getMonthIndex(),
						available: true
					};
				});
		} else {
			// TODO
			return [];
		}
	}

	static computeYears(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedYears {
		if (gregorian) {
			const currentYear = date.getFullYear();
			const startYear = Math.min(9964, Math.max(1, currentYear - 17));
			return new Array(35)
				.fill(1)
				.map((_, index) => UTCDate.of(startYear + index, 0, 1))
				.map(year => {
					return {
						key: `${year.getFullYear()}-1-1`,
						label: DateLocaleUtils.formatYear(year, lang, true),
						value: year,
						offset: year.getFullYear() - currentYear,
						available: true
					};
				});
		} else {
			// TODO
			return [];
		}
	}
}
