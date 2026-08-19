import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {DateLocaleFormatUtils, DateMoveUtils, DatePersianUtils, DateUtils, UTCDate} from '../src';

/**
 * Panel-data tests for the Persian (Solar Hijri) calendar.
 *
 * <p>Implements its own panel functions (the Persian year starts on Farvardin 1,
 * ~March 21 of the Gregorian year, and months follow the 31/31/31/31/31/31/
 * 30/30/30/30/30/29-30-day pattern) on top of the shared
 * {@link DateLocaleNotGregorianHelper} skeleton. The Persian calendar is
 * continuous with no year-0 gap; the calendar bounds are [-621, 9378]. Cell
 * dates hold the first day of their calendar year/month in ICU semantics and
 * may fall outside the Gregorian [0001, 9999] range at the calendar edges.</p>
 *
 * <p>The bottom-clamped page anchors its first cell at ICU's Persian −621/1/1
 * (Gregorian 1 BCE 3/21): ICU represents −621 as a full year while the move
 * semantics start it at −621/10/11 (Gregorian 1 CE 1/1). The cell date falling
 * before the calendar minimum is expected — same pattern as the Saka −78/1/1
 * and Minguo −1911/1/1 anchors — and clicking uses the cell offset, never the
 * cell date.</p>
 */

const PAGE_SIZE = DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE;
const CENTER_INDEX = Math.floor((PAGE_SIZE - 1) / 2);

