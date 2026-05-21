import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ChangeEventHandler,
	type ForwardedRef,
	forwardRef,
	type ReactElement,
	type RefAttributes,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import {exposePropsToDOM} from '../../utils';
import {
	createHxInputBlurHandler,
	createHxInputFocusHandler,
	createHxInputKeyDownHandler,
	type HxInputCompositionState,
	useHxInputCompositionHandlers,
	useHxInputValueChangeAndCommit
} from '../input';
import {HxInputDefaults} from '../input/defaults';
import type {HxFormatInputInnerProps} from './types';

export type HxFormatInputInnerType = <T extends object>(
	props: HxFormatInputInnerProps<T> & RefAttributes<HTMLInputElement>
) => ReactElement | null;

export const HxFormatInputInner =
	forwardRef(<T extends object>(props: HxFormatInputInnerProps<T>, ref: ForwardedRef<HTMLInputElement>) => {
		const {
			$model, $field, kit,
			selectAll = HxInputDefaults.selectAll,
			emitChangeOnBlur = HxInputDefaults.emitChangeOnBlur,
			emitChangeDelay: ecd = HxInputDefaults.emitChangeDelay,
			name, onFocus, onBlur, onChange, onKeyDown, onCompositionStart, onCompositionEnd, ...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled, readonly} = useDataMonitor(props);

		const valueBeforeChangeRef = useRef<string>(kit.fromModel(ERO.revoke(ERO.getValue($model, $field))) ?? '');
		// Local state storage for input value when emitChangeOnBlur is false and emitChangeDelay is not zero
		// Allows input to display typed value immediately without updating the model
		const valueBeforeEmitRef = useRef<string | null | undefined>(kit.fromModel(ERO.revoke(ERO.getValue($model, $field))));
		const backspaceRef = useRef(false);
		const compositionRef = useRef<HxInputCompositionState>({enabled: false, text: ''});

		const {
			commitCurrentValue,
			onTextValueChange: baseOnTextValueChange
		} = useHxInputValueChangeAndCommit({
			$model, $field, toModelValue: kit.toModel,
			emitChangeOnBlur, emitChangeDelay: ecd < 0 ? 0 : ecd,
			context, valueBeforeEmitRef, compositionRef
		});
		const onTextValueChange = (text: string) => {
			text = kit.check(valueBeforeChangeRef.current, text);
			baseOnTextValueChange(text);
		};

		// noinspection DuplicatedCode
		const onInputFocus = createHxInputFocusHandler({
			$model, selectAll, onFocus, context
		});
		const onInputChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
			onTextValueChange(ev.target.value);
			onChange?.(ev, $model, context);
		};
		// eslint-disable-next-line react-hooks/refs
		const onInputKeyDown = createHxInputKeyDownHandler<T, HTMLInputElement>({
			$model, context, onKeyDown: (ev, $model, context) => {
				if (ev.key === 'Backspace') {
					backspaceRef.current = true;
				}
				onKeyDown?.(ev, $model, context);
			}, emitChangeOnBlur, commitCurrentValue
		});
		const {
			onCompositionStart: onInputCompositionStart, onCompositionEnd: onInputCompositionEnd
		} = useHxInputCompositionHandlers({
			$model, context, onCompositionStart, onCompositionEnd, compositionRef, onTextValueChange
		});
		const onInputBlur = createHxInputBlurHandler({
			$model, context, onBlur, emitChangeOnBlur, commitCurrentValue
		});

		// eslint-disable-next-line react-hooks/refs
		const value = (compositionRef.current.enabled
				? compositionRef.current.text
				: kit.fromModel(ERO.revoke(ERO.getValue($model, $field))))
			?? '';
		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);

		return <input {...restProps}
		              name={name ?? ERO.pathOf($model, $field)} type="text"
			// eslint-disable-next-line react-hooks/refs
			          value={value}
			          onChange={onInputChange}
			          onFocus={onInputFocus} onBlur={onInputBlur} onKeyDown={onInputKeyDown}
			          onCompositionStart={onInputCompositionStart} onCompositionEnd={onInputCompositionEnd}
			          data-hx-input="" data-hx-format-input=""
			          data-hx-model-path={ERO.pathOf($model, $field)}
			          data-hx-visible={(visible ?? true) ? '' : 'no'}
			          data-hx-disabled={(disabled ?? false) ? '' : (void 0)} disabled={disabled ?? false}
			          data-hx-readonly={(readonly ?? false) ? '' : (void 0)} readOnly={readonly ?? false}
			          ref={ref}/>;
	}) as unknown as HxFormatInputInnerType;
// @ts-expect-error assign component name
HxFormatInputInner.displayName = 'HxFormatInputInner';
