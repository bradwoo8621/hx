import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type FC,
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type ReactNode,
	useEffect,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useDualRef} from '../../hooks';
import type {HxEditSingleFieldProps, HxHtmlElementProps, HxOmittedAttributes, ReadonlyProps} from '../../types';
import {exposePropsToDOM, interposeToChildren, pickCommonProps} from '../../utils';
import {HxLabel} from '../label';

export interface HxExtWrappedInputProps<T extends object>
	extends HxEditSingleFieldProps<T>, ReadonlyProps<T> {
}

// @ts-expect-error ignore the type check
export interface HxExtInputBoxProps<T extends object, P extends HxExtWrappedInputProps<T>> extends P {
	prefix?: Array<ReactNode>;
	placeholder?: ReactNode;
	suffix?: Array<ReactNode>;
	/** Additional HTML attributes to apply to the wrapper div element */
	$domInputBox?: HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, HxOmittedAttributes, T>;
}

export const HxInputBox =
	<T extends object, P extends HxExtWrappedInputProps<T>>(C: FC<P>) => {
		return forwardRef((props: HxExtInputBoxProps<T, P>, ref: ForwardedRef<HTMLInputElement>) => {
			const {
				$model, $field,
				prefix, placeholder, suffix,
				$domInputBox,
				...rest
			} = props;

			const context = useHxContext();
			const {visible, disabled, readonly} = useDataMonitor(props);
			const boxRef = useRef<HTMLDivElement>(null);
			const inputRef = useDualRef(ref);
			const placeholderRef = useRef<HTMLSpanElement>(null);
			useEffect(() => {
				if (boxRef.current == null || inputRef.current == null || placeholderRef.current == null) {
					return;
				}

				const resetPlaceholderPosition = () => {
					if (boxRef.current == null || inputRef.current == null || placeholderRef.current == null) {
						return;
					}
					const {left: boxLeft} = boxRef.current.getBoundingClientRect();
					const {left: inputLeft, width: inputWidth} = inputRef.current.getBoundingClientRect();
					placeholderRef.current.style.left = (inputLeft - boxLeft) + 'px';
					placeholderRef.current.style.width = inputWidth + 'px';
				};
				resetPlaceholderPosition();

				const resizeObserver = new ResizeObserver(() => resetPlaceholderPosition());
				resizeObserver.observe(inputRef.current);

				return () => {
					resizeObserver.disconnect();
				};
			});

			const showPlaceholder = !disabled && !readonly
				&& placeholder != null && (typeof placeholder !== 'string' || placeholder.trim().length !== 0);
			const $wrapper = {...$domInputBox, ...pickCommonProps(rest)};
			const wrapperProps = exposePropsToDOM($wrapper, $model, context);

			return <div {...wrapperProps}
			            data-hx-input-box=""
			            data-hx-model-path={ERO.loosePathOf($model, $field)}
			            data-hx-visible={(visible ?? true) ? '' : 'no'}
			            data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
			            data-hx-readonly={(readonly ?? false) ? '' : (void 0)}
			            ref={boxRef}>
				{interposeToChildren({$model}, prefix)}
				{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
				<C {...rest as any} $model={$model} $field={$field}
				   $visible={visible}
				   $disabled={disabled}
				   $readonly={readonly}
				   data-hx-input-inbox=""
				   ref={inputRef}/>
				{showPlaceholder
					? <HxLabel $model={$model} text={placeholder}
					           data-hx-label-input-placeholder=""
					           ref={placeholderRef}/>
					: (void 0)}
				{interposeToChildren({$model}, suffix)}
			</div>;
		});
	};
