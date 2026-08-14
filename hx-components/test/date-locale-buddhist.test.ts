import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {
	DateBuddhistUtils,
	DateLocaleFormatUtils,
	DateMoveUtils,
	UTCDate
} from '../src';

/**
 * Panel-data tests for the Thai Buddhist calendar (B.E.).
 *
 * <p>Shares the panel implementation with the Minguo calendar via
 * {@link DateLocaleGregorianAndJulianHelper#yearsAround}. The Buddhist Era is a
 * continuous year system (B.E. 544 = A.D. 1) with no year-0 gap, so cell years
 * are plain linear offsets; the calendar bounds are [544, 10542]. Cell dates
 * hold the first day of their calendar year/month in ICU semantics and may fall
 * outside the Gregorian [0001, 9999] range at the calendar edges.</p>
 */

const PAGE_SIZE = DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE;
const CENTER_INDEX = Math.floor((PAGE_SIZE - 1) / 2);

/** Formats a date in the Buddhist calendar as [year, month, day] (B.E. year). */
const buddhistOf = (date: UTCDate): Array<number> => {
	const [, year, month, day] = DateLocaleFormatUtils.formatDateInNumeric(date, 'th-TH', false);
	return [year, month, day];
};

const utcOf = (iso: string): UTCDate => {
	return UTCDate.of(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
};

/**
 * Verifies the years-panel invariants for a base date (base == current date):
 * <ol>
 * <li>page length equals {@link PAGE_SIZE}</li>
 * <li>every cell is the first day of its calendar year (month 1, day 1)</li>
 * <li>cell years are consecutive</li>
 * <li>the base-year cell has offset 0 and {@code thisYear} true; it sits at the
 *     page center unless the page is clamped at the calendar bounds</li>
 * <li>moving the base date by a cell's offset lands in the cell's B.E. year
 *     (this mirrors what the UI does on click)</li>
 * </ol>
 *
 * @returns a list of violated invariants, empty when the page is correct
 */
const checkYearsAround = (iso: string): Array<string> => {
	const base = utcOf(iso);
	const [baseYear] = buddhistOf(base);
	const page = DateBuddhistUtils.INSTANCE.yearsAround(base, base, 'th-TH', false);
	const errors: Array<string> = [];
	if (page.years.length !== PAGE_SIZE) {
		errors.push(`page length ${page.years.length} != ${PAGE_SIZE}`);
	}
	let foundBaseYear = false;
	let previousYear: number | null = null;
	page.years.forEach((cell, index) => {
		const [year, month, day] = buddhistOf(cell.value);
		if (month !== 1 || day !== 1) {
			errors.push(`[${index}] not Jan 1: ${year}/${month}/${day}`);
		}
		if (previousYear != null && year !== previousYear + 1) {
			errors.push(`[${index}] year jump ${previousYear} -> ${year}`);
		}
		previousYear = year;
		if (year === baseYear) {
			foundBaseYear = true;
			if (cell.offset !== 0) {
				errors.push(`base-year cell offset ${cell.offset} != 0`);
			}
			if (!cell.thisYear) {
				errors.push('base-year cell thisYear is false');
			}
			if (page.forward && page.backward && index !== CENTER_INDEX) {
				errors.push(`unclamped page: base year at index ${index}, not ${CENTER_INDEX}`);
			}
		}
		// the UI moves the state date by the cell offset on click
		const moved = DateMoveUtils.moveYear(DateMoveUtils.asHxDate(base), cell.offset, 'th-TH', false);
		const [movedYear] = buddhistOf(DateMoveUtils.asJsDate(moved));
		if (movedYear !== year) {
			errors.push(`[${index}] offset ${cell.offset}: click lands B.E. ${movedYear}, cell is ${year}`);
		}
	});
	if (!foundBaseYear) {
		errors.push(`base year ${baseYear} missing from page`);
	}
	return errors;
};

/**
 * Verifies the months-panel invariants for a base date:
 * <ol>
 * <li>12 month cells</li>
 * <li>every cell is the first day of its calendar month</li>
 * <li>every cell belongs to the base year</li>
 * </ol>
 *
 * @returns a list of violated invariants, empty when the panel is correct
 */
const checkMonthsOfYear = (iso: string): Array<string> => {
	const base = utcOf(iso);
	const [baseYear] = buddhistOf(base);
	const months = DateBuddhistUtils.INSTANCE.monthsOfYear(base, 'th-TH', false);
	const errors: Array<string> = [];
	if (months.length !== 12) {
		errors.push(`month count ${months.length} != 12`);
	}
	months.forEach((cell, index) => {
		const [year, month, day] = buddhistOf(cell.value);
		if (day !== 1) {
			errors.push(`[${index}] not first day of month: ${year}/${month}/${day}`);
		}
		if (year !== baseYear) {
			errors.push(`[${index}] year ${year} != base ${baseYear}`);
		}
	});
	return errors;
};

const YEARS_AROUND_CASES: Array<{iso: string, note: string}> = [
	{iso: '2026-05-01', note: 'modern, B.E. 2569'},
	{iso: '1583-01-01', note: 'page crosses the 1582 reform'},
	{iso: '1584-05-01', note: 'page crosses the 1582 reform'},
	{iso: '1594-05-01', note: 'page fully post-reform'},
	{iso: '1582-11-01', note: 'reform year, day 1'},
	{iso: '1582-11-15', note: 'reform year, day 15'},
	{iso: '1582-12-01', note: 'reform year, December'},
	{iso: '1582-12-20', note: 'reform year, late December'},
	{iso: '1582-10-04', note: 'short month, first part (days 1-4)'},
	{iso: '1582-10-15', note: 'short month, second part (days 15-31)'},
	{iso: '1582-05-01', note: 'reform year, pre-reform month'},
	{iso: '0001-06-01', note: 'bottom clamp, B.E. 544'},
	{iso: '0001-01-03', note: 'bottom clamp, earliest representable date'},
	{iso: '0002-06-01', note: 'page includes the bottom clamp, B.E. 545'},
	{iso: '1000-05-01', note: 'offset +5 region'},
	{iso: '0312-05-01', note: 'offset +1 region, gregorian day equals the offset'},
	{iso: '0312-05-02', note: 'offset +1 region, day 2'},
	{iso: '0512-05-02', note: 'offset +2 region, day equals the offset'},
	{iso: '0612-06-03', note: 'offset +3 region, day equals the offset'},
	{iso: '0712-07-04', note: 'offset +4 region, day equals the offset'},
	{iso: '0812-08-05', note: 'offset +5 region, day equals the offset'},
	{iso: '1212-12-07', note: 'offset +7 region, day equals the offset'},
	{iso: '1512-11-10', note: 'offset +10 region, day equals the offset'},
	{iso: '0491-12-11', note: 'offset +1 region, late December'},
	{iso: '9999-05-01', note: 'top clamp, B.E. 10542'}
];

const MONTHS_OF_YEAR_CASES: Array<{iso: string, note: string}> = [
	{iso: '2026-05-01', note: 'modern'},
	{iso: '1582-10-15', note: 'the 21-day short month'},
	{iso: '1582-11-01', note: 'post-reform month of the reform year'},
	{iso: '0001-06-01', note: 'bottom partial year'},
	{iso: '9999-05-01', note: 'top partial year'}
];

describe('Buddhist years panel', () => {
	beforeAll(() => {
		DateBuddhistUtils.enable();
	});

	afterAll(() => {
		DateBuddhistUtils.disable();
	});

	it.each(YEARS_AROUND_CASES)('yearsAround: $note ($iso)', ({iso}) => {
		expect(checkYearsAround(iso)).toEqual([]);
	});
});

describe('Buddhist months panel', () => {
	beforeAll(() => {
		DateBuddhistUtils.enable();
	});

	afterAll(() => {
		DateBuddhistUtils.disable();
	});

	it.each(MONTHS_OF_YEAR_CASES)('monthsOfYear: $note ($iso)', ({iso}) => {
		expect(checkMonthsOfYear(iso)).toEqual([]);
	});
});
