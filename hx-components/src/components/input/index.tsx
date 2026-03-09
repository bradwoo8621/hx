import {
	type ChangeEvent,
	type ChangeEventHandler,
	type DetailedHTMLProps,
	type FocusEventHandler,
	type ForwardedRef,
	forwardRef,
	type InputHTMLAttributes
} from 'react';
import {HxInputDefaults} from './defaults';

export interface HxExtInputProps {
	selectAll?: boolean;
	onChange?: (value: string | null | undefined, e: ChangeEvent<HTMLInputElement>) => void;
}

export type OmittedInputHTMLProps = 'onChange';

export type HxInputProps =
	HxExtInputProps
	& Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, OmittedInputHTMLProps>

export const HxInput = forwardRef((props: HxInputProps, ref: ForwardedRef<HTMLInputElement>) => {
	const {selectAll = HxInputDefaults.selectAll, onFocus, onChange, ...rest} = props;

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

	return <input {...rest}
	              onFocus={onInputFocus} onChange={onInputChange}
	              data-hx-input
	              ref={ref}/>;
});

export {configHxInput, type HxInputSettings} from './defaults';
