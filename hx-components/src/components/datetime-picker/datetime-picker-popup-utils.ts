import {type HxLanguageCode} from '../../contexts';
import type {HxDateTimeValue, HxDateWeekendDay} from '../../types';
import {DateLocaleUtils, DateUtils, type HxFormattedWeekdays} from '../../utils';
import type {ComputedDays, ComputedWeek, HxDateTimePickerPopupProps} from './datetime-picker-popup-types';
import {redressFirstDayOfWeek, redressWeekendDays} from './defaults';

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
// compute 42 days for selection
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
