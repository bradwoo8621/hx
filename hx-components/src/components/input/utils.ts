import {ERO, type ModelPath} from '@hx/data';
import {
	type CompositionEvent,
	type CompositionEventHandler,
	type FocusEvent,
	type FocusEventHandler,
	type KeyboardEvent,
	type KeyboardEventHandler,
	type MutableRefObject
} from 'react';
import type {HxContext} from '../../contexts';
import type {AddOrReplaceDelayedFunc} from '../../hooks';
import type {HxDataPath, HxObject, HxSyntheticEventHandler} from '../../types';

export interface HxInputFocusHandlerOptions<T extends object, E extends HTMLInputElement | HTMLTextAreaElement> {
	$model?: HxObject<T>;
	context: HxContext;
	onFocus?: HxSyntheticEventHandler<FocusEvent<E>, T>;
	selectAll?: boolean;
}

/**
 * Focus event handler - handles select-all behavior and propagates to custom handler
 */
export const createHxInputFocusHandler = <T extends object, E extends HTMLInputElement | HTMLTextAreaElement>(options: HxInputFocusHandlerOptions<T, E>): FocusEventHandler<E> | undefined => {
	const {$model, context, onFocus, selectAll} = options;

	/** Focus event handler - handles select-all behavior and propagates to custom handler */
	let onInputFocus: FocusEventHandler<E> | undefined = (void 0);
	if (selectAll || onFocus != null) {
		onInputFocus = (ev) => {
			if (selectAll) {
				ev.target.select();
			}
			onFocus?.(ev, $model, context);
		};
	}

	return onInputFocus;
};

export interface HxInputKeyDownHandlerOptions<T extends object, E extends HTMLInputElement | HTMLTextAreaElement> {
	$model?: HxObject<T>;
	context: HxContext;
	onKeyDown?: HxSyntheticEventHandler<KeyboardEvent<E>, T>;
	emitChangeOnBlur?: boolean;
	commitCurrentValue: (text: string) => void;
}

/**
 * Handle keyboard input events.
 * Only active when emitChangeOnBlur is true:
 * - Pressing Enter key commits the current value immediately (same behavior as blur event)
 * - Supports form submission workflows without requiring users to tab away from the input
 */
export const createHxInputKeyDownHandler = <T extends object, E extends HTMLInputElement | HTMLTextAreaElement>(options: HxInputKeyDownHandlerOptions<T, E>): KeyboardEventHandler<E> => {
	const {$model, context, onKeyDown, emitChangeOnBlur, commitCurrentValue} = options;

	return (ev) => {
		if (emitChangeOnBlur && ev.key === 'Enter') {
			commitCurrentValue(ev.currentTarget.value);
		}
		// Propagate key event to custom handler with standard component event parameters
		onKeyDown?.(ev, $model, context);
	};
};

export interface HxInputCompositionState {
	enabled: boolean;
	text: string;
}

export interface HxInputCompositionStartHandlerOptions<T extends object, E extends HTMLInputElement | HTMLTextAreaElement> {
	$model?: HxObject<T>;
	context: HxContext;
	onCompositionStart?: HxSyntheticEventHandler<CompositionEvent<E>, T>;
	compositionRef: MutableRefObject<HxInputCompositionState>;
}

export const createHxInputCompositionStartHandler = <T extends object, E extends HTMLInputElement | HTMLTextAreaElement>(options: HxInputCompositionStartHandlerOptions<T, E>): CompositionEventHandler<E> => {
	const {$model, context, onCompositionStart, compositionRef} = options;

	return (ev) => {
		compositionRef.current.enabled = true;
		onCompositionStart?.(ev, $model, context);
	};
};

export interface HxInputCompositionEndHandlerOptions<T extends object, E extends HTMLInputElement | HTMLTextAreaElement> {
	$model?: HxObject<T>;
	context: HxContext;
	onCompositionEnd?: HxSyntheticEventHandler<CompositionEvent<E>, T>;
	compositionRef: MutableRefObject<HxInputCompositionState>;
	onTextValueChange: (text: string) => void;
}

export const createHxInputCompositionEndHandler = <T extends object, E extends HTMLInputElement | HTMLTextAreaElement>(options: HxInputCompositionEndHandlerOptions<T, E>): CompositionEventHandler<E> => {
	const {$model, context, onCompositionEnd, onTextValueChange, compositionRef} = options;

	return (ev) => {
		compositionRef.current.enabled = false;
		onTextValueChange((ev.target as HTMLInputElement).value);
		onCompositionEnd?.(ev, $model, context);
	};
};

export interface HxInputBlurHandlerOptions<T extends object, E extends HTMLInputElement | HTMLTextAreaElement> {
	$model?: HxObject<T>;
	context: HxContext;
	onBlur?: HxSyntheticEventHandler<FocusEvent<E>, T>;
	emitChangeOnBlur?: boolean;
	commitCurrentValue: (text: string) => void;
}

/**
 * Handle input blur event
 * - Clears pending debounced updates only when in debounce mode
 * - Updates model immediately if emitChangeOnBlur is true
 */
export const createHxInputBlurHandler = <T extends object, E extends HTMLInputElement | HTMLTextAreaElement>(options: HxInputBlurHandlerOptions<T, E>): FocusEventHandler<E> => {
	const {$model, context, onBlur, emitChangeOnBlur, commitCurrentValue} = options;

	return (ev) => {
		if (emitChangeOnBlur) {
			commitCurrentValue(ev.target.value);
		}
		// Propagate blur event to user-provided handler
		onBlur?.(ev, $model, context);
	};
};

