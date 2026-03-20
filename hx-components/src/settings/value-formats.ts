/**
 * Value formatting utilities for Hx components
 * Provides type definitions and implementation for number, date/time formatting
 * Supports predefined formats, custom format registration, and language localization
 */
import dayjs from 'dayjs';
import {type HxContext, type HxLanguageCode, HxLanguageContext} from '../contexts';

/**
 * Number format codes:
 * nf0-nf6: Number format with 0 - 6 fixed fraction digits, with thousands grouping enabled
 * ng: Number format with thousands grouping only, no fixed fraction digits
 */
export type HxNumberFormatCode = | 'nf0' | 'nf1' | 'nf2' | 'nf3' | 'nf4' | 'nf5' | 'nf6' | 'ng';
/**
 * Date/time format codes:
 * df: Date format, output as YYYY-MM-DD
 * tf: Time format, output as HH:mm:ss
 * dtf: Date and time format, output as YYYY-MM-DD HH:mm:ss
 */
export type HxDateFormatCode = 'df' | 'tf' | 'dtf';
/** Combined type of all predefined format codes */
export type HxPredefinedFormatCode = HxNumberFormatCode | HxDateFormatCode;
/** Extended format code type, supports language suffix (e.g. 'custom@zh-CN') */
export type HxFormatExtCode = string | `${string}@${HxLanguageCode}`;
/** Union type of all supported format codes (predefined + extended) */
export type HxFormatCode =
	| HxPredefinedFormatCode
	// Extended format code, registered via "HxValueFormatSettings.install"
	| HxFormatExtCode;
/**
 * Format function type
 * @param value - Value to format
 * @param context - Hx component context, only provided when called within Hx components
 * @returns Formatted string
 */
export type HxFormatFunc = (value?: any, context?: HxContext) => string;
/** Format definition type: can be format code string or custom format function */
export type HxFormats = HxFormatCode | HxFormatFunc;

/** Predefined format map key type: format code with optional language suffix */
type PredefinedKey = `${HxPredefinedFormatCode}@${HxLanguageCode}` | HxPredefinedFormatCode;
/** Predefined format functions storage type */
type PredefinedFuncs = Map<PredefinedKey, HxFormatFunc>;

/**
 * Global format settings and formatting utility class
 * Provides predefined formatting, custom format registration, and unified formatting entry
 *
 * @example
 * // Format a number with 2 decimal places
 * const formattedNumber = HxFmt.format(12345.678, context, 'nf2'); // "12,345.68"
 *
 * @example
 * // Format a date string to YYYY-MM-DD format
 * const formattedDate = HxFmt.format('2023-10-15T14:30:45Z', context, 'df'); // "2023-10-15"
 *
 * @example
 * // Install a custom format
 * HxFmt.install('currency', (value) => `$${Number(value).toFixed(2)}`);
 * const formattedCurrency = HxFmt.format(99.9, context, 'currency'); // "$99.90"
 */
export class HxFormatSettings {
	/** Storage for predefined format functions (built-in number/date formats) */
	private static readonly PredefinedMap: PredefinedFuncs = HxFormatSettings.createPredefinedFormats();
	/** Storage for user installed custom format functions */
	private static readonly CustomMap: Map<HxFormatExtCode, HxFormatFunc> = new Map();
	/** Cache for resolved format functions to improve repeated formatting performance */
	private static readonly CacheMap: Map<HxFormatExtCode, HxFormatFunc> = new Map();

	/**
	 * Create Intl.NumberFormat instance for specified language and fraction digits
	 * @param languageCode - Target language code for localization
	 * @param fractionDigits - Number of decimal places, -1 means dynamic fraction digits (0 to 100)
	 * @returns Configured Intl.NumberFormat instance
	 */
	private static createNumberFormat(languageCode: HxLanguageCode, fractionDigits: number): Intl.NumberFormat {
		if (fractionDigits < 0) {
			// Dynamic fraction digits range: 0 to 100, with thousands grouping
			return new Intl.NumberFormat(languageCode, {
				useGrouping: true,
				minimumFractionDigits: 0,
				maximumFractionDigits: 100
			});
		} else {
			// Fixed fraction digits with thousands grouping
			return new Intl.NumberFormat(languageCode, {
				useGrouping: true,
				minimumFractionDigits: fractionDigits,
				maximumFractionDigits: fractionDigits
			});
		}
	}

