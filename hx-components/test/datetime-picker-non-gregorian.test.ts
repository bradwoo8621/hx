import {describe, expect, it} from 'vite-plus/test';
import {
	changeMonthToWhenNotGregorian,
	changeYearToWhenNotGregorian,
	DateLocaleUtils,
	moveDayToWhenNotGregorian,
	moveMonthToWhenNotGregorian,
	moveYearToWhenNotGregorian
} from '../src';

/** Helper: returns `[year, month, day]` in the non-Gregorian calendar. */
const numeric = (date: Date, lang: string) => DateLocaleUtils.formatDateInNumeric(date, lang, false);

describe('moveYearToWhenNotGregorian', () => {
	describe('ja-JP (Japanese imperial calendar)', () => {
		// Reiwa 1 = 2019-05-01, Reiwa 7 = 2025
		it('moves forward within same era', () => {
			const source = new Date(2025, 6, 6); // Reiwa 7/7/6
			const [sourceYear] = numeric(source, 'ja-JP');
			const result = moveYearToWhenNotGregorian({
				sourceDate: source,
				sourceYearOfCalendar: sourceYear,
				targetYearOfCalendar: sourceYear + 2,
				lang: 'ja-JP'
			});
			expect(result.yearOfCalendar).toBe(sourceYear + 2);
		});

		it('moves backward within same era', () => {
			const source = new Date(2025, 6, 6); // Reiwa 7
			const [sourceYear] = numeric(source, 'ja-JP');
			const result = moveYearToWhenNotGregorian({
				sourceDate: source,
				sourceYearOfCalendar: sourceYear,
				targetYearOfCalendar: sourceYear - 2,
				lang: 'ja-JP'
			});
			expect(result.yearOfCalendar).toBe(sourceYear - 2);
		});

		it('moves forward across era boundary (Heisei to Reiwa)', () => {
			// Heisei 30 = 2018
			const source = new Date(2018, 6, 6);
			const [sourceYear] = numeric(source, 'ja-JP');
			const result = moveYearToWhenNotGregorian({
				sourceDate: source,
				sourceYearOfCalendar: sourceYear,
				targetYearOfCalendar: sourceYear + 3, // Heisei 33, but Reiwa starts at 2019
				lang: 'ja-JP'
			});
			// After crossing into Reiwa era, year should be the Reiwa year
			const [year] = numeric(result.date, 'ja-JP');
			expect(result.yearOfCalendar).toBe(year);
			expect(year).toBeGreaterThan(0);
		});

		it('moves backward across era boundary (Reiwa to Heisei)', () => {
			// Reiwa 2 = 2020
			const source = new Date(2020, 6, 6);
			const [sourceYear] = numeric(source, 'ja-JP');
			const result = moveYearToWhenNotGregorian({
				sourceDate: source,
				sourceYearOfCalendar: sourceYear,
				targetYearOfCalendar: sourceYear - 3, // goes back into Heisei
				lang: 'ja-JP'
			});
			const [year] = numeric(result.date, 'ja-JP');
			expect(result.yearOfCalendar).toBe(year);
		});

		it('moves forward many years within same era', () => {
			// Heisei 20 = 2008, moving to Heisei 30 = 2018 (still Heisei)
			const source = new Date(2008, 6, 6);
			const [sourceYear] = numeric(source, 'ja-JP');
			const result = moveYearToWhenNotGregorian({
				sourceDate: source,
				sourceYearOfCalendar: sourceYear,
				targetYearOfCalendar: sourceYear + 10,
				lang: 'ja-JP'
			});
			expect(result.yearOfCalendar).toBe(sourceYear + 10);
		});

		it('moves backward many years within same era', () => {
			// Heisei 20 = 2008, moving to Heisei 5 = 1993
			const source = new Date(2008, 6, 6);
			const [sourceYear] = numeric(source, 'ja-JP');
			const result = moveYearToWhenNotGregorian({
				sourceDate: source,
				sourceYearOfCalendar: sourceYear,
				targetYearOfCalendar: sourceYear - 15,
				lang: 'ja-JP'
			});
			expect(result.yearOfCalendar).toBe(sourceYear - 15);
		});

		it('cross-era backward: Reiwa → Heisei', () => {
			// Reiwa 2 = 2020, moving back 3 years → Heisei 30 = 2018
			const source = new Date(2020, 6, 6);
			const result = moveYearToWhenNotGregorian({
				sourceDate: source,
				sourceYearOfCalendar: 2,
				targetYearOfCalendar: 30, // Heisei 30
				lang: 'ja-JP'
			});
			const [year] = numeric(result.date, 'ja-JP');
			expect(result.yearOfCalendar).toBe(year);
		});
	});

	describe('zh-TW (ROC calendar)', () => {
		// ROC 114 = 2025, ROC 1 = 1912
		it('moves forward', () => {
			const source = new Date(2025, 6, 6); // ROC 114
			const [sourceYear] = numeric(source, 'zh-TW');
			const result = moveYearToWhenNotGregorian({
				sourceDate: source,
				sourceYearOfCalendar: sourceYear,
				targetYearOfCalendar: sourceYear + 2,
				lang: 'zh-TW'
			});
			expect(result.yearOfCalendar).toBe(sourceYear + 2);
		});

		it('moves backward', () => {
			const source = new Date(2025, 6, 6); // ROC 114
			const [sourceYear] = numeric(source, 'zh-TW');
			const result = moveYearToWhenNotGregorian({
				sourceDate: source,
				sourceYearOfCalendar: sourceYear,
				targetYearOfCalendar: sourceYear - 2,
				lang: 'zh-TW'
			});
			expect(result.yearOfCalendar).toBe(sourceYear - 2);
		});

		it('moves to ROC 1', () => {
			// ROC 1 = 1912
			const source = new Date(1920, 0, 1); // ROC 9
			const [sourceYear] = numeric(source, 'zh-TW');
			const result = moveYearToWhenNotGregorian({
				sourceDate: source,
				sourceYearOfCalendar: sourceYear,
				targetYearOfCalendar: 1,
				lang: 'zh-TW'
			});
			expect(result.yearOfCalendar).toBe(1);
		});

		it('moves backward many years', () => {
			const source = new Date(2025, 6, 6);
			const [sourceYear] = numeric(source, 'zh-TW');
			const result = moveYearToWhenNotGregorian({
				sourceDate: source,
				sourceYearOfCalendar: sourceYear,
				targetYearOfCalendar: sourceYear - 50,
				lang: 'zh-TW'
			});
			expect(result.yearOfCalendar).toBe(sourceYear - 50);
		});

		it('moves backward within 民國 era (years remain positive)', () => {
			// ROC 5 = 1916, ROC 10 = 1921
			const source = new Date(1921, 0, 1); // ROC 10/1/1
			const [sourceYear] = numeric(source, 'zh-TW');
			const result = moveYearToWhenNotGregorian({
				sourceDate: source,
				sourceYearOfCalendar: sourceYear,
				targetYearOfCalendar: 5,
				lang: 'zh-TW'
			});
			expect(result.yearOfCalendar).toBe(5);
		});

		it('moves forward many years', () => {
			const source = new Date(1912, 0, 1);
			const [sourceYear] = numeric(source, 'zh-TW');
			const result = moveYearToWhenNotGregorian({
				sourceDate: source,
				sourceYearOfCalendar: sourceYear,
				targetYearOfCalendar: sourceYear + 100,
				lang: 'zh-TW'
			});
			expect(result.yearOfCalendar).toBe(sourceYear + 100);
		});
	});
});

