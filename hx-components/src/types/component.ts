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
 */
export type HxOmittedDataAttributes =
	| 'data-hx-root' | 'data-hx-portal-root'
	// component types
	| 'data-hx-svg-icon'
	| 'data-hx-label' | 'data-hx-badge'
	| 'data-hx-input' | 'data-hx-format-input' | 'data-hx-textarea'
	| 'data-hx-checkbox' | 'data-hx-m-checkbox'
	| 'data-hx-radio' | 'data-hx-m-radio'
	| 'data-hx-select' | 'data-hx-dtp'
	| 'data-hx-button' | 'data-hx-actions'
	| 'data-hx-upload'
	| 'data-hx-separator' | 'data-hx-callout'
	| 'data-hx-box' | 'data-hx-flex' | 'data-hx-grid'
	| 'data-hx-panel'
	| 'data-hx-button-bar'
	| 'data-hx-tabs'
	| 'data-hx-pagination'
	| 'data-hx-overlay' | 'data-hx-dialog' | 'data-hx-alert' | 'data-hx-toast'
	| 'data-hx-with-check'
	| 'data-hx-popup'
	// standard component attributes
	// root
	| 'data-hx-theme' | 'data-hx-language'
	// common part, for multiple components
	| 'data-hx-model-path'
	| 'data-hx-visible' | 'data-hx-disabled' | 'data-hx-readonly'
	| 'data-hx-focus' | 'data-hx-hover'
	| 'data-hx-color'
	| 'data-hx-min-width' | 'data-hx-width' | 'data-hx-max-width'
	| 'data-hx-min-height' | 'data-hx-height' | 'data-hx-max-height'
	| 'data-hx-margin-x' | 'data-hx-margin-y'
	| 'data-hx-padding-x' | 'data-hx-padding-y' | 'data-hx-padding-t' | 'data-hx-padding-b'
	| 'data-hx-border' | 'data-hx-border-color' | 'data-hx-border-radius'
	| 'data-hx-cell-gap-x' | 'data-hx-cell-gap-y'
	| 'data-hx-justify-items' | 'data-hx-justify-content'
	| 'data-hx-align-items' | 'data-hx-align-content'
	| 'data-hx-first-element'
	// svg icon
	| 'data-hx-svg-icon-name'
	// label
	| 'data-hx-label-text' | 'data-hx-label-opaque' | 'data-hx-label-text-indent'
	| 'data-hx-label-clickable' | 'data-hx-label-hoverable' | 'data-hx-label-active'
	| 'data-hx-label-input-placeholder'
	// badge
	| 'data-hx-badge-variant' | 'data-hx-badge-size'
	| 'data-hx-badge-border-radius'
	// input
	| 'data-hx-input-box' | 'data-hx-input-inbox'
	// textarea
	| 'data-hx-textarea-box'
	| 'data-hx-textarea-rows' | 'data-hx-textarea-max-rows' | 'data-hx-textarea-resize'
	| 'data-hx-textarea-placeholder' | 'data-hx-label-textarea-char-limit'
	// checkbox
	| 'data-hx-checkbox-checked' | 'data-hx-checkbox-curtain'
	// m-checkbox
	| 'data-hx-m-checkbox-direction' | 'data-hx-m-checkbox-lanes'
	// radio
	| 'data-hx-radio-checked' | 'data-hx-radio-curtain'
	// m-radio
	| 'data-hx-m-radio-direction' | 'data-hx-m-radio-lanes'
	// select
	| 'data-hx-select-icon' | 'data-hx-select-options' | 'data-hx-select-option'
	// datetime picker
	| 'data-hx-dtp-icon' | 'data-hx-dtp-panel'
	// button
	| 'data-hx-button-variant'
	| 'data-hx-text-uppercase'
	| 'data-hx-button-input-embed'
	| 'data-hx-button-svg-icon' | 'data-hx-button-icon'
	// actions
	| 'data-hx-actions-options' | 'data-hx-actions-option'
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
	// separator
	| 'data-hx-separator-direction' | 'data-hx-separator-size'
	// callout
	| 'data-hx-callout-background' | 'data-hx-callout-content' | 'data-hx-callout-color'
	| 'data-hx-callout-icon'
	// box
	// flex
	| 'data-hx-flex-direction' | 'data-hx-flex-wrap'
	// flex cell
	// grid
	| 'data-hx-grid-columns'
	// grid cell
	// panel
	| 'data-hx-panel-collapsible' | 'data-hx-panel-collapsed'
	| 'data-hx-panel-header' | 'data-hx-panel-title' | 'data-hx-panel-collapse-button'
	| 'data-hx-panel-body'
	// tabs
	| 'data-hx-tabs-active-mark' | 'data-hx-tabs-active-index' | 'data-hx-tab-active'
	| 'data-hx-tabs-header' | 'data-hx-tab-header'
	| 'data-hx-tabs-body' | 'data-hx-tab-body'
	| 'data-hx-tab-mark' | 'data-hx-tab-index'
	| 'data-hx-tabs-header-active-indicator'
	| 'data-hx-tabs-header-more-tab'
	// pagination
	| 'data-hx-pagination-total-pages'
	| 'data-hx-pagination-total-items' | 'data-hx-pagination-total-items-key1' | 'data-hx-pagination-total-items-key2'
	| 'data-hx-pagination-page-size'
	// overlay
	| 'data-hx-overlay-backdrop' | 'data-hx-overlay-state'
	| 'data-hx-toast-dismiss-bar' | 'data-hx-toast-dismiss'
	// popup
	| 'data-hx-popup-state' | 'data-hx-popup-avoid-transition'
	| 'data-hx-popup-for-select' | 'data-hx-popup-for-actions' | 'data-hx-popup-for-dtp'
	// temporary attributes
	| 'data-hx-temporary-display';

export type HxOmittedAttributes =
	| HxOmittedDataAttributes
	| 'color';

/**
 * data-hx-* attributes not set internally by components.
 * Allowed in public props so users or parent components can set them for customization.
 */
// noinspection JSUnusedGlobalSymbols
export type HxExtDataAttributes =
	| 'data-hx-svg-icon-animation'
	| 'data-hx-button-min-width'
	| 'data-hx-label-check-msg' | 'data-hx-label-svg-icon' | 'data-hx-label-input-embed'
	// margin
	| 'data-hx-margin-t' | 'data-hx-margin-r' | 'data-hx-margin-b' | 'data-hx-margin-l'
	// flex cell
	| 'data-hx-flex-cell-grow' | 'data-hx-flex-cell-align-self'
	// grid cell
	| 'data-hx-grid-cell-row' | 'data-hx-grid-cell-rows' | 'data-hx-grid-cell-col' | 'data-hx-grid-cell-cols'
	| 'data-hx-grid-cell-justify-self' | 'data-hx-grid-cell-align-self';

export type HxSyntheticEventHandler<E extends SyntheticEvent, T extends object> = (event: E, model: HxObject<T> | undefined, context: HxContext) => void
// utilities
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
	| `data-${string}`
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

export interface HxWidthConstrainedProps {
	minWidth?: HxSize | number | string;
	width?: HxSize | number | string;
	maxWidth?: HxSize | number | string;
}

export interface HxHeightConstrainedProps {
	minHeight?: HxSize | number | string;
	height?: HxSize | number | string;
	maxHeight?: HxSize | number | string;
}

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
