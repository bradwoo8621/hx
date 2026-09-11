import type {ModelPath} from '@hx/data';
import type {HTMLAttributes} from 'react';
import type {
	HxCommonProps,
	HxDataPath,
	HxDirection,
	HxGap,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes, HxOmittedDataAttributes,
	HxStdProps
} from '../../types';

export type HxFlexJustifyContent =
	| 'normal'
	| 'start' | 'end' | 'center'
	| 'space-between' | 'space-around' | 'space-evenly';
export type HxFlexAlignItems = 'normal' | 'start' | 'end' | 'center' | 'stretch' | 'baseline';
export type HxFlexAlignContent = 'normal' | 'start' | 'end' | 'center' | 'stretch' | 'space-between' | 'space-around';

export type ExcludedFlexDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-flex';

/**
 * Properties for the HxFlex layout component.
 * Provides flexible container layout with configurable spacing, borders, and padding.
 */
export interface HxExtFlexProps<T extends object>
	extends HxStdProps<T>, HxCommonProps<ExcludedFlexDataAttrNames, T> {
	/** Flex container direction: 'dir-x' for horizontal, 'dir-y' for vertical */
	direction?: HxDirection;
	/** Whether child items wrap onto multiple lines */
	wrap?: boolean;
	/** Main axis alignment of the child items */
	justifyContent?: HxFlexJustifyContent;
	/** Cross axis alignment of the child items within a line */
	alignItems?: HxFlexAlignItems;
	/** Cross axis alignment of the wrapped lines */
	alignContent?: HxFlexAlignContent;
	/** Horizontal gap size between child items */
	gapX?: HxGap;
	/** Vertical gap size between child items */
	gapY?: HxGap;
	/** Optional reactive model */
	$model?: HxObject<T>,
	/**
	 * Path to nested reactive object on $model. If specified, this nested object
	 * will be automatically passed as $model prop to all direct child components,
	 * simplifying data binding in nested layouts.
	 */
	$field?: ModelPath<T> | HxDataPath;
}

export type OmittedFlexHTMLProps = HxOmittedAttributes;

export type HxFlexProps<T extends object> =
	& HxExtFlexProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedFlexHTMLProps, T>;
