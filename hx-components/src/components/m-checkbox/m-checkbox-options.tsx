import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {useHxContext} from '../../contexts';
import type {HxEditSingleFieldProps} from '../../types';
import {HxCheckbox} from '../checkbox';
import {HxLabel} from '../label';
import {useSelectOptions} from '../select-options';
import {HxMCheckboxDefaults} from './defaults';
import type {HxMCheckboxFromModelFunc, HxMCheckboxToModelFunc} from './types';

/**
 * Props for HxMCheckboxOptions inner component
 */
export interface HxMCheckboxOptionsProps<T extends object>
	extends HxEditSingleFieldProps<T> {
	/** convert given display value to model value */
	toModel?: HxMCheckboxToModelFunc;
	/** convert given model value to display value */
	fromModel?: HxMCheckboxFromModelFunc;
	/** maximum checked options count */
	maxChecked?: number;
	/** Whether to allow Enter key to switch checkbox value */
	enterToSwitchValue?: boolean;
	/** Whether to allow Space key to switch checkbox value */
	spaceToSwitchValue?: boolean;
	/** Custom i18n key for loading state text */
	optionsOnLoadKey?: string;
	/** Custom i18n key for empty options state text */
	noOptionsKey?: string;
	/** Whether the options are disabled */
	disabled: boolean;
}

/**
 * Inner component that renders checkbox options list and manages options state
 * Handles dynamic options loading, change events, and value synchronization
 * @param props - Component props
 */
export const HxMCheckboxOptions = <T extends object>(props: HxMCheckboxOptionsProps<T>) => {
	const {
		$model, $field,
		fromModel, toModel, maxChecked = -1,
		enterToSwitchValue, spaceToSwitchValue,
		optionsOnLoadKey = HxMCheckboxDefaults.optionsOnLoadKey, noOptionsKey = HxMCheckboxDefaults.noOptionsKey,
		disabled
	} = props;

	// noinspection DuplicatedCode
	const context = useHxContext();
	const optionsRef = useSelectOptions({$model, $field});

	// Show loading state when options are being fetched
	// eslint-disable-next-line react-hooks/refs
	if (!optionsRef.current.loaded) {
		return <HxLabel text={optionsOnLoadKey}/>;
		// Show empty state when no options available
		// eslint-disable-next-line react-hooks/refs
	} else if (optionsRef.current.options.length === 0) {
		return <HxLabel text={noOptionsKey}/>;
	}

	const getValueFromModel = () => {
		const value = ERO.getValue($model, $field);
		if (fromModel != null) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return {value, array: (fromModel(value, context) ?? []) as Array<any>};
		} else {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return {value, array: (value ?? []) as Array<any>};
		}
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const setValueToModel = (array?: Array<any> | null) => {
		const value = (array == null || array.length === 0) ? (void 0) : array;
		const newValue = toModel == null ? value : toModel(value, context);
		ERO.setValue($model, $field, newValue);
	};

	const values = getValueFromModel().array;
	const reachMaxChecked = maxChecked > 0 && values.length >= maxChecked;

	return <>
		{/* Render each option as a single checkbox component */}
		{/* eslint-disable-next-line react-hooks/refs */}
		{optionsRef.current.options.map(option => {
			const value = option.value;
			const checked = values.some(v => v == value);
			/** Local proxy model to sync checkbox group selection with parent model */
			const model = ERO.reactive({$$value: checked ? value : (void 0)});
			// Sync local model changes back to parent model
			ERO.on(model, '$$value', (ev) => {
				// should be an array
				const oldValueAsArray = getValueFromModel().array;
				const unchecked = ev.newValue == null;
				if (unchecked) {
					// unchecked
					const newValueAsArray = oldValueAsArray.filter(v => v != value);
					if (newValueAsArray.length !== oldValueAsArray.length) {
						setValueToModel(newValueAsArray);
						context.forceUpdate();
					}
				} else {
					// checked
					const checked = oldValueAsArray.some(v => v == value);
					if (!checked) {
						const newValueAsArray = [...oldValueAsArray, value];
						setValueToModel(newValueAsArray);
						context.forceUpdate();
					}
				}
			});
			// option is disabled when
			// - checkbox group is disabled
			// - or maxChecked declared + checked option count >= max checked + this option is unchecked
			const optionDisabled = (disabled ?? false) || (reachMaxChecked && !checked);

			return <HxCheckbox $model={model} $field="$$value"
			                   values={[value, (void 0)]}
			                   text={option.label}
			                   enterToSwitchValue={enterToSwitchValue} spaceToSwitchValue={spaceToSwitchValue}
			                   $disabled={optionDisabled ? true : option.$disabled}
			                   key={option.value}/>;
		})}
	</>;
};
