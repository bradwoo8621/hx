import type {ReactNode} from 'react';

/**
 * If the given parameter `text` is a string and starts with "~", it is considered an i18n key. Otherwise, it is not.
 *
 * - If it is an i18n key, return `true` and the string after removing the leading "~".
 * - If it is **not** an i18n key, but `text` is a string and starts with "\~",
 *   return `false` and the string after removing the leading "\".
 * - For all other cases, return `false` and the original `text` itself.
 */
export const isI18NKey = (text: ReactNode): [true, string] | [false, ReactNode] => {
	if (typeof text !== 'string') {
		return [false, text];
	}

	if (text.startsWith('~') && text.length !== 1) {
		return [true, text.substring(1)];
	} else if (text.startsWith('\\~')) {
		return [false, text.substring(1)];
	} else {
		return [false, text];
	}
};

/**
 * - remove the first "\", if starts with "\~", and insert a "~" as prefix
 * - or insert a "~" as prefix if not starts with "~"
 * - or do nothing, return itself.
 */
export const addI18NPrefix = (key: string): string => {
	if (key.startsWith('\\~')) {
		return `~${key.substring(1)}`;
	} else if (key.startsWith('~')) {
		return key;
	} else {
		return `~${key}`;
	}
};

/**
 * remove the first "~", if there is
 */
export const delI18NPrefix = (key: string): string => {
	if (key.startsWith('~')) {
		return key.substring(1);
	} else {
		return key;
	}
};