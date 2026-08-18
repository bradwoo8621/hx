import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {
	DateEthiopicUtils,
	DateLocaleFormatUtils,
	DateMoveUtils,
	DateUtils,
	UTCDate
} from '../src';

/**
 * Panel-data tests for the Ethiopic calendar.
 *
 * <p>Implements its own panel functions (13 × 30-day months plus the 5/6-day
 * intercalary month 13, Pagumēn) on top of the shared
 * {@link DateLocaleNotGregorianHelper} skeleton. The Ethiopic calendar has no
 * year 0 and uses all-positive year numbers: B.I. 5493–5500 (Before
 * Incarnation) followed directly by A.I. 1+. The formatter returns a positive
 * year for both eras, so cells are matched by {@code [era, year]} where the
 * era is {@code "ዓ.ዓ."} / {@code "A.A."} (Before Incarnation) or an empty
 * string (Anno Incarnationis). The years-panel offsets map B.I. years into the
 * continuous arithmetic space (N − 5500), so a B.I. cell against an A.I. base
 * year yields a negative offset that the move provider maps back to the same
 * B.I. year on click. Cell dates hold the first day of their calendar
 * year/month in ICU semantics and may fall outside the Gregorian [0001, 9999]
 * range at the calendar edges (the bottom-clamped page anchors its first cell
 * at 5493/1/1, Gregorian 1 BCE 8/27).</p>
 */

const PAGE_SIZE = DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE;
const CENTER_INDEX = Math.floor((PAGE_SIZE - 1) / 2);

/** Formats a date in the Ethiopic calendar as [era, year, month, day]. */
const ethiopicOf = (date: UTCDate): [string, number, number, number] => {
	return DateLocaleFormatUtils.formatDateInNumeric(date, 'am-ET', false);
};

