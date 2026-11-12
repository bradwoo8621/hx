import type {
	HxTableFilterColumn,
	HxTableFilterColumnCriteria,
	HxTableFilterMethod,
	HxTableFilterMSelectValue,
	HxTableFilterRangeValue,
	HxTableFilterSelectValue,
	HxTableFilterValue,
	HxTableFilterWordsValue
} from './types';

export const computeCellRowCssProperty = (row: number, rows: number): [number, number, string] => {
	if (rows == null || rows === 1) {
		const r = row ?? 1;
		return [r, r, String(r)];
	} else {
		const startRow = row ?? 1;
		const endRow = startRow + rows - 1;
		return [startRow, endRow, `${startRow} / span ${rows}`];
	}
};

export const computeCellColumnCssProperty = (col: number, cols: number): [number, number, string] => {
	if (cols == null || cols === 1) {
		const column = col ?? 1;
		return [column, column, String(column)];
	} else {
		const startColumn = col ?? 1;
		const endColumn = startColumn + cols - 1;
		return [startColumn, endColumn, `${startColumn} / span ${cols}`];
	}
};

/**
 * - drop undefined/null value
 * - blank string trim to empty string (empty string presents no value)
 * - result could be one of following
 *   - undefined: no value
 *   - empty string: no value
 *   - string (trimmed): some text
 *   - array, each element is a string: or.
 *     ['', 'a', 'b'] -> no value or a or b
 *   - array, has array element: or + and.
 *     ['', 'a', 'b', ['c', 'd']] -> no value or a or b or (c and d).
 *     [['c', 'd']] -> c and d
 *     note empty in array element is meaningless
 */
export const readFilterWordsValue = (defaultValue: HxTableFilterValue): HxTableFilterWordsValue => {
	if (defaultValue == null) {
		// no default value
		return (void 0);
	} else if (Array.isArray(defaultValue)) {
		return defaultValue.map(v => {
			if (v == null) {
				return (void 0);
			} else if (Array.isArray(v)) {
				return v.map(v => {
					if (v == null) {
						return (void 0);
					} else if (typeof v === 'string') {
						return v.trim();
					} else {
						// not undefined/null/string, ignored
						return (void 0);
					}
				}).filter(v => v != null);
			} else if (typeof v === 'string') {
				return v.trim();
			} else {
				// not undefined/null/string/array, ignored
				return (void 0);
			}
		}).filter(v => v != null);
	} else if (typeof defaultValue === 'string') {
		return defaultValue;
	} else {
		// not undefined/null/string/array, ignored
		return (void 0);
	}
};

export const readFilterSelectValue = (defaultValue: HxTableFilterValue): HxTableFilterSelectValue => {
	if (defaultValue == null) {
		// no default value
		return (void 0);
	} else if (Array.isArray(defaultValue)) {
		// use default value or first element of default value when it is an array
		const value = defaultValue[0] ?? (void 0);
		if (Array.isArray(value)) {
			return value[0] ?? (void 0);
		} else {
			return value;
		}
	} else {
		return defaultValue;
	}
};

export const readFilterMSelectValue = (defaultValue: HxTableFilterValue): HxTableFilterMSelectValue => {
	if (defaultValue == null) {
		// no default value
		return (void 0);
	} else if (Array.isArray(defaultValue)) {
		// flat array if there is, and filter the null values
		return defaultValue.flat().filter((v): v is string => {
			return v != null;
		});
	} else {
		return [defaultValue];
	}
};

export const readFilterRangeValue = (defaultValue: HxTableFilterValue): HxTableFilterRangeValue => {
	if (defaultValue == null) {
		// no default value
		return [(void 0), (void 0)];
	} else if (Array.isArray(defaultValue)) {
		let v0 = defaultValue[0] ?? (void 0);
		if (Array.isArray(v0)) {
			// if element is an array, ignore it
			v0 = (void 0);
		} else {
			// for range values, empty or blank string mean nothing, ignore them
			v0 = v0?.trim() || (void 0);
		}
		let v1 = defaultValue[1] ?? (void 0);
		if (Array.isArray(v1)) {
			// if element is an array, ignore it
			v1 = (void 0);
		} else {
			// for range values, empty or blank string mean nothing, ignore them
			v1 = v1?.trim() || (void 0);
		}
		return [v0, v1];
	} else {
		// single value treated as the start value of range
		// for range values, empty or blank string mean nothing, ignore them
		return [defaultValue.trim() || (void 0), (void 0)];
	}
};

/**
 * - ['', 'a', 'b'] -> '  a b'
 * - ['', 'a', 'b', ['c', 'd']] -> '  a b c, d'
 * - [['c', 'd']] -> 'c, d'
 */
