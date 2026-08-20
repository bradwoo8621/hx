import {StringUtils} from '../../utils';
import {AbstractHxFormatInputPatternKit} from './abstract-format-input-kit';
import type {
	HxFormatInputChange,
	HxFormatInputDispatcherProps,
	HxFormatInputIntegerParsedPattern,
	HxFormatInputPatternKit,
	HxFormatInputPatternKits
} from './types';

/**
 * A normalized bound in the internal pattern: finite values are
 * `bigint` (any magnitude, no IEEE 754 loss); the only `number`
 * values are the unbounded `±Infinity`.
 */
type HxIntegerBound = bigint | number;

/**
 * Parser for `@i[l{low}][u{upper}][z]` pattern strings.
 *
 * Grammar, in fixed order:
 * - `l{low}` — lowest allowed value, may be negative (`l-5`)
 * - `u{upper}` — highest allowed value, may be negative (`u-10`; lacked = unbounded)
 * - `z` — zero-pad the display to the digit width of `upper` (last)
 *
 * At least one of `l` / `u` is required.
 *
 * @example
 * ```ts
 * HxFormatInputIntegerPatternParser.parse('@iu23z')
 * // => { type: 'integer', max: 23, padZero: true }
 *
 * HxFormatInputIntegerPatternParser.parse('@il-5u5')
 * // => { type: 'integer', min: -5, max: 5 }
 *
 * HxFormatInputIntegerPatternParser.parse('@i')
 * // => false (no bound specified)
 *
 * HxFormatInputIntegerPatternParser.parse('@ik23')
 * // => false (unknown letter)
 * ```
 */
export class HxFormatInputIntegerPatternParser {
	/**
	 * Read an optionally-signed run of digits starting at `pos`.
	 * Reads as `bigint` so bounds of any magnitude parse exactly —
	 * `number` would lose precision beyond `Number.MAX_SAFE_INTEGER`.
	 * @returns `[value, nextPos]` or `false` when no digits are found.
	 */
	private static readNumber(input: string, pos: number): [bigint, number] | false {
		let negative = false;
		if (input[pos] === '-') {
			negative = true;
			pos++;
		}
		const start = pos;
		while (pos < input.length) {
			const ch = input.charCodeAt(pos);
			if (ch < 48 || ch > 57) {
				break;
			}
			pos++;
		}
		if (pos === start) {
			return false;
		}
		const text = input.substring(start, pos);
		return [BigInt(negative ? '-' + text : text), pos];
	}

	/**
	 * Run the linear scan over the input.
	 * @returns The parsed configuration, or `false` if the pattern is invalid.
	 */
	static parse(input: string): HxFormatInputIntegerParsedPattern | false {
		if (typeof input !== 'string' || !input.startsWith('@i')) {
			return false;
		}

		const config: Omit<HxFormatInputIntegerParsedPattern, 'type'> = {};
		let pos = 2;
		let hasBound = false;
		let seenUpper = false;
		while (pos < input.length) {
			const ch = input[pos];
			if (ch === 'l') {
				if (seenUpper) {
					// fixed order: l comes before u
					return false;
				}
				const parsed = HxFormatInputIntegerPatternParser.readNumber(input, pos + 1);
				if (parsed === false) {
					return false;
				}
				config.min = parsed[0];
				hasBound = true;
				pos = parsed[1];
			} else if (ch === 'u') {
				const parsed = HxFormatInputIntegerPatternParser.readNumber(input, pos + 1);
				if (parsed === false) {
					return false;
				}
				config.max = parsed[0];
				hasBound = true;
				seenUpper = true;
				pos = parsed[1];
			} else if (ch === 'z') {
				// z must be last
				if (pos !== input.length - 1) {
					return false;
				}
				config.padZero = true;
				pos = input.length;
			} else {
				return false;
			}
		}
		if (!hasBound) {
			// at least one bound is required
			return false;
		}
		return {type: 'integer', ...config};
	}
}

