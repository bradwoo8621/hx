import type {InputHTMLAttributes} from 'react';
import type {HxContext} from '../../contexts';
import type {
	HxCommonProps,
	HxEditSingleFieldProps,
	HxHtmlElementProps,
	HxOmittedAtomicAttributes,
	HxOmittedDataAttributes,
	ReadonlyProps
} from '../../types';
import type {HxInputBoxProps} from '../input-box';

export type ExcludedInputDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-input';

export interface HxExtInputInnerProps<T extends object>
	extends HxEditSingleFieldProps<T>, ReadonlyProps<T>, HxCommonProps<ExcludedInputDataAttrNames, T> {
	/**
	 * rewrite the value of type attribute of HTML input, only 'text' and 'password' are supported
	 */
	type?: 'text' | 'password';
	/**
	 * select all text on focus
	 */
	selectAll?: boolean;
	/**
	 * When true, updates the model value only when input loses focus or Enter key is pressed.
	 * When false, updates model after emitChangeDelay milliseconds of inactivity.
	 */
	emitChangeOnBlur?: boolean;
	/**
	 * Delay in milliseconds before committing value to model when emitChangeOnBlur is false.
	 * Negative values will be clamped to 0.
	 */
	emitChangeDelay?: number;
	/**
	 * try to convert given display value to model value
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toModel?: (value: string | null | undefined, context: HxContext) => any | null | undefined;
	/**
	 * convert given model value to display value
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fromModel?: (value: any | null | undefined, context: HxContext) => string | null | undefined;
}

export type OmittedInputHTMLProps =
	| HxOmittedAtomicAttributes
	| 'disabled' | 'type' | 'value' | 'placeholder'
	// validation attributes
	| 'minLength' | 'maxLength' | 'required' | 'min' | 'max' | 'multiple' | 'pattern' | 'size' | 'step'
	| 'height' | 'width'
	| 'readOnly' | 'checked';

export type HxInputInnerProps<T extends object> =
	& HxExtInputInnerProps<T>
	& HxHtmlElementProps<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>, OmittedInputHTMLProps, T>;

export type HxInputProps<T extends object> = HxInputBoxProps<T, HxInputInnerProps<T>>;
