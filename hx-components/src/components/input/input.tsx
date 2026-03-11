import {ERO, type ReactiveObject} from '@hx/data';
// @ts-ignore
import React, {
	type ChangeEvent,
	type ChangeEventHandler,
	type DetailedHTMLProps,
	type FocusEventHandler,
	type ForwardedRef,
	forwardRef,
	type InputHTMLAttributes
} from 'react';
import type {ComponentDataSingleFieldProps, StdOmittedDataAttributes} from '../types';
import {HxInputDefaults} from './defaults';

export interface HxExtInputProps<T extends ReactiveObject & object> extends ComponentDataSingleFieldProps<T> {
	/**
	 * rewrite the value of type attribute of HTML input, only 'text' and 'password' are supported
	 */
	type?: 'text' | 'password';
	/**
	 * select all text on focus, default true
	 */
	selectAll?: boolean;
	onChange?: (value: string | null | undefined, e: ChangeEvent<HTMLInputElement>) => void;
}

export type OmittedInputHTMLProps =
	| StdOmittedDataAttributes
	// overwritten or omitted attributes
	| 'type' | 'value'
	// validation attributes
	| 'maxLength' | 'required'
	// event attributes
	| 'onChange';

export type HxInputProps<T extends ReactiveObject> =
	HxExtInputProps<T>
	& Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, OmittedInputHTMLProps>

export const HxInput =
	forwardRef(<T extends ReactiveObject>(props: HxInputProps<T>, ref: ForwardedRef<HTMLInputElement>) => {
		const {
			$model, $field,
			selectAll = HxInputDefaults.selectAll,
			onFocus, onChange, ...rest
		} = props;

		let onInputFocus: FocusEventHandler<HTMLInputElement> | undefined = (void 0);
		if (selectAll || onFocus != null) {
			onInputFocus = (ev) => {
				if (selectAll) {
					ev.target.select();
				}
				if (onFocus != null) {
					onFocus(ev);
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
			onChange?.(value, ev);
		};

		let type = rest.type;
		if (type == null || !['text', 'password'].includes(type)) {
			type = 'text';
		}
		// get value
		const value = ERO.getValue($model, $field) ?? '';

		return <input {...rest}
		              type={type} value={value}
		              onFocus={onInputFocus} onChange={onInputChange}
		              data-hx-input
		              data-hx-disabled={rest.disabled ?? false}
		              data-hx-readonly={rest.readOnly ?? false}
		              ref={ref}/>;
	});
