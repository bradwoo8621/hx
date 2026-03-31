// @ts-expect-error import React
import React, {Fragment, useEffect} from 'react';
import {type HxContext, useHxContext} from '../../contexts';
import type {HxObject} from '../../types';
import {useHxPopupContext} from '../popup';
import {EvtOptionsLoad, type HxSelectOption, type HxSelectOptions, type HxSelectProps} from './types';

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
	| '$model' | 'options'
>;

/**
 * Options holder component that preloads options even when popup is closed
 * This allows async options to load in the background for faster popup opening
 * @template T - Type of the form model object
 * @param props - Component props
 */
export const HxSelectOptionsHolder =
	<T extends object>(props: HxSelectOptionsProps<T>) => {
		const {$model, options: givenOptions} = props;

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

		// TODO: Add logic to monitor model changes that affect options

		// This component doesn't render anything visible
		return <Fragment/>;
	};