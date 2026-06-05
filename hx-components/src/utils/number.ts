import {StringUtils} from './string';

export type NumberFormatPatternLayout = '223' | '333';

export interface NumberFormatPattern {
	/** Grouping layout: `333` for Western (1,234,567) or `223` for Indian (1,23,45,678) */
	layout: NumberFormatPatternLayout;
	grouping: string;
	decimal: string;
}

export interface NumberFormatOptions {
	locale: string;
	/** default false */
	grouping?: boolean;
	/** default no limitation */
	minFractionDigits?: number;
	/** default no limitation */
	maxFractionDigits?: number;
	/** default true. >= 0.5 -> 1 */
	roundUp?: boolean;
}

export class NumberUtils {
	/**
	 * Cache of locale-specific separators and grouping pattern,
	 * keyed by BCP-47 locale tag.  Populated lazily.
	 */
	private static separatorCache: Map<string, NumberFormatPattern> = new Map();

	static separators(locale: string): NumberFormatPattern {
		let cached = this.separatorCache.get(locale);
		if (cached == null) {
			// Use an 8-digit integer so that Western (333) vs Indian (223)
			// grouping can be reliably distinguished.
			//   en-US: 12,345,678  → integer groups 2-3-3
			//   hi-IN:  1,23,45,678 → integer groups 1-2-2-3
			const parts = new Intl.NumberFormat(locale).formatToParts(12345678.09);

			cached = {
				layout: parts.filter(p => p.type === 'group').length === 3 ? '223' : '333',
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
	 * - The locale decimal separator is normalized to `.`; only the
	 *   first occurrence is kept — a second one makes the result invalid.
	 * - A `-` is kept only at the very start (`chars` empty); a `-` after
	 *   any other character makes the result invalid.
	 * - The locale grouping separator is silently skipped, but only after
	 *   at least one meaningful character has been seen; a leading grouping
	 *   separator makes the result invalid.
	 * - Any other character makes the result invalid.
	 *
	 * The returned result, if it is a valid number, matches the following rules:
	 * - At most one `-` at the very start,
	 * - At most one `.` anywhere, including immediately after `-`, at the very start or at the very last,
	 * - At least one digit (`0`-`9`).
	 *
	 * @returns A tuple `[valid, result]` — when `valid` is `false`, `result`
	 *          is the original text unchanged.
	 */
	static stripFormatting(text: string, groupingSeparator: string, decimalPoint: string): [boolean, string] {
		let hasNumeric = false;
		let hasDecimalPoint = false;
		const chars: Array<string> = [];
		for (let index = 0, count = text.length; index < count; index++) {
			const ch = text[index];
			if (ch >= '0' && ch <= '9') {
				hasNumeric = true;
				chars.push(ch);
			} else if (ch === decimalPoint) {
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
			} else if (ch === groupingSeparator) {
				if (chars.length === 0) {
					return [false, text];
				}
			} else {
				// char rather than "-", decimal point, 0 - 9 and grouping char
				return [false, text];
			}
		}
		if (hasNumeric) {
			return [true, chars.join('')];
		} else {
			return [false, text];
		}
	}

	/**
	 * Format a JS number via `Intl.NumberFormat` using the active locale
	 */
	static format(value: number, options?: NumberFormatOptions): string {
		const {locale = 'en', grouping = false, minFractionDigits, maxFractionDigits} = options ?? {};
		return new Intl.NumberFormat(locale, {
			useGrouping: grouping,
			minimumFractionDigits: minFractionDigits,
			maximumFractionDigits: maxFractionDigits == null ? (void 0) : Math.min(maxFractionDigits, 20)
		}).format(value);
	}

	/**
	 * Manually format a canonical number string whose value exceeds the safe integer
	 * range (cannot be passed to `Intl.NumberFormat` as a `number`).
	 */
	static formatManually(negative: boolean, integer: string, fraction: string, options?: NumberFormatOptions): string {
		const {locale = 'en', grouping = false, minFractionDigits, maxFractionDigits} = options ?? {};

		// check the fraction digits padding
		if (minFractionDigits != null && minFractionDigits > 0) {
			// padding
			if (fraction.length < minFractionDigits) {
				fraction = fraction.padEnd(minFractionDigits, '0');
			}
		}
		if (maxFractionDigits != null && maxFractionDigits > 0) {
			if (fraction.length > maxFractionDigits) {
				fraction = fraction.substring(0, maxFractionDigits);
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

	/**
	 * try to format number
	 * - call {@link NumberUtils.format} when given value is number,
	 * - call {@link StringUtils.normalizeToNumber} when given value is string,
	 *   - return given value itself when it is not a valid number
	 *   - return formatted of {@link NumberUtils.formatManually}
	 */
	static formatNumber(value: number | string, options?: NumberFormatOptions): string {
		if (typeof value === 'number') {
			return NumberUtils.format(value, options);
		} else {
			const [valid, , negative, integer, fraction] = StringUtils.normalizeToNumber(value);
			return valid ? NumberUtils.formatManually(negative, integer, fraction) : value;
		}
	}

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}
}