export const filterWordsToStr = (defaultValue: HxTableFilterValue): string | undefined => {
	if (defaultValue == null) {
		// no default value
		return (void 0);
	} else if (Array.isArray(defaultValue)) {
		// concatenate the array values by or(' ')/and(',')
		return [
			// de-duplication
			...new Set(defaultValue.map(v => {
				// first level is or (' ')
				return Array.isArray(v)
					? [ // de-duplication
						...new Set(v.map(v => v?.trim()).filter(v => v != null && v.length !== 0))
					].join(', ')
					// treat blank string as empty
					: v?.trim();
			}).filter(x => x != null))
		].join(' ');
	} else {
		// for single words value, empty or blank string mean nothing, ignore them
		// or maybe the default value is values combined, trim it
		return defaultValue.trim() || (void 0);
	}
};

export const guardColumnFilterMethod = (
	type: HxTableFilterColumn['type'], method: HxTableFilterMethod | null | undefined
): HxTableFilterMethod => {
	switch (type) {
		case 'range': {
			return (method === 'between' || method === 'not-between') ? method : 'between';
		}
		case 'select':
		case 'm-select':
		case 'words':
		default: {
			return (method === 'match' || method === 'not-match') ? method : 'match';
		}
	}
};

export const createColumnFilterCriteria = (column: HxTableFilterColumn, wordsToStr: boolean): HxTableFilterColumnCriteria => {
	switch (column.type) {
		case 'select': {
			if (column.options == null) {
				// downgrade to words
				return createColumnFilterCriteria({...column, type: 'words'}, wordsToStr);
			} else {
				return {
					key: column.key,
					method: guardColumnFilterMethod('select', column.defaultMethod),
					value: readFilterSelectValue(column.defaultValue)
				};
			}
		}
		case 'm-select': {
			if (column.options == null) {
				// downgrade to words
				return createColumnFilterCriteria({...column, type: 'words'}, wordsToStr);
			} else {
				return {
					key: column.key,
					method: guardColumnFilterMethod('m-select', column.defaultMethod),
					value: readFilterMSelectValue(column.defaultValue)
				};
			}
		}
		case 'range': {
			return {
				key: column.key,
				method: guardColumnFilterMethod('range', column.defaultMethod),
				value: readFilterRangeValue(column.defaultValue)
			};
		}
		case 'words':
		default: {
			return {
				key: column.key,
				method: guardColumnFilterMethod('words', column.defaultMethod),
				value: wordsToStr
					? filterWordsToStr(column.defaultValue)
					: readFilterWordsValue(column.defaultValue)
			};
		}
	}
};

export const filterStrToWords = (str: undefined | null | string): HxTableFilterWordsValue => {
	if (str == null || str.trim().length === 0) {
		return (void 0);
	}

	const parts = str.split(',').map(s => s.toLowerCase());
	if (parts.length === 1) {
		// no comma
		const parsed = [...new Set(parts[0].split(' '))];
		if (parsed.length === 0) {
			return (void 0);
		} else if (parsed.length === 1) {
			return parsed[0] || (void 0);
		} else {
			return parsed;
		}
	} else {
		// has comma, at least 2 parts
		const parsed: Array<string | Array<string>> = [];
		// first part, last word is first of and
		const wordsOfFirstPart = parts[0].trimEnd().split(' ');
		const lastIndexOfWordsOfFirstPart = wordsOfFirstPart.length - 1;
		parsed.push(...wordsOfFirstPart.slice(0, lastIndexOfWordsOfFirstPart));
		parsed.push([wordsOfFirstPart[lastIndexOfWordsOfFirstPart]]);

		for (let index = 1, lastIndex = parts.length - 2; index <= lastIndex; index++) {
			// not first/last part, first word is last of and, last word is first of and
			const words = parts[index].trim().split(' ');
			if (words.length === 1) {
				// only one word
				(parsed[parsed.length - 1] as Array<string>).push(words[0]);
			} else {
				(parsed[parsed.length - 1] as Array<string>).push(words[0]);
				parsed.push(...words.slice(1, words.length - 1));
				parsed.push([words[words.length - 1]]);
			}
		}

		// last part, first word is last of and
		const wordsOfLastPart = parts[parts.length - 1].trimStart().split(' ');
		(parsed[parsed.length - 1] as Array<string>).push(wordsOfLastPart[0]);
		parsed.push(...wordsOfLastPart.slice(1));

		return [...new Set(parsed.map(item => {
			if (Array.isArray(item)) {
				const array = [...new Set(item.filter(el => el != null && el.length !== 0))];
				return array.length === 0 ? '' : array;
			} else {
				return item.trim();
			}
		}))];
	}
};
