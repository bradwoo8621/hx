import type {ModelPath} from '@hx/data';
import type {HTMLAttributes, ReactNode} from 'react';
import type {
	HtmlElementProps,
	HxCommonProps,
	HxDataPath,
	HxGap,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxOmittedDataAttributes,
	HxPadding,
	HxStdProps,
	HxWrappedReactEvents
} from '../../types';
import type {HxFlexAlignContent, HxFlexAlignItems, HxFlexJustifyContent} from '../flex';
import type {
	HxGridAlignContent,
	HxGridAlignItems,
	HxGridColumns,
	HxGridJustifyContent,
	HxGridJustifyItems
} from '../grid';

export type ExcludedPanelDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-panel' | 'data-hx-panel-collapsed';

/**
 * Properties for the HxPanel layout component.
 * Provides responsive grid layout with configurable column count, spacing, and styling.
 */
export interface HxExtPanelProps<T extends object>
	extends HxStdProps<T>, HxCommonProps<ExcludedPanelDataAttrNames, T> {
	// panel
	/** Whether the panel can be collapsed/expanded */
	collapsible?: boolean;
	/** Whether the panel is collapsed by default when collapsible */
	defaultCollapsed?: boolean;
	/** Panel title text displayed in header */
	title?: ReactNode;
	// header
	/** justify-content value for panel header flex layout */
	headerJustifyContent?: HxFlexJustifyContent;
	/** align-items value for panel header flex layout */
	headerAlignItems?: HxFlexAlignItems;
	/** align-content value for panel header flex layout */
	headerAlignContent?: HxFlexAlignContent;
	/** Horizontal gap size between header items */
	headerGapX?: HxGap;
	/** Vertical gap size between header items */
	headerGapY?: HxGap;
	/** Horizontal padding for panel header */
	headerPaddingX?: HxPadding;
	/** Top padding for panel header */
	headerPaddingT?: HxPadding;
	/** Bottom padding for panel header */
	headerPaddingB?: HxPadding;
	/** Additional HTML attributes to apply to the header div element */
	$domHeader?: HxWrappedReactEvents<HtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>>, T>;
	// body
	/** Number of grid columns for panel body */
	bodyColumns?: HxGridColumns;
	/** justify-items value for panel body grid layout */
	bodyJustifyItems?: HxGridJustifyItems;
	/** justify-content value for panel body grid layout */
	bodyJustifyContent?: HxGridJustifyContent;
	/** align-items value for panel body grid layout */
	bodyAlignItems?: HxGridAlignItems;
	/** align-content value for panel body grid layout */
	bodyAlignContent?: HxGridAlignContent;
	/** Horizontal gap size between body grid items */
	bodyGapX?: HxGap;
	/** Vertical gap size between body grid items */
	bodyGapY?: HxGap;
	/** Horizontal padding for panel body */
	bodyPaddingX?: HxPadding;
	/** Top padding for panel body */
	bodyPaddingT?: HxPadding;
	/** Bottom padding for panel body */
	bodyPaddingB?: HxPadding;
	/** Additional HTML attributes to apply to the body div element */
	$domBody?: HxWrappedReactEvents<HtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>>, T>;
	/** Optional reactive model for automatic propagation to child components */
	$model?: HxObject<T>,
	/**
	 * Path to nested reactive object on $model. If specified, this nested object
	 * will be automatically passed as $model prop to all direct child components,
	 * simplifying data binding in nested layouts.
	 */
	$field?: ModelPath<T> | HxDataPath;
	/** to restore scroll to initial state on panel re-expand */
	restoreScroll?: boolean;
}

/** HTML attributes that are omitted from panel root element */
export type OmittedPanelHTMLProps = HxOmittedAttributes | 'title';

/** Complete props interface for HxPanel component */
export type HxPanelProps<T extends object> =
	& HxExtPanelProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedPanelHTMLProps, T>;
