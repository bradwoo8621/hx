import {useReducer} from 'react';

/**
 * Returns a dispatch that re-renders only the component that calls this hook.
 *
 * The dispatch is local to the hook owner: it does not reach the context
 * provider and does not re-render components outside the caller's subtree.
 * Every component that calls this hook gets its own dispatch, so it cannot be
 * used to refresh another component.
 */
export const useForceUpdate = () => {
	const [, forceUpdate] = useReducer((x: boolean) => !x, true);
	return forceUpdate;
};
