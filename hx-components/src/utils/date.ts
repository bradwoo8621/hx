import type {HxLanguageCode} from '../contexts';
import type {
	HxDateTimeDefaultValuesInStr,
	HxDateTimeFormatDataChar,
	HxDateTimeFormatFixedChar,
	HxDateTimeRelatedFormat,
	HxDateTimeValue,
	HxDateWeekendDay,
	HxParsedDateTimeFormat
} from '../types';
import {HxConsole} from './browser';

export interface HxParsedDataTime {
	year?: string;
	// start from 1
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

	private static readonly PATTERN_CHAR_TO_PARSED_FIELD_MAPPING: Record<HxDateTimeFormatDataChar, keyof HxParsedDataTime> = {
		y: 'year', m: 'month', d: 'day', h: 'hour', n: 'minute', s: 'second'
	};
	private static readonly PATTERN_CHAR_MAX_VALUES_STRICT: Record<keyof HxDateTimeValue, number> = {
		year: 9999, month: 12, day: 31, hour: 23, minute: 59, second: 59
	};
	private static readonly PATTERN_CHAR_MAX_VALUES_LOOSE: Record<keyof HxDateTimeValue, number> = {
		year: 9999, month: 99, day: 99, hour: 99, minute: 99, second: 99
	};

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
	 * @returns A {@link HxParsedDataTime} object with the extracted numeric strings, or `false` if:
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
	): HxParsedDataTime | false {
		if (value == null || value.trim().length === 0) {
			return false;
		}

		const {partialMatch = false, collectLegalTillNot = false} = options ?? {};

		const mapping: Record<HxDateTimeFormatDataChar, [keyof HxParsedDataTime, number]> = {
			y: ['year', 4], m: ['month', 2], d: ['day', 2],
			h: ['hour', 2], n: ['minute', 2], s: ['second', 2]
		};
		const parsed: HxParsedDataTime = {};

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

	static fromParsed(value: HxParsedDataTime): HxDateTimeValue {
		return Object.keys(value).reduce((transformed, key) => {
			const v = value[key as keyof HxParsedDataTime];
			if (v != null && v.trim().length > 0) {
				let n = Number(v);
				if (key === 'year') {
					n = Math.max(Math.min(n, 9999), 0);
				} else {
					n = Math.max(Math.min(n, 99), 0);
				}
				transformed[key as keyof HxDateTimeValue] = n;
			}
			return transformed;
		}, {} as HxDateTimeValue);
	}

	static toParsed(value: HxDateTimeValue): HxParsedDataTime {
		return Object.keys(value).reduce((transformed, key) => {
			let v = value[key as keyof HxDateTimeValue];
			if (v != null) {
				if (key === 'year') {
					v = Math.max(Math.min(v, 9999), 0);
				} else {
					v = Math.max(Math.min(v, 99), 0);
				}
				transformed[key as keyof HxParsedDataTime] = String(v);
			}
			return transformed;
		}, {} as HxParsedDataTime);
	}

	/**
	 * Format a {@link HxParsedDataTime} into a string according to the given format.
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
	static formatValue(value: HxParsedDataTime, format: HxParsedDateTimeFormat, defaults?: HxDateTimeValue): string {
		const mapping: Record<HxDateTimeFormatDataChar, [keyof HxParsedDataTime, number]> = {
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

	/**
	 * Parse a default value into a clamped {@link HxDateTimeValue}.
	 *
	 * When `value` is a string (e.g. `"y1980m1d1"`, `"h23n59s59"`), each
	 * component is extracted by its leading character tag, converted to a
	 * number, and clamped against the respective max. When `value` is an
	 * object, it is shallow-copied and clamped.
	 *
	 * @param value   - the raw default value (tagged string, plain object, or null/undefined)
	 * @param strict  - when `true`, missing components are left `undefined`;
	 *                  when `false`, they default to `0` and clamp against
	 *                  {@link DateUtils.PATTERN_CHAR_MAX_VALUES_LOOSE}
	 * @returns a fully clamped, zero-filled-in (when non-strict) datetime value
	 */
	static parseDefaultValue(value: HxDateTimeDefaultValuesInStr | HxDateTimeValue | null | undefined, strict: boolean): HxDateTimeValue {
		if (value == null) {
			return strict ? {} : {year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0};
		}

		const maxValues = strict ? DateUtils.PATTERN_CHAR_MAX_VALUES_STRICT : DateUtils.PATTERN_CHAR_MAX_VALUES_LOOSE;

		let newValues: HxDateTimeValue;
		if (typeof value === 'string') {
			newValues = strict ? {} : {year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0};

			const collectedChars: Array<string> = [];
			const collected: { part?: HxDateTimeFormatDataChar; digits: Array<string> } = {digits: []};
			const set = () => {
				if (collected.digits.length > 0) {
					if (collected.part != null) {
						collectedChars.push(collected.part, ...collected.digits);
						if (DateUtils.isPatternChar(collected.part)) {
							const name = DateUtils.PATTERN_CHAR_TO_PARSED_FIELD_MAPPING[collected.part];
							const max = maxValues[name];
							newValues[name] = Math.min(max, Math.max(Number(collected.digits.join('')), 0));
						}
					}
				}

				// clear collected
				delete collected.part;
				collected.digits.length = 0;
			};
			for (const ch of value) {
				switch (ch) {
					case 'Y':
					case 'y':
					case 'M':
					case 'm':
					case 'D':
					case 'd':
					case 'H':
					case 'h':
					case 'N':
					case 'n':
					case 'S':
					case 's': {
						set();
						collected.part = ch.toLowerCase() as HxDateTimeFormatDataChar;
						break;
					}
					case '0':
					case '1':
					case '2':
					case '3':
					case '4':
					case '5':
					case '6':
					case '7':
					case '8':
					case '9': {
						// drop if the number is not followed of a part char
						if (collected.part != null) {
							collected.digits.push(ch);
						}
						break;
					}
					default: {
						delete collected.part;
						collected.digits.length = 0;
						break;
					}
				}
			}
			set();

			const collectedValue = collectedChars.join('');
			if (collectedValue !== value) {
				HxConsole.warn(`Invalid datetime default value[${value}], compatible collected as [${collectedValue}].`);
			}
		} else {
			newValues = {...value};
		}

		Object.keys(newValues).forEach(key => {
			const v = newValues[key as keyof HxDateTimeValue] as number;
			if (v < 0) {
				newValues[key as keyof HxDateTimeValue] = 0;
			} else if (v > maxValues[key as keyof HxDateTimeValue]) {
				newValues[key as keyof HxDateTimeValue] = maxValues[key as keyof HxDateTimeValue];
			}
		});

		return newValues;
	};

	/**
	 * Fill in missing parts of `value` in-place, falling back to
	 * `defaultValue` then to the current date/time.
	 *
	 * Mutates and returns the same `value` object.
	 *
	 * @param value        - the datetime value to fill (modified in-place)
	 * @param defaultValue - fallback values for missing parts
	 * @returns the same `value` reference with all parts filled
	 */
	static fulfillWithDefault(value: HxDateTimeValue, defaultValue: HxDateTimeValue): Required<HxDateTimeValue> {
		const now = new Date();
		value.year = value.year ?? defaultValue.year ?? now.getFullYear();
		value.month = value.month ?? defaultValue.month ?? (now.getMonth() + 1);
		value.day = value.day ?? defaultValue.day ?? now.getDate();
		value.hour = value.hour ?? defaultValue.hour ?? now.getHours();
		value.minute = value.minute ?? defaultValue.minute ?? now.getMinutes();
		value.second = value.second ?? defaultValue.second ?? now.getSeconds();
		return value as Required<HxDateTimeValue>;
	}

	/**
	 * Return the last day of the given month, accounting for leap years.
	 *
	 * month must be 1 - 12, and B.C. (negative year?) is not checked
	 */
	static lastDayOfMonth(year: number, month: number): number {
		if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
			return 31;
		} else if ([4, 6, 9, 11].includes(month)) {
			return 30;
		} else if (year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)) {
			return 29;
		} else {
			return 28;
		}
	}
}

// noinspection SpellCheckingInspection
export type HxDateTimeFormatCalendar =
	| 'buddhist' // Thai Buddhist calendar (B.E.)
	| 'chinese' // Chinese lunar calendar
	| 'coptic' // Coptic calendar, Egypt
	| 'dangi' // Dangi calendar, Korea (lunar variant)
	| 'ethioaa' // Ethiopic Amete Alem (epoch follows Alexandrian)
	| 'ethiopic' // Ethiopic Amete Mihret
	| 'gregory' // Gregorian calendar
	| 'hebrew' // Hebrew calendar, Israel
	| 'indian' // Indian national calendar (Saka)
	| 'islamic' // Islamic calendar, Algeria / Morocco / Tunisia
	| 'islamic-civil' // Islamic civil (tabular), Lebanon / Syria / Iraq / Gulf states
	| 'islamic-umalqura' // Umm al-Qura calendar, Saudi Arabia
	| 'islamic-tbla' // Islamic astronomical calendar
	| 'islamic-rgsa' // Islamic calendar based on Saudia Arabia sighting
	| 'iso8601' // ISO 8601 (Gregorian variant)
	| 'japanese' // Japanese Imperial calendar (era-based)
	| 'persian' // Persian solar calendar, Iran / Afghanistan
	| 'roc'; // Minguo calendar, Taiwan

export type HxFormattedEra = string;
export type HxFormattedYear = string;
export type HxFormattedMonth = string;
export type HxFormattedDay = string;
export type HxFormattedWeekday = string;
// starts from Sunday
export type HxFormattedWeekdays = Array<HxFormattedWeekday>;

/**
 * Locale-aware date/time part formatting using {@link Intl.DateTimeFormat}.
 *
 * Provides per-locale year, month, day, weekday, and era formatting
 * with automatic calendar detection and length heuristics for
 * month/weekday display.
 */
