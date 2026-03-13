import type {ReactiveObject} from '@hx/data';
import {type DetailedHTMLProps, type DispatchWithoutAction, type HTMLAttributes, type SyntheticEvent} from 'react';
import type {HxContext} from '../contexts';

export type HxColor = 'primary' | 'success' | 'warn' | 'danger' | 'info' | 'waive';

export type HxOmittedDataAttributes =
// component type
	| 'data-hx-input' | 'data-hx-button'
	// standard component attributes
	| 'data-hx-visible' | 'data-hx-disabled' | 'data-hx-readonly'
	| 'data-hx-color'
	| 'data-hx-various';

export type HxOmittedHtmlAttributes =
	| 'disabled'
	| 'type'
	| 'value';

export type HxOmittedAttributes =
	| HxOmittedDataAttributes
	| HxOmittedHtmlAttributes;

// utilities
/**
 * Transform all React event listeners (with property names starting with `onXxx`)
 * while preserving the first parameter `event` in the function signature and adding three parameters:
 * - model: ReactiveObject & M,
 * - context: HxContext,
 * - forceUpdate: DispatchWithoutAction
 */
export type HxWrappedReactEvents<T, M extends object> = {
	[K in keyof T]: K extends `on${Capitalize<string>}`
		? (T[K] extends (((event: infer E) => void) | undefined)
			? (E extends SyntheticEvent
				? (event: E,
				   model: ReactiveObject & M,
				   context: HxContext,
				   forceUpdate: DispatchWithoutAction
				) => void
				: T[K])
			: T[K])
		: T[K];
};
export type HtmlElementProps<E extends HTMLElement, EA extends HTMLAttributes<E>> = DetailedHTMLProps<EA, E>;
export type HxHtmlElementProps<
	E extends HTMLElement,
	EA extends HTMLAttributes<E>,
	O extends keyof HtmlElementProps<E, EA> | `data-hx-${string}`,
	M extends object
> = HxWrappedReactEvents<Omit<HtmlElementProps<E, EA>, O>, M>;

