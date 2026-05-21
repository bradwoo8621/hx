import {ERO, type ModelPath} from '@hx/data';
import {type MutableRefObject, useRef} from 'react';
import type {HxContext} from '../../contexts';
import {useDelayedFunc} from '../../hooks';
import type {HxDataPath, HxObject} from '../../types';
import {
	createCommitCurrentValue,
	createHxInputCompositionEndHandler,
	createHxInputCompositionStartHandler,
	createOnTextValueChange,
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
	/**
	 * convert the display string to model value.
	 *  use the display string as model value when not provided.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toModelValue?: (text?: string | null) => any;
	emitChangeOnBlur: boolean;
	emitChangeDelay: number;
	context: HxContext;
	compositionRef: MutableRefObject<HxInputCompositionState>;
}

export const useHxInputValueChangeAndCommit = <T extends object>(options: HxInputValueChangeAndCommitHookOptions<T>) => {
	const {
		$model, $field, toModelValue,
		emitChangeOnBlur, emitChangeDelay,
		context, compositionRef
	} = options;

	// Local state storage for input value when emitChangeOnBlur is false and emitChangeDelay is not zero
	// Allows input to display typed value immediately without updating the model
	const valueBeforeEmitRef = useRef<string | null | undefined>(ERO.revoke(ERO.getValue($model, $field)));
	// Debounce function for delayed model updates
	const {delay} = useDelayedFunc(emitChangeDelay);

	// Commits the current input value to the model and triggers change event.
	// Shared reusable logic for both blur and Enter key events to ensure consistent behavior.
	// Handles value comparison, model update, and event emission.
	// eslint-disable-next-line react-hooks/refs
	const commitCurrentValue = createCommitCurrentValue({
		$model, $field, toModelValue, valueBeforeEmitRef
	});
	// eslint-disable-next-line react-hooks/refs
	const onTextValueChange = createOnTextValueChange({
		$model, $field, toModelValue,
		emitChangeOnBlur, emitChangeDelay, delay,
		context, compositionRef, valueBeforeEmitRef
	});

	return {commitCurrentValue, onTextValueChange};
};
