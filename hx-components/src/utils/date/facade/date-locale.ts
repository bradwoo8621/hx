import type {HxLanguageCode} from '../../../contexts';
import type {HxDateTimeValue, HxDateWeekendDay} from '../../../types';
import {NumberUtils} from '../../number';
import type {
	ComputedDays,
	DateLocaleNotGregorianProvider,
	HxDateTimeFormatCalendar,
	HxFormattedDay,
	HxFormattedEra,
	HxFormattedMonth,
	HxFormattedWeekday,
	HxFormattedWeekdays,
	HxFormattedYear
} from '../interfaces';
import {DateUtils} from './date';

/**
 * Locale-aware date/time part formatting using {@link Intl.DateTimeFormat}.
 *
 * Provides per-locale year, month, day, weekday, and era formatting
 * with automatic calendar detection and length heuristics for
 * month/weekday display.
 */
export class DateLocaleUtils {
	// noinspection SpellCheckingInspection
	static readonly GREGORY = 'gregory';
	// noinspection SpellCheckingInspection
	private static readonly CALENDAR_MAP: Record<HxLanguageCode, HxDateTimeFormatCalendar> = {
		// Locales whose default calendar is NOT Gregorian — mapped to their native calendar.
	};
	private static readonly NOT_GREGORY_LOCALE_UTILS: Array<DateLocaleNotGregorianProvider> = [];
	private static readonly SHORT_MONTH_LOCALES = ['th', 'ru', 'el', 'pl', 'hi'];
	private static readonly NARROW_WEEKDAY_LOCALES = ['am', 'ti', 'th', 'fa', 'ar', 'lo', 'pl', 'my', 'km', 'fr', 'pt'];
	private static readonly FORMATS = new Map<string, Intl.DateTimeFormat>();
	private static readonly LONG_MONTH_FORMATS = new Map<string, Intl.DateTimeFormat>();
	private static readonly NUMERIC_FORMATS = new Map<string, Intl.DateTimeFormat>();

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/** Replace the locale prefixes that use {@code 'short'} month format. */
	// noinspection JSUnusedGlobalSymbols
	static setShortMonthLocales(languages: Array<HxLanguageCode>): typeof DateLocaleUtils {
		DateLocaleUtils.SHORT_MONTH_LOCALES.length = 0;
		if (languages != null) {
			DateLocaleUtils.SHORT_MONTH_LOCALES.push(...languages);
		}
		return DateLocaleUtils;
	}

	/** Replace the locale prefixes that use {@code 'narrow'} weekday format. */
	// noinspection JSUnusedGlobalSymbols
	static setNarrowWeekdayLocales(languages: Array<HxLanguageCode>): typeof DateLocaleUtils {
		DateLocaleUtils.NARROW_WEEKDAY_LOCALES.length = 0;
		if (languages != null) {
			DateLocaleUtils.NARROW_WEEKDAY_LOCALES.push(...languages);
		}
		return DateLocaleUtils;
	}

	/**
	 * Register a non-Gregorian locale provider for era/year formatting and calendar detection.
	 *
	 * <p>If the provider specifies a {@code calendar} identifier and supported languages,
	 * those locales are automatically mapped to the calendar via {@link CALENDAR_MAP}.</p>
	 *
	 * @param utils - the provider instance to register
	 * @returns the {@link DateLocaleUtils} class for chaining
	 */
	static enableNotGregorianLocaleUtils(utils: DateLocaleNotGregorianProvider): typeof DateLocaleUtils {
		if (!DateLocaleUtils.NOT_GREGORY_LOCALE_UTILS.includes(utils)) {
			DateLocaleUtils.NOT_GREGORY_LOCALE_UTILS.push(utils);
			const calendar = utils.calendar?.();
			if (calendar != null && calendar !== '') {
				utils.supportedLanguages?.()?.forEach(locale => {
					DateLocaleUtils.CALENDAR_MAP[locale] = calendar;
				});
			}
		}
		return DateLocaleUtils;
	}

