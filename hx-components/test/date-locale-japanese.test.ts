import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {DateJapaneseUtils, DateLocaleFormatUtils, DateMoveUtils, DateUtils, UTCDate} from '../src';

/**
 * Panel-data tests for the Japanese Imperial calendar.
 *
 * <p>The Japanese calendar is the Gregorian calendar with era-based years
 * (年号). The months panel shows the era of a month's first day when it
 * differs from the previous month's (January always shows the year's era),
 * and lists additional era names appearing inside the month. Two era
 * changes can land inside one month (e.g. 1989/01: Shōwa→Heisei on the 7th,
 * 1926/12: Taishō→Shōwa on the 25th); the only month with three eras is
 * 1387/8 (元中/至徳/嘉慶), from the Nanboku-chō era overlap, which is handled
 * explicitly. The 1582/10 month is the Gregorian reform month: it has only
 * 21 days (days 5-14 skipped) and is handled by the shared
 * Gregorian-and-Julian first-day helper.</p>
 */

/** Formats a date in the Japanese calendar as [era, year, month, day]. */
const japaneseOf = (date: UTCDate): Array<string> => {
	const [era, year, month, day] = DateLocaleFormatUtils.formatDateInNumeric(date, 'ja', false);
	return [era, String(year), String(month), String(day)];
};

