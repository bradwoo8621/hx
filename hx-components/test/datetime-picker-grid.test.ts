import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {
	DateHebrewUtils,
	DateJapaneseUtils,
	DateLocaleFormatUtils,
	HxDateTimeUtils,
	redressFirstDayOfWeek,
	redressWeekendDays,
	type ComputedWeek,
	type HxDateFirstDayOfWeek,
	type HxDateWeekendDay,
	type HxFormattedWeekdays,
	UTCDate
} from '../src';

const WEEKDAYS: HxFormattedWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_OF_GRID = 42;

const weekOf = (lang: string, firstDayOfWeek?: HxDateFirstDayOfWeek, weekendDays?: Array<HxDateWeekendDay>): ComputedWeek => {
	return HxDateTimeUtils.computeWeekdays(WEEKDAYS, lang, firstDayOfWeek, weekendDays);
};

const firstDayOfWeekIndex = (week: ComputedWeek): number => {
	return {sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6}[week.week[0].key];
};

describe('redressFirstDayOfWeek / redressWeekendDays', () => {
	it('passes through valid values', () => {
		expect(redressFirstDayOfWeek('sun')).toBe('sun');
		expect(redressFirstDayOfWeek('mon')).toBe('mon');
		expect(redressFirstDayOfWeek('default')).toBe('default');
		expect(redressFirstDayOfWeek((void 0))).toBe('default');
	});

	it('falls back on invalid values', () => {
		expect(redressFirstDayOfWeek('tue' as HxDateFirstDayOfWeek)).toBe('default');
	});

	it('passes through weekend day arrays', () => {
		expect(redressWeekendDays(['sat', 'sun'])).toEqual(['sat', 'sun']);
		expect(redressWeekendDays('default')).toBe('default');
		expect(redressWeekendDays((void 0))).toBe('default');
	});

	it('filters invalid entries and falls back when empty', () => {
		expect(redressWeekendDays(['xxx' as HxDateWeekendDay])).toBe('default');
		expect(redressWeekendDays([])).toBe('default');
	});
});

describe('HxDateTimeUtils.computeWeekdays', () => {
	it('follows the locale default (en-US: Sunday first, Sat+Sun weekend)', () => {
		const week = weekOf('en-US');
		expect(week.week[0].key).toBe('sun');
		expect(week.week[0].label).toBe('Sun');
		expect([...week.weekends].sort()).toEqual([0, 6]);
	});

	it('firstDayOfWeek=mon reorders the week', () => {
		const week = weekOf('en-US', 'mon');
		expect(week.week[0].key).toBe('mon');
		expect(week.week[0].label).toBe('Mon');
		expect(week.week[6].key).toBe('sun');
	});

	it('firstDayOfWeek=sun keeps Sunday first', () => {
		const week = weekOf('en-US', 'sun');
		expect(week.week[0].key).toBe('sun');
	});

	it('custom weekendDays are flagged in the week order', () => {
		const week = weekOf('en-US', 'mon', ['fri', 'sat']);
		expect(week.weekends).toEqual([5, 6]);
		expect(week.week[4].weekend).toBe(true); // Friday
		expect(week.week[5].weekend).toBe(true); // Saturday
		expect(week.week[0].weekend).toBe(false); // Monday
	});

	it('custom weekendDays also work with a Sunday first day', () => {
		const week = weekOf('en-US', 'sun', ['fri', 'sat']);
		expect(week.week[5].key).toBe('fri');
		expect(week.week[5].weekend).toBe(true);
		expect(week.week[6].key).toBe('sat');
		expect(week.week[6].weekend).toBe(true);
	});

	it('invalid firstDayOfWeek falls back to the locale default', () => {
		const week = weekOf('en-US', 'tue' as HxDateFirstDayOfWeek);
		expect(week.week[0].key).toBe('sun');
	});

	it('empty or invalid weekendDays fall back to the locale default', () => {
		expect([...weekOf('en-US', (void 0), []).weekends].sort()).toEqual([0, 6]);
		expect([...weekOf('en-US', (void 0), ['xxx' as HxDateWeekendDay]).weekends].sort()).toEqual([0, 6]);
	});
});

describe('HxDateTimeUtils.computeDays (Gregorian)', () => {
	const enWeek = weekOf('en-US');

	it('builds a 42-day grid for June 2025 starting on Sunday', () => {
		const days = HxDateTimeUtils.computeDays(UTCDate.of(2025, 5, 10), 'en-US', true, enWeek);
		expect(days.length).toBe(DAYS_OF_GRID);
		expect(new Set(days.map(day => day.key)).size).toBe(DAYS_OF_GRID);
		// leading padding from the previous month
		expect(days[0].key).toBe('2025-5-25');
		expect(days[0].thisMonth).toBe(false);
		expect(days[0].weekend).toBe(true); // Sunday
		// the current-month block starts at June 1
		expect(days[7].key).toBe('2025-6-1');
		expect(days[7].thisMonth).toBe(true);
		expect(days[36].key).toBe('2025-6-30');
		expect(days[37].key).toBe('2025-7-1');
		expect(days.filter(day => day.thisMonth).length).toBe(30);
		// Sundays are weekends
		expect(days[21].weekend).toBe(true); // 2025-06-15
		expect(days[28].weekend).toBe(true); // 2025-06-22
	});

	it('28-day February 2026 starting on the first day of week pads both sides', () => {
		const days = HxDateTimeUtils.computeDays(UTCDate.of(2026, 1, 1), 'en-US', true, enWeek);
		expect(days.length).toBe(DAYS_OF_GRID);
		expect(days[0].key).toBe('2026-1-25');
		expect(days[6].key).toBe('2026-1-31');
		expect(days[7].key).toBe('2026-2-1');
		expect(days[34].key).toBe('2026-2-28');
		expect(days[35].key).toBe('2026-3-1');
		expect(days.filter(day => day.thisMonth).length).toBe(28);
	});

	it('respects a Monday first day of week', () => {
		const monWeek = weekOf('en-US', 'mon');
		const days = HxDateTimeUtils.computeDays(UTCDate.of(2025, 4, 15), 'en-US', true, monWeek);
		expect(days.length).toBe(DAYS_OF_GRID);
		expect(days[0].key).toBe('2025-4-28');
		expect(days[0].value.getDay()).toBe(1); // Monday
		expect(days[0].weekend).toBe(false);
		expect(days.filter(day => day.thisMonth).length).toBe(31); // May 2025
	});
});

