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
	| 'data-hx-margin-t' | 'data-hx-margin-r' | 'data-hx-margin-b' | 'data-hx-margin-l'
	| 'data-hx-padding-x' | 'data-hx-padding-y' | 'data-hx-padding-t' | 'data-hx-padding-b'
	// icon
	| 'data-hx-icon'
	// label
	| 'data-hx-label-text' | 'data-hx-label-opaque'
	| 'data-hx-label-border-radius'
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
	| 'data-hx-m-checkbox-gap-x' | 'data-hx-m-checkbox-gap-y'
	// radio
	| 'data-hx-radio-checked' | 'data-hx-radio-curtain'
	// m-radio
	| 'data-hx-m-radio-direction' | 'data-hx-m-radio-lanes'
	| 'data-hx-m-radio-gap-x' | 'data-hx-m-radio-gap-y'
	// select
	| 'data-hx-select-icon' | 'data-hx-select-options' | 'data-hx-select-option'
	// button
	| 'data-hx-button-various'
	| 'data-hx-text-uppercase'
	| 'data-hx-button-input-embed' | 'data-hx-button-svg-icon'
	// separator
	| 'data-hx-separator-direction' | 'data-hx-separator-size'
	| 'data-hx-separator-margin-x' | 'data-hx-separator-margin-y'
	// box
	| 'data-hx-box-border' | 'data-hx-box-border-radius'
	// flex
	| 'data-hx-flex-direction' | 'data-hx-flex-wrap'
	| 'data-hx-flex-justify-content'
	| 'data-hx-flex-align-items' | 'data-hx-flex-align-content'
	| 'data-hx-flex-border' | 'data-hx-flex-border-radius'
	| 'data-hx-flex-gap-x' | 'data-hx-flex-gap-y'
	// flex cell
	| 'data-hx-flex-grow' | 'data-hx-flex-align-self'
	// grid
	| 'data-hx-grid-columns'
	| 'data-hx-grid-justify-items' | 'data-hx-grid-justify-content'
	| 'data-hx-grid-align-items' | 'data-hx-grid-align-content'
	| 'data-hx-grid-border' | 'data-hx-grid-border-radius'
	| 'data-hx-grid-gap-x' | 'data-hx-grid-gap-y'
	// grid cell
	| 'data-hx-grid-row' | 'data-hx-grid-rows' | 'data-hx-grid-col' | 'data-hx-grid-cols'
	| 'data-hx-grid-justify-self' | 'data-hx-grid-align-self'
	// panel
	| 'data-hx-panel-border' | 'data-hx-panel-border-radius'
	| 'data-hx-panel-collapsible' | 'data-hx-panel-collapsed' | 'data-hx-panel-collapse-button'
	| 'data-hx-panel-header' | 'data-hx-panel-title'
	| 'data-hx-panel-body'
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

export interface FlexCellProps {
	fGrow?: number;
	fAlignSelf?: HxFlexCellAlignSelf;
}

export interface GridCellProps {
	gRow?: number;
	gRows?: number;
	gCol?: number;
	gCols?: number;
	gJustifySelf?: HxGridCellJustifySelf;
	gAlignSelf?: HxGridCellAlignSelf;
}

export interface WidthConstrainedProps {
	minWidth?: HxSize | number | string;
	width?: HxSize | number | string;
	maxWidth?: HxSize | number | string;
}

export interface HeightConstrainedProps {
	minHeight?: HxSize | number | string;
	height?: HxSize | number | string;
	maxHeight?: HxSize | number | string;
}

// usually usages
export interface RectX {
	width?: number;
}

export interface RectY {
	height?: number;
}

export interface Rect extends RectX, RectY {
}

export interface RectXRange {
	minWidth?: number;
	maxWidth?: number;
}

export interface RectYRange {
	minHeight?: number;
	maxHeight?: number;
}

export interface RectRange extends RectXRange, RectYRange {
}

export interface AbsolutePosition extends Rect {
	top?: number;
	left?: number;
	right?: number;
	bottom?: number;
}