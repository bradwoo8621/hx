import {Children, cloneElement, type CSSProperties, type HTMLAttributes, isValidElement, type ReactNode} from 'react';
import type {HxContext} from '../contexts';
import type {
	AbsolutePosition,
	FlexCellProps,
	GridCellProps,
	HeightConstrainedProps,
	HtmlElementProps,
	HxHtmlElementProps,
	HxObject,
	WidthConstrainedProps
} from '../types';

/**
 * wrap defined onXxx handlers to react event handlers
 *
 * @param props
 * @param model null is allowed
 * @param context
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
		context: HxContext
	): HtmlElementProps<E, EA> => {
		Object.keys(props).forEach((key) => {
			// @ts-expect-error Dynamic property access on generic props type
			const value = props[key];
			if (value != null && typeof value === 'function'
				&& key.startsWith('on') && key.length > 2
				&& 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(key[2])) {
				// @ts-expect-error Dynamic property assignment on generic props type
				props[key] = (ev) => {
					value(ev, model, context);
				};
			}
		});
		return props as HtmlElementProps<E, EA>;
	};

// copy from react-dom-development
const ATTRIBUTE_NAME_START_CHAR = ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
const ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
// eslint-disable-next-line no-misleading-character-class
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

const CommonPixelsProps: Record<
	| keyof WidthConstrainedProps
	| keyof HeightConstrainedProps,
	// second is CSS style name
	[`data-hx-${string}`, string]
> = {
	// width
	minWidth: ['data-hx-min-width', 'minWidth'],
	width: ['data-hx-width', 'width'],
	maxWidth: ['data-hx-max-width', 'maxWidth'],
	// height
	minHeight: ['data-hx-min-height', 'minHeight'],
	height: ['data-hx-height', 'height'],
	maxHeight: ['data-hx-max-height', 'maxHeight']
};

const CommonProps: Record<
	| keyof FlexCellProps
	| keyof GridCellProps,
	`data-hx-${string}`
> = {
	// flex cell
	fGrow: 'data-hx-flex-grow',
	fAlignSelf: 'data-hx-flex-align-self',
	// grid cell
	gRow: 'data-hx-grid-row',
	gRows: 'data-hx-grid-rows',
	gCol: 'data-hx-grid-col',
	gCols: 'data-hx-grid-cols',
	gJustifySelf: 'data-hx-grid-justify-self',
	gAlignSelf: 'data-hx-grid-align-self'
};

/** filter the unsafe attributes from dom */
export const safeToDom = <P extends object>(props: P): P => {
	return Object.keys(props).reduce((acc, key) => {
		// @ts-expect-error Dynamic property check
		let attr = CommonProps[key];
		if (attr != null) {
			// @ts-expect-error Dynamic property assignment on generic accumulator object
			acc[attr] = props[key];
			return acc;
		}
		// @ts-expect-error Dynamic property assignment on generic accumulator object
		attr = CommonPixelsProps[key];
		if (attr != null) {
			// @ts-expect-error Dynamic property assignment on generic accumulator object
			const value = props[key];
			// @ts-expect-error Dynamic property assignment on generic accumulator object
			acc[attr[0]] = value;

			let styleAdded = false;
			// @ts-expect-error Dynamic property assignment on generic accumulator object
			let style = props.style;
			if (style == null) {
				style = {};
			}
			const typeOfValue = typeof value;
			if (typeOfValue === 'number') {
				console.log(style);
				style[attr[1]] = `${value}px`;
				styleAdded = true;
			} else if (typeOfValue === 'string') {
				if (!['xs', 'sm', 'md', 'lg', 'xl'].includes(typeOfValue)) {
					console.log(style);
					style[attr[1]] = value;
					styleAdded = true;
				}
			}
			if (styleAdded) {
				// @ts-expect-error Dynamic property assignment on generic accumulator object
				acc.style = props.style ?? style;
			}
			return acc;
		}
		if (isAttributeNameSafe(key)) {
			// @ts-expect-error Dynamic property assignment on generic accumulator object
			acc[key] = props[key];
		}
		return acc;
	}, {} as P);
};

export const exposePropsToDOM =
	<
		E extends HTMLElement,
		EA extends HTMLAttributes<E>,
		O extends keyof HtmlElementProps<E, EA> | `data-hx-${string}`,
		T extends object
	>(
		props: HxHtmlElementProps<E, EA, O, T>,
		model: HxObject<T> | undefined,
		context: HxContext
	): HtmlElementProps<E, EA> => {
		return safeToDom(wrapToReactEvents(props, model, context));
	};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
export const interposeToChildren = <P extends object>(interposition?: P, children?: ReactNode): ReactNode => {
	if (interposition == null) {
		return children;
	}

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
export const forceInterposeToChildren = <P extends object>(interposition?: P, children?: ReactNode): ReactNode => {
	if (interposition == null) {
		return children;
	}

	return interposePropsToChildren((props) => {
		return {
			props,
			...interposition // Interposition props override child props
		};
	}, children);
};

export const computeTransitionAndAnimation = (el: HTMLElement) => {
	const style = window.getComputedStyle(el);
	const hasTransition = style.transitionProperty !== 'none' && style.transitionDuration !== '0s';
	let transitionTime = 0;
	if (hasTransition) {
		const durations = style.transitionDuration.split(', ');
		transitionTime = Math.max(...durations.map(duration => {
			if (duration.endsWith('ms')) {
				return parseFloat(duration);
			} else if (duration.endsWith('s')) {
				return parseFloat(duration) * 1000;
			}
			return 0;
		}));
	}

	const hasAnimation = style.animationName !== 'none' && style.animationDuration !== '0s';
	let animationTime = 0;
	if (hasAnimation) {
		const duration = style.animationDuration;

		if (duration.endsWith('ms')) {
			animationTime = parseFloat(duration);
		} else if (duration.endsWith('s')) {
			animationTime = parseFloat(duration) * 1000;
		}
	}

	return {
		transition: hasTransition,
		transitionTime,
		animation: hasAnimation,
		animationTime,
		any: hasTransition || hasAnimation,
		time: Math.max(transitionTime, animationTime)
	};
};

export const computeGapToViewportEdges = (el: HTMLElement, gapToEdge: number) => {
	const rect = el.getBoundingClientRect();
	const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
	const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
	return {
		top: rect.top - gapToEdge,
		bottom: viewportHeight - rect.bottom - gapToEdge,
		left: rect.left - gapToEdge,
		right: viewportWidth - rect.right - gapToEdge,
		rect
	};
};

export const positionWhenCan = (position?: AbsolutePosition, style?: CSSProperties): CSSProperties | undefined => {
	if (position == null || Object.keys(position).length === 0) {
		return style;
	}

	if (style == null) {
		style = {};
	}

	if (position.top != null && (style.top == null || style.top === '')) {
		style.top = position.top + 'px';
	}
	if (position.bottom != null && (style.bottom == null || style.bottom === '')) {
		style.bottom = position.bottom + 'px';
	}
	if (position.left != null && (style.left == null || style.left === '')) {
		style.left = position.left + 'px';
	}
	if (position.right != null && (style.right == null || style.right === '')) {
		style.right = position.right + 'px';
	}

	return style;
};
