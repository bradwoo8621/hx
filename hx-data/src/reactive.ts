import {EventEmitter} from './events.ts';

/**
 * Represents a path from the root of a reactive object to a nested property.
 * Example: "user.address.city" or "items.[0].name"
 */
export type PathToRoot = string;

/**
 * Represents a path from a parent object to its immediate child property.
 * Example: "city" or "[0]"
 */
export type PathToParent = string;

const FUNC_GET_ROOT = Symbol('#func-get-root');
const FUNC_GET_PARENT = Symbol('#func-get-parent');
const FUNC_PATH_TO_ROOT = Symbol('#func-path-to-root');
const FUNC_PATH_TO_PARENT = Symbol('#func-path-to-parent');
const FUNC_REVOKE = Symbol('#func-revoke');

/**
 * Function type that returns the root reactive object.
 */
export type FuncGetRoot = () => ReactiveRoot;

/**
 * Function type that returns the parent reactive object.
 * Returns undefined for the root object.
 */
export type FuncGetParent = () => ReactiveObject | undefined;

/**
 * Function type that returns the absolute path from the root.
 */
export type FuncPathToRoot = () => PathToRoot;

/**
 * Function type that returns the path from the parent to this object.
 */
export type FuncPathToParent = () => PathToParent;

/**
 * Function type that returns the underlying non-reactive object.
 */
export type FuncRevoke = <T extends object>() => T;

/**
 * Represents a reactive object with internal metadata functions.
 * This interface defines Symbol-based methods used internally
 * to navigate and manage the reactive object hierarchy.
 *
 * @remarks
 * This interface is used internally by the reactive system. Users should
 * use the public API through {@link reactive} and {@link ExposedReactiveObject}.
 */
export interface ReactiveObject {
	/** Function that returns the root reactive object */
	[FUNC_GET_ROOT]: FuncGetRoot;
	/** Function that returns the parent reactive object */
	[FUNC_GET_PARENT]: FuncGetParent;
	/** Function that returns the absolute path from the root */
	[FUNC_PATH_TO_ROOT]: FuncPathToRoot;
	/** Function that returns the path from the parent */
	[FUNC_PATH_TO_PARENT]: FuncPathToParent;
	/** Function that returns the underlying non-reactive object */
	[FUNC_REVOKE]: FuncRevoke;
}

const FUNC_TRIGGER_CHANGE = Symbol('#func-trigger-change');
const FUNC_ON_CHANGE = Symbol('#func-on-change');
const FUNC_OFF_CHANGE = Symbol('#func-off-change');

/**
 * Internal function type to trigger change events.
 * @param target - The reactive object where the change occurred
 * @param key - The property key or array index that changed
 * @param oldValue - The previous value
 * @param newValue - The new value
 */
export type FuncTriggerChange = (target: ReactiveObject, key: string, oldValue: any, newValue: any) => void;

/**
 * Event object emitted when a reactive property value changes.
 *
 * @example
 * ```ts
 * const obj = reactive({user: {name: 'John'}});
 * ERO.on(obj, 'user.name', (event: ValueChangedEvent) => {
 *   console.log(event.oldValue); // 'John'
 *   console.log(event.newValue); // 'Jane'
 *   console.log(event.pathToRoot); // 'user.name'
 *   console.log(event.pathToParent); // 'name'
 * });
 * obj.user.name = 'Jane';
 * ```
 *
 * @example
 * ```ts
 * const obj = reactive({items: [1, 2, 3]});
 * ERO.on(obj, 'items.[0]', (event: ValueChangedEvent) => {
 *   console.log(event.oldValue); // 1
 *   console.log(event.newValue); // 10
 *   console.log(event.pathToRoot); // 'items.[0]'
 *   console.log(event.pathToParent); // '[0]'
 * });
 * obj.items[0] = 10;
 * ```
 */
export interface ValueChangedEvent {
	/** The root reactive object */
	root: ReactiveRoot;
	/** The parent object where the change occurred */
	parent: ReactiveObject;
	/** The value before the change */
	oldValue: any;
	/** The value after the change */
	newValue: any;
	/** The absolute path from the root to the changed property */
	pathToRoot: PathToRoot;
	/** The path from the parent to the changed property */
	pathToParent: PathToParent;
}

/**
 * Callback function type for handling value change events.
 * @param event - The value changed event object
 */
export type OnChangeEventHandle = (event: ValueChangedEvent) => void;

/**
 * Internal function type to register a change event listener.
 * @param handle - The callback function to register
 */
export type FuncOnChange = (handle: OnChangeEventHandle) => void;

/**
 * Internal function type to unregister a change event listener.
 * @param handle - The callback function to unregister
 */