export class DateLocaleUtils {
	// noinspection SpellCheckingInspection
	private static readonly GREGORY = 'gregory';
	// noinspection SpellCheckingInspection
	private static readonly CALENDAR_MAP: Record<HxLanguageCode, HxDateTimeFormatCalendar> = {
		// Locales whose default calendar is NOT Gregorian — mapped to their native calendar.
		'am-ET': 'ethiopic',
		'ar-AE': 'islamic-civil', // United Arab Emirates
		'ar-BH': 'islamic-civil', // Bahrain
		'ar-DZ': 'islamic', // Algeria
		'ar-EG': 'coptic', // Egypt (Coptic calendar)
		'ar-IQ': 'islamic-civil', // Iraq
		'ar-KW': 'islamic-civil', // Kuwait
		'ar-LB': 'islamic-civil', // Lebanon
		'ar-MA': 'islamic', // Morocco
		'ar-OM': 'islamic-umalqura', // Oman
		'ar-QA': 'islamic-civil', // Qatar
		'ar-SA': 'islamic-umalqura', // Saudi Arabia
		'ar-SD': 'islamic-umalqura', // Sudan
		'ar-SY': 'islamic-civil', // Syria
		'ar-TN': 'islamic', // Tunisia
		'ar-YE': 'islamic-umalqura', // Yemen
		'ckb-IR': 'persian', // Central Kurdish, Iran
		'en-IN': 'indian', // India — Indian national calendar (Saka)
		fa: 'persian', // Persian (Farsi), Iran
		'fa-AF': 'persian', // Dari (Persian), Afghanistan
		'fa-IR': 'persian', // Persian (Farsi), Iran
		he: 'hebrew', // Hebrew, Israel
		'he-IL': 'hebrew', // Hebrew, Israel
		hi: 'indian', // Hindi (India) — Indian national calendar
		'hi-IN': 'indian', // Hindi, India
		ja: 'japanese', // Japanese Imperial calendar (era-based)
		'ja-JP': 'japanese', // Japanese, Japan
		lrc: 'persian', // Northern Luri, Iran
		'lrc-IR': 'persian', // Northern Luri, Iran
		mzn: 'persian', // Mazanderani, Iran
		'mzn-IR': 'persian', // Mazanderani, Iran
		ps: 'persian', // Pashto, Afghanistan
		'ps-AF': 'persian', // Pashto, Afghanistan
		th: 'buddhist', // Thai Buddhist calendar (B.E.)
		'th-TH': 'buddhist', // Thai, Thailand
		'ti-ET': 'ethiopic',
		'uz-Arab': 'persian', // Uzbek (Arabic script) — follows Persian calendar
		'uz-Arab-AF': 'persian', // Uzbek (Arabic script), Afghanistan
		'zh-Hant-TW': 'roc', // Taiwan — Minguo calendar
		'zh-TW': 'roc' // Taiwan — Minguo calendar
	};
	private static readonly SHORT_MONTH_LOCALES = ['th', 'ru', 'el', 'pl', 'hi'];
	private static readonly NARROW_WEEKDAY_LOCALES = ['am', 'ti', 'th', 'fa', 'ar', 'lo', 'pl', 'my', 'km', 'fr', 'pt'];
	private static readonly FORMATS = new Map<string, Intl.DateTimeFormat>();
	private static readonly LONG_MONTH_FORMATS = new Map<string, Intl.DateTimeFormat>();
	private static readonly NUMERIC_FORMATS = new Map<string, Intl.DateTimeFormat>();

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/** Replace the locale prefixes that use {@code 'short'} month format. */
	// noinspection JSUnusedGlobalSymbols
	static setShortMonthLocales(languages: Array<HxLanguageCode>): typeof DateLocaleUtils {
		DateLocaleUtils.SHORT_MONTH_LOCALES.length = 0;
		if (languages != null) {
			DateLocaleUtils.SHORT_MONTH_LOCALES.push(...languages);
		}
		return DateLocaleUtils;
	}

	/** Replace the locale prefixes that use {@code 'narrow'} weekday format. */
	// noinspection JSUnusedGlobalSymbols
	static setNarrowWeekdayLocales(languages: Array<HxLanguageCode>): typeof DateLocaleUtils {
		DateLocaleUtils.NARROW_WEEKDAY_LOCALES.length = 0;
		if (languages != null) {
			DateLocaleUtils.NARROW_WEEKDAY_LOCALES.push(...languages);
		}
		return DateLocaleUtils;
	}

	/**
	 * Configure the calendar mapping for Arab locales when not using Gregorian calendar.
	 * Note passing null or undefined removes the calendar mapping for that locale.
	 */
	// noinspection JSUnusedGlobalSymbols
	static updateCalendarMap(map: Record<HxLanguageCode, HxDateTimeFormatCalendar | null | undefined>): typeof DateLocaleUtils {
		Object.keys(map).forEach(key => {
			const value = map[key];
			if (value == null || value.trim().length === 0) {
				HxConsole.warn(`Datetime format calendar map for locale[${key}] is removed.`);
				delete DateLocaleUtils.CALENDAR_MAP[key];
			} else {
				DateLocaleUtils.CALENDAR_MAP[key] = value;
			}
		});
		return DateLocaleUtils;
	}

	/** Formats a {@code Date} as a {@code YYYY-MM-DD} string. */
	// noinspection JSUnusedGlobalSymbols
	static asDateString(date: Date): string {
		return [
			String(date.getFullYear()).padStart(4, '0'),
			String(date.getMonth() + 1).padStart(2, '0'),
			String(date.getDate()).padStart(2, '0')
		].join('-');
	}

	/**
	 * Resolve the calendar type for a given locale.
	 * Falls back to {@code 'gregory'} when no explicit mapping exists.
	 */
	static resolveCalendar(lang: HxLanguageCode): string {
		const found: HxDateTimeFormatCalendar | undefined = DateLocaleUtils.CALENDAR_MAP[lang as HxLanguageCode];
		return found || DateLocaleUtils.GREGORY;
	}

	/**
	 * Gregorian leap-year rule: divisible by 400, or divisible by 4 but not 100.
	 * Note: JavaScript {@code Date} uses proleptic Gregorian, so century years
	 * like 1500 are treated as non-leap even though they were leap in the Julian
	 * calendar actually used at that time.
	 */
	static isGregorianLeapYear(year: number): boolean {
		return year % 400 === 0 || (year % 4 === 0 && year % 100 != 0);
	}

	/**
	 * Julian calendar leap-year rule: every year divisible by 4 is a leap year.
	 * Only valid for years before 1582 (the Gregorian reform). After 1582,
	 * use {@link isGregorianLeapYear} instead.
	 */
	static isJulianLeapYear(year: number): boolean {
		return year < 1582 && year % 4 === 0;
	}

	/** Returns {@code true} when the locale is Traditional Chinese (Taiwan). */
	static isZhTW(lang: HxLanguageCode): boolean {
		return lang === 'zh-TW' || lang.startsWith('zh-TW') || lang.startsWith('zh-Hant-TW');
	}

	/**
	 * ROC (Minguo) calendar leap-year check.
	 *
	 * Converts the ROC calendar year to the equivalent Gregorian year, then chooses
	 * the appropriate rule based on the Gregorian reform boundary:
	 * - Before 1582: Julian rule (every 4th year is leap, including century years)
	 * - 1582 onward:  Gregorian rule (divisible by 400, or by 4 but not 100)
	 */
	static isZhTWLeapYear(yearOfCalendar: number): boolean {
		const year = yearOfCalendar >= 1 ? (yearOfCalendar + 1911) : (yearOfCalendar + 1912);
		if (year < 1582) {
			return DateLocaleUtils.isJulianLeapYear(year);
		} else {
			return DateLocaleUtils.isGregorianLeapYear(year);
		}
	}

	/** Returns {@code true} for Chinese locales that are NOT Taiwan (Simplified Chinese, etc.). */
	static isZhNotTW(lang: HxLanguageCode): boolean {
		if (lang === 'zh' || lang == 'zh-Hans' || lang.startsWith('zh-Hans-')) {
			return true;
		}
		if (lang.startsWith('zh-')) {
			return !DateLocaleUtils.isZhTW(lang);
		} else {
			// not zh
			return false;
		}
	}

	/** Returns {@code true} for Japanese locales (ja, ja-JP, etc.). */
	static isJa(lang: HxLanguageCode): boolean {
		return lang === 'ja' || lang.startsWith('ja-');
	}

	/**
	 * Japanese calendar leap-year check.
	 *
	 * The Japanese calendar year is really a mess, so use the Gregorian year.
	 * The appropriate rule is selected based on the Gregorian reform boundary:
	 * - Before 1582: Julian rule (every 4th year is leap, including century years)
	 * - 1582 onward:  Gregorian rule (divisible by 400, or by 4 but not 100)
	 */
	static isJaLeapYear(yearOfGregory: number): boolean {
		if (yearOfGregory < 1582) {
			return DateLocaleUtils.isJulianLeapYear(yearOfGregory);
		} else {
			return DateLocaleUtils.isGregorianLeapYear(yearOfGregory);
		}
	}

	/** Returns {@code true} for Thai locales (th, th-TH, etc.). */
	static isTh(lang: HxLanguageCode): boolean {
		return lang === 'th' || lang.startsWith('th-');
	}

	/**
	 * Thai Buddhist (Buddhist Era) calendar leap-year check.
	 *
	 * Converts the Buddhist calendar year to the equivalent Gregorian year by
	 * subtracting 543 (B.E. 544 = A.D. 1), then chooses the appropriate rule
	 * based on the Gregorian reform boundary:
	 * - Before 1582: Julian rule (every 4th year is leap, including century years)
	 * - 1582 onward:  Gregorian rule (divisible by 400, or by 4 but not 100)
	 */
	static isThLeapYear(yearOfCalendar: number): boolean {
		const year = yearOfCalendar - 543;
		if (year < 1582) {
			return DateLocaleUtils.isJulianLeapYear(year);
		} else {
			return DateLocaleUtils.isGregorianLeapYear(year);
		}
	}

	/**
	 * Returns {@code true} when the locale uses an Islamic calendar variant
	 * (tabular Islamic, Islamic Civil, Umm Al-Qura, etc.).
	 */
	// noinspection JSUnusedGlobalSymbols
	static isIslamic(lang: HxLanguageCode): boolean {
		const calendar = DateLocaleUtils.resolveCalendar(lang);
		return calendar === 'islamic' || calendar.startsWith('islamic-');
	}

	/**
	 * Returns {@code true} for Coptic or Ethiopic calendars.
	 * Both share an identical structure (13 months, 12×30d + 5/6d epagomenal month)
	 * and the same leap-year pattern; only the epoch differs.
	 */
	// noinspection JSUnusedGlobalSymbols
	static isCopticOrEthiopic(lang: HxLanguageCode): boolean {
		const calendar = DateLocaleUtils.resolveCalendar(lang);
		return calendar === 'coptic' || calendar === 'ethiopic';
	}

	/** Returns {@code true} when the locale uses the Indian national calendar (Saka). */
	// noinspection JSUnusedGlobalSymbols
	static isIndian(lang: HxLanguageCode): boolean {
		const calendar = DateLocaleUtils.resolveCalendar(lang);
		return calendar === 'indian';
	}

	/** Returns {@code true} when the locale uses the Hebrew calendar. */
	// noinspection JSUnusedGlobalSymbols
	static isHebrew(lang: HxLanguageCode): boolean {
		const calendar = DateLocaleUtils.resolveCalendar(lang);
		return calendar === 'hebrew';
	}

	/**
	 * Hebrew leap-year check using the 19-year Metonic cycle.
	 * Leap years occur at positions 3, 6, 8, 11, 14, 17, 19 (mod 0).
	 * Verified against 2026 years of precomputed calendar data with zero exceptions.
	 */
	// noinspection JSUnusedGlobalSymbols
	static isHebrewLeapYear(yearOfCalendar: number): boolean {
		return [0, 3, 6, 8, 11, 14, 17].includes(yearOfCalendar % 19);
	}

	/** Returns {@code true} when the locale uses the Persian (Solar Hijri) calendar. */
	// noinspection JSUnusedGlobalSymbols
	static isPersian(lang: HxLanguageCode): boolean {
		const calendar = DateLocaleUtils.resolveCalendar(lang);
		return calendar === 'persian';
	}

