import {type InputHTMLAttributes} from 'react';
import type {HxContext} from '../../contexts';
import type {HxDateTimeValue, HxDateTimeRelatedFormat, HxHtmlElementProps} from '../../types';
import type {HxExtInputInnerProps, OmittedInputHTMLProps} from '../input';

export interface HxFormatInputParsedPattern {
	// type of pattern, unique
	type: string;
}

/**
 * Parsed configuration from a number format pattern string.
 *
 * Pattern grammar: @n[u][g][d{N}][f{N}[x]][e]
 * - @n    prefix (number type)
 * - u     unsigned, disallow negative sign
 * - g     thousands grouping (e.g. 1,234,567)
 * - d{N}  max integer digits. 0 means integer part can be "0" only.
 * - f{N}  max fraction digits
 * - f{N}x max fraction digits, fixed display (zero-padded to exactly N places)
 * - e     force use en formatting
 */
export interface HxFormatInputNumberParsedPattern extends HxFormatInputParsedPattern {
	type: 'number';
	/** Unsigned — no negative sign allowed (lacked = false) */
	unsigned?: boolean;
	/** Whether to insert thousands grouping separators (lacked = false) */
	grouping?: boolean;
	/** Max integer digits (negative or lacked = no restriction, zero means integer part can be "0" only) */
	maxIntegerDigits?: number;
	/** Max fraction digits (negative or lacked = no restriction) */
	maxFractionDigits?: number;
	/** Fixed display: always pad/truncate to exactly maxFractionDigits decimal places (lacked = false) */
	fixedFraction?: boolean;
	/** force use format of en, default false */
	forceEn?: boolean;
}

/**
 * Valid number format pattern.
 *
 * Grammar: @n[u][g][d{N}][f{N}[x]][e]
 * Each branch ensures x only appears with f{N}.
 *
 * - u: unsigned
 * - g: grouping
 * - d{N}: max integer digits. 0 represents only a 0 is allowed.
 * - f{N}: max fraction digits.
 * - x: fix fraction digits as f{N} represents, 0 end padding.
 * - e: force use en as locale
 */
export type HxFormatInputNumberPattern = `@n${string}`;

/**
 * Parsed datetime format pattern.
 *
 * Each date/time component has a numeric display order (0-based, sequential).
 * All present orders must be unique and contiguous starting from 0.
 * Lacked or negative to omit a component.
 *
 * Digit width: year = 4, all others (month/day/hour/minute/second) = 2.
 */
export interface HxFormatInputDateTimeParsedPattern extends HxFormatInputParsedPattern {
	type: 'datetime';
	/** 0-based display order; lacked or <0 = omitted */
	year?: number;
	/** 0-based display order; lacked or <0 = omitted */
	month?: number;
	/** 0-based display order; lacked or <0 = omitted */
	day?: number;
	/** 0-based display order; lacked or <0 = omitted */
	hour?: number;
	/** 0-based display order; lacked or <0 = omitted */
	minute?: number;
	/** 0-based display order; lacked or <0 = omitted */
	second?: number;
	/** Space between date and time parts; false or lacked = compact */
	groupSeparator?: boolean;
	/** `-` or `/` between date components; blank or lacked = compact */
	dateSeparator?: string;
	/** `:` between time components; blank or lacked = compact */
	timeSeparator?: string;
}

/**
 * Grammar: @d(<[-|/]ymd>|<[:]hns>|<[-|/]ymd><[ ][:]hns>)
 * Notation:
 *   [-|/]  optional separator `-` or `/` for <ymd>; omitted = no separator
 *   [:]    hns separator `:`; omitted = no separator
 *   [ ]    optional space between <ymd> and <hns>
 * - y, m, d = year, month, day; any order
 *   valid: y, m, d, ym, md, ymd (any permutation); yd not allowed
 * - h, n, s = hour, minute, second; strict sequence
 *   n = minute (not month); valid: h, hn, hns, n, ns; hs, s not allowed
 * - <hns> with h (hour) present:
 *   - <ymd> present: ymd must include d (day)
 *   - no ymd
 * - <hns> without h (hour) present: no ymd
 */
export type HxFormatInputDateTimePattern = `@d${string}`;