/**
 * Pattern kit for integer-only input editing — digits (with an optional
 * leading minus when the domain includes negatives) bounded by `min` /
 * `max`, with an optional zero-padded display. Designed for small
 * bounded fields like the hour/minute/second inputs of a datetime
 * picker popup (e.g. `@iu23z` or `{max: 23, padZero: true}`).
 *
 * The invariant is: **the field never contains a value that cannot be
 * completed into `[min, max]`** — plus the intermediate states: empty,
 * a lone `-` when `min < 0`, and (in all-negative domains) negative
 * values above `max`, which typing more digits can still drive down
 * into the domain. Every other edit is rejected at keystroke level, so
 * no transient dead-end state is ever shown.
 *
 * ## Negative values
 *
 * Negative input is enabled by the domain itself: when `min < 0` a
 * leading minus becomes typable (a lone `-` is a valid intermediate
 * state, since typing `-5` needs two keystrokes); when `min >= 0` a
 * minus is rejected like any other illegal character. No extra option
 * is needed — the range defines the value domain.
 *
 * Negative values are asymmetric with positive ones: typing more
 * digits drives them *down*, so in an all-negative domain (e.g.
 * `[-100, -10]`) a value above `max` like `-5` is a valid intermediate
 * that may still complete as `-50`; a value below `min` (`-1000`) is a
 * dead end and is rejected. In mixed domains (`min < 0 <= max`) every
 * negative is already within bounds.
 *
 * ## Deletion
 *
 * Deletion is always accepted — removing digits can only shrink the
 * value or produce the empty intermediate state. The caret lands at the
 * deletion point (prefix length).
 *
 * | Example | Initial | Delete | Result | Caret |
 * |---------|---------|--------|--------|-------|
 * | last digit | `7` | `7` | `""` | 0 |
 * | first digit | `23` | `2` | `3` | 0 |
 * | middle digit | `132` | `3` | `12` | after 1 |
 * | delete all | `23` | `23` | `""` | 0 |
 * | minus | `-5` | `-` | `5` | 0 |
 * | digit keeps minus | `-5` | `5` | `-` | 1 |
 *
 * ## Insert / Replace-part
 *
 * One shared rule: the combined text `prefix + inserted + suffix` must
 * be empty, or digits-only with the parsed value within `[min, max]`.
 * Any other result rejects the whole edit (`[oldValue, -1]`, the input
 * restores the pre-change selection). When accepted, the caret lands
 * right after the inserted text.
 *
 * | Example | Pattern | Initial | Edit | Result |
 * |---------|---------|---------|------|--------|
 * | within max | `{max: 23}` | `2` | append `3` | `23` |
 * | overflow append | `{max: 23}` | `2` | append `5` | rejected |
 * | overflow insert | `{max: 23}` | `5` | insert `2` before `5` | rejected |
 * | leading zero | `{max: 23}` | `0` | append `7` | `07` |
 * | illegal char | `{max: 23}` | `2` | append `a` | rejected |
 * | below min | `{min: 5}` | — | type `3` | rejected |
 * | minus typing | `{min: -5}` | — | type `-` → `-`, type `5` → `-5` | `-5` |
 * | negative overflow | `{min: -5}` | `-` | append `6` | rejected |
 * | minus rejected | `{min: 5}` | — | type `-` | rejected |
 * | all-negative flow | `{min: -100, max: -10}` | `-` | append `5` → `-5` | `-5` (intermediate) |
 * | all-negative overflow | `{min: -100, max: -10}` | `-5` | append `0` → `-50` | `-50` |
 * | negative-only upper | `{max: -10}` | — | type `-5` → `-5`, `-50` → `-50` | `-50` |
 *
 * ## Replace-all
 *
 * The inserted text is truncated to its **longest valid prefix**
 * (empty, or digits with value within `[min, max]`). When no non-empty
 * prefix is valid the edit is rejected and the old value kept; an empty
 * insertion clears the field.
 *
 * | Example | Pattern | Initial | Paste | Result |
 * |---------|---------|---------|-------|--------|
 * | valid | `{max: 23}` | — | `7` | `7` |
 * | overflow | `{max: 23}` | — | `999` | `9` |
 * | leading zeros | `{max: 23}` | — | `007` | `007` |
 * | mixed garbage | `{max: 23}` | — | `1a2` | `1` |
 * | all illegal | `{max: 23}` | `5` | `abc` | unchanged |
 * | valid negative | `{min: -5}` | — | `-5` | `-5` |
 * | negative overflow | `{min: -5}` | — | `-6` | `-` |
 * | minus in middle | `{min: -5}` | — | `6-` | `6` |
 * | lone minus | `{min: -5}` | — | `-` | `-` |
 *
 * ## Display
 *
 * `padZero` is a display-only concern: {@link fromModel} zero-pads the
 * value to the digit width of `max` (e.g. `7` → `07` when `max = 23`),
 * and the input refreshes the display from the model on blur. The flag
 * is ignored for negative domains (`min < 0`) and unbounded `max`.
 * Typing is never padded or normalized by the kit — leading zeros typed
 * by the user are kept as-is.
 *
 * ## Precision
 *
 * All bound checks are string-based (see {@link compareMagnitude}), so
 * `min` / `max` of any magnitude compare exactly — no IEEE 754 loss in
 * the edit guards. The parser reads bounds as `bigint` and the kit
 * accepts `bigint` bounds in object patterns, so a bound beyond
 * `Number.MAX_SAFE_INTEGER` must be a `bigint` (or live in the pattern
 * string) — a `number` literal that large already lost precision.
 * {@link toModel} converts to `number` only when the round-trip is
 * lossless; values beyond `Number.MAX_SAFE_INTEGER` stay as strings in
 * the model to avoid precision damage.
 *
 * Model values outside `[min, max]` (or non-integer) are displayed
 * as-is: the model is the source of truth, the kit only guards edits.
 */
