import type {HTMLAttributes, PropsWithoutRef, ReactElement, ReactNode, RefAttributes} from 'react';
import type {HxContext} from '../../contexts';
import type {
	EditSingleFieldProps,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	WidthConstrainedProps
} from '../../types';

/**
 * Single select option item
 * @template V - Type of the option value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface HxSelectOption<V = any> {
	/** Unique value for this option */
	value: V;
	/** Display label for the option */
	label: ReactNode;
}

/**
 * Select options source: can be static array, sync function, or async function
 * @template T - Type of the form model object
 * @template V - Type of the option values
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HxSelectOptions<T extends object, V = any> =
	| Array<HxSelectOption<V>>
	| ((model: HxObject<T>, context: HxContext) => Array<HxSelectOption<V>>)
	| ((model: HxObject<T>, context: HxContext) => Promise<Array<HxSelectOption<V>>>);

/**
 * Extended select component props
 * @template T - Type of the form model object
 */
export interface HxExtSelectProps<T extends object>
	extends EditSingleFieldProps<T>, WidthConstrainedProps {
	/** Options data source for the select dropdown */
	options: HxSelectOptions<T>;
	/** Whether the element is clearable */
	clearable?: boolean;
	/** Whether to show filter input when options exceed threshold */
	filter?: boolean;
	/** Whether to sort options alphabetically */
	sort?: boolean;
	/** Minimum width for the popup dropdown (defaults to select input width) */
	minPopupWidth?: number;
	/** Maximum height for the popup dropdown before scrolling */
	maxPopupHeight?: number;
	/** Z-index for the popup layer */
	zIndex?: number;
	/** Minimum gap between popup edge and viewport boundary */
	gapToEdge?: number;
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
export type HxSelectProps<T extends object> = PropsWithoutRef<
	& HxExtSelectProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedSelectHTMLProps, T>
>;

/**
 * Select component type definition
 */
export type HxSelectType = <T extends object>(
	props: HxSelectProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/** Event emitted when an option is selected */
export const EvtOptionSelect = 'option-select';
/** Event emitted when options are loaded from async source */
export const EvtOptionsLoad = 'options-load';
/** Event emitted when options data changes */
export const EvtOptionsChange = 'options-change';
