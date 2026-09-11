import type {ModelPath} from '@hx/data';
import type {HTMLAttributes} from 'react';
import type {
	HxCommonProps,
	HxDataPath,
	HxGap,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	HxOmittedDataAttributes,
	HxStdProps
} from '../../types';

/** Grid column count: supports 12 (default), 15, and 16 column layouts */
export type HxGridColumns = 12 | 15 | 16;
export type HxGridJustifyItems = 'normal' | 'start' | 'end' | 'center' | 'stretch';
export type HxGridJustifyContent =
	| 'normal'
	| 'start' | 'end' | 'center' | 'stretch'
	| 'space-between' | 'space-around' | 'space-evenly';
export type HxGridAlignItems = 'normal' | 'start' | 'end' | 'center' | 'stretch' | 'baseline';
export type HxGridAlignContent =
	| 'normal'
	| 'start' | 'end' | 'center' | 'stretch'
	| 'space-between' | 'space-around' | 'space-evenly';

export type ExcludedGridDataAttrNames =
	| HxOmittedDataAttributes
	| 'data-hx-grid';

/**
 * Properties for the HxGrid layout component.
 * Provides responsive grid layout with configurable column count, spacing, and styling.
 */
export interface HxExtGridProps<T extends object>
	extends HxStdProps<T>, HxCommonProps<ExcludedGridDataAttrNames, T> {
	/** Number of columns in the grid layout: 12 (default), 15, or 16 */
	columns?: HxGridColumns;
	/** Inline axis alignment of a grid item inside its own cell (CSS justify-items) */
	justifyItems?: HxGridJustifyItems;
	/** Inline axis distribution of the grid tracks themselves (CSS justify-content) */
	justifyContent?: HxGridJustifyContent;
	/** Block axis alignment of a grid item inside its own row (CSS align-items) */
	alignItems?: HxGridAlignItems;
	/** Block axis distribution of the grid rows, when the grid is taller than its rows (CSS align-content) */
	alignContent?: HxGridAlignContent;
	/** Horizontal gap size between grid columns */
	gapX?: HxGap;
	/** Vertical gap size between grid rows */
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

export type OmittedGridHTMLProps = HxOmittedAttributes;

export type HxGridProps<T extends object> =
	& HxExtGridProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedGridHTMLProps, T>;
