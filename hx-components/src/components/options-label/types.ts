import type {HTMLAttributes, ReactNode} from 'react';
import type {
	HxCommonProps,
	HxEditSingleFieldProps,
	HxHtmlElementProps,
	HxOmittedAtomicAttributes,
	HxOmittedDataAttributes,
	WithRequired
} from '../../types';
import type {HxSelectOptionsProps} from '../select-options';

export type ExcludedOptionsLabelDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-options-label' | 'data-hx-options-label-state' | 'data-hx-options-label-value';

/**
 * Extended select component props
 * @template T - Type of the form model object
 */
export interface HxExtOptionsLabelProps<T extends object>
	extends WithRequired<HxSelectOptionsProps<T>, '$model'>, HxEditSingleFieldProps<T>, HxCommonProps<ExcludedOptionsLabelDataAttrNames, T> {
	/** i18n translation key or React node for options loading state text */
	optionsOnLoadKey?: ReactNode;
	/** i18n translation key or React node for empty options state text */
	noOptionsKey?: ReactNode;
	/** i18n translation key or React node for option not found state text */
	optionNotFoundKey?: ReactNode;
}

/**
 * HTML props that are omitted from options label component props
 */
export type OmittedOptionsLabelHTMLProps = HxOmittedAtomicAttributes;

/**
 * Full options label component props including HTML attributes
 * @template T - Type of the form model object
 */
export type HxOptionsLabelProps<T extends object> =
	& HxExtOptionsLabelProps<T>
	& HxHtmlElementProps<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>, OmittedOptionsLabelHTMLProps, T>;
