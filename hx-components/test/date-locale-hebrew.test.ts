import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {DateHebrewUtils, DateLocaleFormatUtils, DateMoveUtils, DateUtils, UTCDate} from '../src';

/**
 * Panel-data tests for the Hebrew (civil) calendar.
 *
 * <p>The Hebrew calendar is lunisolar: months are 29/30 days and a leap year
 * adds a 13th month. Months are numbered in the civil sequence starting at
 * Tishrei (month 1); in a leap year Adar is split into Adar I (6) and
 * Adar II (7), shifting Nisan to 8 and Elul to 13. The months panel walks
 * the shared {@link DateLocaleNotGregorianHelper} skeleton (30 days per
 * month) and appends the 13th month for leap years. The calendar bounds are
 * [3761, 13760]: year 3761 starts at month 4 (Gregorian 0001/01/01 =
 * 3761/4/18) and year 13760 ends at month 2 (Gregorian 9999/12/31 =
 * 13760/2/28), so months 1-3 of 3761 are flagged `bc` and months 3-12 of
 * 13760 are flagged `y10k`.</p>
 */

/** Formats a date in the Hebrew calendar as [year, month, day]. */
const hebrewOf = (date: UTCDate): Array<number> => {
	const [, year, month, day] = DateLocaleFormatUtils.formatDateInNumeric(date, 'he-IL', false);
	return [year, month, day];
};

