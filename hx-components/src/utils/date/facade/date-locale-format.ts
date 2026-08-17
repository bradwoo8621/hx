import type {HxLanguageCode} from '../../../contexts';
import type {HxDateWeekendDay} from '../../../types';
import {NumberUtils} from '../../number';
import type {
	DateLocaleNotGregorianProvider,
	HxDateTimeFormatCalendar,
	HxFormattedDay,
	HxFormattedEra,
	HxFormattedMonth,
	HxFormattedWeekday,
	HxFormattedWeekdays,
	HxFormattedYear
} from '../interfaces';
import {UTCDate} from './utc-date';

/**
 * Locale-aware date/time part formatting using {@link Intl.DateTimeFormat}.
 *
 * Provides per-locale year, month, day, weekday, and era formatting
 * with automatic calendar detection and length heuristics for
 * month/weekday display.
 */
export class DateLocaleFormatUtils {
	/** Gregorian calendar identifier for {@link Intl.DateTimeFormat}. */
		// noinspection SpellCheckingInspection
	static readonly GREGORY = 'gregory';
	// noinspection SpellCheckingInspection
	private static readonly CALENDAR_MAP: Record<HxLanguageCode, HxDateTimeFormatCalendar> = {
		// Locales whose default calendar is NOT Gregorian — mapped to their native calendar.
	};
	/** Registered non-Gregorian locale providers, consulted in registration order. */
	private static readonly NOT_GREGORY_LOCALE_PROVIDERS: Array<DateLocaleNotGregorianProvider> = [];
	private static readonly SHORT_MONTH_LOCALES = ['th', 'ru', 'el', 'pl', 'hi'];
	private static readonly NARROW_WEEKDAY_LOCALES = ['am', 'ti', 'th', 'fa', 'ar', 'lo', 'pl', 'my', 'km', 'fr', 'pt', 'he'];
	/** Caches of created {@link Intl.DateTimeFormat} instances, keyed by `lang--gregorian`. */
	private static readonly FORMATS = new Map<string, Intl.DateTimeFormat>();
	private static readonly LONG_MONTH_FORMATS = new Map<string, Intl.DateTimeFormat>();
	private static readonly SHORT_MONTH_FORMATS = new Map<string, Intl.DateTimeFormat>();
	private static readonly NARROW_MONTH_FORMATS = new Map<string, Intl.DateTimeFormat>();
	private static readonly NUMERIC_FORMATS = new Map<string, Intl.DateTimeFormat>();
	/** Number of years shown around the reference year in the years panel (per page). */
	static readonly YEARS_AROUND_PER_PAGE = 25;

	/**
	 * Prevents direct instantiation; all members are accessed statically.
	 */
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/** Replace the locale prefixes that use {@code 'short'} month format. */
	// noinspection JSUnusedGlobalSymbols
	static setShortMonthLocales(languages: Array<HxLanguageCode>): typeof DateLocaleFormatUtils {
		DateLocaleFormatUtils.SHORT_MONTH_LOCALES.length = 0;
		if (languages != null) {
			DateLocaleFormatUtils.SHORT_MONTH_LOCALES.push(...languages);
		}
		return DateLocaleFormatUtils;
	}

	/** Replace the locale prefixes that use {@code 'narrow'} weekday format. */
	// noinspection JSUnusedGlobalSymbols
	static setNarrowWeekdayLocales(languages: Array<HxLanguageCode>): typeof DateLocaleFormatUtils {
		DateLocaleFormatUtils.NARROW_WEEKDAY_LOCALES.length = 0;
		if (languages != null) {
			DateLocaleFormatUtils.NARROW_WEEKDAY_LOCALES.push(...languages);
		}
		return DateLocaleFormatUtils;
	}

	/**
	 * Register a non-Gregorian locale provider for era/year formatting and calendar detection.
	 *
	 * <p>If the provider specifies a {@code calendar} identifier and supported languages,
	 * those locales are automatically mapped to the calendar via {@link CALENDAR_MAP}.</p>
	 *
	 * @param utils - the provider instance to register
	 * @returns the {@link DateLocaleFormatUtils} class for chaining
	 */
	static enableNotGregorianLocaleProvider(utils: DateLocaleNotGregorianProvider): typeof DateLocaleFormatUtils {
		if (!DateLocaleFormatUtils.NOT_GREGORY_LOCALE_PROVIDERS.includes(utils)) {
			DateLocaleFormatUtils.NOT_GREGORY_LOCALE_PROVIDERS.push(utils);
			const calendar = utils.calendar?.();
			if (calendar != null && calendar !== '') {
				utils.supportedLanguages?.()?.forEach(locale => {
					DateLocaleFormatUtils.CALENDAR_MAP[locale] = calendar;
				});
			}
		}
		return DateLocaleFormatUtils;
	}

