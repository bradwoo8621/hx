import type {HTMLAttributes, ReactNode} from 'react';
import type {
	HxCommonProps,
	HxEditSingleFieldProps,
	HxHtmlElementProps,
	HxOmittedAtomicAttributes,
	HxOmittedDataAttributes
} from '../../types';

/**
 * Supported value types for radio state
 */
export type HxRadioValue = string | number | boolean | null | undefined;

/**
 * Radio value pair configuration
 * - 2-element tuple: [checkedValue, uncheckedValue]
 * - 3-element tuple: [checkedValue, uncheckedValue, customCheckFunction]
 * The custom function returns true when the value should be considered checked
 */
export type HxRadioValuePair =
	| [HxRadioValue, HxRadioValue]
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| [HxRadioValue, HxRadioValue, (value: any) => boolean];

export type ExcludedRadioDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-radio'
	| 'data-hx-radio-checked' | 'data-hx-radio-curtain';

/**
 * Extended props for HxRadio component
 */
export interface HxExtRadioProps<T extends object>
	extends HxEditSingleFieldProps<T>, HxCommonProps<ExcludedRadioDataAttrNames, T> {
	/** Let a click or key press on an already checked radio clear it back to the unchecked value (default false) */
	allowUnchecked?: boolean;
	/** Custom value pair for checked/unchecked states */
	values?: HxRadioValuePair;
	/** Radio label text content */
	text?: ReactNode;
	/** Enter key selects the radio, or clears it when allowUnchecked is set (default false) */
	enterToSwitchValue?: boolean;
	/** Space key selects the radio, or clears it when allowUnchecked is set (default true) */
	spaceToSwitchValue?: boolean;
}

/**
 * HTML attributes that are omitted from the root div element
 */
export type OmittedRadioHTMLProps = HxOmittedAtomicAttributes;

/**
 * Complete props interface for HxRadio component
 */
export type HxRadioProps<T extends object> =
	& HxExtRadioProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedRadioHTMLProps, T>;
