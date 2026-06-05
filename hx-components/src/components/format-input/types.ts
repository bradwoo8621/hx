import {type InputHTMLAttributes} from 'react';
import type {HxContext} from '../../contexts';
import type {HxHtmlElementProps} from '../../types';
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
	/** Space between date and time parts; lacked = compact */
	groupSeparator?: string;
	/** `-` or `/` between date components; lacked = compact */
	dateSeparator?: string;
	/** `:` between time components; lacked = compact */
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
 *   n = minute (not month); valid: h, hn, hns, ns
 * - <hns> with <ymd> present: ymd must include d (day)
 * - <hns> without h (hour) present: no ymd
 */
export type HxFormatInputDateTimePattern = `@d${string}`;

export type HxFormatInputStrPatterns =
	| HxFormatInputNumberPattern
	| HxFormatInputDateTimePattern;
export type HxFormatInputParsedPatterns =
	| HxFormatInputNumberParsedPattern
	| HxFormatInputDateTimeParsedPattern;
export type HxFormatInputPattern =
	| HxFormatInputStrPatterns
	| HxFormatInputParsedPatterns;

export interface HxFormatInputPatternKit {
	getPattern(): HxFormatInputParsedPattern;
	/**
	 * Computes the corrected display text and caret position from a value change.
	 *
	 * @param oldValue - the previous display value before the change
	 * @param newValue - the new display value after the change
	 * @param isBackspace - current change led by backspace or not
	 * @param context - context
	 * @returns a tuple of `[correctedText, caretPosition]` where `correctedText`
	 *          is the formatted string to display and `caretPosition` is the
	 *          index to place the cursor after correction, -1 represents don't change the caret position
	 */
	correct(oldValue: string, newValue: string, isBackspace: boolean, context: HxContext): [string, number];
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

export interface HxExtFormatInputDispatcherProps<T extends object> extends Omit<HxExtInputInnerProps<T>, 'type'> {
	pattern: HxFormatInputPattern;
}

export type HxFormatInputDispatcherProps<T extends object> =
	& HxExtFormatInputDispatcherProps<T>
	& HxHtmlElementProps<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>, OmittedFormatInputHTMLProps, T>;
