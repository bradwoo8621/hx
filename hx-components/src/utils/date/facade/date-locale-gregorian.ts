import type {HxLanguageCode} from '../../../contexts';
import type {HxDateTimeValue} from '../../../types';
import type {ComputedDays, ComputedMonths, ComputedYears} from '../interfaces';
import {DateLocaleFormatUtils} from './date-locale-format';
import {UTCDate} from './utc-date';

/**
 * Default Gregorian locale provider: the fallback implementations for the datetime
 * input popup header labels and the months/years panels, used when no non-Gregorian
 * provider is registered (or when the Gregorian calendar is in use).
 */
export class DateLocaleGregorianProvider {
	/**
	 * Prevents direct instantiation; all members are accessed statically.
	 */
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Returns the formatted month label as-is.
	 *
	 * <p>Gregorian months need no era/year adjustments.</p>
	 *
	 * @param _value - the picked date value
	 * @param _era   - formatted era string
	 * @param _year  - formatted year string
	 * @param month  - formatted month string
	 * @param _lang  - locale code
	 * @returns the formatted month string
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static labelOfMonth(_value: Required<HxDateTimeValue>, _era: string, _year: string, month: string, _lang: HxLanguageCode): string {
		return month;
	}

	/**
	 * Returns an empty era map, since all Gregorian days share a single era.
	 *
	 * @param _days - 42-day grid spanning the full calendar month
	 * @param _lang - locale code
	 * @returns an empty map
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static eraOfDays(_days: ComputedDays, _lang: HxLanguageCode): Map<UTCDate, string> {
		return new Map<UTCDate, string>();
	}

	/**
	 * Computes the 12-month grid for the months panel of the datetime input popup.
	 *
	 * @param date - the reference date; its year and month determine the grid and the offsets
	 * @param lang - locale code
	 * @returns the 12 months of the reference date's year
	 */
	static monthsOfYear(date: UTCDate, lang: HxLanguageCode): ComputedMonths {
		const year = date.getFullYear();
		const monthIndex = date.getMonthIndex();
		return new Array(12)
			.fill(1)
			.map((_, index) => UTCDate.of(year, index, 1))
			.map(month => {
				return {
					key: `${year}-${month.getMonthIndex() + 1}-1`,
					label: DateLocaleFormatUtils.formatMonthShort(month, lang, true),
					value: month,
					offset: month.getMonthIndex() - monthIndex,
					bc: false,
					y10k: false
				};
			});
	}

	/**
	 * Computes the years grid around a reference year for the years panel of the datetime input popup.
	 *
	 * @param baseDate    - the reference date; its year centers the grid window and the offsets
	 * @param currentDate - the current value date; its year marks the "this year" cell
	 * @param lang        - locale code
	 * @returns the years around the reference year, with pagination flags
	 */
	static yearsAround(baseDate: UTCDate, currentDate: UTCDate, lang: HxLanguageCode): ComputedYears {
		const baseYear = baseDate.getFullYear();
		const maxStartYear = 9999 - DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE + 1;
		const minStartYear = 1;
		const startYear = Math.min(maxStartYear, Math.max(minStartYear, baseYear - Math.floor((DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE - 1) / 2)));
		return {
			forward: startYear !== maxStartYear,
			backward: startYear !== minStartYear,
			years: new Array(DateLocaleFormatUtils.YEARS_AROUND_PER_PAGE)
				.fill(1)
				.map((_, index) => UTCDate.of(startYear + index, 0, 1))
				.map(year => {
					return {
						key: `${year.getFullYear()}-1-1`,
						label: DateLocaleFormatUtils.formatYear(year, lang, true),
						value: year,
						offset: year.getFullYear() - baseYear,
						thisYear: year.getFullYear() === currentDate.getFullYear()
					};
				})
		};
	}
}
