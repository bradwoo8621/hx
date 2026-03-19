import {useRef} from 'react';

/**
 * Type definition for a delayed function, can be sync or async, no parameters
 */
export type DelayedFunc = () => void | Promise<void>;

/**
 * Type for scheduling a new delayed function
 * @param key - Unique identifier for the function
 * @param func - Function to execute after timeout
 * @param timeout - Optional custom timeout (overrides default)
 */
export type AddDelayedFunc = (key: string, func: DelayedFunc, timeout?: number) => void;

/**
 * Type for clearing scheduled delayed functions
 * @param key - Optional key to clear, if omitted clears all functions
 */
export type ClearDelayedFunc = (key?: string) => void;

/**
 * Return type of useDelayedFunc hook
 */
export interface DelayedFuncHook {
	/** Schedule a function to execute after timeout */
	delay: AddDelayedFunc;
	/** Clear one or all scheduled functions */
	clear: ClearDelayedFunc;
}

/**
 * React hook for managing delayed execution of functions.
 * Functions are executed after a specified timeout unless cleared or replaced.
 * Supports multiple independent functions identified by unique keys.
 *
 * @param defaultTimeout - Default timeout in milliseconds for all functions (default: 100ms)
 * @returns Object containing delay, replace, and clear methods
 *
 * @example
 * ```ts
 * const { delay, replace, clear } = useDelayedFunc(2000);
 *
 * // Schedule function to execute after 2 seconds
 * delay('save', () => console.log('Saving data'));
 *
 * // Replace the function without resetting the timer
 * replace('save', () => console.log('Saving modified data'));
 *
 * // Clear the scheduled function
 * clear('save');
 * ```
 */
export const useDelayedFunc = (defaultTimeout: number = 100): DelayedFuncHook => {
	// Store timeout IDs mapped by key
	const timeoutsRef = useRef<Map<string, number>>(new Map());

	// Create stable function references once at initialization using IIFE
	// This ensures the functions are created only once and have access to the refs
	const funcsRef = useRef<DelayedFuncHook>((() => {
		const delay = (key: string, func: DelayedFunc, timeout?: number) => {
			// Clear existing timeout for this key if it exists
			const existingTimeout = timeoutsRef.current.get(key);
			if (existingTimeout) {
				try {
					clearTimeout(existingTimeout);
				} catch {
					// Ignore errors when clearing invalid timeouts
				}
			}

			// Set new timeout, capture func in closure
			const timeoutId = window.setTimeout(async () => {
				// Cleanup after execution completes
				timeoutsRef.current.delete(key);
				try {
					const result = func();
					// Handle async functions automatically
					if (result instanceof Promise) {
						await result;
					}
				} catch (error) {
					// eslint-disable-next-line no-console
					console.error(`Error executing delayed function for key "${key}":`, error);
				}
			}, timeout ?? defaultTimeout);

			timeoutsRef.current.set(key, timeoutId);
		};

		return {
			delay,
			clear: (key?: string) => {
				if (key != null) {
					// Clear single function by key
					const timeoutId = timeoutsRef.current.get(key);
					if (timeoutId) {
						clearTimeout(timeoutId);
					}
					timeoutsRef.current.delete(key);
				} else {
					// Clear all scheduled functions
					timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
					timeoutsRef.current.clear();
				}
			}
		};
	})());

	return funcsRef.current;
};