describe('HxDateTimeUtils.computeDays (non-Gregorian)', () => {
	beforeAll(() => {
		DateHebrewUtils.enable();
		DateJapaneseUtils.enable();
	});
	afterAll(() => {
		DateHebrewUtils.disable();
		DateJapaneseUtils.disable();
	});

	it('Hebrew grid walks the calendar month', () => {
		const week = weekOf('he-IL');
		const days = HxDateTimeUtils.computeDays(UTCDate.of(2025, 5, 6), 'he-IL', false, week);
		expect(days.length).toBe(DAYS_OF_GRID);
		// the grid starts on the configured first day of week
		expect(days[0].value.getDay()).toBe(firstDayOfWeekIndex(week));
		expect(days[0].weekend).toBe(week.week[0].weekend);
		// the calendar month starts at its first day and has 29 or 30 days
		const thisMonthDays = days.filter(day => day.thisMonth);
		const [, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(thisMonthDays[0].value, 'he-IL', false);
		expect(dayOfCalendar).toBe(1);
		expect([29, 30]).toContain(thisMonthDays.length);
	});

	it('Japanese grid walks the calendar month', () => {
		const week = weekOf('ja-JP');
		const days = HxDateTimeUtils.computeDays(UTCDate.of(2026, 0, 1), 'ja-JP', false, week);
		expect(days.length).toBe(DAYS_OF_GRID);
		expect(days[0].value.getDay()).toBe(firstDayOfWeekIndex(week));
		const thisMonthDays = days.filter(day => day.thisMonth);
		const [, , , dayOfCalendar] = DateLocaleFormatUtils.formatDateInNumeric(thisMonthDays[0].value, 'ja-JP', false);
		expect(dayOfCalendar).toBe(1);
		expect(thisMonthDays.length).toBe(31); // January 2026
	});
});

describe('HxDateTimeUtils.computeMonths / computeYears', () => {
	it('builds the 12 Gregorian months of the year', () => {
		const months = HxDateTimeUtils.computeMonths(UTCDate.of(2025, 5, 10), UTCDate.of(2025, 5, 10), 'en-US', true);
		expect(months.length).toBe(12);
		expect(months[0].key).toBe('2025-1-1');
		expect(months[11].key).toBe('2025-12-1');
		expect(months.map(month => month.offset)).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]);
		expect(months[5].thisMonth).toBe(true);
	});

	it('builds a centered years page for 2025', () => {
		const page = HxDateTimeUtils.computeYears(UTCDate.of(2025, 5, 10), UTCDate.of(2025, 5, 10), 'en-US', true);
		expect(page.years.length).toBe(25);
		expect(page.years[0].key).toBe('2013-1-1');
		expect(page.years[24].key).toBe('2037-1-1');
		const current = page.years.find(year => year.offset === 0)!;
		expect(current.value.getFullYear()).toBe(2025);
		expect(current.thisYear).toBe(true);
		expect(page.backward).toBe(true);
		expect(page.forward).toBe(true);
	});

	it('clamps the years page at the calendar boundaries', () => {
		const first = HxDateTimeUtils.computeYears(UTCDate.of(1, 0, 1), UTCDate.of(1, 0, 1), 'en-US', true);
		expect(first.backward).toBe(false);
		expect(first.years[0].key).toBe('1-1-1');
		const last = HxDateTimeUtils.computeYears(UTCDate.of(9999, 0, 1), UTCDate.of(9999, 0, 1), 'en-US', true);
		expect(last.forward).toBe(false);
		expect(last.years[24].key).toBe('9999-1-1');
	});

});

describe('HxDateTimeUtils.computeYears (Japanese)', () => {
	beforeAll(() => {
		DateJapaneseUtils.enable();
	});
	afterAll(() => {
		DateJapaneseUtils.disable();
	});

	it('annotates era transitions in the page', () => {
		const page = HxDateTimeUtils.computeYears(UTCDate.of(2026, 0, 1), UTCDate.of(2026, 0, 1), 'ja-JP', false);
		expect(page.years.length).toBe(25);
		const current = page.years.find(year => year.offset === 0)!;
		expect(current.thisYear).toBe(true);
		expect(current.label).toBe('8年'); // 令和 8
		// 2019 is the Reiwa transition year: era of the last day differs from the first
		const transition = page.years.find(year => year.value.getFullYear() === 2019)!;
		expect(transition.eras).toEqual(['令和']);
	});
});