const utcOf = (iso: string): UTCDate => {
	return UTCDate.of(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
};

/**
 * Verifies the years-panel invariants for a base date (base == current date):
 * <ol>
 * <li>page length equals {@link PAGE_SIZE}</li>
 * <li>every cell is the first day of its calendar year (month 1, day 1)</li>
 * <li>cell Gregorian years are consecutive (year numbers jump at the no-year-0
 *     era boundary, e.g. 5500 → 1, so the dates are checked instead)</li>
 * <li>the base-year cell has offset 0 and {@code thisYear} true; it sits at the
 *     page center unless the page is clamped at the calendar bounds</li>
 * <li>moving the base date by a cell's offset lands in the cell's era and year
 *     (this mirrors what the UI does on click)</li>
 * </ol>
 *
 * @returns a list of violated invariants, empty when the page is correct
 */
const checkYearsAround = (iso: string): Array<string> => {
	const base = utcOf(iso);
	const [baseEra, baseYear] = ethiopicOf(base);
	const page = DateEthiopicUtils.INSTANCE.yearsAround(base, base, 'am-ET', false);
	const errors: Array<string> = [];
	if (page.years.length !== PAGE_SIZE) {
		errors.push(`page length ${page.years.length} != ${PAGE_SIZE}`);
	}
	let foundBaseYear = false;
	let previousGregorianYear: number | null = null;
	page.years.forEach((cell, index) => {
		const [era, year, month, day] = ethiopicOf(cell.value);
		if (month !== 1 || day !== 1) {
			errors.push(`[${index}] not month 1 day 1: ${year}/${month}/${day}`);
		}
		const gregorianYear = cell.value.getFullYear();
		if (previousGregorianYear != null && gregorianYear !== previousGregorianYear + 1) {
			errors.push(`[${index}] Gregorian year jump ${previousGregorianYear} -> ${gregorianYear}`);
		}
		previousGregorianYear = gregorianYear;
		if (era === baseEra && year === baseYear) {
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
		const moved = DateMoveUtils.moveYear(DateUtils.asHxDate(base), cell.offset, 'am-ET', false);
		const [movedEra, movedYear] = ethiopicOf(DateUtils.asUtcDate(moved));
		if (movedEra !== era || movedYear !== year) {
			errors.push(`[${index}] offset ${cell.offset}: click lands ${movedEra}/${movedYear}, cell is ${era}/${year}`);
		}
	});
	if (!foundBaseYear) {
		errors.push(`base ${baseEra}/${baseYear} missing from page`);
	}
	return errors;
};

/**
 * Verifies the months-panel invariants for a base date:
 * <ol>
 * <li>13 month cells</li>
 * <li>every cell is the first day of its calendar month</li>
 * <li>every cell belongs to the base year</li>
 * <li>the partial years 5493 (months 1-4 missing) and 9992 (months 3-13
 *     missing) carry the {@code bc} / {@code y10k} flags</li>
 * </ol>
 *
 * @returns a list of violated invariants, empty when the panel is correct
 */
const checkMonthsOfYear = (iso: string): Array<string> => {
	const base = utcOf(iso);
	const [baseEra, baseYear] = ethiopicOf(base);
	const months = DateEthiopicUtils.INSTANCE.monthsOfYear(base, 'am-ET', false);
	const errors: Array<string> = [];
	if (months.length !== 13) {
		errors.push(`month count ${months.length} != 13`);
	}
	let hasBc = false;
	let hasY10k = false;
	months.forEach((cell, index) => {
		const [era, year, month, day] = ethiopicOf(cell.value);
		if (day !== 1) {
			errors.push(`[${index}] not first day of month: ${year}/${month}/${day}`);
		}
		if (era !== baseEra || year !== baseYear) {
			errors.push(`[${index}] ${era}/${year} != base ${baseEra}/${baseYear}`);
		}
		if (cell.bc) {
			hasBc = true;
		}
		if (cell.y10k) {
			hasY10k = true;
		}
	});
	if (baseEra === 'ዓ.ዓ.' && baseYear === 5493 && !hasBc) {
		errors.push('no bc flag on the partial year 5493');
	}
	if (baseEra === '' && baseYear === 9992 && !hasY10k) {
		errors.push('no y10k flag on the partial year 9992');
	}
	return errors;
};

describe('Ethiopic years panel', () => {
	beforeAll(() => {
		DateEthiopicUtils.enable();
	});

	afterAll(() => {
		DateEthiopicUtils.disable();
	});

	it.each([
		{iso: '2026-01-01', note: 'modern, A.I. 2018'},
		{iso: '0008-08-27', note: 'era boundary: A.I. 1, page shows B.I. 5493..A.I. 17'},
		{iso: '0008-08-26', note: 'last day of B.I. 5500'},
		{iso: '0001-01-01', note: 'bottom clamp, B.I. 5493; first cell 5493/1/1 = 1 BCE 8/27 is expected'},
		{iso: '0001-08-01', note: 'base inside B.I. 5493 (ICU full year)'},
		{iso: '0002-06-01', note: 'page includes the bottom clamp, B.I. 5494'},
		{iso: '9999-12-31', note: 'top clamp, A.I. 9992'},
		{iso: '9999-11-01', note: 'page includes the top clamp, A.I. 9991'}
	])('yearsAround: $note ($iso)', ({iso}) => {
		expect(checkYearsAround(iso)).toEqual([]);
	});
});

describe('Ethiopic months panel', () => {
	beforeAll(() => {
		DateEthiopicUtils.enable();
	});

	afterAll(() => {
		DateEthiopicUtils.disable();
	});

	it.each([
		{iso: '2026-01-01', note: 'modern'},
		{iso: '0001-01-01', note: 'partial year 5493, months 1-4 flagged bc'},
		{iso: '9999-12-31', note: 'partial year 9992, months 3-13 flagged y10k'}
	])('monthsOfYear: $note ($iso)', ({iso}) => {
		expect(checkMonthsOfYear(iso)).toEqual([]);
	});
});

describe('Ethiopic era labels', () => {
	beforeAll(() => {
		DateEthiopicUtils.enable();
	});

	afterAll(() => {
		DateEthiopicUtils.disable();
	});

	it('returns the era abbreviation per language for Before-Incarnation, empty for Anno Incarnationis', () => {
		const before = UTCDate.of(1, 0, 1); // Gregorian 0001/01/01 = B.I. 5493
		const after = UTCDate.of(2026, 0, 1); // Gregorian 2026/01/01 = A.I. 2018
		expect(DateEthiopicUtils.INSTANCE.eraAs(before, () => [], 'am-ET')).toBe('ዓ.ዓ.');
		expect(DateEthiopicUtils.INSTANCE.eraAs(before, () => [], 'ti-ET')).toBe('A.A.');
		expect(DateEthiopicUtils.INSTANCE.eraAs(after, () => [], 'am-ET')).toBe('');
		expect(DateEthiopicUtils.INSTANCE.eraAs(after, () => [], 'ti-ET')).toBe('');
	});

	it('round-trips a Before-Incarnation date through the move provider', () => {
		// B.I. 5493/05/08 = Gregorian 0001/01/01; moving forward 8 years crosses
		// the no-year-0 boundary and lands on A.I. 1/05/08 (the month/day of the
		// base date are preserved)
		const across = DateMoveUtils.moveYear(DateUtils.asHxDate(UTCDate.of(1, 0, 1)), 8, 'am-ET', false);
		expect(ethiopicOf(DateUtils.asUtcDate(across))).toEqual(['', 1, 5, 8]);
		// and backward from A.I. 1/01/01 lands back on B.I. 5493, clamped to the
		// earliest representable month/day (5493/05/08 = Gregorian 0001/01/01)
		const back = DateMoveUtils.moveYear(DateUtils.asHxDate(UTCDate.of(8, 7, 27)), -8, 'am-ET', false);
		expect(ethiopicOf(DateUtils.asUtcDate(back))).toEqual(['ዓ.ዓ.', 5493, 5, 8]);
	});
});
