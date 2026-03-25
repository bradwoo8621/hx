import {type ForwardedRef, useEffect, useRef} from 'react';

export const useDualRef = <T>(fRef: ForwardedRef<T>) => {
	const ref = useRef<T>(null);

	useEffect(() => {
		if (typeof fRef === 'function') {
			fRef(ref.current);
		} else if (fRef !== null && typeof fRef === 'object') {
			fRef.current = ref.current;
		}
	}, [ref, fRef]);

	return ref;
};
