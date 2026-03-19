import {type DetailedHTMLProps, type DispatchWithoutAction, type HTMLAttributes, type SyntheticEvent} from 'react';
import type {HxContext} from '../contexts';
import type {HxObject} from '../types';

export type HxColor = 'primary' | 'success' | 'warn' | 'danger' | 'info' | 'waive';
export type HxBorderRadius = 'none' | 'sm' | 'md' | 'lg';
export type HxGap = 'none' | 'sm' | 'md' | 'lg';
export type HxDirection = 'dir-x' | 'dir-y';

export type HxOmittedDataAttributes =
// component type
	| 'data-hx-label'
	| 'data-hx-input'
	| 'data-hx-button'
	| 'data-hx-with-check'
	| 'data-hx-flex'
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
	| 'data-hx-flex-direction' | 'data-hx-flex-border' | 'data-hx-flex-gap-x' | 'data-hx-flex-gap-y';

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