	private static getMonthFormat(lang: HxLanguageCode): Exclude<Intl.DateTimeFormatOptions['month'], undefined> {
		if (DateLocaleUtils.SHORT_MONTH_LOCALES.includes(lang)) {
			return 'short';
		}
		const match = DateLocaleUtils.SHORT_MONTH_LOCALES.some(locale => lang.startsWith(locale + '-'));
		if (match) {
			return 'short';
		} else {
			return 'long';
		}
	}

	private static getWeekdayFormat(lang: HxLanguageCode): Exclude<Intl.DateTimeFormatOptions['weekday'], undefined> {
		if (DateLocaleUtils.NARROW_WEEKDAY_LOCALES.includes(lang)) {
			return 'narrow';
		}
		const match = DateLocaleUtils.NARROW_WEEKDAY_LOCALES.some(locale => lang.startsWith(locale + '-'));
		if (match) {
			return 'narrow';
		} else {
			return 'short';
		}
	}

	private static findFormat(lang: HxLanguageCode, gregorian: boolean): Intl.DateTimeFormat {
		const key = `${lang}--${gregorian}`;
		let format = DateLocaleUtils.FORMATS.get(key);
		if (format == null) {
			let calendar: string | undefined;
			if (gregorian) {
				calendar = DateLocaleUtils.GREGORY;
			} else {
				calendar = DateLocaleUtils.resolveCalendar(lang);
			}
			format = new Intl.DateTimeFormat(lang, {
				year: 'numeric',
				month: DateLocaleUtils.getMonthFormat(lang),
				day: 'numeric',
				weekday: DateLocaleUtils.getWeekdayFormat(lang),
				calendar
			});
			DateLocaleUtils.FORMATS.set(key, format);
		}
		return format;
	}

	private static findMonthLongFormat(lang: HxLanguageCode, gregorian: boolean): Intl.DateTimeFormat {
		const key = `${lang}--${gregorian}`;
		let format = DateLocaleUtils.LONG_MONTH_FORMATS.get(key);
		if (format == null) {
			let calendar: string | undefined;
			if (gregorian) {
				calendar = DateLocaleUtils.GREGORY;
			} else {
				calendar = DateLocaleUtils.resolveCalendar(lang);
			}
			format = new Intl.DateTimeFormat(lang, {month: 'long', calendar});
			DateLocaleUtils.LONG_MONTH_FORMATS.set(key, format);
		}
		return format;
	}

	private static findNumericFormat(lang: HxLanguageCode): Intl.DateTimeFormat {
		const key = lang;
		let format = DateLocaleUtils.NUMERIC_FORMATS.get(key);
		if (format == null) {
			const calendar = DateLocaleUtils.resolveCalendar(lang);
			// Enforce Latin (0-9) digits via Unicode extension.
			// Without this, locales like ar-EG output Eastern Arabic numerals
			// (e.g. ١٧٤٢) which break parseInt-based parsing downstream.
			if (!lang.includes('-u-nu-latn')) {
				lang += '-u-nu-latn';
			}
			format = new Intl.DateTimeFormat(lang, {
				era: 'long', year: 'numeric', month: 'numeric', day: 'numeric', calendar
			});
			DateLocaleUtils.NUMERIC_FORMATS.set(key, format);
		}
		return format;
	}

	private static eraAs(lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedEra {
		if (DateLocaleUtils.isJa(lang)) {
			const year = date.getFullYear();
			if (year < 645 || (year === 645 && date.getMonth() === 0 && date.getDate() < 4)) {
				return '西暦';
			}
			const parts = partsOf();
			const partIndex = parts.findIndex(part => part.type === 'era');
			if (partIndex !== -1) {
				const era = parts[partIndex].value;
				if (era === '大化') {
					const year = parts.find(part => part.type === 'year');
					if (year?.value === '0' || year?.value?.startsWith('-')) {
						return '西暦';
					}
				}
				return era;
			} else {
				return '';
			}
		} else if (DateLocaleUtils.isZhTW(lang)) {
			const format = DateLocaleUtils.findFormat(lang, false);
			const parts = format.formatToParts(date);
			const partIndex = parts.findIndex(part => part.type === 'era');
			if (partIndex !== -1) {
				return parts[partIndex].value;
			} else {
				return '';
			}
		} else {
			return '';
		}
	}

	/**
	 * Format the era name for the given date and locale.
	 *
	 * Returns the era string for Japanese (ja-*) and Minguo (zh-TW)
	 * calendars. Returns {@code '西暦'} for pre-Taika dates. Returns
	 * empty for Gregorian-forced and non-era locales.
	 */
	static formatEra(date: Date, lang: HxLanguageCode, gregorian: boolean): HxFormattedEra {
		if (gregorian) {
			return '';
		}
		return DateLocaleUtils.eraAs(lang, date, () => {
			const format = DateLocaleUtils.findFormat(lang, false);
			return format.formatToParts(date);
		});
	}

	private static yearAs(lang: HxLanguageCode, date: Date, partsOf: () => Array<Intl.DateTimeFormatPart>): HxFormattedYear {
		if (DateLocaleUtils.isJa(lang)) {
			const year = date.getFullYear();
			if (year < 100) {
				return `${year}年`;
			}
		}
		const parts = partsOf();
		const partIndex = parts.findIndex(part => part.type === 'year');
		if (partIndex < 0) {
			return String(date.getFullYear());
		} else {
			const year = parts[partIndex].value;
			let literal = '';
			if (parts[partIndex + 1]?.type === 'literal') {
				literal = parts[partIndex + 1].value.trim();
			}
			if (literal === '년') {
				literal = '';
			} else if (literal === '年' && DateLocaleUtils.isZhNotTW(lang)) {
				literal = '';
			} else if (DateLocaleUtils.isJa(lang)) {
				if (year.startsWith('-') || year === '0') {
					return `${date.getFullYear()}年`;
				}
			}
			return [year, literal].join('');
		}
	}

	/**
	 * Format the year component for the given date and locale.
	 *
	 * When {@code gregorian} is {@code true}, returns the Gregorian year
	 * directly. Otherwise, uses the locale-specific calendar. Strips the
	 * leading {@code '-'} from negative years, maps {@code '0'} to
	 * {@code '元年'}, and strips unnecessary year literals for Korean
	 * and non-ROC Chinese.
	 */
	static formatYear(date: Date, lang: HxLanguageCode, gregorian: boolean): HxFormattedYear {
		if (gregorian) {
			return String(date.getFullYear());
		}
		return DateLocaleUtils.yearAs(lang, date, () => {
			const format = DateLocaleUtils.findFormat(lang, gregorian);
			return format.formatToParts(date);
		});
	}

	private static monthAs(date: Date, parts: Array<Intl.DateTimeFormatPart>): HxFormattedMonth {
		const partIndex = parts.findIndex(part => part.type === 'month');
		if (partIndex < 0) {
			return String(date.getMonth() + 1);
		} else {
			const month = parts[partIndex].value.trim();
			let literal = '';
			if (parts[partIndex + 1]?.type === 'literal') {
				literal = parts[partIndex + 1].value.trim();
			}
			return [month, literal].join('');
		}
	}

	/** Format the month component using locale-aware length heuristics. */
	static formatMonth(date: Date, lang: HxLanguageCode, gregorian: boolean): HxFormattedMonth {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		return DateLocaleUtils.monthAs(date, parts);
	}

	/** Format the month component using the full (long) month name. */
	static formatMonthLong(date: Date, lang: HxLanguageCode, gregorian: boolean): HxFormattedMonth {
		const format = DateLocaleUtils.findMonthLongFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		return DateLocaleUtils.monthAs(date, parts);
	}

	private static dayAs(date: Date, parts: Array<Intl.DateTimeFormatPart>): HxFormattedDay {
		const partIndex = parts.findIndex(part => part.type === 'day');
		if (partIndex < 0) {
			return String(date.getDate());
		} else {
			const day = parts[partIndex].value.trim();
			if ((window?.isNaN ?? isNaN)(Number(day))) {
				let literal = '';
				if (parts[partIndex + 1]?.type === 'literal') {
					literal = parts[partIndex + 1].value.trim();
				}
				return [day, literal].join('');
			} else {
				return day;
			}
		}
	}

	/** Format the day component. Attaches trailing literal only for non-Western digits. */
	static formatDay(date: Date, lang: HxLanguageCode, gregorian: boolean): HxFormattedDay {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		return DateLocaleUtils.dayAs(date, parts);
	}

	/** Format the month and day components together in a single locale-aware call. */
	static formatMonthAndDay(date: Date, lang: HxLanguageCode, gregorian: boolean): [HxFormattedMonth, HxFormattedDay] {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		return [
			DateLocaleUtils.monthAs(date, parts),
			DateLocaleUtils.dayAs(date, parts)
		];
	}

	private static weekdayAs(_date: Date, parts: Array<Intl.DateTimeFormatPart>): HxFormattedWeekday {
		const part = parts.find(part => part.type === 'weekday');
		const v = part!.value;
		if (v.startsWith('周') || v.startsWith('週')) {
			return v.substring(1);
		} else {
			return v;
		}
	}

	/** Format the weekday using locale-aware length heuristics. Strips the leading {@code '周'} prefix for zh-CN. */
	static formatWeekday(date: Date, lang: HxLanguageCode, gregorian: boolean): HxFormattedWeekday {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		return DateLocaleUtils.weekdayAs(date, parts);
	}

	/**
	 * Format a full date including era, year, month, day, and a week of weekday labels.
	 *
	 * @returns a tuple of {@code [era, year, month, day, weekdays]} where
	 *          {@code weekdays} is an array of 7 weekday labels starting from Sunday.
	 */
	static formatDate(date: Date, lang: HxLanguageCode, gregorian: boolean): [HxFormattedEra, HxFormattedYear, HxFormattedMonth, HxFormattedDay, HxFormattedWeekdays] {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		const partsOf = () => parts;
		const era = DateLocaleUtils.eraAs(lang, date, partsOf);
		const year = DateLocaleUtils.yearAs(lang, date, partsOf);
		const month = DateLocaleUtils.monthAs(date, parts);
		const day = DateLocaleUtils.dayAs(date, parts);
		const weekday = DateLocaleUtils.weekdayAs(date, parts);
		const weekdays: HxFormattedWeekdays = [];
		// 0 - 6, sun is 0.
		const dayOfWeek = date.getDay();
		for (let i = 0; i <= 6; i++) {
			if (i === dayOfWeek) {
				weekdays.push(weekday);
			} else {
				const d = new Date(date);
				d.setDate(d.getDate() + (i - dayOfWeek));
				const parts = format.formatToParts(d);
				const weekday = DateLocaleUtils.weekdayAs(d, parts);
				weekdays.push(weekday);
			}
		}

		return [era, year, month, day, weekdays];
	}

	/**
	 * Format a date in numeric form, returning era and numeric year/month/day values.
	 *
	 * For Gregorian dates this returns the raw year/month/day. For non-Gregorian
	 * calendars it uses the locale's numeric format and parses the parts back to
	 * integers, handling RTL markers and non-ASCII minus signs.
	 *
	 * @returns a tuple of {@code [era, year, month, day]} where year/month/day are numbers
	 */
	static formatDateInNumeric(date: Date, lang: HxLanguageCode, gregorian: boolean): [HxFormattedEra, number, number, number] {
		if (gregorian) {
			return ['', date.getFullYear(), date.getMonth() + 1, date.getDate()];
		} else {
			const format = DateLocaleUtils.findNumericFormat(lang);
			const parts = format.formatToParts(date);
			const era = DateLocaleUtils.eraAs(lang, date, () => parts);
			let year: number | undefined = (void 0);
			let month: number | undefined = (void 0);
			let day: number | undefined = (void 0);
			parts.forEach(part => {
				if (part.type === 'year' && year == null) {
					// Intl.DateTimeFormat in RTL locales may output:
					//   - U+200E (LRM) before the sign to preserve visual direction
					//   - U+2212 (MINUS SIGN) instead of ASCII U+002D (HYPHEN-MINUS)
					// Strip/normalize both so parseInt can parse the number correctly.
					let yearValue = part.value;
					if (yearValue.charCodeAt(0) === 0x200E) {
						yearValue = yearValue.slice(1);
					}
					if (yearValue.charCodeAt(0) === 0x2212) {
						yearValue = '-' + yearValue.slice(1);
					}
					year = parseInt(yearValue);
				} else if (part.type === 'month' && month == null) {
					month = parseInt(part.value);
				} else if (part.type === 'day' && day == null) {
					day = parseInt(part.value);
				}
			});
			return [era, year!, month!, day!];
		}
	}

	private static convertToShortWeekday(index: 1 | 2 | 3 | 4 | 5 | 6 | 7): HxDateWeekendDay {
		switch (index) {
			case 1: {
				return 'mon';
			}
			case 2: {
				return 'tue';
			}
			case 3: {
				return 'wed';
			}
			case 4: {
				return 'thu';
			}
			case 5: {
				return 'fri';
			}
			case 6: {
				return 'sat';
			}
			case 7: {
				return 'sun';
			}
		}
	}

	/**
	 * Retrieve the weekend days and first day of the week for a given locale.
	 *
	 * Uses {@code Intl.Locale.getWeekInfo} (or the legacy {@code locale.weekInfo})
	 * when available, otherwise falls back to Saturday–Sunday weekend with Sunday
	 * as the first day of the week.
	 */
	static getWeekInfo(lang: HxLanguageCode): { weekends: Array<HxDateWeekendDay>; firstDayOfWeek: HxDateWeekendDay } {
		try {
			const locale = new Intl.Locale(lang);
			// @ts-expect-error ignore check
			if (locale.getWeekInfo != null) {
				// @ts-expect-error ignore check
				const {weekend = [6, 7], firstDay = 7} = locale.getWeekInfo() as {
					weekend?: Array<1 | 2 | 3 | 4 | 5 | 6 | 7>,
					firstDay?: 1 | 2 | 3 | 4 | 5 | 6 | 7
				};
				return {
					weekends: weekend.map(v => DateLocaleUtils.convertToShortWeekday(v)),
					firstDayOfWeek: DateLocaleUtils.convertToShortWeekday(firstDay)
				};
			}
			// @ts-expect-error ignore check
			else if (locale.weekInfo != null) {
				// @ts-expect-error ignore check
				const {weekend = [6, 7], firstDay = 7} = locale.weekInfo as {
					weekend?: Array<1 | 2 | 3 | 4 | 5 | 6 | 7>,
					firstDay?: 1 | 2 | 3 | 4 | 5 | 6 | 7
				};
				return {
					weekends: weekend.map(v => DateLocaleUtils.convertToShortWeekday(v)),
					firstDayOfWeek: DateLocaleUtils.convertToShortWeekday(firstDay)
				};
			} else {
				return {weekends: ['sat', 'sun'] as Array<HxDateWeekendDay>, firstDayOfWeek: 'sun' as HxDateWeekendDay};
			}
		} catch {
			return {weekends: ['sat', 'sun'] as Array<HxDateWeekendDay>, firstDayOfWeek: 'sun' as HxDateWeekendDay};
		}
	};
}

export type MoveDate = Required<Pick<HxDateTimeValue, 'year' | 'month' | 'day'>>;
export type GregoryDay = { year: number, month: number, day: number };
export type CalendarDay = { era?: string, year: number, month: number, day: number };
export type ADay = { gregory: GregoryDay, calendar: CalendarDay };
export type AMonth = { first: ADay, last: ADay };
export type CalendarYear = { months: Array<AMonth> };

export class DateMoveGregorianUtils {
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	static accept(gregorian: boolean): boolean {
		return gregorian;
	}

