import {
	createHxInputCompositionEndHandler,
	createHxInputCompositionStartHandler,
	type HxInputCompositionEndHandlerOptions,
	type HxInputCompositionStartHandlerOptions
} from './utils';

export type HxInputCompositionHandlersHookOptions<T extends object> =
	& HxInputCompositionStartHandlerOptions<T>
	& HxInputCompositionEndHandlerOptions<T>;
export const useHxInputCompositionHandlers = <T extends object>(options: HxInputCompositionHandlersHookOptions<T>) => {
	const {$model, context, onCompositionStart, onCompositionEnd, compositionRef, onTextValueChange} = options;

	const onStart = createHxInputCompositionStartHandler({
		$model, context, onCompositionStart, compositionRef
	});
	const onEnd = createHxInputCompositionEndHandler({
		$model, context, onCompositionEnd, onTextValueChange, compositionRef
	});

	return {onCompositionStart: onStart, onCompositionEnd: onEnd};
};