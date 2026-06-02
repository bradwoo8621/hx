import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ChangeEventHandler,
	type ForwardedRef,
	forwardRef,
	type ReactElement,
	type RefAttributes,
	useEffect,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useDualRef} from '../../hooks';
import {DeviceCheck, DOMUtils} from '../../utils';
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

		const inputRef = useDualRef(ref);
		const valueBeforeChangeRef = useRef<string>(kit.fromModel(ERO.revoke(ERO.getValue($model, $field)), context) ?? '');
		const caretPositionRef = useRef({set: false, pos: -1});
		// Local state storage for input value when emitChangeOnBlur is false and emitChangeDelay is not zero
		// Allows input to display typed value immediately without updating the model
		const valueBeforeEmitRef = useRef<string | null | undefined>(kit.fromModel(ERO.revoke(ERO.getValue($model, $field)), context));
		const backspaceRef = useRef(false);
		const compositionRef = useRef<HxInputCompositionState>({enabled: false, text: ''});
		useEffect(() => {
			const {set, pos} = caretPositionRef.current;
			if (set && pos !== -1) {
				if (pos !== -1) {
					if (DeviceCheck.checkAndroid()) {
						setTimeout(() => {
							inputRef.current!.selectionStart = pos;
							inputRef.current!.selectionEnd = pos;
						}, 0);
					} else {
						inputRef.current!.selectionStart = pos;
						inputRef.current!.selectionEnd = pos;
					}
				}
				caretPositionRef.current = {set: false, pos: -1};
			}
			// eslint-disable-next-line react-hooks/refs
		}, [inputRef, caretPositionRef.current.set]);

		const {commitCurrentValue, onTextValueChange: baseOnTextValueChange} = useHxInputValueChangeAndCommit({
			$model, $field, toModelValue: kit.lambdaOfToModel(),
			emitChangeOnBlur, emitChangeDelay: ecd < 0 ? 0 : ecd,
			context, forceUpdateOnTextValueChangeManually: true, valueBeforeEmitRef, compositionRef
		});
		const onTextValueChange = (text: string) => {
			const isBackspace = backspaceRef.current;
			backspaceRef.current = false;
			if (!compositionRef.current.enabled) {
				const [corrected, caretPos] = kit.correct(valueBeforeChangeRef.current, text, isBackspace, context);
				valueBeforeChangeRef.current = corrected;
				caretPositionRef.current = {set: caretPos !== -1, pos: caretPos};
				baseOnTextValueChange(corrected);
				if (inputRef.current != null) {
					inputRef.current.value = corrected;
					if (caretPos >= 0) {
						inputRef.current.selectionStart = caretPos;
						inputRef.current.selectionEnd = caretPos;
					}
				} else {
					context.forceUpdate();
				}
			} else {
				baseOnTextValueChange(text);
				context.forceUpdate();
			}
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
		// eslint-disable-next-line react-hooks/refs
		const onInputBlur = createHxInputBlurHandler<T, HTMLInputElement>({
			$model, context, onBlur: (ev, model, context) => {
				// value already committed to model
				// now format it and fix the display if needed
				valueBeforeChangeRef.current = kit.fromModel(ERO.revoke(ERO.getValue($model, $field)), context) ?? '';
				if (valueBeforeChangeRef.current !== inputRef.current?.value) {
					inputRef.current!.value = valueBeforeChangeRef.current;
				}
				onBlur?.(ev, model, context);
			}, emitChangeOnBlur, commitCurrentValue
		});

		// eslint-disable-next-line react-hooks/refs
		const value = (compositionRef.current.enabled ? compositionRef.current.text : valueBeforeChangeRef.current) ?? '';
		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = DOMUtils.exposePropsToDOM(rest, $model, context);

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
			          ref={inputRef}/>;
	}) as unknown as HxFormatInputInnerType;
// @ts-expect-error assign component name
HxFormatInputInner.displayName = 'HxFormatInputInner';