	/**
	 * Unregister a previously registered non-Gregorian locale provider.
	 *
	 * <p>Removes the provider's supported locales from {@link CALENDAR_MAP}.</p>
	 *
	 * @param utils - the provider instance to unregister
	 * @returns the {@link DateLocaleUtils} class for chaining
	 */
	static disableNotGregorianLocaleUtils(utils: DateLocaleNotGregorianProvider): typeof DateLocaleUtils {
		const index = DateLocaleUtils.NOT_GREGORY_LOCALE_UTILS.indexOf(utils);
		if (index !== -1) {
			DateLocaleUtils.NOT_GREGORY_LOCALE_UTILS.splice(index, 1);
			utils.supportedLanguages?.()?.forEach(locale => {
				delete DateLocaleUtils.CALENDAR_MAP[locale];
			});
		}
		return DateLocaleUtils;
	}

	/**
	 * Find the registered non-Gregorian locale provider that accepts the given locale.
	 *
	 * @param lang - locale code
	 * @returns the matching provider, or {@code undefined} if none registered
	 */
	static findNotGregorianUtils(lang: HxLanguageCode): DateLocaleNotGregorianProvider | undefined {
		return DateLocaleUtils.NOT_GREGORY_LOCALE_UTILS.find(utils => utils.accept(lang));
	}

	/**
	 * Resolve the calendar type for a given locale.
	 * Falls back to {@code 'gregory'} when no explicit mapping exists.
	 */
	static resolveCalendar(lang: HxLanguageCode): string {
		const found: HxDateTimeFormatCalendar | undefined = DateLocaleUtils.CALENDAR_MAP[lang as HxLanguageCode];
		return found || DateLocaleUtils.GREGORY;
	}

	/**
	 * Checks whether the given locale uses the Gregorian calendar by default.
	 *
	 * @param lang - locale code
	 * @returns {@code true} when the resolved calendar is Gregorian
	 */
	static isUsingGregoryCalendar(lang: HxLanguageCode): boolean {
		return DateLocaleUtils.resolveCalendar(lang) === DateLocaleUtils.GREGORY;
	}

	private static getMonthFormat(lang: HxLanguageCode): Exclude<Intl.DateTimeFormatOptions['month'], undefined> {
		if (DateLocaleUtils.SHORT_MONTH_LOCALES.includes(lang)) {
			return 'short';
		}
		const match = DateLocaleUtils.SHORT_MONTH_LOCALES.some(locale => lang.startsWith(locale + '-'));
		if (match) {
			return 'short';
		} else {
			return 'long';
		}
	}

	private static getWeekdayFormat(lang: HxLanguageCode): Exclude<Intl.DateTimeFormatOptions['weekday'], undefined> {
		if (DateLocaleUtils.NARROW_WEEKDAY_LOCALES.includes(lang)) {
			return 'narrow';
		}
		const match = DateLocaleUtils.NARROW_WEEKDAY_LOCALES.some(locale => lang.startsWith(locale + '-'));
		if (match) {
			return 'narrow';
		} else {
			return 'short';
		}
	}

	private static findFormat(lang: HxLanguageCode, gregorian: boolean): Intl.DateTimeFormat {
		const key = `${lang}--${gregorian}`;
		let format = DateLocaleUtils.FORMATS.get(key);
		if (format == null) {
			let calendar: string | undefined;
			if (gregorian) {
				calendar = DateLocaleUtils.GREGORY;
			} else {
				calendar = DateLocaleUtils.resolveCalendar(lang);
			}
			format = new Intl.DateTimeFormat(lang, {
				year: 'numeric',
				month: DateLocaleUtils.getMonthFormat(lang),
				day: 'numeric',
				weekday: DateLocaleUtils.getWeekdayFormat(lang),
				calendar
			});
			DateLocaleUtils.FORMATS.set(key, format);
		}
		return format;
	}

