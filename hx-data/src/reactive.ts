import {EventEmitter} from './events';
import {get, parsePath, set} from './path';

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
 * @param pathToRoot - The path to monitor. Supports three patterns:
 *                     - "*": Monitor all changes globally
 *                     - "path.*": Monitor "path" and all nested changes
 *                     - "path": Monitor exact path only
 * @param handle - The callback function to register
 */
export type FuncOnChange = (pathToRoot: PathToRoot, handle: OnChangeEventHandle) => void;

/**
 * Internal function type to unregister a change event listener.
 * @param pathToRoot - The path that was being monitored (same format as in FuncOnChange)
 * @param handle - The callback function to unregister
 */
export type FuncOffChange = (pathToRoot: PathToRoot, handle: OnChangeEventHandle) => void;

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
const reactiveObject = <T extends object>(parent: ReactiveObject, pathToParent: PathToParent, obj: T): ReactiveObject & T => {
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
		[FUNC_GET_PARENT]: (): ReactiveObject => parent,
		[FUNC_PATH_TO_ROOT]: (): PathToRoot => pathToRoot,
		[FUNC_PATH_TO_PARENT]: (): PathToParent => pathToParent,
		[FUNC_REVOKE]: <T extends object>(): T => obj as unknown as T
	};

	const handler: ProxyHandler<object> = {
		get(target: object, key: string | symbol, receiver: any): any {
			// @ts-expect-error funcMap contains Symbol keys that are not in the standard object type definition
			const func = funcMap[key] as any;
			if (func != null) {
				return func;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				return Reflect.get(target, key, receiver);
			} else {
				const result = Reflect.get(target, key, receiver);

				// Wrap array mutation methods to detect changes
				// Mutation methods modify array contents in-place without replacing the array reference
				if (Array.isArray(target) && ARRAY_MUTATION_METHODS.includes(key) && typeof result === 'function') {
					return function (this: any[], ...args: any[]) {
						const array = this as unknown as any[];
						// Mutation functions modify array contents in-place
						// Make a shallow copy before mutation to preserve old value for change event
						const oldValue = array.slice();
						const methodResult = Reflect.apply(result, this, args);
						// Shallow copy after mutation for symmetric new value
						const newValue = array.slice();
						// Emit change event for the array property
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
		/**
		 * Proxy set handler for nested reactive objects.
		 * - Blocks modification of internal Symbol functions
		 * - Handles Symbol properties directly without triggering events
		 * - Special handling for array `length` property changes, which triggers a change event for the array itself
		 * - For regular properties, triggers change event only when old and new values are different
		 *
		 * @param target - The underlying target object
		 * @param key - The property key to set
		 * @param newValue - The new value to assign
		 * @param receiver - The proxy or object that received the set operation
		 * @returns True if the set operation succeeded
		 */
		set(target: object, key: string | symbol, newValue: any, receiver: any): boolean {
			// @ts-expect-error FUNC_SYMBOLS contains Symbol values, checking includes against string | symbol key is intentional
			if (FUNC_SYMBOLS.includes(key)) {
				return false;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				return Reflect.set(target, key, newValue, receiver);
			} else if (Array.isArray(target) && key === 'length') {
				const array = target as unknown as any[];
				const oldLength = array.length;
				// Make a shallow copy before modification to preserve old state for change event
				const oldValue = array.slice();
				const result = Reflect.set(target, key, newValue, receiver);
				if (oldLength != array.length) {
					funcMap[FUNC_GET_ROOT]()[FUNC_TRIGGER_CHANGE](parent, pathToParent, oldValue, array);
				}
				return result;
			} else {
				// @ts-expect-error target is a generic object, dynamic key access cannot be statically type checked
				const oldValue = target[key];
				const result = Reflect.set(target, key, newValue, receiver);
				if (oldValue !== newValue) {
					funcMap[FUNC_GET_ROOT]()[FUNC_TRIGGER_CHANGE](proxiedObject, key, oldValue, newValue);
				}
				return result;
			}
		},
		/**
		 * Proxy deleteProperty handler for nested reactive objects.
		 * - Blocks deletion of internal Symbol functions
		 * - Handles Symbol properties directly without triggering events
		 * - For regular properties, triggers change event only if the property existed and deletion succeeded
		 *
		 * @param target - The underlying target object
		 * @param key - The property key to delete
		 * @returns True if the deletion succeeded
		 */
		deleteProperty(target: object, key: string | symbol): boolean {
			// @ts-expect-error FUNC_SYMBOLS contains Symbol values, checking includes against string | symbol key is intentional
			if (FUNC_SYMBOLS.includes(key)) {
				return false;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				return Reflect.deleteProperty(target, key);
			} else {
				const hadKey = Object.prototype.hasOwnProperty.call(target, key);
				// @ts-expect-error target is a generic object, dynamic key access cannot be statically type checked
				const oldValue = target[key];
				const result = Reflect.deleteProperty(target, key);
				if (hadKey && result) {
					funcMap[FUNC_GET_ROOT]()[FUNC_TRIGGER_CHANGE](proxiedObject, key, oldValue, (void 0));
				}
				return result;
			}
		}
	};

	const proxiedObject = new Proxy(obj, handler) as ReactiveObject & T;
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
const asReactiveRoot = <T extends object>(root: T, _options?: ReactiveOptions): ReactiveRoot & T => {
	if (Array.isArray(root)) {
		throw new Error(`Root cannot be an array.`);
	}

	if (ExposedReactiveObject.isReactiveObject(root)) {
		root = ExposedReactiveObject.revoke(root);
	}

	const events = new EventEmitter();
	let listenerAdded = false;
	const listeners: Map<PathToRoot, Map<PathToParent, Array<OnChangeEventHandle>>> = new Map();
	/**
	 * Event listener that dispatches change events to registered observers based on path matching.
	 * Supports three matching patterns:
	 * - `*`: Matches all events globally
	 * - `path.*`: Matches all events under the specified path prefix
	 * - `path`: Matches exact path only
	 *
	 * @param event - The value changed event to dispatch
	 */
	const listener = (event: ValueChangedEvent) => {
		const observers: Array<OnChangeEventHandle> = [];
		// Collect global listeners registered with "*" pattern
		const observersOfAll = listeners.get('*')?.get('');
		if (observersOfAll != null && observersOfAll.length !== 0) {
			observers.push(...observersOfAll);
		}
		const pathToRoot = event.pathToRoot;
		const parts = pathToRoot.split('.');
		// Collect wildcard listeners registered with "path.*" pattern for all ancestor paths
		for (let index = 0, count = parts.length - 1; index < count; index++) {
			const path = parts.slice(0, index + 1).join('.');
			const observersOfPath = listeners.get(path)?.get('*');
			if (observersOfPath != null && observersOfPath.length !== 0) {
				observers.push(...observersOfPath);
			}
		}
		// Collect exact path listeners
		const observersOfPath = listeners.get(pathToRoot)?.get('');
		if (observersOfPath != null && observersOfPath.length !== 0) {
			observers.push(...observersOfPath);
		}

		// Invoke all matched observers, catch and log errors to prevent one listener failure from breaking others
		for (const observe of observers) {
			try {
				observe(event);
			} catch (e) {
				console.error(e);
			}
		}
	};
	/**
	 * Internal helper to add a listener to the nested listeners map structure.
	 * The map structure is: listeners[pathPattern][relativePath] = Array<listener>
	 *
	 * @param path1 - The primary path pattern (e.g., '*', 'user', 'user.*')
	 * @param path2 - The relative path component ('' for exact matches, '*' for wildcard matches)
	 * @param handle - The listener callback to add
	 */
	const putIntoListeners = (path1: PathToRoot, path2: PathToParent, handle: OnChangeEventHandle) => {
		let map = listeners.get(path1);
		if (map == null) {
			map = new Map();
			map.set(path2, [handle]);
			listeners.set(path1, map);
		} else {
			let observers = map.get(path2);
			if (observers == null) {
				observers = [handle];
				map.set(path2, observers);
			} else if (!observers.includes(handle)) {
				// Avoid duplicate listeners for the same path and handle
				observers.push(handle);
			}
		}
	};
	/**
	 * Adds a change listener for the specified path pattern.
	 * Automatically registers the main event listener on first use.
	 *
	 * @param pathToRoot - The path pattern to monitor
	 * @param handle - The listener callback to register
	 */
	const addListener = (pathToRoot: PathToRoot, handle: OnChangeEventHandle) => {
		switch (true) {
			case (pathToRoot === '*'): {
				// Global pattern matches all events
				putIntoListeners('*', '', handle);
				break;
			}
			case (pathToRoot.endsWith('.*')): {
				// Wildcard pattern matches all events under the path prefix
				const path = pathToRoot.substring(0, pathToRoot.length - 2);
				putIntoListeners(path, '*', handle);
				break;
			}
			default: {
				// Exact pattern matches only the exact path
				putIntoListeners(pathToRoot, '', handle);
				break;
			}
		}

		// Register main event listener only once when the first listener is added
		if (!listenerAdded) {
			listenerAdded = true;
			events.on(ON_CHANGE_EVENT, listener);
		}
	};
	/**
	 * Internal helper to remove a listener from the nested listeners map structure.
	 * Automatically cleans up empty map entries to save memory.
	 *
	 * @param path1 - The primary path pattern
	 * @param path2 - The relative path component
	 * @param handle - The listener callback to remove
	 */
	const removeFromListeners = (path1: PathToRoot, path2: PathToParent, handle: OnChangeEventHandle) => {
		let map = listeners.get(path1);
		if (map == null) {
			if (listeners.has(path1)) {
				// Clean up empty entry
				listeners.delete(path1);
			}
		} else if (map.size === 0) {
			// Remove empty map
			listeners.delete(path1);
		} else {
			let observers = map.get(path2);
			if (observers == null) {
				if (map.has(path2)) {
					// Clean up empty entry
					listeners.delete(path1);
				}
			} else if (observers.includes(handle)) {
				if (observers.length === 1) {
					// Last observer for this path, clean up
					if (map.size === 1) {
						// Last key in the map, remove the entire path entry
						listeners.delete(path1);
					} else {
						// Remove only this path component entry
						map.delete(path2);
					}
				} else {
					// Remove only the specified listener
					const index = observers.indexOf(handle);
					if (index !== -1) {
						observers.splice(index, 1);
					}
				}
			}
		}
	};
	/**
	 * Removes a previously registered change listener for the specified path pattern.
	 * Automatically unregisters the main event listener when no listeners remain.
	 *
	 * @param pathToRoot - The path pattern that was being monitored
	 * @param handle - The listener callback to remove
	 */
	const removeListener = (pathToRoot: PathToRoot, handle: OnChangeEventHandle) => {
		if (listenerAdded) {
			switch (true) {
				case (pathToRoot === '*'): {
					removeFromListeners('*', '', handle);
					break;
				}
				case (pathToRoot.endsWith('.*')): {
					const path = pathToRoot.substring(0, pathToRoot.length - 2);
					removeFromListeners(path, '*', handle);
					break;
				}
				default: {
					removeFromListeners(pathToRoot, '', handle);
					break;
				}
			}
			// Unregister main event listener when all listeners are removed to save resources
			if (listeners.size === 0) {
				events.off(ON_CHANGE_EVENT, listener);
				listenerAdded = false;
			}
		}
	};
	const funcMap: ReactiveRoot = {
		[FUNC_GET_ROOT]: (): ReactiveRoot => proxiedRoot,
		[FUNC_GET_PARENT]: () => (void 0),
		[FUNC_PATH_TO_ROOT]: (): PathToRoot => '',
		[FUNC_PATH_TO_PARENT]: (): PathToParent => '',
		[FUNC_REVOKE]: <T extends object>(): T => root as unknown as T,
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
		[FUNC_ON_CHANGE]: (pathToRoot: PathToRoot, handle: OnChangeEventHandle): void => {
			addListener(pathToRoot, handle);
		},
		[FUNC_OFF_CHANGE]: (pathToRoot: PathToRoot, handle: OnChangeEventHandle): void => {
			removeListener(pathToRoot, handle);
		}
	};

	const handler: ProxyHandler<object> = {
		get(target: object, key: string | symbol, receiver: any): any {
			// @ts-expect-error funcMap contains Symbol keys that are not in the standard object type definition
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
			// @ts-expect-error FUNC_SYMBOLS contains Symbol values, checking includes against string | symbol key is intentional
			if (FUNC_SYMBOLS.includes(key)) {
				return false;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				return Reflect.set(target, key, newValue, receiver);
			} else {
				// @ts-expect-error target is a generic object, dynamic key access cannot be statically type checked
				const oldValue = target[key];
				const result = Reflect.set(target, key, newValue, receiver);
				if (oldValue !== newValue) {
					funcMap[FUNC_TRIGGER_CHANGE](proxiedRoot, key, oldValue, newValue);
				}
				return result;
			}
		},
		deleteProperty(target: object, key: string | symbol): boolean {
			// @ts-expect-error FUNC_SYMBOLS contains Symbol values, checking includes against string | symbol key is intentional
			if (FUNC_SYMBOLS.includes(key)) {
				return false;
			}

			// noinspection SuspiciousTypeOfGuard
			if (typeof key === 'symbol') {
				return Reflect.deleteProperty(target, key);
			} else {
				const hadKey = Object.prototype.hasOwnProperty.call(target, key);
				// @ts-expect-error target is a generic object, dynamic key access cannot be statically type checked
				const oldValue = target[key];
				const result = Reflect.deleteProperty(target, key);
				if (hadKey && result) {
					funcMap[FUNC_TRIGGER_CHANGE](proxiedRoot, key, oldValue, (void 0));
				}
				return result;
			}
		}
	};

	const proxiedRoot = new Proxy(root, handler) as ReactiveRoot & T;
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
export const reactive = <T extends object>(target: T, options?: ReactiveOptions): ReactiveRoot & T => {
	return asReactiveRoot(target, options);
};

/**
 * Silent modes for setting values without triggering change events.
 * - `loud`: Normal mode, emit all change events (default)
 * - `mute-all`: Mute all change events, no events will be emitted
 * - `mute-leaf`: Mute only leaf node changes, intermediate changes will still emit events
 */
export type ValueSetSilenceMode = 'loud' | 'mute-all' | 'mute-leaf';

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
	 *
	 * @param obj - A reactive object (root or nested)
	 * @param path - The path pattern to monitor. Supports special patterns:
	 *               - "*": Monitor all changes globally
	 *               - "path.*": Monitor "path" and all its nested changes
	 *               - "path": Monitor exact path only
	 *               Use dot notation for nested properties: "user.address.city"
	 *               Array indices are denoted with brackets: "items.[0]"
	 * @param listen - The callback function to invoke when a change occurs
	 *
	 * @throws {Error} If obj is not a reactive object
	 *
	 * @remarks
	 * Path matching behavior:
	 * - "*": Triggers for any change in the entire reactive tree
	 * - "path.*": Triggers for changes to "path" or any nested property under it
	 * - "path": Triggers only for exact changes to that path
	 *
	 * Example:
	 * - Monitoring "user" triggers for "user" changes. Does NOT trigger for "user.name", "user.address" changes.
	 * - Monitoring "user.*" triggers for "user.name", "user.address", etc. Does NOT trigger for "user" changes.
	 * - Monitoring "user.name" triggers for "user.name". Does NOT trigger for "user" changes.
	 *
	 * @example
	 * ```ts
	 * const obj = reactive({user: {name: 'John', age: 30}});
	 *
	 * // Monitor all changes globally
	 * ERO.on(obj, '*', (event) => {
	 *   console.log(`Global change at ${event.pathToRoot}`);
	 * });
	 *
	 * // Monitor a specific path and its descendants
	 * ERO.on(obj, 'user.*', (event) => {
	 *   console.log(`User-related change at ${event.pathToRoot}`);
	 * });
	 *
	 * // Monitor exact path only
	 * ERO.on(obj, 'user.name', (event) => {
	 *   console.log(`Name changed: ${event.oldValue} -> ${event.newValue}`);
	 * });
	 *
	 * obj.user.name = 'Jane'; // Triggers all three listeners
	 * obj.user.age = 31;    // Triggers '*' and 'user.*' listeners only
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
	 * // Monitor array and all element changes
	 * ERO.on(obj, 'items.*', (event) => {
	 *   console.log(`Array change at ${event.pathToRoot}`);
	 * });
	 *
	 * obj.items[0] = 10; // Triggers both listeners
	 * obj.items.push(4);    // Triggers only 'items.*' listener
	 * ```
	 */
	static on(obj: any, path: PathToRoot, listen: OnChangeEventHandle): void {
		const ro = ExposedReactiveObject.assertReactive(obj);
		ro[FUNC_GET_ROOT]()[FUNC_ON_CHANGE](path, listen);
	}

	/**
	 * Unregisters a previously registered change listener.
	 * The listener will no longer be called for changes at the specified path.
	 *
	 * @param obj - The reactive object (root or nested)
	 * @param path - The path pattern that was being monitored
	 * @param listen - The callback function to remove
	 *
	 * @remarks
	 * The path parameter must match exactly the path used when registering the listener.
	 * If the same listener was registered for different paths, each must be removed separately.
	 * If listener was not registered for the given path, this method does nothing.
	 *
	 * @example
	 * ```ts
	 * const obj = reactive({name: 'John'});
	 * const listener = (event: ValueChangedEvent) => {
	 *   console.log('Name changed');
	 * };
	 *
	 * ERO.on(obj, 'name', listener);
	 * obj.name = 'Jane'; // Triggers listener
	 *
	 * ERO.off(obj, 'name', listener);
	 * obj.name = 'Bob'; // Does not trigger listener
	 * ```
	 */
	static off(obj: any, path: PathToRoot, listen: OnChangeEventHandle): void {
		const ro = ExposedReactiveObject.assertReactive(obj);
		ro[FUNC_GET_ROOT]()[FUNC_OFF_CHANGE](path, listen);
	}

	/**
	 * Creates a reactive root object.
	 * Alias for the top-level {@link reactive} function.
	 *
	 * @template T - The type of object to make reactive
	 * @param target - The object to make reactive. Cannot be an array.
	 * @param options - Optional configuration options
	 * @returns A reactive root object
	 *
	 * @throws {Error} If target is an array
	 */
	static reactive<T extends object>(target: T, options?: ReactiveOptions): ReactiveRoot & T {
		return reactive(target, options);
	}

	/**
	 * Gets the root reactive object from any reactive object (nested or root).
	 *
	 * @param obj - A reactive object (root or nested)
	 * @returns The root reactive object in the hierarchy
	 *
	 * @throws {Error} If obj is not a reactive object
	 *
	 * @example
	 * ```ts
	 * const root = reactive({user: {name: 'John'}});
	 * const user = root.user;
	 * ERO.rootOf(user) === root; // true
	 * ```
	 */
	static rootOf(obj: any): ReactiveRoot {
		const ro = ExposedReactiveObject.assertReactive(obj);
		return ro[FUNC_GET_ROOT]();
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

	/**
	 * Resolves an absolute path from the root for a given relative path on a reactive object.
	 *
	 * @param obj - A reactive object (root or nested)
	 * @param relativePath - A relative path from the given object
	 * @returns The absolute path from the root of the reactive tree
	 *
	 * @throws {Error} If obj is not a reactive object
	 *
	 * @example
	 * ```ts
	 * const root = reactive({user: {address: {city: 'New York'}}});
	 * const address = root.user.address;
	 * ERO.pathOf(address, 'city'); // 'user.address.city'
	 * ERO.pathOf(root, 'user.name'); // 'user.name'
	 * ```
	 */
	static pathOf(obj: any, relativePath: string): PathToRoot {
		const ro = ExposedReactiveObject.assertReactive(obj);
		const pathToRoot = ro[FUNC_PATH_TO_ROOT]();
		if (pathToRoot.length === 0) {
			// given obj is root
			return relativePath;
		} else {
			return `${pathToRoot}.${relativePath}`;
		}
	}

	/**
	 * get value from given obj and path.
	 * if path starts with "/", given obj must be a reactive object.
	 *
	 * @param obj - should be a reactive object
	 * @param path - must follow the reactive path standard
	 *
	 * @throws {Error} If obj is not a reactive object and path starts with "/"
	 */
	static getValue<T, P extends string>(obj: T, path: P): any {
		if (path.startsWith('/')) {
			const ro = ExposedReactiveObject.assertReactive(obj);
			return get(ro, path.substring(1));
		} else {
			return get(obj, path);
		}
	}

	/**
	 * set value into given obj, path and value.
	 * if path starts with "/", given obj must be a reactive object.
	 *
	 * @param obj - should be a reactive object
	 * @param path - must follow the reactive path standard
	 * @param value - value to set
	 *
	 * @throws {Error} If obj is not a reactive object and path starts with "/"
	 */
	static setValue<T, P extends string>(obj: T, path: P, value: any): void {
		if (path.startsWith('/')) {
			// @ts-expect-error set function accepts generic object types, rootOf returns valid reactive object
			set(ExposedReactiveObject.rootOf(obj), path.substring(1), value);
		} else {
			set(obj, path, value);
		}
	}

	/**
	 * Sets a value with optional silence modes to control event emission.
	 *
	 * @param obj - The object to set the value on (can be reactive or plain object)
	 * @param path - The path to set the value at. Use "/" prefix for absolute paths from root.
	 * @param value - The value to set
	 * @param silenceMode - The silence mode to use:
	 *                      - `loud`: Emit all change events (default)
	 *                      - `mute-all`: No change events will be emitted at all
	 *                      - `mute-leaf`: Only the final leaf node change is muted, intermediate changes still emit
	 *
	 * @throws {Error} If path starts with "/" and obj is not a reactive object
	 *
	 * @remarks
	 * Absolute paths (starting with "/") are resolved from the root of the reactive tree.
	 * When using `mute-all` or `mute-leaf` modes, changes are made directly to the underlying
	 * non-reactive object, bypassing the proxy's change detection.
	 *
	 * @example
	 * ```ts
	 * const obj = reactive({user: {name: 'John'}});
	 *
	 * // Set without emitting any events
	 * ERO.setValueSilent(obj, 'user.name', 'Jane', 'mute-all');
	 *
	 * // Set only the leaf node without emitting
	 * ERO.setValueSilent(obj, 'user.address.city', 'London', 'mute-leaf');
	 * ```
	 */
	static setValueSilent<T, P extends string>(obj: T, path: P, value: any, silenceMode: ValueSetSilenceMode = 'loud'): void {
		if (path.startsWith('/')) {
			// remove the first "/"
			const p = path.substring(1);
			const root = ExposedReactiveObject.rootOf(obj);
			ExposedReactiveObject.setValueSilent(root, p, value, silenceMode);
		} else if (!ExposedReactiveObject.isReactiveObject(obj)) {
			// not a reactive object, call set directly
			set(obj, path, value);
		} else {
			// is a reactive object
			switch (silenceMode) {
				case 'mute-all': {
					set(ExposedReactiveObject.revoke(obj), path, value);
					break;
				}
				case 'mute-leaf': {
					const parts = parsePath(path);
					if (parts.length === 1) {
						// no deep set
						set(ExposedReactiveObject.revoke(obj), path, value);
					} else {
						let parent = obj;
						for (let index = 0, lastIndexOfAncestors = parts.length - 2; index <= lastIndexOfAncestors; index++) {
							const pathOfThisPart = parts[index];
							let ancestorValue = get(parent, pathOfThisPart);
							if (ancestorValue == null) {
								const pathOfNextPart = parts[index + 1];
								// check the next path, if it is array index, set as array
								if (/^\[\d+]$/.test(pathOfNextPart)) {
									// @ts-expect-error set function accepts generic object types, parent is validated to be object
									set(parent, pathOfThisPart, []);
								} else {
									// @ts-expect-error set function accepts generic object types, parent is validated to be an object
									set(parent, pathOfThisPart, {});
								}
								ancestorValue = get(parent, pathOfThisPart);
							}
							// Move to the next parent level regardless of whether we created it or not
							// @ts-expect-error ancestorValue is dynamically retrieved from parent object, type is validated at runtime
							parent = ancestorValue;
						}
						// @ts-expect-error set function accepts generic object types, revoke returns plain object
						set(ExposedReactiveObject.revoke(parent), parts[parts.length - 1], value);
					}
					break;
				}
				case 'loud':
				default: {
					// loud mode, call set directly
					set(obj, path, value);
					break;
				}
			}
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
