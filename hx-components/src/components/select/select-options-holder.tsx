import {ERO, type OnChangeEventHandle} from '@hx/data';
// @ts-expect-error import React
import React, {Fragment, useEffect} from 'react';
import {type HxContext, useHxContext} from '../../contexts';
import {computeMonitorPaths} from '../../hooks';
import type {HxObject} from '../../types';
import {useHxPopupContext} from '../popup';
import {HxSelectDefaults} from './defaults';
import {EvtOptionsChange, EvtOptionsLoad, type HxSelectOption, type HxSelectOptions, type HxSelectProps} from './types';

/**
 * Resolve options from various source types (static array, sync function, async function)
 * @template T - Type of the form model object
 * @param model - Form model object
 * @param context - HX application context
 * @param options - Options source to resolve
 * @returns Promise resolving to array of select options
 */
const getOptions = async <T extends object>(
	model: HxObject<T>, context: HxContext,
	options: HxSelectOptions<T>
): Promise<Array<HxSelectOption>> => {
	const typeOfOptions = typeof options;
	if (typeOfOptions === 'function') {
		const ret = (options as Exclude<HxSelectOptions<T>, Array<HxSelectOption>>)(model, context);
		if (Array.isArray(ret)) {
			return ret;
		} else {
			return await ret;
		}
	} else {
		return options as Array<HxSelectOption>;
	}
};

/**
 * Select options holder component props
 * @template T - Type of the form model object
 */
export type HxSelectOptionsProps<T extends object> = Pick<
	HxSelectProps<T>,
	| '$model' | '$field'
	| 'options' | 'optionsDependsOn' | 'onOptionsChange'
>;

/**
 * Options holder component that preloads options even when popup is closed
 * This allows async options to load in the background for faster popup opening
 * @template T - Type of the form model object
 * @param props - Component props
 */
export const HxSelectOptionsHolder =
	<T extends object>(props: HxSelectOptionsProps<T>) => {
		const {
			$model, $field,
			options: givenOptions, optionsDependsOn,
			onOptionsChange = HxSelectDefaults.onOptionsChange
		} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();

		/**
		 * Load options when component mounts or options source changes
		 */
		useEffect(() => {
			(async () => {
				const options = await getOptions($model, context, givenOptions);
				popupContext.emit(EvtOptionsLoad, options);
			})();
		}, [$model, givenOptions, popupContext, context]);
		useEffect(() => {
			if (optionsDependsOn == null || optionsDependsOn.length === 0) {
				return;
			}
			const paths = computeMonitorPaths(optionsDependsOn, $model, {on: optionsDependsOn});
			if (paths.length === 0) {
				return;
			}

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const listener: OnChangeEventHandle = async (_ev) => {
				const options = await getOptions($model, context, givenOptions);
				if (onOptionsChange === 'clear') {
					ERO.setValue($model, $field, null);
				} else if (typeof onOptionsChange === 'function') {
					const newValue = onOptionsChange(options);
					if (newValue != ERO.getValue($model, $field)) {
						ERO.setValue($model, $field, newValue);
					}
				}
				popupContext.emit(EvtOptionsChange, options);
			};
			paths.forEach(path => ERO.on($model, path, listener));

			return () => {
				paths.forEach(path => ERO.off($model, path, listener));
			};
		}, [$model, $field, givenOptions, optionsDependsOn, onOptionsChange, context, popupContext]);

		// This component doesn't render anything visible
		return <Fragment/>;
	};
