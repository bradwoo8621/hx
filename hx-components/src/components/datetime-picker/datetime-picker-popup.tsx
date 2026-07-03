// @ts-expect-error import React
import React from 'react';
import type {HxParsedDateTimeFormat} from '../../types';
import {type HxExtDateTimePickerProps} from './types';

export type HxDateTimePickerPopupProps<T extends object> =
	& Pick<HxExtDateTimePickerProps<T>, | 'firstDayOfWeek' | 'nowKey' | 'clearKey'>
	& {
	/** Whether the popup is visible */
	visible: boolean;
	availableParts: Omit<HxParsedDateTimeFormat, 'sequence'>;
};

export const HxDateTimePickerPopup =
	<T extends object>(props: HxDateTimePickerPopupProps<T>) => {
		const {
			visible
			// availableParts, firstDayOfWeek = HxDateTimePickerDefaults.firstDayOfWeek,
			// nowKey = HxDateTimePickerDefaults.nowKey, clearKey = HxDateTimePickerDefaults.clearKey
		} = props;

		// const context = useHxContext();
		// const popupContext = useHxPopupContext();

		// Don't render if popup is hidden
		if (!visible) {
			return null;
		}

		// TODO
		return <div/>;
		// <div data-hx-select-options="" tabIndex={-1} ref={optionsContainerRef}>
		// 	{/* eslint-disable-next-line react-hooks/refs */}
		// 	{options.map(option => {
		// 		const {value: optionValue, label, $disabled} = option;
		// 		const active = modelValue == optionValue;
		// 		return <HxLabel $model={$model}
		// 		                text={label} clickable={true} active={active}
		// 		                $disabled={$disabled}
		// 		                data-hx-select-option="" data-hx-label-text-indent=""
		// 		                onClick={onOptionClick(option)}
		// 		                onMouseEnter={onOptionMouseEnter}
		// 		                key={optionValue}/>;
		// 	})}
		// 	{showFilter && $filterModel != null
		// 		? <HxLabel text={noOptionsKey} data-hx-label-text-indent=""/>
		// 		: (void 0)}
		// </div>
	};
