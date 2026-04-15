import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {useHxContext} from '../../contexts';
import type {EditSingleFieldProps} from '../../types';
import {HxLabel} from '../label';
import {HxRadio} from '../radio';
import {useSelectOptions} from '../select-options';
import {HxMRadioDefaults} from './defaults';

/**
 * Props for HxMRadioOptions inner component
 */
export interface HxMRadioOptionsProps<T extends object>
	extends EditSingleFieldProps<T> {
	/** Whether to allow Enter key to switch radio value */
	enterToSwitchValue?: boolean;
	/** Whether to allow Space key to switch radio value */
	spaceToSwitchValue?: boolean;
	/** Custom i18n key for loading state text */
	optionsOnLoadKey?: string;
	/** Custom i18n key for empty options state text */
	noOptionsKey?: string;

	disabled: boolean;
}

/**
 * Inner component that renders radio options list and manages options state
 * Handles dynamic options loading, change events, and value synchronization
 * @param props - Component props
 */
export const HxMRadioOptions = <T extends object>(props: HxMRadioOptionsProps<T>) => {
	const {
		$model, $field,
		enterToSwitchValue, spaceToSwitchValue,
		optionsOnLoadKey = HxMRadioDefaults.optionsOnLoadKey, noOptionsKey = HxMRadioDefaults.noOptionsKey,
		disabled
	} = props;

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

	/** Local proxy model to sync radio group selection with parent model */
	const model = ERO.reactive({$$value: ERO.getValue($model, $field)});
	// Sync local model changes back to parent model
	ERO.on(model, '$$value', (ev) => {
		ERO.setValue($model, $field, ev.newValue);
		context.forceUpdate();
	});

	return <>
		{/* Render each option as a single radio component */}
		{/* eslint-disable-next-line react-hooks/refs */}
		{optionsRef.current.options.map(option => {
			return <HxRadio $model={model} $field="$$value"
			                values={[option.value, (void 0)]}
			                allowUnchecked={false}
			                text={option.label}
			                enterToSwitchValue={enterToSwitchValue} spaceToSwitchValue={spaceToSwitchValue}
			                $disabled={disabled ? true : (void 0)}
			                key={option.value}/>;
		})}
	</>;
};
