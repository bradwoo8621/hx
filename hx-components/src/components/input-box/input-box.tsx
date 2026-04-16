// @ts-expect-error import React
import React, {type FC, type ForwardedRef, forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import type {EditSingleFieldProps, HxHtmlElementProps, HxOmittedAttributes, ReadonlyProps} from '../../types';
import {exposePropsToDOM} from '../../utils';
import {HxLabel} from '../label';

export interface HxExtWrappedInputProps<T extends object>
	extends EditSingleFieldProps<T>, ReadonlyProps<T> {
}

// @ts-expect-error ignore the type check
export interface HxExtInputBoxProps<T extends object, P extends HxExtWrappedInputProps<T>> extends P {
	placeholder?: ReactNode;
	/** Additional HTML attributes to apply to the wrapper div element */
	$domInputBox?: HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, HxOmittedAttributes, T>;
}

export const HxInputBox =
	<T extends object, P extends HxExtWrappedInputProps<T>>(C: FC<P>) => {
		return forwardRef((props: HxExtInputBoxProps<T, P>, ref: ForwardedRef<HTMLInputElement>) => {
			const {
				$model,
				placeholder,
				$domInputBox,
				...rest
			} = props;

			const context = useHxContext();
			const {visible, disabled, readonly} = useDataMonitor(props);

			const showPlaceholder = !disabled && !readonly
				&& placeholder != null && (typeof placeholder !== 'string' || placeholder.trim().length !== 0);
			const wrapperProps = $domInputBox != null ? exposePropsToDOM($domInputBox, $model, context) : (void 0);

			return <div {...wrapperProps}
			            data-hx-input-box=""
			            data-hx-visible={(visible ?? true) ? '' : (void 0)}
			            data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
			            data-hx-readonly={(readonly ?? false) ? '' : (void 0)}>
				{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
				<C {...rest as any} $model={$model}
				   $visible={(visible ?? true) ? '' : (void 0)}
				   $disabled={(disabled ?? false) ? '' : (void 0)}
				   $readonly={(readonly ?? false) ? '' : (void 0)}
				   ref={ref}/>
				{showPlaceholder
					? <HxLabel text={placeholder} data-hx-input-placeholder=""/>
					: (void 0)}
			</div>;
		});
	};