describe('moveMonthToWhenNotGregorian', () => {
	describe('ja-JP', () => {
		it('moves forward within same year', () => {
			const source = new Date(2025, 0, 15); // Jan 15, Reiwa 7/1/15
			const [, sourceMonth] = numeric(source, 'ja-JP');
			const result = moveMonthToWhenNotGregorian({
				sourceDate: source,
				sourceMonthOfCalendar: sourceMonth,
				targetMonthOfCalendar: 6,
				lang: 'ja-JP'
			});
			expect(result.monthOfCalendar).toBe(6);
		});

		it('moves backward within same year', () => {
			const source = new Date(2025, 6, 15); // Jul 15, Reiwa 7/7/15
			const [, sourceMonth] = numeric(source, 'ja-JP');
			const result = moveMonthToWhenNotGregorian({
				sourceDate: source,
				sourceMonthOfCalendar: sourceMonth,
				targetMonthOfCalendar: 2,
				lang: 'ja-JP'
			});
			expect(result.monthOfCalendar).toBe(2);
		});

		it('target month 13 falls back to 12 (no leap month in Japanese calendar)', () => {
			const source = new Date(2025, 0, 15);
			const [, sourceMonth] = numeric(source, 'ja-JP');
			const result = moveMonthToWhenNotGregorian({
				sourceDate: source,
				sourceMonthOfCalendar: sourceMonth,
				targetMonthOfCalendar: 13,
				lang: 'ja-JP'
			});
			expect(result.monthOfCalendar).toBe(12);
		});

		it('year does not change when staying within same year', () => {
			const source = new Date(2025, 0, 15);
			const [, sourceMonth] = numeric(source, 'ja-JP');
			const [sourceYear] = numeric(source, 'ja-JP');
			const result = moveMonthToWhenNotGregorian({
				sourceDate: source,
				sourceMonthOfCalendar: sourceMonth,
				targetMonthOfCalendar: 12,
				lang: 'ja-JP'
			});
			expect(result.yearOfCalendar).toBe(sourceYear);
		});
	});

	describe('zh-TW', () => {
		it('moves forward within same year', () => {
			const source = new Date(2025, 0, 15);
			const [, sourceMonth] = numeric(source, 'zh-TW');
			const result = moveMonthToWhenNotGregorian({
				sourceDate: source,
				sourceMonthOfCalendar: sourceMonth,
				targetMonthOfCalendar: 6,
				lang: 'zh-TW'
			});
			expect(result.monthOfCalendar).toBe(6);
		});

		it('moves backward within same year', () => {
			const source = new Date(2025, 6, 15);
			const [, sourceMonth] = numeric(source, 'zh-TW');
			const result = moveMonthToWhenNotGregorian({
				sourceDate: source,
				sourceMonthOfCalendar: sourceMonth,
				targetMonthOfCalendar: 2,
				lang: 'zh-TW'
			});
			expect(result.monthOfCalendar).toBe(2);
		});

		it('target month 13 falls back to 12', () => {
			const source = new Date(2025, 0, 15);
			const [, sourceMonth] = numeric(source, 'zh-TW');
			const result = moveMonthToWhenNotGregorian({
				sourceDate: source,
				sourceMonthOfCalendar: sourceMonth,
				targetMonthOfCalendar: 13,
				lang: 'zh-TW'
			});
			expect(result.monthOfCalendar).toBe(12);
		});

		it('year does not change when staying within same year', () => {
			const source = new Date(2025, 0, 15);
			const [, sourceMonth] = numeric(source, 'zh-TW');
			const [sourceYear] = numeric(source, 'zh-TW');
			const result = moveMonthToWhenNotGregorian({
				sourceDate: source,
				sourceMonthOfCalendar: sourceMonth,
				targetMonthOfCalendar: 12,
				lang: 'zh-TW'
			});
			expect(result.yearOfCalendar).toBe(sourceYear);
		});
	});
});