	/**
	 * @param date in gregorian
	 * @param yearOffset year offset
	 */
	static moveYear(date: MoveDate, yearOffset: number): MoveDate {
		const moved = {...date};

		moved.year = moved.year + yearOffset;
		DateMoveUtils.fixDayWhenOverLastDayOfMonth(moved);
		return moved;
	}

	/**
	 * @param date in gregorian
	 * @param monthOffset month offset
	 */
	static moveMonth(date: MoveDate, monthOffset: number): MoveDate {
		const moved = {...date};

		const targetMonth = moved.month + monthOffset;
		if (monthOffset > 0) {
			// target month:
			// <= 12 -> keep year
			// > 12 and <= 24 -> year + 1
			// ...
			moved.year = moved.year + Math.floor((targetMonth - 1) / 12);
			// target month:
			// 2 - 11 -> mod 12
			// 12 -> mod 12 + 12
			// 13 - 23 -> mod 12
			// 24 -> mod 12 + 12
			// ...
			moved.month = targetMonth % 12;
			moved.month = moved.month === 0 ? 12 : moved.month;
		} else if (targetMonth >= 1) {
			// keep year and use target month directly
			moved.month = targetMonth;
		} else {
			// target month:
			// 0 - -11 -> year - 1
			// -12 - -23 -> year - 2
			// ...
			moved.year = moved.year + Math.floor((targetMonth - 1) / 12);
			// target month:
			// 0 - -11 -> 12 + mod 12
			// -12 - -23 -> 12 + mod 12
			// ...
			moved.month = 12 + targetMonth % 12;
		}
		DateMoveUtils.fixDayWhenOverLastDayOfMonth(moved);
		return moved;
	}
}

type GregoryAndJulianMovementRanges = {
	// follow functions will be executed in a fixed order
	isOrAfter158211: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	is158210: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween150003_158209: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween140003_150002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween130003_140002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween110003_130002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween100003_110002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween090003_100002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween070003_090002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween060003_070002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween050003_060002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween030003_050002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	is030002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween020003_030001: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	isOrBetween010003_020002: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	is000101: (yearOfCalendar: number, monthOfCalendar: number) => boolean;
	// isOrBetween000102_010002 is else, no need to provide
	toGregoryYear: (yearOfCalendar: number) => number;
};

class DateMoveGregoryAndJulianUtils {
	/**
	 * Clamp a day number to the valid range for a Gregorian/Julian calendar month.
	 *
	 * @param targetYearOfCalendar  - calendar year
	 * @param targetMonthOfCalendar - calendar month (1–12)
	 * @param dayOfCalendar         - desired day of month
	 * @param leap                  - leap-year predicate for the target calendar
	 * @returns the day clamped to the maximum for the target month
	 */
	static computeTargetDayOfCalendar(
		targetYearOfCalendar: number, targetMonthOfCalendar: number, dayOfCalendar: number,
		leap: (yearOfCalendar: number) => boolean
	): number {
		if ([1, 3, 5, 7, 8, 10, 12].includes(targetMonthOfCalendar)) {
			return dayOfCalendar;
		} else if ([4, 6, 9, 11].includes(targetMonthOfCalendar)) {
			return Math.min(dayOfCalendar, 30);
		} else if (leap(targetYearOfCalendar)) {
			return Math.min(dayOfCalendar, 29);
		} else {
			return Math.min(dayOfCalendar, 28);
		}
	}

	/**
	 * Compute the target calendar year offset and month after applying a month
	 * offset, handling month wrap-around (positive and negative).
	 *
	 * @param monthOfCalendar - current calendar month (1-based)
	 * @param monthOffset     - number of months to move (positive = forward, negative = backward)
	 * @returns the year offset and the target month (1–12)
	 */
	static computeTargetYearAndMonthOfCalendar(
		monthOfCalendar: number, monthOffset: number
	): { yearOffset: number, targetMonthOfCalendar: number } {
		// compute target year/month of calendar
		let yearOffset: number;
		let targetMonthOfCalendar = monthOfCalendar + monthOffset;
		if (targetMonthOfCalendar > 0) {
			// target month: 1 - 12 -> 1 - 12; 13 - 24 -> 1 - 12, etc.
			// year offset: 1 - 12 -> 0; 13 - 24 -> 1, etc.
			yearOffset = Math.floor((targetMonthOfCalendar - 1) / 12);
			targetMonthOfCalendar = (targetMonthOfCalendar - 1) % 12 + 1;
		} else {
			// target month: 0 - -11 -> 12 - 1; -12 - -23 -> 12 - 1, etc.
			// year offset: 0 - -11 -> -1; -12 - -23 -> -2, etc.
			yearOffset = Math.floor((targetMonthOfCalendar - 1) / 12);
			targetMonthOfCalendar = (targetMonthOfCalendar % 12) + 12;
		}

		return {yearOffset, targetMonthOfCalendar};
	}

