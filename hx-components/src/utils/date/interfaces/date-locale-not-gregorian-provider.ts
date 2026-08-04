import type {HxLanguageCode} from '../../../contexts';
import type {HxDateTimeValue} from '../../../types';
import type {ComputedDays, HxFormattedEra, HxFormattedYear} from './date-types';

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
	 * @param lang    - locale code
	 * @param date    - the Gregorian date
	 * @param partsOf - callback that returns the formatted parts array
	 * @returns the formatted era string, or an empty string
	 */
	eraAs?(lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedEra;
	/**
	 * Extracts the formatted year string (including its literal suffix) from the given
	 * {@link Intl.DateTimeFormat} parts.
	 *
	 * <p>Leave unspecified when the default formatted year is sufficient.</p>
	 *
	 * @param lang    - locale code
	 * @param date    - the Gregorian date
	 * @param partsOf - callback that returns the formatted parts array
	 * @returns the year string with its literal suffix (e.g. {@code '113年'})
	 */
	yearAs?(lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedYear;
	/**
	 * Computes a custom year label for the datetime input popup header.
	 *
	 * <p>All parameters are pre-formatted by {@link Intl.DateTimeFormat}.
	 * Leave unspecified when the default label is sufficient.</p>
	 *
	 * @param lang  - locale code
	 * @param value - the picked date value
	 * @param era   - formatted era string
	 * @param year  - formatted year string
	 * @returns the custom year label
	 */
	labelOfYear?(lang: HxLanguageCode, value: Required<HxDateTimeValue>, era: string, year: string): string;
	/**
	 * Computes a custom month label for the datetime input popup header.
	 *
	 * <p>All parameters are pre-formatted by {@link Intl.DateTimeFormat}.
	 * Leave unspecified when the default label is sufficient.</p>
	 *
	 * @param lang  - locale code
	 * @param value - the picked date value
	 * @param era   - formatted era string
	 * @param year  - formatted year string
	 * @param month - formatted month string
	 * @returns the custom month label
	 */
	labelOfMonth?(lang: HxLanguageCode, value: Required<HxDateTimeValue>, era: string, year: string, month: string): string;
	/**
	 * Maps each day in the given 42-day grid to its era string, so the datetime input popup
	 * can annotate days that cross era boundaries (e.g. before/after a calendar era change).
	 *
	 * <p>Leave unspecified when all days share the same era.</p>
	 *
	 * @param lang - locale code
	 * @param days - 42-day grid spanning the full calendar month
	 * @returns a map of {@link Date} to era string
	 */
	eraOfDays?(lang: HxLanguageCode, days: ComputedDays): Map<Date, string>;
}
