import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {
	DateIslamicCivilUtils,
	DateIslamicUmalquraUtils,
	DateIslamicUtils,
	DateLocaleUtils,
	DateMoveUtils,
	DateUtils
} from '../src';

/**
 * Move a Gregorian date by year/month offset and format the result back to
 * the calendar, returning [year, month, day].
 */
const movedToCalendar = (lang: string, date: { year: number, month: number, day: number }, offset: {
	years?: number,
	months?: number
}): Array<number> => {
	const moved = offset.years != null
		? DateMoveUtils.moveYear(date, offset.years, lang as never, false)
		: DateMoveUtils.moveMonth(date, offset.months as number, lang as never, false);
	const [, year, month, day] = DateLocaleUtils.formatDateInNumeric(DateUtils.asJsDate(moved), lang as never, false);
	return [year, month, day];
};

describe('Islamic move', () => {
	beforeAll(() => {
		DateIslamicUtils.enable();
		DateIslamicCivilUtils.enable();
		DateIslamicUmalquraUtils.enable();
	});

	afterAll(() => {
		DateIslamicUtils.disable();
		DateIslamicCivilUtils.disable();
		DateIslamicUmalquraUtils.disable();
	});

	const fmtISO = (iso: string, format: Intl.DateTimeFormat): string => {
		const parts = format.formatToParts(new Date(iso));
		return [
			parts.find(p => p.type === 'year')!.value,
			parts.find(p => p.type === 'month')!.value,
			parts.find(p => p.type === 'day')!.value
		].join('/');
	};

	/**
	 * Document the ICU `'islamic'` (astronomical) variant behavior: its day
	 * boundaries are time-of-day precise, not aligned to UTC midnight. As a
	 * result an "insertion day" like 1445/12/30 exists only inside a short
	 * UTC window on 2024-07-05 (roughly 15:30–22:30) and has no full UTC day
	 * of its own — which is why the benchmark data files (UTC-day semantics)
	 * skip it.
	 */
	it('ICU islamic day boundary: 1445/12/30 exists only in a short UTC window', () => {
		const format = new Intl.DateTimeFormat('ar-DZ-u-nu-latn', {
			era: 'long', year: 'numeric', month: 'numeric', day: 'numeric', calendar: 'islamic', timeZone: 'UTC'
		});
		expect(fmtISO('2024-07-05T12:00:00Z', format)).toBe('1445/12/29');
		expect(fmtISO('2024-07-05T16:00:00Z', format)).toBe('1445/12/30'); // insertion day window
		expect(fmtISO('2024-07-05T22:00:00Z', format)).toBe('1445/12/30');
		expect(fmtISO('2024-07-05T23:00:00Z', format)).toBe('1446/1/1');

		expect(fmtISO('2024-07-05T20:00:00+08:00', format)).toBe('1445/12/29');
		expect(fmtISO('2024-07-06T00:00:00+08:00', format)).toBe('1445/12/30'); // insertion day window
		expect(fmtISO('2024-07-06T06:00:00+08:00', format)).toBe('1445/12/30');
		expect(fmtISO('2024-07-06T07:00:00+08:00', format)).toBe('1446/1/1');
	});

	it('Format for UTC and +08:00', () => {
		const format = new Intl.DateTimeFormat('th-TH-u-nu-latn', {
			era: 'long', year: 'numeric', month: 'numeric', day: 'numeric',
			calendar: 'buddhist', timeZone: 'Asia/Shanghai'
		});
		expect(fmtISO('2024-07-04T15:00:00Z', format)).toBe('2567/7/4');
		expect(fmtISO('2024-07-04T16:00:00Z', format)).toBe('2567/7/5');
		expect(fmtISO('2024-07-05T00:00:00+08:00', format)).toBe('2567/7/5');
	});

	describe('tabular (ar-DZ)', () => {
		it('moves back 5 months from −640/10/20 to the epoch −640/05/20 = 0001/01/01', () => {
			// −640/10/20 (calendar) = 0001/05/29 (Gregorian)
			// expected: −640/05/20 = 0001/01/01
			const moved = DateMoveUtils.moveMonth({year: 1, month: 5, day: 29}, -5, 'ar-DZ', false);
			// TODO known failure: moveDateTo of month 5 in year −640 misses the start-day offset (20 → 1/1/20)
			expect(moved).toEqual({year: 1, month: 1, day: 1});
		});

		it('moves +1 year from 1446/01/01 (2024/07/06) to 1447/01/01', () => {
			// TODO known failure: ICU 'islamic' uses UTC day while code uses local midnight → off by 1 day in UTC+8
			expect(movedToCalendar('ar-DZ', {year: 2024, month: 7, day: 6}, {years: 1})).toEqual([1447, 1, 1]);
		});

		it('moves +1 month from 1446/01/01 (2024/07/06) to 1446/02/01', () => {
			expect(movedToCalendar('ar-DZ', {year: 2024, month: 7, day: 6}, {months: 1})).toEqual([1446, 2, 1]);
		});

		it('clamps +1 year at the upper bound 9666/01/01 (9999/10/04)', () => {
			expect(movedToCalendar('ar-DZ', {year: 9999, month: 10, day: 4}, {years: 1})).toEqual([9666, 1, 1]);
		});
	});

	describe('civil (ar-AE)', () => {
		it('moves back 5 months from −640/10/20 to −640/05/20 = 0001/01/03', () => {
			// −640/10/20 (calendar) = 0001/05/31 (gregorian)
			// moveMonth keeps the day: −640/05/20 (civil) = 0001/01/03 (5/18 is the epoch day)
			const moved = DateMoveUtils.moveMonth({year: 1, month: 5, day: 31}, -5, 'ar-AE', false);
			expect(moved).toEqual({year: 1, month: 1, day: 3});
		});

		it('moves +1 year from 1446/01/01 (2024/07/08) to 1447/01/01', () => {
			expect(movedToCalendar('ar-AE', {year: 2024, month: 7, day: 8}, {years: 1})).toEqual([1447, 1, 1]);
		});

		it('moves +1 month from 1446/01/01 (2024/07/08) to 1446/02/01', () => {
			expect(movedToCalendar('ar-AE', {year: 2024, month: 7, day: 8}, {months: 1})).toEqual([1446, 2, 1]);
		});

		it('clamps +1 year at the upper bound 9666/01/01 (9999/10/02)', () => {
			expect(movedToCalendar('ar-AE', {year: 9999, month: 10, day: 2}, {years: 1})).toEqual([9666, 1, 1]);
		});
	});

	describe('umalqura (ar-SA)', () => {
		it('moves back 5 months from −640/10/20 to −640/05/20 = 0001/01/03', () => {
			// −640/10/20 (calendar) = 0001/05/31 (gregorian)
			// moveMonth keeps the day: −640/05/20 (umalqura) = 0001/01/03 (5/18 is the epoch day)
			const moved = DateMoveUtils.moveMonth({year: 1, month: 5, day: 31}, -5, 'ar-SA', false);
			expect(moved).toEqual({year: 1, month: 1, day: 3});
		});

		it('moves +1 year from 1446/01/01 (2024/07/07) to 1447/01/01', () => {
			expect(movedToCalendar('ar-SA', {year: 2024, month: 7, day: 7}, {years: 1})).toEqual([1447, 1, 1]);
		});

		it('moves +1 month from 1446/01/01 (2024/07/07) to 1446/02/01', () => {
			expect(movedToCalendar('ar-SA', {year: 2024, month: 7, day: 7}, {months: 1})).toEqual([1446, 2, 1]);
		});

		it('clamps +1 year at the upper bound 9666/01/01 (9999/10/02)', () => {
			expect(movedToCalendar('ar-SA', {year: 9999, month: 10, day: 2}, {years: 1})).toEqual([9666, 1, 1]);
		});
	});
});