	/**
	 * Map a calendar date to its equivalent Gregorian date, accounting for the
	 * Julian–Gregorian offset that accumulated over twelve century-years before
	 * the 1582 reform.
	 *
	 * Uses the provided {@code ranges} object to determine the offset region and
	 * to convert the calendar year to the Gregorian year.
	 *
	 * @param targetOfCalendar - calendar date as {@code {year, month, day}}
	 * @param ranges           - region predicates and year conversion callback
	 * @returns equivalent Gregorian date
	 */
	static moveDateTo(targetOfCalendar: MoveDate, ranges: GregoryAndJulianMovementRanges): MoveDate {
		type Movement = {
			type: 'assign' | 'date';
			year: number;
			/** month is gregory month + 1 (starts from 1) */
			month: number;
			day: number;
		};

		const {year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar} = targetOfCalendar;
		// move!
		let movement: Movement;
		// after 1582/11 (includes): exactly same as gregory
		if (ranges.isOrAfter158211(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'assign',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetOfCalendar.month, day: targetOfCalendar.day
			};
		}
		// 1582/10, calendar month has 21 days (has no day 5-14), gregory is from 1582/10/11 to 1582/10/31
		else if (ranges.is158210(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'assign',
				year: 1582, month: 10,
				day: targetDayOfCalendar <= 4 ? (10 + targetDayOfCalendar) : (targetDayOfCalendar <= 14 ? 14 : targetDayOfCalendar)
			};
		}
		// 1500/03 to 1582/09, calendar (month x/day y) -> gregory (month x/day y + 10)
		else if (ranges.isOrBetween150003_158209(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 10
			};
		}
		// 1400/03 to 1500/02, calendar (month x/day y) -> gregory (month x/day y + 9)
		else if (ranges.isOrBetween140003_150002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 9
			};
		}
		// 1300/03 to 1400/02, calendar (month x/day y) -> gregory (month x/day y + 8)
		else if (ranges.isOrBetween130003_140002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 8
			};
		}
		// 1100/03 to 1300/02, calendar (month x/day y) -> gregory (month x/day y + 7)
		else if (ranges.isOrBetween110003_130002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 7
			};
		}
		// 1000/03 to 1100/02, calendar (month x/day y) -> gregory (month x/day y + 6)
		else if (ranges.isOrBetween100003_110002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 6
			};
		}
		// 900/03 to 1000/02, calendar (month x/day y) -> gregory (month x/day y + 5)
		else if (ranges.isOrBetween090003_100002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 5
			};
		}
		// 700/03 to 900/02, calendar (month x/day y) -> gregory (month x/day y + 4)
		else if (ranges.isOrBetween070003_090002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 4
			};
		}
		// 600/03 to 700/02, calendar (month x/day y) -> gregory (month x/day y + 3)
		else if (ranges.isOrBetween060003_070002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 3
			};
		}
		// 500/03 to 600/02, calendar (month x/day y) -> gregory (month x/day y + 2)
		else if (ranges.isOrBetween050003_060002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 2
			};
		}
		// 300/03 to 500/02, calendar (month x/day y) -> gregory (month x/day y + 1)
		else if (ranges.isOrBetween030003_050002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar + 1
			};
		}
		// 300/02 29 days, gregory 300/02 28 days. calendar 2/1-28 -> gregory 2/1-28; calendar 2/29 -> gregory 3/1
		else if (ranges.is030002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {type: 'date', year: 300, month: 2, day: targetDayOfCalendar};
		}
		// 200/03 to 300/01, calendar is same as gregory exactly
		else if (ranges.isOrBetween020003_030001(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'assign',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetOfCalendar.month, day: targetOfCalendar.day
			};
		}
		// 100/03 to 200/02, calendar (month x/day y) -> gregory (month x/day y - 1)
		else if (ranges.isOrBetween010003_020002(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar - 1
			};
		}
		// 0001/01, days from 3-31, reset to 3 if given day of calendar is less than 3. calendar (month x/day y) -> gregory (month x/day y - 2)
		else if (ranges.is000101(targetYearOfCalendar, targetMonthOfCalendar)) {
			movement = {
				type: 'assign',
				year: 1, month: 1, day: (targetDayOfCalendar < 3 ? 3 : targetDayOfCalendar) - 2
			};
		}
		// 0001/02 to 100/02, calendar (month x/day y) -> gregory (month x/day y - 2)
		else {
			movement = {
				type: 'date',
				year: ranges.toGregoryYear(targetYearOfCalendar),
				month: targetMonthOfCalendar, day: targetDayOfCalendar - 2
			};
		}

		switch (movement.type) {
			case 'assign': {
				const moved = {year: movement.year, month: movement.month, day: movement.day};
				DateMoveUtils.fixDayWhenOverLastDayOfMonth(moved);
				return moved;
			}
			case 'date':
			default: {
				let toDate: Date;
				const year = movement.year;
				if (year < 100) {
					toDate = new Date();
					toDate.setFullYear(year, movement.month - 1, movement.day);
				} else {
					toDate = new Date(year, movement.month - 1, movement.day);
				}
				return {
					year: toDate.getFullYear(),
					month: toDate.getMonth() + 1,
					day: toDate.getDate()
				};
			}
		}
	}
}

export class DateMoveZhTWUtils {
	/**
	 * <h3>Offset regions</h3>
	 * <pre>
	 * ROC year                  Gregorian     Offset   Notes
	 * ≥ -329 or -330/11+        ≥ 1583        0        post-reform, same as Gregorian
	 * -330/10                   1582/10       special  21-day month, days 5–14 skipped
	 * -412/03 to -330/09        1500–1582     +10
	 * -512/03 to -412/02        1400–1499     +9
	 * -612/03 to -512/02        1300–1399     +8
	 * -812/03 to -612/02        1100–1299     +7
	 * -912/03 to -812/02        1000–1099     +6
	 * -1012/03 to -912/02        900–999      +5
	 * -1212/03 to -1012/02       700–899      +4
	 * -1312/03 to -1212/02       600–699      +3
	 * -1412/03 to -1312/02       500–599      +2
	 * -1612/03 to -1412/02       300–499      +1
	 * -1612/02                   300/02       special  Julian 2/29 → Gregorian 3/1
	 * -1712/03 to -1612/01       200–299       0
	 * -1812/03 to -1712/02       100–199      –1
	 * -1911/02 to -1812/02         1–99       –2
	 * -1911/01                      1/01      special  days 1–2 clamped to 3 (no year 0)
	 * </pre>
	 */
	private static readonly ToGregoryAndJulianRanges: GregoryAndJulianMovementRanges = {
		// after 民國前 329 (includes), and 民國前 330/11, 330/12, roc is same as gregory exactly
		isOrAfter158211: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar >= -329 || (yearOfCalendar === -330 && monthOfCalendar >= 11);
		},
		// 民國前 330/10, roc has 21 days (has no day 5-14), gregory is from 1582/10/11 to 1582/10/31
		is158210: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === -330 && monthOfCalendar === 10;
		},
		// 民國前 412/03 to 民國前 330/09, roc (month x/day y) -> gregory (month x/day y + 10)
		isOrBetween150003_158209: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -412 || (yearOfCalendar === -412 && monthOfCalendar >= 3);
		},
		// 民國前 512/03 to 民國前 412/02, roc (month x/day y) -> gregory (month x/day y + 9)
		isOrBetween140003_150002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -512 || (yearOfCalendar === -512 && monthOfCalendar >= 3);
		},
		// 民國前 612/03 to 民國前 512/02, roc (month x/day y) -> gregory (month x/day y + 8)
		isOrBetween130003_140002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -612 || (yearOfCalendar === -612 && monthOfCalendar >= 3);
		},
		// 民國前 812/03 to 民國前 612/02, roc (month x/day y) -> gregory (month x/day y + 7)
		isOrBetween110003_130002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -812 || (yearOfCalendar === -812 && monthOfCalendar >= 3);
		},
		// 民國前 912/03 to 民國前 812/02, roc (month x/day y) -> gregory (month x/day y + 6)
		isOrBetween100003_110002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -912 || (yearOfCalendar === -912 && monthOfCalendar >= 3);
		},
		// 民國前 1012/03 to 民國前 912/02, roc (month x/day y) -> gregory (month x/day y + 5)
		isOrBetween090003_100002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1012 || (yearOfCalendar === -1012 && monthOfCalendar >= 3);
		},
		// 民國前 1212/03 to 民國前 1012/02, roc (month x/day y) -> gregory (month x/day y + 4)
		isOrBetween070003_090002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1212 || (yearOfCalendar === -1212 && monthOfCalendar >= 3);
		},
		// 民國前 1312/03 to 民國前 1212/02, roc (month x/day y) -> gregory (month x/day y + 3)
		isOrBetween060003_070002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1312 || (yearOfCalendar === -1312 && monthOfCalendar >= 3);
		},
		// 民國前 1412/03 to 民國前 1312/02, roc (month x/day y) -> gregory (month x/day y + 2)
		isOrBetween050003_060002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1412 || (yearOfCalendar === -1412 && monthOfCalendar >= 3);
		},
		// 民國前 1612/03 to 民國前 1412/02, roc (month x/day y) -> gregory (month x/day y + 1)
		isOrBetween030003_050002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1612 || (yearOfCalendar === -1612 && monthOfCalendar >= 3);
		},
		// 民國前 1612/02 29 days, gregory 300/02 28 days. roc 2/1-28 -> gregory 2/1-28; roc 2/29 -> gregory 3/1
		is030002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === -1612 && monthOfCalendar === 2;
		},
		// 民國前 1712/03 to 民國前 1612/01, roc is same as gregory exactly
		isOrBetween020003_030001: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1712 || (yearOfCalendar === -1712 && monthOfCalendar >= 3);
		},
		// 民國前 1812/03 to 民國前 1712/02, roc (month x/day y) -> gregory (month x/day y - 1)
		isOrBetween010003_020002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > -1812 || (yearOfCalendar === -1812 && monthOfCalendar >= 3);
		},
		// 民國前 1911/01, days from 3-31, reset to 3 if given day of calendar is less than 3. roc (month x/day y) -> gregory (month x/day y - 2)
		is000101: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === -1911 && monthOfCalendar === 1;
		},
		// 民國前 1911/02 to 民國前 1812/02, roc (month x/day y) -> gregory (month x/day y - 2)
		// to gregory year by year of calendar
		toGregoryYear: (yearOfCalendar: number) => yearOfCalendar > 0 ? (yearOfCalendar + 1911) : (yearOfCalendar + 1912)
	};

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/** Returns {@code true} when the language uses the ROC (Minguo) calendar. */
	// noinspection JSUnusedGlobalSymbols
	static accept(lang: HxLanguageCode): boolean {
		return DateLocaleUtils.isZhTW(lang);
	}

	/**
	 * Convert a ROC calendar year to a target year after applying an offset.
	 *
	 * ROC uses two eras: Minguo (≥ 1, 1912 CE+) and Before-Minguo (≤ -1, < 1912 CE).
	 * The internal representation uses positive for Minguo and negative for Before-Minguo.
	 * This method handles the non-existent year 0 (Minguo 1 → Before-Minguo -1).
	 *
	 * @param yearOfGregory - current Gregorian year, used to determine the era
	 * @param yearOfCalendar - current ROC year (positive = Minguo, negative = Before-Minguo)
	 * @param yearOffset     - number of years to move (positive = forward, negative = backward)
	 * @returns the target ROC year, clamped to ≥ -1911 (Gregorian 1 CE)
	 */
	private static convertYearOfCalendar(yearOfGregory: number, yearOfCalendar: number, yearOffset: number): number {
		if (yearOfGregory < 1912) {
			// convert 民國前 year of calendar to negative value, which starts from -1
			yearOfCalendar = 0 - yearOfCalendar;
		}
		let targetYearOfCalendar: number;
		if (yearOfCalendar > 0) {
			// 民國 starts from 1
			if (yearOffset > 0) {
				targetYearOfCalendar = yearOfCalendar + yearOffset;
			} else {
				targetYearOfCalendar = yearOfCalendar + yearOffset;
				if (targetYearOfCalendar <= 0) {
					// 民國前 starts from -1
					targetYearOfCalendar = targetYearOfCalendar - 1;
				}
			}
		} else if (yearOffset < 0) {
			// 民國前 starts from -1
			targetYearOfCalendar = yearOfCalendar + yearOffset;
		} else {
			// 民國前 starts from -1
			targetYearOfCalendar = yearOfCalendar + yearOffset;
			if (targetYearOfCalendar >= 0) {
				targetYearOfCalendar = targetYearOfCalendar + 1;
			}
		}
		// till gregory 0001/01/01, which is roc -1911/01/03
		return Math.max(-1911, targetYearOfCalendar);
	}

	/**
	 * Clamp a day number to the valid range for the target ROC month.
	 *
	 * Month lengths follow the Gregorian/Julian pattern (Jan=31, Feb=28/29, …)
	 * but are expressed in the ROC calendar. Leap-year detection delegates to
	 * {@link DateLocaleUtils.isZhTWLeapYear}, which applies Julian rule before 1582
	 * and Gregorian rule from 1582 onward.
	 *
	 * @param targetYearOfCalendar  - target ROC year (negative = Before-Minguo)
	 * @param targetMonthOfCalendar - target month (1–12)
	 * @param dayOfCalendar         - desired day of month
	 * @returns the day clamped to the maximum for the target month
	 */
	private static computeTargetDayOfCalendar(targetYearOfCalendar: number, targetMonthOfCalendar: number, dayOfCalendar: number): number {
		return DateMoveGregoryAndJulianUtils.computeTargetDayOfCalendar(
			targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar, DateLocaleUtils.isZhTWLeapYear
		);
	}

	/**
	 * Map a ROC calendar date ({@code year}, {@code month}, {@code day}) to a
	 * Gregorian date, accounting for the Julian–Gregorian offset that accumulated
	 * over twelve century-years before the 1582 reform.
	 *
	 * @param targetOfCalendar - ROC date as {@code {year, month, day}}
	 * @returns equivalent Gregorian date
	 */
	private static moveDateTo(targetOfCalendar: MoveDate): MoveDate {
		return DateMoveGregoryAndJulianUtils.moveDateTo(targetOfCalendar, DateMoveZhTWUtils.ToGregoryAndJulianRanges);
	}

	/**
	 * Move a Gregorian date by the given number of years in the ROC calendar.
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @param lang       - locale, used to format the date in ROC representation
	 * @returns the moved date in Gregorian
	 */
	// noinspection JSUnusedGlobalSymbols
	static moveYear(date: MoveDate, yearOffset: number, lang: HxLanguageCode): MoveDate {
		if (yearOffset === 0) {
			return {...date};
		}

		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(DateMoveUtils.asJsDate(date), lang, false);
		const targetYearOfCalendar = DateMoveZhTWUtils.convertYearOfCalendar(date.year, yearOfCalendar, yearOffset);
		const targetDayOfCalendar = DateMoveZhTWUtils.computeTargetDayOfCalendar(targetYearOfCalendar, monthOfCalendar, dayOfCalendar);

		return DateMoveZhTWUtils.moveDateTo({
			year: targetYearOfCalendar, month: monthOfCalendar, day: targetDayOfCalendar
		});
	}

	/**
	 * Move a Gregorian date by the given number of months in the ROC calendar.
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @param lang        - locale, used to format the date in ROC representation
	 * @returns the moved date in Gregorian
	 */
	// noinspection JSUnusedGlobalSymbols
	static moveMonth(date: MoveDate, monthOffset: number, lang: HxLanguageCode): MoveDate {
		if (monthOffset === 0) {
			return {...date};
		}

		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(DateMoveUtils.asJsDate(date), lang, false);
		// compute target year/month of calendar
		const {
			yearOffset, targetMonthOfCalendar
		} = DateMoveGregoryAndJulianUtils.computeTargetYearAndMonthOfCalendar(monthOfCalendar, monthOffset);
		const targetYearOfCalendar = DateMoveZhTWUtils.convertYearOfCalendar(date.year, yearOfCalendar, yearOffset);
		// compute target day of calendar
		const targetDayOfCalendar = DateMoveZhTWUtils.computeTargetDayOfCalendar(targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar);
		return DateMoveZhTWUtils.moveDateTo({
			year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar
		});
	}
}

