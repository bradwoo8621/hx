import {
	type DetailedHTMLProps,
	type FocusEventHandler,
	type ForwardedRef,
	forwardRef,
	type InputHTMLAttributes
} from 'react';
import {HxInputDefaults} from './defaults';

export interface HxExtInputProps {
	selectAll?: boolean;
}

export type HxInputProps = HxExtInputProps & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export const HxInput = forwardRef((props: HxInputProps, ref: ForwardedRef<HTMLInputElement>) => {
	const {selectAll = HxInputDefaults.selectAll, onFocus} = props;

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

	return <input onFocus={onInputFocus} ref={ref}/>;
});

export {configHxInput, type HxInputSettings} from './defaults';
