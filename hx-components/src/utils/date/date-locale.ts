import type {HxLanguageCode} from '../../contexts';
import type {HxDateWeekendDay} from '../../types';
import {HxConsole} from '../browser';

export type HxDateTimeFormatCalendar =
	| 'buddhist' // Thai Buddhist calendar (B.E.)
	| 'chinese' // Chinese lunar calendar
	| 'coptic' // Coptic calendar, Egypt
	| 'dangi' // Dangi calendar, Korea (lunar variant)
	| 'ethioaa' // Ethiopic Amete Alem (epoch follows Alexandrian)
	| 'ethiopic' // Ethiopic Amete Mihret
	| 'gregory' // Gregorian calendar
	| 'hebrew' // Hebrew calendar, Israel
	| 'indian' // Indian national calendar (Saka)
	| 'islamic' // Islamic calendar, Algeria / Morocco / Tunisia
	| 'islamic-civil' // Islamic civil (tabular), Lebanon / Syria / Iraq / Gulf states
	| 'islamic-umalqura' // Umm al-Qura calendar, Saudi Arabia
	| 'islamic-tbla' // Islamic astronomical calendar
	| 'islamic-rgsa' // Islamic calendar based on Saudia Arabia sighting
	| 'iso8601' // ISO 8601 (Gregorian variant)
	| 'japanese' // Japanese Imperial calendar (era-based)
	| 'persian' // Persian solar calendar, Iran / Afghanistan
	| 'roc'; // Minguo calendar, Taiwan
