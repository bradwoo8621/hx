import dayjs from 'dayjs';
import {type HxContext, type HxLanguageCode, HxLanguageContext} from '../contexts';

/**
 * nf0-nf6: number format, 0 - 6 fraction digits, and enable grouping,
 * ng: number format, grouping only
 */
export type HxNumberFormatCode = | 'nf0' | 'nf1' | 'nf2' | 'nf3' | 'nf4' | 'nf5' | 'nf6' | 'ng';
/**
 * df: date format, YYYY-MM-DD,
 * tf: time format, HH:mm:ss,
 * dtf: date and time format, YYYY-MM-DD HH:mm:ss.
 */
export type HxDateFormatCode = 'df' | 'tf' | 'dtf';
export type HxPredefinedFormatCode = HxNumberFormatCode | HxDateFormatCode;
export type HxFormatExtCode = string | `${string}@${HxLanguageCode}`;
export type HxFormatCode =
	| HxPredefinedFormatCode
	// extended format code, by call "HxValueFormatSettings.install"
	| HxFormatExtCode;
/**
 * note the context parameter only appears when this function called in hx components
 */
export type HxFormatFunc = (value?: any, context?: HxContext) => string;
export type HxFormats = HxFormatCode | HxFormatFunc;

type PredefinedKey = `${HxPredefinedFormatCode}@${HxLanguageCode}` | HxPredefinedFormatCode;
type PredefinedFuncs = Map<PredefinedKey, HxFormatFunc>;

export class HxFormatSettings {
	private static readonly PredefinedMap: PredefinedFuncs = HxFormatSettings.createPredefinedFormats();
	private static readonly Map: Map<HxFormatExtCode, HxFormatFunc> = new Map();
	private static readonly CacheMap: Map<HxFormatExtCode, HxFormatFunc> = new Map();

	private static createNumberFormat(languageCode: HxLanguageCode, fractionDigits: number): Intl.NumberFormat {
		if (fractionDigits < 0) {
			return new Intl.NumberFormat(languageCode, {
				useGrouping: true
			});
		} else {
			return new Intl.NumberFormat(languageCode, {
				useGrouping: true,
				minimumFractionDigits: fractionDigits,
				maximumFractionDigits: fractionDigits
			});
		}
	};

	private static createNumberFormatFunc(format: Intl.NumberFormat): HxFormatFunc {
		return (value?: any, _context?: HxContext): string => {
			if (value == null) {
				return '';
			}
			switch (typeof value) {
				case 'string': {
					const s = (value as string).trim();
					if (s.length === 0) {
						return value;
					}
					const v = Number(s);
					if (isNaN(v)) {
						return value;
					} else {
						return format.format(v);
					}
				}
				case 'number':
				case 'bigint': {
					return format.format(value as number | bigint);
				}
				case 'boolean': {
					return (value as boolean) ? 'true' : 'false';
				}
				case 'symbol': {
					return (value as symbol).toString();
				}
				case 'object': {
					return JSON.stringify(value as object);
				}
				case 'function': {
					return (value as Function).toString();
				}
				default: {
					return value;
				}
			}
		};
	}

	private static createDateTimeFormatFunc(format: string): HxFormatFunc {
		return (value?: any, _context?: HxContext): string => {
			if (value == null) {
				return '';
			}
			switch (typeof value) {
				case 'string': {
					const s = (value as string).trim();
					if (s.length === 0) {
						return value;
					}
					const v = dayjs(s);
					if (v.isValid()) {
						return v.format(format);
					} else {
						return value;
					}
				}
				case 'number':
				case 'bigint': {
					return `${(value as number | bigint)}`;
				}
				case 'boolean': {
					return (value as boolean) ? 'true' : 'false';
				}
				case 'symbol': {
					return (value as symbol).toString();
				}
				case 'object': {
					if (value instanceof Date) {
						return dayjs(value).format(format);
					} else {
						return JSON.stringify(value as object);
					}
				}
				case 'function': {
					return (value as Function).toString();
				}
				default: {
					return value;
				}
			}
		};
	}

