export interface NumberFormatSeparators {
	grouping: string;
	decimal: string;
}

export class NumberUtils {
	/**
	 * Cache of locale-specific separator pairs, keyed by BCP-47 locale tag.
	 * Populated lazily on first use of each locale.
	 */
	private static separatorCache: Map<string, NumberFormatSeparators> = new Map();

	static separators(locale: string): NumberFormatSeparators {
		let cached = this.separatorCache.get(locale);
		if (cached == null) {
			const parts = new Intl.NumberFormat(locale).formatToParts(1234567.89);
			cached = {
				grouping: parts.find((p) => p.type === 'group')?.value ?? ',',
				decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.'
			};
			this.separatorCache.set(locale, cached);
		}
		return cached;
	}

	/**
	 * Normalize a locale-formatted display string into a canonical raw numeric
	 * string (digits, `.`, optional leading `-`).
	 *
	 * - Digits `0`–`9` are kept as-is.
	 * - The locale-specific decimal separator is normalized to `.`; only the
	 *   first occurrence is kept — a second one makes the result invalid.
	 * - A `-` is kept only at the very start; a `-` after any other
	 *   character makes the result invalid.
	 * - Any character that is not a digit, the locale decimal separator, or a
	 *   leading `-` (including grouping separators) makes the result invalid.
	 *
	 * @returns A tuple `[valid, result]` — when `valid` is `false`, `result`
	 *          is the original text unchanged.
	 */
	static stripFormatting(text: string, locale: string): [boolean, string] {
		const patternKeys = NumberUtils.separators(locale);

		let hasDecimalPoint = false;
		const chars: Array<string> = [];
		for (const ch of text) {
			if (ch >= '0' && ch <= '9') {
				chars.push(ch);
			} else if (ch === patternKeys.decimal) {
				if (hasDecimalPoint) {
					return [false, text];
				} else {
					hasDecimalPoint = true;
					chars.push('.');
				}
			} else if (ch === '-') {
				if (chars.length === 0) {
					chars.push('-');
				} else {
					return [false, text];
				}
			} else {
				return [false, text];
			}
		}
		return [true, chars.join('')];
	}

	/**
	 * Format a JS number via `Intl.NumberFormat` using the active locale
	 */
	static format(value: number, locale: string, grouping: boolean = false, minFractionDigits?: number): string {
		return new Intl.NumberFormat(locale, {
			useGrouping: grouping,
			minimumFractionDigits: minFractionDigits
		}).format(value);
	}

	/**
	 * Manually format a canonical number string whose value exceeds the safe integer
	 * range (cannot be passed to `Intl.NumberFormat` as a `number`).
	 */
	static formatManually(negative: boolean, integer: string, fraction: string, locale: string, grouping: boolean = false, minFractionDigits?: number): string {
		// check the fraction digits padding
		if (minFractionDigits != null && minFractionDigits > 0) {
			// padding
			if (fraction.length < minFractionDigits) {
				fraction = fraction.padEnd(minFractionDigits, '0');
			}
		}

		integer = new Intl.NumberFormat(locale, {useGrouping: grouping}).format(BigInt(integer));
		if (fraction.length > 0) {
			const {decimal: decimalPoint} = NumberUtils.separators(locale);
			return (negative ? '-' : '') + integer + decimalPoint + fraction;
		} else {
			return (negative ? '-' : '') + integer;
		}
	}

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}
}