/** Formats a date in the Persian calendar as [year, month, day] (year is negative for Before-Hijra). */
const persianOf = (date: UTCDate): Array<number> => {
	const [, year, month, day] = DateLocaleFormatUtils.formatDateInNumeric(date, 'fa-IR', false);
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
 * <li>moving the base date by a cell's offset lands in the cell's Persian year
 *     (this mirrors what the UI does on click)</li>
 * </ol>
 *
 * @returns a list of violated invariants, empty when the page is correct
 */
const checkYearsAround = (iso: string): Array<string> => {
	const base = utcOf(iso);
	const [baseYear] = persianOf(base);
	const page = DatePersianUtils.INSTANCE.yearsAround(base, base, 'fa-IR', false);
	const errors: Array<string> = [];
	if (page.years.length !== PAGE_SIZE) {
		errors.push(`page length ${page.years.length} != ${PAGE_SIZE}`);
	}
	let foundBaseYear = false;
	let previousYear: number | null = null;
	page.years.forEach((cell, index) => {
		const [year, month, day] = persianOf(cell.value);
		if (month !== 1 || day !== 1) {
			errors.push(`[${index}] not Farvardin 1: ${year}/${month}/${day}`);
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
		const moved = DateMoveUtils.moveYear(DateUtils.asHxDate(base), cell.offset, 'fa-IR', false);
		const [movedYear] = persianOf(DateUtils.asUtcDate(moved));
		if (movedYear !== year) {
			errors.push(`[${index}] offset ${cell.offset}: click lands Persian ${movedYear}, cell is ${year}`);
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
 * <li>the partial years −621 (months 1-9 missing) and 9378 (months 11-12
 *     missing) carry the {@code bc} / {@code y10k} flags</li>
 * </ol>
 *
 * @returns a list of violated invariants, empty when the panel is correct
 */
const checkMonthsOfYear = (iso: string): Array<string> => {
	const base = utcOf(iso);
	const [baseYear] = persianOf(base);
	const months = DatePersianUtils.INSTANCE.monthsOfYear(base, 'fa-IR', false);
	const errors: Array<string> = [];
	if (months.length !== 12) {
		errors.push(`month count ${months.length} != 12`);
	}
	let hasBc = false;
	let hasY10k = false;
	months.forEach((cell, index) => {
		const [year, month, day] = persianOf(cell.value);
		if (day !== 1) {
			errors.push(`[${index}] not first day of month: ${year}/${month}/${day}`);
		}
		if (year !== baseYear) {
			errors.push(`[${index}] year ${year} != base ${baseYear}`);
		}
		if (cell.bc) {
			hasBc = true;
		}
		if (cell.y10k) {
			hasY10k = true;
		}
	});
	if (baseYear === -621 && !hasBc) {
		errors.push('no bc flag on the partial year -621');
	}
	if (baseYear === 9378 && !hasY10k) {
		errors.push('no y10k flag on the partial year 9378');
	}
	return errors;
};

const YEARS_AROUND_CASES: Array<{ iso: string, note: string }> = [
	{iso: '2026-05-01', note: 'modern'},
	{iso: '1583-01-01', note: 'crosses the 1582 reform (Persian has no short month)'},
	{iso: '1584-05-01', note: 'crosses the 1582 reform'},
	{iso: '1594-05-01', note: 'fully post-reform'},
	{iso: '1582-11-01', note: 'reform year, November'},
	{iso: '1582-10-15', note: 'reform year, mid-October'},
	{iso: '1000-05-01', note: 'Persian 379'},
	{iso: '0491-12-11', note: 'Before-Hijra era'},
	{iso: '0312-05-01', note: 'Before-Hijra era'},
	{iso: '0312-05-02', note: 'Before-Hijra era, day 2'},
	{iso: '0512-05-02', note: 'Before-Hijra era'},
	{iso: '0612-06-03', note: 'Before-Hijra era'},
	{iso: '0712-07-04', note: 'Before-Hijra era'},
	{iso: '0812-08-05', note: 'Before-Hijra era'},
	{iso: '1212-12-07', note: 'Before-Hijra era'},
	{iso: '1512-11-10', note: 'Before-Hijra era'},
	{iso: '0001-06-01', note: 'bottom clamp, Persian -620; first cell -621/1/1 = 1 BCE 3/21 is expected'},
	{iso: '0001-03-01', note: 'base inside Persian -621 (ICU full year)'},
	{iso: '0002-06-01', note: 'page includes the bottom clamp, Persian -619'},
	{iso: '9999-05-01', note: 'top clamp, Persian 9378'},
	{iso: '9998-05-01', note: 'page includes the top clamp, Persian 9377'}
];

const MONTHS_OF_YEAR_CASES: Array<{ iso: string, note: string }> = [
	{iso: '2026-05-01', note: 'modern'},
	{iso: '1582-10-15', note: 'reform year (Persian has no short month)'},
	{iso: '0001-03-01', note: 'partial year -621, months 1-9 flagged bc'},
	{iso: '9999-12-01', note: 'partial year 9378, months 11-12 flagged y10k'},
	{iso: '9999-05-01', note: 'top partial year'}
];

describe('Persian years panel', () => {
	beforeAll(() => {
		DatePersianUtils.enable();
	});

	afterAll(() => {
		DatePersianUtils.disable();
	});

	it.each(YEARS_AROUND_CASES)('yearsAround: $note ($iso)', ({iso}) => {
		expect(checkYearsAround(iso)).toEqual([]);
	});
});

describe('Persian months panel', () => {
	beforeAll(() => {
		DatePersianUtils.enable();
	});

	afterAll(() => {
		DatePersianUtils.disable();
	});

	it.each(MONTHS_OF_YEAR_CASES)('monthsOfYear: $note ($iso)', ({iso}) => {
		expect(checkMonthsOfYear(iso)).toEqual([]);
	});
});

/**
 * ICU leap-correction alignment tests.
 *
 * <p>ICU (persncal.cpp) applies a leap-day shift table for Persian years
 * 1502–2987: each entry X makes year X common and year X+1 leap, moving the
 * leap day one year forward relative to the plain mod-33 rule. The move
 * provider must agree with the formatter (Intl) on these years.</p>
 */
describe('Persian leap correction (ICU alignment)', () => {
	beforeAll(() => {
		DatePersianUtils.enable();
	});

	afterAll(() => {
		DatePersianUtils.disable();
	});

	it('isLeapYear applies the correction table (1502 common, 1503 leap)', () => {
		expect(DatePersianUtils.isLeapYear(1502)).toBe(false);
		expect(DatePersianUtils.isLeapYear(1503)).toBe(true);
		// outside the correction range the base mod-33 rule holds
		expect(DatePersianUtils.isLeapYear(1501)).toBe(false);
		// the table ends at 2987: 2988 is leap (entry 2987 + 1), 2989 common
		expect(DatePersianUtils.isLeapYear(2988)).toBe(true);
		expect(DatePersianUtils.isLeapYear(2989)).toBe(false);
		expect(DatePersianUtils.isLeapYear(2992)).toBe(true);
	});

	it('renders the corrected Esfand lengths (Case A / Case B)', () => {
		// 1502 is common: Esfand ends at 2124-03-19, Nowruz 1503 is 2124-03-20
		expect(persianOf(utcOf('2124-03-19'))).toEqual([1502, 12, 29]);
		expect(persianOf(utcOf('2124-03-20'))).toEqual([1503, 1, 1]);
		// 1503 is leap: Esfand has a real day 30 at 2125-03-20
		expect(persianOf(utcOf('2125-03-20'))).toEqual([1503, 12, 30]);
	});

	it('moveYear lands on the ICU-consistent date across the correction boundary', () => {
		// from 2362/10/16 (2984-01-06), moving back one year must land on
		// 2361/10/16 = 2983-01-05, not the mod-33 2983-01-06
		const moved = DateMoveUtils.moveYear(DateUtils.asHxDate(utcOf('2984-01-06')), -1, 'fa-IR', false);
		expect(persianOf(DateUtils.asUtcDate(moved))).toEqual([2361, 10, 16]);
		expect(DateUtils.asUtcDate(moved).toISOString().slice(0, 10)).toBe('2983-01-05');
	});

	it('moveYear keeps Esfand 30 only into leap years (1502/12/30 clamps to 12/29)', () => {
		// moving back from 1503/12/30 (leap) to 1502 (common) clamps the day to 29
		const moved = DateMoveUtils.moveYear(DateUtils.asHxDate(utcOf('2125-03-20')), -1, 'fa-IR', false);
		expect(persianOf(DateUtils.asUtcDate(moved))).toEqual([1502, 12, 29]);
		expect(DateUtils.asUtcDate(moved).toISOString().slice(0, 10)).toBe('2124-03-19');
	});
});
