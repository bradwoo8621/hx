import {type DetailedHTMLProps, type DispatchWithoutAction, type HTMLAttributes, type SyntheticEvent} from 'react';
import type {HxContext} from '../contexts';
import type {HxObject} from '../types';

export type HxColor = 'primary' | 'success' | 'warn' | 'danger' | 'info' | 'waive';
export type HxBorderRadius = 'none' | 'sm' | 'md' | 'lg';
export type HxGap = 'none' | 'sm' | 'md' | 'lg';
export type HxPadding = 'none' | 'sm' | 'md' | 'lg';
export type HxDirection = 'dir-x' | 'dir-y';
export type HxFlexCellAlignSelf = 'auto' | 'start' | 'end' | 'center' | 'baseline' | 'stretch';
export type HxGridCellJustifySelf = 'stretch' | 'start' | 'end' | 'center';
export type HxGridCellAlignSelf = 'stretch' | 'start' | 'end' | 'center';

export type HxOmittedDataAttributes =
// component type
	| 'data-hx-label'
	| 'data-hx-input'
	| 'data-hx-button'
	| 'data-hx-with-check'
	| 'data-hx-flex'
	| 'data-hx-grid'
	// standard component attributes
	// common part, for multiple components
	| 'data-hx-visible' | 'data-hx-disabled' | 'data-hx-readonly'
	| 'data-hx-color'
	// button
	| 'data-hx-button-various'
	| 'data-hx-text-uppercase'
	// label
	| 'data-hx-label-role'
	// flex
	| 'data-hx-flex-direction' | 'data-hx-flex-wrap'
	| 'data-hx-flex-justify-content'
	| 'data-hx-flex-align-items' | 'data-hx-flex-align-content'
	| 'data-hx-flex-border' | 'data-hx-flex-border-radius'
	| 'data-hx-flex-gap-x' | 'data-hx-flex-gap-y'
	| 'data-hx-flex-padding-x' | 'data-hx-flex-padding-t' | 'data-hx-flex-padding-b'
	// flex cell
	| 'data-hx-flex-grow' | 'data-hx-flex-align-self'
	// grid
	| 'data-hx-grid-columns'
	| 'data-hx-grid-border' | 'data-hx-grid-border-radius'
	| 'data-hx-grid-gap-x' | 'data-hx-grid-gap-y'
	| 'data-hx-grid-padding-x' | 'data-hx-grid-padding-t' | 'data-hx-grid-padding-b'
	// grid cell
	| 'data-hx-grid-row' | 'data-hx-grid-rows' | 'data-hx-grid-col' | 'data-hx-grid-cols'
	| 'data-hx-grid-justify-self' | 'data-hx-grid-align-self';

export type HxOmittedAttributes = HxOmittedDataAttributes;

// utilities
/**
 * Transform all React event listeners (with property names starting with `onXxx`)
 * while preserving the first parameter `event` in the function signature and adding three parameters:
 * - model: HxObject<T>,
 * - context: HxContext,
 * - forceUpdate: DispatchWithoutAction
 */
export type HxWrappedReactEvents<P, T extends object> = {
	[K in keyof P]: K extends `on${Capitalize<string>}`
		? (P[K] extends (((event: infer E) => void) | undefined)
			? (E extends SyntheticEvent
				? (event: E,
				   model: HxObject<T>,
				   context: HxContext,
				   forceUpdate: DispatchWithoutAction
				) => void
				: P[K])
			: P[K])
		: P[K];
};
export type HtmlElementProps<E extends HTMLElement, EA extends HTMLAttributes<E>> = DetailedHTMLProps<EA, E>;
export type HxHtmlElementProps<
	E extends HTMLElement,
	EA extends HTMLAttributes<E>,
	O extends keyof HtmlElementProps<E, EA> | `data-hx-${string}`,
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