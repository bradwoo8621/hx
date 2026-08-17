import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {
	DateCopticUtils,
	DateLocaleFormatUtils,
	DateMoveUtils,
	DateUtils,
	UTCDate
} from '../src';

/**
 * Panel-data tests for the Coptic calendar.
 *
 * <p>Implements its own panel functions (13 × 30-day months plus the 5/6-day
 * intercalary month 13) on top of the shared
 * {@link DateLocaleNotGregorianHelper} skeleton. The Coptic calendar has no
 * year 0: Before-Diocletian years are negated (−1 … −284) and Anno Martyrum
 * years are positive (1 … 9716). The formatter returns a positive year for
 * both eras, so cells are matched by {@code [era, year]} where the era is
 * {@code "ق.د"} (Before Diocletian) or an empty string (Anno Martyrum).
 * Cell dates hold the first day of their calendar year/month in ICU
 * semantics and may fall outside the Gregorian [0001, 9999] range at the
 * calendar edges (the bottom-clamped page anchors its first cell at −284/1/1,
 * Gregorian 1 BCE 8/29).</p>
 */

const PAGE_SIZE = DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE;
const CENTER_INDEX = Math.floor((PAGE_SIZE - 1) / 2);

/** Formats a date in the Coptic calendar as [era, year, month, day]. */
const copticOf = (date: UTCDate): [string, number, number, number] => {
	return DateLocaleFormatUtils.formatDateInNumeric(date, 'ar-EG', false);
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
 *     era boundary, e.g. −1 → 1, so the dates are checked instead)</li>
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
	const [baseEra, baseYear] = copticOf(base);
	const page = DateCopticUtils.INSTANCE.yearsAround(base, base, 'ar-EG', false);
	const errors: Array<string> = [];
	if (page.years.length !== PAGE_SIZE) {
		errors.push(`page length ${page.years.length} != ${PAGE_SIZE}`);
	}
	let foundBaseYear = false;
	let previousGregorianYear: number | null = null;
	page.years.forEach((cell, index) => {
		const [era, year, month, day] = copticOf(cell.value);
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
		const moved = DateMoveUtils.moveYear(DateMoveUtils.asHxDate(base), cell.offset, 'ar-EG', false);
		const [movedEra, movedYear] = copticOf(DateMoveUtils.asJsDate(moved));
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
 * <li>the partial years −284 (months 1-4 missing) and 9716 (months 3-13
 *     missing) carry the {@code bc} / {@code y10k} flags</li>
 * </ol>
 *
 * @returns a list of violated invariants, empty when the panel is correct
 */
const checkMonthsOfYear = (iso: string): Array<string> => {
	const base = utcOf(iso);
	const [baseEra, baseYear] = copticOf(base);
	const months = DateCopticUtils.INSTANCE.monthsOfYear(base, 'ar-EG', false);
	const errors: Array<string> = [];
	if (months.length !== 13) {
		errors.push(`month count ${months.length} != 13`);
	}
	let hasBc = false;
	let hasY10k = false;
	months.forEach((cell, index) => {
		const [era, year, month, day] = copticOf(cell.value);
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
	if (baseEra === 'ق.د' && baseYear === 284 && !hasBc) {
		errors.push('no bc flag on the partial year -284');
	}
	if (baseEra === '' && baseYear === 9716 && !hasY10k) {
		errors.push('no y10k flag on the partial year 9716');
	}
	return errors;
};

describe('Coptic years panel', () => {
	beforeAll(() => {
		DateCopticUtils.enable();
	});

	afterAll(() => {
		DateCopticUtils.disable();
	});

	it.each([
		{iso: '2026-01-01', note: 'modern, A.M. 1742'},
		{iso: '0284-08-29', note: 'era boundary: A.M. 1, page shows B.D. 12..A.M. 13'},
		{iso: '0283-08-30', note: 'era boundary other side: B.D. 1'},
		{iso: '0001-01-01', note: 'bottom clamp, B.D. -284; first cell -284/1/1 = 1 BCE 8/29 is expected'},
		{iso: '0001-08-01', note: 'base inside B.D. -284 (ICU full year)'},
		{iso: '0002-06-01', note: 'page includes the bottom clamp, B.D. -283'},
		{iso: '9999-12-31', note: 'top clamp, A.M. 9716'},
		{iso: '9999-11-01', note: 'page includes the top clamp, A.M. 9715'}
	])('yearsAround: $note ($iso)', ({iso}) => {
		expect(checkYearsAround(iso)).toEqual([]);
	});
});

describe('Coptic months panel', () => {
	beforeAll(() => {
		DateCopticUtils.enable();
	});

	afterAll(() => {
		DateCopticUtils.disable();
	});

	it.each([
		{iso: '2026-01-01', note: 'modern'},
		{iso: '0001-01-01', note: 'partial year -284, months 1-4 flagged bc'},
		{iso: '9999-12-31', note: 'partial year 9716, months 3-13 flagged y10k'}
	])('monthsOfYear: $note ($iso)', ({iso}) => {
		expect(checkMonthsOfYear(iso)).toEqual([]);
	});
});

describe('Coptic era labels', () => {
	beforeAll(() => {
		DateCopticUtils.enable();
	});

	afterAll(() => {
		DateCopticUtils.disable();
	});

	it('returns ق.د for Before-Diocletian and an empty string for Anno Martyrum', () => {
		const before = UTCDate.of(1, 0, 1); // Gregorian 0001/01/01 = B.D. -284
		const after = UTCDate.of(2026, 0, 1); // Gregorian 2026/01/01 = A.M. 1742
		expect(DateCopticUtils.INSTANCE.eraAs(before, () => [], 'ar-EG')).toBe('ق.د');
		expect(DateCopticUtils.INSTANCE.eraAs(after, () => [], 'ar-EG')).toBe('');
	});

	it('round-trips a Before-Diocletian date through the move provider', () => {
		// B.D. -283/05/08 = Gregorian 0002/01/01; moving back 1 year lands on B.D. -284/05/08
		const moved = DateMoveUtils.moveYear(DateUtils.asHxDate(UTCDate.of(2, 0, 1)), -1, 'ar-EG', false);
		expect(copticOf(DateMoveUtils.asJsDate(moved))).toEqual(['ق.د', 284, 5, 8]);
		// and forward across the no-year-0 boundary: B.D. -1 → A.M. 1
		const across = DateMoveUtils.moveYear(DateUtils.asHxDate(UTCDate.of(283, 7, 30)), 1, 'ar-EG', false);
		expect(copticOf(DateMoveUtils.asJsDate(across))).toEqual(['', 1, 1, 1]);
	});
});
