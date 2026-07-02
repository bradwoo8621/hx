// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {useDataMonitor} from '../../hooks';
import {DateUtils} from '../../utils';
import {HxCommonDefaults} from '../common/defaults';
import {HxPopupProvider, type HxPopupProviderProps} from '../popup';
import {HxWithCheck, type HxWithCheckProps, HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxDateTimePickerInput, type HxDateTimePickerInputProps} from './datetime-picker-input';
import {HxDateTimePickerPopup, type HxDateTimePickerPopupProps} from './datetime-picker-popup';
import {HxDateTimePickerDefaults} from './defaults';
import type {HxDateTimePickerProps, HxDateTimePickerType} from './types';

export const HxDateTimePicker =
	forwardRef(<T extends object>(props: HxDateTimePickerProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			format, valueFormat, firstDayOfWeek,
			clearable,
			placeholder, placeholderKey,
			zIndex, gapToEdge = HxDateTimePickerDefaults.gapToEdge,
			enterToOpenPopup, spaceToOpenPopup,
			nowKey, clearKey,

			...rest
		} = props;

		// Monitor reactive visibility and disabled state from model
		const {visible, disabled} = useDataMonitor(props);

		// for control the props precisely
		const providerProps: Omit<HxPopupProviderProps, 'trigger' | 'data' | 'children'> = {
			zIndex, gapToEdge, sameWidthAtMinimum: false
		};
		const inputProps: HxDateTimePickerInputProps<T> = {
			$model, $field,
			visible, disabled,
			format:,
			valueFormat: DateUtils.parseFormat(valueFormat || HxDateTimePickerDefaults.valueFormat || HxCommonDefaults.datetimeValueFormat),
			clearable,
			enterToOpenPopup, spaceToOpenPopup,
			placeholder, placeholderKey,
			...rest
		};
		const popupProps: Omit<HxDateTimePickerPopupProps<T>, 'visible'> = {
			$model, $field,
			firstDayOfWeek, nowKey, clearKey
		};

		return <HxPopupProvider
			{...providerProps}
			data-hx-popup-for-dtp=""
			// @ts-expect-error ignore the generic type check
			trigger={<HxDateTimePickerInput {...inputProps} ref={ref}/>}>
			{/* @ts-expect-error "visible" is provided by popup provider, ignore check here */}
			<HxDateTimePickerPopup {...popupProps}/>
		</HxPopupProvider>;
	}) as unknown as HxDateTimePickerType;
// @ts-expect-error assign component name
HxDateTimePicker.displayName = 'HxDateTimePicker';

export type HxWithCheckDateTimePickerType = <T extends object>(
	props: HxWithCheckProps<T, HxDateTimePickerProps<T>> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

export const HxWithCheckDateTimePicker = HxWithCheck(HxDateTimePicker, HxWithCheckWithSingleFieldOptions) as unknown as HxWithCheckDateTimePickerType;
// @ts-expect-error assign component name
HxWithCheckDateTimePicker.displayName = 'HxWithCheckDateTimePicker';
