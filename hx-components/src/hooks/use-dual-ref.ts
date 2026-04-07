import {type ForwardedRef, type RefObject, useEffect, useRef} from 'react';

export const useDualRef = <T>(fRef: ForwardedRef<T>): RefObject<T> => {
	const ref = useRef<T>(null);

	useEffect(() => {
		if (typeof fRef === 'function') {
			fRef(ref.current);
		} else if (fRef !== null && typeof fRef === 'object') {
			// eslint-disable-next-line react-hooks/immutability
			fRef.current = ref.current;
		}
	}, [ref, fRef]);

	return ref;
};
