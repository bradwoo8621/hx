import {ERO, type ModelPath} from '@hx/data';
import type {HxContext} from '../../contexts';
import type {HxDataPath, HxObject} from '../../types';
import type {HxMSelectFromModelFunc, HxMSelectToModelFunc} from './types';

export const createFromAndToModelFuncs = <T extends object>(options: {
	$model?: HxObject<T>, $field: ModelPath<T> | HxDataPath,
	fromModel?: HxMSelectFromModelFunc; toModel?: HxMSelectToModelFunc;
	context: HxContext;
}) => {
	const {$model, $field, context, fromModel, toModel} = options;

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

	return {getValueFromModel, setValueToModel};
};
