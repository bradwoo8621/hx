import type {HTMLAttributes, ReactNode} from 'react';
import type {
	HxCommonProps,
	HxEditSingleFieldProps,
	HxHtmlElementProps,
	HxOmittedAtomicAttributes,
	HxOmittedDataAttributes
} from '../../types';

/**
 * Supported value types for checkbox state
 */
export type HxCheckboxValue = string | number | boolean | null | undefined;

/**
 * Checkbox value pair configuration
 * - 2-element tuple: [checkedValue, uncheckedValue]
 * - 3-element tuple: [checkedValue, uncheckedValue, customCheckFunction]
 * The custom function returns true when the value should be considered checked
 */
export type HxCheckboxValuePair =
	| [HxCheckboxValue, HxCheckboxValue]
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| [HxCheckboxValue, HxCheckboxValue, (value: any) => boolean];

export type ExcludedCheckboxDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-checkbox'
	| 'data-hx-checkbox-checked' | 'data-hx-checkbox-icon' | 'data-hx-checkbox-curtain';

/**
 * Extended props for HxCheckbox component
 */
export interface HxExtCheckboxProps<T extends object>
	extends HxEditSingleFieldProps<T>, HxCommonProps<ExcludedCheckboxDataAttrNames, T> {
	/** Custom value pair for checked/unchecked states */
	values?: HxCheckboxValuePair;
	/** Checkbox label text content */
	text?: ReactNode;
	/** Enter key toggles the value (default false) */
	enterToSwitchValue?: boolean;
	/** Space key toggles the value (default true) */
	spaceToSwitchValue?: boolean;
}

/**
 * HTML attributes that are omitted from the root div element
 */
export type OmittedCheckboxHTMLProps = HxOmittedAtomicAttributes;

/**
 * Complete props interface for HxCheckbox component
 */
export type HxCheckboxProps<T extends object> =
	& HxExtCheckboxProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedCheckboxHTMLProps, T>;
