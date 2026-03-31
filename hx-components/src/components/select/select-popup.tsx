// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import {EvtOptionsChange, EvtOptionSelect, EvtOptionsLoad, type HxSelectOption, type HxSelectProps} from './types';

export type HxSelectPopupProps<T extends object> = Omit<
	HxSelectProps<T>,
	| 'maxPopupHeight' | 'zIndex' | 'gapToEdge' | 'options'
> & {
	visible: boolean
};

export const HxSelectPopup =
	<T extends object>(props: HxSelectPopupProps<T>) => {
		const {visible} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();
		const optionsRef = useRef({
			options: [] as Array<HxSelectOption>,
			loaded: false
		});
		useEffect(() => {
			const onOptionsLoadOrChange = (options: Array<HxSelectOption>) => {
				optionsRef.current = {options, loaded: true};
				context.forceUpdate();
			};

			popupContext.on(EvtOptionsLoad, onOptionsLoadOrChange);
			popupContext.on(EvtOptionsChange, onOptionsLoadOrChange);
			return () => {
				popupContext.off(EvtOptionsLoad, onOptionsLoadOrChange);
				popupContext.off(EvtOptionsChange, onOptionsLoadOrChange);
			};
		}, [popupContext, context]);

		// eslint-disable-next-line react-hooks/refs
		if (!visible || !optionsRef.current.loaded) {
			return null;
		}

		const onClick = (option: HxSelectOption) => {
			return () => {
				popupContext.emit(EvtOptionSelect, option);
			};
		};

		return <>
			{/* eslint-disable-next-line react-hooks/refs */}
			{optionsRef.current.options.map(option => {
				const {value, label} = option;
				return <HxLabel text={label} clickable={true}
				                paddingX="text-indent"
				                onClick={onClick(option)}
				                key={value}/>;
			})}
		</>;
	};
