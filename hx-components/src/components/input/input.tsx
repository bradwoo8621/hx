import {ERO, type ReactiveObject} from '@hx/data';
// @ts-ignore
import React, {
	type ChangeEventHandler,
	type FocusEventHandler,
	type ForwardedRef,
	forwardRef,
	type InputHTMLAttributes,
	type ReactElement,
	type RefAttributes
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useForceUpdate} from '../../hooks';
import type {EditSingleFieldProps, ReadonlyProps} from '../../types';
import type {HxHtmlElementProps, HxOmittedAttributes} from '../types';
import {unwrapToReactEvents} from '../utils.ts';
import {HxInputDefaults} from './defaults';

export interface HxExtInputProps<T extends object>
	extends EditSingleFieldProps<T>, ReadonlyProps<ReactiveObject & T> {
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
	// validation attributes
	| 'minLength' | 'maxLength' | 'required' | 'multiple' | 'pattern' | 'size'
	| 'height' | 'width'
	| 'readOnly' | 'checked';

export type HxInputProps<T extends object> =
	HxExtInputProps<T>
	& HxHtmlElementProps<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>, OmittedInputHTMLProps, T>

type HxInputType = <T extends ReactiveObject & object>(
	props: HxInputProps<T> & RefAttributes<HTMLInputElement>
) => ReactElement | null;

export const HxInput =
	forwardRef(<T extends ReactiveObject & object>(props: HxInputProps<T>, ref: ForwardedRef<HTMLInputElement>) => {
		const {
			$model, $field,
			selectAll = HxInputDefaults.selectAll,
			onFocus, onChange, ...rest
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
		              type={rest.type ?? 'text'} value={value}
		              onFocus={onInputFocus} onChange={onInputChange}
		              data-hx-input
		              data-hx-visible={visible ?? true}
		              data-hx-disabled={disabled ?? false} disabled={disabled ?? false}
		              data-hx-readonly={readonly ?? false} readOnly={readonly ?? false}
		              ref={ref}/>;
	}) as unknown as HxInputType;
