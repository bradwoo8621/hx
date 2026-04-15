import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import type {EditSingleFieldProps} from '../../types';
import {HxLabel} from '../label';
import {HxRadio} from '../radio';
import {type HxSelectOption, useHxSelectOptionsContext} from '../select-options';
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
		optionsOnLoadKey = HxMRadioDefaults.optionsOnLoadKey, noOptionsKey = HxMRadioDefaults.noOptionsKey
	} = props;

	const context = useHxContext();
	/** Options context for receiving dynamic options events */
	const optionsContext = useHxSelectOptionsContext();
	/** Ref to store current options list and loading state */
	const optionsRef = useRef({options: [] as Array<HxSelectOption>, loaded: false});

	/**
	 * Listen for options load/change events to update the options list
	 * Also handles value synchronization when options change
	 */
	useEffect(() => {
		// noinspection DuplicatedCode
		/**
		 * Handle options load or change events to update local options state
		 * @param options - New options list
		 */
		const onOptionsLoadOrChange = (options: Array<HxSelectOption>) => {
			optionsRef.current = {options, loaded: true};
			context.forceUpdate();
		};

		/**
		 * Handle value change events from options context to sync with parent model
		 * @param newValue - New value from options change
		 */
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

		// Subscribe to options context events
		optionsContext.onOptionsLoad(onOptionsLoadOrChange);
		optionsContext.onValueChange(onValueChangeWhenOptionsChange);
		optionsContext.onOptionsChange(onOptionsLoadOrChange);

		// Cleanup subscriptions on unmount
		return () => {
			optionsContext.offOptionsLoad(onOptionsLoadOrChange);
			optionsContext.offValueChange(onValueChangeWhenOptionsChange);
			optionsContext.offOptionsChange(onOptionsLoadOrChange);
		};
	}, [$model, $field, optionsContext, context]);

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
			                key={option.value}/>;
		})}
	</>;
};