const utcOf = (iso: string): UTCDate => {
	return UTCDate.of(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
};

/**
 * Verifies the months-panel invariants for a base date:
 * <ol>
 * <li>12 month cells whose calendar months are exactly 1-12</li>
 * <li>every cell is the first day of its calendar month</li>
 * <li>cell offsets are consecutive (relative to the base month)</li>
 * <li>the era / eras fields match the expected display sequence, where each
 *     entry is {@code 'era'} (month shows its era), {@code 'era/era2'} (the
 *     month shows its era plus an additional era inside it) or {@code '-'}
 *     (no era display)</li>
 * </ol>
 *
 * @returns a list of violated invariants, empty when the panel is correct
 */
const checkMonthsOfYear = (iso: string, expectedEras: Array<string>): Array<string> => {
	const base = utcOf(iso);
	const months = DateJapaneseUtils.INSTANCE.monthsOfYear(base, base, 'ja', false);
	const errors: Array<string> = [];
	if (months.length !== 12) {
		errors.push(`month count ${months.length} != 12`);
	}
	const calendarMonths: Array<string> = [];
	months.forEach((cell, index) => {
		const [era, , month, day] = japaneseOf(cell.value);
		if (day !== '1') {
			errors.push(`[${index}] not first day of month: ${month}/${day}`);
		}
		calendarMonths.push(month);
		if (index > 0 && cell.offset !== months[index - 1].offset + 1) {
			errors.push(`[${index}] offset ${cell.offset} not consecutive after ${months[index - 1].offset}`);
		}
		const actual = cell.eras != null ? `${era}/${cell.eras.join('/')}` : era;
		const expected = expectedEras[index];
		if (expected === '-' && cell.era != null) {
			errors.push(`[${index}] unexpected era display "${actual}" (month ${month})`);
		} else if (expected !== '-' && actual !== expected) {
			errors.push(`[${index}] era display "${actual}" != expected "${expected}" (month ${month})`);
		}
	});
	if (calendarMonths.join(',') !== '1,2,3,4,5,6,7,8,9,10,11,12') {
		errors.push(`calendar months ${calendarMonths.join(',')} not 1-12`);
	}
	return errors;
};

/** Expected era display for the 12 months, or '-' when the month shows none. */
const NO_ERA = ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'];

const MONTHS_OF_YEAR_CASES: Array<{iso: string, expected: Array<string>, note: string}> = [
	{
		iso: '2024-06-15',
		expected: ['令和', ...NO_ERA.slice(1)],
		note: 'single-era year 2024 (Reiwa), only January shows the era'
	},
	{
		iso: '2019-05-15',
		expected: ['平成', '-', '-', '平成/令和', '令和', ...NO_ERA.slice(5)],
		note: '2019 Heisei→Reiwa on 5/1, base in the switch month'
	},
	{
		iso: '2019-08-15',
		expected: ['平成', '-', '-', '平成/令和', '令和', ...NO_ERA.slice(5)],
		note: '2019 Heisei→Reiwa, base after the switch month'
	},
	{
		iso: '1989-01-15',
		expected: ['昭和/平成', '平成', ...NO_ERA.slice(2)],
		note: '1989 Shōwa→Heisei on 1/7, mid-month change in January'
	},
	{
		iso: '1926-12-15',
		expected: ['大正', ...NO_ERA.slice(1, 11), '大正/昭和'],
		note: '1926 Taishō→Shōwa on 12/25, change in December'
	},
	{
		iso: '1582-10-20',
		expected: NO_ERA.map((value, index) => index === 0 ? '天正' : value),
		note: '1582/10 short month (21 days, days 5-14 skipped), 12 cells intact'
	},
	{
		iso: '1387-08-15',
		expected: ['元中', '-', '-', '-', '-', '-', '-', '元中/至徳/嘉慶', '嘉慶', '-', '-', '-'],
		note: '1387/8 the only 3-era month (Nanboku-chō overlap); September then shows Kakei'
	}
];

describe('Japanese months panel', () => {
	beforeAll(() => {
		DateJapaneseUtils.enable();
	});

	afterAll(() => {
		DateJapaneseUtils.disable();
	});

	it.each(MONTHS_OF_YEAR_CASES)('monthsOfYear: $note ($iso)', ({iso, expected}) => {
		expect(checkMonthsOfYear(iso, expected)).toEqual([]);
	});
});

const PAGE_SIZE = DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE;
const CENTER_INDEX = Math.floor((PAGE_SIZE - 1) / 2);

/**
 * Verifies the years-panel invariants for a base date (base == current date):
 * <ol>
 * <li>page length equals {@link PAGE_SIZE}</li>
 * <li>every cell is the first day of its calendar year (month 1, day 1)</li>
 * <li>cell offsets are consecutive</li>
 * <li>the base-year cell has offset 0; it sits at the page center unless
 *     the page is clamped at the calendar bounds</li>
 * <li>moving the base date by a cell's offset lands in the cell's
 *     sequential year (matched by the Gregorian year, or by the formatted
 *     era and year in the pre-reform Seireki region where the sequential
 *     year differs from the Gregorian year; this mirrors what the UI does
 *     on click)</li>
 * <li>the era / eras fields of the given cells match the expected display,
 *     where each entry is {@code 'era'}, {@code 'era/era2'} or {@code '-'}
 *     (no era display)</li>
 * </ol>
 *
 * @returns a list of violated invariants, empty when the page is correct
 */
const checkYearsAround = (iso: string, expectedEras: Array<[number, string]>): Array<string> => {
	const base = utcOf(iso);
	const baseEraYear = `${japaneseOf(base)[0]}${japaneseOf(base)[1]}`;
	// before the Gregorian reform the sequential (Seireki) year differs
	// from the Gregorian year, so match by formatted era/year there
	const matchesBaseYear = (cell: {value: UTCDate}): boolean => base.getFullYear() < 100
		? `${japaneseOf(cell.value)[0]}${japaneseOf(cell.value)[1]}` === baseEraYear
		: cell.value.getFullYear() === base.getFullYear();
	const page = DateJapaneseUtils.INSTANCE.yearsAround(base, base, 'ja', false);
	const errors: Array<string> = [];
	if (page.years.length !== PAGE_SIZE) {
		errors.push(`page length ${page.years.length} != ${PAGE_SIZE}`);
	}
	let foundBaseYear = false;
	page.years.forEach((cell, index) => {
		const [era, year, month, day] = japaneseOf(cell.value);
		if (month !== '1' || day !== '1') {
			errors.push(`[${index}] not Jan 1: ${year}/${month}/${day}`);
		}
		if (index > 0 && cell.offset !== page.years[index - 1].offset + 1) {
			errors.push(`[${index}] offset ${cell.offset} not consecutive after ${page.years[index - 1].offset}`);
		}
		if (matchesBaseYear(cell)) {
			foundBaseYear = true;
			if (cell.offset !== 0) {
				errors.push(`base-year cell offset ${cell.offset}`);
			}
			if (page.forward && page.backward && index !== CENTER_INDEX) {
				errors.push(`unclamped page: base year at index ${index}, not ${CENTER_INDEX}`);
			}
		}
		// the UI moves the state date by the cell offset on click; the
		// landing sequential year is the cell's, so its Gregorian year (or
		// formatted era/year in the Seireki region) must match the cell's
		const moved = DateMoveUtils.moveYear(DateUtils.asHxDate(base), cell.offset, 'ja', false);
		const movedDate = DateUtils.asUtcDate(moved);
		const landsInCellYear = base.getFullYear() < 100
			? `${japaneseOf(movedDate)[0]}${japaneseOf(movedDate)[1]}` === `${era}${year}`
			: movedDate.getFullYear() === cell.value.getFullYear();
		if (!landsInCellYear) {
			errors.push(`[${index}] click lands outside the cell's year (offset ${cell.offset})`);
		}
	});
	if (!foundBaseYear) {
		errors.push(`base year ${baseEraYear} missing from page`);
	}
	expectedEras.forEach(([index, expected]) => {
		const cell = page.years[index];
		const [era] = japaneseOf(cell.value);
		const actual = cell.eras != null ? `${era}/${cell.eras.join('/')}` : (cell.era ?? '-');
		if (actual !== expected) {
			errors.push(`[${index}] era display "${actual}" != expected "${expected}"`);
		}
	});
	return errors;
};

/**
 * Base dates covering the modern era changes, both clamps and the two
 * three-era hardcodes; the era display is asserted for the cells that
 * carry one.
 */
const YEARS_AROUND_CASES: Array<{iso: string, expectedEras: Array<[number, string]>, note: string}> = [
	{
		iso: '2024-06-15',
		expectedEras: [[0, '平成'], [7, '平成/令和'], [8, '令和']],
		note: 'modern 2024, Heisei page with the 2019 Heisei→Reiwa change'
	},
	{
		iso: '2019-08-15',
		expectedEras: [[0, '平成'], [12, '平成/令和'], [13, '令和']],
		note: '2019 base after the switch month'
	},
	{
		iso: '0001-01-01',
		expectedEras: [[0, '西暦']],
		note: 'bottom clamp, Seireki era; the sequential year may differ from the Gregorian year'
	},
	{
		iso: '9999-12-31',
		expectedEras: [[0, '令和']],
		note: 'top clamp'
	},
	{
		iso: '1582-10-20',
		expectedEras: [],
		note: '1582/10 short month region'
	},
	{
		iso: '1387-08-15',
		expectedEras: [[0, '文中/天授'], [12, '元中/至徳/嘉慶']],
		note: '1387 the only 3-era year (Nanboku-chō overlap, hardcoded)'
	},
	{
		iso: '0749-06-15',
		expectedEras: [[0, '天平'], [12, '天平/感宝/勝宝']],
		note: '749 the other 3-era year (hardcoded)'
	}
];

describe('Japanese years panel', () => {
	beforeAll(() => {
		DateJapaneseUtils.enable();
	});

	afterAll(() => {
		DateJapaneseUtils.disable();
	});

	it.each(YEARS_AROUND_CASES)('yearsAround: $note ($iso)', ({iso, expectedEras}) => {
		expect(checkYearsAround(iso, expectedEras)).toEqual([]);
	});
});
