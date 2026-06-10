import type {HxContext} from '../../contexts';
import type {HxDateTimeRelatedFormat} from '../../types';
import {HxConsole, StringUtils} from '../../utils';
import {HxCommonDefaults} from '../common/defaults';
import {HxFormatInputDefaults} from './defaults';
import type {
	HxDateTimeDefaultValues,
	HxFormatInputDateTimeOptions,
	HxFormatInputDateTimeParsedPattern,
	HxFormatInputDateTimeUsePlaceholder,
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
		const pattern = [
			dateSeparatorIndex !== -1 ? input[dateSeparatorIndex] : '',
			yearIndex !== -1 ? 'y' : '',
			monthIndex !== -1 ? 'm' : '',
			dayIndex !== -1 ? 'd' : '',
			groupSeparatorIndex !== -1 ? ' ' : '',
			timeSeparatorIndex !== -1 ? ':' : '',
			hourIndex !== -1 ? 'h' : '',
			minuteIndex !== -1 ? 'n' : '',
			secondIndex !== -1 ? 's' : ''
		].join('');
		if (pattern !== input) {
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

interface HxFormatInputDateTimeParsedPatternIndicators {
	hasYear: boolean;
	hasMonth: boolean;
	hasDay: boolean;
	hasDate: boolean;
	hasHour: boolean;
	hasMinute: boolean;
	hasSecond: boolean;
	hasTime: boolean;
	hasGroupSeparator: boolean;
	hasDateSeparator: boolean;
	hasTimeSeparator: boolean;
	sequence: Array<'y' | 'm' | 'd' | 'h' | 'n' | 's'>;
}

interface HxFormatInputDateTimeOptionsOfKit {
	readonly valueFormat: HxDateTimeRelatedFormat;
	readonly defaultValues: Required<HxDateTimeDefaultValues>;
	/**
	 * 1: force enable,
	 * 0: follow default behavior (enable only when at least one separator defined),
	 * -1: force disable
	 */
	readonly placeholder: HxFormatInputDateTimeUsePlaceholder;
}

export class HxFormatInputDateTimePatternKit implements HxFormatInputPatternKit {
	private readonly indicators: Readonly<HxFormatInputDateTimeParsedPatternIndicators>;
	private readonly options: HxFormatInputDateTimeOptionsOfKit;

	private constructor(pattern: HxFormatInputDateTimeParsedPattern, options?: HxFormatInputDateTimeOptions) {
		const indicator: Partial<HxFormatInputDateTimeParsedPatternIndicators> = {
			hasYear: pattern.year !== -1, hasMonth: pattern.month !== -1, hasDay: pattern.day !== -1,
			// hasDate: false,
			hasHour: pattern.hour !== -1, hasMinute: pattern.minute !== -1, hasSecond: pattern.second !== -1,
			// hasTime: false,
			hasGroupSeparator: false, hasDateSeparator: false, hasTimeSeparator: false
		};
		indicator.hasDate = indicator.hasYear || indicator.hasMonth || indicator.hasDay;
		indicator.hasDateSeparator = indicator.hasDate && (pattern.dateSeparator ?? '').length !== 0;
		indicator.hasTime = indicator.hasHour || indicator.hasMinute || indicator.hasSecond;
		indicator.hasTimeSeparator = indicator.hasTime && (pattern.timeSeparator ?? '').length !== 0;
		indicator.hasGroupSeparator = pattern.groupSeparator && indicator.hasDate && indicator.hasTime;
		indicator.sequence = ([
			['y', pattern.year ?? -1],
			['m', pattern.month ?? -1],
			['d', pattern.day ?? -1],
			['h', pattern.hour ?? -1],
			['n', pattern.minute ?? -1],
			['s', pattern.second ?? -1]
		] as Array<['y' | 'm' | 'd' | 'h' | 'n' | 's', number]>)
			.filter(([, index]) => index !== -1)
			.sort(([, index1], [, index2]) => index1 - index2)
			.map(([ch]) => ch);
		this.indicators = indicator as HxFormatInputDateTimeParsedPatternIndicators;

		this.options = {
			valueFormat: options?.valueFormat || HxFormatInputDefaults.datetimeValueFormat || HxCommonDefaults.datetimeValueFormat,
			defaultValues: this.parseDefaultLackedValues(options?.defaultValues),
			placeholder: options?.placeholder ?? HxFormatInputDefaults.datetimeUsePlaceholder
		};
	}

	private parseDefaultLackedValues(values?: HxFormatInputDateTimeOptions['defaultValues']): Required<HxDateTimeDefaultValues> {
		if (values == null) {
			return {year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0};
		}

		let newValues: Required<HxDateTimeDefaultValues>;
		if (typeof values === 'string') {
			newValues = {year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0};

			const collectedChars: Array<string> = [];
			const collected: { part?: 'y' | 'm' | 'd' | 'h' | 'n' | 's'; digits: Array<string> } = {digits: []};
			const set = () => {
				if (collected.digits.length > 0) {
					if (collected.part != null) {
						collectedChars.push(collected.part, ...collected.digits);
					}
					switch (collected.part) {
						case 'y': {
							newValues.year = Math.min(9999, Math.max(Number(collected.digits.join('')), 0));
							break;
						}
						case 'm': {
							newValues.month = Math.min(99, Math.max(Number(collected.digits.join('')), 0));
							break;
						}
						case 'd': {
							newValues.day = Math.min(99, Math.max(Number(collected.digits.join('')), 0));
							break;
						}
						case 'h': {
							newValues.hour = Math.min(99, Math.max(Number(collected.digits.join('')), 0));
							break;
						}
						case 'n': {
							newValues.minute = Math.min(99, Math.max(Number(collected.digits.join('')), 0));
							break;
						}
						case 's': {
							newValues.second = Math.min(99, Math.max(Number(collected.digits.join('')), 0));
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
					case 'y': {
						set();
						collected.part = 'y';
						break;
					}
					case 'M':
					case 'm': {
						set();
						collected.part = 'm';
						break;
					}
					case 'D':
					case 'd': {
						set();
						collected.part = 'd';
						break;
					}
					case 'H':
					case 'h': {
						set();
						collected.part = 'h';
						break;
					}
					case 'N':
					case 'n': {
						set();
						collected.part = 'n';
						break;
					}
					case 'S':
					case 's': {
						set();
						collected.part = 's';
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

	private usePlaceholder(): boolean {
		switch (this.options.placeholder) {
			case 'auto': {
				// use when separator defined
				return this.indicators.hasDateSeparator || this.indicators.hasTimeSeparator || this.indicators.hasGroupSeparator;
			}
			case 'no': {
				// force unuse
				return false;
			}
			case 'yes':
			default: {
				// force use
				return true;
			}
		}
	}

	private withPlaceholder(): string {
		// TODO
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	correct(_oldValue: string, _newValue: string, _isBackspace: boolean, _context: HxContext): [string, number] {
		throw new Error('Method not implemented.');
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	toModel(_value: string | null | undefined, _context: HxContext) {
		throw new Error('Method not implemented.');
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
	fromModel(value: any | null | undefined, _context: HxContext): string | null | undefined {
		if (value == null) {
			return this.usePlaceholder() ? (void 0) : this.withPlaceholder();
		}

		if (typeof value === 'string') {
			if (StringUtils.isBlank(value)) {
				return this.usePlaceholder() ? (void 0) : this.withPlaceholder();
			}
			// TODO parse value to
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
