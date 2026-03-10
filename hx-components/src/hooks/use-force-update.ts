import {useReducer} from 'react';

export const useForceUpdate = () => {
	const [, forceUpdate] = useReducer((x: boolean) => !x, true);
	return forceUpdate;
};
