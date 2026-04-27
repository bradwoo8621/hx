import type {ModelPath} from '@hx/data';
import type {HTMLAttributes, ReactNode} from 'react';
import type {
	HtmlElementProps,
	HxBorderRadius,
	HxDataPath,
	HxGap,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxPadding, HxStdProps, HxWidthConstrainedProps,
	HxWrappedReactEvents
} from '../../types';
import type {
	HxFlexAlignContent,
	HxFlexAlignItems,
	HxFlexGapX,
	HxFlexGapY,
	HxFlexJustifyContent,
	HxFlexPaddingB,
	HxFlexPaddingT,
	HxFlexPaddingX
} from '../flex';
import type {
	HxGridAlignContent,
	HxGridAlignItems,
	HxGridColumns,
	HxGridJustifyContent,
	HxGridJustifyItems
} from '../grid';

/** Panel border radius size type */
export type HxPanelBorderRadius = HxBorderRadius;
/** Panel header flex layout justify-content type */
export type HxPanelHeaderJustifyContent = HxFlexJustifyContent;
/** Panel header flex layout align-items type */
export type HxPanelHeaderAlignItems = HxFlexAlignItems;
/** Panel header flex layout align-content type */
export type HxPanelHeaderAlignContent = HxFlexAlignContent;
/** Panel header horizontal gap size type */
export type HxPanelHeaderGapX = HxFlexGapX;
/** Panel header vertical gap size type */
export type HxPanelHeaderGapY = HxFlexGapY;
/** Panel header horizontal padding size type */
export type HxPanelHeaderPaddingX = HxFlexPaddingX;
/** Panel header top padding size type */
export type HxPanelHeaderPaddingT = HxFlexPaddingT;
/** Panel header bottom padding size type */
export type HxPanelHeaderPaddingB = HxFlexPaddingB;
/** Panel body grid columns count type */
export type HxPanelBodyColumns = HxGridColumns;
/** Panel body grid layout justify-items type */
export type HxPanelBodyJustifyItems = HxGridJustifyItems;
/** Panel body grid layout justify-content type */
export type HxPanelBodyJustifyContent = HxGridJustifyContent;
/** Panel body grid layout align-items type */
export type HxPanelBodyAlignItems = HxGridAlignItems;
/** Panel body grid layout align-content type */
export type HxPanelBodyAlignContent = HxGridAlignContent;
/** Panel body horizontal gap size type */
export type HxPanelBodyGapX = HxGap;
/** Panel body vertical gap size type */
export type HxPanelBodyGapY = HxGap;
/** Panel body horizontal padding size type */
export type HxPanelBodyPaddingX = HxPadding;
/** Panel body top padding size type */
export type HxPanelBodyPaddingT = HxPadding;
/** Panel body bottom padding size type */
export type HxPanelBodyPaddingB = HxPadding;

/**
 * Properties for the HxPanel layout component.
 * Provides responsive grid layout with configurable column count, spacing, and styling.
 */
export interface HxExtPanelProps<T extends object>
	extends HxStdProps<T>, HxWidthConstrainedProps {
	// panel
	/** Whether to show panel border */
	border?: boolean;
	/** Panel border radius size */
	borderRadius?: HxPanelBorderRadius;
	/** Whether the panel can be collapsed/expanded */
	collapsible?: boolean;
	/** Whether the panel is collapsed by default when collapsible */
	defaultCollapsed?: boolean;
	/** Panel title text displayed in header */
	title?: ReactNode;
	// header
	/** justify-content value for panel header flex layout */
	headerJustifyContent?: HxPanelHeaderJustifyContent;
	/** align-items value for panel header flex layout */
	headerAlignItems?: HxPanelHeaderAlignItems;
	/** align-content value for panel header flex layout */
	headerAlignContent?: HxPanelHeaderAlignContent;
	/** Horizontal gap size between header items */
	headerGapX?: HxPanelHeaderGapX;
	/** Vertical gap size between header items */
	headerGapY?: HxPanelHeaderGapY;
	/** Horizontal padding for panel header */
	headerPaddingX?: HxPanelHeaderPaddingX;
	/** Top padding for panel header */
	headerPaddingT?: HxPanelHeaderPaddingT;
	/** Bottom padding for panel header */
	headerPaddingB?: HxPanelHeaderPaddingB;
	/** Additional HTML attributes to apply to the header div element */
	$domHeader?: HxWrappedReactEvents<HtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>>, T>;
	// body
	/** Number of grid columns for panel body */
	bodyColumns?: HxPanelBodyColumns;
	/** justify-items value for panel body grid layout */
	bodyJustifyItems?: HxPanelBodyJustifyItems;
	/** justify-content value for panel body grid layout */
	bodyJustifyContent?: HxPanelBodyJustifyContent;
	/** align-items value for panel body grid layout */
	bodyAlignItems?: HxPanelBodyAlignItems;
	/** align-content value for panel body grid layout */
	bodyAlignContent?: HxPanelBodyAlignContent;
	/** Horizontal gap size between body grid items */
	bodyGapX?: HxPanelBodyGapX;
	/** Vertical gap size between body grid items */
	bodyGapY?: HxPanelBodyGapY;
	/** Horizontal padding for panel body */
	bodyPaddingX?: HxPanelBodyPaddingX;
	/** Top padding for panel body */
	bodyPaddingT?: HxPanelBodyPaddingT;
	/** Bottom padding for panel body */
	bodyPaddingB?: HxPanelBodyPaddingB;
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
}

/** HTML attributes that are omitted from panel root element */
export type OmittedPanelHTMLProps = HxOmittedAttributes | 'title';

/** Complete props interface for HxPanel component */
export type HxPanelProps<T extends object> =
	& HxExtPanelProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedPanelHTMLProps, T>;
