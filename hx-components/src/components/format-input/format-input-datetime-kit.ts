import type {HxContext} from '../../contexts';
import type {HxFormatInputDateTimeParsedPattern, HxFormatInputParsedPattern, HxFormatInputPatternKit} from './types';
import {buildKit} from './utils';

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
			console.error(`Invalid datetime format pattern[${this._input}].`);
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
			console.error(`Invalid datetime format pattern[${this._input}], year and day must include month.`);
			return false;
		}
		// grammar check: ymd must be a group
		const ymd = [config.year, config.month, config.day].filter(v => v !== -1);
		if ((ymd.length === 2 && Math.abs(ymd[0] - ymd[1]) !== 1)
			|| (ymd.length === 3 && (Math.max(...ymd) - Math.min(...ymd) > 2))) {
			console.error(`Invalid datetime format pattern[${this._input}], date parts must be contiguous.`);
			return false;
		}

		// grammar check: hs, s not allowed
		if (config.minute < 0 && config.second >= 0) {
			console.error(`Invalid datetime format pattern[${this._input}], second must include minute.`);
			return false;
		}
		// grammar check: hns must be a group
		const hns = [config.hour, config.minute, config.second].filter(v => v !== -1);
		if ((hns.length === 2 && Math.abs(hns[0] - hns[1]) !== 1)
			|| (hns.length === 3 && (Math.max(...hns) - Math.min(...hns) > 2))) {
			console.error(`Invalid datetime format pattern[${this._input}], time parts must be contiguous.`);
			return false;
		}
		// grammar check: hns follows natural order
		if (config.hour >= 0 && config.minute >= 0 && config.hour > config.minute) {
			console.error(`Invalid datetime format pattern[${this._input}], hour and minute must follow natural order.`);
			return false;
		}
		if (config.minute >= 0 && config.second >= 0 && config.minute > config.second) {
			console.error(`Invalid datetime format pattern[${this._input}], minute and second must follow natural order.`);
			return false;
		}
		// grammar check: hour-present cross-validation
		if (config.hour >= 0) {
			// h present, no ymd or at least d present
			if (config.year < 0 && config.month < 0) {
				// no year and month, pass the check
			} else if (config.day < 0) {
				// has one of year or month, and no day
				console.error(`Invalid datetime format pattern[${this._input}], hour with date must include day.`);
				return false;
			}
		} else if (config.minute >= 0 || config.second >= 0) {
			// h not present, no ymd
			if (config.year >= 0 || config.month >= 0 || config.day >= 0) {
				console.error(`Invalid datetime format pattern[${this._input}], no date part allowed when time part has no hour.`);
				return false;
			}
		}

		return config;
	}

	static parse(input: string): HxFormatInputDateTimeParsedPattern | false {
		return new HxFormatInputDateTimePatternParser(input).parse();
	}
}

export class HxFormatInputDateTimePatternKit implements HxFormatInputPatternKit {
	private readonly _pattern: HxFormatInputDateTimeParsedPattern;

	private constructor(pattern: HxFormatInputDateTimeParsedPattern) {
		this._pattern = pattern;
	}

	getPattern(): HxFormatInputParsedPattern {
		return this._pattern;
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
	fromModel(_value: any | null | undefined, _context: HxContext): string | null | undefined {
		throw new Error('Method not implemented.');
	}

	static readonly build = buildKit<HxFormatInputDateTimePatternKit, HxFormatInputDateTimeParsedPattern>({
		parse: (pattern: string) => HxFormatInputDateTimePatternParser.parse(pattern),
		is: (pattern): pattern is HxFormatInputDateTimeParsedPattern => pattern.type === 'datetime',
		create: (parsed) => new HxFormatInputDateTimePatternKit(parsed)
	});
}
