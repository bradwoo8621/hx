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
	 * Correct the display value after a user edit (type, delete, paste, etc.)
	 * and compute the new caret position.
	 *
	 * @param oldValue     previous formatted value before the change,
	 *                     e.g. `"1,234"` or `"-12.5"`
	 * @param newValue     new value after the change, possibly incorrect,
	 *                     e.g. `"1,23"` after deleting the last digit
	 * @param _isBackspace the change was triggered by Backspace (rather than Delete)
	 *                     — used to resolve caret position at grouping-separator
	 *                     boundaries
	 * @param _context      the HX context providing the active locale
	 *
	 * @returns a tuple `[normalized, caret position]`:
	 *          <ul>
	 *          <li>`normalized` — the corrected, locale-formatted display string</li>
	 *          <li>`caret position` — the new caret position within `normalized`, or `"-1"` to leave the caret unchanged</li>
	 *          </ul>
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	correct(oldValue: string, newValue: string, _isBackspace: boolean, _context: HxContext): [string, number] {
		const changes = StringChange.of(oldValue, newValue);
		if (changes.isNoChange()) {
			return [newValue, -1];
		}

		// const locale = this.getLocale(context);
		// const pattern = this.getPattern();
		// // eslint-disable-next-line @typescript-eslint/no-unused-vars
		// const {layout, grouping, decimal: decimalPoint} = NumberUtils.separators(locale);
		// const minusAndDecimalPointOnly = `-${decimalPoint}`;
		// const {prefix, suffix, start, endOfNew, inserted} = changes;

		// prefix, inserted, suffix都可能是不合法的数字, 也有可能拼接起来是不合法的数字
		// - 合法的数字必须符合以下标准(忽略所有的 whitespace之后):
		//   - 负数符号必须在第一位, 并且最多有一个,
		//   - 小数点必须在负数符号之后(如果有), 并且最多有一个, 小数点可以出现在任意位置, 包含第一位和最后一位
		//   - 忽略 grouping 字符后, 其他字符都是数字, 并且至少有一个.
		// - 以下"格式化"值在不增加或者减少数字字符和小数点的前提下进行的格式化,
		//   - 去掉所有 whitespace,
		//   - 只会增加/减少grouping字符, 或者修改 grouping 字符的位置. 每一个grouping 的字符数按照layout来计算,
		//   - 或者修改小数点 ("." 改成对应区域的小数点, 如",").
		// for deletion:
		// 1. 拼接 prefix + suffix -> combined
		// 2. 判断 combined 是否为合法的数字
		// 3. 如果#2不是合法数字, 保留原样返回, caret设置到 prefix 之后 (即 start), 结束返回.
		// 4. 如果#2是合法数字,
		//    4.1 规整combined (去掉 whitespace 和 grouping 字符), 并且格式化得到 formatted
		//    4.2 获取prefix 中所有的合法字符(负数符号, 小数点和数字字符), 从左到右与 formatted 进行比较, 得到一个 index (0开始, 以下均是)
		//    4.3 查看formatted 中index+1的字符
		//        4.3.1 如果是 grouping 字符, 检查 isBackspace
		//              4.3.1.1 如果true, 返回[formatted, index]
		//              4.3.1.2 如果false, 返回[formatted, index + 1]
		//        4.3.2 如果不是 grouping 字符, 返回[formatted, index]
		// for insertion & replace-part:
		// 1. 拼接 prefix + suffix -> combined
		// 2. 判断 combined 是否为合法的数字
		// 3. 如果#2不是合法数字, 拼接prefix + inserted + suffix -> combined, caret设置到 suffix 之前(即 (prefix + inserted).length), 结束返回.
		// 4. 如果#2是合法数字, 检查inserted, 获取其中可以在拼接之后仍然保持整个字符串是合法数字的部分, 按照以下逻辑:
		//    4.1 如果prefix包含小数点, inserted截取到第一个非数字字符 (依然忽略 whitespace 和 grouping 字符)之前为止,
		//    4.2 如果prefix不包含小数点, 包含负数符号, 检查suffix 是否包含小数点
		//        4.2.1 如果true, inserted截取到第一个非数字字符 (依然忽略 whitespace 和 grouping 字符)之前为止,
		//        4.2.2 如果false, inserted截取到第一个非数字字符 (依然忽略 whitespace 和 grouping 字符)之前为止,
		//              此时截取字符串中可以包含一个小数点 (. 或者当前 locale 的小数点均可),
		//    4.3 如果prefix不包含负数符号, 检查suffix 中是否包含负数符号
		//        4.3.1 如果true, inserted全部拒绝, 格式化 combined -> formatted, 返回[formatted, 0]. (此时 prefix 为空或者都是whitespaces)
		//        4.3.2 如果false (此时 prefix为空或者都是数字字符和 whitespaces), 检查 suffix 中是否包含小数点
		//              4.3.2.1 如果true, inserted截取到第一个非数字字符 (依然忽略 whitespace 和 grouping 字符)之前为止
		//                      此时截取字符串中可以包含一个负数符号,
		//              4.3.2.2 如果false, inserted截取到第一个非数字字符 (依然忽略 whitespace 和 grouping 字符)之前为止,
		//                      此时截取字符串中可以包含一个负数符号和一个小数点 (. 或者当前 locale 的小数点均可),
		//    4.4 拼接 prefix + #4.2截取字符串 + suffix -> combined, 格式化得到 formatted.
		//    4.5 获取prefix + #4.2截取字符串中所有的合法字符(负数符号, 小数点和数字字符), 从左到右与 formatted 进行比较, 得到一个 index
		//    4.6 返回[formatted, index]
		// for replace-all:
		//  1. trim inserted -> new inserted, 检查new inserted 是否为空
		//  2. 如果#1为空, 返回[oldValue, -1], 即不响应
		//  3. 如果#1不为空, 从new inserted开头开始截取合法的数字 -> new number, 检查new number是否为空
		//  4. 如果#3为空, 返回[oldValue, -1], 即不响应
		//  5. 格式化new number -> formatted, 返回[formatted, formatted.length]
		// for substr from inserted of insertion/replace-part/replace-all
		//  截取动作中, 需要注意截取的字符串和 prefix 以及 suffix拼接后, 符合unsigned, maxIntegerDigits 和 maxFractionDigits 的定义 (如果有定义限制),
		//  截取动作应当在违反定义要求之前停止.

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
