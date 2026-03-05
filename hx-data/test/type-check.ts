import {ERO, ReactiveObject, ReactiveRoot} from '../src';

export const isReactiveRoot = (obj: any): obj is ReactiveRoot => {
	return obj != null && typeof obj === 'object' && typeof obj[ERO.FUNC_GET_ROOT] === 'function' && typeof obj[ERO.FUNC_TRIGGER_CHANGE] === 'function';
};

export const isReactiveObject = (obj: any): obj is ReactiveObject => {
	return obj != null && typeof obj === 'object' && typeof obj[ERO.FUNC_GET_ROOT] === 'function';
};
