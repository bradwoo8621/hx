import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ChangeEventHandler,
	type FocusEventHandler,
	type ForwardedRef,
	forwardRef,
	type InputEventHandler,
	type KeyboardEventHandler,
	type PropsWithoutRef,
	type ReactElement,
	type RefAttributes,
	type TextareaHTMLAttributes,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {type CheckPropSuppliedOn, useDataMonitor, useDelayedFunc} from '../../hooks';
import type {
	EditSingleFieldProps,
	HxDirection,
	HxHtmlElementProps,
	HxOmittedAttributes,
	ReadonlyProps
} from '../../types';
import {exposePropsToDOM, isSameStr} from '../../utils';
import {HxWithCheck, type HxWithCheckCreateOptions, type HxWithCheckProps} from '../with-check';
import {HxTextareaDefaults} from './defaults';

/**
 * Textarea resize behavior options
 * - none: no resize allowed (default)
 * - horizontal: allow horizontal resize only
 * - vertical: allow vertical resize only
 * - both: allow both horizontal and vertical resize
 */
export type HxTextareaResize = 'none' | 'both' | HxDirection;

/**
 * Extended props for HxTextarea component
 * Includes all standard form field props plus textarea-specific configuration
 */
export interface HxExtTextareaProps<T extends object>
	extends EditSingleFieldProps<T>, ReadonlyProps<T> {
	/** Whether to automatically select all text when textarea receives focus */
	selectAll?: boolean;
	/**
	 * When true, updates the model value only when textarea loses focus or Enter key is pressed.
	 * When false, updates model after emitChangeDelay milliseconds of inactivity.
	 */
	emitChangeOnBlur?: boolean;
	/**
	 * Delay in milliseconds before committing value to model when emitChangeOnBlur is false.
	 * Negative values will be clamped to 0.
	 */
	emitChangeDelay?: number;
	/** Number of visible text rows (minimum 2, default from global settings) */
	rows?: number;
	/** Resize behavior control - determines if and how user can resize the textarea */
	resize?: HxTextareaResize;
}

/**
 * HTML attributes that are omitted from base props to avoid conflicts
 * These properties are controlled directly by the component and should not be passed directly
 */
export type OmittedTextareaHTMLProps =
	| HxOmittedAttributes
	| 'disabled' | 'value'
	// validation attributes
	| 'minLength' | 'maxLength' | 'required'
	| 'rows' | 'cols' | 'wrap'
	| 'readOnly'
	| 'children';

export type HxTextareaProps<T extends object> = PropsWithoutRef<
	& HxExtTextareaProps<T>
	& HxHtmlElementProps<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>, OmittedTextareaHTMLProps, T>
