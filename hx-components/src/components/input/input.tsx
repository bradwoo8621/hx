import React, {
	type ChangeEvent,
	type ChangeEventHandler,
	type DetailedHTMLProps,
	type FocusEventHandler,
	type ForwardedRef,
	forwardRef,
	type InputHTMLAttributes
} from 'react';
import type {StdOmittedDataAttributes} from '../types';
import {HxInputDefaults} from './defaults.ts';

export interface HxExtInputProps {
	selectAll?: boolean;
	onChange?: (value: string | null | undefined, e: ChangeEvent<HTMLInputElement>) => void;
}

export type OmittedInputHTMLProps =
	| StdOmittedDataAttributes
	| 'maxLength' | 'required'
	| 'onChange';

export type HxInputProps =
	HxExtInputProps
	& Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, OmittedInputHTMLProps>

export const HxInput: React.ForwardRefExoticComponent<HxInputProps> = forwardRef((props: HxInputProps, ref: ForwardedRef<HTMLInputElement>) => {
	const {
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
		onChange?.(value, ev);
	};

	let type = rest.type;
	if (type == null || !['text', 'password'].includes(type)) {
		type = 'text';
	}

	return <input {...rest}
	              type={type}
	              onFocus={onInputFocus} onChange={onInputChange}
	              data-hx-input
	              data-hx-disabled={rest.disabled ?? false}
	              data-hx-readonly={rest.readOnly ?? false}
	              ref={ref}/>;
});
