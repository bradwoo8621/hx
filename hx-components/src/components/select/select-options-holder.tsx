// @ts-expect-error import React
import React, {Fragment, useEffect} from 'react';
import {type HxContext, useHxContext} from '../../contexts';
import type {HxObject} from '../../types';
import {useHxPopupContext} from '../popup';
import {EvtOptionsLoad, type HxSelectOption, type HxSelectOptions, type HxSelectProps} from './types';

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

export type HxSelectOptionsProps<T extends object> = Pick<
	HxSelectProps<T>,
	| '$model' | 'options'
>;

export const HxSelectOptionsHolder =
	<T extends object>(props: HxSelectOptionsProps<T>) => {
		const {$model, options: givenOptions} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();

		useEffect(() => {
			(async () => {
				const options = await getOptions($model, context, givenOptions);
				popupContext.emit(EvtOptionsLoad, options);
			})();
		}, [$model, givenOptions, popupContext, context]);
		// TODO logic for monitor somewhere on model changed leading options change

		return <Fragment/>;
	};