>;

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
		const {
			$model, $field,
			selectAll = HxTextareaDefaults.selectAll,
			emitChangeOnBlur = HxTextareaDefaults.emitChangeOnBlur,
			emitChangeDelay: ecd = HxTextareaDefaults.emitChangeDelay,
			rows = HxTextareaDefaults.rows, resize = HxTextareaDefaults.resize,
			name, onFocus, onBlur, onChange, onKeyDown, onInput, ...rest
		} = props;

		/** Normalized emit change delay (clamped to non-negative value) */
		const emitChangeDelay = ecd < 0 ? 0 : ecd;

		/** HX context providing theme, i18n, and forceUpdate functionality */
		const context = useHxContext();
		/** Reactive state for visibility, disabled, and readonly props */
		const {visible, disabled, readonly} = useDataMonitor(props);

		/**
		 * Stores the last committed value to avoid duplicate change events
		 * Used to compare against current value when emitting change events
		 */
		const valueBeforeEmitRef = useRef<string | undefined>(ERO.getValue($model, $field));
		/** Tracks whether user is in IME composition mode (e.g. entering Chinese/Japanese text) */
		const compositionRef = useRef(false);
		/** Debounce function for delayed model updates */
		const {delay} = useDelayedFunc(emitChangeDelay);

		/** Focus event handler - handles select-all behavior and propagates to custom handler */
		let onTextareaFocus: FocusEventHandler<HTMLTextAreaElement> | undefined = (void 0);
		if (selectAll || onFocus != null) {
			onTextareaFocus = (ev) => {
				if (selectAll) {
					ev.target.select();
				}
				onFocus?.(ev, $model, context);
			};
		}

		// noinspection DuplicatedCode
		/**
		 * Commits the current textarea value to the model and triggers change event.
		 * Shared reusable logic for both blur and Enter key events to ensure consistent behavior.
		 * Handles value comparison, model update, and event emission.
		 *
		 * @param currentValue - The current textarea value to commit
		 */
		const commitCurrentValue = (currentValue: string) => {
			let targetValue: string | undefined = currentValue;
			if (targetValue.length === 0) {
				targetValue = (void 0);
			}
			const value = ERO.getValue($model, $field);
			const oldValue = valueBeforeEmitRef.current;
			if (isSameStr(value, targetValue)) {
				// Value in model already matches textarea value, no need to update model
				valueBeforeEmitRef.current = value;
				if (!isSameStr(oldValue, value)) {
					// Only emit event if value actually changed from last committed value
					valueBeforeEmitRef.current = value;
					ERO.emit($model, $field, oldValue, value);
				}
			} else {
				// Value differs between textarea and model, sync and emit event
				// 1. Update the reference tracking last committed value
				valueBeforeEmitRef.current = targetValue;
				// 2. Update model silently to avoid duplicate automatic events
				ERO.setValueSilent($model, $field, targetValue);
				// 3. Manually emit change event with correct old/new value pair
				ERO.emit($model, $field, oldValue, targetValue);
			}
		};

		/**
		 * Input event handler - tracks IME composition state
		 * Used to handle multi-byte character input correctly
		 */
		const onTextareaInput: InputEventHandler<HTMLTextAreaElement> = (ev) => {
			compositionRef.current = ev.nativeEvent.isComposing;
			onInput?.(ev, $model, context);
		};
		// noinspection DuplicatedCode
		/**
		 * Handle textarea value changes
		 * Behavior differs based on emitChangeOnBlur prop:
		 * - true: only update local display value, defer model update to blur event
		 * - false: debounce model update using emitChangeDelay
		 */
		const onTextareaChange: ChangeEventHandler<HTMLTextAreaElement> = (ev) => {
			let value: string | undefined = ev.target.value;
			if (value.length === 0) {
				value = (void 0);
			}

			// if (compositionRef.current) {
			// 	// composition mode
			// 	// if (value != ERO.getValue($model, $field)) {
			// 	//
			// 	// }
			// 	console.log(value);
			// } else
			if (emitChangeOnBlur) {
				// set value but mute the leaf event
				ERO.setValueSilent($model, $field, value, 'mute-leaf');
			} else if (emitChangeDelay > 0) {
				// set value but mute the leaf event
				ERO.setValueSilent($model, $field, value, 'mute-leaf');
				delay('input-change', async () => {
					// set old value as current value
					const oldValue = valueBeforeEmitRef.current;
					// update the old value ref
					valueBeforeEmitRef.current = value;
					// emit event
					ERO.emit($model, $field, oldValue, value);
				});
			} else {
				// update the old value ref
				valueBeforeEmitRef.current = value;
				// set value and emit event
				ERO.setValue($model, $field, value);
			}
			context.forceUpdate();
			onChange?.(ev, $model, context);
		};

		/**
		 * Handle keyboard input events.
		 * Only active when emitChangeOnBlur is true:
		 * - Pressing Enter key commits the current value immediately (same behavior as blur event)
		 * - Supports form submission workflows without requiring users to tab away from the textarea
		 *
		 * @param ev - Keyboard event object
		 */
		const onTextareaKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (ev) => {
			if (emitChangeOnBlur && ev.key === 'Enter') {
				commitCurrentValue(ev.currentTarget.value);
			}
			// Propagate key event to custom handler with standard component event parameters
			onKeyDown?.(ev, $model, context);
		};

		/**
		 * Handle textarea blur event
		 * - Clears pending debounced updates only when in debounce mode
		 * - Updates model immediately if emitChangeOnBlur is true
		 */
		const onTextareaBlur: FocusEventHandler<HTMLTextAreaElement> = (ev) => {
			if (emitChangeOnBlur) {
				commitCurrentValue(ev.target.value);
			}
			// Propagate blur event to user-provided handler
			onBlur?.(ev, $model, context);
		};

		/** Current value from the reactive model */
		const value = ERO.getValue($model, $field) ?? '';
		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);

		/**
		 * Render the native textarea element
		 * All dynamic state is exposed via data attributes for CSS styling
		 */
		return <textarea {...restProps}
		                 name={name ?? ERO.pathOf($model, $field)}
		                 value={value}
		                 onInput={onTextareaInput} onChange={onTextareaChange}
		                 onFocus={onTextareaFocus} onBlur={onTextareaBlur}
		                 onKeyDown={onTextareaKeyDown}
		                 data-hx-textarea=""
		                 data-hx-textarea-rows={rows} data-hx-textarea-resize={resize}
		                 data-hx-visible={visible ?? true}
		                 data-hx-disabled={disabled ?? false} disabled={disabled ?? false}
		                 data-hx-readonly={readonly ?? false} readOnly={readonly ?? false}
		                 ref={ref}/>;
	}) as unknown as HxTextareaType;
// @ts-expect-error assign component name
HxTextarea.displayName = 'HxTextarea';

/**
 * Configuration options for HxWithCheck wrapper
 * Defines how validation context is supplied to the textarea component
 */
const HxWithCheckTextareaOptions: HxWithCheckCreateOptions<object, HxTextareaProps<object>> = {
	$supplyOn: (props: HxTextareaProps<object>): CheckPropSuppliedOn => {
		// Validation is tied to the $field prop of the textarea
		return props.$field;
	}
};
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
	props: HxWithCheckProps<T, HxTextareaProps<T>> & RefAttributes<HTMLTextAreaElement>
) => ReactElement | null;
/**
 * Textarea component with built-in form validation features.
 * Supports all HxTextarea props plus additional validation rules from HxWithCheck.
 */
export const HxWithCheckTextarea = HxWithCheck(HxTextarea, HxWithCheckTextareaOptions) as unknown as HxWithCheckTextareaType;
// @ts-expect-error assign component name
HxWithCheckTextarea.displayName = 'HxWithCheckTextarea';