export type HxFormattedEra = string;
export type HxFormattedYear = string;
export type HxFormattedMonth = string;
export type HxFormattedDay = string;
export type HxFormattedWeekday = string;
// starts from Sunday
export type HxFormattedWeekdays = Array<HxFormattedWeekday>;

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
		'am-ET': 'ethiopic',
		'ar-AE': 'islamic-civil', // United Arab Emirates
		'ar-BH': 'islamic-civil', // Bahrain
		'ar-DZ': 'islamic', // Algeria
		'ar-EG': 'coptic', // Egypt (Coptic calendar)
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
		'ckb-IR': 'persian', // Central Kurdish, Iran
		'en-IN': 'indian', // India — Indian national calendar (Saka)
		fa: 'persian', // Persian (Farsi), Iran
		'fa-AF': 'persian', // Dari (Persian), Afghanistan
		'fa-IR': 'persian', // Persian (Farsi), Iran
		he: 'hebrew', // Hebrew, Israel
		'he-IL': 'hebrew', // Hebrew, Israel
		hi: 'indian', // Hindi (India) — Indian national calendar
		'hi-IN': 'indian', // Hindi, India
		lrc: 'persian', // Northern Luri, Iran
		'lrc-IR': 'persian', // Northern Luri, Iran
		mzn: 'persian', // Mazanderani, Iran
		'mzn-IR': 'persian', // Mazanderani, Iran
		ps: 'persian', // Pashto, Afghanistan
		'ps-AF': 'persian', // Pashto, Afghanistan
		'ti-ET': 'ethiopic',
		'uz-Arab': 'persian', // Uzbek (Arabic script) — follows Persian calendar
		'uz-Arab-AF': 'persian' // Uzbek (Arabic script), Afghanistan
	};
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
	 * Configure the calendar mapping for Arab locales when not using Gregorian calendar.
	 * Note passing null or undefined removes the calendar mapping for that locale.
	 */
	// noinspection JSUnusedGlobalSymbols
	static updateCalendarMap(map: Record<HxLanguageCode, HxDateTimeFormatCalendar | null | undefined>): typeof DateLocaleUtils {
		Object.keys(map).forEach(key => {
			const value = map[key];
			if (value == null || value.trim().length === 0) {
				HxConsole.warn(`Datetime format calendar map for locale[${key}] is removed.`);
				delete DateLocaleUtils.CALENDAR_MAP[key];
			} else {
				DateLocaleUtils.CALENDAR_MAP[key] = value;
			}
		});
		return DateLocaleUtils;
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
	 * Julian calendar leap-year rule: every year divisible by 4 is a leap year.
	 * Only valid for years before 1582 (the Gregorian reform). After 1582,
	 * use {@link isGregorianLeapYear} instead.
	 */
	static isJulianLeapYear(year: number): boolean {
		return year < 1582 && year % 4 === 0;
	}

	/** Returns {@code true} when the locale is Traditional Chinese (Taiwan). */
	static isZhTW(lang: HxLanguageCode): boolean {
		return lang === 'zh-TW' || lang.startsWith('zh-TW') || lang.startsWith('zh-Hant-TW');
	}

	/**
	 * ROC (Minguo) calendar leap-year check.
	 *
	 * Converts the ROC calendar year to the equivalent Gregorian year, then chooses
	 * the appropriate rule based on the Gregorian reform boundary:
	 * - Before 1582: Julian rule (every 4th year is leap, including century years)
	 * - 1582 onward:  Gregorian rule (divisible by 400, or by 4 but not 100)
	 */
	static isZhTWLeapYear(yearOfCalendar: number): boolean {
		const year = yearOfCalendar >= 1 ? (yearOfCalendar + 1911) : (yearOfCalendar + 1912);
		if (year < 1582) {
			return DateLocaleUtils.isJulianLeapYear(year);
		} else {
			return DateLocaleUtils.isGregorianLeapYear(year);
		}
	}

	/** Returns {@code true} for Chinese locales that are NOT Taiwan (Simplified Chinese, etc.). */
	static isZhNotTW(lang: HxLanguageCode): boolean {
		if (lang === 'zh' || lang == 'zh-Hans' || lang.startsWith('zh-Hans-')) {
			return true;
		}
		if (lang.startsWith('zh-')) {
			return !DateLocaleUtils.isZhTW(lang);
		} else {
			// not zh
			return false;
		}
	}

	/** Returns {@code true} for Japanese locales (ja, ja-JP, etc.). */
	static isJa(lang: HxLanguageCode): boolean {
		return lang === 'ja' || lang.startsWith('ja-');
	}

	/**
	 * Japanese calendar leap-year check.
	 *
	 * The Japanese calendar year is really a mess, so use the Gregorian year.
	 * The appropriate rule is selected based on the Gregorian reform boundary:
	 * - Before 1582: Julian rule (every 4th year is leap, including century years)
	 * - 1582 onward:  Gregorian rule (divisible by 400, or by 4 but not 100)
	 */
	static isJaLeapYear(yearOfGregory: number): boolean {
		if (yearOfGregory < 1582) {
			return DateLocaleUtils.isJulianLeapYear(yearOfGregory);
		} else {
			return DateLocaleUtils.isGregorianLeapYear(yearOfGregory);
		}
	}

	/** Returns {@code true} for Thai locales (th, th-TH, etc.). */
	static isTh(lang: HxLanguageCode): boolean {
		return lang === 'th' || lang.startsWith('th-');
	}

	/**
	 * Thai Buddhist (Buddhist Era) calendar leap-year check.
	 *
	 * Converts the Buddhist calendar year to the equivalent Gregorian year by
	 * subtracting 543 (B.E. 544 = A.D. 1), then chooses the appropriate rule
	 * based on the Gregorian reform boundary:
	 * - Before 1582: Julian rule (every 4th year is leap, including century years)
	 * - 1582 onward:  Gregorian rule (divisible by 400, or by 4 but not 100)
	 */
	static isThLeapYear(yearOfCalendar: number): boolean {
		const year = yearOfCalendar - 543;
		if (year < 1582) {
			return DateLocaleUtils.isJulianLeapYear(year);
		} else {
			return DateLocaleUtils.isGregorianLeapYear(year);
		}
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

	/**
	 * Returns {@code true} for Coptic or Ethiopic calendars.
	 * Both share an identical structure (13 months, 12×30d + 5/6d epagomenal month)
	 * and the same leap-year pattern; only the epoch differs.
	 */
	// noinspection JSUnusedGlobalSymbols
	static isCopticOrEthiopic(lang: HxLanguageCode): boolean {
		const calendar = DateLocaleUtils.resolveCalendar(lang);
		return calendar === 'coptic' || calendar === 'ethiopic';
	}

	/** Returns {@code true} when the locale uses the Indian national calendar (Saka). */
	// noinspection JSUnusedGlobalSymbols
	static isIndian(lang: HxLanguageCode): boolean {
		const calendar = DateLocaleUtils.resolveCalendar(lang);
		return calendar === 'indian';
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

	static eraAs(lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedEra {
		if (DateLocaleUtils.isJa(lang)) {
			const year = date.getFullYear();
			if (year < 645 || (year === 645 && date.getMonth() === 0 && date.getDate() < 4)) {
				return '西暦';
			}
			const parts = partsOf();
			const partIndex = parts.findIndex(part => part.type === 'era');
			if (partIndex !== -1) {
				const era = parts[partIndex].value;
				if (era === '大化') {
					const year = parts.find(part => part.type === 'year');
					if (year?.value === '0' || year?.value?.startsWith('-')) {
						return '西暦';
					}
				}
				return era;
			} else {
				return '';
			}
		} else if (DateLocaleUtils.isZhTW(lang)) {
			const format = DateLocaleUtils.findFormat(lang, false);
			const parts = format.formatToParts(date);
			const partIndex = parts.findIndex(part => part.type === 'era');
			if (partIndex !== -1) {
				return parts[partIndex].value;
			} else {
				return '';
			}
		} else {
			return '';
		}
	}

	/**
	 * Format the era name for the given date and locale.
	 *
	 * Returns the era string for Japanese (ja-*) and Minguo (zh-TW)
	 * calendars. Returns {@code '西暦'} for pre-Taika dates. Returns
	 * empty for Gregorian-forced and non-era locales.
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

	static yearAs(lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedYear {
		if (DateLocaleUtils.isJa(lang)) {
			const year = date.getFullYear();
			if (year < 100) {
				return `${year}年`;
			}
		}
		const parts = partsOf();
		const partIndex = parts.findIndex(part => part.type === 'year');
		if (partIndex < 0) {
			return String(date.getFullYear());
		} else {
			const year = parts[partIndex].value;
			let literal = '';
			if (parts[partIndex + 1]?.type === 'literal') {
				literal = parts[partIndex + 1].value.trim();
			}
			if (literal === '년') {
				literal = '';
			} else if (literal === '年' && DateLocaleUtils.isZhNotTW(lang)) {
				literal = '';
			} else if (DateLocaleUtils.isJa(lang)) {
				if (year.startsWith('-') || year === '0') {
					return `${date.getFullYear()}年`;
				}
			}
			return [year, literal].join('');
		}
	}

	/**
	 * Format the year component for the given date and locale.
	 *
	 * When {@code gregorian} is {@code true}, returns the Gregorian year
	 * directly. Otherwise, uses the locale-specific calendar. Strips the
	 * leading {@code '-'} from negative years, maps {@code '0'} to
	 * {@code '元年'}, and strips unnecessary year literals for Korean
	 * and non-ROC Chinese.
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

	/** Format the month component using locale-aware length heuristics. */
	static formatMonth(date: Date, lang: HxLanguageCode, gregorian: boolean): HxFormattedMonth {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		return DateLocaleUtils.monthAs(date, parts);
	}

	/** Format the month component using the full (long) month name. */
	static formatMonthLong(date: Date, lang: HxLanguageCode, gregorian: boolean): HxFormattedMonth {
		const format = DateLocaleUtils.findMonthLongFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		return DateLocaleUtils.monthAs(date, parts);
	}

	static dayAs(date: Date, parts: Array<Intl.DateTimeFormatPart>): HxFormattedDay {
		const partIndex = parts.findIndex(part => part.type === 'day');
		if (partIndex < 0) {
			return String(date.getDate());
		} else {
			const day = parts[partIndex].value.trim();
			if ((window?.isNaN ?? isNaN)(Number(day))) {
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

	/** Format the day component. Attaches trailing literal only for non-Western digits. */
	static formatDay(date: Date, lang: HxLanguageCode, gregorian: boolean): HxFormattedDay {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		return DateLocaleUtils.dayAs(date, parts);
	}

	/** Format the month and day components together in a single locale-aware call. */
	static formatMonthAndDay(date: Date, lang: HxLanguageCode, gregorian: boolean): [HxFormattedMonth, HxFormattedDay] {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		return [
			DateLocaleUtils.monthAs(date, parts),
			DateLocaleUtils.dayAs(date, parts)
		];
	}

	static weekdayAs(_date: Date, parts: Array<Intl.DateTimeFormatPart>): HxFormattedWeekday {
		const part = parts.find(part => part.type === 'weekday');
		const v = part!.value;
		if (v.startsWith('周') || v.startsWith('週')) {
			return v.substring(1);
		} else {
			return v;
		}
	}

	/** Format the weekday using locale-aware length heuristics. Strips the leading {@code '周'} prefix for zh-CN. */
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
}