export class DateMoveJaUtils {
	/**
	 * <h3>Offset regions</h3>
	 * <pre>
	 * Japanese year              Gregorian     Offset   Notes
	 * ≥ 1583 or 1582/11+          ≥ 1583        0        post-reform, same as Gregorian
	 * 1582/10                     1582/10       special  21-day month, days 5–14 skipped
	 * 1500/03 to 1582/09          1500–1582     +10
	 * 1400/03 to 1500/02          1400–1499     +9
	 * 1300/03 to 1400/02          1300–1399     +8
	 * 1100/03 to 1300/02          1100–1299     +7
	 * 1000/03 to 1100/02          1000–1099     +6
	 *  900/03 to 1000/02           900–999      +5
	 *  700/03 to  900/02           700–899      +4
	 *  600/03 to  700/02           600–699      +3
	 *  500/03 to  600/02           500–599      +2
	 *  300/03 to  500/02           300–499      +1
	 *  300/02                      300/02       special  Julian 2/29 → Gregorian 3/1
	 *  200/03 to  300/01           200–299       0
	 *  100/03 to  200/02           100–199      –1
	 *    1/02 to  100/02             1–99       –2
	 *    1/01                         1/01      special  days 1–2 clamped to 3 (no year 0)
	 * </pre>
	 */
	private static readonly ToGregoryAndJulianRanges: GregoryAndJulianMovementRanges = {
		// after 1583 (includes), and 1582/11, 1582/12, japanese is same as gregory exactly
		isOrAfter158211: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar >= 1583 || (yearOfCalendar === 1582 && monthOfCalendar >= 11);
		},
		// 1582/10, japanese has 21 days (has no day 5-14), gregory is from 1582/10/11 to 1582/10/31
		is158210: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === 1582 && monthOfCalendar === 10;
		},
		// 1500/03 to 1582/09, japanese (month x/day y) -> gregory (month x/day y + 10)
		isOrBetween150003_158209: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1500 || (yearOfCalendar === 1500 && monthOfCalendar >= 3);
		},
		// 1400/03 to 1500/02, japanese (month x/day y) -> gregory (month x/day y + 9)
		isOrBetween140003_150002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1400 || (yearOfCalendar === 1400 && monthOfCalendar >= 3);
		},
		// 1300/03 to 1400/02, japanese (month x/day y) -> gregory (month x/day y + 8)
		isOrBetween130003_140002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1300 || (yearOfCalendar === 1300 && monthOfCalendar >= 3);
		},
		// 1100/03 to 1300/02, japanese (month x/day y) -> gregory (month x/day y + 7)
		isOrBetween110003_130002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1100 || (yearOfCalendar === 1100 && monthOfCalendar >= 3);
		},
		// 1000/03 to 1100/02, japanese (month x/day y) -> gregory (month x/day y + 6)
		isOrBetween100003_110002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1000 || (yearOfCalendar === 1000 && monthOfCalendar >= 3);
		},
		// 900/03 to 1000/02, japanese (month x/day y) -> gregory (month x/day y + 5)
		isOrBetween090003_100002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 900 || (yearOfCalendar === 900 && monthOfCalendar >= 3);
		},
		// 700/03 to 900/02, japanese (month x/day y) -> gregory (month x/day y + 4)
		isOrBetween070003_090002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 700 || (yearOfCalendar === 700 && monthOfCalendar >= 3);
		},
		// 600/03 to 700/02, japanese (month x/day y) -> gregory (month x/day y + 3)
		isOrBetween060003_070002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 600 || (yearOfCalendar === 600 && monthOfCalendar >= 3);
		},
		// 500/03 to 600/02, japanese (month x/day y) -> gregory (month x/day y + 2)
		isOrBetween050003_060002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 500 || (yearOfCalendar === 500 && monthOfCalendar >= 3);
		},
		// 300/03 to 500/02, japanese (month x/day y) -> gregory (month x/day y + 1)
		isOrBetween030003_050002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 300 || (yearOfCalendar === 300 && monthOfCalendar >= 3);
		},
		// 300/02 29 days, gregory 300/02 28 days. japanese 2/1-28 -> gregory 2/1-28; japanese 2/29 -> gregory 3/1
		is030002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === 300 && monthOfCalendar === 2;
		},
		// 200/03 to 300/01, japanese is same as gregory exactly
		isOrBetween020003_030001: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 200 || (yearOfCalendar === 200 && monthOfCalendar >= 3);
		},
		// 100/03 to 200/02, japanese (month x/day y) -> gregory (month x/day y - 1)
		isOrBetween010003_020002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 100 || (yearOfCalendar === 100 && monthOfCalendar >= 3);
		},
		// 0001/01, days from 3-31, reset to 3 if given day of calendar is less than 3. japanese (month x/day y) -> gregory (month x/day y - 2)
		is000101: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === 1 && monthOfCalendar === 1;
		},
		// 0001/02 to 100/02, japanese (month x/day y) -> gregory (month x/day y - 2)
		toGregoryYear: (yearOfCalendar: number) => yearOfCalendar
	};

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/** Returns {@code true} when the language uses the Japanese calendar. */
	// noinspection JSUnusedGlobalSymbols
	static accept(lang: HxLanguageCode): boolean {
		return DateLocaleUtils.isJa(lang);
	}

	/**
	 * Convert a Gregorian date to a sequential calendar year for year-offset movement.
	 *
	 * Because the Julian–Gregorian offset pushes calendar dates backward by a number
	 * of days, dates in early January may still fall into the previous calendar year.
	 * This method corrects that by subtracting 1 from the Gregorian year in the
	 * early-January window, and reverts the adjustment for negative-offset ranges
	 * where the calendar year runs ahead of the Gregorian year at the December boundary.
	 *
	 * <h3>Adjustment rules</h3>
	 * <pre>
	 * Gregorian year      January day range   Adjustment   Notes
	 * ≥ 1583              —                   ±0           post-reform, same year
	 * 1501–1582           day ≤ 10            −1           Julian offset +10
	 * 1401–1500           day ≤ 9             −1           Julian offset +9
	 * 1301–1400           day ≤ 8             −1           Julian offset +8
	 * 1101–1300           day ≤ 7             −1           Julian offset +7
	 * 1001–1100           day ≤ 6             −1           Julian offset +6
	 *  901–1000           day ≤ 5             −1           Julian offset +5
	 *  701– 900           day ≤ 4             −1           Julian offset +4
	 *  601– 700           day ≤ 3             −1           Julian offset +3
	 *  501– 600           day ≤ 2             −1           Julian offset +2
	 *  301– 500           day = 1             −1           Julian offset +1
	 *  200– 300           —                   ±0           Julian offset  0
	 *  100– 199           Dec 31              +1           Julian offset −1 (year-end boundary)
	 *    1–  99           —                   +2           Julian offset −2
	 * </pre>
	 */
	static convertYearOfCalendar(date: MoveDate): number {
		const {year, month, day} = date;
		if (year >= 1583) {
			return year;
		} else if (year > 1500 && month === 1 && day <= 10) {
			return year - 1;
		} else if (year > 1400 && month === 1 && day <= 9) {
			return year - 1;
		} else if (year > 1300 && month === 1 && day <= 8) {
			return year - 1;
		} else if (year > 1100 && month === 1 && day <= 7) {
			return year - 1;
		} else if (year > 1000 && month === 1 && day <= 6) {
			return year - 1;
		} else if (year > 900 && month === 1 && day <= 5) {
			return year - 1;
		} else if (year > 700 && month === 1 && day <= 4) {
			return year - 1;
		} else if (year > 600 && month === 1 && day <= 3) {
			return year - 1;
		} else if (year > 500 && month === 1 && day <= 2) {
			return year - 1;
		} else if (year > 300 && month === 1 && day === 1) {
			return year - 1;
		} else if (year >= 200) {
			return year;
		} else if (year >= 100 && month === 12 && day === 31) {
			return year + 1;
		} else {
			return year + 2;
		}
	}

	/**
	 * Clamp a day number to the valid range for the target Japanese month.
	 *
	 * @see DateMoveGregoryAndJulianUtils#computeTargetDayOfCalendar
	 */
	static computeTargetDayOfCalendar(targetYearOfCalendar: number, targetMonthOfCalendar: number, dayOfCalendar: number): number {
		return DateMoveGregoryAndJulianUtils.computeTargetDayOfCalendar(
			targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar, DateLocaleUtils.isJaLeapYear
		);
	}

	/**
	 * Map a Japanese calendar date to its equivalent Gregorian date.
	 *
	 * @see DateMoveGregoryAndJulianUtils#moveDateTo
	 */
	private static moveDateTo(targetOfCalendar: MoveDate): MoveDate {
		return DateMoveGregoryAndJulianUtils.moveDateTo(targetOfCalendar, DateMoveJaUtils.ToGregoryAndJulianRanges);
	}

	/**
	 * Move a Gregorian date by the given number of years in the Japanese calendar.
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @param lang       - locale, used to format the date in Japanese representation
	 * @returns the moved date in Gregorian
	 */
	// noinspection JSUnusedGlobalSymbols
	static moveYear(date: MoveDate, yearOffset: number, lang: HxLanguageCode): MoveDate {
		if (yearOffset === 0) {
			return {...date};
		}

		const [, , monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(DateMoveUtils.asJsDate(date), lang, false);
		const targetYearOfCalendar = Math.max(1, DateMoveJaUtils.convertYearOfCalendar(date) + yearOffset);
		const targetDayOfCalendar = DateMoveJaUtils.computeTargetDayOfCalendar(targetYearOfCalendar, monthOfCalendar, dayOfCalendar);

		return DateMoveJaUtils.moveDateTo({
			year: targetYearOfCalendar, month: monthOfCalendar, day: targetDayOfCalendar
		});
	}

	/**
	 * Move a Gregorian date by the given number of months in the Japanese calendar.
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @param lang        - locale, used to format the date in Japanese representation
	 * @returns the moved date in Gregorian
	 */
	// noinspection JSUnusedGlobalSymbols
	static moveMonth(date: MoveDate, monthOffset: number, lang: HxLanguageCode): MoveDate {
		if (monthOffset === 0) {
			return {...date};
		}

		const [, , monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(DateMoveUtils.asJsDate(date), lang, false);
		// compute target year/month of calendar
		const {
			yearOffset, targetMonthOfCalendar
		} = DateMoveGregoryAndJulianUtils.computeTargetYearAndMonthOfCalendar(monthOfCalendar, monthOffset);
		const targetYearOfCalendar = Math.max(1, DateMoveJaUtils.convertYearOfCalendar(date) + yearOffset);
		// compute target day of calendar
		const targetDayOfCalendar = DateMoveJaUtils.computeTargetDayOfCalendar(targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar);
		return DateMoveJaUtils.moveDateTo({
			year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar
		});
	}
}

export class DateMoveThUtils {
	/**
	 * <h3>Offset regions</h3>
	 * <pre>
	 * Buddhist year             Gregorian     Offset   Notes
	 * ≥ 2126 or 2125/11+        ≥ 1583        0        post-reform, same as Gregorian
	 * 2125/10                   1582/10       special  21-day month, days 5–14 skipped
	 * 2043/03 to 2125/09        1500–1582     +10
	 * 1943/03 to 2043/02        1400–1499     +9
	 * 1843/03 to 1943/02        1300–1399     +8
	 * 1643/03 to 1843/02        1100–1299     +7
	 * 1543/03 to 1643/02        1000–1099     +6
	 * 1443/03 to 1543/02         900–999      +5
	 * 1243/03 to 1443/02         700–899      +4
	 * 1143/03 to 1243/02         600–699      +3
	 * 1043/03 to 1143/02         500–599      +2
	 *  843/03 to 1043/02         300–499      +1
	 *  843/02                    300/02       special  Julian 2/29 → Gregorian 3/1
	 *  743/03 to  843/01         200–299       0
	 *  643/03 to  743/02         100–199      –1
	 *  544/02 to  643/02           1–99       –2
	 *  544/01                       1/01      special  days 1–2 clamped to 3 (no year 0)
	 * </pre>
	 */
	private static readonly ToGregoryAndJulianRanges: GregoryAndJulianMovementRanges = {
		// after 2126 (includes), and 2125/11, 2125/12, buddhist is same as gregory exactly
		isOrAfter158211: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar >= 2126 || (yearOfCalendar === 2125 && monthOfCalendar >= 11);
		},
		// 2125/10, buddhist has 21 days (has no day 5-14), gregory is from 1582/10/11 to 1582/10/31
		is158210: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === 2125 && monthOfCalendar === 10;
		},
		// 2043/03 to 2125/09, buddhist (month x/day y) -> gregory (month x/day y + 10)
		isOrBetween150003_158209: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 2043 || (yearOfCalendar === 2043 && monthOfCalendar >= 3);
		},
		// 1943/03 to 2043/02, buddhist (month x/day y) -> gregory (month x/day y + 9)
		isOrBetween140003_150002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1943 || (yearOfCalendar === 1943 && monthOfCalendar >= 3);
		},
		// 1843/03 to 1943/02, buddhist (month x/day y) -> gregory (month x/day y + 8)
		isOrBetween130003_140002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1843 || (yearOfCalendar === 1843 && monthOfCalendar >= 3);
		},
		// 1643/03 to 1843/02, buddhist (month x/day y) -> gregory (month x/day y + 7)
		isOrBetween110003_130002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1643 || (yearOfCalendar === 1643 && monthOfCalendar >= 3);
		},
		// 1543/03 to 1643/02, buddhist (month x/day y) -> gregory (month x/day y + 6)
		isOrBetween100003_110002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1543 || (yearOfCalendar === 1543 && monthOfCalendar >= 3);
		},
		// 1443/03 to 1543/02, buddhist (month x/day y) -> gregory (month x/day y + 5)
		isOrBetween090003_100002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1443 || (yearOfCalendar === 1443 && monthOfCalendar >= 3);
		},
		// 1243/03 to 1443/02, buddhist (month x/day y) -> gregory (month x/day y + 4)
		isOrBetween070003_090002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1243 || (yearOfCalendar === 1243 && monthOfCalendar >= 3);
		},
		// 1143/03 to 1243/02, buddhist (month x/day y) -> gregory (month x/day y + 3)
		isOrBetween060003_070002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1143 || (yearOfCalendar === 1143 && monthOfCalendar >= 3);
		},
		// 1043/03 to 1143/02, buddhist (month x/day y) -> gregory (month x/day y + 2)
		isOrBetween050003_060002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 1043 || (yearOfCalendar === 1043 && monthOfCalendar >= 3);
		},
		// 843/03 to 1043/02, buddhist (month x/day y) -> gregory (month x/day y + 1)
		isOrBetween030003_050002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 843 || (yearOfCalendar === 843 && monthOfCalendar >= 3);
		},
		// 843/02 29 days, gregory 300/02 28 days. buddhist 2/1-28 -> gregory 2/1-28; buddhist 2/29 -> gregory 3/1
		is030002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === 843 && monthOfCalendar === 2;
		},
		// 743/03 to 843/01, buddhist is same as gregory exactly
		isOrBetween020003_030001: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 743 || (yearOfCalendar === 743 && monthOfCalendar >= 3);
		},
		// 643/03 to 743/02, buddhist (month x/day y) -> gregory (month x/day y - 1)
		isOrBetween010003_020002: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar > 643 || (yearOfCalendar === 643 && monthOfCalendar >= 3);
		},
		// 544/01, days from 3-31, reset to 3 if given day of calendar is less than 3. buddhist (month x/day y) -> gregory (month x/day y - 2)
		is000101: (yearOfCalendar: number, monthOfCalendar: number) => {
			return yearOfCalendar === 544 && monthOfCalendar === 1;
		},
		// 544/02 to 643/02, buddhist (month x/day y) -> gregory (month x/day y - 2)
		toGregoryYear: (yearOfCalendar: number) => yearOfCalendar - 543
	};

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/** Returns {@code true} when the language uses the Thai (Buddhist) calendar. */
	// noinspection JSUnusedGlobalSymbols
	static accept(lang: HxLanguageCode): boolean {
		return DateLocaleUtils.isTh(lang);
	}

	/**
	 * Clamp a day number to the valid range for the target Buddhist month.
	 *
	 * @see DateMoveGregoryAndJulianUtils#computeTargetDayOfCalendar
	 */
	private static computeTargetDayOfCalendar(targetYearOfCalendar: number, targetMonthOfCalendar: number, dayOfCalendar: number): number {
		return DateMoveGregoryAndJulianUtils.computeTargetDayOfCalendar(
			targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar, DateLocaleUtils.isThLeapYear
		);
	}

	/**
	 * Map a Buddhist date to its equivalent Gregorian date.
	 *
	 * @see DateMoveGregoryAndJulianUtils#moveDateTo
	 */
	private static moveDateTo(targetOfCalendar: MoveDate): MoveDate {
		return DateMoveGregoryAndJulianUtils.moveDateTo(targetOfCalendar, DateMoveThUtils.ToGregoryAndJulianRanges);
	}

	/**
	 * Move a Gregorian date by the given number of years in the Buddhist calendar.
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @param lang       - locale, used to format the date in Buddhist representation
	 * @returns the moved date in Gregorian
	 */
	// noinspection JSUnusedGlobalSymbols
	static moveYear(date: MoveDate, yearOffset: number, lang: HxLanguageCode): MoveDate {
		if (yearOffset === 0) {
			return {...date};
		}

		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(DateMoveUtils.asJsDate(date), lang, false);
		const targetYearOfCalendar = Math.max(544, yearOfCalendar + yearOffset);
		const targetDayOfCalendar = DateMoveThUtils.computeTargetDayOfCalendar(targetYearOfCalendar, monthOfCalendar, dayOfCalendar);

		return DateMoveThUtils.moveDateTo({
			year: targetYearOfCalendar, month: monthOfCalendar, day: targetDayOfCalendar
		});
	}

	/**
	 * Move a Gregorian date by the given number of months in the Buddhist calendar.
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @param lang        - locale, used to format the date in Buddhist representation
	 * @returns the moved date in Gregorian
	 */
	// noinspection JSUnusedGlobalSymbols
	static moveMonth(date: MoveDate, monthOffset: number, lang: HxLanguageCode): MoveDate {
		if (monthOffset === 0) {
			return {...date};
		}

		const [, yearOfCalendar, monthOfCalendar, dayOfCalendar] = DateLocaleUtils.formatDateInNumeric(DateMoveUtils.asJsDate(date), lang, false);
		// compute target year/month of calendar
		const {
			yearOffset, targetMonthOfCalendar
		} = DateMoveGregoryAndJulianUtils.computeTargetYearAndMonthOfCalendar(monthOfCalendar, monthOffset);
		const targetYearOfCalendar = Math.max(544, yearOfCalendar + yearOffset);
		// compute target day of calendar
		const targetDayOfCalendar = DateMoveThUtils.computeTargetDayOfCalendar(targetYearOfCalendar, targetMonthOfCalendar, dayOfCalendar);
		return DateMoveThUtils.moveDateTo({
			year: targetYearOfCalendar, month: targetMonthOfCalendar, day: targetDayOfCalendar
		});
	}
}

