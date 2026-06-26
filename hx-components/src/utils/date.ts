import type {
	HxDateTimeDefaultValues,
	HxDateTimeFormatDataChar,
	HxDateTimeFormatFixedChar,
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
	static readonly YMDHNS = 'ymdhns';
	static readonly YMD = 'ymd';
	// noinspection JSUnusedGlobalSymbols
	static readonly HNS = 'hns';
	// noinspection JSUnusedGlobalSymbols
	static readonly MDHNS = 'mdhns';

	static readonly STD_DATE_SEPARATORS = '/-.';
	static readonly STD_TIME_SEPARATORS = ':.';
	static readonly STD_DATETIME_SEPARATOR = 'T';

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

	/** Type guard: returns true when `ch` is one of the data chars (y/m/d/h/n/s). */
	static isPatternChar(ch: string): ch is HxDateTimeFormatDataChar {
		return DateUtils.YMDHNS.includes(ch);
	}

	/**
	 * Find the nearest data char ({@code y/m/d/h/n/s}) adjacent to a
	 * separator position in the format sequence.
	 *
	 * @param format    - The parsed format descriptor.
	 * @param startIndex - The index to start searching from.
	 * @param direction - {@code "backward"} to search left, {@code "forward"} to search right.
	 * @returns The nearest data char, or {@code undefined} if none found.
	 */
	static findPatternChar(format: HxParsedDateTimeFormat, startIndex: number, direction: 'backward' | 'forward'): HxDateTimeFormatDataChar | undefined {
		if (direction === 'forward') {
			for (let index = startIndex, count = format.sequence.length; index < count; index++) {
				const ch = format.sequence[index];
				if (DateUtils.isPatternChar(ch)) {
					return ch;
				}
			}
		} else {
			for (let index = startIndex; index >= 0; index--) {
				const ch = format.sequence[index];
				if (DateUtils.isPatternChar(ch)) {
					return ch;
				}
			}
		}
		return (void 0);
	}

	/**
	 * Check whether a value character matches a format separator, with
	 * limited interchangeability based on context (date, time, or datetime).
	 *
	 * Date separators ({@code /}, {@code -}, {@code .}) are interchangeable
	 * with each other and with a single space. Time separators ({@code :},
	 * {@code .}) are interchangeable with each other. The date-time separator
	 * ({@code T}) is interchangeable with a single space.
	 *
	 * @param fixedChar       - The separator character expected by the format.
	 * @param valueChar       - The actual character from the value string.
	 * @param previousDataChar - The data character before this separator in the
	 *                           format sequence, or {@code undefined} if at the edge.
	 * @param nextDataChar     - The data character after this separator, or
	 *                           {@code undefined} if at the edge.
	 * @returns {@code true} when the value character is an acceptable match.
	 */
	static matchSeparator(
		fixedChar: HxDateTimeFormatFixedChar, valueChar: string,
		previousDataChar: HxDateTimeFormatDataChar | undefined, nextDataChar: HxDateTimeFormatDataChar | undefined): boolean {
		if (fixedChar === valueChar) {
			return true;
		}

		if (previousDataChar == null) {
			return valueChar === ' ';
		} else if (nextDataChar == null) {
			return valueChar === ' ';
		} else if (DateUtils.YMD.includes(previousDataChar)) {
			// previous is date part
			if (DateUtils.YMD.includes(nextDataChar)) {
				// separator of date parts
				if (fixedChar === ' ') {
					return DateUtils.STD_DATE_SEPARATORS.includes(valueChar);
				} else if (DateUtils.STD_DATE_SEPARATORS.includes(fixedChar)) {
					return valueChar === ' ' || DateUtils.STD_DATE_SEPARATORS.includes(valueChar);
				} else {
					return false;
				}
			} else {
				// separator of date & time
				if (fixedChar === ' ') {
					return DateUtils.STD_DATETIME_SEPARATOR === valueChar;
				} else if (DateUtils.STD_DATETIME_SEPARATOR === fixedChar) {
					return valueChar === ' ';
				} else {
					return false;
				}
			}
		} else {
			// previous is time part
			if (DateUtils.YMD.includes(nextDataChar)) {
				// separator of date & time
				if (fixedChar === ' ') {
					return DateUtils.STD_DATETIME_SEPARATOR === valueChar;
				} else if (DateUtils.STD_DATETIME_SEPARATOR === fixedChar) {
					return valueChar === ' ';
				} else {
					return false;
				}
			} else {
				// separator of time parts
				if (fixedChar === ' ') {
					return DateUtils.STD_TIME_SEPARATORS.includes(valueChar);
				} else if (DateUtils.STD_TIME_SEPARATORS.includes(fixedChar)) {
					return valueChar === ' ' || DateUtils.STD_TIME_SEPARATORS.includes(valueChar);
				} else {
					return false;
				}
			}
		}
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
	 * - Spaces immediately before or after a matched separator are consumed and skipped
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
	 * @param options - Optional behavior flags.
	 * @param options.partialMatch - when `true`, after at least one component has been
	 *                                successfully parsed, missing subsequent numeric components
	 *                                are silently ignored instead of causing a failure.
	 *                                Also permits early termination when the value is fully
	 *                                consumed. Default `false`.
	 * @param options.collectLegalTillNot - when `true`, the parser greedily collects
	 *                                       matching characters and stops at the first
	 *                                       non-matching character (digit mismatch or
	 *                                       separator mismatch), returning whatever has
	 *                                       been parsed so far. Trailing characters are
	 *                                       not validated. Default `false`.
	 * @returns A {@link ParsedDataTime} object with the extracted numeric strings, or `false` if:
	 *          - `value` is `null`, `undefined`, or blank after trimming
	 *          - no numeric component could be parsed at all
	 *          - a numeric component is missing before any have been parsed
	 *            (unless `collectLegalTillNot` or `partialMatch` applies)
	 *          - the value is fully consumed but the format still expects numeric components
	 *            (unless `partialMatch` is `true` and at least one component was parsed)
	 *          - an unexpected character is found at a separator position
	 *            (unless `collectLegalTillNot` is `true` — stops instead)
	 *          - unconsumed trailing characters contain anything other than `Z` or whitespace
	 *            (unless `collectLegalTillNot` is `true` — trailing chars are ignored)
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
	static parseValue(
		value: string | null | undefined, format: HxParsedDateTimeFormat,
		options?: { partialMatch?: boolean; collectLegalTillNot?: boolean; }
	): ParsedDataTime | false {
		if (value == null || value.trim().length === 0) {
			return false;
		}

		const {partialMatch = false, collectLegalTillNot = false} = options ?? {};

		const mapping: Record<HxDateTimeFormatDataChar, [keyof ParsedDataTime, number]> = {
			y: ['year', 4], m: ['month', 2], d: ['day', 2],
			h: ['hour', 2], n: ['minute', 2], s: ['second', 2]
		};
		const parsed: ParsedDataTime = {};

		let anyParsed: boolean = false;
		let indexOfValue = 0;
		for (let partIndex = 0, partCount = format.sequence.length; partIndex < partCount; partIndex++) {
			let breakCharMatchByCollectLegalTillNot = false;
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
					} else if (anyParsed && partialMatch) {
						// partial match allowed, ignore this part
						break;
					} else if (collectLegalTillNot) {
						breakCharMatchByCollectLegalTillNot = true;
						break;
					} else {
						return false;
					}
				}
				default: {
					// when sequence char is not one of ymdhns,
					let chOfValue = value[indexOfValue];
					// skip leading spaces before matching the separator
					while (chOfValue === ' ') {
						indexOfValue += 1;
						chOfValue = value[indexOfValue];
					}
					if (chOfValue >= '0' && chOfValue <= '9') {
						break;
					}

					const previousDataChar = this.findPatternChar(format, partIndex - 1, 'backward');
					const nextDataChar = this.findPatternChar(format, partIndex + 1, 'forward');
					if (DateUtils.matchSeparator(ch, chOfValue, previousDataChar, nextDataChar)) {
						indexOfValue += 1;
						chOfValue = value[indexOfValue];
						while (chOfValue === ' ') {
							indexOfValue += 1;
							chOfValue = value[indexOfValue];
						}
					} else if (collectLegalTillNot) {
						breakCharMatchByCollectLegalTillNot = true;
						break;
					} else {
						return false;
					}
					break;
				}
			}

			if (breakCharMatchByCollectLegalTillNot) {
				break;
			}

			if (indexOfValue >= value.length) {
				// all value chars consumed
				// but there are still format parts remained, and remained parts includes at least one of ymdhns
				if (anyParsed && partialMatch) {
					break;
				}

				// parse failed
				const remainParts = format.sequence.slice(partIndex + 1);
				if (remainParts.length !== 0 && remainParts.some(ch => 'ymdhns'.includes(ch))) {
					return false;
				}
			}
		}

		if (!collectLegalTillNot) {
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
		}

		if (!anyParsed) {
			return false;
		} else {
			return parsed;
		}
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
