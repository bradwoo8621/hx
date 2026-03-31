import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import {EvtOptionsChange, EvtOptionSelect, EvtOptionsLoad, type HxSelectOption, type HxSelectProps} from './types';

/**
 * Select popup content component props
 * @template T - Type of the form model object
 */
export type HxSelectPopupProps<T extends object> = Omit<
	HxSelectProps<T>,
	| 'maxPopupHeight' | 'zIndex' | 'gapToEdge' | 'options'
> & {
	/** Whether the popup is visible */
	visible: boolean
};

/**
 * Select popup content component - renders the list of options inside the popup
 * @template T - Type of the form model object
 * @param props - Component props
 */
export const HxSelectPopup =
	<T extends object>(props: HxSelectPopupProps<T>) => {
		const {$model, $field, visible} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();
		const optionsRef = useRef({
			options: [] as Array<HxSelectOption>,
			loaded: false
		});

		/**
		 * Listen for options load/change events to update the options list
		 */
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

		// TODO: Implement filter and sort functionality

		// Don't render if popup is hidden or options are still loading
		// eslint-disable-next-line react-hooks/refs
		if (!visible || !optionsRef.current.loaded) {
			return null;
		}

		/**
		 * Create click handler for option items
		 * @param option - The option that was clicked
		 * @returns Click handler function that emits selection event
		 */
		const onClick = (option: HxSelectOption) => {
			return () => {
				popupContext.emit(EvtOptionSelect, option);
			};
		};

		const value = ERO.getValue($model, $field);

		return <>
			{/* eslint-disable-next-line react-hooks/refs */}
			{optionsRef.current.options.map(option => {
				const {value: v, label} = option;
				return <HxLabel text={label}
				                clickable={true} hoverable={true} active={value == v}
				                paddingX="text-indent"
				                onClick={onClick(option)}
				                key={v}/>;
			})}
		</>;
	};
