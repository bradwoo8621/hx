import {type InputHTMLAttributes} from 'react';
import type {HxContext} from '../../contexts';
import type {HxHtmlElementProps} from '../../types';
import type {HxExtInputInnerProps, OmittedInputHTMLProps} from '../input';

export interface HxFormatInputParsedPattern {
	type: 'number';
}

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
export interface HxFormatInputNumberParsedPattern extends HxFormatInputParsedPattern {
	type: 'number';
	/** Unsigned — no negative sign allowed (lacked = false) */
	unsigned?: boolean;
	/** Whether to insert thousands grouping separators (lacked = false) */
	grouping?: boolean;
	/** Max integer digits (negative, zero or lacked = no restriction) */
	maxIntegerDigits?: number;
	/** Max fraction digits (negative or lacked = no restriction) */
	maxFractionDigits?: number;
	/** Fixed display: always pad/truncate to exactly maxFractionDigits decimal places (lacked = false) */
	fixedFraction?: boolean;
}

/**
 * Valid number format pattern.
 *
 * Grammar: @n[u][g][d{N}][f{N}[x]]
 * Each branch ensures x only appears with f{N}.
 */
export type HxFormatInputNumberPattern = `@n${string}`;

export type HxFormatInputStrPatterns =
	| HxFormatInputNumberPattern;
export type HxFormatInputParsedPatterns =
	| HxFormatInputNumberParsedPattern;
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
	 * convert given display value to model value
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toModel(value: string | null | undefined, context: HxContext): any | null | undefined;
	/**
	 * convert given model value to display value
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fromModel(value: any | null | undefined, context: HxContext): string | null | undefined;
}

export interface HxExtFormatInputInnerProps<T extends object> extends Omit<HxExtInputInnerProps<T>, 'type'> {
	kit: HxFormatInputPatternKit;
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