export type FuncOffChange = (handle: OnChangeEventHandle) => void;

/**
 * Represents the root reactive object in the reactive hierarchy.
 * Extends {@link ReactiveObject} with additional change event management capabilities.
 *
 * @remarks
 * Only the root object has the ability to trigger and manage change events.
 * All nested reactive objects proxy these operations up to the root.
 */
export interface ReactiveRoot extends ReactiveObject {
	/** Internal function to trigger a change event */
	[FUNC_TRIGGER_CHANGE]: FuncTriggerChange;
	/** Internal function to register a change listener */
	[FUNC_ON_CHANGE]: FuncOnChange;
	/** Internal function to unregister a change listener */
	[FUNC_OFF_CHANGE]: FuncOffChange;
}

/**
 * Array methods that mutate arrays and need to be wrapped for change detection.
 */
const ARRAY_MUTATION_METHODS = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin'];

/**
 * Creates a reactive proxy for a nested object.
 * This function is called when accessing a property that contains an object or array.
 * It sets up the proxy with proper parent reference and path tracking.
 *
 * @param parent - The parent reactive object in the hierarchy
 * @param pathToParent - The path from parent to this object (e.g., "user" or "[0]")
 * @param obj - The object or array to make reactive
 * @returns A reactive proxy for the nested object
 *
 * @remarks
 * - If obj is already reactive, it gets revoked (unwrapped) first
 * - Path to root is constructed by combining parent's path with path to parent
 * - Array paths use bracket notation: "[0]", "[1]", etc.
 * - Object paths use dot notation: "user", "name", etc.
 *
 * @internal
 */
