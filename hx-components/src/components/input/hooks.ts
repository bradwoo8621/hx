import {ERO, type ModelPath} from '@hx/data';
import {type MutableRefObject, useRef} from 'react';
import type {HxContext} from '../../contexts';
import {useDelayedFunc} from '../../hooks';
import type {HxDataPath, HxObject} from '../../types';
import {isSameStr} from '../../utils';
import {
	createHxInputCompositionEndHandler,
	createHxInputCompositionStartHandler,
	type HxInputCompositionEndHandlerOptions,
	type HxInputCompositionStartHandlerOptions,
	type HxInputCompositionState
} from './utils';

export type HxInputCompositionHandlersHookOptions<T extends object, E extends HTMLInputElement | HTMLTextAreaElement> =
	& HxInputCompositionStartHandlerOptions<T, E>
	& HxInputCompositionEndHandlerOptions<T, E>;
export const useHxInputCompositionHandlers = <T extends object, E extends HTMLInputElement | HTMLTextAreaElement>(options: HxInputCompositionHandlersHookOptions<T, E>) => {
	const {$model, context, onCompositionStart, onCompositionEnd, compositionRef, onTextValueChange} = options;

	const onStart = createHxInputCompositionStartHandler({
		$model, context, onCompositionStart, compositionRef
	});
	const onEnd = createHxInputCompositionEndHandler({
		$model, context, onCompositionEnd, onTextValueChange, compositionRef
	});

	return {onCompositionStart: onStart, onCompositionEnd: onEnd};
};

export interface HxInputValueChangeAndCommitHookOptions<T extends object> {
	$model: HxObject<T>;
	$field: ModelPath<T> | HxDataPath;
	emitChangeOnBlur: boolean;
	emitChangeDelay: number;
	context: HxContext;
	compositionRef: MutableRefObject<HxInputCompositionState>;
}

export const useHxInputValueChangeAndCommit = <T extends object>(options: HxInputValueChangeAndCommitHookOptions<T>) => {
	const {
		$model, $field,
		emitChangeOnBlur, emitChangeDelay,
		context, compositionRef
	} = options;

	// Local state storage for input value when emitChangeOnBlur is false and emitChangeDelay is not zero
	// Allows input to display typed value immediately without updating the model
	const valueBeforeEmitRef = useRef<string | undefined>(ERO.getValue($model, $field));
	/** Debounce function for delayed model updates */
	const {delay} = useDelayedFunc(emitChangeDelay);

	/**
	 * Commits the current input value to the model and triggers change event.
	 * Shared reusable logic for both blur and Enter key events to ensure consistent behavior.
	 * Handles value comparison, model update, and event emission.
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

	return {commitCurrentValue, onTextValueChange};
};
