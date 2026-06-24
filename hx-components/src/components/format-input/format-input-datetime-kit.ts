import type {HxContext} from '../../contexts';
import type {
	HxDateTimeDefaultValues,
	HxDateTimeFormatDataChar,
	HxDateTimeFormatFixedChar,
	HxParsedDateTimeFormat
} from '../../types';
import {DateUtils, HxConsole, type ParsedDataTime, StringUtils} from '../../utils';
import {HxCommonDefaults} from '../common/defaults';
import {AbstractHxFormatInputPatternKit} from './abstract-format-input-kit';
import {HxFormatInputDefaults} from './defaults';
import type {
	HxFormatInputChange,
	HxFormatInputDateTimeOptions,
	HxFormatInputDateTimeParsedPattern,
	HxFormatInputDispatcherDateTimeProps,
	HxFormatInputDispatcherProps,
	HxFormatInputPatternKit
} from './types';

/**
 * Parser for `HxFormatInputDateTimePattern` strings.
 *
 * Grammar: @d(<[-|/]ymd>|<[:]hns>|<[-|/]ymd><[ ][:]hns>)
 *
 * @example
 * ```ts
 * HxFormatInputDateTimePatternParser.parse('@d/ymd :hns')
 * // => { type: 'datetime', year: 0, month: 1, day: 2,
 * //      dateSeparator: '/', groupSeparator: true, timeSeparator: ':',
 * //      hour: 3, minute: 4, second: 5 }
 *
 * HxFormatInputDateTimePatternParser.parse('@d:hns')
 * // => { type: 'datetime', timeSeparator: ':', hour: 0, minute: 1, second: 2 }
 * ```
 */
export class HxFormatInputDateTimePatternParser {
	private readonly _input: string;

	private constructor(input: string) {
		this._input = input;
	}

	private computeIndexOfPart(index: number, indexes: Array<number>): number {
		if (index < 0) {
			return -1;
		}
		if (index === 0) {
			return 0;
		}
		return indexes.filter(i => i >= 0 && i < index).length;
	}

