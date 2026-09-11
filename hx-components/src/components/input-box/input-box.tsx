import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type FC, type ForwardedRef, forwardRef, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useDualRef} from '../../hooks';
import {DOMUtils, HxDataPropToAttrValueComputer} from '../../utils';
import {HxLabel} from '../label';
import type {HxExtWrappedInputProps, HxInputBoxProps} from './types';

export const HxInputBox =
	<T extends object, P extends HxExtWrappedInputProps<T>>(C: FC<P>) => {
		// @ts-expect-error ignore the type check
		return forwardRef((props: HxInputBoxProps<T, P>, ref: ForwardedRef<HTMLInputElement>) => {
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
			const $wrapper = {...$domInputBox, ...DOMUtils.pickCommonPositionProps(rest)};
			const wrapperProps = DOMUtils.exposePropsToDOM($wrapper, $model, context, {
				key: 'HxInputBox', visible, disabled, readonly
			});

			return <div {...wrapperProps}
			            data-hx-input-box=""
			            data-hx-model-path={ERO.loosePathOf($model, $field)}
			            ref={boxRef}>
				{DOMUtils.interposeToChildren({$model}, prefix)}
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
				{DOMUtils.interposeToChildren({$model}, suffix)}
			</div>;
		});
	};

HxDataPropToAttrValueComputer.create('HxInputBox').register();
