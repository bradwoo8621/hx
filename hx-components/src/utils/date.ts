import type {HxLanguageCode} from '../contexts';
import type {
	HxDateTimeDefaultValuesInStr,
	HxDateTimeFormatDataChar,
	HxDateTimeFormatFixedChar,
	HxDateTimeRelatedFormat,
	HxDateTimeValue,
	HxParsedDateTimeFormat
} from '../types';
import {HxConsole} from './browser.ts';

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
	static fulfillWithDefault(value: HxDateTimeValue, defaultValue: HxDateTimeValue): HxDateTimeValue {
		const now = new Date();
		value.year = value.year ?? defaultValue.year ?? now.getFullYear();
		value.month = value.month ?? defaultValue.month ?? (now.getMonth() + 1);
		value.day = value.day ?? defaultValue.day ?? now.getDate();
		value.hour = value.hour ?? defaultValue.hour ?? now.getHours();
		value.minute = value.minute ?? defaultValue.minute ?? now.getMinutes();
		value.second = value.second ?? defaultValue.second ?? now.getSeconds();
		return value;
	};
}

// noinspection SpellCheckingInspection
export type ArabCalendar = 'islamic' | 'islamic-civil' | 'islamic-umalqura' | 'islamic-tbla' | 'islamic-rgsa';

export class DateLocaleUtils {
	// noinspection SpellCheckingInspection
	private static readonly GREGORY = 'gregory';
	// noinspection SpellCheckingInspection
	private static readonly ARAB_CALENDARS = ['islamic', 'islamic-civil', 'islamic-umalqura', 'islamic-tbla', 'islamic-rgsa'];
	// noinspection SpellCheckingInspection
	private static readonly CALENDAR_MAP = {
		'ar-EG': 'coptic', // Egypt
		'en-IN': 'indian', // India
		// 'fa-IR': 'persian', // Iran
		'hi-IN': 'indian', // India
		'hi': 'indian', // India
		'he-IL': 'hebrew', // Israel
		'he': 'hebrew', // Israel
		'ja-JP': 'japanese', // Japan
		'ja': 'japanese', // Japan
		// 'th-TH': 'buddhist', // Thailand
		'zh-TW': 'roc' // Taiwan, China
	};
	private static readonly CALENDAR_MAP_KEYS = Object.keys(DateLocaleUtils.CALENDAR_MAP).sort((a, b) => -1 * a.localeCompare(b));
	private static FORMATS = new Map<string, Intl.DateTimeFormat>();

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	private static findCalendar(lang: HxLanguageCode): string {
		let found: string = DateLocaleUtils.CALENDAR_MAP[lang as keyof typeof DateLocaleUtils.CALENDAR_MAP];
		if (found == null) {
			const key = DateLocaleUtils.CALENDAR_MAP_KEYS.find(key => lang.startsWith(key));
			if (key != null) {
				found = DateLocaleUtils.CALENDAR_MAP[key as keyof typeof DateLocaleUtils.CALENDAR_MAP];
			}
		}
		return found || DateLocaleUtils.GREGORY;
	}

	private static findFormat(lang: HxLanguageCode, gregorian: boolean | ArabCalendar): Intl.DateTimeFormat {
		const key = `${lang}--${gregorian}`;
		let format = DateLocaleUtils.FORMATS.get(key);
		if (format == null) {
			let calendar: string | undefined;
			if (gregorian === true) {
				calendar = DateLocaleUtils.GREGORY;
			} else if (typeof gregorian === 'string' && DateLocaleUtils.ARAB_CALENDARS.includes(gregorian)) {
				calendar = gregorian;
			} else {
				calendar = DateLocaleUtils.findCalendar(lang);
			}
			format = new Intl.DateTimeFormat(lang, {
				year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', calendar
			});
			DateLocaleUtils.FORMATS.set(key, format);
		}
		return format;
	}

	static formatEra(date: Date, lang: HxLanguageCode, gregorian: boolean | ArabCalendar): string {
		if (gregorian === true) {
			return '';
		}
		if (lang === 'ja' || lang.startsWith('ja-')
			|| lang === 'zh-TW' || lang.startsWith('zh-TW')) {
			const format = DateLocaleUtils.findFormat(lang, false);
			const parts = format.formatToParts(date);
			const part = parts.find(part => part.type === 'era');
			return part?.value || '';
		} else {
			return '';
		}
	}

	static formatYear(date: Date, lang: HxLanguageCode, gregorian: boolean | ArabCalendar): string {
		if (gregorian === true) {
			return String(date.getFullYear());
		}
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		const partIndex = parts.findIndex(part => part.type === 'year');
		if (partIndex < 0) {
			return String(date.getFullYear());
		} else {
			const year = parts[partIndex].value;
			let literal = '';
			if (parts[partIndex + 1]?.type === 'literal') {
				literal = parts[partIndex + 1].value.trim();
			}
			return [year, literal].join('');
		}
	}

	static formatMonth(date: Date, lang: HxLanguageCode, gregorian: boolean | ArabCalendar): string {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
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

	static formatDay(date: Date, lang: HxLanguageCode, gregorian: boolean | ArabCalendar): string {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
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

	static formatWeekday(date: Date, lang: HxLanguageCode, gregorian: boolean | ArabCalendar): string {
		const format = DateLocaleUtils.findFormat(lang, gregorian);
		const parts = format.formatToParts(date);
		const part = parts.find(part => part.type === 'weekday');
		const v = part!.value;
		if (v.startsWith('周')) {
			return v.substring(1);
		} else {
			return v;
		}
	}
}