export class DateMoveUtils {
	private static NotGregorianMoveUtils = [
		DateMoveZhTWUtils,
		DateMoveJaUtils,
		DateMoveThUtils
	];

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Converts a {@link MoveDate} or {@link HxDateTimeValue} to a JavaScript `Date` object.
	 * Month is 1-based in the input and converted to 0-based for `Date`.
	 */
	static asJsDate(value: MoveDate | Required<HxDateTimeValue>): Date {
		const date = new Date();
		// @ts-expect-error ignore type check
		date.setSeconds(value.second ?? 0);
		// @ts-expect-error ignore type check
		date.setMinutes(value.minute ?? 0);
		// @ts-expect-error ignore type check
		date.setHours(value.hour ?? 0);
		date.setFullYear(value.year);
		date.setMonth(value.month - 1);
		date.setDate(value.day);
		return date;
	};

	/**
	 * Clamps the day field to the last valid day of the Gregorian month when it exceeds the max.
	 * Mutates the given value in place.
	 */
	static fixDayWhenOverLastDayOfMonth(date: MoveDate): void {
		const {year, month, day} = date;
		if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
			// do nothing
		} else if ([4, 6, 9, 11].includes(month)) {
			if (day === 31) {
				date.day = 30;
			}
		} else if (DateLocaleUtils.isGregorianLeapYear(year)) {
			// Feb. leap year
			if (day > 29) {
				date.day = 29;
			}
		} else if (day > 28) {
			date.day = 28;
		}
	}

	/**
	 * Clamps a BC date (year ≤ 0) to 0001-01-01, the earliest valid AD date.
	 * Mutates the given date in place.
	 */
	static backToAdWhenBc(date: Date): void {
		if (date.getFullYear() <= 0) {
			date.setDate(1);
			date.setMonth(0);
			date.setFullYear(1);
		}
	}

	/** Returns true if the given date is exactly 0001-01-01, the first day of AD. */
	static firstDayOfAd(date: Date): boolean {
		return date.getFullYear() === 1 && date.getMonth() === 0 && date.getDate() === 1;
	}

	/**
	 * Move a date by the given number of years, dispatching to the appropriate
	 * calendar strategy based on the Gregorian flag and locale.
	 *
	 * Falls back to today's date (as a placeholder) when no matching non-Gregorian
	 * strategy is registered for the given locale.
	 *
	 * @param date       - date in Gregorian
	 * @param yearOffset - number of years to move (positive = forward, negative = backward)
	 * @param lang       - locale, determines which calendar strategy to use
	 * @param gregorian  - if {@code true}, use Gregorian arithmetic directly
	 * @returns the moved date in Gregorian
	 */
	static moveYear(date: MoveDate, yearOffset: number, lang: HxLanguageCode, gregorian: boolean): MoveDate {
		if (yearOffset === 0) {
			return {...date};
		}

		// gregorian
		if (DateMoveGregorianUtils.accept(gregorian)) {
			return DateMoveGregorianUtils.moveYear(date, yearOffset);
		}
		// non-gregorian
		const Utils = DateMoveUtils.NotGregorianMoveUtils.find(utils => utils.accept(lang));
		if (Utils != null) {
			return Utils.moveYear(date, yearOffset, lang);
		}
		// non-gregorian, others
		else {
			const targetDate = new Date();
			// TODO
			return {
				year: targetDate.getFullYear(),
				month: targetDate.getMonth() + 1,
				day: targetDate.getDate()
			};
		}
	}

	/**
	 * Move a date by the given number of months, dispatching to the appropriate
	 * calendar strategy based on the Gregorian flag and locale.
	 *
	 * Falls back to today's date (as a placeholder) when no matching non-Gregorian
	 * strategy is registered for the given locale.
	 *
	 * @param date        - date in Gregorian
	 * @param monthOffset - number of months to move (positive = forward, negative = backward)
	 * @param lang        - locale, determines which calendar strategy to use
	 * @param gregorian   - if {@code true}, use Gregorian arithmetic directly
	 * @returns the moved date in Gregorian
	 */
	static moveMonth(date: MoveDate, monthOffset: number, lang: HxLanguageCode, gregorian: boolean): MoveDate {
		if (monthOffset === 0) {
			return {...date};
		}

		// gregorian
		if (DateMoveGregorianUtils.accept(gregorian)) {
			return DateMoveGregorianUtils.moveMonth(date, monthOffset);
		}
		// non-gregorian
		const Utils = DateMoveUtils.NotGregorianMoveUtils.find(utils => utils.accept(lang));
		if (Utils != null) {
			return Utils.moveMonth(date, monthOffset, lang);
		}
		// non-gregorian, others
		else {
			const targetDate = new Date();
			// TODO
			return {
				year: targetDate.getFullYear(),
				month: targetDate.getMonth() + 1,
				day: targetDate.getDate()
			};
		}
	}
}

export class DataMoveHelper {
	/**
	 * Compute calendar months and years backward from today for a given locale.
	 *
	 * Walks backward month-by-month from the current date, recording each month's
	 * first and last day in both Gregorian and the target calendar. Stops when the
	 * first day of A.D. (0001-01-01) is reached.
	 *
	 * @param lang - locale whose calendar to use
	 * @returns an array of calendar years, each containing their months
	 */
	static computeCalendarYearsAndMonths(lang: HxLanguageCode): Array<CalendarYear> {
		const toGregory = (date: Date): GregoryDay => {
			return {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
		};
		const toCalendar = (date: Date): CalendarDay => {
			const [
				eraOfCalendar, yearOfCalendar, monthOfCalendar, dayOfCalendar
			] = DateLocaleUtils.formatDateInNumeric(date, lang, false);
			return {era: eraOfCalendar, year: yearOfCalendar, month: monthOfCalendar, day: dayOfCalendar};
		};

		const calendarYears: Array<CalendarYear> = [];
		let calendarYear: CalendarYear;
		let aMonth: AMonth;
		let calendarDay: CalendarDay;

		// go!
		const date = new Date();
		// compute today in calendar of given language

		// last month, according to current date
		calendarDay = toCalendar(date);
		// @ts-expect-error ignore type check
		aMonth = {last: {gregory: toGregory(date), calendar: calendarDay}};
		calendarYear = {months: [aMonth]};
		calendarYears.push(calendarYear);
		// move to first day of this calendar month
		date.setDate(date.getDate() - calendarDay.day + 1);
		calendarDay = toCalendar(date);
		aMonth.first = {gregory: toGregory(date), calendar: calendarDay};

		// backward
		while (true) {
			if (DateMoveUtils.firstDayOfAd(date)) {
				break;
			}

			// move to last day of previous month
			date.setDate(date.getDate() - 1);
			DateMoveUtils.backToAdWhenBc(date);
			calendarDay = toCalendar(date);
			// @ts-expect-error ignore type check
			aMonth = {last: {gregory: toGregory(date), calendar: calendarDay}};
			if (aMonth.last.calendar.month > calendarYear.months[calendarYear.months.length - 1].last.calendar.month) {
				// jump to previous year
				calendarYear = {months: [aMonth]};
				calendarYears.push(calendarYear);
			} else {
				calendarYear.months.push(aMonth);
			}

			// move to first of previous month
			date.setDate(date.getDate() - calendarDay.day + 1);
			DateMoveUtils.backToAdWhenBc(date);
			calendarDay = toCalendar(date);
			// very carefully, since there might some days jumping in-month, such as the disappeared 10 days in Oct. 1582.
			// so simply set day to 1st might introduce this issue,
			// have to fixed it.
			// the evidence is if the calendar day is not 1. so check it.
			//
			// but if date jumps into B.C., and back to first day of A.D. this logic should be ignored,
			// just take this day as the first day of calendar month
			if (!DateMoveUtils.firstDayOfAd(date) && calendarDay.day !== 1) {
				while (true) {
					date.setDate(date.getDate() + 1);
					calendarDay = toCalendar(date);
					if (calendarDay.day === 1) {
						break;
					}
				}
			}
			aMonth.first = {gregory: toGregory(date), calendar: calendarDay};

			if (DateMoveUtils.firstDayOfAd(date)) {
				break;
			}
		}

		calendarYears.forEach(year => {
			year.months.forEach(month => {
				if (month.first.calendar.era == null || month.first.calendar.era.trim() === '') {
					delete month.first.calendar.era;
				}
				if (month.last.calendar.era == null || month.last.calendar.era.trim() === '') {
					delete month.last.calendar.era;
				}
			});
		});

		return calendarYears;
	}

	/** Compute Buddhist (th-TH) calendar years. */
	static calendarYearsOfBuddhist(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('th-TH');
	}

	/** Compute Coptic (ar-EG) calendar years. */
	static calendarYearsOfCoptic(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('ar-EG');
	}

	/** Compute Ethiopic (am-ET) calendar years. */
	static calendarYearsOfEthiopic_Am_ET(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('am-ET');
	}

	/** Compute Ethiopic (ti-ET) calendar years. */
	static calendarYearsOfEthiopic_Ti_ET(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('ti-ET');
	}

	/** Compute Hebrew (he-IL) calendar years. */
	static calendarYearsOfHebrew(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('he-IL');
	}

	/** Compute Japanese (ja-JP) calendar years. */
	static calendarYearsOfJapanese(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('ja-JP');
	}

	/** Compute Indian national (hi-IN) calendar years. */
	static calendarYearsOfIndian(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('hi-IN');
	}

	/** Compute Islamic tabular (ar-DZ) calendar years. */
	static calendarYearsOfIslamic(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('ar-DZ');
	}

	/** Compute Islamic Civil (ar-AE) calendar years. */
	static calendarYearsOfIslamicCivil(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('ar-AE');
	}

	/** Compute Umm Al-Qura (ar-OM) calendar years. */
	static calendarYearsOfIslamicUmalqura(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('ar-OM');
	}

	/** Compute Persian (mzn-IR) calendar years. */
	static calendarYearsOfPersian_Mzn_IR(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('mzn-IR');
	}

	/** Compute Persian (lrc-IR) calendar years. */
	static calendarYearsOfPersian_Lrc_IR(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('lrc-IR');
	}

	/** Compute Persian (ckb-IR) calendar years. */
	static calendarYearsOfPersian_Ckb_IR(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('ckb-IR');
	}

	/** Compute Persian (fa-IR) calendar years. */
	static calendarYearsOfPersian_Fa_IR(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('fa-IR');
	}

	/** Compute Persian (ps-AF) calendar years. */
	static calendarYearsOfPersian_Ps_AF(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('ps-AF');
	}

	/** Compute Persian (uz-Arab-AF) calendar years. */
	static calendarYearsOfPersian_Uz_Arab_AF(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('uz-Arab-AF');
	}

	/** Compute ROC (zh-TW) calendar years. */
	static calendarYearsOfTaiwanRoc(): Array<CalendarYear> {
		return DataMoveHelper.computeCalendarYearsAndMonths('zh-TW');
	}
}
