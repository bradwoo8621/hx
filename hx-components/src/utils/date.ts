import type {
	HxDateTimeDefaultValues,
	HxDateTimeFormatDataChar,
	HxDateTimeRelatedFormat,
	HxParsedDateTimeFormat
} from '../types';

export interface ParsedDataTime {
	year?: string;
	month?: string;
	day?: string;
	hour?: string;
	minute?: string;
	second?: string;
}

export class DateUtils {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Parse a date/time format string into a {@link HxParsedDateTimeFormat}.
	 *
	 * Recognized tokens (case-sensitive): y/m/d for date, h/n/s for time.
	 * All other characters are treated as literal separators and preserved
	 * in the sequence as-is.
	 *
	 * @param format - The format string to parse, e.g. `"y/m/d"`, `"h:n:s"`, `"y-m-d h:n:s"`
	 * @returns The parsed format descriptor.
	 *          Returns all-false with an empty sequence when format is null/empty.
	 */
	static parseFormat(format: HxDateTimeRelatedFormat): HxParsedDateTimeFormat {
		if (format == null || format.length === 0) {
			return {
				hasYear: false, hasMonth: false, hasDay: false, hasDate: false,
				hasHour: false, hasMinute: false, hasSecond: false, hasTime: false,
				sequence: []
			};
		}

		const mapping: Record<HxDateTimeFormatDataChar, Array<Exclude<keyof HxParsedDateTimeFormat, 'sequence'>>> = {
			y: ['hasYear', 'hasDate'], m: ['hasMonth', 'hasDate'], d: ['hasDay', 'hasDate'],
			h: ['hasHour', 'hasTime'], n: ['hasMinute', 'hasTime'], s: ['hasSecond', 'hasTime']
		};
		const parsed: HxParsedDateTimeFormat = {
			hasYear: false, hasMonth: false, hasDay: false, hasDate: false,
			hasHour: false, hasMinute: false, hasSecond: false, hasTime: false,
			sequence: []
		};
		for (const ch of format) {
			switch (ch) {
				case 'y':
				case 'm':
				case 'd':
				case 'h':
				case 'n':
				case 's': {
					mapping[ch].forEach(name => parsed[name] = true);
					parsed.sequence.push(ch);
					break;
				}
				default: {
					parsed.sequence.push(ch);
					break;
				}
			}
		}
		return parsed;
	}

	/**
	 * Extract consecutive digit characters from the beginning of the given string.
	 *
	 * @returns a tuple of `[hasDigits, digits]` where `digits` are the leading
	 *          numeric characters (empty when no digits found).
	 */
	private static gatherNumber(str: string): [boolean, string] {
		let count = 0;
		for (let idx = 0; idx < str.length; idx++) {
			const ch = str[idx];
			if (ch < '0' || ch > '9') {
				break;
			}
			count = idx + 1;
		}
		const digits = str.substring(0, count);
		return [digits.length !== 0, digits];
	}

