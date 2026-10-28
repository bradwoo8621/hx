import type {HTMLAttributes, ReactNode} from 'react';
import type {HxContext} from '../../contexts';
import type {
	HxCommonProps,
	HxEditSingleFieldProps,
	HxHtmlElementProps,
	HxOmittedAtomicAttributes,
	HxOmittedDataAttributes,
	WithRequired
} from '../../types';
import type {HxPopupRenderOptions} from '../popup';
import type {HxSelectOption, HxSelectOptionsProps} from '../select-options';

export type ExcludedMSelectDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-m-select';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HxMSelectToModelFunc = (value: Array<any> | null | undefined, context: HxContext) => any | null | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HxMSelectFromModelFunc = (value: any | null | undefined, context: HxContext) => Array<any> | null | undefined;

/**
 * Extended props for HxMSelect component
 */
export interface HxExtMSelectProps<T extends object>
	extends WithRequired<HxSelectOptionsProps<T>, '$model'>, HxEditSingleFieldProps<T>, HxCommonProps<ExcludedMSelectDataAttrNames, T> {
	/** try to convert given display value to model value */
	toModel?: HxMSelectToModelFunc;
	/** convert given model value to display value */
	fromModel?: HxMSelectFromModelFunc;
	/** Default rendering in compact mode or not */
	compact?: boolean;
	/** Whether the element is clearable */
	clearable?: boolean;
	/** Whether to show filter input when options exceed threshold */
	filter?: boolean;
	/** Whether to sort options alphabetically */
	sort?: boolean;
	/** Label of option when it is selected */
	selectedLabel?: (option: HxSelectOption) => ReactNode;
	/** Whether to show placeholder text when no option is selected */
	placeholder?: boolean;
	/** Custom down icon */
	downIcon?: ReactNode;
	/** Whether to scroll to and highlight the currently selected option when popup opens */
	showSelectedOnPopupOpen?: boolean;
	/** Whether to show filter text when options count exceed */
	filterWhenOptionExceed?: number;
	/** Minimum width for the popup dropdown (defaults to select input width) */
	minPopupWidth?: number;
	/** Maximum height for the popup dropdown before scrolling */
	maxPopupHeight?: number;
	/** Z-index for the popup layer */
	zIndex?: number;
	/** Minimum gap between popup edge and viewport boundary */
	gapToEdge?: number;
	/** Popup should be at least the same width as the trigger input */
	sameWidthAtMinimum?: boolean;
	/** Whether pressing Enter key opens the popup */
	enterToOpenPopup?: boolean;
	/** Whether pressing Space key opens the popup */
	spaceToOpenPopup?: boolean;
	/** Popup position */
	popupPosition?: HxPopupRenderOptions['position'];
	/** Popup align to */
	popupAlignTo?: HxPopupRenderOptions['alignTo'];
	/** i18n translation key or React node for placeholder text */
	placeholderKey?: ReactNode;
	/** i18n translation key or React node for filter placeholder text */
	filterPlaceholderKey?: ReactNode;
	/** i18n translation key or React node for options loading state text */
	optionsOnLoadKey?: ReactNode;
	/** i18n translation key or React node for empty options state text */
	noOptionsKey?: ReactNode;
}

/**
 * HTML attributes that are omitted from root div element
 */
export type OmittedMSelectHTMLProps = HxOmittedAtomicAttributes;

/**
 * Complete props interface for HxMSelect component
 */
export type HxMSelectProps<T extends object> =
	& HxExtMSelectProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedMSelectHTMLProps, T>;

/** Event emitted when an option is selected */
export const EvtHxMSelect_OptionSelectedChange = 'evt-hx-m-select--option-selected-change';
/** Event emitted when an option is deselected */
export const EvtHxMSelect_OptionDeselect = 'evt-hx-m-select--option-deselect';
/** Event emitted when options are all deselected */
export const EvtHxMSelect_OptionDeselectAll = 'evt-hx-m-select--option-deselect-all';
/** Event emitted when try to hover previous option */
export const EvtHxMSelect_HoverPreviousOption = 'evt-hx-m-select--hover-previous-option';
/** Event emitted when try to hover next option */
export const EvtHxMSelect_HoverNextOption = 'evt-hx-m-select--hover-next-option';
/** Event emitted when try to select the hover option */
export const EvtHxMSelect_SelectHoverOption = 'evt-hx-m-select--select-hover-option';
/** Event emitted when try to close popup */
export const EvtHxMSelect_ClosePopup = 'evt-hx-m-select--close-popup';
/** Event emitted when try to get select dom node */
export const EvtHxMSelect_GetSelect = 'evt-hx-m-select--get-select';
/** Event emitted when try to get filter input dom node */
export const EvtHxMSelect_GetFilterInput = 'evt-hx-m-select--get-filter-input';