describe('moveDayToWhenNotGregorian', () => {
	describe('ja-JP', () => {
		it('moves forward within same month', () => {
			const source = new Date(2025, 6, 6); // Jul 6
			const [, , sourceDay] = numeric(source, 'ja-JP');
			const result = moveDayToWhenNotGregorian({
				sourceDate: source,
				sourceDayOfCalendar: sourceDay,
				targetDayOfCalendar: 20,
				lang: 'ja-JP'
			});
			expect(result.dayOfCalendar).toBe(20);
		});

		it('moves backward within same month', () => {
			const source = new Date(2025, 6, 20); // Jul 20
			const [, , sourceDay] = numeric(source, 'ja-JP');
			const result = moveDayToWhenNotGregorian({
				sourceDate: source,
				sourceDayOfCalendar: sourceDay,
				targetDayOfCalendar: 5,
				lang: 'ja-JP'
			});
			expect(result.dayOfCalendar).toBe(5);
		});

		it('falls back to last valid day when target exceeds month length (Feb 30 → Feb 28)', () => {
			const source = new Date(2025, 1, 5); // Feb 5, 2025 (non-leap year)
			const [, , sourceDay] = numeric(source, 'ja-JP');
			const result = moveDayToWhenNotGregorian({
				sourceDate: source,
				sourceDayOfCalendar: sourceDay,
				targetDayOfCalendar: 30,
				lang: 'ja-JP'
			});
			expect(result.dayOfCalendar).toBe(28);
		});

		it('handles day 31 in a 30-day month', () => {
			const source = new Date(2025, 3, 10); // Apr 10 (30-day month)
			const [, , sourceDay] = numeric(source, 'ja-JP');
			const result = moveDayToWhenNotGregorian({
				sourceDate: source,
				sourceDayOfCalendar: sourceDay,
				targetDayOfCalendar: 31,
				lang: 'ja-JP'
			});
			expect(result.dayOfCalendar).toBe(30);
		});

		it('month does not change when moving within same month', () => {
			const source = new Date(2025, 6, 6);
			const [, , sourceDay] = numeric(source, 'ja-JP');
			const [, sourceMonth] = numeric(source, 'ja-JP');
			const result = moveDayToWhenNotGregorian({
				sourceDate: source,
				sourceDayOfCalendar: sourceDay,
				targetDayOfCalendar: 15,
				lang: 'ja-JP'
			});
			expect(result.monthOfCalendar).toBe(sourceMonth);
		});
	});

	describe('zh-TW', () => {
		it('moves forward within same month', () => {
			const source = new Date(2025, 6, 6);
			const [, , sourceDay] = numeric(source, 'zh-TW');
			const result = moveDayToWhenNotGregorian({
				sourceDate: source,
				sourceDayOfCalendar: sourceDay,
				targetDayOfCalendar: 20,
				lang: 'zh-TW'
			});
			expect(result.dayOfCalendar).toBe(20);
		});

		it('falls back to last valid day when target exceeds month length', () => {
			const source = new Date(2025, 1, 5); // Feb 5
			const [, , sourceDay] = numeric(source, 'zh-TW');
			const result = moveDayToWhenNotGregorian({
				sourceDate: source,
				sourceDayOfCalendar: sourceDay,
				targetDayOfCalendar: 30,
				lang: 'zh-TW'
			});
			expect(result.dayOfCalendar).toBe(28);
		});
	});
});

