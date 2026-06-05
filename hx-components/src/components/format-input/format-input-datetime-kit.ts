import type {HxContext} from '../../contexts';
import type {HxFormatInputDateTimeParsedPattern, HxFormatInputParsedPattern, HxFormatInputPatternKit} from './types';
import {buildKit} from './utils';

/**
 * State-machine parser for `HxFormatInputDateTimePattern` strings.
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

	private readonly _config: HxFormatInputDateTimeParsedPattern = {
		type: 'datetime',
		year: -1,
		month: -1,
		day: -1,
		hour: -1,
		minute: -1,
		second: -1,
		groupSeparator: false,
		dateSeparator: '',
		timeSeparator: ''
	};

	private constructor(input: string) {
		this._input = input;
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

		const [
			hasYear, hasMonth, hasDay, hasHour, hasMinute, hasSecond
		] = [
			yearIndex !== -1, monthIndex !== -1, dayIndex !== -1,
			hourIndex !== -1, minuteIndex !== -1, secondIndex !== -1
		];
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