	private parse(): HxFormatInputDateTimeParsedPattern | false {
		if (this._input == null) {
			return false;
		}
		if (!this._input.startsWith('@d')) {
			return false;
		}

		const input = this._input.substring(2);
		const yearIndex = input.indexOf('y');
		const monthIndex = input.indexOf('m');
		const dayIndex = input.indexOf('d');
		const hourIndex = input.indexOf('h');
		const minuteIndex = input.indexOf('n');
		const secondIndex = input.indexOf('s');
		const groupSeparatorIndex = input.indexOf(' ');
		let dateSeparatorIndex = input.indexOf('/');
		if (dateSeparatorIndex === -1) {
			dateSeparatorIndex = input.indexOf('-');
		}
		const timeSeparatorIndex = input.indexOf(':');

		// - rebuild the canonical pattern string, return false if mismatched
		const pattern = ([
			[dateSeparatorIndex, dateSeparatorIndex !== -1 ? input[dateSeparatorIndex] : ''],
			[yearIndex, yearIndex !== -1 ? 'y' : ''],
			[monthIndex, monthIndex !== -1 ? 'm' : ''],
			[dayIndex, dayIndex !== -1 ? 'd' : ''],
			[groupSeparatorIndex, groupSeparatorIndex !== -1 ? ' ' : ''],
			[timeSeparatorIndex, timeSeparatorIndex !== -1 ? ':' : ''],
			[hourIndex, hourIndex !== -1 ? 'h' : ''],
			[minuteIndex, minuteIndex !== -1 ? 'n' : ''],
			[secondIndex, secondIndex !== -1 ? 's' : '']
		] as Array<[number, string]>).filter(([index]) => index !== -1)
			.sort(([index1], [index2]) => index1 - index2)
			.map(([, ch]) => ch)
			.join('');
		if (pattern !== input) {
			// since each char present once, so the length must be same
			HxConsole.error(`Invalid datetime format pattern[${this._input}].`);
			return false;
		}

		const indexes = [yearIndex, monthIndex, dayIndex, hourIndex, minuteIndex, secondIndex];
		// - create the pattern object and return, note the index should be rebuilt as 0-based sequential.
		const config: Required<HxFormatInputDateTimeParsedPattern> = {
			type: 'datetime',
			year: this.computeIndexOfPart(yearIndex, indexes),
			month: this.computeIndexOfPart(monthIndex, indexes),
			day: this.computeIndexOfPart(dayIndex, indexes),
			hour: this.computeIndexOfPart(hourIndex, indexes),
			minute: this.computeIndexOfPart(minuteIndex, indexes),
			second: this.computeIndexOfPart(secondIndex, indexes),
			groupSeparator: groupSeparatorIndex !== -1,
			dateSeparator: dateSeparatorIndex !== -1 ? input[dateSeparatorIndex] : '',
			timeSeparator: timeSeparatorIndex !== -1 ? ':' : ''
		};

		// grammar check: yd not allowed
		if (config.year >= 0 && config.month < 0 && config.day >= 0) {
			HxConsole.error(`Invalid datetime format pattern[${this._input}], year and day must include month.`);
			return false;
		}
		// grammar check: ymd must be a group
		const ymd = [config.year, config.month, config.day].filter(v => v !== -1);
		if ((ymd.length === 2 && Math.abs(ymd[0] - ymd[1]) !== 1)
			|| (ymd.length === 3 && (Math.max(...ymd) - Math.min(...ymd) > 2))) {
			HxConsole.error(`Invalid datetime format pattern[${this._input}], date parts must be contiguous.`);
			return false;
		}
		// grammar check: date separator only allowed on ymd present
		if (ymd.length <= 1 && config.dateSeparator !== '') {
			HxConsole.error(`Invalid datetime format pattern[${this._input}], date separator must include at least two date parts.`);
			return false;
		}

		// grammar check: hs, s not allowed
		if (config.minute < 0 && config.second >= 0) {
			HxConsole.error(`Invalid datetime format pattern[${this._input}], second must include minute.`);
			return false;
		}
		// grammar check: hns must be a group
		const hns = [config.hour, config.minute, config.second].filter(v => v !== -1);
		if ((hns.length === 2 && Math.abs(hns[0] - hns[1]) !== 1)
			|| (hns.length === 3 && (Math.max(...hns) - Math.min(...hns) > 2))) {
			HxConsole.error(`Invalid datetime format pattern[${this._input}], time parts must be contiguous.`);
			return false;
		}
		// grammar check: time separator only allowed on hns present
		if (hns.length <= 1 && config.timeSeparator !== '') {
			HxConsole.error(`Invalid datetime format pattern[${this._input}], time separator must include at least two time parts.`);
			return false;
		}
		// grammar check: hns follows natural order
		if (config.hour >= 0 && config.minute >= 0 && config.hour > config.minute) {
			HxConsole.error(`Invalid datetime format pattern[${this._input}], hour and minute must follow natural order.`);
			return false;
		}
		if (config.minute >= 0 && config.second >= 0 && config.minute > config.second) {
			HxConsole.error(`Invalid datetime format pattern[${this._input}], minute and second must follow natural order.`);
			return false;
		}
		// grammar check: hour-present cross-validation
		if (config.hour >= 0) {
			// h present, no ymd or at least d present
			if (config.year < 0 && config.month < 0) {
				// no year and month, pass the check
			} else if (config.day < 0) {
				// has one of year or month, and no day
				HxConsole.error(`Invalid datetime format pattern[${this._input}], hour with date must include day.`);
				return false;
			}
		} else if (config.minute >= 0 || config.second >= 0) {
			// h not present, no ymd
			if (config.year >= 0 || config.month >= 0 || config.day >= 0) {
				HxConsole.error(`Invalid datetime format pattern[${this._input}], no date part allowed when time part has no hour.`);
				return false;
			}
		}
		// grammar check: date separator only allowed on ymd present
		if ((ymd.length === 0 || hns.length === 0) && config.groupSeparator) {
			HxConsole.error(`Invalid datetime format pattern[${this._input}], group separator must include both date and time.`);
			return false;
		}

		return config;
	}

