import type {InputHTMLAttributes} from 'react';
import type {
	HxEditSingleFieldProps,
	HxHtmlElementProps,
	HxOmittedAttributes,
	HxWidthConstrainedProps,
	ReadonlyProps
} from '../../types';

export interface HxExtInputInnerProps<T extends object>
	extends HxEditSingleFieldProps<T>, ReadonlyProps<T>, HxWidthConstrainedProps {
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
}

export type OmittedInputHTMLProps =
	| HxOmittedAttributes
	| 'disabled' | 'type' | 'value' | 'placeholder'
	// validation attributes
	| 'minLength' | 'maxLength' | 'required' | 'multiple' | 'pattern' | 'size'
	| 'height' | 'width'
	| 'readOnly' | 'checked'
	| 'children';

export type HxInputInnerProps<T extends object> =
	& HxExtInputInnerProps<T>
	& HxHtmlElementProps<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>, OmittedInputHTMLProps, T>;