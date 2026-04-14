import type {HTMLAttributes, ReactElement, ReactNode, RefAttributes} from 'react';
import type {EditSingleFieldProps, HxHtmlElementProps, HxOmittedAttributes, WidthConstrainedProps} from '../../types';
import type {HxSelectOptionsProps} from '../select-options';

/**
 * Extended select component props
 * @template T - Type of the form model object
 */
export interface HxExtSelectProps<T extends object>
	extends Required<HxSelectOptionsProps<T>>, EditSingleFieldProps<T>, WidthConstrainedProps {
	/** Whether the element is clearable */
	clearable?: boolean;
	/** Whether to show filter input when options exceed threshold */
	filter?: boolean;
	/** Whether to sort options alphabetically */
	sort?: boolean;
	/** Whether to show placeholder text when no option is selected */
	placeholder?: boolean;
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
 * HTML props that are omitted from select component props
 */
export type OmittedSelectHTMLProps =
	| HxOmittedAttributes
	| 'children';

/**
 * Full select component props including HTML attributes
 * @template T - Type of the form model object
 */
export type HxSelectProps<T extends object> =
	& HxExtSelectProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedSelectHTMLProps, T>;

/**
 * Select component type definition
 */
export type HxSelectType = <T extends object>(
	props: HxSelectProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/** Event emitted when an option is selected */
export const EvtHxSelect_OptionSelect = 'evt-hx-select--option-select';
/** Event emitted when try to hover previous option */
export const EvtHxSelect_HoverPreviousOption = 'evt-hx-select--hover-previous-option';
/** Event emitted when try to hover next option */
export const EvtHxSelect_HoverNextOption = 'evt-hx-select--hover-next-option';
/** Event emitted when try to select the hover option */
export const EvtHxSelect_SelectHoverOption = 'evt-hx-select--select-hover-option';
/** Event emitted when try to close popup */
export const EvtHxSelect_ClosePopup = 'evt-hx-select--close-popup';
/** Event emitted when try to get select dom node */
export const EvtHxSelect_GetSelect = 'evt-hx-select--get-select';
/** Event emitted when try to get filter input dom node */
export const EvtHxSelect_GetFilterInput = 'evt-hx-select--get-filter-input';