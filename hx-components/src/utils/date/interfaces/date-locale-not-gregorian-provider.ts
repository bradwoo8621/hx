import type {HxLanguageCode} from '../../../contexts';
import type {UTCDate} from '../facade';
import type {ComputedDays, ComputedMonths, ComputedYears, HxDate, HxFormattedEra, HxFormattedYear} from './date-types';

export interface DateLocaleNotGregorianProvider {
	/**
	 * Checks whether the given locale should use this non-Gregorian calendar for locale-formatting operations.
	 *
	 * @param lang - locale code (e.g. {@code 'zh-TW'}, {@code 'th-TH'})
	 * @returns {@code true} if this calendar applies to the locale
	 */
	accept(lang: HxLanguageCode): boolean;
	/**
	 * Returns the calendar identifier for {@link Intl.DateTimeFormat}.
	 *
	 * <p>Leave unspecified when the default Gregorian calendar identifier is sufficient.</p>
	 *
	 * @returns the calendar ID (e.g. {@code 'roc'}, {@code 'buddhist'})
	 */
	calendar?(): string;
	/**
	 * Returns the list of locales that this calendar supports for era/year formatting overrides.
	 *
	 * <p>Leave unspecified when no {@link calendar} is provided.</p>
	 *
	 * @returns array of supported locale codes
	 */
	supportedLanguages?(): Array<HxLanguageCode>;
	/**
	 * Extracts the formatted era string from the given {@link Intl.DateTimeFormat} parts.
	 *
	 * <p>Leave unspecified when the default formatted era is sufficient.</p>
	 *
	 * @param date    - the Gregorian date
	 * @param partsOf - callback that returns the formatted parts array
	 * @param lang    - locale code
	 * @returns the formatted era string, or an empty string
	 */
	eraAs?(date: UTCDate, partsOf: () => Array<Intl.DateTimeFormatPart>, lang: HxLanguageCode): HxFormattedEra;
	/**
	 * Extracts the formatted year string (including its literal suffix) from the given
	 * {@link Intl.DateTimeFormat} parts.
	 *
	 * <p>Leave unspecified when the default formatted year is sufficient.</p>
	 *
	 * @param date    - the Gregorian date
	 * @param partsOf - callback that returns the formatted parts array
	 * @param lang    - locale code
	 * @returns the year string with its literal suffix (e.g. {@code '113年'})
	 */
	yearAs?(date: UTCDate, partsOf: () => Array<Intl.DateTimeFormatPart>, lang: HxLanguageCode): HxFormattedYear;
	/**
	 * Computes a custom year label for the datetime input popup header.
	 *
	 * <p>All parameters are pre-formatted by {@link Intl.DateTimeFormat}.
	 * Leave unspecified when the default label is sufficient.</p>
	 *
	 * @param value - the picked date value
	 * @param era   - formatted era string
	 * @param year  - formatted year string
	 * @param lang  - locale code
	 * @returns the custom year label
	 */
	labelOfYear?(value: HxDate, era: string, year: string, lang: HxLanguageCode): string;
	/**
	 * Computes a custom month label for the datetime input popup header.
	 *
	 * <p>All parameters are pre-formatted by {@link Intl.DateTimeFormat}.
	 * Leave unspecified when the default label is sufficient.</p>
	 *
	 * @param value - the picked date value
	 * @param era   - formatted era string
	 * @param year  - formatted year string
	 * @param month - formatted month string
	 * @param lang  - locale code
	 * @returns the custom month label
	 */
	labelOfMonth?(value: HxDate, era: string, year: string, month: string, lang: HxLanguageCode): string;
	/**
	 * Maps each day in the given 42-day grid to its era string, so the datetime input popup
	 * can annotate days that cross era boundaries (e.g. before/after a calendar era change).
	 *
	 * <p>Leave unspecified when all days share the same era.</p>
	 *
	 * @param days - 42-day grid spanning the full calendar month
	 * @param lang - locale code
	 * @returns a map of {@link Date} to era string
	 */
	eraOfDays?(days: ComputedDays, lang: HxLanguageCode): Map<UTCDate, string>;

	/**
	 * Computes the months grid for the months panel of the datetime input popup.
	 *
	 * <p>Leave unspecified when the default 12-month grid is sufficient.</p>
	 *
	 * @param date      - the reference date; its year and month determine the grid and the offsets
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the months of the reference date's year
	 */
	monthsOfYear?(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedMonths;
	/**
	 * Computes the years grid around a reference year for the years panel of the datetime input popup.
	 *
	 * <p>Leave unspecified when the default paged year grid is sufficient.</p>
	 *
	 * @param baseDate    - the reference date; its year centers the grid window and the offsets
	 * @param currentDate - the current value date; its year marks the "this year" cell
	 * @param lang        - locale code
	 * @param gregorian   - whether the Gregorian calendar is in use
	 * @returns the years around the reference year, with pagination flags
	 */
	yearsAround?(baseDate: UTCDate, currentDate: UTCDate, lang: HxLanguageCode, gregorian: boolean): ComputedYears;
}
