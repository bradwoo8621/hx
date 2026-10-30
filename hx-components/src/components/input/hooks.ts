import {ERO, type ModelPath} from '@hx/data';
import {type MutableRefObject, useEffect} from 'react';
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
	type HxInputCompositionState,
	type ValueBeforeEmitRefType
} from './utils';

export type HxInputCompositionHandlersHookOptions<T extends object, E extends HTMLInputElement | HTMLTextAreaElement> =
	& HxInputCompositionStartHandlerOptions<T, E>
	& HxInputCompositionEndHandlerOptions<T, E>;
export const useHxInputCompositionHandlers =
	<T extends object, E extends HTMLInputElement | HTMLTextAreaElement>(options: HxInputCompositionHandlersHookOptions<T, E>) => {
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
	 * convert given model value to display value
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fromModelValue: (value: any | null | undefined, context: HxContext) => string | null | undefined;
	/**
	 * convert the display string to model value.
	 * use the display string as model value when not provided.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toModelValue?: (text: string | null | undefined, context: HxContext) => any;
	emitChangeOnBlur: boolean;
	emitChangeDelay: number;
	context: HxContext;
	valueBeforeEmitRef: MutableRefObject<ValueBeforeEmitRefType<T>>;
	compositionRef: MutableRefObject<HxInputCompositionState>;
}

export const useHxInputValueChangeAndCommit =
	<T extends object>(options: HxInputValueChangeAndCommitHookOptions<T>) => {
		const {
			$model, $field, fromModelValue, toModelValue,
			emitChangeOnBlur, emitChangeDelay,
			context, valueBeforeEmitRef, compositionRef
		} = options;

		// Debounce function for delayed model updates
		const {delay} = useDelayedFunc(emitChangeDelay);
		useEffect(() => {
			const oldModel = ERO.revoke(valueBeforeEmitRef.current.$model);
			const newModel = ERO.revoke($model);
			if (oldModel === newModel && $field === valueBeforeEmitRef.current.$field) {
				return;
			}

			// model or field changed, change the value before emit ref.
			valueBeforeEmitRef.current.$model = $model;
			valueBeforeEmitRef.current.$field = $field;
			// and change value if not same
			let oldValue = valueBeforeEmitRef.current.value;
			oldValue = (oldValue == null || oldValue.length === 0) ? (void 0) : oldValue;
			let newValue = fromModelValue(ERO.revoke(ERO.getValue($model, $field)), context);
			newValue = (newValue == null || newValue.length === 0) ? (void 0) : newValue;
			if (newValue !== oldValue) {
				valueBeforeEmitRef.current.value = newValue;
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [ERO.revoke($model), $field, fromModelValue, valueBeforeEmitRef, context]);

		// Commits the current input value to the model and triggers change event.
		// Shared reusable logic for both blur and Enter key events to ensure consistent behavior.
		// Handles value comparison, model update, and event emission.
		const commitCurrentValue = createCommitCurrentValue({
			$model, $field, toModelValue, context, valueBeforeEmitRef
		});
		const onTextValueChange = createOnTextValueChange({
			$model, $field, toModelValue,
			emitChangeOnBlur, emitChangeDelay, delay,
			context, compositionRef, valueBeforeEmitRef
		});

		return {commitCurrentValue, onTextValueChange};
	};