export class HxFormatInputIntegerPatternKit extends AbstractHxFormatInputPatternKit implements HxFormatInputPatternKits {
	/** Normalized pattern with defaults applied. */
	private readonly pattern: Readonly<
		Omit<Required<HxFormatInputIntegerParsedPattern>, 'min' | 'max'>
		& {min: HxIntegerBound; max: HxIntegerBound}
	>;

	/** Digit width for zero padding, `-1` when padding is not applicable. */
	private readonly padWidth: number;

	/**
	 * Digit-count upper bound of any valid value (including negative
	 * intermediate states), `Infinity` when the domain is unbounded on
	 * either side. Bounds the replace-all prefix scan.
	 */
	private readonly maxDigitCount: number;

	private _lambdaOfToModel: HxFormatInputPatternKit['toModel'] | undefined = (void 0);
	private _lambdaOfFromModel: HxFormatInputPatternKit['fromModel'] | undefined = (void 0);

	/**
	 * Sign check on a bound (`±Infinity` is a non-negative / negative
	 * number).
	 */
	private static isNegative(bound: HxIntegerBound): boolean {
		return typeof bound === 'bigint' ? bound < 0n : bound < 0;
	}

	/**
	 * Digit count of a bound, sign excluded.
	 */
	private static boundDigitsLength(bound: HxIntegerBound): number {
		if (typeof bound === 'bigint') {
			return (bound < 0n ? -bound : bound).toString().length;
		}
		return Math.abs(bound).toFixed(0).length;
	}

	/**
	 * Normalize a raw bound to the internal representation: finite
	 * values become `bigint` (any magnitude, no IEEE 754 loss;
	 * non-integer junk rounds like `toFixed(0)`), unbounded stays
	 * `±Infinity`.
	 */
	private static normalizeBound(value: number | bigint | undefined, fallback: HxIntegerBound): HxIntegerBound {
		if (value == null) {
			return fallback;
		}
		if (typeof value === 'bigint' || value === Infinity || value === -Infinity) {
			return value;
		}
		return BigInt(Math.round(value));
	}

