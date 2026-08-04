import type {HxLanguageCode} from '../../contexts';
import type {HxDateTimeValue, HxDateWeekendDay} from '../../types';
import {NumberUtils} from '../number';
import {DateMoveInternalUtils} from './date-move-internal';
import type {
	ComputedDays,
	HxDateTimeFormatCalendar,
	HxFormattedDay,
	HxFormattedEra,
	HxFormattedMonth,
	HxFormattedWeekday,
	HxFormattedWeekdays,
	HxFormattedYear
} from './date-types';

export interface NotGregorianLocaleUtils {
	accept(lang: HxLanguageCode): boolean;
	/**
	 * Return this calendar of {@link Intl.DateTimeFormat}.
	 *
	 * If the calendar value of {@link Intl.DateTimeFormat} does not need to be changed, there is no need to specify one.
	 */
	calendar?(): string;
	/**
	 * If no {@link calendar} is specified, there is no need to specify supported languages.
	 */
	supportedLanguages?(): Array<HxLanguageCode>;
	/**
	 * If there is no special specification for the era, there is no need to specify one.
	 */
	eraAs?(lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedEra;
	/**
	 * If there is no special specification for the year, there is no need to specify one.
	 */
	yearAs?(lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedYear;
	/**
	 * Compute year label, all given parameters are formatted by {@link Intl.DateTimeFormat}.
	 * The year label is used in datetime input popup for showing the current year.
	 *
	 * If the year label is using the default, there is no need to specify one.
	 */
	labelOfYear?(lang: HxLanguageCode, value: Required<HxDateTimeValue>, era: string, year: string): string;
	/**
	 * Compute month label, all given parameters are formatted by {@link Intl.DateTimeFormat}.
	 * The month label is used in datetime input popup for showing the current month.
	 *
	 * If the month label is using the default, there is no need to specify one.
	 */
	labelOfMonth?(lang: HxLanguageCode, value: Required<HxDateTimeValue>, era: string, year: string, month: string): string;
	/**
	 * Compute the era of given days. Make sure the given days have 42 days and contain days of a full month.
	 * Returns a map that tells the datetime input popup which era to show for a specific day.
	 *
	 * If no specific era for days, there is no need to specify one.
	 */
	eraOfDays?(lang: HxLanguageCode, days: ComputedDays): Map<Date, string>;
	/**
	 * Tells the datetime input popup whether the previous month should be navigable from the given
	 * first day of the current month.
	 *
	 * <p>Only needs to be specified when the calendar's year/month/day
	 * boundaries do not align with Gregorian (e.g. the initial partial year
	 * of the Saka or Persian calendar where months 1–9 do not exist).</p>
	 */
	isPreviousMonthAllowed?(lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean;
	/**
	 * Tells the datetime input popup whether the previous year should be navigable from the given
	 * first day of the current month.
	 *
	 * <p>Only needs to be specified when the calendar's year/month/day
	 * boundaries do not align with Gregorian (e.g. the initial partial year of the
	 * Saka or Persian calendar).</p>
	 */
	isPreviousYearAllowed?(lang: HxLanguageCode, firstDayOfCurrentMonthOfGregory: Date): boolean;
}

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
		'ar-AE': 'islamic-civil', // United Arab Emirates
		'ar-BH': 'islamic-civil', // Bahrain
		'ar-DZ': 'islamic', // Algeria
		'ar-IQ': 'islamic-civil', // Iraq
		'ar-KW': 'islamic-civil', // Kuwait
		'ar-LB': 'islamic-civil', // Lebanon
		'ar-MA': 'islamic', // Morocco
		'ar-OM': 'islamic-umalqura', // Oman
		'ar-QA': 'islamic-civil', // Qatar
		'ar-SA': 'islamic-umalqura', // Saudi Arabia
		'ar-SD': 'islamic-umalqura', // Sudan
		'ar-SY': 'islamic-civil', // Syria
		'ar-TN': 'islamic', // Tunisia
		'ar-YE': 'islamic-umalqura', // Yemen
		he: 'hebrew', // Hebrew, Israel
		'he-IL': 'hebrew' // Hebrew, Israel
	};
	private static readonly NOT_GREGORY_LOCALE_UTILS: Array<NotGregorianLocaleUtils> = [];
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

	static enableNotGregorianLocaleUtils(utils: NotGregorianLocaleUtils): typeof DateLocaleUtils {
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

	static disableNotGregorianLocaleUtils(utils: NotGregorianLocaleUtils): typeof DateLocaleUtils {
		const index = DateLocaleUtils.NOT_GREGORY_LOCALE_UTILS.indexOf(utils);
		if (index !== -1) {
			DateLocaleUtils.NOT_GREGORY_LOCALE_UTILS.splice(index, 1);
			utils.supportedLanguages?.()?.forEach(locale => {
				delete DateLocaleUtils.CALENDAR_MAP[locale];
			});
		}
		return DateLocaleUtils;
	}

	static findNotGregoryUtils(lang: HxLanguageCode): NotGregorianLocaleUtils | undefined {
		return DateLocaleUtils.NOT_GREGORY_LOCALE_UTILS.find(utils => utils.accept(lang));
	}

	/** Formats a {@code Date} as a {@code YYYY-MM-DD} string. */
	// noinspection JSUnusedGlobalSymbols
	static asDateString(date: Date): string {
		return [
			String(date.getFullYear()).padStart(4, '0'),
			String(date.getMonth() + 1).padStart(2, '0'),
			String(date.getDate()).padStart(2, '0')
		].join('-');
	}

	/**
	 * Resolve the calendar type for a given locale.
	 * Falls back to {@code 'gregory'} when no explicit mapping exists.
	 */
	static resolveCalendar(lang: HxLanguageCode): string {
		const found: HxDateTimeFormatCalendar | undefined = DateLocaleUtils.CALENDAR_MAP[lang as HxLanguageCode];
		return found || DateLocaleUtils.GREGORY;
	}

	static isUsingGregoryCalendar(lang: HxLanguageCode): boolean {
		return DateLocaleUtils.resolveCalendar(lang) === DateLocaleUtils.GREGORY;
	}

	/**
	 * Gregorian leap-year rule: divisible by 400, or divisible by 4 but not 100.
	 * Note: JavaScript {@code Date} uses proleptic Gregorian, so century years
	 * like 1500 are treated as non-leap even though they were leap in the Julian
	 * calendar actually used at that time.
	 */
	static isGregorianLeapYear(year: number): boolean {
		return year % 400 === 0 || (year % 4 === 0 && year % 100 != 0);
	}

	/**
	 * Returns the number of Gregorian leap years in the range {@code [1, year - 1]}.
	 *
	 * <p>Uses the proleptic Gregorian rule: every 4th year is leap, except
	 * century years (÷100) which are only leap if also divisible by 400.
	 * This count is useful for converting a year to the number of days
	 * elapsed since the epoch (often paired with {@code year * 365} for a
	 * total day count).</p>
	 *
	 * @param year - the exclusive upper bound (must be ≥ 1)
	 * @returns number of leap years from year 1 up to {@code year - 1}
	 */
	static leapYearCountBefore(year: number): number {
		const base = year - 1;
		return Math.floor(base / 4) - Math.floor(base / 100) + Math.floor(base / 400);
	}

	/**
	 * Julian calendar leap-year rule: every year divisible by 4 is a leap year.
	 * Only valid for years before 1582 (the Gregorian reform). After 1582,
	 * use {@link isGregorianLeapYear} instead.
	 */
	static isJulianLeapYear(year: number): boolean {
		return year < 1582 && year % 4 === 0;
	}

	/**
	 * Returns {@code true} when the locale uses an Islamic calendar variant
	 * (tabular Islamic, Islamic Civil, Umm Al-Qura, etc.).
	 */
	// noinspection JSUnusedGlobalSymbols
	static isIslamic(lang: HxLanguageCode): boolean {
		const calendar = DateLocaleUtils.resolveCalendar(lang);
		return calendar === 'islamic' || calendar.startsWith('islamic-');
	}

	/** Returns {@code true} when the locale uses the Hebrew calendar. */
	// noinspection JSUnusedGlobalSymbols
	static isHebrew(lang: HxLanguageCode): boolean {
		const calendar = DateLocaleUtils.resolveCalendar(lang);
		return calendar === 'hebrew';
	}

	/**
	 * Hebrew leap-year check using the 19-year Metonic cycle.
	 * Leap years occur at positions 3, 6, 8, 11, 14, 17, 19 (mod 0).
	 * Verified against 2026 years of precomputed calendar data with zero exceptions.
	 */
	// noinspection JSUnusedGlobalSymbols
	static isHebrewLeapYear(yearOfCalendar: number): boolean {
		return [0, 3, 6, 8, 11, 14, 17].includes(yearOfCalendar % 19);
	}

	/** Returns {@code true} when the locale uses the Persian (Solar Hijri) calendar. */
	// noinspection JSUnusedGlobalSymbols
	static isPersian(lang: HxLanguageCode): boolean {
		const calendar = DateLocaleUtils.resolveCalendar(lang);
		return calendar === 'persian';
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
		return DateLocaleUtils.findNotGregoryUtils(lang)?.eraAs?.(lang, date, partsOf) ?? '';
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
		const ret = DateLocaleUtils.findNotGregoryUtils(lang)?.yearAs?.(lang, date, partsOf);
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
	 * compute year label, all given parameters are formatted by {@link Intl.DateTimeFormat}
	 *
	 * Uses full year when gregorian.
	 * Or delegates to the matching non-Gregorian locale utils.
	 * Or returns concatenated ear and year when delegate not exists.
	 */
	static labelOfYear(lang: HxLanguageCode, gregorian: boolean, value: Required<HxDateTimeValue>, era: string, year: string): string {
		if (gregorian) {
			return String(DateMoveInternalUtils.asJsDate(value).getFullYear());
		} else {
			return DateLocaleUtils.findNotGregoryUtils(lang)?.labelOfYear?.(lang, value, era, year) || `${era}${year}`;
		}
	}

	/**
	 * compute month label, all given parameters are formatted by {@link Intl.DateTimeFormat}
	 *
	 * Uses given month when gregorian.
	 * Or delegates to the matching non-Gregorian locale utils.
	 * Or returns given month when delegate not exists.
	 */
	static labelOfMonth(lang: HxLanguageCode, gregorian: boolean, value: Required<HxDateTimeValue>, era: string, year: string, month: string): string {
		if (gregorian) {
			return month;
		} else {
			return DateLocaleUtils.findNotGregoryUtils(lang)?.labelOfMonth?.(lang, value, era, year, month) || month;
		}
	}

	/**
	 * compute the era of given days
	 * Returns empty map when gregorian.
	 * Or delegates to the matching non-Gregorian locale utils.
	 * Or returns empty map when delegate not exists.
	 */
	static eraOfDays(lang: HxLanguageCode, gregorian: boolean, days: ComputedDays): Map<Date, string> {
		if (gregorian) {
			return new Map<Date, string>();
		} else {
			return DateLocaleUtils.findNotGregoryUtils(lang)?.eraOfDays?.(lang, days) ?? new Map<Date, string>();
		}
	}

	/**
	 * Checks whether the previous month is navigable from the given first day
	 * of the current month.
	 *
	 * <p>For Gregorian calendars the only boundary is the epoch itself
	 * (0001/01/01). For non-Gregorian calendars this delegates to the
	 * locale plugin's {@code isPreviousMonthAllowed} hook, falling back
	 * to the Gregorian epoch boundary when no hook is registered.</p>
	 *
	 * @param lang                            - locale language code
	 * @param gregorian                       - whether the calendar is Gregorian
	 * @param firstDayOfCurrentMonthOfGregory - the Gregorian {@code Date} of the first day of the current calendar month
	 * @returns {@code true} when the previous month is allowed
	 */
	static isPreviousMonthAllowed(lang: HxLanguageCode, gregorian: boolean, firstDayOfCurrentMonthOfGregory: Date): boolean {
		if (gregorian) {
			return firstDayOfCurrentMonthOfGregory.getFullYear() > 1 || firstDayOfCurrentMonthOfGregory.getMonth() > 0;
		}
		const utils = DateLocaleUtils.findNotGregoryUtils(lang);
		if (utils != null && utils.isPreviousMonthAllowed != null) {
			return utils.isPreviousMonthAllowed(lang, firstDayOfCurrentMonthOfGregory);
		} else {
			return firstDayOfCurrentMonthOfGregory.getFullYear() > 1 || firstDayOfCurrentMonthOfGregory.getMonth() > 0;
		}
	}

	/**
	 * Checks whether the previous year is navigable from the given first day
	 * of the current month.
	 *
	 * <p>For Gregorian calendars the previous year is disallowed for any
	 * month in year 1 (there is no year 0). For non-Gregorian calendars
	 * this delegates to the locale plugin's {@code isPreviousYearAllowed}
	 * hook, falling back to the Gregorian epoch when no hook is registered.</p>
	 *
	 * @param lang                            - locale language code
	 * @param gregorian                       - whether the calendar is Gregorian
	 * @param firstDayOfCurrentMonthOfGregory - the Gregorian {@code Date} of the first day of the current calendar month
	 * @returns {@code true} when the previous year is allowed
	 */
	static isPreviousYearAllowed(lang: HxLanguageCode, gregorian: boolean, firstDayOfCurrentMonthOfGregory: Date): boolean {
		if (gregorian) {
			return firstDayOfCurrentMonthOfGregory.getFullYear() > 1;
		}
		const utils = DateLocaleUtils.findNotGregoryUtils(lang);
		if (utils != null && utils.isPreviousYearAllowed != null) {
			return utils.isPreviousYearAllowed(lang, firstDayOfCurrentMonthOfGregory);
		} else {
			return firstDayOfCurrentMonthOfGregory.getFullYear() > 1;
		}
	}
}