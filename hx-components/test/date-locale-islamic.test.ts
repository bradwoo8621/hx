import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {
	DateIslamicCivilUtils,
	DateIslamicUmalquraUtils,
	DateIslamicUtils,
	DateLocaleFormatUtils,
	DateMoveUtils,
	DateUtils,
	HxLanguageCode,
	UTCDate,
	type ComputedMonths,
	type ComputedYears
} from '../src';

/**
 * Panel-data tests for the three Islamic calendars.
 *
 * <p>The Islamic lunar year is 354/355 days (months of 29 or 30 days), so the
 * months and years panels use calendar-specific first-day walking on top of
 * the shared {@link DateLocaleNotGregorianHelper} skeleton: the months panel
 * steps 30 days per month, the years panel 353 days per year with a month
 * back-off. The three variants — 'islamic' (tabular, ar-DZ), 'islamic-civil'
 * (ar-AE) and 'islamic-umalqura' (ar-SA) — differ only in their epoch day and
 * month-length table. The calendar bounds are [-640, 9666]: year −640 is
 * partial (months 1–4 are before the epoch) and year 9666 is partial (months
 * 5–12 are beyond Gregorian 9999). Cell dates hold the first day of their
 * calendar year/month in ICU semantics.</p>
 *
 * <p>The bottom-clamped page anchors its first cell at ICU's Islamic −640/1/1
 * (Gregorian 1 BCE 8/17), before the calendar's first representable days —
 * expected, same pattern as the Persian −621/1/1 anchor — and clicking uses
 * the cell offset, never the cell date.</p>
 */

const PAGE_SIZE = DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE;
const CENTER_INDEX = Math.floor((PAGE_SIZE - 1) / 2);

