import {StringUtils} from './string';

export type HxNumberFormatPatternLayout = '223' | '333';

export interface HxNumberFormatPattern {
	/** Grouping layout: `333` for Western (1,234,567) or `223` for Indian (1,23,45,678) */
	layout: HxNumberFormatPatternLayout;
	grouping: string;
	decimal: string;
}

/**
 * - default locale: en
 * - default grouping: false
 * - default and min "minFractionDigits": 10
 * - default and max "maxFractionDigits": 100
 * - default round mode: half expand, which is half-round-up. 0.5 -> 1, -0.5 -> -1
 */
export interface HxNumberFormatOptions {
	locale: string;
	/** default false */
	grouping?: boolean;
	/** default no limitation */
	minFractionDigits?: number;
	/** default 100 */
	maxFractionDigits?: number;
	/** default half expand */
	roundMode?: 'halfExpand' | 'trunc';
}

export class NumberUtils {
	/**
	 * Cache of locale-specific separators and grouping pattern,
	 * keyed by BCP-47 locale tag.  Populated lazily.
	 */
	private static separatorCache: Map<string, HxNumberFormatPattern> = new Map();

	private static truncRoundingSupported: boolean | null = null;

	private static supportsTruncRoundingMode(): boolean {
		if (NumberUtils.truncRoundingSupported == null) {
			try {
				NumberUtils.truncRoundingSupported =
					new Intl.NumberFormat('en', {roundingMode: 'trunc'}).resolvedOptions().roundingMode === 'trunc';
			} catch {
				NumberUtils.truncRoundingSupported = false;
			}
		}
		return NumberUtils.truncRoundingSupported;
	}