	/**
	 * Defaults applied:
	 * - `min` → `0`; when `max` is negative and `min` is lacked,
	 *   `-Infinity` instead — a negative upper bound implies an
	 *   unbounded lower bound (e.g. `@iu-10` = the domain `(-∞, -10]`)
	 * - `max` → `Infinity` (when lacked)
	 * - `padZero` → `false`; the zero-padding digit width is derived
	 *   from `max` and only applicable when `min >= 0` and `max` is
	 *   finite (a negative domain or an unbounded `max` ignores the flag)
	 *
	 * @param pattern — integer pattern configuration; bound enforcement
	 *                  happens in {@link build} (a bare pattern without
	 *                  `min` / `max` downgrades there)
	 */
	private constructor(pattern: HxFormatInputIntegerParsedPattern) {
		super();
		const ptn = {
			type: 'integer' as const,
			min: HxFormatInputIntegerPatternKit.normalizeBound(
				pattern.min != null ? pattern.min
					: (pattern.max != null && HxFormatInputIntegerPatternKit.isNegative(pattern.max) ? -Infinity : 0),
				0n
			),
			max: HxFormatInputIntegerPatternKit.normalizeBound(pattern.max, Infinity),
			padZero: pattern.padZero ?? false
		};
		this.pattern = ptn;
		this.padWidth = (ptn.padZero && !HxFormatInputIntegerPatternKit.isNegative(ptn.min) && ptn.max !== Infinity)
			? HxFormatInputIntegerPatternKit.boundDigitsLength(ptn.max)
			: -1;
		this.maxDigitCount = (ptn.min === -Infinity || ptn.max === Infinity)
			? Infinity
			: Math.max(HxFormatInputIntegerPatternKit.boundDigitsLength(ptn.min), HxFormatInputIntegerPatternKit.boundDigitsLength(ptn.max));
	}

	lambdaOfToModel(): HxFormatInputPatternKit['toModel'] {
		if (this._lambdaOfToModel == null) {
			// eslint-disable-next-line @typescript-eslint/no-this-alias
			const that = this;
			this._lambdaOfToModel = (value) => that.toModel(value);
		}
		return this._lambdaOfToModel;
	}

	lambdaOfFromModel(): HxFormatInputPatternKit['fromModel'] {
		if (this._lambdaOfFromModel == null) {
			// eslint-disable-next-line @typescript-eslint/no-this-alias
			const that = this;
			this._lambdaOfFromModel = (value) => that.fromModel(value);
		}
		return this._lambdaOfFromModel;
	}

	/**
	 * Decimal digit expansion of an integer value, immune to scientific
	 * notation: both `toString` and `toFixed` switch to exponent form
	 * at `1e21`, while `BigInt` always expands.
	 */
	private decimalDigits(value: number): string {
		const abs = Math.abs(value);
		if (Number.isInteger(abs) && abs >= 1e21) {
			return BigInt(abs).toString();
		}
		return abs.toFixed(0);
	}

	/**
	 * Compare the magnitude of `digits` (a digit-only string, leading
	 * zeros allowed) with the absolute value of a normalized `bound` —
	 * a pure string comparison, immune to IEEE 754 precision loss for
	 * arbitrarily large bounds (for equal-length digit strings,
	 * lexicographic order equals numeric order). An unbounded bound
	 * compares greater than any finite magnitude.
	 */
	private compareMagnitude(digits: string, bound: HxIntegerBound): -1 | 0 | 1 {
		if (bound === Infinity || bound === -Infinity) {
			// any finite magnitude is below an unbounded bound
			return -1;
		}
		const trimmed = StringUtils.trimStart(digits, '0');
		if (trimmed.length === 0) {
			// all-zero digits → 0
			return (typeof bound === 'bigint' ? bound === 0n : bound === 0) ? 0 : -1;
		}
		const boundText = typeof bound === 'bigint'
			? (bound < 0n ? -bound : bound).toString()
			: this.decimalDigits(bound);
		if (trimmed.length !== boundText.length) {
			return trimmed.length < boundText.length ? -1 : 1;
		}
		return trimmed < boundText ? -1 : (trimmed > boundText ? 1 : 0);
	}

