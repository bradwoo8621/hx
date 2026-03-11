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

// parse given path to path parts
const parsePath = (path: string): string[] => {
	const result: string[] = [];
	let current = '';
	let inBrackets = false;

	for (let i = 0, length = path.length; i < length; i++) {
		const char = path[i];

		if (char === '[' && i > 0 && path[i - 1] === '.') {
			// save previous part
			if (current && current !== '.') {
				result.push(current.slice(0, -1)); // remove end "."
			}
			current = '[';
			inBrackets = true;
		} else if (char === ']') {
			if (inBrackets) {
				result.push(current.slice(1)); // remove start "["
				current = '';
				inBrackets = false;
			}
		} else if (char === '.' && !inBrackets) {
			if (current) {
				result.push(current);
				current = '';
			}
		} else {
			current += char;
		}
	}

	// handle last part
	if (current) {
		result.push(current);
	}

	return result;
};

// Get function
export const get = <T, P extends string>(obj: T, path: P): PathValue<T, P> | undefined => {
	const parts = parsePath(path);

	let current: any = obj;

	for (const part of parts) {
		// check if this part is array index
		if (/^\d+$/.test(part)) {
			const index = parseInt(part, 10);
			if (!Array.isArray(current) || index < 0 || index >= current.length) {
				return undefined as any;
			}
			current = current[index];
		} else {
			if (current === null || current === undefined || typeof current !== 'object') {
				return undefined as any;
			}
			current = current[part];
		}

		if (current === undefined) {
			return undefined as any;
		}
	}

	return current as PathValue<T, P>;
};

// Set function
export const set = <T, P extends string>(obj: T, path: P, value: PathValue<T, P>): T => {
	const parts = parsePath(path);

	let current: any = obj;

	// iterate to last 2
	for (let i = 0; i < parts.length - 1; i++) {
		const part = parts[i];
		const nextPart = parts[i + 1];

		// check if this part is array index
		if (/^\d+$/.test(part)) {
			const index = parseInt(part, 10);
			if (!Array.isArray(current)) {
				throw new Error(`Cannot access index ${part} on non-array`);
			}

			// if value not exists, create array and fill with undefined
			if (index >= current.length) {
				for (let j = current.length; j <= index; j++) {
					current[j] = undefined;
				}
			}

			// if next part is number, make sure value is empty array
			if (/^\d+$/.test(nextPart) && current[index] === undefined) {
				current[index] = [];
			}
			// if next part is not number, make sure value is object
			else if (current[index] === undefined) {
				current[index] = {};
			}

			current = current[index];
		} else {
			// check if next part is number
			if (/^\d+$/.test(nextPart)) {
				// make sure value is empty array
				if (current[part] === undefined) {
					current[part] = [];
				} else if (!Array.isArray(current[part])) {
					throw new Error(`Cannot use array access on non-array property ${part}`);
				}
			} else {
				// // if next part is not number, make sure value is object
				if (current[part] === undefined) {
					current[part] = {};
				}
			}

			current = current[part];
		}
	}

	// set last part
	const lastPart = parts[parts.length - 1];
	if (/^\d+$/.test(lastPart)) {
		const index = parseInt(lastPart, 10);
		if (!Array.isArray(current)) {
			throw new Error(`Cannot set index ${lastPart} on non-array`);
		}

		// if index is greater than or equals length, extends array with undefined
		if (index >= current.length) {
			for (let j = current.length; j <= index; j++) {
				current[j] = undefined;
			}
		}

		current[index] = value;
	} else {
		current[lastPart] = value;
	}

	return obj;
};
