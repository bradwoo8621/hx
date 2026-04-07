import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ChangeEventHandler,
	type CompositionEventHandler,
	type FocusEventHandler,
	type ForwardedRef,
	forwardRef,
	type InputHTMLAttributes,
	type KeyboardEventHandler,
	type PropsWithoutRef,
	type ReactElement,
	type RefAttributes,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {type CheckPropSuppliedOn, useDataMonitor, useDelayedFunc} from '../../hooks';
import type {
	EditSingleFieldProps,
	HxHtmlElementProps,
	HxOmittedAttributes,
	ReadonlyProps,
	WidthConstrainedProps
} from '../../types';
import {exposePropsToDOM, isSameStr} from '../../utils';
import {HxWithCheck, type HxWithCheckCreateOptions, type HxWithCheckProps} from '../with-check';
import {HxInputDefaults} from './defaults';

export interface HxExtInputProps<T extends object>
	extends EditSingleFieldProps<T>, ReadonlyProps<T>, WidthConstrainedProps {
	/**
	 * rewrite the value of type attribute of HTML input, only 'text' and 'password' are supported
	 */
	type?: 'text' | 'password';
	/**
	 * select all text on focus
	 */
	selectAll?: boolean;
	/**
	 * When true, updates the model value only when input loses focus or Enter key is pressed.
	 * When false, updates model after emitChangeDelay milliseconds of inactivity.
	 */
	emitChangeOnBlur?: boolean;
	/**
	 * Delay in milliseconds before committing value to model when emitChangeOnBlur is false.
	 * Negative values will be clamped to 0.
	 */
	emitChangeDelay?: number;
}

export type OmittedInputHTMLProps =
	| HxOmittedAttributes
	| 'disabled' | 'type' | 'value'
	// validation attributes
	| 'minLength' | 'maxLength' | 'required' | 'multiple' | 'pattern' | 'size'
	| 'height' | 'width'
	| 'readOnly' | 'checked'
	| 'children';

export type HxInputProps<T extends object> = PropsWithoutRef<
	& HxExtInputProps<T>
	& HxHtmlElementProps<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>, OmittedInputHTMLProps, T>
>;

export type HxInputType = <T extends object>(
	props: HxInputProps<T> & RefAttributes<HTMLInputElement>
) => ReactElement | null;

/**
 * Reactive input component with two-way data binding to hx-data models.
 * Supports both immediate debounced updates and blur-only update modes.
 *
 * @example
 * ```tsx
 * // Default: debounced updates after 100ms of inactivity
 * <HxInput $model={userModel} $field="username" />
 * ```
 *
 * @example
 * ```tsx
 * // Blur-only mode: update only when input loses focus or Enter is pressed
 * <HxInput $model={formModel} $field="email" emitChangeOnBlur />
 * ```
 *
 * @example
 * ```tsx
 * // Custom debounce delay: 300ms
 * <HxInput $model={searchModel} $field="query" emitChangeDelay={300} />
 * ```
 *
 * @features
 * - Automatic two-way binding to reactive data models
 * - Two update modes: debounced (default) and blur-only
 * - Enter key commit support in blur mode
 * - Select-all text on focus option
 * - Built-in disabled/readonly/visible state management
 * - Supports both text and password input types
 */
