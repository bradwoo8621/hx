import {ERO, type ModelPath} from '@hx/data';
import {useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import type {HxDataPath, HxObject} from '../../types';
import {useHxSelectOptions} from './select-options-provider';
import type {HxSelectOption} from './types';

export interface UseSelectOptionsOptions<T extends object> {
	$model: HxObject<T>,
	$field: ModelPath<T> | HxDataPath;
	captureValueChangeOnOptionsChange?: boolean;
	/**
	 * component which use this hook will hold the options data, and provide to any other collaborator.
	 * e.g. for HxSelect, HxSelectInput is main options holder, and HxSelectPopup is collaborator.
	 * since HxSelectInput is created when HxSelect created, and has same lifecycle with HxSelect,
	 * and HxSelectPopup is created only when popup shown, destroyed when popup hidden.
	 * so when creating HxSelectPopup, it will ask HxSelectInput to provide options data.
	 */
	mainOptionsHolder?: boolean;
}

export const useSelectOptions = <T extends object>(options: UseSelectOptionsOptions<T>) => {
	const {$model, $field, captureValueChangeOnOptionsChange = true, mainOptionsHolder = false} = options;

	const context = useHxContext();
	/** Options context for receiving dynamic options events */
	const optionsContext = useHxSelectOptions();
	/** Ref to store current options list and loading state */
	const optionsRef = useRef({options: [] as Array<HxSelectOption>, loaded: false});
	useEffect(() => {
		if (!optionsRef.current.loaded) {
			optionsContext.askOptions((loaded, options) => {
				if (loaded) {
					optionsRef.current = {options, loaded: true};
				}
			});
		}
	}, [optionsContext]);
	useEffect(() => {
		if (!mainOptionsHolder) {
			return;
		}

		const onAskOptions = (callback: (loaded: boolean, options: Array<HxSelectOption>) => void) => {
			callback(optionsRef.current.loaded, optionsRef.current.options);
		};

		optionsContext.onAskOptions(onAskOptions);
		return () => {
			optionsContext.offAskOptions(onAskOptions);
		};
	}, [mainOptionsHolder, optionsContext]);
	/**
	 * Listen for options load/change events to update the options list
	 * Also handles value synchronization when options change
	 */
	useEffect(() => {
		/**
		 * Handle options load or change events to update local options state
		 * @param options - New options list
		 */
		const onOptionsLoadOrChange = (options: Array<HxSelectOption>) => {
			optionsRef.current = {options, loaded: true};
			context.forceUpdate();
		};

		// Handle value change events from options context to sync with parent model
		// newValue - New value from options change
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const onValueChangeWhenOptionsChange = (newValue: any): void => {
			if (!captureValueChangeOnOptionsChange) {
				return;
			}
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
	}, [$model, $field, captureValueChangeOnOptionsChange, optionsContext, context]);

	return optionsRef;
};