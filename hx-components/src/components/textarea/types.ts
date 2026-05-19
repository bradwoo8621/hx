import type {HTMLAttributes, ReactNode, TextareaHTMLAttributes} from 'react';
import type {
	HtmlElementProps,
	HxDirection,
	HxEditSingleFieldProps,
	HxHtmlElementProps,
	HxOmittedAttributes,
	HxWidthConstrainedProps,
	HxWrappedReactEvents,
	ReadonlyProps
} from '../../types';
import type {HxWithCheckCreateOptions, HxWithCheckProps} from '../with-check';

/**
 * Textarea resize behavior options
 * - none: no resize allowed (default)
 * - horizontal: allow horizontal resize only
 * - vertical: allow vertical resize only
 * - both: allow both horizontal and vertical resize
 */
export type HxTextareaResize = 'none' | 'both' | HxDirection;
/**
 * HTML attributes that are omitted from base props to avoid conflicts
 * These properties are controlled directly by the component and should not be passed directly
 */
export type OmittedTextareaHTMLProps =
	| HxOmittedAttributes
	| 'disabled' | 'value' | 'placeholder'
	// validation attributes
	| 'minLength' | 'maxLength' | 'required'
	| 'rows' | 'cols' | 'wrap'
	| 'readOnly'
	| 'children';

/**
 * Extended props for HxTextarea component
 * Includes all standard form field props plus textarea-specific configuration
 */
export interface HxExtTextareaInnerProps<T extends object>
	extends HxEditSingleFieldProps<T>, ReadonlyProps<T>, HxWidthConstrainedProps {
	/** Whether to automatically select all text when textarea receives focus */
	selectAll?: boolean;
	/** Resize behavior control - determines if and how user can resize the textarea */
	resize?: HxTextareaResize;
	placeholder?: ReactNode;
	/** Number of visible text rows (minimum 2, default from global settings) */
	rows?: number;
	/**
	 * Auto height according to input text.
	 * Specify a max rows if a number is given.
	 */
	autoRows?: boolean | number;
	/** Whether to show the remain/max char count */
	charLimit?: number;
	/**
	 * When true, updates the model value only when textarea loses focus or Enter key is pressed.
	 * When false, updates model after emitChangeDelay milliseconds of inactivity.
	 */
	emitChangeOnBlur?: boolean;
	/**
	 * Delay in milliseconds before committing value to model when emitChangeOnBlur is false.
	 * Negative values will be clamped to 0.
	 */
	emitChangeDelay?: number;
	/** Additional HTML attributes to apply to the box div element */
	$domBox?: HxWrappedReactEvents<HtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>>, T>;
}

export type HxTextareaBaseInnerProps<T extends object> =
	& HxExtTextareaInnerProps<T>
	& HxHtmlElementProps<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>, OmittedTextareaHTMLProps, T>;
export type HxTextareaInnerProps<T extends object> =
	& HxWithCheckProps<T, HxTextareaBaseInnerProps<T>>
	& HxWithCheckCreateOptions<T, HxTextareaBaseInnerProps<T>>
	& { $withCheck: boolean }