export const HxInput =
	forwardRef(<T extends object>(props: HxInputProps<T>, ref: ForwardedRef<HTMLInputElement>) => {
		const {
			$model, $field,
			selectAll = HxInputDefaults.selectAll,
			emitChangeOnBlur = HxInputDefaults.emitChangeOnBlur,
			emitChangeDelay: ecd = HxInputDefaults.emitChangeDelay,
			name, onFocus, onBlur, onChange, onKeyDown, onCompositionStart, onCompositionEnd, ...rest
		} = props;

		const emitChangeDelay = ecd < 0 ? 0 : ecd;

		const context = useHxContext();
		const {visible, disabled, readonly} = useDataMonitor(props);

		// Local state storage for input value when emitChangeOnBlur is false and emitChangeDelay is not zero
		// Allows input to display typed value immediately without updating the model
		const valueBeforeEmitRef = useRef<string | undefined>(ERO.getValue($model, $field));
		const compositionRef = useRef({enabled: false, text: ''});
		/** Debounce function for delayed model updates */
		const {delay} = useDelayedFunc(emitChangeDelay);

		/** Focus event handler - handles select-all behavior and propagates to custom handler */
		let onInputFocus: FocusEventHandler<HTMLInputElement> | undefined = (void 0);
		if (selectAll || onFocus != null) {
			onInputFocus = (ev) => {
				if (selectAll) {
					ev.target.select();
				}
				onFocus?.(ev, $model, context);
			};
		}

		// noinspection DuplicatedCode
		/**
		 * Commits the current input value to the model and triggers change event.
		 * Shared reusable logic for both blur and Enter key events to ensure consistent behavior.
		 * Handles value comparison, model update, and event emission.
		 *
		 * @param currentValue - The current input value to commit
		 */
		const commitCurrentValue = (currentValue: string) => {
			let targetValue: string | undefined = currentValue;
			if (targetValue.length === 0) {
				targetValue = (void 0);
			}
			const value = ERO.getValue($model, $field);
			const oldValue = valueBeforeEmitRef.current;
			if (isSameStr(value, targetValue)) {
				// Value in model already matches input value, no need to update model
				valueBeforeEmitRef.current = value;
				if (!isSameStr(oldValue, value)) {
					// Only emit event if value actually changed from last committed value
					valueBeforeEmitRef.current = value;
					ERO.emit($model, $field, oldValue, value);
				}
			} else {
				// Value differs between input and model, sync and emit event
				// 1. Update the reference tracking last committed value
				valueBeforeEmitRef.current = targetValue;
				// 2. Update model silently to avoid duplicate automatic events
				ERO.setValueSilent($model, $field, targetValue);
				// 3. Manually emit change event with correct old/new value pair
				ERO.emit($model, $field, oldValue, targetValue);
			}
		};
		const onTextValueChange = (text: string) => {
			let value: string | undefined = text;
			if (value.length === 0) {
				value = (void 0);
			}
			if (compositionRef.current.enabled) {
				// composition mode
				compositionRef.current.text = text;
			} else {
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
			}
			context.forceUpdate();
		};
		/**
		 * Handle input value changes
		 * Behavior differs based on emitChangeOnBlur prop:
		 * - true: only update local display value, defer model update to blur event
		 * - false: debounce model update using emitChangeDelay
		 */
		const onInputChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
			onTextValueChange(ev.target.value);
			onChange?.(ev, $model, context);
		};
		const onInputCompositionStart: CompositionEventHandler<HTMLInputElement> = (ev) => {
			compositionRef.current.enabled = true;
			onCompositionStart?.(ev, $model, context);
		};
		const onInputCompositionEnd: CompositionEventHandler<HTMLInputElement> = (ev) => {
			compositionRef.current.enabled = false;
			onTextValueChange((ev.target as HTMLInputElement).value);
			onCompositionEnd?.(ev, $model, context);
		};
		/**
		 * Handle keyboard input events.
		 * Only active when emitChangeOnBlur is true:
		 * - Pressing Enter key commits the current value immediately (same behavior as blur event)
		 * - Supports form submission workflows without requiring users to tab away from the input
		 *
		 * @param ev - Keyboard event object
		 */
		const onInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (ev) => {
			if (emitChangeOnBlur && ev.key === 'Enter') {
				commitCurrentValue(ev.currentTarget.value);
			}
			// Propagate key event to custom handler with standard component event parameters
			onKeyDown?.(ev, $model, context);
		};

		/**
		 * Handle input blur event
		 * - Clears pending debounced updates only when in debounce mode
		 * - Updates model immediately if emitChangeOnBlur is true
		 */
		const onInputBlur: FocusEventHandler<HTMLInputElement> = (ev) => {
			if (emitChangeOnBlur) {
				commitCurrentValue(ev.target.value);
			}
			// Propagate blur event to user-provided handler
			onBlur?.(ev, $model, context);
		};

		// eslint-disable-next-line react-hooks/refs
		const value = (compositionRef.current.enabled ? compositionRef.current.text : ERO.getValue($model, $field)) ?? '';
		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);

		return <input {...restProps}
		              name={name ?? ERO.pathOf($model, $field)} type={rest.type ?? 'text'}
			// eslint-disable-next-line react-hooks/refs
			          value={value}
			          onChange={onInputChange}
			          onFocus={onInputFocus} onBlur={onInputBlur} onKeyDown={onInputKeyDown}
			          onCompositionStart={onInputCompositionStart} onCompositionEnd={onInputCompositionEnd}
			          data-hx-input=""
			          data-hx-visible={(visible ?? true) ? '' : (void 0)}
			          data-hx-disabled={(disabled ?? false) ? '' : (void 0)} disabled={disabled ?? false}
			          data-hx-readonly={readonly ?? false} readOnly={readonly ?? false}
			          ref={ref}/>;
	}) as unknown as HxInputType;
// @ts-expect-error assign component name
HxInput.displayName = 'HxInput';

/** input with check */
const HxWithCheckInputOptions: HxWithCheckCreateOptions<object, HxInputProps<object>> = {
	$supplyOn: (props: HxInputProps<object>): CheckPropSuppliedOn => {
		return props.$field;
	}
};
/**
 * Input component with built-in validation support.
 * Combines HxInput functionality with HxWithCheck validation capabilities.
 *
 * @example
 * ```tsx
 * <HxWithCheckInput
 *   $model={formModel}
 *   $field="email"
 *   $check={...}
 * />
 * ```
 */
export type HxWithCheckInputType = <T extends object>(
	props: HxWithCheckProps<T, HxInputProps<T>> & RefAttributes<HTMLInputElement>
) => ReactElement | null;
/**
 * Input component with built-in form validation features.
 * Supports all HxInput props plus additional validation rules from HxWithCheck.
 */
export const HxWithCheckInput = HxWithCheck(HxInput, HxWithCheckInputOptions) as unknown as HxWithCheckInputType;
// @ts-expect-error assign component name
HxWithCheckInput.displayName = 'HxWithCheckInput';
