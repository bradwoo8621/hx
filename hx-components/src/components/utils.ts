import type {DispatchWithoutAction, HTMLAttributes, ReactNode} from 'react';
import type {HxContext} from '../contexts';
import type {HxObject} from '../types';
import type {HtmlElementProps, HxHtmlElementProps} from './types';

/**
 * wrap defined onXxx handlers to react event handlers
 *
 * @param props
 * @param model null is allowed
 * @param context
 * @param forceUpdate
 */
export const wrapToReactEvents =
	<
		E extends HTMLElement,
		EA extends HTMLAttributes<E>,
		O extends keyof HtmlElementProps<E, EA> | `data-hx-${string}`,
		T extends object
	>(
		props: HxHtmlElementProps<E, EA, O, T>,
		model: HxObject<T> | undefined,
		context: HxContext,
		forceUpdate: DispatchWithoutAction
	): Omit<HtmlElementProps<E, EA>, O> => {
		Object.keys(props).forEach((key) => {
			// @ts-ignore
			const value = props[key];
			if (value != null && typeof value === 'function'
				&& key.startsWith('on') && key.length > 2
				&& 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(key[2])) {
				// @ts-ignore
				props[key] = (ev) => {
					value(ev, model, context, forceUpdate);
				};
			}
		});
		return props;
	};

// copy from react-dom-development
const ATTRIBUTE_NAME_START_CHAR = ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
const ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
const VALID_ATTRIBUTE_NAME_REGEX = new RegExp('^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$');
const HasOwnProperty = Object.prototype.hasOwnProperty;
const illegalAttributeNameCache: Record<string, true> = {};
const validatedAttributeNameCache: Record<string, true> = {};
const isAttributeNameSafe = (attributeName: string): boolean => {
	if (HasOwnProperty.call(validatedAttributeNameCache, attributeName)) {
		return true;
	}
	if (HasOwnProperty.call(illegalAttributeNameCache, attributeName)) {
		return false;
	}
	if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
		validatedAttributeNameCache[attributeName] = true;
		return true;
	}
	illegalAttributeNameCache[attributeName] = true;
	console.debug(`[${attributeName}] filtered.`);
	return false;
};

/** filter the unsafe attributes from dom */
export const safeToDom = <P extends object>(props: P): P => {
	return Object.keys(props).reduce((acc, key) => {
		if (isAttributeNameSafe(key)) {
			// @ts-ignore
			acc[key] = props[key];
		}
		return acc;
	}, {} as P);
};

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