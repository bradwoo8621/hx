// @ts-expect-error import React
import React, {useRef} from 'react';
import {HxLabel} from '../label';
import type {HxSelectOption, HxSelectProps} from './types';

export type HxSelectPopupProps<T extends object> = Omit<
	HxSelectProps<T>,
	| 'zIndex' | 'gapToEdge'
	| '$visible' | '$disabled'
>;

export const HxSelectPopup =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	<T extends object>(_props: HxSelectPopupProps<T>) => {
		const optionsRef = useRef({
			options: [] as Array<HxSelectOption>,
			loaded: false
		});

		// eslint-disable-next-line react-hooks/refs
		if (!optionsRef.current.loaded) {
			return null;
		}

		return <>
			{/* eslint-disable-next-line react-hooks/refs */}
			{optionsRef.current.options.map(option => {
				const {value, label} = option;
				return <HxLabel text={label} clickable={true}
				                paddingX="text-indent"
				                key={value}/>;
			})}
		</>;
	};