	static parse(input: string): HxFormatInputDateTimeParsedPattern | false {
		return new HxFormatInputDateTimePatternParser(input).parse();
	}
}

interface HxFormatInputDateTimeOptionsOfKit {
	readonly valueFormat: HxParsedDateTimeFormat;
	readonly defaultValues: Required<HxDateTimeDefaultValues>;
	readonly charPlaceholderOnEmpty: boolean;
}

export class HxFormatInputDateTimePatternKit extends AbstractHxFormatInputPatternKit {
	private static readonly PLACEHOLDER_CHAR = '_';
	private static readonly YMDHNS = 'ymdhns';
	// @ts-expect-error ignore the type check
	// noinspection JSUnusedLocalSymbols
	private static readonly MDHNS = 'mdhns';
	private static readonly PATTERN_CHAR_TO_PARSED_FIELD_MAPPING: Record<HxDateTimeFormatDataChar, keyof ParsedDataTime> = {
		y: 'year', m: 'month', d: 'day', h: 'hour', n: 'minute', s: 'second'
	};
	private static readonly PATTERN_CHAR_LENGTHS: Record<HxDateTimeFormatDataChar, number> = {
		y: 4, m: 2, d: 2, h: 2, n: 2, s: 2
	};
	private static readonly PATTERN_CHAR_MAX_VALUES: Record<HxDateTimeFormatDataChar, number> = {
		y: 9999, m: 99, d: 99, h: 99, n: 99, s: 99
	};

	private readonly format: Readonly<HxParsedDateTimeFormat>;
	private readonly options: HxFormatInputDateTimeOptionsOfKit;

	private constructor(pattern: HxFormatInputDateTimeParsedPattern, options?: HxFormatInputDateTimeOptions) {
		super();
		this.format = this.transformFormat(pattern);
		this.options = {
			valueFormat: DateUtils.parseFormat(options?.valueFormat || HxFormatInputDefaults.datetimeValueFormat || HxCommonDefaults.datetimeValueFormat),
			defaultValues: this.parseDefaultLackedValues(options?.defaultValues),
			charPlaceholderOnEmpty: options?.charPlaceholderOnEmpty ?? HxFormatInputDefaults.datetimeCharPlaceholderOnEmpty
		};
	}

	/**
	 * Convert a parsed pattern into a display-ready format by
	 * inserting separator characters (date, time, group) between
	 * adjacent data fields in the sequence.
	 */
	private transformFormat(pattern: HxFormatInputDateTimeParsedPattern): HxParsedDateTimeFormat {
		const format: Partial<HxParsedDateTimeFormat> = {
			hasYear: pattern.year !== -1, hasMonth: pattern.month !== -1, hasDay: pattern.day !== -1,
			hasHour: pattern.hour !== -1, hasMinute: pattern.minute !== -1, hasSecond: pattern.second !== -1
		};
		format.hasDate = format.hasYear || format.hasMonth || format.hasDay;
		format.hasTime = format.hasHour || format.hasMinute || format.hasSecond;
		const dateSeparator = format.hasDate ? (pattern.dateSeparator ?? '') : '';
		const timeSeparator = format.hasTime ? (pattern.timeSeparator ?? '') : '';
		const groupSeparator = ((pattern.groupSeparator ?? false) && format.hasDate && format.hasTime) ? ' ' : '';
		let sequence: HxParsedDateTimeFormat['sequence'] = ([
			['y', pattern.year ?? -1],
			['m', pattern.month ?? -1],
			['d', pattern.day ?? -1],
			['h', pattern.hour ?? -1],
			['n', pattern.minute ?? -1],
			['s', pattern.second ?? -1]
		] as Array<[HxDateTimeFormatDataChar, number]>)
			.filter(([, index]) => index !== -1)
			.sort(([, index1], [, index2]) => index1 - index2)
			.map(([ch]) => ch);
		if ((format.hasDate && dateSeparator != '')
			|| (format.hasTime && timeSeparator != '')
			|| (format.hasDate && format.hasTime && groupSeparator != '')) {
			for (let index = 0; index < sequence.length; index++) {
				const ch = sequence[index];
				if ('ymd'.includes(ch)) {
					const nextCh = sequence[index + 1];
					if (nextCh != null) {
						if ('ymd'.includes(nextCh)) {
							sequence.splice(index + 1, 0, dateSeparator);
							index++;
						} else if ('hns'.includes(nextCh)) {
							sequence.splice(index + 1, 0, groupSeparator);
							index++;
						}
					}
				} else if ('hns'.includes(ch)) {
					const nextCh = sequence[index + 1];
					if (nextCh != null) {
						if ('ymd'.includes(nextCh)) {
							sequence.splice(index + 1, 0, groupSeparator);
							index++;
						} else if ('hns'.includes(nextCh)) {
							sequence.splice(index + 1, 0, timeSeparator);
							index++;
						}
					}
				}
			}
			sequence = sequence.filter(ch => ch !== '');
		}
		format.sequence = sequence;
		return format as HxParsedDateTimeFormat;
	}