export interface HxFormatInputChange {
	/** text before change */
	readonly oldValue: string;
	/** text after change */
	readonly newValue: string;
	/** is backspace pressed */
	readonly isBackspace: boolean;
	/** Common unchanged text before the change (empty for replace-all) */
	readonly prefix: string;
	/** Common unchanged text after the change (empty for replace-all) */
	readonly suffix: string;
	/** Characters removed from oldValue at the change point */
	readonly deleted: string;
	/** Characters added to newValue at the change point */
	readonly inserted: string;
	/**
	 * The kind of change detected:
	 * - `none`         — no change, old and new values are identical
	 * - `insert`       — new characters added, nothing removed
	 * - `delete`       — characters removed, nothing added
	 * - `replace-part` — characters removed and added, with shared context before/after
	 * - `replace-all`  — entire value replaced, no shared prefix or suffix
	 */
	readonly type: 'none' | 'insert' | 'delete' | 'replace-part' | 'replace-all';
}

export interface HxFormatInputPatternKit {
	/**
	 * Computes the corrected display text and caret position from a value change.
	 *
	 * @param change - input change
	 * @param context - context
	 * @returns a tuple of `[correctedText, caretPosition]`, where
	 *          - `correctedText` is the formatted string to display
	 *          - `caretPosition` is the index to place the cursor after correction,
	 *             -1 represents don't change the caret position.
	 */
	correct(change: HxFormatInputChange, context: HxContext): [string, number];
	/**
	 * try to convert given display value to model value
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toModel(value: string | null | undefined, context: HxContext): any | null | undefined;
	/**
	 * convert given model value to display value
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fromModel(value: any | null | undefined, context: HxContext): string | null | undefined;
}

export interface HxFormatInputPatternKits extends HxFormatInputPatternKit {
	lambdaOfToModel(): HxFormatInputPatternKit['toModel'];
	lambdaOfFromModel(): HxFormatInputPatternKit['fromModel'];
}

export interface HxExtFormatInputInnerProps<T extends object> extends Omit<HxExtInputInnerProps<T>, 'type'> {
	kit: HxFormatInputPatternKits;
}

export type OmittedFormatInputHTMLProps = OmittedInputHTMLProps;

export type HxFormatInputInnerProps<T extends object> =
	& HxExtFormatInputInnerProps<T>
	& HxHtmlElementProps<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>, OmittedFormatInputHTMLProps, T>;

/**
 * Grammar: [y{N}][m{N}][d{N}][h{N}][n{N}][s{N}]
 * Each optional part specifies a default value for the corresponding component.
 * N range (inclusive): minimum 0; maximum bounded by digit width and logical limit:
 *   y: 0–9999, m: 0–12, d: 0–31, h: 0–23, n: 0–59, s: 0–59
 * Values outside range are not rejected:
 *  - negative becomes 0,
 *  - above-maximum is truncated to fit the component's digit width
 * The part char [ymdhns], is case-insensitive.
 */
export type HxDateTimeDefaultValuesInStr = string;

export interface HxFormatInputDateTimeOptions {
	/**
	 * works when pattern is datetime, follow dayjs format
	 */
	valueFormat?: HxDateTimeRelatedFormat;
	/**
	 * provides default values for missing date/time parts
	 * when the given pattern lacks parts required by {@link valueFormat}
	 */
	defaultValue?: HxDateTimeDefaultValuesInStr | HxDateTimeValue;
	/**
	 * show underscore placeholder when the value is empty.
	 * When `true`, displays character-level placeholders (underscore) for
	 * each component even when the model value is null/undefined/blank.
	 * Keep `false` to allow the HTML input placeholder to appear instead.
	 * Default `false`.
	 */
	charPlaceholderOnEmpty?: boolean;
}

export interface HxFormatInputDispatcherDateTimeProps {
	pattern: HxFormatInputDateTimePattern | HxFormatInputDateTimeParsedPattern;
	options?: HxFormatInputDateTimeOptions;
}

export interface HxFormatInputDispatcherNumberProps {
	pattern: HxFormatInputNumberPattern | HxFormatInputNumberParsedPattern;
}

export type HxExtFormatInputDispatcherProps<T extends object> =
	& Omit<HxExtInputInnerProps<T>, 'type'>
	& (
	| HxFormatInputDispatcherNumberProps
	| HxFormatInputDispatcherDateTimeProps
	);

export type HxFormatInputDispatcherProps<T extends object> =
	& HxExtFormatInputDispatcherProps<T>
	& HxHtmlElementProps<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>, OmittedFormatInputHTMLProps, T>;
