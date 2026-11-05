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
	// a counter never returns to its previous state, so several updates batched
	// into one render still commit; a boolean toggle would be treated as a bailout
	const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
	return forceUpdate;
};
