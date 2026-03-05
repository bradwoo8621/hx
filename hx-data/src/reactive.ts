import {EventEmitter} from './events.ts';

export type PathToRoot = string;
export type PathToParent = string;

export const FUNC_GET_ROOT = Symbol('#func-get-root');
export const FUNC_GET_PARENT = Symbol('#func-get-parent');
export const FUNC_PATH_TO_ROOT = Symbol('#func-path-to-root');
export const FUNC_PATH_TO_PARENT = Symbol('#func-path-to-parent');

export type FuncGetRoot = () => ReactiveRoot;
export type FuncGetParent = () => ReactiveObject | undefined;
export type FuncPathToRoot = () => PathToRoot;
export type FuncPathToParent = () => PathToParent;

export interface ReactiveObject {
	[FUNC_GET_ROOT]: FuncGetRoot;
	[FUNC_GET_PARENT]: FuncGetParent;
	[FUNC_PATH_TO_ROOT]: FuncPathToRoot;
	[FUNC_PATH_TO_PARENT]: FuncPathToParent;
}

export const FUNC_TRIGGER_CHANGE = Symbol('#func-trigger-change');
export const FUNC_ON_CHANGE = Symbol('#func-on-change');
export const FUNC_OFF_CHANGE = Symbol('#func-off-change');

export type FuncTriggerChange = (target: ReactiveObject, key: string, oldValue: any, newValue: any) => void;

export interface ValueChangedEvent {
	root: ReactiveRoot;
	parent: ReactiveObject;
	oldValue: any;
	newValue: any;
	pathToRoot: PathToRoot;
	pathToParent: PathToParent;
}

export type OnChangeEventHandle = (event: ValueChangedEvent) => void;
export type FuncOnChange = (handle: OnChangeEventHandle) => void;
export type FuncOffChange = (handle: OnChangeEventHandle) => void;

export interface ReactiveRoot extends ReactiveObject {
	[FUNC_TRIGGER_CHANGE]: FuncTriggerChange;
	[FUNC_ON_CHANGE]: FuncOnChange;
	[FUNC_OFF_CHANGE]: FuncOffChange;
}

const reactiveObject = <T extends object>(parent: ReactiveObject, pathToParent: PathToParent, obj: T): ReactiveObject => {
	const parentPathToRoot = parent[FUNC_PATH_TO_ROOT]();
	let pathToRoot: PathToRoot;
	if (Array.isArray(parent)) {
		// array path presents as [index]
		pathToRoot = `[${pathToParent}]`;
	} else {
		pathToRoot = pathToParent;
	}
	if (parentPathToRoot !== '') {
		pathToRoot = `${parentPathToRoot}.${pathToRoot}`;
	}
	const funcMap: ReactiveObject = {
		[FUNC_GET_ROOT]: (): ReactiveRoot => parent[FUNC_GET_ROOT](),
		[FUNC_GET_PARENT]: () => parent,
		[FUNC_PATH_TO_ROOT]: (): PathToRoot => pathToRoot,
		[FUNC_PATH_TO_PARENT]: (): PathToParent => pathToParent
	};

	const handler: ProxyHandler<T> = {
		get(target: T, key: string | symbol, receiver: any): any {
			// @ts-ignore
			const func = funcMap[key] as any;
			if (func != null) {
				return func;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				throw new Error(`Key[${String(key)}] is not supported.`);
			} else {
				const result = Reflect.get(target, key, receiver);
				if (typeof result === 'object' && result !== null) {
					return reactiveObject(proxiedObject, key, result);
				}
				return result;
			}
		},
		set(target: T, key: string | symbol, newValue: any, receiver: any): boolean {
			// @ts-ignore
			if (FUNC_SYMBOLS.includes(key)) {
				return false;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				throw new Error(`Key[${String(key)}] is not supported.`);
			} else {
				// @ts-ignore
				const oldValue = target[key];
				const result = Reflect.set(target, key, newValue, receiver);
				if (oldValue !== newValue) {
					funcMap[FUNC_GET_ROOT]()[FUNC_TRIGGER_CHANGE](proxiedObject, key, oldValue, newValue);
				}
				return result;
			}
		},
		deleteProperty(target: T, key: string | symbol): boolean {
			// @ts-ignore
			if (FUNC_SYMBOLS.includes(key)) {
				return false;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				throw new Error(`Key[${String(key)}] is not supported.`);
			} else {
				const hadKey = Object.prototype.hasOwnProperty.call(target, key);
				// @ts-ignore
				const oldValue = target[key];
				const result = Reflect.deleteProperty(target, key);
				if (hadKey && result) {
					funcMap[FUNC_GET_ROOT]()[FUNC_TRIGGER_CHANGE](proxiedObject, key, oldValue, (void 0));
				}
				return result;
			}
		}
	};

	const proxiedObject = new Proxy(obj, handler) as ReactiveObject;
	return proxiedObject;
};

