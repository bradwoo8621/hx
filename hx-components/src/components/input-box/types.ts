import {type HTMLAttributes, type ReactNode} from 'react';
import type {HxEditSingleFieldProps, HxHtmlElementProps, HxOmittedAttributes, ReadonlyProps} from '../../types';

// noinspection JSUnusedGlobalSymbols
export type ExcludedInputBoxDataAttrNames = 'data-hx-input-box';

export interface HxExtWrappedInputProps<T extends object> extends HxEditSingleFieldProps<T>, ReadonlyProps<T> {
}

export type HxExtInputBoxProps<T extends object, P extends HxExtWrappedInputProps<T>> = P & {
	prefix?: Array<ReactNode>;
	placeholder?: ReactNode;
	suffix?: Array<ReactNode>;
	/** Additional HTML attributes to apply to the wrapper div element */
	$domInputBox?: HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, HxOmittedAttributes, T>;
}

/**
 * `Omit<HxExtInputBoxProps<T, P>, ExcludedInputBoxDataAttrNames>` cannot be used here: the props
 * type is an intersection of generic mapped types, so `Omit` has to resolve its whole key union,
 * and every site referring to this type then fails with "TS2590: Expression produces a union type
 * that is too complex to represent" — WebStorm reports it on
 * `HxInputBoxProps<T, HxFormatInputDispatcherProps<T>>`, for instance. Spelling the member out as
 * a computed key, `{[key: ExcludedInputBoxDataAttrNames]: undefined}`, does not work either.
 *
 * Intersecting with one optional key instead keeps the type cheap to resolve, and still leaves
 * `data-hx-input-box` with no usable prop value.
 */
export type HxInputBoxProps<T extends object, P extends HxExtWrappedInputProps<T>> = HxExtInputBoxProps<T, P> & {
	'data-hx-input-box'?: undefined
};
