import type {HxLanguageCode} from '../../../contexts';
import type {HxDateTimeValue} from '../../../types';
import type {
	ComputedDays,
	ComputedMonths,
	ComputedYears,
	HxFormattedEra,
	HxFormattedMonth,
	HxFormattedYear
} from '../interfaces';
import {DateLocaleFormatUtils} from './date-locale-format';
import {DateLocaleGregorianProvider} from './date-locale-gregorian';
import {DateLocaleNotGregorianHelper} from './date-locale-not-gregorian';
import type {UTCDate} from './utc-date';

export class DateLocaleUtils {
	/**
	 * Computes a year label for the datetime input popup header.
	 *
	 * <p>When Gregorian, returns the full year. Otherwise, delegates to the matching
	 * non-Gregorian locale provider, falling back to concatenated era + year.</p>
	 *
	 * @param lang      - locale code
	 * @param gregorian - if {@code true}, uses Gregorian year directly
	 * @param value     - the picked date value
	 * @param era       - formatted era string
	 * @param year      - formatted year string
	 * @returns the year label (e.g. {@code '令和7年'})
	 */
	static yearHeaderLabel(lang: HxLanguageCode, gregorian: boolean, value: Required<HxDateTimeValue>, era: HxFormattedEra, year: HxFormattedYear): string {
		if (gregorian) {
			return DateLocaleGregorianProvider.yearHeaderLabel(value, era, year, lang);
		} else {
			return DateLocaleFormatUtils.findNotGregorianProvider(lang)?.yearHeaderLabel?.(value, era, year, lang)
				|| DateLocaleNotGregorianHelper.yearHeaderLabel(value, era, year, lang);
		}
	}

	/**
	 * Computes a month label for the datetime input popup header.
	 *
	 * <p>When Gregorian, returns the given month string. Otherwise, delegates to the
	 * matching non-Gregorian locale provider, falling back to the formatted month.</p>
	 *
	 * @param lang      - locale code
	 * @param gregorian - if {@code true}, returns the month directly
	 * @param value     - the picked date value
	 * @param era       - formatted era string
	 * @param year      - formatted year string
	 * @param month     - formatted month string
	 * @returns the month label
	 */
	static monthHeaderLabel(lang: HxLanguageCode, gregorian: boolean, value: Required<HxDateTimeValue>, era: HxFormattedEra, year: HxFormattedYear, month: HxFormattedMonth): string {
		if (gregorian) {
			return DateLocaleGregorianProvider.monthHeaderLabel(value, era, year, month, lang);
		} else {
			return DateLocaleFormatUtils.findNotGregorianProvider(lang)?.monthHeaderLabel?.(value, era, year, month, lang)
				|| DateLocaleNotGregorianHelper.monthHeaderLabel(value, era, year, month, lang);
		}
	}

	/**
	 * Computes a map of era transitions across the given 42-day grid for the
	 * datetime input popup.
	 *
	 * <p>When Gregorian, returns an empty map. Otherwise, delegates to the matching
	 * non-Gregorian locale provider, falling back to an empty map when none is
	 * registered.</p>
	 *
	 * @param lang      - locale code
	 * @param gregorian - if {@code true}, returns an empty map
	 * @param days      - 42-day grid spanning the full calendar month
	 * @returns a map of {@link Date} to era string, or empty if no era transitions
	 */
	static eraOfDays(lang: HxLanguageCode, gregorian: boolean, days: ComputedDays): Map<UTCDate, string> {
		if (gregorian) {
			return DateLocaleGregorianProvider.eraOfDays(days, lang);
		} else {
			return DateLocaleFormatUtils.findNotGregorianProvider(lang)?.eraOfDays?.(days, lang)
				?? DateLocaleGregorianProvider.eraOfDays(days, lang);
		}
	}

	/**
	 * Computes the months grid for the months panel of the datetime input popup.
	 *
	 * <p>Delegates to the matching non-Gregorian locale provider, falling back to the
	 * default Gregorian 12-month grid when none is registered.</p>
	 *
	 * @param date      - the reference date; its year and month determine the grid and the offsets
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the 12 months of the reference date's year
	 */
	static monthsOfYear(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths {
		return DateLocaleFormatUtils.findNotGregorianProvider(lang)?.monthsOfYear?.(date, lang, gregorian)
			?? DateLocaleGregorianProvider.monthsOfYear(date, lang);
	}

	/**
	 * Computes the years grid around a reference year for the years panel of the datetime input popup.
	 *
	 * <p>Delegates to the matching non-Gregorian locale provider, falling back to the
	 * default Gregorian year grid when none is registered.</p>
	 *
	 * @param baseDate    - the reference date; its year centers the grid window and the offsets
	 * @param currentDate - the current value date; its year marks the "this year" cell
	 * @param lang        - locale code
	 * @param gregorian   - whether the Gregorian calendar is in use
	 * @returns the years around the reference year, with pagination flags
	 */
	static yearsAround(baseDate: UTCDate, currentDate: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedYears {
		return DateLocaleFormatUtils.findNotGregorianProvider(lang)?.yearsAround?.(baseDate, currentDate, lang, gregorian)
			?? DateLocaleGregorianProvider.yearsAround(baseDate, currentDate, lang);
	}
}
