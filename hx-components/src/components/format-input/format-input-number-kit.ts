import type {HxContext} from '../../contexts';
import {type NumberFormatOptions, type NumberFormatPattern, NumberUtils, StringChange, StringUtils} from '../../utils';
import {HxFormatInputDefaults} from './defaults';
import type {HxFormatInputDispatcherProps, HxFormatInputNumberParsedPattern, HxFormatInputPatternKit} from './types';

type ParseStateFail = -1;
type ParseStateContinue = 0;
type ParseStateFinish = 1;

type HxFormatInputNumberPatternPartParser = {
	parse: (input: string, pos: number, config: HxFormatInputNumberParsedPattern) =>
		| [string, ParseStateContinue, HxFormatInputNumberPatternPartParser]
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
export class HxFormatInputNumberPatternParser {
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
		input: string, pos: number, onDigits: (digits: number) => HxFormatInputNumberPatternPartParser
	): ReturnType<HxFormatInputNumberPatternPartParser['parse']> => {
		let charsCount = 0;
		let ch = input.charCodeAt(pos);

		while (ch >= 48 && ch <= 57) {
			charsCount++;
			ch = input.charCodeAt(pos + charsCount);
		}
		if (charsCount === 0) {
			return ['', HxFormatInputNumberPatternParser.FailParse, (void 0)];
		}
		const chars = input.slice(pos, pos + charsCount);
		return [chars, HxFormatInputNumberPatternParser.ContinueParse, onDigits(parseInt(chars, 10))];
	};

	/** Expecting `@` at the first position. */
	private static readonly STATE_START: HxFormatInputNumberPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			return ch === '@'
				? ['@', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_AT]
				: [ch, HxFormatInputNumberPatternParser.FailParse, (void 0)];
		}
	};

	/** Expecting `n` after `@`. */
	private static readonly STATE_AFTER_AT: HxFormatInputNumberPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			return ch === 'n'
				? ['n', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_N]
				: [ch, HxFormatInputNumberPatternParser.FailParse, (void 0)];
		}
	};

	/** After `@n` — expect `u`, `g`, `d`, `f`, `e` or end-of-input. */
	private static readonly STATE_AFTER_N: HxFormatInputNumberPatternPartParser = {
		parse: (input: string, pos: number, config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			switch (ch) {
				case (void 0): {
					return ['', HxFormatInputNumberPatternParser.FinishParse, (void 0)];
				}
				case 'u': {
					config.unsigned = true;
					return ['u', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_U];
				}
				case 'g': {
					config.grouping = true;
					return ['g', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_G];
				}
				case 'd': {
					return ['d', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_D];
				}
				case 'f': {
					return ['f', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_F];
				}
				case 'e': {
					return ['e', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_E];
				}
				default: {
					return [ch, HxFormatInputNumberPatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** After `u` — expect `g`, `d`, `f`, `e` or end-of-input. */
	private static readonly STATE_AFTER_U: HxFormatInputNumberPatternPartParser = {
		parse: (input: string, pos: number, config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			switch (ch) {
				case (void 0): {
					return ['', HxFormatInputNumberPatternParser.FinishParse, (void 0)];
				}
				case 'g': {
					config.grouping = true;
					return ['g', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_G];
				}
				case 'd': {
					return ['d', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_D];
				}
				case 'f': {
					return ['f', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_F];
				}
				case 'e': {
					return ['e', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_E];
				}
				default: {
					return [ch, HxFormatInputNumberPatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** After `g` — expect `d`, `f`, `e` or end-of-input. */
	private static readonly STATE_AFTER_G: HxFormatInputNumberPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			switch (ch) {
				case (void 0): {
					return ['', HxFormatInputNumberPatternParser.FinishParse, (void 0)];
				}
				case 'd': {
					return ['d', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_D];
				}
				case 'f': {
					return ['f', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_F];
				}
				case 'e': {
					return ['e', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_E];
				}
				default: {
					return [ch, HxFormatInputNumberPatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** After `d` — read integer-digit count, then advance. */
	private static readonly STATE_AFTER_D: HxFormatInputNumberPatternPartParser = {
		parse: (input: string, pos: number, config: HxFormatInputNumberParsedPattern) => {
			return HxFormatInputNumberPatternParser.READ_DIGITS(input, pos, (digits) => {
				config.maxIntegerDigits = digits;
				return HxFormatInputNumberPatternParser.STATE_AFTER_D_DIGITS;
			});
		}
	};

	/** After the integer-digit count — expect `f`, `e` or end-of-input. */
	private static readonly STATE_AFTER_D_DIGITS: HxFormatInputNumberPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			switch (ch) {
				case (void 0): {
					return ['', HxFormatInputNumberPatternParser.FinishParse, (void 0)];
				}
				case 'f': {
					return ['f', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_F];
				}
				case 'e': {
					return ['e', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_E];
				}
				default: {
					return [ch, HxFormatInputNumberPatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** After `f` — read fraction-digit count, then advance. */
	private static readonly STATE_AFTER_F: HxFormatInputNumberPatternPartParser = {
		parse: (input: string, pos: number, config: HxFormatInputNumberParsedPattern) => {
			return HxFormatInputNumberPatternParser.READ_DIGITS(input, pos, (digits) => {
				config.maxFractionDigits = digits;
				return HxFormatInputNumberPatternParser.STATE_AFTER_F_DIGITS;
			});
		}
	};

	/** After the fraction-digit count — expect `x`, `e` or end-of-input. */
	private static readonly STATE_AFTER_F_DIGITS: HxFormatInputNumberPatternPartParser = {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parse: (input: string, pos: number, _config: HxFormatInputNumberParsedPattern) => {
			const ch = input[pos];
			switch (ch) {
				case (void 0): {
					return ['', HxFormatInputNumberPatternParser.FinishParse, (void 0)];
				}
				case 'x': {
					return ['x', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_FX];
				}
				case 'e': {
					return ['e', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_E];
				}
				default: {
					return [ch, HxFormatInputNumberPatternParser.FailParse, (void 0)];
				}
			}
		}
	};

	/** After `x` following `f{N}` — must be `e` or end-of-input. */
	private static readonly STATE_AFTER_FX: HxFormatInputNumberPatternPartParser = {
		parse: (input: string, pos: number, config: HxFormatInputNumberParsedPattern) => {
			config.fixedFraction = true;

			const ch = input[pos];
			if (ch === (void 0)) {
				return ['', HxFormatInputNumberPatternParser.FinishParse, (void 0)];
			} else if (ch === 'e') {
				return ['e', HxFormatInputNumberPatternParser.ContinueParse, HxFormatInputNumberPatternParser.STATE_AFTER_E];
			} else {
				return [ch, HxFormatInputNumberPatternParser.FailParse, (void 0)];
			}
		}
	};

	/** After `e` — must be end-of-input. */
	private static readonly STATE_AFTER_E: HxFormatInputNumberPatternPartParser = {
		parse: (input: string, pos: number, config: HxFormatInputNumberParsedPattern) => {
			config.forceEn = true;

			const ch = input[pos];
			if (ch === (void 0)) {
				return ['', HxFormatInputNumberPatternParser.FinishParse, (void 0)];
			} else {
				return [ch, HxFormatInputNumberPatternParser.FailParse, (void 0)];
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
		if (this._input == null) {
			return false;
		}

		let parser = HxFormatInputNumberPatternParser.STATE_START;
		while (true) {
			const [chars, state, nextParser] = parser.parse(this._input, this._pos, this._config);
			switch (state) {
				case HxFormatInputNumberPatternParser.FinishParse: {
					return this._config;
				}
				case HxFormatInputNumberPatternParser.FailParse: {
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
		return new HxFormatInputNumberPatternParser(input).parse();
	}
}

/**
 * Pattern kit for formatted number input editing.
 *
 * ## Deletion
 *
 * Deletion is always accepted — even if the result is not yet a valid number —
 * because it may be an intermediate editing step.  The handler `correctDelete`
 * distinguishes two paths:
 *
 * ### 1. Combined value is NOT a valid number
 *
 * The deletion is returned as-is with the caret placed at `changes.start`
 * (the position of the deletion in the original string).
 *
 * | Example | Initial | Delete | Combined | Result | Caret |
 * |---------|---------|--------|----------|--------|-------|
 * | lone minus | `-` | `-` | `""` | `""` | 0 |
 * | lone decimal | `.` | `.` | `""` | `""` | 0 |
 * | illegal char | `1a345` | `3` | `1a45` | `1a45` | at deletion |
 * | last digit | `5` | `5` | `""` | `""` | 0 |
 *
 * ### 2. Combined value IS a valid number
 *
 * The combined text is reformatted and the caret is repositioned by matching
 * legal characters from the prefix against the formatted result.
 *
 * **Delete a digit:**
 *
 * | Example | Initial | Delete | Combined | Formatted | Caret |
 * |---------|---------|--------|----------|-----------|-------|
 * | grouped integer | `1,234` | `4` | `123` | `123` | after 3 |
 * | before comma | `12,345` | `2` | `1,345` | `1,345` | after 1 |
 * | after comma | `1,234` | `2` | `134` | `134` | after 1 |
 * | decimal integer | `12.34` | `2` | `1.34` | `1.34` | after 1 |
 * | decimal fraction | `12.3` | `3` | `12.` | `12.` | after `.` |
 * | leading zero | `0.5` | `0` | `.5` | `.5` | before `.` |
 * | grouped decimal | `1,234.56` | `3` | `1,24.56` | `124.56` | after `12` |
 *
 * **Delete the decimal point — integer and fraction merge:**
 *
 * | Example | Initial | Delete | Combined | Formatted | Caret |
 * |---------|---------|--------|----------|-----------|-------|
 * | 4+2 digits | `1,234.56` | `.` | `1,23456` | `123,456` | after `4` |
 * | 5+3 digits | `12,345.678` | `.` | `12,345678` | `12,345,678` | after `5` |
 *
 * ### 3. Caret lands on a grouping separator after formatting
 *
 * When the computed caret index points to a grouping separator in the
 * formatted result, the behaviour depends on the key and the origin of
 * the separator:
 *
 * | Key | Separator origin | Caret behaviour |
 * |-----|-----------------|-----------------|
 * | Backspace | any | stay before the separator |
 * | Delete | from suffix (original) | stay before the separator |
 * | Delete | created by formatting | skip past the separator |
 *
 * A grouping separator is "created by formatting" when the suffix does
 * not start with one (e.g., the number grew and a new comma appeared, or
 * a decimal point was deleted and the merged integer forms a new group).
 *
 * ## Insert / Replace-part
 *
 * Handled by `correctInsertOrReplacePart`. Split the input into prefix,
 * suffix, and inserted portions (via `StringChange`), then determine
 * which characters are allowed based on the state of prefix and suffix.
 *
 * ### Guard checks (before processing)
 *
 * | Condition | Action |
 * |-----------|--------|
 * | combined not valid and not intermediate (`-`, `.`, `-.`) | fall through, uncorrected |
 * | minus in suffix | reject all, restore `prefix + deleted + suffix` |
 * | `legalChars` is empty | reject all, restore `prefix + deleted + suffix` |
 * | `legalChars` starts with `-` and prefix has content | reject all |
 *
 * ### Allowed chars by state
 *
 * | State | `allowMinus` | `allowDecimal` | Meaning |
 * |-------|:----------:|:------------:|---------|
 * | decimal in suffix | `!hasMinusInPrefix` | `false` | insert before decimal; digits only, minus if prefix clean |
 * | decimal in prefix | `false` | `false` | insert after decimal; digits only |
 * | minus in prefix | `false` | `true` | insert after minus; digits and decimal allowed |
 * | neither | `true` | `true` | fresh number; minus and decimal allowed |
 *
 * ### Branch A — decimal in suffix
 *
 * Only `maxIntegerDigits` applies (the decimal is already in the suffix,
 * so inserted text is the integer part).
 *
 * | `remainIntegerDigits` | Action |
 * |-----------------------|--------|
 * | `<= 0` | reject all inserted |
 * | `> 0`, `maxIntegerDigits === 0` | only `0` or `-0` allowed |
 * | `> 0`, starts with `-` | strip digits to fit remaining count |
 * | `> 0`, no minus | strip digits to fit remaining count |
 *
 * ### Branch B — decimal in prefix
 *
 * Only `maxFractionDigits` applies (inserted text is entirely fraction
 * digits).
 *
 * | `remainFractionDigits` | Action |
 * |------------------------|--------|
 * | `<= 0` | reject all inserted |
 * | `> 0` | truncate inserted to remaining count |
 *
 * ### Branch C — no decimal in prefix or suffix
 *
 * Both integer and fraction constraints apply. If inserted contains a
 * decimal point, suffix integer digits are reassigned to the fraction part.
 *
 * **Integer constraints:**
 *
 * | `maxIntegerDigits` | Additional conditions | Action |
 * |:-----------------:|-----------------------|--------|
 * | `0` | has minus, suffix has `0` | accept minus only |
 * | `0` | has minus, suffix empty, inserted starts `0` | accept `-0` |
 * | `0` | no minus, prefix has digit | reject if integer present |
 * | `0` | no minus, suffix has digit | reject all |
 * | `0` | integer all-zeros | keep single `0` |
 * | `0` | integer starts `0` | keep `0`, drop rest |
 * | `0` | integer starts non-zero | reject all |
 * | `> 0` | `remainDigits <= 0` | reject if integer present |
 * | `> 0` | `remainDigits > 0` | truncate to remaining count |
 *
 * **Fraction constraints:**
 *
 * | Condition | Action |
 * |-----------|--------|
 * | `integerDropped` (truncation overflowed) | drop fraction entirely |
 * | `maxFractionDigits === 0` | drop fraction, disallow decimal point |
 * | `fraction.length === 0` | nothing to do |
 * | `remainFractionDigits <= 0` | drop inserted fraction, keep decimal |
 * | `remainFractionDigits > 0` | truncate fraction to remaining count |
 *
 * When inserted fraction is dropped but suffix fraction already exceeds
 * `maxFractionDigits`, the decimal point is kept. Removing it would turn
 * suffix fraction digits into integer digits — a cascading side effect.
 * Since either choice is intent inference, we preserve the decimal point.
 *
 * ## Replace-all
 *
 * Handled by `correctReplaceAll`. Full-value replacement (paste over
 * selection, Ctrl+A then type).
 *
 * 1. Strip whitespace from inserted text. If empty or no legal chars
 *    remain, keep `oldValue` unchanged.
 * 2. Intermediate states (`-`, `.`, `-.` or locale equivalents) are
 *    returned as-is so the next edit can continue building the number.
 * 3. Apply `maxIntegerDigits`:
 *    * `=== 0`: only `0` allowed; non-zero rejected; `0`+non-zero
 *      truncated to `0`.
 *    * `> 0`: leading zeros stripped, integer truncated to at most
 *      `maxIntegerDigits`. If truncated, decimal point and fraction
 *      are dropped.
 * 4. Apply `maxFractionDigits`:
 *    * `=== 0`: fraction dropped entirely.
 *    * `> 0`: fraction truncated to at most `maxFractionDigits`.
 * 5. Integer defaults to `"0"` if empty. Reassemble and format, caret
 *    at the end.
 *
 * | Example | Pattern | Initial | Paste | Result |
 * |---------|---------|---------|-------|--------|
 * | valid number | `@nug` | `1,234` | `5678` | `5,678` |
 * | exceed integer | `@nd3` | `1` | `12345` | `123` |
 * | truncate fraction | `@nf2` | — | `1.2345` | `1.23` |
 * | mID=0, zero | `@nd0` | — | `0` | `0` |
 * | mID=0, non-zero | `@nd0` | — | `5` | unchanged |
 * | unsigned + minus | `@nu` | — | `-5` | unchanged |
 * | intermediate `-` | `@nd5` | `123` | `-` | `-` |
 * | intermediate `.` | `@nf2` | `123` | `.` | `.` |
 * | intermediate `-.` | `@nf2` | `123` | `-.` | `-.` |
 * | with grouping | `@nug` | — | `1,234` | `1,234` |
 */
export class HxFormatInputNumberPatternKit implements HxFormatInputPatternKit {
	/** Parsed pattern with all optional fields resolved to defaults. */
	private readonly pattern: Readonly<Required<HxFormatInputNumberParsedPattern>>;

	/**
	 * Normalize a parsed pattern, filling in defaults and converting
	 * sentinel values (negative) to `Infinity` for internal use.
	 *
	 * Defaults applied:
	 * - `unsigned` → `false`
	 * - `grouping` → `false`
	 * - `maxIntegerDigits` → `Infinity` (when `< 0` or omitted)
	 * - `maxFractionDigits` → `Infinity` (when `< 0` or omitted)
	 * - `fixedFraction` → `false` when fraction digits are unlimited
	 * - `forceEn` → from `HxFormatInputDefaults`
	 *
	 * @param pattern — parsed pattern configuration (may have optional/undefined fields)
	 */
	private constructor(pattern: HxFormatInputNumberParsedPattern) {
		const ptn = {
			grouping: false,
			unsigned: false,
			maxIntegerDigits: Infinity,
			maxFractionDigits: Infinity,
			fixedFraction: false,
			forceEn: HxFormatInputDefaults.forceUseEnFormat,
			...pattern
		};
		if (ptn.maxIntegerDigits < 0) {
			// no max integer digits limitation
			ptn.maxIntegerDigits = Infinity;
		}
		if (ptn.maxFractionDigits < 0) {
			// no max fraction digits limitation
			ptn.maxFractionDigits = Infinity;
		}
		if (ptn.maxFractionDigits === Infinity) {
			// no fix fraction digits
			ptn.fixedFraction = false;
		}
		this.pattern = ptn;
	}

	private getLocale(context: HxContext): string {
		if (this.pattern.forceEn) {
			return 'en';
		} else {
			return context.language.current();
		}
	}

	private getRules(context: HxContext) {
		const locale = this.getLocale(context);
		const format = NumberUtils.separators(locale);
		return {pattern: this.pattern, format};
	}

	/**
	 * Correct the display value after a user edit (type, delete, paste, etc.)
	 * and compute the new caret position.
	 *
	 * @param oldValue     previous formatted value before the change,
	 *                     e.g. `"1,234"` or `"-12.5"`
	 * @param newValue     new value after the change, possibly incorrect,
	 *                     e.g. `"1,23"` after deleting the last digit
	 * @param isBackspace  the change was triggered by Backspace (rather than Delete)
	 *                     — used to resolve caret position at grouping-separator
	 *                     boundaries
	 * @param context      the HX context providing the active locale
	 *
	 * @returns a tuple `[normalized, caret position]`:
	 *          <ul>
	 *          <li>`normalized` — the corrected, locale-formatted display string</li>
	 *          <li>`caret position` — the new caret position within `normalized`, or `"-1"` to leave the caret unchanged</li>
	 *          </ul>
	 */
	correct(oldValue: string, newValue: string, isBackspace: boolean, context: HxContext): [string, number] {
		const changes = StringChange.of(oldValue, newValue);

		switch (changes.type) {
			case 'delete': {
				return this.correctDelete(changes, isBackspace, context);
			}
			case 'insert':
			case 'replace-part': {
				return this.correctInsertOrReplacePart(changes, context);
			}
			case 'replace-all': {
				return this.correctReplaceAll(oldValue, changes, context);
			}
			case 'none':
			default: {
				return [newValue, -1];
			}
		}
	}

	/**
	 * Check whether `text` is a valid number under the locale rules:
	 * after stripping whitespace, the content must match the canonical
	 * form (optional leading `-`, at most one `.`, at least one digit).
	 *
	 * @param textWithWhitespaceStripped
	 * @param format
	 */
	private isValidNumber(textWithWhitespaceStripped: string, format: NumberFormatPattern): boolean {
		let charIndex = 0;
		while (charIndex < textWithWhitespaceStripped.length) {
			const ch = textWithWhitespaceStripped[charIndex];
			if (ch !== format.grouping) {
				if (charIndex !== 0 && ch === '-') {
					// group char(s) before minus, not allowed
					return false;
				}
				break;
			} else {
				charIndex++;
			}
		}
		if (charIndex === textWithWhitespaceStripped.length) {
			// every char is grouping
			return false;
		}
		textWithWhitespaceStripped = charIndex === 0 ? textWithWhitespaceStripped : textWithWhitespaceStripped.substring(charIndex);

		const [valid] = NumberUtils.stripFormatting(textWithWhitespaceStripped, format.grouping, format.decimal);
		return valid;
	}

	/**
	 * Format a valid number string (whitespace stripped) for display:
	 * - re-insert grouping separators (if enabled) per the layout
	 *
	 * This step does NOT add/remove digit characters or the decimal point,
	 * so leading/trailing zeros are preserved as-is.
	 */
	private format(validNumberTextWithWhitespaceStripped: string, format: NumberFormatPattern, useGrouping: boolean): string {
		let integer = '';
		let fraction = '';
		let negative = false;
		let inFraction = false;

		for (let i = 0; i < validNumberTextWithWhitespaceStripped.length; i++) {
			const ch = validNumberTextWithWhitespaceStripped[i];
			if (ch === '-') {
				if (i === 0) {
					negative = true;
				}
			} else if (ch === format.decimal) {
				inFraction = true;
			} else if (ch === format.grouping) {
				// skip
			} else {
				if (inFraction) {
					fraction += ch;
				} else {
					integer += ch;
				}
			}
		}

		if (useGrouping && integer.length > 0) {
			integer = this.applyGrouping(integer, format);
		}

		let result = (negative ? '-' : '') + integer;
		if (inFraction) {
			result += format.decimal + fraction;
		}
		return result;
	}

	/**
	 *  Apply Indian-style grouping (rightmost 3 digits, then groups of 2).
	 *  For example, `12345678` → `1,23,45,678`.
	 */
	private applyGrouping223(integer: string, groupingSeparator: string): string {
		if (integer.length <= 3) {
			return integer;
		}

		const last3 = integer.slice(-3);
		const rest = integer.slice(0, -3);
		const groups: Array<string> = [];
		for (let i = rest.length; i > 0; i -= 2) {
			groups.unshift(rest.slice(Math.max(0, i - 2), i));
		}
		return groups.join(groupingSeparator) + groupingSeparator + last3;
	}

	/**
	 * Apply Western-style grouping (groups of 3 digits from the right).
	 * For example, `1234567` → `1,234,567`.
	 */
	private applyGrouping333(integer: string, groupingSeparator: string): string {
		if (integer.length <= 3) {
			return integer;
		}

		const groups: Array<string> = [];
		for (let i = integer.length; i > 0; i -= 3) {
			groups.unshift(integer.slice(Math.max(0, i - 3), i));
		}
		return groups.join(groupingSeparator);
	}

	/**
	 * Insert grouping separators into the integer-digit string,
	 * dispatching to the appropriate layout algorithm.
	 *
	 * @param integer — digit-only string (no sign, no decimal)
	 * @param format  — locale number-format pattern
	 */
	private applyGrouping(integer: string, format: NumberFormatPattern): string {
		switch (format.layout) {
			case '223': {
				return this.applyGrouping223(integer, format.grouping);
			}
			case '333':
			default: {
				return this.applyGrouping333(integer, format.grouping);
			}
		}
	}

	/**
	 * Extract the "legal" characters (minus, decimal point, digits) from `text`.
	 */
	private legalChars(text: string, decimalPoint: string): string {
		const chars: Array<string> = [];
		for (const ch of text) {
			if (ch === '-' || ch === decimalPoint || (ch >= '0' && ch <= '9')) {
				chars.push(ch);
			}
		}
		return chars.join('');
	}

	/**
	 * Truncate `text` at the first disallowed character.
	 *
	 * Rules:
	 * - Whitespace is silently skipped.
	 * - Digits `0`–`9` are always kept.
	 * - Locale decimal point: kept only when `allowDecimal` is true and
	 *   no decimal has been seen yet; a second one causes truncation.
	 * - `-` sign: kept only when `allowMinus` is true, no minus has been
	 *   seen yet, AND it is the very first character of the result
	 *   (minus in the middle would break the combined number).
	 * - Locale grouping separator: silently skipped when it appears
	 *   after at least one meaningful character; a leading grouping
	 *   separator causes truncation.
	 * - Any other character (including `.` when it does not match the
	 *   locale decimal point) causes immediate truncation.
	 *
	 * @param text         — the text inserted by the user
	 * @param allowDecimal — whether a locale decimal point is allowed
	 * @param allowMinus   — whether a `-` sign is allowed
	 * @param format       — locale number-format pattern
	 */
	private legalCharsTillNot(text: string, allowDecimal: boolean, allowMinus: boolean, format: NumberFormatPattern): string {
		const chars: Array<string> = [];

		let hasGrouping = false;
		let hasDecimal = false;
		let hasMinus = false;
		for (const ch of text) {
			if (ch.trim().length === 0) {
				continue;
			}

			if (ch >= '0' && ch <= '9') {
				chars.push(ch);
			} else if (ch === format.decimal && allowDecimal) {
				if (!hasDecimal) {
					chars.push(ch);
					hasDecimal = true;
				} else {
					break;
				}
			} else if (ch === '-' && allowMinus) {
				if (!hasGrouping && !hasMinus && chars.length === 0) {
					chars.push(ch);
					hasMinus = true;
				} else {
					break;
				}
			} else if (ch === format.grouping) {
				if (chars.length === 0) {
					hasGrouping = true;
				}
			} else {
				break;
			}
		}
		return chars.join('');
	}

	/**
	 * Split a string of legal characters (minus, digits, locale decimal point, and in correct order)
	 * into its components.
	 *
	 * @param text         — string containing only `-`, `0`–`9`, and locale decimal
	 * @param decimalPoint — the locale decimal character
	 */
	private splitLegalChars(text: string, decimalPoint: string) {
		const hasMinus = text[0] === '-';
		const decimalPointIndex = text.indexOf(decimalPoint);
		if (decimalPointIndex === -1) {
			return {
				hasMinus, hasDecimalPoint: false,
				integer: text.substring(hasMinus ? 1 : 0),
				fraction: ''
			};
		} else {
			return {
				hasMinus, hasDecimalPoint: true,
				integer: text.substring(hasMinus ? 1 : 0, decimalPointIndex),
				fraction: text.substring(decimalPointIndex + 1)
			};
		}
	}

	/**
	 * check the given text is empty or all zeros.
	 */
	private isEmptyOrAllZeros(digits: string): boolean {
		if (digits.length !== 0) {
			for (const ch of digits) {
				if (ch !== '0') {
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * Extract leading digits up to `maxDigits`, optionally stripping all
	 * heading zeros when `allowZeroHeading` is true.
	 *
	 * @returns A tuple of the extracted digit string and a boolean indicating
	 * whether trailing digits were dropped because `maxDigits` was reached
	 * (heading zeros stripped by `allowZeroHeading` are not reflected).
	 */
	private getHeadingDigits(digits: string, maxDigits: number, allowZeroHeading: boolean): [string, boolean] {
		let count = 0;
		const chars: Array<string> = [];
		for (const ch of digits) {
			if (ch === '0' && allowZeroHeading && chars.length === 0) {
				// ignore the heading zero
			} else {
				chars.push(ch);
			}
			count++;
			if (chars.length === maxDigits) {
				break;
			}
		}
		return [chars.join(''), count !== digits.length];
	}

	/**
	 * Walk through `formatted`, skipping `grouping` characters,
	 * and match the legal chars from `sourceChars` left-to-right.
	 * Returns the position in `formatted` immediately after the
	 * last matched source char (0 when sourceChars is empty).
	 *
	 * - src: "", formatted: "123", grouping: "," -> 0
	 * - src: "1", formatted: "1,234", grouping: "," -> 1
	 * - src: "12", formatted: "1,234", grouping: "," -> 3
	 * - src: "12", formatted: "124", grouping: "," -> 2
	 * - src: "123", formatted: "123", grouping: "," -> 3
	 */
	private computeCaretPositionOfFormatted(sourceChars: string, formatted: string, grouping: string): number {
		const sourceLength = sourceChars.length;
		if (sourceLength === 0) {
			return 0;
		}

		let sourceIndex = 0;
		let pos = 0;
		while (pos < formatted.length && sourceIndex < sourceLength) {
			const ch = formatted[pos];
			if (ch === grouping) {
				pos++;
				continue;
			}
			if (ch === sourceChars[sourceIndex]) {
				sourceIndex++;
				pos++;
			} else {
				break;
			}
		}
		return pos;
	}

	/**
	 * Handle a deletion edit, basically, deletion always accepted since it might be an intermediate state:
	 * 1. Concatenate prefix + suffix → combined.
	 * 2. If combined is NOT a valid number, accept the deletion, place caret at changes.start.
	 * 3. If combined IS a valid number:
	 *    3.1 Strip whitespace & grouping chars from combined, then format → formatted.
	 *    3.2 Extract legal chars (minus, decimal point, digits) from prefix,
	 *        match them left-to-right against formatted → index (0-based).
	 *    3.3 Check the character at `formatted[index]`:
	 *        3.3.1 If grouping char & isBackspace → [formatted, index]
	 *        3.3.2 If grouping char & !isBackspace → [formatted, index + 1]
	 *        3.3.3 Otherwise → [formatted, index]
	 */
	private correctDelete(changes: StringChange, isBackspace: boolean, context: HxContext): [string, number] {
		const {pattern, format} = this.getRules(context);

		const combined = changes.prefix + changes.suffix;
		const combinedWithWhitespaceStripped = StringUtils.stripWhitespace(combined);
		if (!this.isValidNumber(combinedWithWhitespaceStripped, format)) {
			return [combined, changes.start];
		}

		const formatted = this.format(combinedWithWhitespaceStripped, format, pattern.grouping);
		const legalCharsBeforeCaret = this.legalChars(changes.prefix, format.decimal);
		const index = this.computeCaretPositionOfFormatted(legalCharsBeforeCaret, formatted, format.grouping);

		if (index < formatted.length && formatted[index] === format.grouping) {
			// next char is grouping
			if (isBackspace) {
				return [formatted, index];
			}
			// delete pressed, there are two scenarios:
			if (StringUtils.stripWhitespace(changes.suffix).startsWith(format.grouping)) {
				// - the next grouping is not created caused by this format,
				//   therefore caret index remain computed index to prevent user confused.
				return [formatted, index];
			}
			// - the next grouping is created caused by this format, then assume next action is press delete,
			//   therefore caret index should be after caret
			return [formatted, index + 1];
		}
		return [formatted, index];
	}

	/**
	 * Handle an insertion or partial-replacement edit:
	 * 1. Strip whitespace from prefix and suffix separately, then concatenate → combined.
	 * 2. If combined is NOT a valid number and NOT an intermediate state
	 *    ('-', '.', '-.', or locale-decimal equivalents), skip correction
	 *    and return [prefix + inserted + suffix, (prefix + inserted).length].
	 * 3. If combined IS a valid number, determine which characters are allowed in `inserted`:
	 *    3.1 If suffix contains a minus sign → reject all inserted, return [prefix + suffix, prefix.length].
	 *    3.2 Else if suffix contains a decimal point → allow minus (unless prefix already has one).
	 *    3.3 Else if prefix contains a decimal point → only digits allowed.
	 *    3.4 Else if prefix contains a minus sign → allow decimal point.
	 *    3.5 Else (prefix has neither minus nor decimal) → allow both minus and decimal point.
	 * 4. Extract the longest valid prefix from `inserted` via `legalCharsTillNot`.
	 * 5. Concatenate prefix + validInserted + suffix, format → formatted.
	 * 6. Match legal chars from (prefix + validInserted) against formatted → index.
	 * 7. Return [formatted, index].
	 *
	 * Note: truncation must also respect pattern constraints (unsigned, maxIntegerDigits,
	 * maxFractionDigits) — stop before violating any configured limit.
	 */
	private correctInsertOrReplacePart(changes: StringChange, context: HxContext): [string, number] {
		const {pattern, format} = this.getRules(context);

		const {prefix, suffix, deleted, inserted} = changes;
		const prefixWithWhitespaceStripped = StringUtils.stripWhitespace(prefix);
		const suffixWithWhitespaceStripped = StringUtils.stripWhitespace(suffix);
		const combined = prefixWithWhitespaceStripped + suffixWithWhitespaceStripped;
		// no prefix, no suffix, treated as insert
		const intermediateStates = new Set(['', '-', format.decimal, `-${format.decimal}`]);
		if (!intermediateStates.has(combined) && !this.isValidNumber(combined, format)) {
			// not a valid number before insertion,
			// or checked not intermediate state
			// insert anyway
			return [prefix + inserted + suffix, (prefix + inserted).length];
		}
		const hasMinusInSuffix = suffixWithWhitespaceStripped.indexOf('-') !== -1;
		if (hasMinusInSuffix) {
			// minus in suffix, reject all inserted
			return [prefix + deleted + suffix, -1];
		}

		const hasMinusInPrefix = prefixWithWhitespaceStripped.indexOf('-') !== -1;
		const hasDecimalPointInPrefix = prefixWithWhitespaceStripped.indexOf(format.decimal) !== -1;
		const hasDecimalPointInSuffix = suffixWithWhitespaceStripped.indexOf(format.decimal) !== -1;

		let allowDecimal = false;
		let allowMinus = false;

		if (hasDecimalPointInSuffix) {
			// decimal point in suffix, and no minus in suffix
			// allow minus when no minus in prefix
			allowMinus = !hasMinusInPrefix;
		} else if (hasDecimalPointInPrefix) {
			// only digits allowed
		} else if (hasMinusInPrefix) {
			// minus in prefix, no decimal point in prefix
			allowDecimal = true;
		} else {
			allowMinus = true;
			allowDecimal = true;
		}

		const legalCharsOfPrefix = this.legalChars(prefixWithWhitespaceStripped, format.decimal);
		const {
			integer: integerInPrefix, fraction: fractionInPrefix
		} = this.splitLegalChars(legalCharsOfPrefix, format.decimal);
		const legalCharsOfSuffix = this.legalChars(suffixWithWhitespaceStripped, format.decimal);
		let {
			integer: integerInSuffix, fraction: fractionInSuffix
		} = this.splitLegalChars(legalCharsOfSuffix, format.decimal);
		if (hasDecimalPointInPrefix) {
			fractionInSuffix = integerInSuffix;
			integerInSuffix = '';
		}

		let legalChars = this.legalCharsTillNot(inserted, allowDecimal, allowMinus && !pattern.unsigned, format);
		if (legalChars.length === 0) {
			// no legal chars in inserted. reject all
			return [prefix + deleted + suffix, -1];
		} else if (legalChars[0] === '-' && legalCharsOfPrefix.length !== 0) {
			// the first legal char of inserted is minus and there is content in prefix, reject all inserted
			return [prefix + deleted + suffix, -1];
		}

		// one more thing is checking the pattern about max digits limitation
		const hasMaxIntegerDigits = pattern.maxIntegerDigits != Infinity;
		const hasMaxFractionDigits = pattern.maxFractionDigits != Infinity;
		if (hasMaxIntegerDigits || hasMaxFractionDigits) {
			if (hasDecimalPointInSuffix && hasMaxIntegerDigits) {
				// decimal point in suffix, which means
				// - all of prefix are minus, digits or empty
				// - all of legal chars are minus (if prefix is empty), digits
				// which means legal chars cutting is needed only when has max integer digits limitation
				// allow a zero when max integer digits is 0
				const remainIntegerDigits = Math.max(pattern.maxIntegerDigits, 1) - integerInPrefix.length - integerInSuffix.length;
				if (remainIntegerDigits <= 0) {
					// no remaining integer digits, reject all inserted
					return [prefix + deleted + suffix, -1];
				} else if (pattern.maxIntegerDigits === 0) {
					// only zero is allowed, and current there is no integer digits in prefix or suffix
					// and decimal point is in suffix, which means all chars in inserted is minus or digits
					const {hasMinus, integer} = this.splitLegalChars(legalChars, format.decimal);
					let hasZero = false;
					for (const ch of integer) {
						if (ch === '0') {
							hasZero = true;
						} else {
							break;
						}
					}
					if (hasMinus && hasZero) {
						legalChars = '-0';
					} else if (hasZero) {
						legalChars = '0';
					} else {
						// not starts with 0, reject all inserted
						return [prefix + deleted + suffix, -1];
					}
				} else if (legalChars[0] === '-') {
					const [digits] = this.getHeadingDigits(legalChars.substring(1), remainIntegerDigits, this.isEmptyOrAllZeros(integerInPrefix));
					legalChars = '-' + digits;
				} else {
					const [digits] = this.getHeadingDigits(legalChars, remainIntegerDigits, this.isEmptyOrAllZeros(integerInPrefix));
					legalChars = digits;
				}
			} else if (hasDecimalPointInPrefix && hasMaxFractionDigits) {
				// decimal point in prefix, which means
				// - all of suffix part are digits or empty
				// - all of legal chars are digits
				// which means legal chars cutting is needed only when has max fraction digits limitation
				// no need to check integer digits anymore, since all chars in legal chars are digits and insert position is in fraction part
				const remainFractionDigits = pattern.maxFractionDigits - fractionInPrefix.length - fractionInSuffix.length;
				if (remainFractionDigits <= 0) {
					// no remaining fraction digits, reject all inserted
					return [prefix + deleted + suffix, -1];
				} else {
					legalChars = legalChars.substring(0, remainFractionDigits);
				}
			} else {
				// no decimal point in prefix and suffix,
				// which means
				// - if there is any char in prefix, they are minus or digit char,
				// - if there is any char in suffix, they are digit char.
				// eslint-disable-next-line prefer-const
				let {hasMinus, hasDecimalPoint, integer, fraction} = this.splitLegalChars(legalChars, format.decimal);
				if (hasDecimalPointInPrefix) {
					// decimal point in prefix, then all chars in inserted are fraction part
					// no minus, no decimal point in inserted
					fraction = integer;
					integer = '';
				} else if (hasDecimalPointInSuffix) {
					// all chars in inserted are integer part, do nothing
					// might have minus, no decimal point in inserted
				} else if (hasDecimalPoint) {
					// decimal point in inserted, then all chars in suffix are fraction part
					fractionInSuffix = integerInSuffix;
					integerInSuffix = '';
				} else {
					// no decimal point in any part, all chars are integer part
				}
				// handle the integer part
				let integerDropped = false;
				if (hasMaxIntegerDigits) {
					if (pattern.maxIntegerDigits === 0) {
						// only one zero is allowed in integer part
						if (hasMinus) {
							// inserted has minus, means no content in prefix
							if (integerInSuffix === '0') {
								// there is a zero in suffix, therefore no more integer digits allowed,
								// accept the minus only
								integerDropped = integer.length !== 0;
								integer = '';
							} else if (integerInSuffix.length === 0) {
								// no integer digits in suffix
								if (integer[0] === '0') {
									// the integer part starts with 0, accepts the minus and first 0
									integerDropped = integer.length !== 1;
									integer = '0';
								} else {
									// max integer digits is 0, only zero allowed
									// and the integer part not starts with 0, so the integer digits is now allowed,
									// accept the minus only
									integerDropped = integer.length !== 0;
									integer = '';
								}
							} else {
								// there is integer digits in suffix and is not zero, therefore no more integer digits allowed,
								// accept the minus only
								integerDropped = integer.length !== 0;
								integer = '';
							}
						} else if (integerInPrefix.length !== 0) {
							// there is digit in prefix already
							if (integer.length !== 0) {
								// if any digit in prefix and there is digit char in integer part of inserted
								// reject all inserted
								return [prefix + deleted + suffix, -1];
							}
							// otherwise there is no integer part in inserted, decimal point and fraction part will be handled later
						} else if (integerInSuffix.length !== 0) {
							// there is digit in suffix already, nothing allowed
							// reject all inserted
							return [prefix + deleted + suffix, -1];
						} else if (this.isEmptyOrAllZeros(integer)) {
							integerDropped = false;
							integer = '0';
						} else if (integer[0] === '0') {
							integerDropped = integer.length > 1;
							integer = '0';
						} else {
							// integer starts with non-zero digit char,
							// reject all inserted
							return [prefix + deleted + suffix, -1];
						}
					} else {
						const remainIntegerDigits = pattern.maxIntegerDigits - integerInPrefix.length - integerInSuffix.length;
						if (remainIntegerDigits <= 0) {
							if (integer.length !== 0) {
								// no remaining integer digits, reject all inserted
								return [prefix + deleted + suffix, -1];
							}
						} else {
							const [digits, dropped] = this.getHeadingDigits(integer, remainIntegerDigits, this.isEmptyOrAllZeros(integerInPrefix));
							integer = digits;
							integerDropped = dropped;
						}
					}
				}
				// handle the fraction part
				let allowDecimalPointInInserted = true;
				if (pattern.maxFractionDigits === 0) {
					allowDecimalPointInInserted = false;
					fraction = '';
				} else if (!integerDropped && fraction.length !== 0) {
					// Decimal point is in prefix or in inserted text.
					//
					// Even if suffix fraction already exceeds the limit, we keep the decimal point.
					// Removing it would turn suffix fraction digits into integer digits,
					// forcing a re-evaluation of integer digit limits — a cascading side effect.
					// Since either choice is intent inference, we allow the decimal point and discard
					// the inserted fraction.
					const remainFractionDigits = pattern.maxFractionDigits - fractionInPrefix.length - fractionInSuffix.length;
					if (remainFractionDigits <= 0) {
						fraction = '';
					} else {
						fraction = fraction.substring(0, remainFractionDigits);
					}
				} else {
					// since one of following fulfilled:
					// - has integer chars dropped, which means decimal point and fraction part are also dropped
					// - no fraction in inserted at all
					// do clear the fraction
					fraction = '';
				}

				if (!allowDecimalPointInInserted) {
					// fraction part not allowed
					legalChars = (hasMinus ? '-' : '') + integer;
				} else {
					legalChars = (hasMinus ? '-' : '') + integer + (hasDecimalPoint ? format.decimal : '') + fraction;
				}
			}
		}

		const formatted = this.format(legalCharsOfPrefix + legalChars + legalCharsOfSuffix, format, pattern.grouping);
		const legalCharsBeforeCaret = this.legalChars(prefix + legalChars, format.decimal);
		const index = this.computeCaretPositionOfFormatted(legalCharsBeforeCaret, formatted, format.grouping);
		return [formatted, index];
	}

	/**
	 * Handle a replace-all edit (e.g. paste over selected text).
	 *
	 * 1. Trim `inserted`. If the result is empty, the replacement is
	 *    ignored (return oldValue unchanged).
	 * 2. Extract the longest valid number prefix from `trimmed` via
	 *    `legalCharsTillNot`. If empty, the replacement is ignored.
	 * 3. Allow intermediate states: a lone `-`, a lone decimal point,
	 *    or `-` + decimal point (e.g. `-.`) are returned as-is without
	 *    formatting, so the next edit can continue building the number.
	 * 4. Apply pattern constraints on the integer part:
	 *    • `maxIntegerDigits === 0`: only `0` is allowed (a single
	 *      zero or all zeros). Non-zero digits are rejected; `0`
	 *      followed by non-zero digits is truncated to `0`.
	 *    • `maxIntegerDigits > 0`: leading zeros are stripped,
	 *      and the integer part is truncated to at most
	 *      `maxIntegerDigits` digits. If truncation occurs, the
	 *      decimal point and fraction part are also dropped.
	 * 5. Apply pattern constraints on the fraction part:
	 *    • `maxFractionDigits === 0`: fraction is dropped entirely
	 *      (together with the decimal point).
	 *    • Otherwise, the fraction is truncated to at most
	 *      `maxFractionDigits` digits.
	 * 6. Reassemble: `(minus) + integer + (decimal + fraction)`, with
	 *    integer defaulting to `0` if empty.
	 * 7. Format via `this.format` and return with caret at the end.
	 */
	private correctReplaceAll(oldValue: string, changes: StringChange, context: HxContext): [string, number] {
		const {pattern, format} = this.getRules(context);

		const {inserted} = changes;
		const trimmed = inserted.trim();
		if (trimmed.length === 0) {
			// replace with a blank string, ignore
			return [oldValue, -1];
		}

		// allowDecimal: only when maxFractionDigits > 0
		// allowMinus: only when not unsigned
		let legalChars = this.legalCharsTillNot(trimmed, pattern.maxFractionDigits > 0, !pattern.unsigned, format);
		if (legalChars.length === 0) {
			// no valid char, ignore the replacement
			return [oldValue, -1];
		} else if (legalChars === '-' || legalChars === format.decimal) {
			// only sign or decimal point, it might be an intermediate state, allowed
			return [legalChars, 1];
		} else if (legalChars.length === 2 && legalChars[0] === '-' && legalChars[1] === format.decimal) {
			// sign and decimal point, it might be an intermediate state, allowed
			return [legalChars, 2];
		}

		let tailWithDecimalPoint = false;
		const hasMaxIntegerDigits = pattern.maxIntegerDigits != Infinity;
		const hasMaxFractionDigits = pattern.maxFractionDigits != Infinity;
		if (hasMaxIntegerDigits || hasMaxFractionDigits) {
			// eslint-disable-next-line prefer-const
			let {hasMinus, hasDecimalPoint, integer, fraction} = this.splitLegalChars(legalChars, format.decimal);
			let integerDropped = false;
			if (hasMaxIntegerDigits && integer.length > 0) {
				if (pattern.maxIntegerDigits === 0) {
					// integer part can be all zeros or omitted.
					// when integer part is zero or omitted, no need to filter anymore
					if (integer !== '0') {
						let hasZero = false;
						for (const ch of integer) {
							if (ch === '0') {
								hasZero = true;
							} else if (hasZero) {
								// max integer digits is 0, which means the integer part must be 0
								// and current char is not 0 (1 - 9),
								// then drop from here, return directly, no need to continue;
								// the final chars could be '0' or '-0'
								return ['0', 1];
							} else {
								// not 0 (1 - 9) detected and no 0 detected yet, not allowed, return directly
								return [oldValue, -1];
							}
						}
						integer = '0';
					}
				} else {
					const [digits, dropped] = this.getHeadingDigits(integer, pattern.maxIntegerDigits, true);
					integer = digits;
					integerDropped = dropped;
				}
			}

			if (!integerDropped && pattern.maxFractionDigits !== 0 && fraction.length !== 0) {
				// no integer char dropped + allow fraction + fraction part has content
				if (hasMaxFractionDigits && fraction.length > pattern.maxFractionDigits) {
					// cutting fraction part when has max fraction digits limitation
					fraction = fraction.substring(0, pattern.maxFractionDigits);
				}
			} else {
				// since one of following fulfilled
				// - has integer chars dropped, which means decimal point and fraction part are also dropped
				// - max fraction digits is 0, which means fraction part is not allowed
				// - no fraction in inserted at all
				// do clear the fraction
				fraction = '';
			}
			// reassemble with integer defaulting to "0"
			legalChars = (hasMinus ? '-' : '') + (integer || '0') + (fraction.length !== 0 ? (format.decimal + fraction) : '');

			// when
			// - no integer dropped
			// - has decimal point in inserted
			// - allow fraction digits
			// - no fraction remained now
			// -> the final formatted string will be tailed with decimal point
			tailWithDecimalPoint = !integerDropped && hasDecimalPoint && pattern.maxFractionDigits !== 0 && fraction.length === 0;
		}

		let formatted = this.format(legalChars, format, pattern.grouping);
		if (tailWithDecimalPoint) {
			formatted = formatted + format.decimal;
		}
		return [formatted, formatted.length];
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

		const {grouping: groupingSeparator, decimal: decimalPoint} = NumberUtils.separators(this.getLocale(context));
		const [valid, str] = NumberUtils.stripFormatting(value, groupingSeparator, decimalPoint);
		if (valid) {
			const [is, normalized] = StringUtils.normalizeToNumber(str);
			if (is) {
				const num = Number(normalized);
				// Use NumberUtils.format instead of String(num) to avoid
				// scientific notation (e.g. 0.0000001 → "1e-7") and
				// locale-dependent decimal separators.
				const options: NumberFormatOptions = {locale: 'en', roundMode: 'trunc'};
				return NumberUtils.format(num, options) === normalized ? num : str;
			}
		}
		return value;
	}

	/**
	 * Convert a model value to a locale-formatted display string.
	 *
	 * <ul>
	 * <li>`null | undefined` — returns `(void 0)`.</li>
	 * <li>`number` — formats with {@link NumberUtils.format} (grouping and
	 *     decimal separator follow the active locale).</li>
	 * <li>`string` — validated via {@link StringUtils.normalizeToNumber}. Valid number strings
	 *     are formatted manually via {@link NumberUtils.formatManually} to preserve every digit
	 *     without IEEE 754 precision loss. Invalid strings are returned as-is.</li>
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
			const pattern = this.pattern;
			const options: NumberFormatOptions = {
				locale: this.getLocale(context),
				grouping: pattern.grouping,
				// set min fraction digits only when fraction digits fixed
				minFractionDigits: pattern.fixedFraction ? pattern.maxFractionDigits : (void 0),
				// here is no maxFractionDigits passed, since value in model might have more fraction digits,
				// never lost it
				roundMode: 'trunc'
			};
			return NumberUtils.format(value, options);
		} else if (typeOfValue === 'string') {
			const [is, , negative, integer, fraction] = StringUtils.normalizeToNumber(value);
			if (is) {
				const pattern = this.pattern;
				const options: NumberFormatOptions = {
					locale: this.getLocale(context),
					grouping: pattern.grouping,
					// set min fraction digits only when fraction digits fixed
					minFractionDigits: pattern.fixedFraction ? pattern.maxFractionDigits : (void 0),
					// here is no maxFractionDigits passed, since value in model might have more fraction digits,
					// never lost it
					roundMode: 'trunc'
				};
				// use manual formatting instead of Intl.NumberFormat to preserve every valid character exactly
				return NumberUtils.formatManually(negative, integer, fraction, options);
			} else {
				return value;
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
		const {pattern} = props;

		if (typeof pattern === 'string') {
			const parsed = HxFormatInputNumberPatternParser.parse(pattern);
			if (parsed === false) {
				return false;
			} else {
				return new HxFormatInputNumberPatternKit(parsed);
			}
		} else if (pattern.type === 'number') {
			return new HxFormatInputNumberPatternKit(pattern);
		} else {
			return false;
		}
	}
}
