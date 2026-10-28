import {type MutableRefObject, useState} from 'react';

/**
 * Creates a ref whose `current` value is the result of `func`.
 *
 * Unlike `useRef(func())`, where the argument is re-evaluated on every render
 * and the result discarded, `func` runs exactly once (as a lazy `useState`
 * initializer). The returned object keeps a stable identity across renders,
 * so it is safe to put in effect dependency arrays.
 *
 * `func` is never called again, so it must not depend on changing props or
 * state; further changes are ignored, same as a `useRef` initializer argument.
 *
 * @param func - Factory for the initial `current` value, invoked once
 * @returns A stable mutable ref object holding the factory result
 */
export const useFuncResultRef = <R>(func: () => R): MutableRefObject<R> => {
	const [state] = useState<MutableRefObject<R>>(() => ({current: func()}));
	return state;
};
