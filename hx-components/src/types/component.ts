import {type DetailedHTMLProps, type HTMLAttributes, type SyntheticEvent} from 'react';
import type {HxContext} from '../contexts';
import type {HxObject} from '../types';

export type HxColor = 'primary' | 'success' | 'warn' | 'danger' | 'info' | 'waive';
export type HxSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type HxBorderRadius = 'none' | HxSize;
export type HxGap = 'none' | HxSize;
export type HxPadding = 'none' | HxSize;
export type HxMargin = 'none' | HxSize;
export type HxDirection = 'dir-x' | 'dir-y';
export type HxFlexCellAlignSelf = 'auto' | 'start' | 'end' | 'center' | 'baseline' | 'stretch';
export type HxGridCellJustifySelf = 'stretch' | 'start' | 'end' | 'center';
export type HxGridCellAlignSelf = 'stretch' | 'start' | 'end' | 'center';

/**
 * data-hx-* attributes managed internally by components.
 *
 * Excluded from public props because setting them via props is ineffective —
 * the component always writes its own value, overriding whatever the user provides.
 * Some of these are internal DOM markers that still get reflected to the rendered element.
 *
 * Example: `<HxButton data-hx-button-variant="solid">` has no effect.
 * The variant is controlled by the `variant` prop; the component writes
 * `data-hx-button-variant` itself, and any user-supplied value is ignored.
 *
 * TODO clear it after component style refactor done.
 */
export type HxRootDataAttributes =
	| 'data-hx-reset-styles'
	| 'data-hx-root' | 'data-hx-portal-root'
	| 'data-hx-theme' | 'data-hx-language'
	// component types
	| 'data-hx-dtp' | 'data-hx-table'
	| 'data-hx-upload'
	| 'data-hx-button-bar'
	| 'data-hx-tabs'
	// standard component attributes
	// root
	// datetime picker
	| 'data-hx-dtp-icon' | 'data-hx-dtp-panel'
	| 'data-hx-dtp-panel-header'
	| 'data-hx-dtp-panel-btn' | 'data-hx-dtp-panel-btn-disabled' | 'data-hx-dtp-panel-btn-visible'
	| 'data-hx-dtp-panel-days'
	| 'data-hx-dtp-panel-weekday-label' | 'data-hx-dtp-panel-weekend'
	| 'data-hx-dtp-panel-day-gregory' | 'data-hx-dtp-panel-day-bc' | 'data-hx-dtp-panel-day-y10k'
	| 'data-hx-dtp-panel-day-era'
	| 'data-hx-dtp-panel-this-month' | 'data-hx-dtp-panel-state-day' | 'data-hx-dtp-panel-model-day'
	| 'data-hx-dtp-panel-months' | 'data-hx-dtp-panel-months-visible'
	| 'data-hx-dtp-panel-month-gregory' | 'data-hx-dtp-panel-month-bc' | 'data-hx-dtp-panel-month-y10k'
	| 'data-hx-dtp-panel-state-month' | 'data-hx-dtp-panel-model-month'
	| 'data-hx-dtp-panel-month-era' | 'data-hx-dtp-panel-month-eras'
	| 'data-hx-dtp-panel-years' | 'data-hx-dtp-panel-years-visible'
	| 'data-hx-dtp-panel-year-gregory' | 'data-hx-dtp-panel-model-year'
	| 'data-hx-dtp-panel-year-era' | 'data-hx-dtp-panel-year-eras'
	| 'data-hx-dtp-panel-time' | 'data-hx-dtp-panel-time-has-minute' | 'data-hx-dtp-panel-time-has-second'
	| 'data-hx-dtp-panel-time-input' | 'data-hx-dtp-panel-time-colon'
	| 'data-hx-dtp-panel-footer'
	// table
	| 'data-hx-table-as-form'
	| 'data-hx-table-header'
	| 'data-hx-table-header-cell'
	| 'data-hx-table-body'
	| 'data-hx-table-body-cell'
	| 'data-hx-table-cell-stripe-row' | 'data-hx-table-cell-odd-row' | 'data-hx-table-cell-even-row'
	| 'data-hx-table-footer'
	| 'data-hx-table-row-index' | 'data-hx-table-assist-empty'
	| 'data-hx-table-cell-block-end' | 'data-hx-table-cell-inline-end'
	| 'data-hx-table-cell-row-grid-line' | 'data-hx-table-cell-column-grid-line'
	// upload
	| 'data-hx-upload-color'
	| 'data-hx-upload-variant'
	| 'data-hx-upload-trigger'
	| 'data-hx-upload-error-msg'
	| 'data-hx-upload-dnd-desc' | 'data-hx-upload-dnd-bottom-border'
	| 'data-hx-upload-files' | 'data-hx-upload-file' | 'data-hx-upload-file-error'
	| 'data-hx-upload-file-icon'
	| 'data-hx-upload-file-details'
	| 'data-hx-upload-file-name' | 'data-hx-upload-file-ext-name' | 'data-hx-upload-file-size'
	| 'data-hx-upload-file-action' | 'data-hx-upload-file-uploading'
	| 'data-hx-upload-file-percentage'
	| 'data-hx-upload-file-error-msg'
	| 'data-hx-upload-file-thumbnail'
	| 'data-hx-upload-preview-backdrop' | 'data-hx-upload-preview-state'
	| 'data-hx-upload-preview-content' | 'data-hx-upload-preview-ratio'
	| 'data-hx-upload-preview-rect'
	| 'data-hx-upload-preview-action'
	// tabs
	| 'data-hx-tabs-active-mark' | 'data-hx-tabs-active-index' | 'data-hx-tab-active'
	| 'data-hx-tabs-header' | 'data-hx-tab-header'
	| 'data-hx-tabs-body' | 'data-hx-tab-body'
	| 'data-hx-tab-mark' | 'data-hx-tab-index'
	| 'data-hx-tabs-header-active-indicator'
	| 'data-hx-tabs-header-more-tab';