export interface ReactiveOptions {
}

const ON_CHANGE_EVENT = 'on-change';
const FUNC_SYMBOLS = [FUNC_GET_ROOT, FUNC_GET_PARENT, FUNC_PATH_TO_ROOT, FUNC_PATH_TO_PARENT, FUNC_TRIGGER_CHANGE, FUNC_ON_CHANGE];

const asReactiveRoot = <T extends object>(root: T, _options?: ReactiveOptions): ReactiveRoot => {
	if (Array.isArray(root)) {
		throw new Error(`Root cannot be an array.`);
	}

	const events = new EventEmitter();
	const funcMap: ReactiveRoot = {
		[FUNC_GET_ROOT]: (): ReactiveRoot => proxiedRoot,
		[FUNC_GET_PARENT]: () => (void 0),
		[FUNC_PATH_TO_ROOT]: (): PathToRoot => '',
		[FUNC_PATH_TO_PARENT]: (): PathToParent => '',
		[FUNC_TRIGGER_CHANGE]: (parent: ReactiveObject, key: string, oldValue: any, newValue: any): void => {
			let pathToParent: PathToParent;
			if (Array.isArray(parent)) {
				pathToParent = `[${key}]`;
			} else {
				pathToParent = key;
			}

			let pathToRoot: PathToRoot;
			const objPathToRoot = parent[FUNC_PATH_TO_ROOT]();
			if (objPathToRoot !== '') {
				pathToRoot = `${objPathToRoot}.${pathToParent}`;
			} else {
				pathToRoot = pathToParent;
			}

			events.emit(ON_CHANGE_EVENT, {
				root: proxiedRoot, parent,
				oldValue, newValue,
				pathToRoot, pathToParent
			} as ValueChangedEvent);
		},
		[FUNC_ON_CHANGE]: (handle: OnChangeEventHandle): void => {
			events.on(ON_CHANGE_EVENT, handle);
		},
		[FUNC_OFF_CHANGE]: (handle: OnChangeEventHandle): void => {
			events.off(ON_CHANGE_EVENT, handle);
		}
	};

	const handler: ProxyHandler<T> = {
		get(target: T, key: string | symbol, receiver: any): any {
			// @ts-ignore
			const func = funcMap[key] as any;
			if (func != null) {
				return func;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				throw new Error(`Key[${String(key)}] is not supported.`);
			} else {
				const result = Reflect.get(target, key, receiver);
				if (typeof result === 'object' && result !== null) {
					return reactiveObject(proxiedRoot, key, result);
				}
				return result;
			}
		},
		set(target: T, key: string | symbol, newValue: any, receiver: any): boolean {
			// @ts-ignore
			if (FUNC_SYMBOLS.includes(key)) {
				return false;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				throw new Error(`Key[${String(key)}] is not supported.`);
			} else {
				// @ts-ignore
				const oldValue = target[key];
				const result = Reflect.set(target, key, newValue, receiver);
				if (oldValue !== newValue) {
					funcMap[FUNC_TRIGGER_CHANGE](proxiedRoot, key, oldValue, newValue);
				}
				return result;
			}
		},
		deleteProperty(target: T, key: string | symbol): boolean {
			// @ts-ignore
			if (FUNC_SYMBOLS.includes(key)) {
				return false;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				throw new Error(`Key[${String(key)}] is not supported.`);
			} else {
				const hadKey = Object.prototype.hasOwnProperty.call(target, key);
				// @ts-ignore
				const oldValue = target[key];
				const result = Reflect.deleteProperty(target, key);
				if (hadKey && result) {
					funcMap[FUNC_TRIGGER_CHANGE](proxiedRoot, key, oldValue, (void 0));
				}
				return result;
			}
		}
	};

	const proxiedRoot = new Proxy(root, handler) as ReactiveRoot;
	return proxiedRoot;
};