	/**
	 * Create number format function from Intl.NumberFormat instance
	 * @param format - Configured Intl.NumberFormat instance
	 * @returns Format function that accepts any value type and returns formatted string
	 */
	private static createNumberFormatFunc(format: Intl.NumberFormat): HxFormatFunc {
		return (value?: any, _context?: HxContext): string => {
			// Return empty string for null/undefined values
			if (value == null) {
				return '';
			}
			// Handle different value types appropriately
			switch (typeof value) {
				case 'string': {
					const s = (value as string).trim();
					if (s.length === 0) {
						return value;
					}
					// Try to convert string to number for formatting
					const v = Number(s);
					if (isNaN(v)) {
						// Return original string if not a valid number
						return value;
					} else {
						return format.format(v);
					}
				}
				case 'number':
				case 'bigint': {
					// Directly format numeric types
					return format.format(value as number | bigint);
				}
				case 'boolean': {
					// Convert boolean to string representation
					return (value as boolean) ? 'true' : 'false';
				}
				case 'symbol': {
					// Convert symbol to string
					return (value as symbol).toString();
				}
				case 'object': {
					// Stringify object values
					return JSON.stringify(value as object);
				}
				case 'function': {
					// Convert function to string
					return (value as Function).toString();
				}
				default: {
					// Return original value for other types
					return value;
				}
			}
		};
	}

	/**
	 * Extract and compute timezone offset from date string
	 * @param value - Date string that may contain timezone information (Z, ±HH:mm, ±HHmm)
	 * @returns Timezone offset in minutes from UTC, undefined if no timezone information found
	 */
	private static computeTimezoneOffset(value: string): number | undefined {
		const regex = /(Z|[+-]\d{2}:?\d{2})$/;
		const matches = value.match(regex);

		if (matches == null) {
			return (void 0);
		}

		const tz = matches[1];
		if (tz === 'Z') {
			// UTC timezone
			return 0;
		}

		const op = tz[0];
		let time = tz.substring(1);
		time = time.replace(':', '');
		const hour = parseInt(time.substring(0, 2));
		const minute = parseInt(time.substring(2));
		const minutes = hour * 60 + minute;

		// Return offset in minutes from UTC
		return op === '+' ? minutes : -minutes;
	}