	private static findMonthLongFormat(lang: HxLanguageCode, gregorian: boolean): Intl.DateTimeFormat {
		const key = `${lang}--${gregorian}`;
		let format = DateLocaleUtils.LONG_MONTH_FORMATS.get(key);
		if (format == null) {
			let calendar: string | undefined;
			if (gregorian) {
				calendar = DateLocaleUtils.GREGORY;
			} else {
				calendar = DateLocaleUtils.resolveCalendar(lang);
			}
			format = new Intl.DateTimeFormat(lang, {month: 'long', calendar});
			DateLocaleUtils.LONG_MONTH_FORMATS.set(key, format);
		}
		return format;
	}

	private static findNumericFormat(lang: HxLanguageCode): Intl.DateTimeFormat {
		const key = lang;
		let format = DateLocaleUtils.NUMERIC_FORMATS.get(key);
		if (format == null) {
			const calendar = DateLocaleUtils.resolveCalendar(lang);
			// Enforce Latin (0-9) digits via Unicode extension.
			// Without this, locales like ar-EG output Eastern Arabic numerals
			// (e.g. ١٧٤٢) which break parseInt-based parsing downstream.
			if (!lang.includes('-u-nu-latn')) {
				lang += '-u-nu-latn';
			}
			format = new Intl.DateTimeFormat(lang, {
				era: 'long', year: 'numeric', month: 'numeric', day: 'numeric', calendar
			});
			DateLocaleUtils.NUMERIC_FORMATS.set(key, format);
		}
		return format;
	}

