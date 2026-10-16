import type {HTMLAttributes} from 'react';
import type {HxContext} from '../../contexts';
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
 * Number of lanes (columns) for multi-line checkbox layout
 */
export type HxMCheckboxLanes = number;

export type ExcludedMCheckboxDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-m-checkbox';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HxMCheckboxToModelFunc = (value: Array<any> | null | undefined, context: HxContext) => any | null | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HxMCheckboxFromModelFunc = (value: any | null | undefined, context: HxContext) => Array<any> | null | undefined;

/**
 * Extended props for HxMCheckbox component
 */
export interface HxExtMCheckboxProps<T extends object>
	extends WithRequired<HxSelectOptionsProps<T>, '$model'>, HxEditSingleFieldProps<T>, HxCommonProps<ExcludedMCheckboxDataAttrNames, T> {
	/** convert given display value to model value */
	toModel?: HxMCheckboxToModelFunc;
	/** convert given model value to display value */
	fromModel?: HxMCheckboxFromModelFunc;
	/** maximum checked options count */
	maxChecked?: number;
	/** Layout direction of checkbox options: horizontal (dir-x) or vertical (dir-y) */
	direction?: HxDirection;
	/** Number of columns when direction is horizontal, ignored when direction is vertical */
	lanes?: HxMCheckboxLanes;
	/** Horizontal gap size between checkbox options */
	gapX?: HxGap;
	/** Vertical gap size between checkbox options */
	gapY?: HxGap;
	/** Whether to allow Enter key to switch checkbox value */
	enterToSwitchValue?: boolean;
	/** Whether to allow Space key to switch checkbox value */
	spaceToSwitchValue?: boolean;
	/** Custom i18n key for loading state text */
	optionsOnLoadKey?: string;
	/** Custom i18n key for empty options state text */
	noOptionsKey?: string;
}

/**
 * HTML attributes that are omitted from root div element
 */
export type OmittedMCheckboxHTMLProps = HxOmittedAtomicAttributes;

/**
 * Complete props interface for HxMCheckbox component
 */
export type HxMCheckboxProps<T extends object> =
	& HxExtMCheckboxProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedMCheckboxHTMLProps, T>;
