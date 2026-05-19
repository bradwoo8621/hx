/**
 * Parsed configuration from a number format pattern string.
 *
 * Pattern grammar: @n[u][g][d{N}][f{N}[x]]
 * - @n    prefix (number type)
 * - u     unsigned, disallow negative sign
 * - g     thousands grouping (e.g. 1,234,567)
 * - d{N}  max integer digits
 * - f{N}  max fraction digits
 * - f{N}x max fraction digits, fixed display (zero-padded to exactly N places)
 */
export interface HxFormatInputNumberParsedPattern {
	type: 'number';
	/** Unsigned — no negative sign allowed */
	unsigned?: boolean;
	/** Whether to insert thousands grouping separators */
	grouping?: boolean;
	/** Max integer digits (-1 = no restriction) */
	maxIntegerDigits?: number;
	/** Max fraction digits (-1 = no restriction) */
	maxFractionDigits?: number;
	/** Fixed display: always pad/truncate to exactly maxFractionDigits decimal places */
	fixedFraction?: boolean;
}

/**
 * Valid number format pattern.
 *
 * Grammar: @n[u][g][d{N}][f{N}[x]]
 * Each branch ensures x only appears with f{N}.
 */
export type HxFormatInputNumberPattern = `@n${string}`;

// ── Parse state machine ───────

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
 * State-machine parser for HxNumFormatInputPattern strings.
 *
 * Each grammar position is a static state object with a {@link HxNumFormatPatternPartParser.parse}
 * method. The parser loop drives state transitions via `[chars, signal, nextState]` tuples
 * until either FinishParse (success) or FailParse (failure).
 *
 * @example
 * ```ts
 * HxNumFormatPatternParser.parse('@nugd10f2x')
 * // => { type: 'number', unsigned: true, grouping: true,
 * //      maxIntegerDigits: 10, maxFractionDigits: 2, fixedFraction: true }
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
		fixedFraction: false
	};

	// ── Utility ────

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

	// ── States ─────

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

	/** After `@n` — expect `u`, `g`, `d`, `f`, or end-of-input. */
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
				default: {
					return [ch, HxNumFormatPatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** After `u` — expect `g`, `d`, `f`, or end-of-input. */
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
				default: {
					return [ch, HxNumFormatPatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** After `g` — expect `d`, `f`, or end-of-input. */
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

	/** After the integer-digit count — expect `f` or end-of-input. */
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

	/** After the fraction-digit count — expect `x` or end-of-input. */
	private static readonly STATE_AFTER_F_DIGITS: HxNumFormatPatternPartParser = {
		parse: (input: string, pos: number, config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			switch (ch) {
				case (void 0): {
					return ['', HxNumFormatPatternParser.FinishParse, (void 0)];
				}
				case 'x': {
					config.fixedFraction = true;
					return ['x', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_FX];
				}
				default: {
					return [ch, HxNumFormatPatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** After `x` following `f{N}` — must be end-of-input. */
	private static readonly STATE_AFTER_FX: HxNumFormatPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			if (ch === (void 0)) {
				return ['', HxNumFormatPatternParser.FinishParse, (void 0)];
			}
			return [ch, HxNumFormatPatternParser.FailParse, (void 0)];
		}
	};

	// ── Driver ─────

	private constructor(input: string) {
		this._input = input;
	}

	/**
	 * Run the state machine over the input.
	 * @returns The parsed configuration, or `false` if the pattern is invalid.
	 */
	parse(): HxFormatInputNumberParsedPattern | false {
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
