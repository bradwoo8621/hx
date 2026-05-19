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
export interface NumFormatConfig {
	type: 'number';
	/** Unsigned — no negative sign allowed */
	unsigned: boolean;
	/** Whether to insert thousands grouping separators */
	grouping: boolean;
	/** Max integer digits (0 = no restriction) */
	maxIntegerDigits: number;
	/** Max fraction digits (0 = no restriction) */
	maxFractionDigits: number;
	/** Fixed display: always pad/truncate to exactly maxFractionDigits decimal places */
	fixedFraction: boolean;
}

/**
 * Valid number format pattern.
 *
 * Grammar: @n[u][g][d{N}][f{N}[x]]
 * Each branch ensures x only appears with f{N}.
 */
export type HxNumFormatInputPattern = `@n${string}`;

// ── Parse state machine ───────────────────────────────────────────────────────

type ParsedChars = string;
type ParseStateFail = -1;
type ParseStateContinue = 0;
type ParseStateFinish = 1;
type HxNumFormatPatternPartParser = {
	parse: (input: string, pos: number, config: NumFormatConfig) =>
		| [ParsedChars, ParseStateContinue, HxNumFormatPatternPartParser]
		| [ParsedChars, ParseStateFinish, undefined]
		| [ParsedChars, ParseStateFail, undefined];
}

export class HxNumFormatPatternParser {
	private static readonly FailParse: ParseStateFail = -1;
	private static readonly ContinueParse: ParseStateContinue = 0;
	private static readonly FinishParse: ParseStateFinish = 1;

	private readonly _input: string;
	private _pos = 0;

	private readonly _config: NumFormatConfig = {
		type: 'number',
		unsigned: false,
		grouping: false,
		maxIntegerDigits: 0,
		maxFractionDigits: 0,
		fixedFraction: false
	};

	private static readonly STATE_START: HxNumFormatPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: NumFormatConfig) => {
			const ch = input[pos];
			return ch === '@'
				? ['@', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_AT]
				: [ch, HxNumFormatPatternParser.FailParse, (void 0)];
		}
	};
	private static readonly STATE_AFTER_AT: HxNumFormatPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: NumFormatConfig) => {
			const ch = input[pos];
			return ch === 'n'
				? ['n', HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_N]
				: [ch, HxNumFormatPatternParser.FailParse, (void 0)];
		}
	};
	private static readonly STATE_AFTER_N: HxNumFormatPatternPartParser = {
		parse: (input: string, pos: number, config: NumFormatConfig) => {
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
	private static readonly STATE_AFTER_U: HxNumFormatPatternPartParser = {
		parse: (input: string, pos: number, config: NumFormatConfig) => {
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
	private static readonly STATE_AFTER_G: HxNumFormatPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: NumFormatConfig) => {
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
	private static readonly STATE_AFTER_D: HxNumFormatPatternPartParser = {
		parse: (input: string, pos: number, config: NumFormatConfig) => {
			let charsCount = 0;
			let ch = input.charCodeAt(pos);

			while (ch >= 48 && ch <= 57) {
				charsCount++;
				ch = input.charCodeAt(pos + charsCount);
			}
			if (charsCount === 0) {
				return ['', HxNumFormatPatternParser.FailParse, (void 0)];
			} else {
				const chars = input.slice(pos, pos + charsCount);
				config.maxIntegerDigits = parseInt(chars, 10);
				return [chars, HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_D_DIGITS];
			}
		}
	};
	private static readonly STATE_AFTER_D_DIGITS: HxNumFormatPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: NumFormatConfig) => {
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
	private static readonly STATE_AFTER_F: HxNumFormatPatternPartParser = {
		parse: (input: string, pos: number, config: NumFormatConfig) => {
			let charsCount = 0;
			let ch = input.charCodeAt(pos);

			while (ch >= 48 && ch <= 57) {
				charsCount++;
				ch = input.charCodeAt(pos + charsCount);
			}
			if (charsCount === 0) {
				return ['', HxNumFormatPatternParser.FailParse, (void 0)];
			} else {
				const chars = input.slice(pos, pos + charsCount);
				config.maxFractionDigits = parseInt(chars, 10);
				return [chars, HxNumFormatPatternParser.ContinueParse, HxNumFormatPatternParser.STATE_AFTER_F_DIGITS];
			}
		}
	};
	private static readonly STATE_AFTER_F_DIGITS: HxNumFormatPatternPartParser = {
		parse: (input: string, pos: number, config: NumFormatConfig) => {
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
	private static readonly STATE_AFTER_FX: HxNumFormatPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: NumFormatConfig) => {
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

	parse(): NumFormatConfig | false {
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

	static parse(input: string): NumFormatConfig | false {
		return new HxNumFormatPatternParser(input).parse();
	}
}
