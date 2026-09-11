import type {HTMLAttributes} from 'react';
import type {
	HxCommonProps,
	HxDirection,
	HxEditSingleFieldProps,
	HxGap,
	HxHtmlElementProps,
	HxOmittedAtomicAttributes,
	HxOmittedDataAttributes,
	WithRequired
} from '../../types';
import type {HxSelectOptionsProps} from '../select-options';

/**
 * Number of lanes (columns) for multi-line radio layout
 */
export type HxMRadioLanes = number;

export type ExcludedMRadioDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-m-radio';

/**
 * Extended props for HxMRadio component
 */
export interface HxExtMRadioProps<T extends object>
	extends WithRequired<HxSelectOptionsProps<T>, '$model'>, HxEditSingleFieldProps<T>, HxCommonProps<ExcludedMRadioDataAttrNames, T> {
	/** Layout direction of radio options: horizontal (dir-x) or vertical (dir-y) */
	direction?: HxDirection;
	/** Number of columns when direction is horizontal, ignored when direction is vertical */
	lanes?: HxMRadioLanes;
	/** Horizontal gap size between radio options */
	gapX?: HxGap;
	/** Vertical gap size between radio options */
	gapY?: HxGap;
	/** Whether to allow Enter key to switch radio value */
	enterToSwitchValue?: boolean;
	/** Whether to allow Space key to switch radio value */
	spaceToSwitchValue?: boolean;
	/** Custom i18n key for loading state text */
	optionsOnLoadKey?: string;
	/** Custom i18n key for empty options state text */
	noOptionsKey?: string;
}

/**
 * HTML attributes that are omitted from root div element
 */
export type OmittedMRadioHTMLProps = HxOmittedAtomicAttributes;

/**
 * Complete props interface for HxMRadio component
 */
export type HxMRadioProps<T extends object> =
	& HxExtMRadioProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedMRadioHTMLProps, T>;