	/**
	 * Create date/time format function with specified dayjs format string
	 * @param format - Dayjs format string (e.g. 'YYYY-MM-DD HH:mm:ss')
	 * @returns Format function that accepts any value type and returns formatted date/time string
	 */
	private static createDateTimeFormatFunc(format: string): HxFormatFunc {
		return (value?: any, _context?: HxContext): string => {
			// Return empty string for null/undefined values
			if (value == null) {
				return '';
			}
			// Handle different value types appropriately
			switch (typeof value) {
				case 'string': {
					const s = (value as string).trim();
					if (s.length === 0) {
						return value;
					}
					// Parse string as dayjs instance
					let v = dayjs(s);
					if (v.isValid()) {
						// Timezone normalization algorithm: preserves literal date/time values from input string
						// regardless of system timezone, ensuring formatting results always match the exact
						// hour/minute/second values written in the input string.
						//
						// # Problem this solves:
						// dayjs default behavior converts timezone-aware dates to system local time.
						// For example, input "2023-10-15T14:30:45+05:00" on a UTC+8 system is automatically
						// converted to 2023-10-15 17:30 GMT+8, changing the literal hour value from 14 to 17.
						// This algorithm reverses that conversion to preserve the original literal values.
						//
						// # Algorithm Steps:
						// 1. Parse date string → dayjs object (automatically converted to system local time)
						// 2. Add input timezone offset → converts to UTC time that represents the literal input values
						// 3. Add system timezone offset → shifts back to local timezone while keeping literal values intact
						//
						// ============== Detailed Examples (system timezone = UTC+8, offset = -480 minutes) ==============
						//
						// ## Case 1: Z timezone (UTC+0)
						// Input string: "2023-10-15T14:30:45Z"
						// Step 1: parsed by dayjs → 2023-10-15 22:30 GMT+8 (converted to local time)
						// Step 2: timezoneOffset = 0 (Z = UTC+0) → add 0 → 22:30 GMT+8
						// Step 3: add system offset (-480 minutes = -8h) → 22:30 -8h = 14:30 GMT+8
						// Result: 14:30 (matches literal input hour)
						//
						// ## Case 2: Positive timezone offset (+HH:mm)
						// Input string: "2023-10-15T14:30:45+05:00"
						// Step 1: parsed by dayjs → 2023-10-15 17:30 GMT+8 (converted to local time)
						// Step 2: timezoneOffset = +300 minutes (+5h) → add 300 → 17:30 +5h = 22:30 GMT+8
						// Step 3: add system offset (-480 minutes = -8h) → 22:30 -8h = 14:30 GMT+8
						// Result: 14:30 (matches literal input hour)
						//
						// ## Case 3: Negative timezone offset (-HH:mm)
						// Input string: "2023-10-15T14:30:45-07:00"
						// Step 1: parsed by dayjs → 2023-10-16 05:30 GMT+8 (converted to local time)
						// Step 2: timezoneOffset = -420 minutes (-7h) → add -420 → 05:30 -7h = 22:30 GMT+8 (previous day)
						// Step 3: add system offset (-480 minutes = -8h) → 22:30 -8h = 14:30 GMT+8
						// Result: 14:30 (matches literal input hour)
						//
						// All cases preserve the exact literal hour/minute values from the input string,
						// regardless of the input's original timezone and the system's local timezone.
						const timezoneOffset = HxFormatSettings.computeTimezoneOffset(s);
						if (timezoneOffset != null) {
							v = v.add(timezoneOffset, 'minutes')
								.add(v.toDate().getTimezoneOffset(), 'minutes');
						}
						return v.format(format);
					} else {
						// Return original string if not a valid date
						return value;
					}
				}
				case 'number':
				case 'bigint': {
					// Numeric values are treated as raw strings, not as timestamps
					// to avoid ambiguity between different timestamp units (seconds/ms)
					return `${(value as number | bigint)}`;
				}
				case 'boolean': {
					// Convert boolean to string representation
					return (value as boolean) ? 'true' : 'false';
				}
				case 'symbol': {
					// Convert symbol to string
					return (value as symbol).toString();
				}
				case 'object': {
					if (value instanceof Date) {
						// JavaScript Date objects contain timezone information
						// We extract the exact year/month/day/hour/minute values
						// ignoring timezone offset to preserve the literal date/time values
						const v = dayjs()
							.year(value.getFullYear())
							.month(value.getMonth())
							.date(value.getDate())
							.hour(value.getHours())
							.minute(value.getMinutes())
							.second(value.getSeconds())
							.millisecond(value.getMilliseconds());
						return v.format(format);
					} else {
						// Stringify other object values
						return JSON.stringify(value as object);
					}
				}
				case 'function': {
					// Convert function to string
					return (value as Function).toString();
				}
				default: {
					// Return original value for other types
					return value;
				}
			}
		};
	}

	/**
	 * Initialize all predefined format functions
	 * @returns Map containing all predefined format functions
	 */
	private static createPredefinedFormats(): PredefinedFuncs {
		const map: PredefinedFuncs = new Map();
		// Initialize number formats for English language
		[-1, 0, 1, 2, 3, 4, 5, 6]
			.map(digits => {
				const format = HxFormatSettings.createNumberFormat('en', digits);
				const func = HxFormatSettings.createNumberFormatFunc(format);
				if (digits === -1) {
					// ng = number grouping format
					map.set(`ng@en`, func);
				} else {
					// nfX = number format with X fraction digits
					map.set(`nf${digits as 1 | 2 | 3 | 4 | 5 | 6}@en`, func);
				}
			});
		// Initialize date/time formats (language agnostic)
		map.set('df', HxFormatSettings.createDateTimeFormatFunc('YYYY-MM-DD'));
		map.set('tf', HxFormatSettings.createDateTimeFormatFunc('HH:mm:ss'));
		map.set('dtf', HxFormatSettings.createDateTimeFormatFunc('YYYY-MM-DD HH:mm:ss'));

		return map;
	}

	/**
	 * Clear format entries from specified map by code and optional language code
	 * @param map - Target map to clear entries from
	 * @param code - Format code to clear
	 * @param languageCode - Optional language code, if provided only clear entries for this language
	 */
	private static clearFromMap(map: Map<HxFormatExtCode, HxFormatFunc>, code: string, languageCode?: HxLanguageCode): void {
		if (languageCode == null || languageCode.trim().length === 0) {
			// No language specified: clear all entries matching code (with any language suffix)
			const prefix = `${code}@`;
			for (const key of map.keys()) {
				if (key === code || key.startsWith(prefix)) {
					map.delete(key);
				}
			}
		} else {
			// Language specified: clear entries for this specific language
			const prefix = `${code}@${languageCode}`;
			// Also clear variants with separators (for future extension support)
			const prefixes = ['-', '_', '.'].map(separator => `${prefix}${separator}`);
			for (const key of map.keys()) {
				if (key === prefix || prefixes.some(prefix => key.startsWith(prefix))) {
					map.delete(key);
				}
			}
		}
	}