export const reactive = <T extends object>(target: T, options?: ReactiveOptions): T => {
	return asReactiveRoot(target, options) as T;
};

export class ExposedReactiveObject {
	/**
	 * first key: monitor path
	 * second key: given listener
	 * value: wrapped listener, which registered into events
	 */
	private static LISTENERS = new Map<PathToRoot, Map<OnChangeEventHandle, OnChangeEventHandle>>();

	private static assertReactive(obj: any): ReactiveObject {
		if (obj == null) {
			throw new Error('Cannot expose null value.');
		}
		if (typeof obj !== 'object') {
			throw new Error('Cannot expose a non-object value.');
		}
		const func = obj[FUNC_GET_ROOT];
		if (func != null) {
			return obj as ReactiveObject;
		} else {
			throw new Error(`Cannot expose a non-reactive object.`);
		}
	}

	/**
	 * emit change
	 * @param obj where the value change occurred
	 * @param key property name, or array index
	 * @param oldValue
	 * @param newValue
	 */
	static emit(obj: any, key: string, oldValue: any, newValue: any): void {
		const ro = ExposedReactiveObject.assertReactive(obj);
		ro[FUNC_GET_ROOT]()[FUNC_TRIGGER_CHANGE](obj, key, oldValue, newValue);
	}

	/**
	 * handle change
	 * @param obj
	 * @param path
	 * @param listen
	 */
	static on(obj: any, path: PathToRoot, listen: OnChangeEventHandle): void {
		const ro = ExposedReactiveObject.assertReactive(obj);

		let existing = ExposedReactiveObject.LISTENERS.get(path);
		if (existing != null) {
			if (existing.has(listen)) {
				// already monitor
				return;
			}
		}
		const wrappedListener: OnChangeEventHandle = (event: ValueChangedEvent): void => {
			if (path === '') {
				// monitor everything
				listen(event);
			} else if (event.pathToRoot.startsWith(path)) {
				// event path equals or is sub-path of monitor path
				listen(event);
			}
		};
		if (existing == null) {
			existing = new Map<OnChangeEventHandle, OnChangeEventHandle>();
			ExposedReactiveObject.LISTENERS.set(path, existing);
		}
		existing.set(listen, wrappedListener);
		ro[FUNC_GET_ROOT]()[FUNC_ON_CHANGE](wrappedListener);
	}

	/**
	 * stop handle change
	 * @param obj
	 * @param path
	 * @param listen
	 */
	static off(obj: any, path: PathToRoot, listen: OnChangeEventHandle): void {
		const ro = ExposedReactiveObject.assertReactive(obj);
		const existing = ExposedReactiveObject.LISTENERS.get(path);
		if (existing == null) {
			// never monitor given path
			return;
		}
		const wrappedListener = existing.get(listen);
		if (wrappedListener != null) {
			// found, remove
			existing.delete(listen);
			ro[FUNC_GET_ROOT]()[FUNC_OFF_CHANGE](wrappedListener);
		}
	}
}

/** alias of ExposedReactiveObject */
export const ERO = ExposedReactiveObject;
