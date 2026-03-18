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
	 * @param fractionDigits - Number of decimal places, -1 means no fixed decimal places
	 * @returns Configured Intl.NumberFormat instance
	 */
	private static createNumberFormat(languageCode: HxLanguageCode, fractionDigits: number): Intl.NumberFormat {
		if (fractionDigits < 0) {
			// No fixed fraction digits, only enable grouping
			return new Intl.NumberFormat(languageCode, {
				useGrouping: true
			});
		} else {
			// Fixed fraction digits with grouping
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
					// Try to parse string as date
					const v = dayjs(s);
					if (v.isValid()) {
						// Format if valid date
						return v.format(format);
					} else {
						// Return original string if not a valid date
						return value;
					}
				}
				case 'number':
				case 'bigint': {
					// Convert numeric timestamp to string directly
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
						// Format Date object directly
						return dayjs(value).format(format);
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
	 * @param value - Value to format
	 * @param context - Optional Hx component context
	 * @param def - Format definition (format code string or custom format function)
	 * @returns Formatted string, or original value if formatting fails
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
