import type {HxContext} from '../../contexts';
import {NumberUtils, StringChange, StringUtils} from '../../utils';
import {HxFormatInputDefaults} from './defaults';
import type {HxFormatInputNumberParsedPattern, HxFormatInputPatternKit} from './types';
import {buildKit} from './utils';

type ParseStateFail = -1;
type ParseStateContinue = 0;
type ParseStateFinish = 1;

type HxNumFormatPatternPartParser = {
	parse: (input: string, pos: number, config: HxFormatInputNumberParsedPattern) =>
		| [string, ParseStateContinue, HxNumFormatPatternPartParser]
		| [string, ParseStateFinish, undefined]
		| [string, ParseStateFail, undefined];
};

/**
 * State-machine parser for `HxFormatInputNumberPattern` strings.
 *
 * Each grammar position is a static state object with a `HxNumFormatPatternPartParser.parse`
 * method. The parser loop drives state transitions via `[chars, signal, nextState]` tuples
 * until either FinishParse (success) or FailParse (failure).
 *
 * @example
 * ```ts
 * HxNumFormatPatternParser.parse('@nugd10f2x')
 * // => { type: 'number', unsigned: true, grouping: true,
 * //      maxIntegerDigits: 10, maxFractionDigits: 2, fixedFraction: true }
 *
 * HxNumFormatPatternParser.parse('@ne')
 * // => { type: 'number', forceEn: true }
 *
 * HxNumFormatPatternParser.parse('@ninvalid')
 * // => false
 * ```
 */
export class HxNumFormatPatternParser {
	private static readonly FailParse: ParseStateFail = -1;
	private static readonly ContinueParse: ParseStateContinue = 0;
	private static readonly FinishParse: ParseStateFinish = 1;

	private readonly _input: string;
	private _pos: number = 0;

	private readonly _config: HxFormatInputNumberParsedPattern = {
		type: 'number',
		unsigned: false,
		grouping: false,
		maxIntegerDigits: -1,
		maxFractionDigits: -1,
		fixedFraction: false,
		forceEn: HxFormatInputDefaults.forceUseEnFormat
	};

	/**
	 * Read a run of ASCII digit characters (`0`–`9`) starting at the given position.
	 * Calls `onDigits` with the parsed integer value to produce the next state.
	 * Returns FailParse if no digits are found.
	 */
	private static readonly READ_DIGITS = (
		input: string, pos: number, onDigits: (digits: number) => HxNumFormatPatternPartParser
	): ReturnType<HxNumFormatPatternPartParser['parse']> => {
		let charsCount = 0;
		let ch = input.charCodeAt(pos);

		while (ch >= 48 && ch <= 57) {
			charsCount++;
			ch = input.charCodeAt(pos + charsCount);
		}
		if (charsCount === 0) {
			return ['', HxNumFormatPatternParser.FailParse, (void 0)];
		}
		const chars = input.slice(pos, pos + charsCount);
		return [chars, HxNumFormatPatternParser.ContinueParse, onDigits(parseInt(chars, 10))];
	};

