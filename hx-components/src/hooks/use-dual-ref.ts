import {type ForwardedRef, type MutableRefObject, type RefObject, useEffect, useRef, useState} from 'react';

/**
 * A ref object which mirrors its `current` onto a forwarded ref.
 *
 * React assigns `current` when it attaches and detaches the element, so the
 * forwarded ref is reached at commit time, the same as a ref passed to the
 * element directly. An element the component renders conditionally is attached
 * later and is followed the same way.
 */
class RefDelegate<T> {
	private ref: MutableRefObject<T | undefined>;
	private fRef: ForwardedRef<T> | undefined;

	constructor(ref: MutableRefObject<T | undefined>, fRef: ForwardedRef<T>) {
		this.ref = ref;
		this.fRef = fRef;
		if (this.ref.current != null) {
			this.syncToFRef(this.ref.current);
		}
	}

	/**
	 * Points the delegate at the latest forwarded ref.
	 *
	 * When the forwarded ref changed and the element is mounted, the new one
	 * receives the element. A run where nothing changed stays silent, because
	 * the setter already reached the forwarded ref when React attached the element.
	 */
	reinstall(ref: MutableRefObject<T | undefined>, fRef: ForwardedRef<T>): this {
		let changed = false;
		if (this.ref !== ref) {
			this.ref = ref;
			changed = true;
		}
		if (this.fRef !== fRef) {
			this.fRef = fRef;
			changed = true;
		}
		if (changed && this.ref.current != null) {
			this.syncToFRef(this.ref.current);
		}
		return this;
	}

	private syncToFRef(value: T): void {
		if (typeof this.fRef === 'function') {
			this.fRef(value);
		} else if (this.fRef != null) {
			this.fRef.current = value;
		}
	}

	get current(): T | null {
		return this.ref.current ?? null;
	}

	set current(value: T) {
		this.ref.current = value;
		this.syncToFRef(value);
	}
}

/**
 * Creates a ref to put on an element and keeps a forwarded ref in sync with it.
 *
 * The returned object is stable across renders. The forwarded ref is set when
 * the element is attached and cleared when the element is detached, including
 * an element that is rendered later. A forwarded ref that changes while the
 * element is mounted receives the element.
 *
 * @param fRef - The ref forwarded to the component by `forwardRef`
 * @returns A stable ref object, passed to the `ref` of the element
 */
export const useDualRef = <T>(fRef: ForwardedRef<T>): RefObject<T> => {
	const ref = useRef<T>();

	const [dual] = useState<RefObject<T>>(() => new RefDelegate(ref, fRef));
	useEffect(() => {
		(dual as RefDelegate<T>).reinstall(ref, fRef);
	}, [ref, fRef, dual]);

	return dual;
};
