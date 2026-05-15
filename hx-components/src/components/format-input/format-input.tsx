// noinspection DuplicatedCode

import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ChangeEventHandler,
	type ForwardedRef,
	forwardRef,
	type InputHTMLAttributes,
	type ReactElement,
	type RefAttributes
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import type {HxHtmlElementProps} from '../../types';
import {exposePropsToDOM} from '../../utils';
import {
	createHxInputBlurHandler,
	createHxInputFocusHandler,
	createHxInputKeyDownHandler,
	type HxExtInputInnerProps,
	type OmittedInputHTMLProps,
	useHxInputCompositionHandlers
} from '../input';
import {type HxExtInputBoxProps, HxInputBox} from '../input-box';
import {HxInputDefaults} from '../input/defaults';
import {HxWithCheck, type HxWithCheckProps, HxWithCheckWithSingleFieldOptions} from '../with-check';

export type HxFormatInputPattern = string;

export interface HxExtFormatInputInnerProps<T extends object> extends Omit<HxExtInputInnerProps<T>, 'type'> {
	pattern: HxFormatInputPattern;
}

export type OmittedFormatInputHTMLProps = Exclude<OmittedInputHTMLProps, 'type'>;

export type HxFormatInputInnerProps<T extends object> =
	& HxExtFormatInputInnerProps<T>
	& HxHtmlElementProps<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>, OmittedFormatInputHTMLProps, T>;

export type HxFormatInputInnerType = <T extends object>(
	props: HxFormatInputInnerProps<T> & RefAttributes<HTMLInputElement>
) => ReactElement | null;

const HxFormatInputInner =
	forwardRef(<T extends object>(props: HxFormatInputInnerProps<T>, ref: ForwardedRef<HTMLInputElement>) => {
		const {
			$model, $field,
			selectAll = HxInputDefaults.selectAll,
			emitChangeOnBlur = HxInputDefaults.emitChangeOnBlur,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			emitChangeDelay: ecd = HxInputDefaults.emitChangeDelay,
			name, onFocus, onBlur, onChange, onKeyDown, onCompositionStart, onCompositionEnd, ...rest
		} = props;

		// const emitChangeDelay = ecd < 0 ? 0 : ecd;

		const context = useHxContext();
		const {visible, disabled, readonly} = useDataMonitor(props);

		// Local state storage for input value when emitChangeOnBlur is false and emitChangeDelay is not zero
		// Allows input to display typed value immediately without updating the model
		// const valueBeforeEmitRef = useRef<string | undefined>(ERO.getValue($model, $field));
		/** Debounce function for delayed model updates */
			// const {delay} = useDelayedFunc(emitChangeDelay);

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const onTextValueChange = (_text: string) => {
				// TODO handle text value changed
			};
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const commitCurrentValue = (_currentValue: string) => {
			// TODO commit current value to model
		};
		/** Focus event handler - handles select-all behavior and propagates to custom handler */
		const onInputFocus = createHxInputFocusHandler({$model, selectAll, onFocus, context});
		const onInputChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
			// TODO handle text changed
			onChange?.(ev, $model, context);
		};
		const onInputKeyDown = createHxInputKeyDownHandler({
			$model, context, onKeyDown, emitChangeOnBlur, commitCurrentValue
		});
		const {
			ref: compositionRef,
			onCompositionStart: onInputCompositionStart, onCompositionEnd: onInputCompositionEnd
		} = useHxInputCompositionHandlers({
			$model, context, onCompositionStart, onCompositionEnd, onTextValueChange
		});
		const onInputBlur = createHxInputBlurHandler({
			$model, context, onBlur, emitChangeOnBlur, commitCurrentValue
		});

		// eslint-disable-next-line react-hooks/refs
		const value = (compositionRef.current.enabled ? compositionRef.current.text : ERO.getValue($model, $field)) ?? '';
		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);

		return <input {...restProps}
		              name={name ?? ERO.pathOf($model, $field)} type={rest.type ?? 'text'}
			// eslint-disable-next-line react-hooks/refs
			          value={value}
			          onChange={onInputChange}
			          onFocus={onInputFocus} onBlur={onInputBlur} onKeyDown={onInputKeyDown}
			          onCompositionStart={onInputCompositionStart} onCompositionEnd={onInputCompositionEnd}
			          data-hx-input=""
			          data-hx-model-path={ERO.pathOf($model, $field)}
			          data-hx-visible={(visible ?? true) ? '' : 'no'}
			          data-hx-disabled={(disabled ?? false) ? '' : (void 0)} disabled={disabled ?? false}
			          data-hx-readonly={(readonly ?? false) ? '' : (void 0)} readOnly={readonly ?? false}
			          ref={ref}/>;
	}) as unknown as HxFormatInputInnerType;
// @ts-expect-error assign component name
HxFormatInputInner.displayName = 'HxFormatInputInner';

export type HxFormatInputProps<T extends object> = HxExtInputBoxProps<T, HxFormatInputInnerProps<T>>;

export type HxFormatInputType = <T extends object>(
	props: HxFormatInputProps<T> & RefAttributes<HTMLInputElement>
) => ReactElement | null;

export const HxFormatInput = HxInputBox(HxFormatInputInner) as unknown as HxFormatInputType;
// @ts-expect-error assign component name
HxFormatInput.displayName = 'HxFormatInput';

export type HxWithCheckFormatInputType = <T extends object>(
	props: HxWithCheckProps<T, HxFormatInputProps<T>> & RefAttributes<HTMLInputElement>
) => ReactElement | null;
export const HxWithCheckFormatInput = HxWithCheck(HxFormatInput, HxWithCheckWithSingleFieldOptions) as unknown as HxWithCheckFormatInputType;
// @ts-expect-error assign component name
HxWithCheckFormatInput.displayName = 'HxWithCheckFormatInput';