	/**
	 * Unregister a previously registered non-Gregorian locale provider.
	 *
	 * <p>Removes the provider's supported locales from {@link CALENDAR_MAP}.</p>
	 *
	 * @param utils - the provider instance to unregister
	 * @returns the {@link DateLocaleFormatUtils} class for chaining
	 */
	static disableNotGregorianLocaleProvider(utils: DateLocaleNotGregorianProvider): typeof DateLocaleFormatUtils {
		const index = DateLocaleFormatUtils.NOT_GREGORY_LOCALE_PROVIDERS.indexOf(utils);
		if (index !== -1) {
			DateLocaleFormatUtils.NOT_GREGORY_LOCALE_PROVIDERS.splice(index, 1);
			utils.supportedLanguages?.()?.forEach(locale => {
				delete DateLocaleFormatUtils.CALENDAR_MAP[locale];
			});
		}
		return DateLocaleFormatUtils;
	}

	/**
	 * Find the registered non-Gregorian locale provider that accepts the given locale.
	 *
	 * @param lang - locale code
	 * @returns the matching provider, or {@code undefined} if none registered
	 */
	static findNotGregorianProvider(lang: HxLanguageCode): DateLocaleNotGregorianProvider | undefined {
		return DateLocaleFormatUtils.NOT_GREGORY_LOCALE_PROVIDERS.find(utils => utils.accept(lang));
	}

	/**
	 * Resolve the calendar type for a given locale.
	 * Falls back to {@code 'gregory'} when no explicit mapping exists.
	 */
	static resolveCalendar(lang: HxLanguageCode): string {
		const found: HxDateTimeFormatCalendar | undefined = DateLocaleFormatUtils.CALENDAR_MAP[lang as HxLanguageCode];
		return found || DateLocaleFormatUtils.GREGORY;
	}

	/**
	 * Checks whether the given locale uses the Gregorian calendar by default.
	 *
	 * @param lang - locale code
	 * @returns {@code true} when the resolved calendar is Gregorian
	 */
	static isUsingGregoryCalendar(lang: HxLanguageCode): boolean {
		return DateLocaleFormatUtils.resolveCalendar(lang) === DateLocaleFormatUtils.GREGORY;
	}

	/**
	 * Resolves the month format length ({@code 'long'} or {@code 'short'}) for the
	 * given locale, based on {@link SHORT_MONTH_LOCALES} (exact match or prefix).
	 *
	 * @param lang - locale code
	 * @returns the month format length
	 */
	static getMonthFormat(lang: HxLanguageCode): Exclude<Intl.DateTimeFormatOptions['month'], undefined> {
		if (DateLocaleFormatUtils.SHORT_MONTH_LOCALES.includes(lang)) {
			return 'short';
		}
		const match = DateLocaleFormatUtils.SHORT_MONTH_LOCALES.some(locale => lang.startsWith(locale + '-'));
		if (match) {
			return 'short';
		} else {
			return 'long';
		}
	}

	/**
	 * Resolves the weekday format length ({@code 'short'} or {@code 'narrow'}) for
	 * the given locale, based on {@link NARROW_WEEKDAY_LOCALES} (exact match or prefix).
	 *
	 * @param lang - locale code
	 * @returns the weekday format length
	 */
	static getWeekdayFormat(lang: HxLanguageCode): Exclude<Intl.DateTimeFormatOptions['weekday'], undefined> {
		if (DateLocaleFormatUtils.NARROW_WEEKDAY_LOCALES.includes(lang)) {
			return 'narrow';
		}
		const match = DateLocaleFormatUtils.NARROW_WEEKDAY_LOCALES.some(locale => lang.startsWith(locale + '-'));
		if (match) {
			return 'narrow';
		} else {
			return 'short';
		}
	}

