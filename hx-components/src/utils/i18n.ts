import {isValidElement, type ReactNode} from 'react';
import type {HxContext} from '../contexts';

export class I18NUtils {
	/**
	 * If the given parameter `text` is a string and starts with "~", it is considered an i18n key. Otherwise, it is not.
	 *
	 * - If it is an i18n key, return `true` and the string after removing the leading "~".
	 * - If it is **not** an i18n key, but `text` is a string and starts with "\~",
	 *   return `false` and the string after removing the leading "\".
	 * - For all other cases, return `false` and the original `text` itself.
	 */
	static isI18NKey(text: ReactNode): [true, string] | [false, ReactNode] {
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
	}

	/**
	 * - remove the first "\", if starts with "\~", and insert a "~" as prefix
	 * - or insert a "~" as prefix if not starts with "~"
	 * - or do nothing, return itself.
	 */
	static addI18NPrefix(key: string): string {
		if (key.startsWith('\\~')) {
			return `~${key.substring(1)}`;
		} else if (key.startsWith('~')) {
			return key;
		} else {
			return `~${key}`;
		}
	}

	/**
	 * remove the first "~", if there is
	 */
	static delI18NPrefix(key: string): string {
		if (key.startsWith('~')) {
			return key.substring(1);
		} else {
			return key;
		}
	}

	static asText = (label: ReactNode, context: HxContext): string => {
		if (isValidElement(label)) {
			return (label.props?.['data-hx-label-text'] || '') as string;
		} else if (typeof label === 'string') {
			const [is, key] = I18NUtils.isI18NKey(label);
			if (is) {
				const i18nLabel = context.language.get(key) || label;
				if (isValidElement(i18nLabel)) {
					// @ts-expect-error ignore check
					return (i18nLabel.props?.['data-hx-label-text'] || '') as string;
				} else {
					label = i18nLabel;
				}
			} else {
				// not an i18n key, but "\~" leading is an escaped "~",
				// take the text with the escaping "\" removed
				label = key;
			}
		}

		if (typeof label === 'string') {
			return label;
		} else {
			return `${label}`;
		}
	};

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}
}