	/**
	 * Delegates to the matching non-Gregorian locale utils or returns empty string.
	 */
	static eraAs(lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedEra {
		return DateLocaleUtils.findNotGregorianUtils(lang)?.eraAs?.(lang, date, partsOf) ?? '';
	}

	/**
	 * Format the era name for the given date and locale.
	 *
	 * - empty string when {@link gregorian} is true
	 * - or see {@link eraAs}
	 */
	static formatEra(date: Date, lang: HxLanguageCode, gregorian: boolean): HxFormattedEra {
		if (gregorian) {
			return '';
		}
		return DateLocaleUtils.eraAs(lang, date, () => {
			const format = DateLocaleUtils.findFormat(lang, false);
			return format.formatToParts(date);
		});
	}

	/**
	 * Extract the year value and its following literal from {@link Intl.DateTimeFormat} parts.
	 *
	 * @param partsOf - callback that returns the formatted parts array
	 * @returns an object with {@code found: true, year, literal} on success, or {@code {found: false}} if no year part exists
	 */
	static findYearAndLiteralFromFormattedParts(
		partsOf: () => Array<Intl.DateTimeFormatPart>
	): { found: false } | { found: true, year: string, literal: string } {
		const parts = partsOf();
		const partIndex = parts.findIndex(part => part.type === 'year');
		if (partIndex < 0) {
			return {found: false};
		} else {
			const year = parts[partIndex].value;
			let literal = '';
			if (parts[partIndex + 1]?.type === 'literal') {
				literal = parts[partIndex + 1].value.trim();
			}
			return {found: true, year, literal};
		}
	}

	/**
	 * Delegates to the matching non-Gregorian locale utils,
	 * or uses year part, and concat with the literal part after year part when existing.
	 */
	static yearAs(lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedYear {
		const ret = DateLocaleUtils.findNotGregorianUtils(lang)?.yearAs?.(lang, date, partsOf);
		if (ret == null || ret.trim().length === 0) {
			const yearAndLiteral = DateLocaleUtils.findYearAndLiteralFromFormattedParts(partsOf);
			if (yearAndLiteral.found) {
				return [yearAndLiteral.year, yearAndLiteral.literal].join('');
			} else {
				return String(date.getFullYear());
			}
		} else {
			return ret;
		}
	}

	/**
	 * Format the year component for the given date and locale.
	 *
	 * - full Gregorian year when {@link gregorian} is true
	 * - or see {@link yearAs}
	 */
	static formatYear(date: Date, lang: HxLanguageCode, gregorian: boolean): HxFormattedYear {
		if (gregorian) {
			return String(date.getFullYear());
		}
		return DateLocaleUtils.yearAs(lang, date, () => {
			const format = DateLocaleUtils.findFormat(lang, gregorian);
			return format.formatToParts(date);
		});
	}

	/**
	 * - Uses the month part
	 * - and concat with the literal part after month part when existing
	 */
	static monthAs(date: Date, parts: Array<Intl.DateTimeFormatPart>): HxFormattedMonth {
		const partIndex = parts.findIndex(part => part.type === 'month');
		if (partIndex < 0) {
			return String(date.getMonth() + 1);
		} else {
			const month = parts[partIndex].value.trim();
			let literal = '';
			if (parts[partIndex + 1]?.type === 'literal') {
				literal = parts[partIndex + 1].value.trim();
			}
			return [month, literal].join('');
		}
	}

	/**
	 * Format the month component using locale-aware length heuristics.
	 *
	 * See {@link monthAs}.
	 */
	static formatMonth(date: Date, lang: HxLanguageCode, gregorian: boolean): HxFormattedMonth {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		return DateLocaleUtils.monthAs(date, parts);
	}

	/**
	 * Format the month component using the full (long) month name.
	 *
	 * See {@link monthAs}.
	 */
	static formatMonthLong(date: Date, lang: HxLanguageCode, gregorian: boolean): HxFormattedMonth {
		const format = DateLocaleUtils.findMonthLongFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		return DateLocaleUtils.monthAs(date, parts);
	}

	/**
	 * - Uses the day part
	 * - when day part is not a number, then concat with the literal part after day part when existing
	 */
	static dayAs(date: Date, parts: Array<Intl.DateTimeFormatPart>): HxFormattedDay {
		const partIndex = parts.findIndex(part => part.type === 'day');
		if (partIndex < 0) {
			return String(date.getDate());
		} else {
			const day = parts[partIndex].value.trim();
			if (NumberUtils.isNotANumber(day)) {
				let literal = '';
				if (parts[partIndex + 1]?.type === 'literal') {
					literal = parts[partIndex + 1].value.trim();
				}
				return [day, literal].join('');
			} else {
				return day;
			}
		}
	}

	/**
	 * Format the day component. Attaches trailing literal only for non-Western digits.
	 *
	 * See {@link dayAs}.
	 */
	static formatDay(date: Date, lang: HxLanguageCode, gregorian: boolean): HxFormattedDay {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		return DateLocaleUtils.dayAs(date, parts);
	}

	/**
	 * Format the month and day components together in a single locale-aware call.
	 *
	 * See {@link monthAs}, {@link dayAs}.
	 */
	static formatMonthAndDay(date: Date, lang: HxLanguageCode, gregorian: boolean): [HxFormattedMonth, HxFormattedDay] {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		return [
			DateLocaleUtils.monthAs(date, parts),
			DateLocaleUtils.dayAs(date, parts)
		];
	}

	/**
	 * Uses the weekday part, and strips the first char if it is 周/週.
	 */
	static weekdayAs(_date: Date, parts: Array<Intl.DateTimeFormatPart>): HxFormattedWeekday {
		const part = parts.find(part => part.type === 'weekday');
		const v = part!.value;
		if (v.startsWith('周') || v.startsWith('週')) {
			return v.substring(1);
		} else {
			return v;
		}
	}

	/**
	 * Format the weekday using locale-aware length heuristics.
	 *
	 * See {@link weekdayAs}.
	 */
	static formatWeekday(date: Date, lang: HxLanguageCode, gregorian: boolean): HxFormattedWeekday {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		return DateLocaleUtils.weekdayAs(date, parts);
	}

	/**
	 * Format a full date including era, year, month, day, and a week of weekday labels.
	 *
	 * @returns a tuple of {@code [era, year, month, day, weekdays]} where
	 *          {@code weekdays} is an array of 7 weekday labels starting from Sunday.
	 */
	static formatDate(date: Date, lang: HxLanguageCode, gregorian: boolean): [HxFormattedEra, HxFormattedYear, HxFormattedMonth, HxFormattedDay, HxFormattedWeekdays] {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		const partsOf = () => parts;
		const era = DateLocaleUtils.eraAs(lang, date, partsOf);
		const year = DateLocaleUtils.yearAs(lang, date, partsOf);
		const month = DateLocaleUtils.monthAs(date, parts);
		const day = DateLocaleUtils.dayAs(date, parts);
		const weekday = DateLocaleUtils.weekdayAs(date, parts);
		const weekdays: HxFormattedWeekdays = [];
		// 0 - 6, sun is 0.
		const dayOfWeek = date.getDay();
		for (let i = 0; i <= 6; i++) {
			if (i === dayOfWeek) {
				weekdays.push(weekday);
			} else {
				const d = new Date(date);
				d.setDate(d.getDate() + (i - dayOfWeek));
				const parts = format.formatToParts(d);
				const weekday = DateLocaleUtils.weekdayAs(d, parts);
				weekdays.push(weekday);
			}
		}

		return [era, year, month, day, weekdays];
	}

	/**
	 * Format a date in numeric form, returning era and numeric year/month/day values.
	 *
	 * For Gregorian dates this returns the raw year/month/day. For non-Gregorian
	 * calendars it uses the locale's numeric format and parses the parts back to
	 * integers, handling RTL markers and non-ASCII minus signs.
	 *
	 * @returns a tuple of {@code [era, year, month, day]} where year/month/day are numbers
	 */
	static formatDateInNumeric(date: Date, lang: HxLanguageCode, gregorian: boolean): [HxFormattedEra, number, number, number] {
		if (gregorian) {
			return ['', date.getFullYear(), date.getMonth() + 1, date.getDate()];
		} else {
			const format = DateLocaleUtils.findNumericFormat(lang);
			const parts = format.formatToParts(date);
			const era = DateLocaleUtils.eraAs(lang, date, () => parts);
			let year: number | undefined = (void 0);
			let month: number | undefined = (void 0);
			let day: number | undefined = (void 0);
			parts.forEach(part => {
				if (part.type === 'year' && year == null) {
					// Intl.DateTimeFormat in RTL locales may output:
					//   - U+200E (LRM) before the sign to preserve visual direction
					//   - U+2212 (MINUS SIGN) instead of ASCII U+002D (HYPHEN-MINUS)
					// Strip/normalize both so parseInt can parse the number correctly.
					let yearValue = part.value;
					if (yearValue.charCodeAt(0) === 0x200E) {
						yearValue = yearValue.slice(1);
					}
					if (yearValue.charCodeAt(0) === 0x2212) {
						yearValue = '-' + yearValue.slice(1);
					}
					year = parseInt(yearValue);
				} else if (part.type === 'month' && month == null) {
					month = parseInt(part.value);
				} else if (part.type === 'day' && day == null) {
					day = parseInt(part.value);
				}
			});
			return [era, year!, month!, day!];
		}
	}

	private static convertToShortWeekday(index: 1 | 2 | 3 | 4 | 5 | 6 | 7): HxDateWeekendDay {
		switch (index) {
			case 1: {
				return 'mon';
			}
			case 2: {
				return 'tue';
			}
			case 3: {
				return 'wed';
			}
			case 4: {
				return 'thu';
			}
			case 5: {
				return 'fri';
			}
			case 6: {
				return 'sat';
			}
			case 7: {
				return 'sun';
			}
		}
	}

	/**
	 * Retrieve the weekend days and first day of the week for a given locale.
	 *
	 * Uses {@code Intl.Locale.getWeekInfo} (or the legacy {@code locale.weekInfo})
	 * when available, otherwise falls back to Saturday–Sunday weekend with Sunday
	 * as the first day of the week.
	 */
	static getWeekInfo(lang: HxLanguageCode): { weekends: Array<HxDateWeekendDay>; firstDayOfWeek: HxDateWeekendDay } {
		try {
			const locale = new Intl.Locale(lang);
			// @ts-expect-error ignore check
			if (locale.getWeekInfo != null) {
				// @ts-expect-error ignore check
				const {weekend = [6, 7], firstDay = 7} = locale.getWeekInfo() as {
					weekend?: Array<1 | 2 | 3 | 4 | 5 | 6 | 7>,
					firstDay?: 1 | 2 | 3 | 4 | 5 | 6 | 7
				};
				return {
					weekends: weekend.map(v => DateLocaleUtils.convertToShortWeekday(v)),
					firstDayOfWeek: DateLocaleUtils.convertToShortWeekday(firstDay)
				};
			}
			// @ts-expect-error ignore check
			else if (locale.weekInfo != null) {
				// @ts-expect-error ignore check
				const {weekend = [6, 7], firstDay = 7} = locale.weekInfo as {
					weekend?: Array<1 | 2 | 3 | 4 | 5 | 6 | 7>,
					firstDay?: 1 | 2 | 3 | 4 | 5 | 6 | 7
				};
				return {
					weekends: weekend.map(v => DateLocaleUtils.convertToShortWeekday(v)),
					firstDayOfWeek: DateLocaleUtils.convertToShortWeekday(firstDay)
				};
			} else {
				return {weekends: ['sat', 'sun'] as Array<HxDateWeekendDay>, firstDayOfWeek: 'sun' as HxDateWeekendDay};
			}
		} catch {
			return {weekends: ['sat', 'sun'] as Array<HxDateWeekendDay>, firstDayOfWeek: 'sun' as HxDateWeekendDay};
		}
	};

	/**
	 * Computes a year label for the datetime input popup header.
	 *
	 * <p>When Gregorian, returns the full year. Otherwise delegates to the matching
	 * non-Gregorian locale provider, falling back to concatenated era + year.</p>
	 *
	 * @param lang      - locale code
	 * @param gregorian - if {@code true}, uses Gregorian year directly
	 * @param value     - the picked date value
	 * @param era       - formatted era string
	 * @param year      - formatted year string
	 * @returns the year label (e.g. {@code '令和7年'})
	 */
	static labelOfYear(lang: HxLanguageCode, gregorian: boolean, value: Required<HxDateTimeValue>, era: string, year: string): string {
		if (gregorian) {
			return String(DateUtils.asJsDate(value).getFullYear());
		} else {
			return DateLocaleUtils.findNotGregorianUtils(lang)?.labelOfYear?.(lang, value, era, year) || `${era}${year}`;
		}
	}

	/**
	 * Computes a month label for the datetime input popup header.
	 *
	 * <p>When Gregorian, returns the given month string. Otherwise delegates to the
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
	static labelOfMonth(lang: HxLanguageCode, gregorian: boolean, value: Required<HxDateTimeValue>, era: string, year: string, month: string): string {
		if (gregorian) {
			return month;
		} else {
			return DateLocaleUtils.findNotGregorianUtils(lang)?.labelOfMonth?.(lang, value, era, year, month) || month;
		}
	}

	/**
	 * Computes a map of era transitions across the given 42-day grid for the
	 * datetime input popup.
	 *
	 * <p>When Gregorian, returns an empty map. Otherwise delegates to the matching
	 * non-Gregorian locale provider, falling back to an empty map when none is
	 * registered.</p>
	 *
	 * @param lang      - locale code
	 * @param gregorian - if {@code true}, returns an empty map
	 * @param days      - 42-day grid spanning the full calendar month
	 * @returns a map of {@link Date} to era string, or empty if no era transitions
	 */
	static eraOfDays(lang: HxLanguageCode, gregorian: boolean, days: ComputedDays): Map<Date, string> {
		if (gregorian) {
			return new Map<Date, string>();
		} else {
			return DateLocaleUtils.findNotGregorianUtils(lang)?.eraOfDays?.(lang, days) ?? new Map<Date, string>();
		}
	}
}