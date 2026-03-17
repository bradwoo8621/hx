import type {HxContext, HxLanguageCode} from '../contexts';

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
export type HxFormatExtCode = string;
export type HxFormatCode =
	| HxPredefinedFormatCode
	// extended format code, by call "HxValueFormatSettings.install"
	| HxFormatExtCode;
/**
 * note the context parameter only appears when this function called in hx components
 */
export type HxFormatFunc = (value?: any, context?: HxContext) => string;

export type HxFormats = HxFormatCode | HxFormatFunc;

type PredefinedFuncs = Map<`${HxNumberFormatCode}@${HxLanguageCode}` | HxDateFormatCode, HxFormatFunc>;

export class HxFormatSettings {
	private static readonly PredefinedMap: PredefinedFuncs = HxFormatSettings.createPredefinedFormats();
	private static readonly Map: Map<HxFormatExtCode, HxFormatFunc> = new Map();

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

	private static createPredefinedFormats(): PredefinedFuncs {
		const map: PredefinedFuncs = new Map();
		[-1, 0, 1, 2, 3, 4, 5, 6]
			.map(digits => {
				const format = HxFormatSettings.createNumberFormat('en', digits);
				const func = (value?: any, _context?: HxContext): string => {
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
				if (digits === -1) {
					map.set(`ng@en`, func);
				} else {
					map.set(`nf${digits as 1 | 2 | 3 | 4 | 5 | 6}@en`, func);
				}
			});
		return map;
	}

	static install(code: string, func: HxFormatFunc): HxFormatSettings {
		HxFormatSettings.Map.set(code, func);
		return HxFormatSettings;
	}

	static uninstall(code: string): HxFormatSettings {
		HxFormatSettings.Map.delete(code);
		return HxFormatSettings;
	}

	static format<T>(value: T, context?: HxContext, def?: HxFormats): T | string {
		if (def == null || (typeof def === 'string' && def.length === 0)) {
			return value;
		}
		if (value == null) {
			return '';
		}
		let func: HxFormatFunc | undefined;
		if (typeof def === 'string') {
			func = HxFormatSettings.Map.get(def);

			// HxFormatSettings.PredefinedMap.get(def as HxPredefinedFormatCode);
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