	static separators(locale: string): HxNumberFormatPattern {
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
	 *
	 * - default locale: en
	 * - default grouping: false
	 * - default and min "minFractionDigits": 10
	 * - default and max "maxFractionDigits": 100
	 * - default round mode: half expand, which is half-round-up. 0.5 -> 1, -0.5 -> -1
	 */
	static format(value: number, options?: HxNumberFormatOptions): string {
		const {
			locale = 'en',
			grouping = false,
			minFractionDigits = 0, maxFractionDigits = 100,
			roundMode = 'halfExpand'
		} = options ?? {};

		switch (roundMode) {
			case 'trunc': {
				// no round mode "trunc" supporting until es2023
				const min = Math.max(minFractionDigits, 0);
				const max = Math.max(min, Math.min(maxFractionDigits, 100));
				if (NumberUtils.supportsTruncRoundingMode()) {
					return new Intl.NumberFormat(locale, {
						useGrouping: grouping, minimumFractionDigits: min, maximumFractionDigits: max,
						roundingMode: 'trunc'
					}).format(value);
				}
				if (max === 0) {
					// fraction part is not needed
					// Math.trunc works for every magnitude, while parseInt would stop
					// at the "e" when String() prints the value in exponent notation
					return new Intl.NumberFormat(locale, {
						useGrouping: grouping, minimumFractionDigits: 0, maximumFractionDigits: 0
					}).format(Math.trunc(value));
				}

				let s = String(value);
				if (s.includes('e') || s.includes('E')) {
					// to plain string
					const parsed = s.toLowerCase().split('e');
					const power = Number(parsed[1]);
					if (power == 0) {
						s = parsed[0];
					} else if (power > 0) {
						// decimal point move to right
						let [i, f = ''] = parsed[0].split('.');
						i = i + f.slice(0, power).padEnd(power, '0');
						f = f.slice(power);
						s = f.length > 0 ? (i + '.' + f) : i;
					} else if (power < 0) {
						// decimal point move to left
						let [i, f = ''] = parsed[0].split('.');
						const n = i.startsWith('-');
						if (n) {
							i = i.slice(1);
						}
						// power is negative!
						f = i.slice(power).padStart(-power, '0') + f;
						i = i.slice(0, power) || '0';
						s = (n ? '-' : '') + i + '.' + f;
					}
				}
				const [, , negative, integer, fraction] = StringUtils.normalizeToNumber(s);
				return NumberUtils.formatManually(negative, integer, fraction, {
					grouping, minFractionDigits: min, maxFractionDigits: max,
					roundMode: 'trunc', locale
				});

			}
			case 'halfExpand':
			default: {
				// https://tc39.es/ecma402/#sec-intl.numberformat
				// #14, when style is not "percent", maximumFractionDigits will use the default value 3.
				// so have to replace it
				const min = Math.max(minFractionDigits, 0);
				return new Intl.NumberFormat(locale, {
					useGrouping: grouping,
					minimumFractionDigits: min,
					maximumFractionDigits: Math.max(min, Math.min(maxFractionDigits, 100))
				}).format(value);
			}
		}
	}

	/**
	 * Manually format a canonical number string whose value exceeds the safe integer
	 * range (cannot be passed to `Intl.NumberFormat` as a `number`).
	 *
	 * - default locale: en
	 * - default grouping: false
	 * - default and min "minFractionDigits": 10
	 * - default and max "maxFractionDigits": 100
	 * - default round mode: half expand, which is half-round-up. 0.5 -> 1, -0.5 -> -1
	 */
	static formatManually(negative: boolean, integer: string, fraction: string, options?: HxNumberFormatOptions): string {
		const {
			locale = 'en',
			grouping = false,
			minFractionDigits = 0, maxFractionDigits = 100,
			roundMode = 'halfExpand'
		} = options ?? {};

		const min = Math.max(minFractionDigits, 0);
		const max = Math.max(min, Math.min(maxFractionDigits, 100));
		const fractionDigitCount = fraction.length;
		if (fractionDigitCount === 0) {
			// no fraction part passed
			integer = new Intl.NumberFormat(locale, {useGrouping: grouping}).format(BigInt(integer));
			if (min > 0) {
				const {decimal: decimalPoint} = NumberUtils.separators(locale);
				return (negative ? '-' : '') + integer + decimalPoint + (''.padStart(min, '0'));
			} else {
				return (negative ? '-' : '') + integer;
			}
		} else if (max === 0) {
			// has fraction part, but not needed
			let increasement: bigint;
			switch (roundMode) {
				case 'trunc': {
					increasement = 0n;
					break;
				}
				case 'halfExpand':
				default: {
					increasement = fraction[0] >= '5' ? (negative ? -1n : 1n) : 0n;
					break;
				}
			}
			integer = new Intl.NumberFormat(locale, {useGrouping: grouping}).format(BigInt(integer) + increasement);
			return (negative ? '-' : '') + integer;
		} else {
			// has fraction part, and is needed
			if (fractionDigitCount > max) {
				// try to make sure the behavior is same as the Intl.NumberFormat
				// one more fraction digit kept, for rounding
				fraction = fraction.substring(0, max + 1);
			}
			// check the fraction digits padding
			if (fractionDigitCount < min) {
				fraction = fraction.padEnd(min, '0');
			}

			switch (roundMode) {
				case 'trunc': {
					if (fractionDigitCount > max) {
						fraction = fraction.substring(0, max);
					}
					break;
				}
				case 'halfExpand':
				default: {
					// keep one more fraction digits
					if (fractionDigitCount > max) {
						// check the next char
						const increasement = fraction[max] >= '5' ? 1n : 0n;
						// add a prefix 1 to avoid leading zeros dropping
						const v = BigInt('1' + fraction.substring(0, max));
						const increased = v + increasement;
						if (increased.toString()[0] !== '2') {
							// first char (1) not changed, will not impact integer part
							fraction = increased.toString().substring(1);
							if (fraction.length > max) {
								fraction = fraction.substring(0, max);
							}
						} else {
							// first char (1) changed,
							// the only possibility is to add 1 into integer part and drop whole fraction part
							integer = new Intl.NumberFormat(locale, {useGrouping: grouping}).format(BigInt(integer) + (negative ? -1n : 1n));
							// check there is min fraction digits or not
							if (min > 0) {
								const {decimal: decimalPoint} = NumberUtils.separators(locale);
								return (negative ? '-' : '') + integer + decimalPoint + (''.padStart(min, '0'));
							} else {
								return (negative ? '-' : '') + integer;
							}
						}
					}
					break;
				}
			}

			integer = new Intl.NumberFormat(locale, {useGrouping: grouping}).format(BigInt(integer));
			const {decimal: decimalPoint} = NumberUtils.separators(locale);
			return (negative ? '-' : '') + integer + decimalPoint + fraction;
		}
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * try to format number
	 * - call {@link NumberUtils.format} when given value is number,
	 * - call {@link StringUtils.normalizeToNumber} when given value is string,
	 *   - return given value itself when it is not a valid number
	 *   - return formatted of {@link NumberUtils.formatManually}
	 */
	static formatNumber(value: number | string, options?: HxNumberFormatOptions): string {
		if (typeof value === 'number') {
			return NumberUtils.format(value, options);
		} else {
			const [valid, , negative, integer, fraction] = StringUtils.normalizeToNumber(value);
			return valid ? NumberUtils.formatManually(negative, integer, fraction, options) : value;
		}
	}

	/**
	 * Checks whether a value cannot be interpreted as a number.
	 *
	 * <p>Type-dispatched: numbers and bigints test {@code Number.isNaN};
	 * strings are coerced via {@code Number(value)} first, so {@code "123"}
	 * is a number while {@code "abc"} is not; every other type (null or
	 * undefined, booleans, symbols, objects) is not a number.</p>
	 *
	 * @param value - any value to test
	 * @returns {@code true} when the value is not a valid number
	 */
	static isNotANumber(value: unknown): boolean {
		if (value == null) {
			return true;
		}
		const type = typeof value;
		if (type === 'number' || type === 'bigint') {
			return Number.isNaN(value);
		} else if (type === 'string') {
			return Number.isNaN(Number(value));
		} else {
			return true;
		}
	}

	/**
	 * Checks whether a value can be interpreted as a number.
	 *
	 * <p>The inverse of {@link NumberUtils.isNotANumber}: numbers and bigints
	 * test {@code Number.isNaN}; strings coerce via {@code Number(value)}, so
	 * {@code "123"} returns {@code true} while {@code "abc"} or
	 * {@code undefined} return {@code false}; every other type is not a
	 * number.</p>
	 *
	 * @param value - any value to test
	 * @returns {@code true} when the value is a valid number
	 */
	static isANumber(value: unknown): boolean {
		if (value == null) {
			return false;
		}
		const type = typeof value;
		if (type === 'number' || type === 'bigint') {
			return !Number.isNaN(value);
		} else if (type === 'string') {
			return !Number.isNaN(Number(value));
		} else {
			return false;
		}
	}

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}
}