	/**
	 * Parse default values for missing datetime components.
	 *
	 * Accepts either a tagged string (e.g. `"y2024m06"`) or a plain
	 * object. Values are clamped to non-negative and capped at field
	 * maximums; missing fields default to 0.
	 */
	private parseDefaultLackedValues(values?: HxFormatInputDateTimeOptions['defaultValues']): Required<HxDateTimeDefaultValues> {
		if (values == null) {
			return {year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0};
		}

		let newValues: Required<HxDateTimeDefaultValues>;
		if (typeof values === 'string') {
			newValues = {year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0};

			const collectedChars: Array<string> = [];
			const collected: { part?: HxDateTimeFormatDataChar; digits: Array<string> } = {digits: []};
			const set = () => {
				if (collected.digits.length > 0) {
					if (collected.part != null) {
						collectedChars.push(collected.part, ...collected.digits);
						if (this.isPatternChar(collected.part)) {
							const name = HxFormatInputDateTimePatternKit.PATTERN_CHAR_TO_PARSED_FIELD_MAPPING[collected.part];
							const max = HxFormatInputDateTimePatternKit.PATTERN_CHAR_MAX_VALUES[collected.part];
							newValues[name] = Math.min(max, Math.max(Number(collected.digits.join('')), 0));
						}
					}
				}

				// clear collected
				delete collected.part;
				collected.digits.length = 0;
			};
			for (const ch of values) {
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

			const collectedValues = collectedChars.join('');
			if (collectedValues !== values) {
				HxConsole.warn(`Invalid datetime default values[${values}], compatible collected as [${collectedValues}].`);
			}
		} else {
			newValues = {year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0, ...values};
		}

		Object.keys(newValues).forEach(key => {
			// @ts-expect-error ignore the type check
			if (newValues[key] < 0) {
				// @ts-expect-error ignore the type check
				newValues[key] = 0;
			}
		});

		return newValues;
	}

	/** Type guard: returns true when `ch` is one of the data chars (y/m/d/h/n/s). */
	private isPatternChar(ch: string): ch is HxDateTimeFormatDataChar {
		return HxFormatInputDateTimePatternKit.YMDHNS.includes(ch);
	}

	/** Display width of a format element: 4 for year, 2 for other data fields, 1 for separators. */
	private getFormatCharLength(ch: HxDateTimeFormatDataChar | HxDateTimeFormatFixedChar): number {
		if (this.isPatternChar(ch)) {
			return HxFormatInputDateTimePatternKit.PATTERN_CHAR_LENGTHS[ch];
		}
		return ch.length;
	}

	/** Total display width of the given sequence, or the full format when omitted. */
	private getFormatLength(sequence?: Array<HxDateTimeFormatDataChar | HxDateTimeFormatFixedChar>): number {
		return (sequence ?? this.format.sequence).reduce((len, ch) => len + this.getFormatCharLength(ch), 0);
	}

	/**
	 * Parse a display string (which may contain placeholder underscores) back
	 * into a {@link ParsedDataTime}.
	 *
	 * Validates that the display length matches the format, non-numeric chars
	 * (separators) align with the format, and numeric components are extracted
	 * after stripping underscore placeholders.
	 *
	 * @param value - The display string to parse, e.g. `"2024/06/10"` or `"__/06/10"`
	 * @returns a tuple of `[valid, parsed]` where `valid` is `true` when the
	 *          string matches the format structure, `false` otherwise.
	 */
	private parseFromDisplay(value: string): [boolean, ParsedDataTime] {
		if (value == null || value.trim().length === 0) {
			return [false, {}];
		}

		// the display string is a valid value will follow the rules:
		// - length is same as the format length. e.g. format is y-m-d, length of display string should be 10.
		// - positions of the non-numeric chars match the format.
		// - numeric chars (can contain char placeholder) match the ymdhns parts.
		// otherwise the display string is not valid value.
		if (value.length !== this.getFormatLength()) {
			return [false, {}];
		}

		const parsed: ParsedDataTime = {};
		let indexOfValue = 0;
		for (let partIndex = 0, partCount = this.format.sequence.length; partIndex < partCount; partIndex++) {
			const ch = this.format.sequence[partIndex];
			if (this.isPatternChar(ch)) {
				const name = HxFormatInputDateTimePatternKit.PATTERN_CHAR_TO_PARSED_FIELD_MAPPING[ch];
				const length = HxFormatInputDateTimePatternKit.PATTERN_CHAR_LENGTHS[ch];
				const chars = value.substring(indexOfValue, indexOfValue + length).replaceAll(HxFormatInputDateTimePatternKit.PLACEHOLDER_CHAR, '');
				if (chars.length > 0) {
					if (chars.split('').every(ch => ch >= '0' && ch <= '9')) {
						parsed[name] = chars;
					} else {
						return [false, {}];
					}
				}
				indexOfValue += length;
			} else {
				if (ch !== value[indexOfValue]) {
					// non-numeric char not match the format
					return [false, {}];
				} else {
					indexOfValue += 1;
				}
			}
		}

		return [true, parsed];
	}

	/**
	 * format given value to display string.
	 * - use underscore as char placeholder when part is empty,
	 * - pad with zeros when part has content.
	 */
	private formatToDisplay(value: ParsedDataTime | null | undefined): string {
		return this.format.sequence.map(ch => {
			if (this.isPatternChar(ch)) {
				const name = HxFormatInputDateTimePatternKit.PATTERN_CHAR_TO_PARSED_FIELD_MAPPING[ch];
				const length = HxFormatInputDateTimePatternKit.PATTERN_CHAR_LENGTHS[ch];
				const s = value?.[name] ?? '';
				if (s.length === 0) {
					return s.padStart(length, HxFormatInputDateTimePatternKit.PLACEHOLDER_CHAR);
				} else {
					return s.padStart(length, '0');
				}
			} else {
				return ch;
			}
		}).join('');
	}

	/**
	 * Whether the display value conforms to the datetime format.
	 * - underscore (`_`) is allowed as a placeholder in numeric positions,
	 * - numeric positions (y/m/d/h/n/s) must be digits or underscores,
	 * - separator positions must match the format character exactly.
	 */
	private followFormat(value: string): boolean {
		let charIndex = 0;
		for (const ch of this.format.sequence) {
			if (this.isPatternChar(ch)) {
				const len = HxFormatInputDateTimePatternKit.PATTERN_CHAR_LENGTHS[ch];
				const s = value.substring(charIndex, charIndex + len);
				if (s.length < len) {
					return false;
				}
				for (const c of s) {
					if (c !== HxFormatInputDateTimePatternKit.PLACEHOLDER_CHAR && (c < '0' || c > '9')) {
						return false;
					}
				}
				charIndex += len;
			} else {
				if (value[charIndex] != ch) {
					return false;
				}
				charIndex += 1;
			}
		}

		return true;
	}

	/**
	 * Handle delete / backspace by reconstructing the display so it
	 * always conforms to the format.
	 *
	 * **Valid old value:** fill the deleted span with placeholder chars,
	 * then restore separators at their fixed positions.
	 *
	 * **Invalid old value:** walk the remaining text (prefix + suffix)
	 * against the format sequence left-to-right, collecting legal chars
	 * (digits and placeholders) per data field and matching separators.
	 * If the text conforms after cleanup, pad missing fields with
	 * placeholders and supply missing separators; otherwise return the
	 * remaining text as-is.
	 *
	 * Caret position is determined by matching original prefix/suffix
	 * chars against the reconstructed text, skipping over characters
	 * inserted during reconstruction (placeholders and separators).
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected correctDelete(change: HxFormatInputChange, _context: HxContext): [string, number] {
		const {prefix, suffix} = change;
		// old value already follows format, fill deleted span with placeholder chars
		if (this.followFormat(change.oldValue)) {
			// fill the deleted span with placeholder chars, then restore separators
			const totalLength = this.getFormatLength();
			const redeemLength = totalLength - prefix.length - suffix.length;
			const redeemChars: Array<string> = new Array(redeemLength).fill(HxFormatInputDateTimePatternKit.PLACEHOLDER_CHAR);
			const chars = [...prefix.split(''), ...redeemChars, ...suffix.split('')];
			let charIndex = 0;
			for (const ch of this.format.sequence) {
				if (this.isPatternChar(ch)) {
					charIndex += HxFormatInputDateTimePatternKit.PATTERN_CHAR_LENGTHS[ch];
				} else {
					chars[charIndex] = ch;
					charIndex += 1;
				}
			}
			return [chars.join(''), change.isBackspace ? prefix.length : (totalLength - suffix.length)];
		}
		// old value is invalid, try to extract legal content from remaining text
		else {
			// walk format sequence left-to-right, collecting legal chars (digits and placeholder) from remaining text
			let charIndex = 0;
			const chars: Array<string> = [];
			const remainText = prefix + suffix;
			for (let partIndex = 0, partCount = this.format.sequence.length; partIndex < partCount; partIndex++) {
				const ch = this.format.sequence[partIndex];
				const length = this.getFormatCharLength(ch);
				const text = remainText.substring(charIndex, charIndex + length);
				if (text === '') {
					// no chars remain
					break;
				}
				if (this.isPatternChar(ch)) {
					// only numeric or placeholder char allowed
					const legalChars: Array<string> = [];
					for (const c of text) {
						if (c === HxFormatInputDateTimePatternKit.PLACEHOLDER_CHAR || (c >= '0' && c <= '9')) {
							legalChars.push(c);
						}
					}
					if (legalChars.length === 0) {
						// no legal char found, does not follow the format; leave them as is
						return [remainText, prefix.length];
					} else {
						const legalCharsCount = legalChars.length;
						charIndex += legalCharsCount;
						if ((charIndex - legalCharsCount) < prefix.length && charIndex >= prefix.length) {
							// the legal chars are collected from both prefix and suffix
							// need to split legal chars to two parts
							const countOfPrefix = legalCharsCount - (charIndex - prefix.length);
							chars.push(...legalChars.slice(0, countOfPrefix));
							if (legalCharsCount < length) {
								chars.push(...new Array(length - legalCharsCount).fill(HxFormatInputDateTimePatternKit.PLACEHOLDER_CHAR));
							}
							chars.push(...legalChars.slice(countOfPrefix));
						} else {
							// the legal chars are collected from one of prefix or suffix only
							if (legalCharsCount < length) {
								chars.push(...new Array(length - legalCharsCount).fill(HxFormatInputDateTimePatternKit.PLACEHOLDER_CHAR));
							}
							chars.push(...legalChars);
						}
					}
				} else if (text != ch) {
					// separator char not matched
					if (text >= '0' && text <= '9') {
						// current char is numeric, assume it's ok, then supply this separator
						// and keep the char index
						chars.push(ch);
					} else {
						// and current char is non-numeric, does not follow the format; leave them as is
						return [remainText, prefix.length];
					}
				} else {
					chars.push(ch);
					charIndex += 1;
				}
			}
			if (remainText.substring(charIndex) !== '') {
				// there are more chars after format matching check, does not follow the format; leave them as is
				return [remainText, prefix.length];
			}
			// follows format, supply the trailing chars to make them follow the format
			// supplied chars could be placeholder char or separator char
			let consumedFormatLength = 0;
			for (const ch of this.format.sequence) {
				const length = this.getFormatCharLength(ch);
				consumedFormatLength += length;
				if (chars.length < consumedFormatLength) {
					if (this.isPatternChar(ch)) {
						chars.push(...new Array(length).fill(HxFormatInputDateTimePatternKit.PLACEHOLDER_CHAR));
					} else {
						chars.push(ch);
					}
				}
			}
			// compute caret by matching original prefix/suffix chars against reconstructed text,
			// skipping over inserted placeholders and separators
			const text = chars.join('');
			let caretIndex: number;
			// by backspace key
			if (change.isBackspace) {
				if (prefix.length === 0) {
					caretIndex = 0;
				} else {
					// init it, basically it's unnecessary based on the text and prefix content
					caretIndex = prefix.length;
					let prefixCharIndex = 0;
					let charInPrefix = prefix[prefixCharIndex];
					for (let textIndex = 0, textCount = text.length; textIndex < textCount; textIndex++) {
						const ch = text[textIndex];
						if (ch === charInPrefix) {
							prefixCharIndex += 1;
							if (prefixCharIndex === prefix.length) {
								// caret position at next char
								caretIndex = Math.min(text.length, textIndex + 1);
								break;
							}
							charInPrefix = prefix[prefixCharIndex];
							// matched, do nothing
						} else if (ch === HxFormatInputDateTimePatternKit.PLACEHOLDER_CHAR) {
							// not matched, is placeholder char, check next
						} else if (ch < '0' || ch > '9') {
							// not matched, is separator char, check next
						} else {
							// guard logic, since prefix chars must be contained by final text
							caretIndex = Math.max(prefix.length, textIndex);
							break;
						}
					}
				}
			}
			// by delete key
			else {
				if (suffix.length === 0) {
					caretIndex = text.length - 1;
				} else {
					let suffixCharIndex = suffix.length - 1;
					let charInSuffix = suffix[suffixCharIndex];
					caretIndex = text.length - suffix.length;
					for (let textIndex = text.length - 1; textIndex >= 0; textIndex--) {
						const ch = text[textIndex];
						if (ch === charInSuffix) {
							suffixCharIndex -= 1;
							if (suffixCharIndex === -1) {
								// caret position at prefix char
								caretIndex = Math.max(0, textIndex - 1);
								break;
							}
							charInSuffix = suffix[suffixCharIndex];
							// matched, do nothing
						} else if (ch === HxFormatInputDateTimePatternKit.PLACEHOLDER_CHAR) {
							// not matched, is placeholder char, check next
						} else if (ch < '0' || ch > '9') {
							// not matched, is separator char, check next
						} else {
							// guard logic, since suffix chars must be contained by final text
							caretIndex = Math.min(text.length - suffix.length, textIndex);
							break;
						}
					}
				}
			}
			return [text, caretIndex];
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected correctInsert(change: HxFormatInputChange, _context: HxContext): [string, number] {
		// TODO
		return [change.newValue, -1];
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected correctReplacePart(change: HxFormatInputChange, _context: HxContext): [string, number] {
		// TODO
		return [change.newValue, -1];
	}

	/**
	 * Full replacement: parse the inserted text against the display format
	 * with partial matching, then format the result back to display.
	 *
	 * Rejection (returns old value unchanged):
	 * - trimmed inserted text is blank
	 * - the text cannot be parsed at all (no valid date chars or structure)
	 *
	 * Semantic validation (e.g. month > 12) is deliberately skipped here
	 * and deferred to blur/submit validation.
	 *
	 * Caret is positioned at the start of the first format data field
	 * that has no parsed value, so the user can continue typing the
	 * next expected component.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected correctReplaceAll(change: HxFormatInputChange, _context: HxContext): [string, number] {
		const {inserted} = change;
		const trimmed = inserted.trim();
		if (trimmed.length === 0) {
			return [change.oldValue, -1];
		}

		const parsed = DateUtils.parseValue(trimmed, this.format, true);
		if (parsed === false) {
			return [change.oldValue, -1];
		}

		const display = this.formatToDisplay(parsed);

		// Walk format sequence backwards to find the rightmost parsed field
		// and collect the trailing unparsed portion (including separators).
		// This handles out-of-order parsing: e.g. "2024//10" skips month
		// but parses day, so the caret must land after day, not after year.
		const sequence: Array<HxDateTimeFormatDataChar | HxDateTimeFormatFixedChar> = [];
		for (let index = this.format.sequence.length - 1; index >= 0; index--) {
			const ch = this.format.sequence[index];
			if (this.isPatternChar(ch)) {
				const digits = parsed[HxFormatInputDateTimePatternKit.PATTERN_CHAR_TO_PARSED_FIELD_MAPPING[ch]];
				if (digits == null || digits.length === 0) {
					sequence.unshift(ch);
				} else {
					break;
				}
			} else {
				sequence.unshift(ch);
			}
		}
		// Strip separators that precede the first unparsed data field
		// so the caret lands right before the placeholder, not before a separator.
		while (sequence.length !== 0 && !this.isPatternChar(sequence[0])) {
			sequence.shift();
		}
		// Drop the trailing unparsed portion from the format; the remainder
		// is the parsed prefix whose display length gives the caret position.
		const sequenceWithContent = this.format.sequence.slice(0, this.format.sequence.length - sequence.length);
		return [display, this.getFormatLength(sequenceWithContent)];
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
	toModel(value: string | null | undefined, _context: HxContext): any | null | undefined {
		if (value == null || value === '') {
			return (void 0);
		}

		const [valid, parsedValue] = this.parseFromDisplay(value);
		if (valid) {
			return DateUtils.formatValue(parsedValue, this.options.valueFormat, this.options.defaultValues);
		} else {
			return value;
		}
	}

	/**
	 * read given model value to display string
	 * - value is null or blank,
	 *   - returns undefined when not using placeholder,
	 *   - returns formatted string when using placeholder,
	 * - value is number, convert to string, apply string logic,
	 * - value is string,
	 *   - blank,
	 *     - returns undefined when not using placeholder,
	 *     - returns formatted string when using placeholder,
	 *   - not blank, try to parse value to datetime,
	 *     - parse failed, apply not datetime value logic,
	 *     - parse successfully,
	 * - others or cannot parse to datetime, as str and return directly.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
	fromModel(value: any | null | undefined, _context: HxContext): string | null | undefined {
		if (value == null) {
			return this.options.charPlaceholderOnEmpty ? this.formatToDisplay((void 0)) : (void 0);
		}

		if (typeof value === 'number') {
			value = String(value);
		}
		if (typeof value === 'string') {
			if (StringUtils.isBlank(value)) {
				return this.options.charPlaceholderOnEmpty ? this.formatToDisplay((void 0)) : (void 0);
			}
			const parsed = DateUtils.parseValue(value, this.options.valueFormat, true);
			if (parsed === false) {
				return value;
			} else {
				return this.formatToDisplay(parsed);
			}
		} else {
			// Other types → stringify and return.
			return StringUtils.asStr(value);
		}
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * called at {@link HxFormatInputPatternKitsInner.build}
	 */
	static build<T extends object>(props: HxFormatInputDispatcherProps<T>): HxFormatInputPatternKit | false {
		const {pattern, options} = props as HxFormatInputDispatcherDateTimeProps;

		if (typeof pattern === 'string') {
			const parsed = HxFormatInputDateTimePatternParser.parse(pattern);
			if (parsed === false) {
				return false;
			} else {
				return new HxFormatInputDateTimePatternKit(parsed, options);
			}
		} else if (pattern.type === 'datetime') {
			return new HxFormatInputDateTimePatternKit(pattern, options);
		} else {
			return false;
		}
	}
}
