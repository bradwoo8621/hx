import type {InputHTMLAttributes} from 'react';
import type {HxContext} from '../../contexts';
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