export interface CreateCommitCurrentValueOptions<T extends object> {
	$model: HxObject<T>;
	$field: ModelPath<T> | HxDataPath;
	/**
	 * convert the display string to model value.
	 *  use the display string as model value when not provided.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toModelValue?: (text?: string | null) => any;
	/** always save the display text, or undefined when display text is empty */
	valueBeforeEmitRef: MutableRefObject<string | null | undefined>;
}

/**
 * Creates a commit handler that persists the current input display value
 * to the data model and emits a change event when the value has actually
 * changed.
 *
 * The handler compares the current input text (converted to a normalized
 * string via `asStr`) against the model's current value and the last
 * emitted value to avoid duplicate events.
 *
 * @param options - Configuration options.
 * @param options.toModelValue - Optional converter from display string to
 *   model value. When omitted, the display string is used as the model value.
 * @param options.valueBeforeEmitRef - Ref tracking the last emitted display
 *   value for deduplication.
 * @returns A handler function `(text: string) => void` suitable for use as
 *   a blur or Enter key callback.
 */
export const createCommitCurrentValue = <T extends object>(options: CreateCommitCurrentValueOptions<T>): ((text: string) => void) => {
	const {
		$model, $field,
		toModelValue,
		valueBeforeEmitRef
	} = options;

	// given currentValue is display string
	return (text: string) => {
		// display text in input
		const value: string | undefined = (text == null || text.length === 0) ? (void 0) : text;
		const modelValue = toModelValue == null ? value : toModelValue(value);

		// model
		let currentModelValue = ERO.getValue($model, $field);
		currentModelValue = (currentModelValue == null || (typeof currentModelValue === 'string' && currentModelValue.length === 0))
			? (void 0)
			: currentModelValue;

		// emitted
		let emittedValue = valueBeforeEmitRef.current;
		emittedValue = (emittedValue == null || emittedValue.length === 0) ? (void 0) : emittedValue;
		const emittedModelValue = toModelValue == null ? emittedValue : toModelValue(emittedValue);

		// Update the reference tracking last committed value
		valueBeforeEmitRef.current = value;
		if (modelValue == currentModelValue) {
			// Value in model already matches input value, no need to update model
			// check the last emitted value
			// Only emit event if value actually changed from last committed value
			if (emittedModelValue != currentModelValue) {
				ERO.emit($model, $field, emittedModelValue, currentModelValue);
			}
		} else {
			// Value differs between input and model, sync and emit event
			// Update model silently to avoid duplicate automatic events
			ERO.setValueSilent($model, $field, modelValue);
			// Manually emit change event with correct old/new value pair
			ERO.emit($model, $field, emittedModelValue, modelValue);
		}
	};
};

export interface CreateOnTextValueChangeOptions<T extends object> {
	$model: HxObject<T>;
	$field: ModelPath<T> | HxDataPath;
	/**
	 * convert the display string to model value.
	 *  use the display string as model value when not provided.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toModelValue?: (text?: string | null) => any;
	emitChangeOnBlur: boolean;
	emitChangeDelay: number;
	delay: AddOrReplaceDelayedFunc;
	context: HxContext;
	compositionRef: MutableRefObject<HxInputCompositionState>;
	/** always save the display text, or undefined when display text is empty */
	valueBeforeEmitRef: MutableRefObject<string | null | undefined>;
}

/**
 * Creates a text value change handler that synchronizes the input display value
 * to the data model with configurable update strategies.
 *
 * **Update modes** (controlled by `emitChangeOnBlur` and `emitChangeDelay`):
 * - **Composition**: when IME composition is active, text is buffered in
 *   `compositionRef` without touching the model.
 * - **Blur mode** (`emitChangeOnBlur`): updates the model silently via
 *   `setValueSilent`, deferring the change event to the blur/Enter commit.
 * - **Debounce mode** (`emitChangeDelay > 0`): updates the model silently
 *   and schedules a delayed change event emission.
 * - **Immediate mode** (not any of above): updates the model and emits the change
 *   event synchronously via `setValue`.
 *
 * @param options - Configuration options.
 * @param options.toModelValue - Optional converter from display string to
 *   model value. When omitted, the display string is used as the model value.
 * @param options.valueBeforeEmitRef - Ref tracking the last emitted display
 *   value for deduplication.
 * @returns A handler function `(text: string) => void` suitable for use as
 *   an `onChange` or `onCompositionEnd` callback.
 */
export const createOnTextValueChange = <T extends object>(options: CreateOnTextValueChangeOptions<T>): ((text: string) => void) => {
	const {
		$model, $field,
		toModelValue,
		emitChangeOnBlur, emitChangeDelay, delay,
		context, compositionRef, valueBeforeEmitRef
	} = options;

	// given text is display string
	return (text: string) => {
		if (compositionRef.current.enabled) {
			// composition mode
			compositionRef.current.text = text;
		} else {
			// value commit to valueBeforeEmitRef, convert to undefined when given text is empty
			const value: string | undefined = (text == null || text.length === 0) ? (void 0) : text;
			// value commit to data model
			const modelValue = toModelValue == null ? value : toModelValue(value);
			if (emitChangeOnBlur) {
				// set value but mute the leaf event
				ERO.setValueSilent($model, $field, modelValue, 'mute-leaf');
			} else if (emitChangeDelay > 0) {
				const oldModelValue = ERO.getValue($model, $field);
				// set value but mute the leaf event
				ERO.setValueSilent($model, $field, modelValue, 'mute-leaf');
				delay('input-change', async () => {
					// update the old value ref
					valueBeforeEmitRef.current = value;
					// emit event
					ERO.emit($model, $field, oldModelValue, modelValue);
				});
			} else {
				// update the old value ref
				valueBeforeEmitRef.current = value;
				// set value and emit event
				ERO.setValue($model, $field, modelValue);
			}
		}
		context.forceUpdate();
	};
};