	/**
	 * Finds (and caches) a full {@link Intl.DateTimeFormat} with year/month/day/weekday
	 * parts for the given locale. Gregorian dates use the {@code 'gregory'} calendar;
	 * otherwise the locale's resolved calendar is used.
	 *
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the cached formatter
	 */
	static findFormat(lang: HxLanguageCode, gregorian: boolean): Intl.DateTimeFormat {
		const key = `${lang}--${gregorian}`;
		let format = DateLocaleFormatUtils.FORMATS.get(key);
		if (format == null) {
			let calendar: string | undefined;
			if (gregorian) {
				calendar = DateLocaleFormatUtils.GREGORY;
			} else {
				calendar = DateLocaleFormatUtils.resolveCalendar(lang);
			}
			format = new Intl.DateTimeFormat(lang, {
				year: 'numeric', month: DateLocaleFormatUtils.getMonthFormat(lang), day: 'numeric',
				weekday: DateLocaleFormatUtils.getWeekdayFormat(lang),
				calendar, timeZone: 'UTC'
			});
			DateLocaleFormatUtils.FORMATS.set(key, format);
		}
		return format;
	}

	/**
	 * Finds (and caches) a month-only {@link Intl.DateTimeFormat} with the
	 * {@code 'long'} month length.
	 *
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the cached formatter
	 */
	static findMonthLongFormat(lang: HxLanguageCode, gregorian: boolean): Intl.DateTimeFormat {
		const key = `${lang}--${gregorian}`;
		let format = DateLocaleFormatUtils.LONG_MONTH_FORMATS.get(key);
		if (format == null) {
			let calendar: string | undefined;
			if (gregorian) {
				calendar = DateLocaleFormatUtils.GREGORY;
			} else {
				calendar = DateLocaleFormatUtils.resolveCalendar(lang);
			}
			format = new Intl.DateTimeFormat(lang, {month: 'long', calendar, timeZone: 'UTC'});
			DateLocaleFormatUtils.LONG_MONTH_FORMATS.set(key, format);
		}
		return format;
	}

	/**
	 * Finds (and caches) a month-only {@link Intl.DateTimeFormat} with the
	 * {@code 'short'} month length.
	 *
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the cached formatter
	 */
	static findMonthShortFormat(lang: HxLanguageCode, gregorian: boolean): Intl.DateTimeFormat {
		const key = `${lang}--${gregorian}`;
		let format = DateLocaleFormatUtils.SHORT_MONTH_FORMATS.get(key);
		if (format == null) {
			let calendar: string | undefined;
			if (gregorian) {
				calendar = DateLocaleFormatUtils.GREGORY;
			} else {
				calendar = DateLocaleFormatUtils.resolveCalendar(lang);
			}
			format = new Intl.DateTimeFormat(lang, {month: 'short', calendar, timeZone: 'UTC'});
			DateLocaleFormatUtils.SHORT_MONTH_FORMATS.set(key, format);
		}
		return format;
	}

	/**
	 * Finds (and caches) a month-only {@link Intl.DateTimeFormat} with the
	 * {@code 'narrow'} month length.
	 *
	 * @param lang      - locale code
	 * @param gregorian - whether the Gregorian calendar is in use
	 * @returns the cached formatter
	 */
	static findMonthNarrowFormat(lang: HxLanguageCode, gregorian: boolean): Intl.DateTimeFormat {
		const key = `${lang}--${gregorian}`;
		let format = DateLocaleFormatUtils.NARROW_MONTH_FORMATS.get(key);
		if (format == null) {
			let calendar: string | undefined;
			if (gregorian) {
				calendar = DateLocaleFormatUtils.GREGORY;
			} else {
				calendar = DateLocaleFormatUtils.resolveCalendar(lang);
			}
			format = new Intl.DateTimeFormat(lang, {month: 'narrow', calendar, timeZone: 'UTC'});
			DateLocaleFormatUtils.NARROW_MONTH_FORMATS.set(key, format);
		}
		return format;
	}