	/**
	 * Parse a formatted date/time string into its numeric components according to the given format.
	 *
	 * Walks the value against {@link HxParsedDateTimeFormat.sequence}. Numeric components
	 * (y/m/d/h/n/s) are extracted greedily as consecutive digits (year = up to 4, others = up to 2).
	 *
	 * Non-numeric characters at separator positions are validated with limited interchangeability:
	 * - Date separators (`/`, `-`, `.`, space) are interchangeable with each other
	 * - Time separators (`:`, `.`, space) are interchangeable with each other
	 * - `T` and space are interchangeable as date-time separators
	 * - Any other character at a separator position causes the parse to fail
	 * - Spaces immediately following a matched separator are consumed and skipped
	 *
	 * No range validation is performed on the extracted values (e.g. month `"61"` is accepted).
	 *
	 * Trailing characters after all format components are consumed:
	 * - At most one `Z` (UTC) is accepted
	 * - Spaces are silently ignored
	 * - Any other character, including digits, causes the parse to fail
	 *
	 * @param value - The formatted date/time string to parse, e.g. `"2026-06-11"` or `"14:30:00"`
	 * @param format - Parsed format descriptor produced by {@link parseFormat}, defining which
	 *                 components are present and their order
	 * @param partialMatchAllowed - when `true`, after at least one component has been
	 *                              successfully parsed, missing subsequent numeric components
	 *                              are silently ignored instead of causing a failure.
	 *                              Default `false`.
	 * @returns A {@link ParsedDataTime} object with the extracted numeric strings, or `false` if:
	 *          - `value` is `null`, `undefined`, or blank after trimming
	 *          - no numeric component could be parsed at all
	 *          - a numeric component is missing before any have been parsed
	 *          - the value is fully consumed but the format still expects numeric components
	 *            (unless `partialMatchAllowed` is `true` and at least one component was parsed)
	 *          - an unexpected character is found at a separator position
	 *          - unconsumed trailing characters contain anything other than `Z` or whitespace
	 *
	 * @example
	 * ```ts
	 * const fmt = DateUtils.parseFormat('y-m-d');
	 *
	 * DateUtils.parseValue('2026-06-11', fmt);
	 * // => { year: '2026', month: '06', day: '11' }
	 *
	 * // Date separators are interchangeable
	 * DateUtils.parseValue('2026/06/11', fmt);
	 * // => { year: '2026', month: '06', day: '11' }
	 *
	 * // Single-digit month is fine — greedy extraction stops at the separator
	 * DateUtils.parseValue('2026/6/11', fmt);
	 * // => { year: '2026', month: '6', day: '11' }
	 *
	 * // Without separators, each component greedily consumes up to its max digits
	 * DateUtils.parseValue('20260611', fmt);
	 * // => { year: '2026', month: '06', day: '11' }
	 *
	 * // No range validation — year eats 4 digits, month eats 2, day gets the rest
	 * DateUtils.parseValue('2026611', fmt);
	 * // => { year: '2026', month: '61', day: '1' }
	 * ```
	 */
	static parseValue(value: string | null | undefined, format: HxParsedDateTimeFormat, partialMatchAllowed: boolean = false): ParsedDataTime | false {
		if (value == null || value.trim().length === 0) {
			return false;
		}

		const mapping: Record<HxDateTimeFormatDataChar, [keyof ParsedDataTime, number]> = {
			y: ['year', 4], m: ['month', 2], d: ['day', 2],
			h: ['hour', 2], n: ['minute', 2], s: ['second', 2]
		};
		const parsed: ParsedDataTime = {};

		let anyParsed: boolean = false;
		let indexOfValue = 0;
		for (let partIndex = 0, partCount = format.sequence.length; partIndex < partCount; partIndex++) {
			const ch = format.sequence[partIndex];
			switch (ch) {
				case 'y':
				case 'm':
				case 'd':
				case 'h':
				case 'n':
				case 's': {
					const [name, length] = mapping[ch];
					const [has, digits] = DateUtils.gatherNumber(value.substring(indexOfValue, indexOfValue + length));
					if (has) {
						parsed[name] = digits;
						indexOfValue += digits.length;
						anyParsed = true;
						break;
					} else if (anyParsed && partialMatchAllowed) {
						// partial match allowed, ignore this part
						break;
					} else {
						return false;
					}
				}
				default: {
					// when sequence char is not one of ymdhns,
					let chOfValue = value[indexOfValue];
					if (chOfValue >= '0' && chOfValue <= '9') {
						break;
					}
					if (chOfValue === ch
						|| ('/-. '.includes(ch) && '/-. '.includes(chOfValue))
						|| (':.'.includes(ch) && ':. '.includes(chOfValue))
						|| (ch === 'T' && chOfValue === ' ')
						|| (ch === ' ' && chOfValue === 'T')) {
						indexOfValue += 1;
						chOfValue = value[indexOfValue];
						while (chOfValue === ' ') {
							indexOfValue += 1;
							chOfValue = value[indexOfValue];
						}
					} else {
						return false;
					}
					break;
				}
			}
			if (indexOfValue >= value.length) {
				// all value chars consumed
				// but there are still format parts remained, and remained parts includes at least one of ymdhns
				if (partialMatchAllowed) {
					break;
				}

				// parse failed
				const remainParts = format.sequence.slice(partIndex + 1);
				if (remainParts.length !== 0 && remainParts.some(ch => 'ymdhns'.includes(ch))) {
					return false;
				}
			}
		}

		if (indexOfValue < value.length) {
			let timezoneCharDetected = false;
			// there are char(s) not consumed
			const trail = value.substring(indexOfValue);
			for (const ch of trail) {
				if (ch === 'Z') {
					if (timezoneCharDetected) {
						return false;
					} else {
						timezoneCharDetected = true;
					}
				} else if (ch === ' ') {
					// ignore
				} else {
					// any other chars except whitespace and first Z, failed
					return false;
				}
			}
		}

		return parsed;
	}

	/**
	 * Format a {@link ParsedDataTime} into a string according to the given format.
	 *
	 * Each component in the format sequence is replaced by its value (zero-padded:
	 * year = 4 digits, others = 2 digits). Literal characters in the sequence are
	 * copied as-is. Missing values fall back to `defaults`, then to `'0'`.
	 *
	 * @param value    - The parsed date/time components
	 * @param format   - The target format descriptor
	 * @param defaults - Optional fallback values for missing components
	 * @returns The formatted date/time string
	 */
	static formatValue(value: ParsedDataTime, format: HxParsedDateTimeFormat, defaults?: HxDateTimeDefaultValues): string {
		const mapping: Record<HxDateTimeFormatDataChar, [keyof ParsedDataTime, number]> = {
			y: ['year', 4], m: ['month', 2], d: ['day', 2],
			h: ['hour', 2], n: ['minute', 2], s: ['second', 2]
		};
		const parts: Array<string> = [];
		for (const ch of format.sequence) {
			switch (ch) {
				case 'y':
				case 'm':
				case 'd':
				case 'h':
				case 'n':
				case 's': {
					const [name, length] = mapping[ch];
					parts.push(String(value[name] ?? defaults?.[name] ?? '').padStart(length, '0'));
					break;
				}
				default: {
					parts.push(ch);
					break;
				}
			}
		}
		return parts.join('');
	}
}
