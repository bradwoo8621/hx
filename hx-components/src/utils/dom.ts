import {
	Children,
	cloneElement,
	type DispatchWithoutAction,
	type HTMLAttributes,
	isValidElement,
	type ReactNode
} from 'react';
import type {HxContext} from '../contexts';
import type {HtmlElementProps, HxHtmlElementProps, HxObject} from '../types';

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
			// @ts-expect-error Dynamic property access on generic props type
			const value = props[key];
			if (value != null && typeof value === 'function'
				&& key.startsWith('on') && key.length > 2
				&& 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(key[2])) {
				// @ts-expect-error Dynamic property assignment on generic props type
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
			// @ts-expect-error Dynamic property assignment on generic accumulator object
			acc[key] = props[key];
		}
		return acc;
	}, {} as P);
};

const interposePropsToChildren = (props: (originProps: any) => any, children: ReactNode): ReactNode => {
	return Children.map(children, (child) => {
		if (isValidElement(child)) {
			const type = child.type;
			if (typeof type === 'string') {
				return child;
			} else {
				return cloneElement(child, props(child.props));
			}
		} else {
			return child;
		}
	});
};

/**
 * Merge additional props into child React elements, with child props taking precedence.
 * For each valid React element in the children tree, merges the interposition props
 * while preserving any existing props with the same name on the child.
 *
 * @param interposition - Props to merge into child elements
 * @param children - React children to process
 * @returns New React children tree with merged props
 *
 * @example
 * // Child props have higher priority
 * const children = <Button className="primary" />;
 * interposeToChildren({ className: "secondary", disabled: true }, children);
 * // Result: <Button className="primary" disabled={true} />
 */
export const interposeToChildren = <P extends object>(interposition: P, children?: ReactNode): ReactNode => {
	return interposePropsToChildren((props) => {
		return {
			...interposition,
			...props // Child props override interposition props
		};
	}, children);
};

/**
 * Force merge additional props into child React elements, with interposition props taking precedence.
 * For each valid React element in the children tree, merges the interposition props
 * and overrides any existing props with the same name on the child.
 *
 * @param interposition - Props to merge into child elements (overrides child props)
 * @param children - React children to process
 * @returns New React children tree with merged props
 *
 * @example
 * // Interposition props have higher priority
 * const children = <Button className="primary" />;
 * forceInterposeToChildren({ className: "secondary", disabled: true }, children);
 * // Result: <Button className="secondary" disabled={true} />
 */
export const forceInterposeToChildren = <P extends object>(interposition: P, children?: ReactNode): ReactNode => {
	return interposePropsToChildren((props) => {
		return {
			props,
			...interposition // Interposition props override child props
		};
	}, children);
};
