import type {HxContext} from '../contexts';

export type HxFormatExtCode = string;
export type HxFormat =
// number format, 0 - 6 fraction, and enable grouping
	| 'df0' | 'df1' | 'df2' | 'df3' | 'df4' | 'df5' | 'df6'
	// number format, grouping only
	| 'ng'
	// date format,
	| 'df'
	// extended format code, by call "HxValueFormatSettings.install"
	| HxFormatExtCode;
/**
 * note the context parameter only appears when this function called in hx components
 */
export type HxFormatFunc = (value: any | undefined, context?: HxContext) => string;
export type HxFormats = HxFormat | HxFormatFunc;

export class HxFormatSettings {
	private static readonly Map: Map<HxFormatExtCode, HxFormatFunc> = new Map;

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
			if (func == null) {
				switch (def) {
					// TODO handle predefined formats
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

