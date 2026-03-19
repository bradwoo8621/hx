/* path delimiter, "." */
export type ModelPathDelimiter = '.';

/**
 * all paths of given "T"
 * - when T is array, path is "[number]",
 * - when T is object (not array), path is property name.
 *
 * when type is
 * ```
 * interface T {
 *   a: {
 *     b: {c: number}[][]
 *   }
 * }
 * ```
 *
 * a valid path of could be
 * - "a"
 * - "a.b"
 * - "a.b.[0]",
 * - "a.b.[0].[1]"
 * - "a.b.[0].[1].c"
 */
export type ModelPath<T> = T extends readonly (infer E)[]
	? (
		| `[${number}]`
		| (E extends object
		? `[${number}]${ModelPathDelimiter}${ModelPath<E>}`
		: never)
		)
	: (T extends object
		? {
			[K in keyof T & string]: (
				| `${K}`
				| (T[K] extends object
				? `${K}${ModelPathDelimiter}${ModelPath<T[K]>}`
				: never)
				)
		}[keyof T & string]
		: never)

// Helper type to get the value type at a path
/**
 * get value type from "T" by given path "P",
 * "P" should be a valid path of "T",
 * and return type is "never" if "P" is an invalid path of "T"
 */
export type PathValue<T, P extends string> =
// check if it starts with array index
	P extends `[${number}]${ModelPathDelimiter}${infer Rest}`
		? (T extends readonly (infer E)[]
			? PathValue<E, Rest>
			: never)
		: (P extends `${infer K}${ModelPathDelimiter}${infer Rest}`
			? (K extends keyof T
				? PathValue<T[K], Rest>
				: never)
			: (P extends `[${number}]`
				? (T extends readonly (infer E)[] ? E : never)
				: (P extends keyof T ? T[P] : never)
				)
			);
/**
 * get value type from "T" by given path "P",
 * "P" must be a valid path of "T"
 */
export type StrictPathValue<T, P extends ModelPath<T>> = PathValue<T, P>;

/**
 * Parse a dot-delimited path string into an array of path segments
 * Supports both object property access (e.g. "user.name") and array index access (e.g. "[0]")
 * @param path - Path string to parse (e.g. "user.addresses.[0].city")
 * @returns Array of path segments (e.g. ["user", "addresses", "[0]", "city"])
 */
export const parsePath = (path: string): string[] => {
	return path.split('.');
	// const result: string[] = [];
	// let current = '';
	// let inBrackets = false;
	//
	// for (let i = 0, length = path.length; i < length; i++) {
	// 	const char = path[i];
	//
	// 	if (char === '[' && i > 0 && path[i - 1] === '.') {
	// 		// save previous part
	// 		if (current && current !== '.') {
	// 			result.push(current.slice(0, -1)); // remove end "."
	// 		}
	// 		current = '[';
	// 		inBrackets = true;
	// 	} else if (char === ']') {
	// 		if (inBrackets) {
	// 			result.push(current + char);
	// 			current = '';
	// 			inBrackets = false;
	// 		}
	// 	} else if (char === '.' && !inBrackets) {
	// 		if (current) {
	// 			result.push(current);
	// 			current = '';
	// 		}
	// 	} else {
	// 		current += char;
	// 	}
	// }
	//
	// // handle last part
	// if (current) {
	// 	result.push(current);
	// }
	//
	// return result;
};

/**
 * Get a deeply nested value from an object using a path string
 * @param obj - The object to get the value from
 * @param path - Dot-delimited path string (e.g. "user.addresses.[0].city")
 * @returns The value at the specified path, or (void 0) if the path does not exist
 * @typeParam T - Type of the source object
 * @typeParam P - Type of the path string
 */
export const get =
	<T, P extends string>(obj: T, path: P): PathValue<T, P> | undefined => {
		const parts = parsePath(path);

		let current: any = obj;

		for (const part of parts) {
			// Check if current path segment is an array index (e.g. "[0]")
			if (/^\[\d+]$/.test(part)) {
				const index = parseInt(part.substring(1, part.length - 1), 10);
				if (!Array.isArray(current) || index < 0 || index >= current.length) {
					return (void 0);
				}
				current = current[index];
			} else {
				if (current === null || current === (void 0) || typeof current !== 'object') {
					return (void 0);
				}
				current = current[part];
			}

			if (current === (void 0)) {
				return (void 0);
			}
		}

		return current as PathValue<T, P>;
	};

/**
 * Set a deeply nested value in an object using a path string
 * Automatically creates intermediate objects/arrays if they don't exist
 * @param obj - The object to modify
 * @param path - Dot-delimited path string (e.g. "user.addresses.[0].city")
 * @param value - The value to set at the specified path
 * @returns The modified object (mutates the original object)
 * @throws Error if trying to access array index on non-array value
 * @typeParam T - Type of the source object
 * @typeParam P - Type of the path string
 */
export const set =
	<T, P extends string>(obj: T, path: P, value: PathValue<T, P>): T => {
		const parts = parsePath(path);

		let current: any = obj;

		// Traverse path segments up to the second last segment
		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i];
			const nextPart = parts[i + 1];

			// Check if current path segment is an array index (e.g. "[0]")
			if (/^\[\d+]$/.test(part)) {
				const index = parseInt(part.substring(1, part.length - 1), 10);
				if (!Array.isArray(current)) {
					throw new Error(`Cannot access index ${part} on non-array`);
				}

				// Extend array with undefined values if index is out of bounds
				if (index >= current.length) {
					for (let j = current.length; j <= index; j++) {
						current[j] = (void 0);
					}
				}

				// Create intermediate array/object based on next path segment
				if (/^\[\d+]$/.test(nextPart) && current[index] === (void 0)) {
					// Next segment is array index, create array
					current[index] = [];
				} else if (current[index] === (void 0)) {
					// Next segment is object property, create object
					current[index] = {};
				}

				current = current[index];
			} else {
				// Current segment is object property
				if (/^\[\d+]$/.test(nextPart)) {
					// Next segment is array index, ensure value is array
					if (current[part] === (void 0)) {
						current[part] = [];
					} else if (!Array.isArray(current[part])) {
						throw new Error(`Cannot use array access on non-array property ${part}`);
					}
				} else {
					// Next segment is object property, ensure value is object
					if (current[part] === (void 0)) {
						current[part] = {};
					}
				}

				current = current[part];
			}
		}

		// Set value on the last path segment
		const lastPart = parts[parts.length - 1];
		if (/^\[\d+]$/.test(lastPart)) {
			// Last segment is array index
			const index = parseInt(lastPart.substring(1, lastPart.length - 1), 10);
			if (!Array.isArray(current)) {
				throw new Error(`Cannot set index ${lastPart} on non-array`);
			}

			// Extend array if needed
			if (index >= current.length) {
				for (let j = current.length; j <= index; j++) {
					current[j] = (void 0);
				}
			}

			current[index] = value;
		} else {
			// Last segment is object property
			current[lastPart] = value;
		}

		return obj;
	};