	/** Expecting `@` at the first position. */
	private static readonly STATE_START: HxNumFormatPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			return ch === '@'
				? ['@', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_AT]
				: [ch, HxNumFormatPatternParser.FailParse, (void 0)];
		}
	};

	/** Expecting `n` after `@`. */
	private static readonly STATE_AFTER_AT: HxNumFormatPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			return ch === 'n'
				? ['n', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_N]
				: [ch, HxNumFormatPatternParser.FailParse, (void 0)];
		}
	};

	/** After `@n` — expect `u`, `g`, `d`, `f`, `e` or end-of-input. */
	private static readonly STATE_AFTER_N: HxNumFormatPatternPartParser = {
		parse: (input: string, pos: number, config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			switch (ch) {
				case (void 0): {
					return ['', HxNumFormatPatternParser.FinishParse, (void 0)];
				}
				case 'u': {
					config.unsigned = true;
					return ['u', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_U];
				}
				case 'g': {
					config.grouping = true;
					return ['g', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_G];
				}
				case 'd': {
					return ['d', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_D];
				}
				case 'f': {
					return ['f', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_F];
				}
				case 'e': {
					return ['e', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_E];
				}
				default: {
					return [ch, HxNumFormatPatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** After `u` — expect `g`, `d`, `f`, `e` or end-of-input. */
	private static readonly STATE_AFTER_U: HxNumFormatPatternPartParser = {
		parse: (input: string, pos: number, config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			switch (ch) {
				case (void 0): {
					return ['', HxNumFormatPatternParser.FinishParse, (void 0)];
				}
				case 'g': {
					config.grouping = true;
					return ['g', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_G];
				}
				case 'd': {
					return ['d', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_D];
				}
				case 'f': {
					return ['f', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_F];
				}
				case 'e': {
					return ['e', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_E];
				}
				default: {
					return [ch, HxNumFormatPatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** After `g` — expect `d`, `f`, `e` or end-of-input. */
	private static readonly STATE_AFTER_G: HxNumFormatPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			switch (ch) {
				case (void 0): {
					return ['', HxNumFormatPatternParser.FinishParse, (void 0)];
				}
				case 'd': {
					return ['d', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_D];
				}
				case 'f': {
					return ['f', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_F];
				}
				case 'e': {
					return ['e', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_E];
				}
				default: {
					return [ch, HxNumFormatPatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** After `d` — read integer-digit count, then advance. */
	private static readonly STATE_AFTER_D: HxNumFormatPatternPartParser = {
		parse: (input: string, pos: number, config: HxFormatInputNumberParsedPattern) => {
			return HxNumFormatPatternParser.READ_DIGITS(input, pos, (digits) => {
				config.maxIntegerDigits = digits;
				return HxNumFormatPatternParser.STATE_AFTER_D_DIGITS;
			});
		}
	};

	/** After the integer-digit count — expect `f`, `e` or end-of-input. */
	private static readonly STATE_AFTER_D_DIGITS: HxNumFormatPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			switch (ch) {
				case (void 0): {
					return ['', HxNumFormatPatternParser.FinishParse, (void 0)];
				}
				case 'f': {
					return ['f', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_F];
				}
				case 'e': {
					return ['e', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_E];
				}
				default: {
					return [ch, HxNumFormatPatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** After `f` — read fraction-digit count, then advance. */
	private static readonly STATE_AFTER_F: HxNumFormatPatternPartParser = {
		parse: (input: string, pos: number, config: HxFormatInputNumberParsedPattern) => {
			return HxNumFormatPatternParser.READ_DIGITS(input, pos, (digits) => {
				config.maxFractionDigits = digits;
				return HxNumFormatPatternParser.STATE_AFTER_F_DIGITS;
			});
		}
	};

	/** After the fraction-digit count — expect `x`, `e` or end-of-input. */
	private static readonly STATE_AFTER_F_DIGITS: HxNumFormatPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			switch (ch) {
				case (void 0): {
					return ['', HxNumFormatPatternParser.FinishParse, (void 0)];
				}
				case 'x': {
					return ['x', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_FX];
				}
				case 'e': {
					return ['e', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_E];
				}
				default: {
					return [ch, HxNumFormatPatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** After `x` following `f{N}` — must be `e` or end-of-input. */
	private static readonly STATE_AFTER_FX: HxNumFormatPatternPartParser = {
		parse: (input: string, pos: number, config: HxFormatInputNumberParsedPattern) => {
			config.fixedFraction = true;

			const ch = input[pos];
			if (ch === (void 0)) {
				return ['', HxNumFormatPatternParser.FinishParse, (void 0)];
			} else if (ch === 'e') {
				return ['e', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_E];
			} else {
				return [ch, HxNumFormatPatternParser.FailParse, (void 0)];
			}
		}
	};

	/** After `e` — must be end-of-input. */
	private static readonly STATE_AFTER_E: HxNumFormatPatternPartParser = {
		parse: (input: string, pos: number, config: HxFormatInputNumberParsedPattern) => {
			config.forceEn = true;

			const ch = input[pos];
			if (ch === (void 0)) {
				return ['', HxNumFormatPatternParser.FinishParse, (void 0)];
			} else {
				return [ch, HxNumFormatPatternParser.FailParse, (void 0)];
			}
		}
	};

	private constructor(input: string) {
		this._input = input;
	}

	/**
	 * Run the state machine over the input.
	 * @returns The parsed configuration, or `false` if the pattern is invalid.
	 */
	private parse(): HxFormatInputNumberParsedPattern | false {
		let parser = HxNumFormatPatternParser.STATE_START;
		while (true) {
			const [chars, state, nextParser] = parser.parse(this._input, this._pos, this._config);
			switch (state) {
				case HxNumFormatPatternParser.FinishParse: {
					return this._config;
				}
				case HxNumFormatPatternParser.FailParse: {
					return false;
				}
				default: {
					this._pos += chars.length;
					parser = nextParser;
				}
			}
		}
	}

	/**
	 * Parse a pattern string and return the configuration.
	 * @param input Pattern string like `@nugd10f2x`.
	 * @returns The parsed configuration, or `false` if invalid.
	 */
	static parse(input: string): HxFormatInputNumberParsedPattern | false {
		return new HxNumFormatPatternParser(input).parse();
	}
}

export class HxFormatInputNumberPatternKit implements HxFormatInputPatternKit {
	private readonly pattern: HxFormatInputNumberParsedPattern;

	private constructor(pattern: HxFormatInputNumberParsedPattern) {
		this.pattern = pattern;
	}

	getPattern(): HxFormatInputNumberParsedPattern {
		return this.pattern;
	}

	private getLocale(context: HxContext): string {
		if (this.getPattern().forceEn) {
			return 'en';
		} else {
			return context.language.current();
		}
	}

	/**
	 * @param oldValue - previous formatted value
	 * @param newValue - changed value, could be incorrect
	 * @param _isBackspace - the change lead by backspace or not
	 * @param context - th HX context providing the active locale
	 *
	 * Returns a tuple `[normalized, caret position]`:
	 * - `normalized` — the canonical number string with format.
	 * - `caret position` - the caret position after normalized. or -1 when no change.
	 */
	correct(oldValue: string, newValue: string, _isBackspace: boolean, context: HxContext): [string, number] {
		const changes = StringChange.of(oldValue, newValue);
		if (changes.isNoChange()) {
			return [newValue, -1];
		}

		const locale = this.getLocale(context);
		const pattern = this.getPattern();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const {grouping: _grouping, decimal: decimalPoint} = NumberUtils.separators(locale);
		const minusAndDecimalPointOnly = `-${decimalPoint}`;
		const {
			prefix, suffix,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			start, endOfOld: _endOfOld, endOfNew: _endOfNew,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			deleted: _deleted, inserted: _inserted
		} = changes;

		// TIP in following comments, use "." instead of decimal point, in logic, still use decimal point.
		if (changes.isDelete()) {
			const combined = prefix + suffix;
			// 1. degenerate cases: just a sign, decimal point, or both
			if (combined === '-' || combined === decimalPoint || combined === minusAndDecimalPointOnly) {
				return [combined, start];
			}
			// 2-3. try to cast combined to number via stripFormatting then normalizeToNumber
			const [stripped, raw] = NumberUtils.stripFormatting(StringUtils.stripWhitespace(combined), locale);
			if (!stripped) {
				return [combined, start];
			}
			const [numValid, normalized, negative, integer, fraction] = StringUtils.normalizeToNumber(raw);
			if (!numValid) {
				return [combined, start];
			}
			// 4. format the valid number
			const options = {
				locale,
				grouping: pattern.grouping ?? false,
				minFractionDigits: pattern.fixedFraction ? pattern.maxFractionDigits : (void 0)
			};
			const num = Number(normalized);
			let formatted: string;
			if (String(num) === normalized) {
				formatted = NumberUtils.format(num, options);
			} else {
				formatted = NumberUtils.formatManually(negative, integer, fraction, options);
			}
			return [formatted, start];
		}

		// for insertion:
		//  1.
		// for replace-part:
		//  1.
		// for replace-all:
		//  1. capture the valid chars from inserted, and return formatted, and put caret at end of formatted

		return [newValue, -1];
	}

	/**
	 * Convert a display string to a model value.
	 *
	 * Locale formatting (grouping separators, locale-specific decimal point)
	 * is stripped first, then the result is converted:
	 *
	 * - If the input is `null`, `undefined`, or empty, returns `(void 0)`.
	 * - If the cleaned string round-trips through `Number` without precision
	 *   loss, returns the `number`.
	 * - If the cleaned string is a valid number but would lose IEEE 754
	 *   precision when converted, returns the cleaned canonical string
	 *   (e.g. a large integer or a high-precision decimal with grouping
	 *   separators stripped).
	 * - If the input is not a valid number string, returns it unchanged.
	 *
	 * @param value   - the display string (maybe `null` / `undefined`)
	 * @param context - the HX context providing the active locale
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toModel(value: string | null | undefined, context: HxContext): any | null | undefined {
		if (value == null || value === '') {
			return (void 0);
		}

		const [valid, str] = NumberUtils.stripFormatting(value, this.getLocale(context));
		if (valid) {
			const num = Number(str);
			// Round-trip check: return number only when no precision is lost,
			// otherwise keep the original string (e.g. integers beyond 2^53).
			return String(num) === str ? num : str;
		} else {
			return value;
		}
	}

	/**
	 * Convert a model value to a locale-formatted display string.
	 *
	 * <ul>
	 * <li>`null | undefined` — returns `(void 0)`.</li>
	 * <li>`number` — formats with `Intl.NumberFormat` (grouping and
	 *     decimal separator follow the active locale).</li>
	 * <li>`string` — treated as a canonical number string when representable;
	 *     non-number strings are returned as-is.  Number strings that survive the
	 *     round-trip `String(Number(str)) === str` are formatted via
	 *     `Intl.NumberFormat`; strings that would lose IEEE 754 precision
	 *     (e.g. integers beyond 2<sup>53</sup>) are split into integer/fraction
	 *     parts and formatted manually, so the fractional portion is preserved.</li>
	 * <li>other types — stringified via `asStr` and returned.</li>
	 * </ul>
	 *
	 * @param value   - the model value (any type)
	 * @param context - the HX context providing the active locale
	 * @returns the locale-formatted display string, or `(void 0)` when the
	 *          value is `null` or `undefined`
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fromModel(value: any | null | undefined, context: HxContext): string | null | undefined {
		if (value == null) {
			return (void 0);
		}

		const typeOfValue = typeof value;
		if (typeOfValue === 'number') {
			const pattern = this.getPattern();
			const options = {
				locale: this.getLocale(context),
				grouping: pattern.grouping ?? false,
				minFractionDigits: pattern.fixedFraction ? pattern.maxFractionDigits : (void 0)
			};
			return NumberUtils.format(value, options);
		} else if (typeOfValue === 'string') {
			const [is, normalized, negative, integer, fraction] = StringUtils.normalizeToNumber(value);
			if (is) {
				const num = Number(normalized);
				const pattern = this.getPattern();
				const options = {
					locale: this.getLocale(context),
					grouping: pattern.grouping ?? false,
					minFractionDigits: pattern.fixedFraction ? pattern.maxFractionDigits : (void 0)
				};
				if (String(num) === normalized) {
					return NumberUtils.format(num, options);
				} else {
					// Precision loss — manually format the parts.
					return NumberUtils.formatManually(negative, integer, fraction, options);
				}
			} else {
				return value;
			}
		} else {
			// Other types → stringify and return.
			return StringUtils.asStr(value);
		}
	}

	static readonly build = buildKit<HxFormatInputNumberPatternKit, HxFormatInputNumberParsedPattern>({
		parse: (pattern: string) => HxNumFormatPatternParser.parse(pattern),
		is: (pattern): pattern is HxFormatInputNumberParsedPattern => pattern.type === 'number',
		create: (parsed) => new HxFormatInputNumberPatternKit(parsed)
	});
}
