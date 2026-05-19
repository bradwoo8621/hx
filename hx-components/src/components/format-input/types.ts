import {type InputHTMLAttributes} from 'react';
import type {HxHtmlElementProps} from '../../types';
import type {HxExtInputInnerProps, OmittedInputHTMLProps} from '../input';
import type {HxFormatInputNumberParsedPattern, HxFormatInputNumberPattern} from './format-input-number-pattern';

export type HxFormatInputParsedPattern =
	| HxFormatInputNumberParsedPattern;
export type HxFormatInputPattern =
	| HxFormatInputNumberPattern
	| HxFormatInputParsedPattern;

export interface HxExtFormatInputInnerProps<T extends object> extends Omit<HxExtInputInnerProps<T>, 'type'> {
	pattern: HxFormatInputParsedPattern;
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