	/**
	 * Install a custom format function
	 * @param code - Unique format code identifier
	 * @param func - Format implementation function
	 * @param languageCode - Optional language code for localized format
	 */
	static install(code: string, func: HxFormatFunc, languageCode?: HxLanguageCode): void {
		// Clear cache entries for this code first
		HxFormatSettings.clearFromMap(HxFormatSettings.CacheMap, code, languageCode);
		if (languageCode == null || languageCode.trim().length === 0) {
			// Install global format (no language restriction)
			HxFormatSettings.CustomMap.set(code, func);
		} else {
			// Install language-specific format
			HxFormatSettings.CustomMap.set(`${code}@${languageCode}`, func);
		}
	}

	/**
	 * Uninstall a custom format function
	 * @param code - Format code to uninstall
	 * @param languageCode - Optional language code, if provided only uninstall for this language
	 */
	static uninstall(code: string, languageCode?: HxLanguageCode): void {
		// Clear both cache and main storage entries
		HxFormatSettings.clearFromMap(HxFormatSettings.CacheMap, code, languageCode);
		HxFormatSettings.clearFromMap(HxFormatSettings.CustomMap, code, languageCode);
	}

	/**
	 * Format a value using specified format definition
	 * Automatically handles language fallback: tries current language first, then parent languages, then global format
	 * @param value - Value to format
	 * @param context - Optional Hx component context (provides language information)
	 * @param def - Format definition (format code string or custom format function)
	 * @returns Formatted string, or original value if formatting fails
	 * @example
	 * // Format with automatic language localization
	 * HxFmt.format(12345.67, context, 'nf2'); // "12,345.67" for English, "12.345,67" for German
	 */
	static format<T>(value: T, context?: HxContext, def?: HxFormats): T | string {
		// Return original value if no format specified
		if (def == null || (typeof def === 'string' && def.length === 0)) {
			return value;
		}
		// Return empty string for null/undefined values
		if (value == null) {
			return '';
		}

		// Cache save functions to store resolved format function for future use
		let cache: Array<(func: HxFormatFunc) => void> = [];
		let func: HxFormatFunc | undefined = (void 0);

		if (typeof def === 'string') {
			// Get current language from context
			let languageCode: HxLanguageCode | undefined = HxLanguageContext.current();

			// Language fallback loop: try current language, then parent languages
			while (func == null) {
				let key = `${def}@${languageCode}`;

				// First try to get from cache
				func = HxFormatSettings.CacheMap.get(key);
				if (func != null) {
					break;
				}
				// Add cache save function for this language variant
				cache.push((func) => HxFormatSettings.CacheMap.set(key, func));
				// Try to get from custom installed formats
				func = HxFormatSettings.CustomMap.get(key);
				if (func != null) {
					break;
				}

				// Try to get from predefined formats
				func = HxFormatSettings.PredefinedMap.get(key as unknown as PredefinedKey);
				if (func != null) {
					break;
				}

				// Get parent language code for fallback (e.g. 'zh-CN' -> 'zh')
				languageCode = HxLanguageContext.parentOf(languageCode!);
				if (languageCode == null) {
					// No more parent languages, exit loop
					break;
				}
			}

			// If still no function found, try format code without language suffix
			if (func == null) {
				func = HxFormatSettings.CacheMap.get(def);
				if (func == null) {
					// Add cache save function for global variant
					cache.push((func) => HxFormatSettings.CacheMap.set(def, func));
				}
			}
			// Final fallback: try custom map then predefined map without language suffix
			func = func
				?? HxFormatSettings.CustomMap.get(def)
				?? HxFormatSettings.PredefinedMap.get(def as unknown as PredefinedKey);

			// Save resolved function to all cache entries we prepared
			if (func != null) {
				for (const saveToCache of cache) {
					saveToCache(func);
				}
			}
		} else {
			// def is already a format function, use directly
			func = def;
		}

		if (func == null) {
			// Log error and return original value if no format function found
			console.error('Failed to format value caused by format function not found by given definition.', value, def);
			return value;
		} else {
			// Execute format function
			return func(value, context);
		}
	};
}

/** Short alias for HxFormatSettings */
export const HxFmt = HxFormatSettings;