const reactiveObject = (parent: ReactiveObject, pathToParent: PathToParent, obj: object): ReactiveObject => {
	if (ExposedReactiveObject.isReactiveObject(obj)) {
		obj = ExposedReactiveObject.revoke(obj);
	}

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
		[FUNC_PATH_TO_PARENT]: (): PathToParent => pathToParent,
		[FUNC_REVOKE]: <T extends object>(): T => obj as T
	};

	const handler: ProxyHandler<object> = {
		get(target: object, key: string | symbol, receiver: any): any {
			// @ts-ignore
			const func = funcMap[key] as any;
			if (func != null) {
				return func;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				return Reflect.get(target, key, receiver);
			} else {
				const result = Reflect.get(target, key, receiver);

				// If target is an array, and we're accessing a mutation method, return a wrapper
				if (Array.isArray(target) && ARRAY_MUTATION_METHODS.includes(key) && typeof result === 'function') {
					return function (this: any[], ...args: any[]) {
						const array = this as unknown as any[];
						// mutation functions change the content of array,
						// and the array itself is not changed,
						// to make sure old value can be kept properly, have to make a shallow copy of it
						const oldValue = array.slice();
						// @ts-ignore
						const methodResult = Reflect.apply(result, this, args);
						// considering symmetry, also perform a shallow copy of new value.
						const newValue = array.slice();
						// Emit a change event at the parent level with the array's property name
						funcMap[FUNC_GET_ROOT]()[FUNC_TRIGGER_CHANGE](parent, pathToParent, oldValue, newValue);
						return methodResult;
					}.bind(target);
				}

				if (typeof result === 'object' && result !== null) {
					return reactiveObject(proxiedObject, key, result);
				}
				return result;
			}
		},
		set(target: object, key: string | symbol, newValue: any, receiver: any): boolean {
			// @ts-ignore
			if (FUNC_SYMBOLS.includes(key)) {
				return false;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				return Reflect.set(target, key, newValue, receiver);
			} else if (Array.isArray(target) && key === 'length') {
				// If target is an array, and we're accessing a mutation method, return a wrapper
				const array = target as unknown as any[];
				const oldLength = array.length;
				// mutation functions change the content of array,
				// and the array itself is not changed, so have to make a shallow copy of it
				const oldValue = array.slice();
				const result = Reflect.set(target, key, newValue, receiver);
				if (oldLength != array.length) {
					funcMap[FUNC_GET_ROOT]()[FUNC_TRIGGER_CHANGE](parent, pathToParent, oldValue, array);
				}
				return result;
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
		deleteProperty(target: object, key: string | symbol): boolean {
			// @ts-ignore
			if (FUNC_SYMBOLS.includes(key)) {
				return false;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				return Reflect.deleteProperty(target, key);
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

/**
 * Configuration options for creating reactive objects.
 * Currently empty but reserved for future extensions.
 */
export interface ReactiveOptions {
}

const ON_CHANGE_EVENT = 'on-change';
const FUNC_SYMBOLS = [FUNC_GET_ROOT, FUNC_GET_PARENT, FUNC_PATH_TO_ROOT, FUNC_PATH_TO_PARENT, FUNC_TRIGGER_CHANGE, FUNC_ON_CHANGE];

/**
 * Creates a reactive root object.
 * This is the entry point for creating the top-level reactive object.
 * Only root objects can manage change events; nested objects delegate to root.
 *
 * @param root - The object to make reactive root. Cannot be an array.
 * @param _options - Reserved for future configuration options
 * @returns A reactive root object with change event management capabilities
 *
 * @throws {Error} If root is an array
 *
 * @remarks
 * - Root objects have special capabilities: trigger change, register listeners, unregister listeners
 * - Arrays cannot be root objects but can be nested properties
 * - If root is already reactive, it gets revoked (unwrapped) first
 *
 * @internal
 */
const asReactiveRoot = (root: object, _options?: ReactiveOptions): ReactiveRoot => {
	if (Array.isArray(root)) {
		throw new Error(`Root cannot be an array.`);
	}

	if (ExposedReactiveObject.isReactiveObject(root)) {
		root = ExposedReactiveObject.revoke(root);
	}

	const events = new EventEmitter();
	const funcMap: ReactiveRoot = {
		[FUNC_GET_ROOT]: (): ReactiveRoot => proxiedRoot,
		[FUNC_GET_PARENT]: () => (void 0),
		[FUNC_PATH_TO_ROOT]: (): PathToRoot => '',
		[FUNC_PATH_TO_PARENT]: (): PathToParent => '',
		[FUNC_REVOKE]: <T extends object>(): T => root as T,
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

	const handler: ProxyHandler<object> = {
		get(target: object, key: string | symbol, receiver: any): any {
			// @ts-ignore
			const func = funcMap[key] as any;
			if (func != null) {
				return func;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				return Reflect.get(target, key, receiver);
			} else {
				const result = Reflect.get(target, key, receiver);
				if (typeof result === 'object' && result !== null) {
					return reactiveObject(proxiedRoot, key, result);
				}
				return result;
			}
		},
		set(target: object, key: string | symbol, newValue: any, receiver: any): boolean {
			// @ts-ignore
			if (FUNC_SYMBOLS.includes(key)) {
				return false;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				return Reflect.set(target, key, newValue, receiver);
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
		deleteProperty(target: object, key: string | symbol): boolean {
			// @ts-ignore
			if (FUNC_SYMBOLS.includes(key)) {
				return false;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				return Reflect.deleteProperty(target, key);
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

/**
 * Creates a reactive object from the given target.
 *
 * @template T - The type of object to make reactive
 * @param target - The object to make reactive. Cannot be an array.
 * @param options - Optional configuration options for the reactive object
 * @returns A reactive version of the target object with the same type T
 *
 * @throws {Error} If target is an array
 *
 * @example
 * ```ts
 * const state = reactive({count: 0, user: {name: 'John'}});
 *
 * // Listen to changes
 * ERO.on(state, 'count', (event) => {
 *   console.log(`Count changed from ${event.oldValue} to ${event.newValue}`);
 * });
 *
 * // Modify the reactive object
 * state.count = 1; // Triggers a change event
 * state.user.name = 'Jane'; // Triggers a change event for 'user.name'
 * ```
 */
export const reactive = <T extends object>(target: T, options?: ReactiveOptions): T => {
	return asReactiveRoot(target, options) as T;
};

// noinspection JSUnusedGlobalSymbols
/**
 * Static utility class providing the public API for working with reactive objects.
 * This class provides methods for checking, observing, and managing reactive objects.
 *
 * @remarks
 * All methods in this class are static. The class cannot be instantiated.
 * Use the exported {@link ERO} constant for convenient access.
 *
 * @example
 * ```ts
 * import {reactive, ERO} from 'hx-data';
 *
 * const state = reactive({count: 0});
 * ERO.on(state, 'count', (event) => {
 *   console.log('Count changed:', event.newValue);
 * });
 * ```
 */
export class ExposedReactiveObject {
	/** Symbol for accessing the internal getRoot function */
	static readonly FUNC_GET_ROOT = FUNC_GET_ROOT;
	/** Symbol for accessing the internal getParent function */
	static readonly FUNC_GET_PARENT = FUNC_GET_PARENT;
	/** Symbol for accessing the internal getPathToRoot function */
	static readonly FUNC_PATH_TO_ROOT = FUNC_PATH_TO_ROOT;
	/** Symbol for accessing the internal getPathToParent function */
	static readonly FUNC_PATH_TO_PARENT = FUNC_PATH_TO_PARENT;
	/** Symbol for accessing the internal triggerChange function */
	static readonly FUNC_TRIGGER_CHANGE = FUNC_TRIGGER_CHANGE;
	/** Symbol for accessing the internal onChange function */
	static readonly FUNC_ON_CHANGE = FUNC_ON_CHANGE;
	/** Symbol for accessing the internal offChange function */
	static readonly FUNC_OFF_CHANGE = FUNC_OFF_CHANGE;

	/**
	 * Internal registry of active change listeners.
	 * First key: monitor path
	 * Second key: given listener reference
	 * Value: wrapped listener registered into the event system
	 *
	 * @internal
	 */
	private static readonly LISTENERS = new Map<PathToRoot, Map<OnChangeEventHandle, OnChangeEventHandle>>();

	/**
	 * Type guard to check if an object is a reactive root object.
	 *
	 * @param obj - The object to check
	 * @returns True if obj is a ReactiveRoot
	 *
	 * @example
	 * ```ts
	 * const obj = reactive({name: 'John'});
	 * if (ERO.isReactiveRoot(obj)) {
	 *   // obj is ReactiveRoot
	 *   console.log('This is a reactive root');
	 * }
	 * ```
	 */
	static isReactiveRoot(obj: any): obj is ReactiveRoot {
		return obj != null && typeof obj === 'object' && typeof obj[ERO.FUNC_GET_ROOT] === 'function' && typeof obj[ERO.FUNC_TRIGGER_CHANGE] === 'function';
	}

	/**
	 * Type guard to check if an object is a reactive object (root or nested).
	 *
	 * @param obj - The object to check
	 * @returns True if obj is a ReactiveObject (root or nested)
	 *
	 * @example
	 * ```ts
	 * const obj = reactive({user: {name: 'John'}});
	 * if (ERO.isReactiveObject(obj.user)) {
	 *   // obj.user is ReactiveObject
	 *   console.log('This is a reactive object');
	 * }
	 * ```
	 */
	static isReactiveObject(obj: any): obj is ReactiveObject {
		return obj != null && typeof obj === 'object' && typeof obj[ERO.FUNC_GET_ROOT] === 'function';
	};

	/**
	 * Asserts that the given object is reactive, throws an error if not.
	 *
	 * @internal
	 */
	private static assertReactive(obj: any): ReactiveObject {
		if (obj == null) {
			throw new Error('Cannot expose a null or undefined value.');
		}
		if (typeof obj !== 'object') {
			throw new Error('Cannot expose a non-object value.');
		}
		if (ExposedReactiveObject.isReactiveObject(obj)) {
			return obj;
		} else {
			throw new Error(`Cannot expose a non-reactive object value.`);
		}
	}

	/**
	 * Manually emits a change event for a reactive object.
	 * This can be used to trigger change listeners without modifying the object.
	 *
	 * @param obj - The reactive object where the change occurred
	 * @param key - The property name or array index that changed
	 * @param oldValue - The previous value
	 * @param newValue - The new value
	 *
	 * @throws {Error} If obj is not a reactive object
	 *
	 * @example
	 * ```ts
	 * const obj = reactive({count: 0});
	 * ERO.on(obj, 'count', (event) => {
	 *   console.log('Count changed');
	 * });
	 * ERO.emit(obj, 'count', 0, 1); // Manually triggers a change without modifying obj
	 * ```
	 */
	static emit(obj: any, key: string, oldValue: any, newValue: any): void {
		const ro = ExposedReactiveObject.assertReactive(obj);
		ro[FUNC_GET_ROOT]()[FUNC_TRIGGER_CHANGE](obj, key, oldValue, newValue);
	}

	/**
	 * Registers a change listener for a specific path in a reactive object.
	 * The listener will be called when any property at or below the given path changes.
	 *
	 * @param obj - A reactive object (root or nested)
	 * @param path - The path to monitor. An empty string monitors all changes.
	 *               Use dot notation for nested properties: "user.address.city"
	 *               Array indices are denoted with brackets: "items.[0]"
	 * @param listen - The callback function to invoke when a change occurs
	 *
	 * @throws {Error} If obj is not a reactive object
	 *
	 * @remarks
	 * Path matching rules:
	 * - Empty string (""): Matches all changes in the entire reactive tree
	 * - Exact path: Matches only changes to that specific property
	 * - Parent path: Matches changes to that property or any nested properties
	 *
	 * @example
	 * ```ts
	 * const obj = reactive({user: {name: 'John', age: 30}});
	 *
	 * // Monitor a specific property
	 * ERO.on(obj, 'user.name', (event) => {
	 *   console.log(`Name changed: ${event.oldValue} -> ${event.newValue}`);
	 * });
	 *
	 * // Monitor all properties of user (including nested)
	 * ERO.on(obj, 'user', (event) => {
	 *   console.log(`User changed at ${event.pathToRoot}`);
	 * });
	 *
	 * // Monitor all changes in the entire tree
	 * ERO.on(obj, '', (event) => {
	 *   console.log(`Something changed at ${event.pathToRoot}`);
	 * });
	 *
	 * obj.user.name = 'Jane'; // Triggers all three listeners
	 * obj.user.age = 31;    // Triggers 'user' and '' listeners
	 * ```
	 *
	 * @example
	 * ```ts
	 * const obj = reactive({items: [1, 2, 3]});
	 *
	 * // Monitor a specific array index
	 * ERO.on(obj, 'items.[0]', (event) => {
	 *   console.log(`Item 0 changed: ${event.oldValue} -> ${event.newValue}`);
	 * });
	 *
	 * // Monitor all array elements
	 * ERO.on(obj, 'items', (event) => {
	 *   console.log(`Array changed at ${event.pathToRoot}`);
	 * });
	 *
	 * obj.items[0] = 10; // Triggers both listeners
	 * ```
	 */
	static on(obj: any, path: PathToRoot, listen: OnChangeEventHandle): void {
		const ro = ExposedReactiveObject.assertReactive(obj);

		let existing = ExposedReactiveObject.LISTENERS.get(path);
		if (existing != null) {
			if (existing.has(listen)) {
				// already monitoring
				return;
			}
		}
		const wrappedListener: OnChangeEventHandle = (event: ValueChangedEvent): void => {
			if (path === '') {
				// monitor everything
				listen(event);
			} else if (event.pathToRoot.startsWith(path)) {
				// event path equals or is a sub-path of the monitor path
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
	 * Unregisters a previously registered change listener.
	 * The listener will no longer be called for changes at the specified path.
	 *
	 * @param obj - The reactive object (root or nested)
	 * @param path - The path that was being monitored
	 * @param listen - The callback function to remove
	 *
	 * @remarks
	 * If the listener was not registered for the given path, this method does nothing.
	 *
	 * @example
	 * ```ts
	 * const obj = reactive({name: 'John'});
	 * const listener = (event: ValueChangedEvent) => {
	 *   console.log('Name changed');
	 * };
	 *
	 * ERO.on(obj, 'name', listener);
	 * obj.name = 'Jane'; // Triggers the listener
	 *
	 * ERO.off(obj, 'name', listener);
	 * obj.name = 'Bob'; // Does not trigger the listener
	 * ```
	 */
	static off(obj: any, path: PathToRoot, listen: OnChangeEventHandle): void {
		const ro = ExposedReactiveObject.assertReactive(obj);
		const existing = ExposedReactiveObject.LISTENERS.get(path);
		if (existing == null) {
			// never monitored the given path
			return;
		}
		const wrappedListener = existing.get(listen);
		if (wrappedListener != null) {
			// found, remove
			existing.delete(listen);
			ro[FUNC_GET_ROOT]()[FUNC_OFF_CHANGE](wrappedListener);
		}
	}

	/**
	 * Gets the underlying non-reactive object from a reactive object.
	 * This removes all proxy wrapping and event handling.
	 *
	 * @template T - The type of the underlying object
	 * @param obj - The reactive object to unwrap
	 * @returns The underlying non-reactive object
	 *
	 * @remarks
	 * If the object is not reactive, it is returned unchanged.
	 * Changes to the revoked object will not trigger any reactive listeners.
	 *
	 * @example
	 * ```ts
	 * const reactiveObj = reactive({name: 'John'});
	 * const plainObj = ERO.revoke<{name: string}>(reactiveObj);
	 *
	 * // plainObj is a plain object without reactivity
	 * // Changes to plainObj won't trigger listeners
	 * plainObj.name = 'Jane'; // No listeners triggered
	 * ```
	 */
	static revoke<T>(obj: any): T {
		if (ExposedReactiveObject.isReactiveObject(obj)) {
			return obj[FUNC_REVOKE]() as T;
		} else {
			return obj;
		}
	}
}

/**
 * Convenience alias for {@link ExposedReactiveObject}.
 * Use ERO for shorter, idiomatic access to reactive object utilities.
 *
 * @example
 * ```ts
 * import {reactive, ERO} from 'hx-data';
 *
 * const obj = reactive({name: 'John'});
 * ERO.on(obj, 'name', (event) => console.log('Changed'));
 * ```
 */
export const ERO = ExposedReactiveObject;
