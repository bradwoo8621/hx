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
import type {HxObject, HxSyntheticEventHandler} from '../../types';

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