const utcOf = (iso: string): UTCDate => {
	return UTCDate.of(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
};

/**
 * Verifies the months-panel invariants for a base date:
 * <ol>
 * <li>cell count equals the expected 12 (common year) or 13 (leap year)</li>
 * <li>every cell is the first day of its calendar month and belongs to the
 *     base year</li>
 * <li>cell offsets are consecutive (each following cell's offset is the
 *     previous plus one, relative to the base month)</li>
 * <li>a leap year ends with a month-13 cell whose offset follows the 12th
 *     month's</li>
 * <li>the partial years 3761 (months 1-3 missing) and 13760 (months 3-12
 *     missing) carry the {@code bc} / {@code y10k} flags</li>
 * </ol>
 *
 * @returns a list of violated invariants, empty when the panel is correct
 */
const checkMonthsOfYear = (iso: string, expectedLength: number): Array<string> => {
	const base = utcOf(iso);
	const [baseYear] = hebrewOf(base);
	const months = DateHebrewUtils.INSTANCE.monthsOfYear(base, 'he-IL', false);
	const errors: Array<string> = [];
	if (months.length !== expectedLength) {
		errors.push(`month count ${months.length} != ${expectedLength}`);
	}
	let hasBc = false;
	let hasY10k = false;
	months.forEach((cell, index) => {
		const [year, month, day] = hebrewOf(cell.value);
		if (day !== 1) {
			errors.push(`[${index}] not first day of month: ${year}/${month}/${day}`);
		}
		if (year !== baseYear) {
			errors.push(`[${index}] year ${year} != base ${baseYear}`);
		}
		if (index > 0 && cell.offset !== months[index - 1].offset + 1) {
			errors.push(`[${index}] offset ${cell.offset} not consecutive after ${months[index - 1].offset}`);
		}
		if (cell.bc) {
			hasBc = true;
		}
		if (cell.y10k) {
			hasY10k = true;
		}
	});
	if (baseYear === 3761 && !hasBc) {
		errors.push('no bc flag on the partial year 3761');
	}
	if (baseYear === 13760 && !hasY10k) {
		errors.push('no y10k flag on the partial year 13760');
	}
	if (months.length > 0) {
		const last = months[months.length - 1];
		const [, lastMonth] = hebrewOf(last.value);
		if (expectedLength === 13 && lastMonth !== 13) {
			errors.push(`leap year: last cell is month ${lastMonth}, not 13`);
		}
		if (expectedLength === 13 && last.offset !== months[months.length - 2].offset + 1) {
			errors.push('leap year: appended 13th cell offset is not consecutive');
		}
		if (expectedLength === 12 && lastMonth === 13) {
			errors.push(`common year: unexpected month-13 cell (${lastMonth})`);
		}
	}
	return errors;
};

/**
 * Base dates, each with the expected cell count of its Hebrew year
 * (13 for leap years, 12 otherwise):
 * <ul>
 * <li>3761 (common) — bottom partial year, months 1-3 flagged bc</li>
 * <li>3762 (leap) — base in month 8: the 13th month is appended</li>
 * <li>3762 (leap) — base in month 13: the skeleton's grid already has 13 cells</li>
 * <li>5786 (common) and 5787 (leap, base in month 7) — modern years</li>
 * <li>13760 (common) — top partial year, months 3-12 flagged y10k</li>
 * </ul>
 */
const MONTHS_OF_YEAR_CASES: Array<{iso: string, expectedLength: number, note: string}> = [
	{iso: '0001-01-01', expectedLength: 12, note: 'partial year 3761, months 1-3 flagged bc'},
	{iso: '0002-04-01', expectedLength: 13, note: 'leap year 3762, base in month 8, 13th month appended'},
	{iso: '0002-09-01', expectedLength: 13, note: 'leap year 3762, base in month 13, no append needed'},
	{iso: '2026-05-01', expectedLength: 12, note: 'common year 5786'},
	{iso: '2027-03-15', expectedLength: 13, note: 'leap year 5787, base in month 7 (Adar II), 13th month appended'},
	{iso: '9999-12-31', expectedLength: 12, note: 'partial year 13760, months 3-12 flagged y10k'}
];

describe('Hebrew months panel', () => {
	beforeAll(() => {
		DateHebrewUtils.enable();
	});

	afterAll(() => {
		DateHebrewUtils.disable();
	});

	it.each(MONTHS_OF_YEAR_CASES)('monthsOfYear: $note ($iso)', ({iso, expectedLength}) => {
		expect(checkMonthsOfYear(iso, expectedLength)).toEqual([]);
	});
});

const PAGE_SIZE = DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE;
const CENTER_INDEX = Math.floor((PAGE_SIZE - 1) / 2);

/**
 * Verifies the years-panel invariants for a base date (base == current date):
 * <ol>
 * <li>page length equals {@link PAGE_SIZE}</li>
 * <li>every cell is the first day of its calendar year (month 1, day 1)</li>
 * <li>cell years are consecutive</li>
 * <li>the base-year cell has offset 0 and {@code thisYear} true; it sits at the
 *     page center unless the page is clamped at the calendar bounds</li>
 * <li>moving the base date by a cell's offset lands in the cell's Hebrew year
 *     (this mirrors what the UI does on click)</li>
 * </ol>
 *
 * @returns a list of violated invariants, empty when the page is correct
 */
const checkYearsAround = (iso: string): Array<string> => {
	const base = utcOf(iso);
	const [baseYear] = hebrewOf(base);
	const page = DateHebrewUtils.INSTANCE.yearsAround(base, base, 'he-IL', false);
	const errors: Array<string> = [];
	if (page.years.length !== PAGE_SIZE) {
		errors.push(`page length ${page.years.length} != ${PAGE_SIZE}`);
	}
	let foundBaseYear = false;
	let previousYear: number | null = null;
	page.years.forEach((cell, index) => {
		const [year, month, day] = hebrewOf(cell.value);
		if (month !== 1 || day !== 1) {
			errors.push(`[${index}] not Tishrei 1: ${year}/${month}/${day}`);
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
		const moved = DateMoveUtils.moveYear(DateUtils.asHxDate(base), cell.offset, 'he-IL', false);
		const [movedYear] = hebrewOf(DateUtils.asUtcDate(moved));
		if (movedYear !== year) {
			errors.push(`[${index}] offset ${cell.offset}: click lands Hebrew ${movedYear}, cell is ${year}`);
		}
	});
	if (!foundBaseYear) {
		errors.push(`base year ${baseYear} missing from page`);
	}
	return errors;
};

/**
 * Base dates covering the modern range, the era boundary, and both clamps:
 * <ul>
 * <li>3761 — bottom clamp (0001-01-01 = 3761/4/18); the page's first cell is 3761</li>
 * <li>3762 — leap year near the bottom clamp</li>
 * <li>3760 — before the epoch, in the previous century region</li>
 * <li>5786 (common) and 5787 (leap) — modern years</li>
 * <li>13760 — top clamp (9999-12-31 = 13760/2/28); the page's last cell is 13760</li>
 * </ul>
 */
const YEARS_AROUND_CASES: Array<{iso: string, note: string}> = [
	{iso: '2026-05-01', note: 'modern, common year 5786'},
	{iso: '2027-03-15', note: 'modern, leap year 5787 (base in month 7)'},
	{iso: '0621-07-18', note: 'Before-Hijra-era region, Hebrew 3760'},
	{iso: '0001-10-01', note: 'near the bottom clamp, Hebrew 3762'},
	{iso: '0002-04-01', note: 'leap year 3762'},
	{iso: '0001-01-01', note: 'bottom clamp, Hebrew 3761; first cell 3761 is expected'},
	{iso: '9999-05-01', note: 'near the top clamp, Hebrew 13760'},
	{iso: '9999-12-31', note: 'top clamp, Hebrew 13760; last cell 13760 is expected'}
];

describe('Hebrew years panel', () => {
	beforeAll(() => {
		DateHebrewUtils.enable();
	});

	afterAll(() => {
		DateHebrewUtils.disable();
	});

	it.each(YEARS_AROUND_CASES)('yearsAround: $note ($iso)', ({iso}) => {
		expect(checkYearsAround(iso)).toEqual([]);
	});
});