/** The panel entry points of an Islamic locale provider. */
type IslamicPanelUtils = {
	yearsAround(baseDate: UTCDate, currentDate: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedYears;
	monthsOfYear(somedayOfYear: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths;
};

/** Formats a date in the given Islamic calendar as [year, month, day] (year is negative for Before-Hijra). */
const islamicOf = (date: UTCDate, lang: HxLanguageCode): Array<number> => {
	const [, year, month, day] = DateLocaleFormatUtils.formatDateInNumeric(date, lang, false);
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
 * <li>moving the base date by a cell's offset lands in the cell's Islamic year
 *     (this mirrors what the UI does on click)</li>
 * </ol>
 *
 * @returns a list of violated invariants, empty when the page is correct
 */
const checkYearsAround = (iso: string, lang: HxLanguageCode, utils: IslamicPanelUtils): Array<string> => {
	const base = utcOf(iso);
	const [baseYear] = islamicOf(base, lang);
	const page = utils.yearsAround(base, base, lang, false);
	const errors: Array<string> = [];
	if (page.years.length !== PAGE_SIZE) {
		errors.push(`page length ${page.years.length} != ${PAGE_SIZE}`);
	}
	let foundBaseYear = false;
	let previousYear: number | null = null;
	page.years.forEach((cell, index) => {
		const [year, month, day] = islamicOf(cell.value, lang);
		if (month !== 1 || day !== 1) {
			errors.push(`[${index}] not Muharram 1: ${year}/${month}/${day}`);
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
		const moved = DateMoveUtils.moveYear(DateUtils.asHxDate(base), cell.offset, lang, false);
		const [movedYear] = islamicOf(DateUtils.asUtcDate(moved), lang);
		if (movedYear !== year) {
			errors.push(`[${index}] offset ${cell.offset}: click lands Islamic ${movedYear}, cell is ${year}`);
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
 * <li>the partial years −640 (months 1-4 missing) and 9666 (months 5-12
 *     missing) carry the {@code bc} / {@code y10k} flags</li>
 * </ol>
 *
 * @returns a list of violated invariants, empty when the panel is correct
 */
const checkMonthsOfYear = (iso: string, lang: HxLanguageCode, utils: IslamicPanelUtils): Array<string> => {
	const base = utcOf(iso);
	const [baseYear] = islamicOf(base, lang);
	const months = utils.monthsOfYear(base, lang, false);
	const errors: Array<string> = [];
	if (months.length !== 12) {
		errors.push(`month count ${months.length} != 12`);
	}
	let hasBc = false;
	let hasY10k = false;
	months.forEach((cell, index) => {
		const [year, month, day] = islamicOf(cell.value, lang);
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
	if (baseYear === -640 && !hasBc) {
		errors.push('no bc flag on the partial year -640');
	}
	if (baseYear === 9666 && !hasY10k) {
		errors.push('no y10k flag on the partial year 9666');
	}
	return errors;
};

const YEARS_AROUND_CASES: Array<{iso: string, note: string}> = [
	{iso: '2026-05-01', note: 'modern'},
	{iso: '2024-07-06', note: 'modern, July 2024'},
	{iso: '0622-07-18', note: 'AH 1 era boundary'},
	{iso: '0621-07-18', note: 'year 0'},
	{iso: '0491-12-11', note: 'Before-Hijra era'},
	{iso: '0001-06-01', note: 'bottom clamp region, Islamic -640'},
	{iso: '0001-01-01', note: 'bottom clamp, year -640; first cell -640/1/1 = 1 BCE 8/17 is expected'},
	{iso: '0002-06-01', note: 'page includes the bottom clamp, Islamic -639'},
	{iso: '9999-12-31', note: 'top clamp, Islamic 9666'},
	{iso: '9999-05-01', note: 'top region, Islamic 9665'},
	{iso: '9998-05-01', note: 'page includes the top clamp, Islamic 9665'}
];

const MONTHS_OF_YEAR_CASES: Array<{iso: string, note: string}> = [
	{iso: '2026-05-01', note: 'modern'},
	{iso: '2024-07-06', note: 'modern, July 2024'},
	{iso: '0001-01-01', note: 'partial year -640, months 1-4 flagged bc'},
	{iso: '9999-12-31', note: 'partial year 9666, months 5-12 flagged y10k'},
	{iso: '9999-05-01', note: 'top partial year region'}
];

/** The three Islamic calendar variants: provider instance, locale and enable/disable hooks. */
const ISLAMIC_VARIANTS: Array<{
	name: string,
	lang: HxLanguageCode,
	utils: IslamicPanelUtils,
	enable: () => void,
	disable: () => void
}> = [
	{
		name: 'islamic (ar-DZ)', lang: 'ar-DZ', utils: DateIslamicUtils.INSTANCE,
		enable: () => DateIslamicUtils.enable(), disable: () => DateIslamicUtils.disable()
	},
	{
		name: 'islamic-civil (ar-AE)', lang: 'ar-AE', utils: DateIslamicCivilUtils.INSTANCE,
		enable: () => DateIslamicCivilUtils.enable(), disable: () => DateIslamicCivilUtils.disable()
	},
	{
		name: 'islamic-umalqura (ar-SA)', lang: 'ar-SA', utils: DateIslamicUmalquraUtils.INSTANCE,
		enable: () => DateIslamicUmalquraUtils.enable(), disable: () => DateIslamicUmalquraUtils.disable()
	}
];

ISLAMIC_VARIANTS.forEach(variant => {
	describe(`${variant.name} years panel`, () => {
		beforeAll(() => {
			variant.enable();
		});

		afterAll(() => {
			variant.disable();
		});

		it.each(YEARS_AROUND_CASES)('yearsAround: $note ($iso)', ({iso}) => {
			expect(checkYearsAround(iso, variant.lang, variant.utils)).toEqual([]);
		});
	});

	describe(`${variant.name} months panel`, () => {
		beforeAll(() => {
			variant.enable();
		});

		afterAll(() => {
			variant.disable();
		});

		it.each(MONTHS_OF_YEAR_CASES)('monthsOfYear: $note ($iso)', ({iso}) => {
			expect(checkMonthsOfYear(iso, variant.lang, variant.utils)).toEqual([]);
		});
	});
});
