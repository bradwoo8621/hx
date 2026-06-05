import type {HxContext} from '../../contexts';
import type {HxFormatInputDateTimeParsedPattern, HxFormatInputParsedPattern, HxFormatInputPatternKit} from './types';
import {buildKit} from './utils';

type ParseStateFail = -1;
type ParseStateContinue = 0;
type ParseStateFinish = 1;

type DateTimePartParser = {
	parse: (input: string, pos: number, _config: HxFormatInputDateTimeParsedPattern) =>
		| [string, ParseStateContinue, DateTimePartParser]
		| [string, ParseStateFinish, undefined]
		| [string, ParseStateFail, undefined];
};

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
	private static readonly FailParse: ParseStateFail = -1;
	private static readonly ContinueParse: ParseStateContinue = 0;
	private static readonly FinishParse: ParseStateFinish = 1;

	private readonly _input: string;
	private _pos: number = 0;

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

	/** Expecting `@` at the first position. */
	private static readonly STATE_START: DateTimePartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: HxFormatInputDateTimeParsedPattern) => {
			const ch = input[pos];
			return ch === '@'
				? ['@', HxFormatInputDateTimePatternParser.ContinueParse, HxFormatInputDateTimePatternParser.STATE_AFTER_AT]
				: [ch, HxFormatInputDateTimePatternParser.FailParse, (void 0)];
		}
	};

	/** Expecting `d` after `@`. */
	private static readonly STATE_AFTER_AT: DateTimePartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: HxFormatInputDateTimeParsedPattern) => {
			const ch = input[pos];
			return ch === 'd'
				? ['d', HxFormatInputDateTimePatternParser.ContinueParse, HxFormatInputDateTimePatternParser.STATE_AFTER_D]
				: [ch, HxFormatInputDateTimePatternParser.FailParse, (void 0)];
		}
	};

	/** After `@d` — determine date, time or date+time mode. */
	private static readonly STATE_AFTER_D: DateTimePartParser = {
		parse: (input: string, pos: number, _config: HxFormatInputDateTimeParsedPattern) => {
			const ch = input[pos];
			switch (ch) {
				case (void 0): {
					return ['', HxFormatInputDateTimePatternParser.FailParse, (void 0)];
				}
				case '-':
				case '/': {
					_config.dateSeparator = ch;
					return [ch, HxFormatInputDateTimePatternParser.ContinueParse, HxFormatInputDateTimePatternParser.STATE_DATE];
				}
				case 'y':
				case 'm':
				case 'd': {
					return HxFormatInputDateTimePatternParser._recordDateChar(_config, ch);
				}
				case ':': {
					_config.timeSeparator = ch;
					return [ch, HxFormatInputDateTimePatternParser.ContinueParse, HxFormatInputDateTimePatternParser.STATE_TIME];
				}
				case 'h':
				case 'n':
				case 's': {
					return HxFormatInputDateTimePatternParser._recordTimeChar(_config, ch);
				}
				default: {
					return [ch, HxFormatInputDateTimePatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** Parsing date components (y, m, d) in any order. Separators `-`/`/` between components are consumed. */
	private static readonly STATE_DATE: DateTimePartParser = {
		parse: (input: string, pos: number, _config: HxFormatInputDateTimeParsedPattern) => {
			const ch = input[pos];
			switch (ch) {
				case (void 0): {
					return HxFormatInputDateTimePatternParser._finish(_config);
				}
				case 'y':
				case 'm':
				case 'd': {
					return HxFormatInputDateTimePatternParser._recordDateChar(_config, ch);
				}
				case '-':
				case '/': {
					const sep = _config.dateSeparator;
					if (sep !== (void 0) && sep !== ch) {
						return [ch, HxFormatInputDateTimePatternParser.FailParse, (void 0)];
					}
					if (sep === (void 0)) {
						_config.dateSeparator = ch;
					}
					return [ch, HxFormatInputDateTimePatternParser.ContinueParse, HxFormatInputDateTimePatternParser.STATE_DATE];
				}
				case ' ': {
					_config.groupSeparator = ch;
					return [ch, HxFormatInputDateTimePatternParser.ContinueParse, HxFormatInputDateTimePatternParser.STATE_AFTER_SPACE];
				}
				case ':': {
					_config.timeSeparator = ch;
					return [ch, HxFormatInputDateTimePatternParser.ContinueParse, HxFormatInputDateTimePatternParser.STATE_TIME];
				}
				case 'h':
				case 'n':
				case 's': {
					return HxFormatInputDateTimePatternParser._recordTimeChar(_config, ch);
				}
				default: {
					return [ch, HxFormatInputDateTimePatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** After space between date and time — expect `:` or time component. */
	private static readonly STATE_AFTER_SPACE: DateTimePartParser = {
		parse: (input: string, pos: number, _config: HxFormatInputDateTimeParsedPattern) => {
			const ch = input[pos];
			switch (ch) {
				case (void 0): {
					return ['', HxFormatInputDateTimePatternParser.FailParse, (void 0)];
				}
				case ':': {
					_config.timeSeparator = ch;
					return [ch, HxFormatInputDateTimePatternParser.ContinueParse, HxFormatInputDateTimePatternParser.STATE_TIME];
				}
				case 'h':
				case 'n':
				case 's': {
					return HxFormatInputDateTimePatternParser._recordTimeChar(_config, ch);
				}
				default: {
					return [ch, HxFormatInputDateTimePatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** Parsing time components (h, n, s) in strict sequence. `:` between components is consumed. */
	private static readonly STATE_TIME: DateTimePartParser = {
		parse: (input: string, pos: number, _config: HxFormatInputDateTimeParsedPattern) => {
			const ch = input[pos];
			switch (ch) {
				case (void 0): {
					return HxFormatInputDateTimePatternParser._finish(_config);
				}
				case 'h':
				case 'n':
				case 's': {
					return HxFormatInputDateTimePatternParser._recordTimeChar(_config, ch);
				}
				case ':': {
					const sep = _config.timeSeparator;
					if (sep !== (void 0) && sep !== ch) {
						return [ch, HxFormatInputDateTimePatternParser.FailParse, (void 0)];
					}
					if (sep === (void 0)) {
						_config.timeSeparator = ch;
					}
					return [ch, HxFormatInputDateTimePatternParser.ContinueParse, HxFormatInputDateTimePatternParser.STATE_TIME];
				}
				default: {
					return [ch, HxFormatInputDateTimePatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	private static _recordDateChar(_config: HxFormatInputDateTimeParsedPattern, ch: string):
		| [string, ParseStateContinue, DateTimePartParser]
		| [string, ParseStateFail, undefined] {
		if (_config._dateChars.includes(ch)) {
			return [ch, HxFormatInputDateTimePatternParser.FailParse, (void 0)];
		}
		_config._dateChars += ch;
		switch (ch) {
			case 'y': {
				_config.year = _config._order++;
				break;
			}
			case 'm': {
				_config.month = _config._order++;
				break;
			}
			case 'd': {
				_config.day = _config._order++;
				break;
			}
		}
		return [ch, HxFormatInputDateTimePatternParser.ContinueParse, HxFormatInputDateTimePatternParser.STATE_DATE];
	}

	private static _recordTimeChar(_config: HxFormatInputDateTimeParsedPattern, ch: string):
		| [string, ParseStateContinue, DateTimePartParser]
		| [string, ParseStateFail, undefined] {
		if (!HxFormatInputDateTimePatternParser._validTimeNext(ch, _config._timeChars)) {
			return [ch, HxFormatInputDateTimePatternParser.FailParse, (void 0)];
		}
		_config._timeChars += ch;
		switch (ch) {
			case 'h': {
				_config.hour = _config._order++;
				break;
			}
			case 'n': {
				_config.minute = _config._order++;
				break;
			}
			case 's': {
				_config.second = _config._order++;
				break;
			}
		}
		return [ch, HxFormatInputDateTimePatternParser.ContinueParse, HxFormatInputDateTimePatternParser.STATE_TIME];
	}

	private static _validTimeNext(ch: string, timeChars: string): boolean {
		const last = timeChars ? timeChars[timeChars.length - 1] : '';
		switch (ch) {
			case 'h': {
				return last === '';
			}
			case 'n': {
				return last === '' || last === 'h';
			}
			case 's': {
				return last === 'n';
			}
			default: {
				return false;
			}
		}
	}

	private static _finish(_config: HxFormatInputDateTimeParsedPattern):
		| [string, ParseStateFinish, undefined]
		| [string, ParseStateFail, undefined] {
		const hasDate = _config._dateChars.length > 0;
		const hasTime = _config._timeChars.length > 0;

		if (hasDate && _config._dateChars.includes('y') && _config._dateChars.includes('d') && !_config._dateChars.includes('m')) {
			return ['', HxFormatInputDateTimePatternParser.FailParse, (void 0)];
		}
		if (hasTime && !/^(h|hn|hns|ns)$/.test(_config._timeChars)) {
			return ['', HxFormatInputDateTimePatternParser.FailParse, (void 0)];
		}
		if (hasDate && hasTime) {
			if (!_config._dateChars.includes('d')) {
				return ['', HxFormatInputDateTimePatternParser.FailParse, (void 0)];
			}
			if (!_config._timeChars.includes('h')) {
				return ['', HxFormatInputDateTimePatternParser.FailParse, (void 0)];
			}
		}
		return ['', HxFormatInputDateTimePatternParser.FinishParse, (void 0)];
	}

	private constructor(input: string) {
		this._input = input;
	}

	private parse(): HxFormatInputDateTimeParsedPattern | false {
		let parser: DateTimePartParser | undefined = HxFormatInputDateTimePatternParser.STATE_START;
		while (true) {
			const [chars, state, next] = parser.parse(this._input, this._pos, this._config);
			switch (state) {
				case HxFormatInputDateTimePatternParser.FinishParse: {
					return this._config;
				}
				case HxFormatInputDateTimePatternParser.FailParse: {
					return false;
				}
				default: {
					this._pos += chars.length;
					parser = next;
				}
			}
		}
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
