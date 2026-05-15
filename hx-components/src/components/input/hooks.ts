import {useRef} from 'react';
import {
	createHxInputCompositionEndHandler,
	createHxInputCompositionStartHandler,
	type HxInputCompositionEndHandlerOptions,
	type HxInputCompositionStartHandlerOptions,
	type HxInputCompositionState
} from './utils';

export type HxInputCompositionHandlersHookOptions<T extends object> =
	& Omit<HxInputCompositionStartHandlerOptions<T>, 'compositionRef'>
	& Omit<HxInputCompositionEndHandlerOptions<T>, 'compositionRef'>;
export const useHxInputCompositionHandlers = <T extends object>(options: HxInputCompositionHandlersHookOptions<T>) => {
	const compositionRef = useRef<HxInputCompositionState>({enabled: false, text: ''});

	const {$model, context, onCompositionStart, onCompositionEnd, onTextValueChange} = options;

	// eslint-disable-next-line react-hooks/refs
	const onStart = createHxInputCompositionStartHandler({
		$model, context, onCompositionStart, compositionRef
	});
	// eslint-disable-next-line react-hooks/refs
	const onEnd = createHxInputCompositionEndHandler({
		$model, context, onCompositionEnd, onTextValueChange, compositionRef
	});

	return {
		ref: compositionRef,
		onCompositionStart: onStart, onCompositionEnd: onEnd
	};
};