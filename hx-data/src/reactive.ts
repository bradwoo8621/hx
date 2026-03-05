import {EventEmitter} from './events.ts';

export type PathToRoot = string;
export type PathToParent = string;

const FUNC_GET_ROOT = Symbol('#func-get-root');
const FUNC_GET_PARENT = Symbol('#func-get-parent');
const FUNC_PATH_TO_ROOT = Symbol('#func-path-to-root');
const FUNC_PATH_TO_PARENT = Symbol('#func-path-to-parent');

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

const FUNC_TRIGGER_CHANGE = Symbol('#func-trigger-change');
const FUNC_ON_CHANGE = Symbol('#func-on-change');

export type FuncTriggerChange = (target: ReactiveObject, key: string, oldValue: any, newValue: any) => void;

export interface ValueChangedEvent {
	root: ReactiveRoot;
	parent: ReactiveObject;
	oldValue: any;
	newValue: any;
	pathToRoot: PathToRoot;
	pathToParent: PathToParent;
}

export type FuncOnChange = (handle: (event: ValueChangedEvent) => void) => void;

export interface ReactiveRoot extends ReactiveObject {
	[FUNC_TRIGGER_CHANGE]: FuncTriggerChange;
	[FUNC_ON_CHANGE]: FuncOnChange;
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
		[FUNC_ON_CHANGE]: (handle: (event: ValueChangedEvent) => void): void => {
			events.on(ON_CHANGE_EVENT, handle);
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