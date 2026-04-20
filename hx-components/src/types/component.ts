import {type DetailedHTMLProps, type HTMLAttributes, type SyntheticEvent} from 'react';
import type {HxContext} from '../contexts';
import type {HxObject} from '../types';

export type HxColor = 'primary' | 'success' | 'warn' | 'danger' | 'info' | 'waive';
export type HxBorderRadius = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type HxGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type HxPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type HxMargin = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type HxDirection = 'dir-x' | 'dir-y';
export type HxFlexCellAlignSelf = 'auto' | 'start' | 'end' | 'center' | 'baseline' | 'stretch';
export type HxGridCellJustifySelf = 'stretch' | 'start' | 'end' | 'center';
export type HxGridCellAlignSelf = 'stretch' | 'start' | 'end' | 'center';
export type HxSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type HxOmittedDataAttributes =
	| 'data-hx-root' | 'data-hx-portal-root'
	// component types
	| 'data-hx-svg-icon'
	| 'data-hx-label'
	| 'data-hx-input' | 'data-hx-textarea'
	| 'data-hx-checkbox' | 'data-hx-m-checkbox'
	| 'data-hx-radio' | 'data-hx-m-radio'
	| 'data-hx-select'
	| 'data-hx-button'
	| 'data-hx-separator'
	| 'data-hx-box' | 'data-hx-flex' | 'data-hx-grid'
	| 'data-hx-panel'
	| 'data-hx-dialog'
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
	| 'data-hx-margin-t' | 'data-hx-margin-r' | 'data-hx-margin-b' | 'data-hx-margin-l'
	| 'data-hx-padding-x' | 'data-hx-padding-y' | 'data-hx-padding-t' | 'data-hx-padding-b'
	| 'data-hx-border' | 'data-hx-border-radius'
	| 'data-hx-cell-gap-x' | 'data-hx-cell-gap-y'
	| 'data-hx-justify-items' | 'data-hx-justify-content'
	| 'data-hx-align-items' | 'data-hx-align-content'
	// svg icon
	| 'data-hx-svg-icon-name'
	// label
	| 'data-hx-label-text' | 'data-hx-label-opaque'
	| 'data-hx-label-clickable' | 'data-hx-label-hoverable' | 'data-hx-label-active'
	| 'data-hx-label-input-placeholder'
	| 'data-hx-label-input-embed' | 'data-hx-label-svg-icon'
	// input
	| 'data-hx-input-box' | 'data-hx-input-inbox'
	// textarea
	| 'data-hx-textarea-box'
	| 'data-hx-textarea-rows' | 'data-hx-textarea-max-rows' | 'data-hx-textarea-resize'
	| 'data-hx-textarea-placeholder'
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
	// button
	| 'data-hx-button-various'
	| 'data-hx-text-uppercase'
	| 'data-hx-button-input-embed' | 'data-hx-button-svg-icon'
	// separator
	| 'data-hx-separator-direction' | 'data-hx-separator-size'
	// box
	// flex
	| 'data-hx-flex-direction' | 'data-hx-flex-wrap'
	// flex cell
	| 'data-hx-flex-cell-grow' | 'data-hx-flex-cell-align-self'
	// grid
	| 'data-hx-grid-columns'
	// grid cell
	| 'data-hx-grid-cell-row' | 'data-hx-grid-cell-rows' | 'data-hx-grid-cell-col' | 'data-hx-grid-cell-cols'
	| 'data-hx-grid-cell-justify-self' | 'data-hx-grid-cell-align-self'
	// panel
	| 'data-hx-panel-collapsible' | 'data-hx-panel-collapsed'
	| 'data-hx-panel-header' | 'data-hx-panel-title' | 'data-hx-panel-collapse-button'
	| 'data-hx-panel-body'
	// dialog
	| 'data-hx-dialog-backdrop' | 'data-hx-dialog-state'
	// popup
	| 'data-hx-popup-state' | 'data-hx-popup-avoid-transition'
	// temporary attributes
	| 'data-hx-temporary-display';

export type HxOmittedAttributes = HxOmittedDataAttributes;

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
				? (event: E,
				   model: HxObject<T>,
				   context: HxContext
				) => void
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