describe('changeYearToWhenNotGregorian (integration)', () => {
	describe('ja-JP', () => {
		it('changes year while preserving month and day', () => {
			const source = new Date(2025, 6, 6); // Reiwa 7/7/6
			const [sourceYear] = numeric(source, 'ja-JP');
			const result = changeYearToWhenNotGregorian(sourceYear + 1, source, 'ja-JP');
			const [year, month, day] = numeric(result, 'ja-JP');
			expect(year).toBe(sourceYear + 1);
			expect(month).toBe(7);
			expect(day).toBe(6);
		});

		it('preserves month and day when changing year within same era', () => {
			const source = new Date(2025, 6, 6);
			const [sourceYear] = numeric(source, 'ja-JP');
			const result = changeYearToWhenNotGregorian(sourceYear - 2, source, 'ja-JP');
			const [year, month, day] = numeric(result, 'ja-JP');
			expect(year).toBe(sourceYear - 2);
			expect(month).toBe(7);
			expect(day).toBe(6);
		});

		it('handles Feb 29 in a non-leap year by falling back to Feb 28', () => {
			// Feb 29, 2024 (leap year) → change to 2025 (non-leap year)
			const source = new Date(2024, 1, 29); // Reiwa 6/2/29
			const [sourceYear] = numeric(source, 'ja-JP');
			const result = changeYearToWhenNotGregorian(sourceYear + 1, source, 'ja-JP');
			const [, , day] = numeric(result, 'ja-JP');
			expect(day).toBe(28);
		});
	});

	describe('zh-TW', () => {
		it('changes year while preserving month and day', () => {
			const source = new Date(2025, 6, 6); // ROC 114/7/6
			const [sourceYear] = numeric(source, 'zh-TW');
			const result = changeYearToWhenNotGregorian(sourceYear + 1, source, 'zh-TW');
			const [year, month, day] = numeric(result, 'zh-TW');
			expect(year).toBe(sourceYear + 1);
			expect(month).toBe(7);
			expect(day).toBe(6);
		});

		it('handles Feb 29 → non-leap year fallback', () => {
			const source = new Date(2024, 1, 29);
			const [sourceYear] = numeric(source, 'zh-TW');
			const result = changeYearToWhenNotGregorian(sourceYear + 1, source, 'zh-TW');
			const [, , day] = numeric(result, 'zh-TW');
			expect(day).toBe(28);
		});
	});
});