	private static createPredefinedFormats(): PredefinedFuncs {
		const map: PredefinedFuncs = new Map();
		// number formats
		[-1, 0, 1, 2, 3, 4, 5, 6]
			.map(digits => {
				const format = HxFormatSettings.createNumberFormat('en', digits);
				const func = HxFormatSettings.createNumberFormatFunc(format);
				if (digits === -1) {
					map.set(`ng@en`, func);
				} else {
					map.set(`nf${digits as 1 | 2 | 3 | 4 | 5 | 6}@en`, func);
				}
			});
		// date formats
		map.set('df', HxFormatSettings.createDateTimeFormatFunc('YYYY-MM-DD'));
		map.set('tf', HxFormatSettings.createDateTimeFormatFunc('HH:mm:ss'));
		map.set('dtf', HxFormatSettings.createDateTimeFormatFunc('YYYY-MM-DD HH:mm:ss'));

		return map;
	}

	private static clearFromMap(map: Map<HxFormatExtCode, HxFormatFunc>, code: string, languageCode?: HxLanguageCode): void {
		if (languageCode == null || languageCode.trim().length === 0) {
			const prefix = `${code}@`;
			for (const key of map.keys()) {
				if (key === code || key.startsWith(prefix)) {
					map.delete(key);
				}
			}
		} else {
			const prefix = `${code}@${languageCode}`;
			const prefixes = ['-', '_', '.'].map(separator => `${prefix}${separator}`);
			for (const key of map.keys()) {
				if (key === prefix || prefixes.some(prefix => key.startsWith(prefix))) {
					map.delete(key);
				}
			}
		}
	}

	static install(code: string, func: HxFormatFunc, languageCode?: HxLanguageCode): void {
		HxFormatSettings.clearFromMap(HxFormatSettings.CacheMap, code, languageCode);
		if (languageCode == null || languageCode.trim().length === 0) {
			HxFormatSettings.Map.set(code, func);
		} else {
			HxFormatSettings.Map.set(`${code}@${languageCode}`, func);
		}
	}

	static uninstall(code: string, languageCode?: HxLanguageCode): void {
		HxFormatSettings.clearFromMap(HxFormatSettings.CacheMap, code, languageCode);
		HxFormatSettings.clearFromMap(HxFormatSettings.Map, code, languageCode);
	}

	static format<T>(value: T, context?: HxContext, def?: HxFormats): T | string {
		if (def == null || (typeof def === 'string' && def.length === 0)) {
			return value;
		}
		if (value == null) {
			return '';
		}

		let cache: Array<(func: HxFormatFunc) => void> = [];
		let func: HxFormatFunc | undefined = (void 0);
		if (typeof def === 'string') {
			let languageCode: HxLanguageCode | undefined = HxLanguageContext.current();
			while (func == null) {
				let key = `${def}@${languageCode}`;

				// find from cache
				func = HxFormatSettings.CacheMap.get(key);
				if (func != null) {
					break;
				}
				// should save to cache when it is found
				cache.push((func) => HxFormatSettings.CacheMap.set(key, func));
				// find from customized
				func = HxFormatSettings.Map.get(key);
				if (func != null) {
					break;
				}

				// find from predefined
				func = HxFormatSettings.PredefinedMap.get(key as unknown as PredefinedKey);
				if (func != null) {
					break;
				}

				// not found, get parent language code
				if (func == null) {
					languageCode = HxLanguageContext.parentOf(languageCode!);
					if (languageCode == null) {
						// no parent language
						break;
					}
				}
			}
			if (func == null) {
				func = HxFormatSettings.CacheMap.get(def);
				if (func == null) {
					// should save to cache when it is found
					cache.push((func) => HxFormatSettings.CacheMap.set(def, func));
				}
			}
			func = func
				?? HxFormatSettings.Map.get(def)
				?? HxFormatSettings.PredefinedMap.get(def as unknown as PredefinedKey);
			if (func != null) {
				for (const saveToCache of cache) {
					saveToCache(func);
				}
			}
		} else {
			func = def;
		}
		if (func == null) {
			console.error('Failed to format value caused by format function not found by given definition.', value, def);
			return value;
		} else {
			return func(value, context);
		}
	};
}

export const HxFmt = HxFormatSettings;

