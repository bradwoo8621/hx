import {
	createHxInputCompositionEndHandler,
	createHxInputCompositionStartHandler,
	type HxInputCompositionEndHandlerOptions,
	type HxInputCompositionStartHandlerOptions
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