	/**
	 * Check whether `text` may be displayed: empty, or digits (with an
	 * optional leading minus when the domain includes negatives, i.e.
	 * `min < 0`) with the parsed value within `[min, max]`.
	 *
	 * Negative values are asymmetric with positive ones: typing more
	 * digits drives a negative value *down* (toward `-∞`), so a value
	 * above `max` may still be completed into the domain — such values
	 * are allowed as intermediate states in all-negative domains
	 * (e.g. `-5` for `[-100, -10]`, completing as `-50`). A value below
	 * `min` can never come back up and is always rejected.
	 *
	 * All bound checks go through {@link compareMagnitude} — string
	 * based, so `min` / `max` of any magnitude compare exactly.
	 */
	private isValidInteger(text: string): boolean {
		if (text.length === 0) {
			// empty is a valid intermediate state
			return true;
		}
		let negative = false;
		let digits = text;
		if (text[0] === '-') {
			if (!HxFormatInputIntegerPatternKit.isNegative(this.pattern.min)) {
				// negative values are only enabled when the domain includes them
				return false;
			}
			negative = true;
			digits = text.substring(1);
			if (digits.length === 0) {
				// lone "-" is a valid intermediate state (typing "-5" needs two steps)
				return true;
			}
		}
		for (let i = 0; i < digits.length; i++) {
			const ch = digits.charCodeAt(i);
			if (ch < 48 || ch > 57) {
				// not a digit
				return false;
			}
		}
		if (negative) {
			// the floor is the only hard bound for negatives; values above
			// max are intermediates that may still complete into the domain
			// (value >= min ⇔ |value| <= |min| for two negative numbers)
			return this.compareMagnitude(digits, this.pattern.min) <= 0;
		}
		if (HxFormatInputIntegerPatternKit.isNegative(this.pattern.max)) {
			// non-negative values always exceed a negative max
			return false;
		}
		const aboveMin = this.pattern.min === -Infinity
			|| this.compareMagnitude(digits, this.pattern.min) >= 0;
		return aboveMin && this.compareMagnitude(digits, this.pattern.max) <= 0;
	}

	/**
	 * Deletion is always accepted (see class docs), caret at the
	 * deletion point.
	 */
	protected correctDelete(change: HxFormatInputChange): [string, number] {
		const combined = change.prefix + change.suffix;
		return [combined, change.prefix.length];
	}

	/**
	 * Insert / replace-part share one rule: accept only when the
	 * combined text is a valid integer (see class docs), caret after the
	 * inserted text. Rejected edits restore the old value and leave the
	 * caret untouched (`-1`).
	 */
	private correctInsertOrReplacePart(change: HxFormatInputChange): [string, number] {
		const combined = change.prefix + change.inserted + change.suffix;
		if (!this.isValidInteger(combined)) {
			return [change.oldValue, -1];
		}
		return [combined, change.prefix.length + change.inserted.length];
	}

	protected correctInsert(change: HxFormatInputChange): [string, number] {
		return this.correctInsertOrReplacePart(change);
	}

	protected correctReplacePart(change: HxFormatInputChange): [string, number] {
		return this.correctInsertOrReplacePart(change);
	}

	/**
	 * Replace-all truncates to the longest valid prefix (see class
	 * docs); all-illegal insertions keep the old value, an empty
	 * insertion clears the field.
	 *
	 * The scan starts at the sign plus the domain's digit-count upper
	 * bound (see {@link maxDigitCount}) instead of the full inserted
	 * length — any longer prefix is necessarily invalid. Unbounded
	 * domains fall back to the full inserted length.
	 */
	protected correctReplaceAll(change: HxFormatInputChange): [string, number] {
		const {inserted} = change;
		if (inserted.length === 0) {
			// empty insertion clears the field
			return ['', 0];
		}
		const sign = inserted[0] === '-' ? 1 : 0;
		const maxLen = this.maxDigitCount;
		const limit = maxLen === Infinity ? inserted.length : Math.min(inserted.length, sign + maxLen);
		for (let i = limit; i > 0; i--) {
			const candidate = inserted.substring(0, i);
			if (this.isValidInteger(candidate)) {
				return [candidate, candidate.length];
			}
		}
		// no non-empty valid prefix, keep the old value
		return [change.oldValue, -1];
	}

