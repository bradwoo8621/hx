// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {useDataMonitor} from '../../hooks';
import {DateUtils} from '../../utils';
import {HxCommonDefaults} from '../common/defaults';
import {HxFormatInput, type HxFormatInputDateTimeOptions, type HxFormatInputDateTimePattern} from '../format-input';
import {HxPopupProvider, type HxPopupProviderProps} from '../popup';
import {HxWithCheck, type HxWithCheckProps, HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxDateTimePickerInput, type HxDateTimePickerInputProps} from './datetime-picker-input';
import {HxDateTimePickerPopup, type HxDateTimePickerPopupProps} from './datetime-picker-popup';
import {HxDateTimePickerDefaults} from './defaults';
import type {HxDateTimePickerProps, HxDateTimePickerType} from './types';
import {displayFormatToFunc} from './utils';

export const HxDateTimePicker =
	forwardRef(<T extends object>(props: HxDateTimePickerProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			displayFormat, availableParts, defaultValue, valueFormat, firstDayOfWeek, forceLang,
			clearable = HxDateTimePickerDefaults.clearable,
			placeholder, placeholderKey,
			zIndex, gapToEdge = HxDateTimePickerDefaults.gapToEdge,
			enterToOpenPopup, spaceToOpenPopup,
			todayKey, clearKey,

			...rest
		} = props;

		// Monitor reactive visibility and disabled state from model
		const {visible, disabled} = useDataMonitor(props);

		// for control the props precisely
		const providerProps: Omit<HxPopupProviderProps, 'trigger' | 'data' | 'children'> = {
			zIndex, gapToEdge, sameWidthAtMinimum: false
		};
		const [displayFormatFunc, parts] = displayFormatToFunc(displayFormat, availableParts, HxDateTimePickerDefaults.valueFormat || HxCommonDefaults.datetimeValueFormat);
		if (!(parts.hasYear && parts.hasMonth && parts.hasDay)) {
			let pattern: HxFormatInputDateTimePattern;
			if (typeof displayFormat !== 'string' || !displayFormat.startsWith('@d')) {
				const fallback = availableParts?.trim() || HxDateTimePickerDefaults.valueFormat || HxCommonDefaults.datetimeValueFormat;
				const chars: Array<string> = [];
				for (const ch of fallback) {
					if (chars.includes(ch)) {
						continue;
					}
					if (DateUtils.YMDHNS.includes(ch)) {
						chars.push(ch);
					}
					if (chars.length === 0 || !DateUtils.YMDHNS.includes(chars[chars.length - 1])) {
						// ignore
						continue;
					}
					if ('/' === ch) {
						chars.push('/');
					} else if ('-' === ch) {
						chars.push('-');
					} else if (':' === ch) {
						chars.push(':');
					} else if (' ' === ch) {
						chars.push(' ');
					}
				}
				const s = ['@d'];
				if (chars.includes('/')) {
					s.push('/');
				} else if (chars.includes('-')) {
					s.push('-');
				}
				for (const ch of chars) {
					if (DateUtils.YMD.includes(ch)) {
						s.push(ch);
					}
				}
				if (chars.includes(' ')) {
					s.push(' ');
				}
				if (chars.includes(':')) {
					s.push(':');
				}
				if (chars.includes('h')) {
					s.push('h');
				}
				if (chars.includes('n')) {
					s.push('n');
				}
				if (chars.includes('s')) {
					s.push('s');
				}
				pattern = s.join('') as HxFormatInputDateTimePattern;
			} else {
				pattern = displayFormat as HxFormatInputDateTimePattern;
			}
			const options: HxFormatInputDateTimeOptions = {};
			if (defaultValue != null) {
				options.defaultValue = defaultValue;
			}
			if (valueFormat != null) {
				options.valueFormat = valueFormat;
			}
			return <HxFormatInput $model={$model} $field={$field}
			                      pattern={pattern}
				// @ts-expect-error ignore type check
				                  options={Object.keys(options).length > 0 ? options : undefined}
			/>;
		}
		const parsedValueFormat = DateUtils.parseFormat(valueFormat || HxDateTimePickerDefaults.valueFormat || HxCommonDefaults.datetimeValueFormat);
		const parsedDefaultValue = DateUtils.parseDefaultValue(defaultValue, true);
		const inputProps: HxDateTimePickerInputProps<T> = {
			$model, $field,
			visible, disabled,
			displayFormat: displayFormatFunc,
			valueFormat: parsedValueFormat, defaultValue: parsedDefaultValue,
			clearable,
			enterToOpenPopup, spaceToOpenPopup,
			placeholder, placeholderKey,
			...rest
		};
		const popupProps: Omit<HxDateTimePickerPopupProps<T>, 'visible'> = {
			$model, $field,
			valueFormat: parsedValueFormat, defaultValue: parsedDefaultValue,
			availableParts: parts, firstDayOfWeek, forceLang,
			clearable, todayKey, clearKey
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
