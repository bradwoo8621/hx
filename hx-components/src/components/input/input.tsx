import {ERO} from '@hx/data';
// @ts-ignore
import React, {
	type ChangeEventHandler,
	type FocusEventHandler,
	type ForwardedRef,
	forwardRef,
	type InputHTMLAttributes,
	type PropsWithoutRef,
	type ReactElement,
	type RefAttributes
} from 'react';
import {useHxContext} from '../../contexts';
import {type CheckPropSuppliedOn, useDataMonitor, useForceUpdate} from '../../hooks';
import type {CheckProps, EditSingleFieldProps, ReadonlyProps} from '../../types';
import type {HxHtmlElementProps, HxOmittedAttributes} from '../types';
import {unwrapToReactEvents} from '../utils';
import {HxWithCheck, type HxWithCheckCreateOptions} from '../with-check';
import {HxInputDefaults} from './defaults';

export interface HxExtInputProps<T extends object>
	extends EditSingleFieldProps<T>, ReadonlyProps<T> {
	/**
	 * rewrite the value of type attribute of HTML input, only 'text' and 'password' are supported
	 */
	type?: 'text' | 'password';
	/**
	 * select all text on focus, default true
	 */
	selectAll?: boolean;
}

export type OmittedInputHTMLProps =
	| HxOmittedAttributes
	| 'disabled' | 'type' | 'value'
	// validation attributes
	| 'minLength' | 'maxLength' | 'required' | 'multiple' | 'pattern' | 'size'
	| 'height' | 'width'
	| 'readOnly' | 'checked'
	| 'children';

export type HxInputProps<T extends object> = PropsWithoutRef<
	& HxExtInputProps<T>
	& HxHtmlElementProps<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>, OmittedInputHTMLProps, T>
>;

export type HxInputType = <T extends object>(
	props: HxInputProps<T> & RefAttributes<HTMLInputElement>
) => ReactElement | null;

export const HxInput =
	forwardRef(<T extends object>(props: HxInputProps<T>, ref: ForwardedRef<HTMLInputElement>) => {
		const {
			$model, $field,
			selectAll = HxInputDefaults.selectAll,
			name, onFocus, onChange, ...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled, readonly} = useDataMonitor(props);
		const forceUpdate = useForceUpdate();

		let onInputFocus: FocusEventHandler<HTMLInputElement> | undefined = (void 0);
		if (selectAll || onFocus != null) {
			onInputFocus = (ev) => {
				if (selectAll) {
					ev.target.select();
				}
				if (onFocus != null) {
					onFocus(ev, $model, context, forceUpdate);
				}
			};
		}

		const onInputChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
			let value: string | undefined = ev.target.value;
			if (value.length === 0) {
				value = (void 0);
			}
			// set value and fire value change event
			ERO.setValue($model, $field, value);
			forceUpdate();
			onChange?.(ev, $model, context, forceUpdate);
		};

		// get value
		const value = ERO.getValue($model, $field) ?? '';
		const restProps = unwrapToReactEvents(rest, $model, context, forceUpdate);

		return <input {...restProps}
		              name={name ?? ERO.pathOf($model, $field)} type={rest.type ?? 'text'} value={value}
		              onFocus={onInputFocus} onChange={onInputChange}
		              data-hx-input=""
		              data-hx-visible={visible ?? true}
		              data-hx-disabled={disabled ?? false} disabled={disabled ?? false}
		              data-hx-readonly={readonly ?? false} readOnly={readonly ?? false}
		              ref={ref}/>;
	}) as unknown as HxInputType;

/** input with check */
const HxWithCheckInputOptions: HxWithCheckCreateOptions<object, HxInputProps<object>> = {
	$supplyOn: (props: HxInputProps<object>): CheckPropSuppliedOn => {
		return props.$field;
	}
};
export type HxWithCheckInputType = <T extends object>(
	props: HxInputProps<T> & CheckProps<T> & RefAttributes<HTMLInputElement>
) => ReactElement | null;
export const HxWithCheckInput = HxWithCheck(HxInput, HxWithCheckInputOptions) as unknown as HxWithCheckInputType;
