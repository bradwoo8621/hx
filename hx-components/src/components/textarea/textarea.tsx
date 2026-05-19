// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxTextareaInner} from './inner';
import type {HxTextareaBaseInnerProps, HxTextareaInnerProps} from './types';

export type HxTextareaProps<T extends object> = HxTextareaBaseInnerProps<T>;
export type HxTextareaType = <T extends object>(
	props: HxTextareaProps<T> & RefAttributes<HTMLTextAreaElement>
) => ReactElement | null;

/**
 * Reactive textarea component with two-way data binding to hx-data models.
 * Supports both immediate debounced updates and blur-only update modes.
 *
 * @example
 * ```tsx
 * // Default: debounced updates after 100ms of inactivity
 * <HxTextarea $model={userModel} $field="username" />
 * ```
 *
 * @example
 * ```tsx
 * // Blur-only mode: update only when textarea loses focus or Enter is pressed
 * <HxTextarea $model={formModel} $field="email" emitChangeOnBlur />
 * ```
 *
 * @example
 * ```tsx
 * // Custom debounce delay: 300ms
 * <HxTextarea $model={searchModel} $field="query" emitChangeDelay={300} />
 * ```
 *
 * @features
 * - Automatic two-way binding to reactive data models
 * - Two update modes: debounced (default) and blur-only
 * - Enter key commit support in blur mode
 * - Select-all text on focus option
 * - Configurable resize behavior (none/horizontal/vertical/both)
 * - Built-in disabled/readonly/visible state management
 * - Configurable number of visible rows
 */
export const HxTextarea =
	forwardRef(<T extends object>(props: HxTextareaProps<T>, ref: ForwardedRef<HTMLTextAreaElement>) => {
		return <HxTextareaInner {...props} $withCheck={false} ref={ref}/>;
	}) as unknown as HxTextareaType;
// @ts-expect-error assign component name
HxTextarea.displayName = 'HxTextarea';

export type HxWithCheckTextareaProps<T extends object> = Omit<HxTextareaInnerProps<T>, '$domBox' | '$supplyOn'>;
/**
 * Textarea component with built-in validation support.
 * Combines HxTextarea functionality with HxWithCheck validation capabilities.
 *
 * @example
 * ```tsx
 * <HxWithCheckTextarea
 *   $model={formModel}
 *   $field="email"
 *   $check={...}
 * />
 * ```
 */
export type HxWithCheckTextareaType = <T extends object>(
	props: HxWithCheckTextareaProps<T> & RefAttributes<HTMLTextAreaElement>
) => ReactElement | null;
/**
 * Textarea component with built-in form validation features.
 * Supports all HxTextarea props plus additional validation rules from HxWithCheck.
 */
export const HxWithCheckTextarea = forwardRef(<T extends object>(props: HxWithCheckTextareaProps<T>, ref: ForwardedRef<HTMLTextAreaElement>) => {
	// @ts-expect-error ignore the $supplyOn type check
	return <HxTextareaInner {...props}
	                        $supplyOn={HxWithCheckWithSingleFieldOptions.$supplyOn} $withCheck={true}
	                        ref={ref}/>;
}) as unknown as HxWithCheckTextareaType;
// @ts-expect-error assign component name
HxWithCheckTextarea.displayName = 'HxWithCheckTextarea';