	/**
	 * Canonical text of a valid integer: optional minus, no leading
	 * zeros. `"007"` → `"7"`, `"-005"` → `"-5"`, `"000"` and `"-0"`
	 * → `"0"`.
	 */
	private normalizeNumberText(text: string): string {
		const negative = text[0] === '-';
		const digits = negative ? text.substring(1) : text;
		const trimmed = StringUtils.trimStart(digits, '0');
		if (trimmed.length === 0) {
			// all zeros (including -0) normalize to 0
			return '0';
		}
		return (negative ? '-' : '') + trimmed;
	}

	/**
	 * Convert a display string to a model value.
	 *
	 * - `null`, `undefined`, empty or the lone `-` intermediate
	 *   state → `(void 0)`
	 * - valid integer text → its numeric value when the conversion is
	 *   lossless (correction guarantees only valid text reaches here);
	 *   negative zero is normalized to `0` to keep model comparisons
	 *   stable. Values beyond `Number.MAX_SAFE_INTEGER` would lose
	 *   precision through `Number()`, so they are kept as strings —
	 *   mirroring the number kit's precision guard
	 * - anything else → returned unchanged
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toModel(value: string | null | undefined): any | null | undefined {
		if (value == null || value === '' || value === '-') {
			return (void 0);
		}
		if (this.isValidInteger(value)) {
			const num = Number(value);
			if (this.decimalDigits(num) === this.normalizeNumberText(value)) {
				// lossless conversion (leading zeros stripped on both sides)
				return num === 0 ? 0 : num;
			}
			// IEEE 754 precision loss — keep the exact string
			return value;
		}
		return value;
	}

	/**
	 * Convert a model value to a display string.
	 *
	 * - `null` / `undefined` → `(void 0)`
	 * - `number` / `string` → zero-padded to `width` when the value is a
	 *   valid integer (negative values pad the digit part, so the total
	 *   width includes the sign, e.g. `-5` → `-05` for `width: 3`);
	 *   out-of-range or non-digit values are displayed as-is (the model
	 *   is the source of truth, the kit only guards edits)
	 * - other types → stringified via `asStr`
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fromModel(value: any | null | undefined): string | null | undefined {
		if (value == null) {
			return (void 0);
		}
		const typeOfValue = typeof value;
		if (typeOfValue === 'number' || typeOfValue === 'string') {
			const text = String(value);
			if (this.isValidInteger(text)) {
				const padWidth = this.padWidth;
				return padWidth > 0 ? text.padStart(padWidth, '0') : text;
			}
			return text;
		}
		// Other types → stringify and return.
		return StringUtils.asStr(value);
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * called at {@link HxFormatInputPatternKitsInner.build}
	 */
	static build<T extends object>(props: HxFormatInputDispatcherProps<T>): [HxFormatInputIntegerPatternKit, Omit<HxFormatInputDispatcherProps<T>, 'pattern'>] | false {
		const {pattern, ...rest} = props;

		if (typeof pattern === 'string') {
			const parsed = HxFormatInputIntegerPatternParser.parse(pattern);
			if (parsed === false) {
				return false;
			} else {
				return [new HxFormatInputIntegerPatternKit(parsed), rest];
			}
		} else if (typeof pattern === 'object' && pattern != null && pattern.type === 'integer') {
			if (pattern.min == null && pattern.max == null) {
				// no bound specified, downgrade like an invalid pattern
				return false;
			}
			return [new HxFormatInputIntegerPatternKit(pattern), rest];
		} else {
			return false;
		}
	}
}