/** omitted data-hx-*, includes root data attributes and common internal data attributes */
export type HxOmittedDataAttributes =
	| HxRootDataAttributes
	| 'data-hx-model-path'
	| 'data-hx-visible' | 'data-hx-disabled' | 'data-hx-readonly'
	| 'data-hx-with-check';

/**
 * attributes should be omitted from React.HTMLAttributes.
 * and common internal "data-hx-" attributes
 */
export type HxOmittedAttributes =
	| 'color'
	| 'defaultValue' | 'defaultChecked'
	| 'radioGroup'
	| 'prefix';
/** attributes should be omitted, {@link HxOmittedAttributes} and {@link React.DOMAttributes.children} */
export type HxOmittedAtomicAttributes = HxOmittedAttributes | 'children';

/** the onXXX event handler which pass the model ({@link HxObject}, could be undefined) and {@link HxContext} */
export type HxSyntheticEventHandler<E extends SyntheticEvent, T extends object> = (event: E, model: HxObject<T> | undefined, context: HxContext) => void

/**
 * Transform all React event listeners (with property names starting with `onXxx`)
 * while preserving the first parameter `event` in the function signature and adding three parameters:
 * - model: HxObject<T>,
 * - context: HxContext,
 */
export type HxWrappedReactEvents<P, T extends object> = {
	[K in keyof P]: K extends `on${Capitalize<string>}`
		? (P[K] extends (((event: infer E) => void) | undefined)
			? (E extends SyntheticEvent
				? HxSyntheticEventHandler<E, T>
				: P[K])
			: P[K])
		: P[K];
};
export type HtmlElementProps<E extends HTMLElement, EA extends HTMLAttributes<E>> = Omit<DetailedHTMLProps<EA, E>, 'ref'>;
export type HtmlElementPropNames<E extends HTMLElement, EA extends HTMLAttributes<E>> =
	| keyof HtmlElementProps<E, EA>
	| HxDomDataAttrName
export type HxHtmlElementProps<
	E extends HTMLElement,
	EA extends HTMLAttributes<E>,
	O extends HtmlElementPropNames<E, EA>,
	T extends object
> = HxWrappedReactEvents<Omit<HtmlElementProps<E, EA>, O>, T>;

export interface HxFlexCellProps {
	fGrow?: number;
	fAlignSelf?: HxFlexCellAlignSelf;
}

export interface HxGridCellProps {
	gRow?: number;
	gRows?: number;
	gCol?: number;
	gCols?: number;
	gJustifySelf?: HxGridCellJustifySelf;
	gAlignSelf?: HxGridCellAlignSelf;
}

/** Only design system size tokens are accepted; use the style prop for raw CSS lengths */
export interface HxWidthConstrainedProps {
	minWidth?: HxSize;
	width?: HxSize;
	maxWidth?: HxSize;
}

/** Only design system size tokens are accepted; use the style prop for raw CSS lengths */
export interface HxHeightConstrainedProps {
	minHeight?: HxSize;
	height?: HxSize;
	maxHeight?: HxSize;
}

export interface HxBorderProps {
	border?: boolean;
	borderRadius?: HxBorderRadius;
}

export interface HxPaddingProps {
	paddingX?: HxPadding;
	paddingY?: HxPadding;
	paddingT?: HxPadding;
	paddingB?: HxPadding;
}

export interface HxMarginProps {
	marginX?: HxMargin;
	marginY?: HxMargin;
	marginT?: HxMargin;
	marginR?: HxMargin;
	marginB?: HxMargin;
	marginL?: HxMargin;
}

export type HxDataAttrName = `data-hx-${string}`;
export type HxDomDataAttrName = `data-${string}`;
export type HxDataAttrValue = string | number | boolean | null | undefined;
export type HxDataAttrFunc<T> = (model: HxObject<T> | undefined, context: HxContext) => HxDataAttrValue;

export type HxCommonProps<ExDAT extends HxDataAttrName, T extends object = never> =
	& HxWidthConstrainedProps & HxHeightConstrainedProps
	& HxPaddingProps & HxMarginProps & HxBorderProps
	& HxFlexCellProps & HxGridCellProps
	& { [key in Exclude<HxDomDataAttrName, ExDAT>]: HxDataAttrValue | HxDataAttrFunc<T> };

// usually usages
export interface HxRectX {
	width?: number;
}

export interface HxRectY {
	height?: number;
}

export interface HxRect extends HxRectX, HxRectY {
}

export interface HxRectXRange {
	minWidth?: number;
	maxWidth?: number;
}

export interface HxRectYRange {
	minHeight?: number;
	maxHeight?: number;
}

export interface HxRectRange extends HxRectXRange, HxRectYRange {
}

export interface HxAbsolutePosition extends HxRect {
	top?: number;
	left?: number;
	right?: number;
	bottom?: number;
}

export type HxOverlayUniqueId = string;
export type HxOverlayInstanceHandle = string;
