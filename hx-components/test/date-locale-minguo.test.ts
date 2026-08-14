import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {
	DateLocaleFormatUtils,
	DateMinguoUtils,
	DateMoveUtils,
	UTCDate
} from '../src';

/**
 * Panel-data tests for the ROC (Minguo) calendar.
 *
 * <p>The years panel ({@link DateMinguoUtils#yearsAround}) shows a grid of
 * years around the base year; the months panel ({@link DateMinguoUtils#monthsOfYear})
 * shows the 12 months of the base year. Each cell holds the <b>first day of its
 * calendar year/month</b> in ICU semantics — the date may fall outside the
 * Gregorian [0001, 9999] range at the calendar edges (e.g. the partial first
 * year of the Minguo calendar), which is allowed since the years panel carries
 * no {@code bc}/{@code y10k} flags. The UI applies cell {@code offset} values
 * to the state date when a cell is clicked, it never uses the cell date
 * directly.</p>
 */

const PAGE_SIZE = DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE;
const CENTER_INDEX = Math.floor((PAGE_SIZE - 1) / 2);

/**
 * Formats a date in the ROC calendar as [year, month, day] with the internal
 * sign convention: negative for Before-Minguo (民國前), positive for Minguo.
 */
const rocOf = (date: UTCDate): Array<number> => {
	const [era, year, month, day] = DateLocaleFormatUtils.formatDateInNumeric(date, 'zh-TW', false);
	return [era === '民國前' ? -year : year, month, day];
};

const utcOf = (iso: string): UTCDate => {
	return UTCDate.of(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
};

/**
 * Verifies the years-panel invariants for a base date (base == current date):
 * <ol>
 * <li>page length equals {@link PAGE_SIZE}</li>
 * <li>every cell is the first day of its calendar year (month 1, day 1)</li>
 * <li>cell years are consecutive (the -1 → 1 era transition spans one year,
 *     since there is no year 0)</li>
 * <li>the base-year cell has offset 0 and {@code thisYear} true; it sits at the
 *     page center unless the page is clamped at the calendar bounds</li>
 * <li>moving the base date by a cell's offset lands in the cell's ROC year
 *     (this mirrors what the UI does on click)</li>
 * </ol>
 *
 * @returns a list of violated invariants, empty when the page is correct
 */
const checkYearsAround = (iso: string): Array<string> => {
	const base = utcOf(iso);
	const [baseYear] = rocOf(base);
	const page = DateMinguoUtils.INSTANCE.yearsAround(base, base, 'zh-TW', false);
	const errors: Array<string> = [];
	if (page.years.length !== PAGE_SIZE) {
		errors.push(`page length ${page.years.length} != ${PAGE_SIZE}`);
	}
	let foundBaseYear = false;
	let previousYear: number | null = null;
	page.years.forEach((cell, index) => {
		const [year, month, day] = rocOf(cell.value);
		if (month !== 1 || day !== 1) {
			errors.push(`[${index}] not Jan 1: ${year}/${month}/${day}`);
		}
		if (previousYear != null) {
			const step = year - previousYear;
			if (step !== 1 && !(previousYear === -1 && year === 1)) {
				errors.push(`[${index}] year jump ${previousYear} -> ${year}`);
			}
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
		const moved = DateMoveUtils.moveYear(DateMoveUtils.asHxDate(base), cell.offset, 'zh-TW', false);
		const [movedYear] = rocOf(DateMoveUtils.asJsDate(moved));
		if (movedYear !== year) {
			errors.push(`[${index}] offset ${cell.offset}: click lands ROC ${movedYear}, cell is ${year}`);
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
	const [baseYear] = rocOf(base);
	const months = DateMinguoUtils.INSTANCE.monthsOfYear(base, 'zh-TW', false);
	const errors: Array<string> = [];
	if (months.length !== 12) {
		errors.push(`month count ${months.length} != 12`);
	}
	months.forEach((cell, index) => {
		const [year, month, day] = rocOf(cell.value);
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
	{iso: '2026-05-01', note: 'modern, Minguo 115'},
	{iso: '1911-06-01', note: 'page crosses era boundary, base ROC -1'},
	{iso: '1892-06-01', note: 'before era boundary, base ROC -20'},
	{iso: '1912-06-01', note: 'page crosses era boundary, base ROC 1'},
	{iso: '1900-05-01', note: 'before era boundary, base ROC -12'},
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
	{iso: '0001-06-01', note: 'bottom clamp, ROC -1911'},
	{iso: '0001-01-03', note: 'bottom clamp, earliest representable date'},
	{iso: '0002-06-01', note: 'page includes the bottom clamp, ROC -1910'},
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
	{iso: '9999-05-01', note: 'top clamp, ROC 8088'}
];

const MONTHS_OF_YEAR_CASES: Array<{iso: string, note: string}> = [
	{iso: '2026-05-01', note: 'modern'},
	{iso: '1582-10-15', note: 'the 21-day short month'},
	{iso: '1582-11-01', note: 'post-reform month of the reform year'},
	{iso: '0001-06-01', note: 'bottom partial year'},
	{iso: '9999-05-01', note: 'top partial year'}
];

describe('Minguo years panel', () => {
	beforeAll(() => {
		DateMinguoUtils.enable();
	});

	afterAll(() => {
		DateMinguoUtils.disable();
	});

	it.each(YEARS_AROUND_CASES)('yearsAround: $note ($iso)', ({iso}) => {
		expect(checkYearsAround(iso)).toEqual([]);
	});
});

describe('Minguo months panel', () => {
	beforeAll(() => {
		DateMinguoUtils.enable();
	});

	afterAll(() => {
		DateMinguoUtils.disable();
	});

	it.each(MONTHS_OF_YEAR_CASES)('monthsOfYear: $note ($iso)', ({iso}) => {
		expect(checkMonthsOfYear(iso)).toEqual([]);
	});
});