describe('changeMonthToWhenNotGregorian (integration)', () => {
	describe('ja-JP', () => {
		it('changes month while preserving day', () => {
			const source = new Date(2025, 6, 15); // Reiwa 7/7/15
			const [sourceYear] = numeric(source, 'ja-JP');
			const result = changeMonthToWhenNotGregorian(sourceYear, 3, source, 'ja-JP');
			const [year, month, day] = numeric(result, 'ja-JP');
			expect(year).toBe(sourceYear);
			expect(month).toBe(3);
			expect(day).toBe(15);
		});

		it('falls back to last day when day exceeds target month length (Jan 31 → Feb 28)', () => {
			const source = new Date(2025, 0, 31); // Jan 31
			const [sourceYear] = numeric(source, 'ja-JP');
			const result = changeMonthToWhenNotGregorian(sourceYear, 2, source, 'ja-JP');
			const [, month, day] = numeric(result, 'ja-JP');
			expect(month).toBe(2);
			expect(day).toBe(28);
		});

		it('month 13 falls back to 12 for non-leap years', () => {
			const source = new Date(2025, 0, 15);
			const [sourceYear] = numeric(source, 'ja-JP');
			const result = changeMonthToWhenNotGregorian(sourceYear, 13, source, 'ja-JP');
			const [, month] = numeric(result, 'ja-JP');
			expect(month).toBe(12);
		});
	});

	describe('zh-TW', () => {
		it('changes month while preserving day', () => {
			const source = new Date(2025, 6, 15); // ROC 114/7/15
			const [sourceYear] = numeric(source, 'zh-TW');
			const result = changeMonthToWhenNotGregorian(sourceYear, 3, source, 'zh-TW');
			const [year, month, day] = numeric(result, 'zh-TW');
			expect(year).toBe(sourceYear);
			expect(month).toBe(3);
			expect(day).toBe(15);
		});

		it('month 13 falls back to 12', () => {
			const source = new Date(2025, 0, 15);
			const [sourceYear] = numeric(source, 'zh-TW');
			const result = changeMonthToWhenNotGregorian(sourceYear, 13, source, 'zh-TW');
			const [, month] = numeric(result, 'zh-TW');
			expect(month).toBe(12);
		});
	});
});
