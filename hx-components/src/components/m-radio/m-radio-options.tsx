import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import type {EditSingleFieldProps} from '../../types';
import {HxLabel} from '../label';
import {HxRadio} from '../radio';
import {type HxSelectOption, useHxSelectOptionsContext} from '../select-options';
import {HxMRadioDefaults} from './defaults';

export interface HxMRadioOptionsProps<T extends object>
	extends EditSingleFieldProps<T> {
	enterToSwitchValue?: boolean;
	spaceToSwitchValue?: boolean;
	optionsOnLoadKey?: string;
	noOptionsKey?: string;
}

export const HxMRadioOptions = <T extends object>(props: HxMRadioOptionsProps<T>) => {
	const {
		$model, $field,
		enterToSwitchValue, spaceToSwitchValue,
		optionsOnLoadKey = HxMRadioDefaults.optionsOnLoadKey, noOptionsKey = HxMRadioDefaults.noOptionsKey
	} = props;

	const context = useHxContext();
	const optionsContext = useHxSelectOptionsContext();
	const optionsRef = useRef({options: [] as Array<HxSelectOption>, loaded: false});

	/**
	 * Listen for options load/change events to update the options list
	 */
	useEffect(() => {
		// noinspection DuplicatedCode
		const onOptionsLoadOrChange = (options: Array<HxSelectOption>) => {
			optionsRef.current = {options, loaded: true};
			context.forceUpdate();
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const onValueChangeWhenOptionsChange = (newValue: any) => {
			const oldValue = ERO.getValue($model, $field);
			if (oldValue == null) {
				if (newValue != null) {
					ERO.setValue($model, $field, newValue);
				}
			} else if (newValue == null) {
				ERO.setValue($model, $field, null);
			} else if (oldValue !== newValue) {
				ERO.setValue($model, $field, newValue);
			}
		};

		optionsContext.onOptionsLoad(onOptionsLoadOrChange);
		optionsContext.onValueChange(onValueChangeWhenOptionsChange);
		optionsContext.onOptionsChange(onOptionsLoadOrChange);
		return () => {
			optionsContext.offOptionsLoad(onOptionsLoadOrChange);
			optionsContext.offValueChange(onValueChangeWhenOptionsChange);
			optionsContext.offOptionsChange(onOptionsLoadOrChange);
		};
	}, [$model, $field, optionsContext, context]);

	// eslint-disable-next-line react-hooks/refs
	if (!optionsRef.current.loaded) {
		return <HxLabel text={optionsOnLoadKey}/>;
		// eslint-disable-next-line react-hooks/refs
	} else if (optionsRef.current.options.length === 0) {
		return <HxLabel text={noOptionsKey}/>;
	}

	const model = ERO.reactive({$$value: ERO.getValue($model, $field)});
	ERO.on(model, '$$value', (ev) => {
		ERO.setValue($model, $field, ev.newValue);
		context.forceUpdate();
	});

	return <>
		{/* eslint-disable-next-line react-hooks/refs */}
		{optionsRef.current.options.map(option => {
			return <HxRadio $model={model} $field="$$value"
			                allowUnchecked={false}
			                text={option.label}
			                enterToSwitchValue={enterToSwitchValue} spaceToSwitchValue={spaceToSwitchValue}/>;
		})}
	</>;
};