	/**
	 * Finds (and caches) a numeric {@link Intl.DateTimeFormat} (era + numeric
	 * year/month/day) for the given locale, enforcing Latin (0-9) digits so the
	 * output can be parsed back to integers downstream.
	 *
	 * @param lang - locale code
	 * @returns the cached numeric formatter
	 */
	static findNumericFormat(lang: HxLanguageCode): Intl.DateTimeFormat {
		const key = lang;
		let format = DateLocaleFormatUtils.NUMERIC_FORMATS.get(key);
		if (format == null) {
			const calendar = DateLocaleFormatUtils.resolveCalendar(lang);
			// Enforce Latin (0-9) digits via the numberingSystem option.
			// Without this, locales like ar-EG output Eastern Arabic numerals
			// (e.g. ١٧٤٢) which break parseInt-based parsing downstream.
			format = new Intl.DateTimeFormat(lang, {
				era: 'long', year: 'numeric', month: 'numeric', day: 'numeric',
				calendar, timeZone: 'UTC', numberingSystem: 'latn'
			});
			DateLocaleFormatUtils.NUMERIC_FORMATS.set(key, format);
		}
		return format;
	}

	/**
	 * Delegates to the matching non-Gregorian locale provider or returns an empty string.
	 */
	static eraAs(lang: HxLanguageCode, date: UTCDate, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedEra {
		return DateLocaleFormatUtils.findNotGregorianProvider(lang)?.eraAs?.(date, partsOf, lang) ?? '';
	}

	/**
	 * Format the era name for the given date and locale.
	 *
	 * - empty string when {@link gregorian} is true
	 * - or see {@link eraAs}
	 */
	static formatEra(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): HxFormattedEra {
		if (gregorian) {
			return '';
		}
		return DateLocaleFormatUtils.eraAs(lang, date, () => {
			const format = DateLocaleFormatUtils.findFormat(lang, false);
			return format.formatToParts(date.cloneAsJsDate());
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
	 * Delegates to the matching non-Gregorian locale provider,
	 * or uses the year part, and concatenates the literal part after the year part when existing.
	 */
	static yearAs(lang: HxLanguageCode, date: UTCDate, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedYear {
		const ret = DateLocaleFormatUtils.findNotGregorianProvider(lang)?.yearAs?.(date, partsOf, lang);
		if (ret == null || ret.trim().length === 0) {
			const yearAndLiteral = DateLocaleFormatUtils.findYearAndLiteralFromFormattedParts(partsOf);
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
	static formatYear(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): HxFormattedYear {
		if (gregorian) {
			return String(date.getFullYear()).padStart(4, '0');
		}
		return DateLocaleFormatUtils.yearAs(lang, date, () => {
			const format = DateLocaleFormatUtils.findFormat(lang, gregorian);
			return format.formatToParts(date.cloneAsJsDate());
		});
	}

	/**
	 * - Uses the month part
	 * - and concat with the literal part after month part when existing
	 */
	static monthAs(date: UTCDate, parts: Array<Intl.DateTimeFormatPart>): HxFormattedMonth {
		const partIndex = parts.findIndex(part => part.type === 'month');
		if (partIndex < 0) {
			return String(date.getMonthIndex() + 1);
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
	static formatMonth(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): HxFormattedMonth {
		const format = DateLocaleFormatUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date.cloneAsJsDate());
		return DateLocaleFormatUtils.monthAs(date, parts);
	}

	/**
	 * Format the month component using the full (long) month name.
	 *
	 * See {@link monthAs}.
	 */
	static formatMonthLong(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): HxFormattedMonth {
		const format = DateLocaleFormatUtils.findMonthLongFormat(lang, gregorian);
		const parts = format.formatToParts(date.cloneAsJsDate());
		return DateLocaleFormatUtils.monthAs(date, parts);
	}

	/**
	 * Format the month component using the short month name.
	 *
	 * See {@link monthAs}.
	 */
	static formatMonthShort(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): HxFormattedMonth {
		const format = DateLocaleFormatUtils.findMonthShortFormat(lang, gregorian);
		const parts = format.formatToParts(date.cloneAsJsDate());
		return DateLocaleFormatUtils.monthAs(date, parts);
	}

	/**
	 * Format the month component using the narrow month name.
	 *
	 * See {@link monthAs}.
	 */
	static formatMonthNarrow(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): HxFormattedMonth {
		const format = DateLocaleFormatUtils.findMonthNarrowFormat(lang, gregorian);
		const parts = format.formatToParts(date.cloneAsJsDate());
		return DateLocaleFormatUtils.monthAs(date, parts);
	}

	/**
	 * - Uses the day part
	 * - when day part is not a number, then concat with the literal part after day part when existing
	 */
	static dayAs(date: UTCDate, parts: Array<Intl.DateTimeFormatPart>): HxFormattedDay {
		const partIndex = parts.findIndex(part => part.type === 'day');
		if (partIndex < 0) {
			return String(date.getDayOfMonth());
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
	static formatDay(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): HxFormattedDay {
		const format = DateLocaleFormatUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date.cloneAsJsDate());
		return DateLocaleFormatUtils.dayAs(date, parts);
	}

	/**
	 * Format the month and day components together in a single locale-aware call.
	 *
	 * See {@link monthAs}, {@link dayAs}.
	 */
	static formatMonthAndDay(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): [HxFormattedMonth, HxFormattedDay] {
		const format = DateLocaleFormatUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date.cloneAsJsDate());
		return [
			DateLocaleFormatUtils.monthAs(date, parts),
			DateLocaleFormatUtils.dayAs(date, parts)
		];
	}

	/**
	 * Format a full date including era, year, month, day, and a week of weekday labels.
	 *
	 * @returns a tuple of {@code [era, year, month, day, weekdays]} where
	 *          {@code weekdays} is an array of 7 weekday labels starting from Sunday.
	 */
	static formatDate(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): [HxFormattedEra, HxFormattedYear, HxFormattedMonth, HxFormattedDay, HxFormattedWeekdays] {
		const format = DateLocaleFormatUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date.cloneAsJsDate());
		const partsOf = () => parts;
		const era = DateLocaleFormatUtils.eraAs(lang, date, partsOf);
		const year = DateLocaleFormatUtils.yearAs(lang, date, partsOf);
		const month = DateLocaleFormatUtils.monthAs(date, parts);
		const day = DateLocaleFormatUtils.dayAs(date, parts);
		const weekday = DateLocaleFormatUtils.weekdayAs(date, parts);
		const weekdays: HxFormattedWeekdays = [];
		// 0 - 6, sun is 0.
		const dayOfWeek = date.getDay();
		for (let i = 0; i <= 6; i++) {
			if (i === dayOfWeek) {
				weekdays.push(weekday);
			} else {
				const d = UTCDate.cloneOf(date);
				d.setDayOfMonth(d.getDayOfMonth() + (i - dayOfWeek));
				const parts = format.formatToParts(d.cloneAsJsDate());
				const weekday = DateLocaleFormatUtils.weekdayAs(d, parts);
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
	static formatDateInNumeric(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): [HxFormattedEra, number, number, number] {
		if (gregorian) {
			return ['', date.getFullYear(), date.getMonthIndex() + 1, date.getDayOfMonth()];
		} else {
			const format = DateLocaleFormatUtils.findNumericFormat(lang);
			const parts = format.formatToParts(date.cloneAsJsDate());
			const era = DateLocaleFormatUtils.eraAs(lang, date, () => parts);
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

	/**
	 * Uses the weekday part, and strips the first char if it is 周/週.
	 */
	static weekdayAs(_date: UTCDate, parts: Array<Intl.DateTimeFormatPart>): HxFormattedWeekday {
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
	static formatWeekday(date: UTCDate, lang: HxLanguageCode, gregorian: boolean): HxFormattedWeekday {
		const format = DateLocaleFormatUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date.cloneAsJsDate());
		return DateLocaleFormatUtils.weekdayAs(date, parts);
	}

	/**
	 * Converts a weekday index in the {@link Intl.Locale} weekInfo convention
	 * (1 = Monday, 7 = Sunday) to the short weekday key.
	 *
	 * @param index - weekday index, 1 (Monday) to 7 (Sunday)
	 * @returns the short weekday key
	 */
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
					weekends: weekend.map(v => DateLocaleFormatUtils.convertToShortWeekday(v)),
					firstDayOfWeek: DateLocaleFormatUtils.convertToShortWeekday(firstDay)
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
					weekends: weekend.map(v => DateLocaleFormatUtils.convertToShortWeekday(v)),
					firstDayOfWeek: DateLocaleFormatUtils.convertToShortWeekday(firstDay)
				};
			} else {
				return {weekends: ['sat', 'sun'] as Array<HxDateWeekendDay>, firstDayOfWeek: 'sun' as HxDateWeekendDay};
			}
		} catch {
			return {weekends: ['sat', 'sun'] as Array<HxDateWeekendDay>, firstDayOfWeek: 'sun' as HxDateWeekendDay};
		}
	};
}
