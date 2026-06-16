import type {HxContext} from '../../contexts';
import type {HxDateTimeDefaultValues, HxDateTimeFormatDataChar, HxParsedDateTimeFormat} from '../../types';
import {DateUtils, HxConsole, type ParsedDataTime, StringUtils} from '../../utils';
import {HxCommonDefaults} from '../common/defaults';
import {AbstractHxFormatInputPatternKit} from './abstract-format-input-kit.ts';
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
 * //      dateSeparator: '/', groupSeparator: ' ', timeSeparator: ':',
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

	private parseDefaultLackedValues(values?: HxFormatInputDateTimeOptions['defaultValues']): Required<HxDateTimeDefaultValues> {
		if (values == null) {
			return {year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0};
		}

		let newValues: Required<HxDateTimeDefaultValues>;
		if (typeof values === 'string') {
			newValues = {year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0};

			const collectedChars: Array<string> = [];
			const collected: { part?: HxDateTimeFormatDataChar; digits: Array<string> } = {digits: []};
			const mapping: Record<HxDateTimeFormatDataChar, [keyof ParsedDataTime, number]> = {
				y: ['year', 9999], m: ['month', 99], d: ['day', 99],
				h: ['hour', 99], n: ['minute', 99], s: ['second', 99]
			};
			const set = () => {
				if (collected.digits.length > 0) {
					if (collected.part != null) {
						collectedChars.push(collected.part, ...collected.digits);
					}
					switch (collected.part) {
						case 'y':
						case 'm':
						case 'd':
						case 'h':
						case 'n':
						case 's': {
							const [name, max] = mapping[collected.part];
							newValues[name] = Math.min(max, Math.max(Number(collected.digits.join('')), 0));
							break;
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

	private getFormatLength(): number {
		return this.format.sequence.reduce((len, ch) => {
			if (ch === 'y') {
				return len + 4;
			}
			// noinspection SpellCheckingInspection
			if ('mdhns'.includes(ch)) {
				return len + 2;
			} else {
				return len + 1;
			}
		}, 0);
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

		const mapping: Record<HxDateTimeFormatDataChar, [keyof ParsedDataTime, number]> = {
			y: ['year', 4], m: ['month', 2], d: ['day', 2],
			h: ['hour', 2], n: ['minute', 2], s: ['second', 2]
		};
		const parsed: ParsedDataTime = {};
		let indexOfValue = 0;
		for (let partIndex = 0, partCount = this.format.sequence.length; partIndex < partCount; partIndex++) {
			const ch = this.format.sequence[partIndex];
			switch (ch) {
				case 'y':
				case 'm':
				case 'd':
				case 'h':
				case 'n':
				case 's': {
					const [name, length] = mapping[ch];
					const chars = value.substring(indexOfValue, indexOfValue + length).replaceAll('_', '');
					if (chars.length > 0) {
						if (chars.split('').every(ch => ch >= '0' && ch <= '9')) {
							parsed[name] = chars;
						} else {
							return [false, {}];
						}
					}
					indexOfValue += length;
					break;
				}
				default: {
					if (ch !== value[indexOfValue]) {
						// non-numeric char not match the format
						return [false, {}];
					} else {
						indexOfValue += 1;
					}
					break;
				}
			}
		}

		return [true, parsed];
	}

	/**
	 * format given value to display string.
	 * - use underscore as char placeholder when part is empty,
	 * - use zero-padding-start as char placeholder when part has content.
	 */
	private formatToDisplay(value: ParsedDataTime | null | undefined): string {
		const mapping: Record<HxDateTimeFormatDataChar, [keyof ParsedDataTime, number]> = {
			y: ['year', 4], m: ['month', 2], d: ['day', 2],
			h: ['hour', 2], n: ['minute', 2], s: ['second', 2]
		};
		return this.format.sequence.map(ch => {
			switch (ch) {
				case 'y':
				case 'm':
				case 'd':
				case 'h':
				case 'n':
				case 's': {
					const [name, length] = mapping[ch];
					const s = value?.[name] ?? '';
					if (s.length === 0) {
						return s.padStart(length, '_');
					} else {
						return s.padStart(length, '0');
					}
				}
				default: {
					return ch;
				}
			}
		}).join('');
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected correctDelete(change: HxFormatInputChange, _context: HxContext): [string, number] {
		// TODO
		return [change.newValue, -1];
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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected correctReplaceAll(change: HxFormatInputChange, _context: HxContext): [string, number] {
		// TODO
		return [change.newValue, -1];
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
