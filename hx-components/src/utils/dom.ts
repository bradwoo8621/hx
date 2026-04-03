import {Children, cloneElement, type HTMLAttributes, isValidElement, type ReactNode} from 'react';
import type {HxContext} from '../contexts';
import type {
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

/**
 * Check if an attribute name is valid and safe for use in DOM elements
 * Uses regex validation consistent with React's attribute name validation rules
 * Caches results for performance optimization
 * @param attributeName Name of the attribute to validate
 * @returns True if attribute name is safe, false otherwise
 */
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

/**
 * Filter and transform component props to safe DOM attributes
 * Converts logical layout props to corresponding data attributes and CSS styles
 * Removes invalid attribute names to prevent XSS and DOM injection issues
 * @param props Raw component props to process
 * @returns Filtered props safe for direct application to DOM elements
 */
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
				style[attr[1]] = `${value}px`;
				styleAdded = true;
			} else if (typeOfValue === 'string') {
				if (!['xs', 'sm', 'md', 'lg', 'xl'].includes(typeOfValue)) {
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

/**
 * Process component props for direct DOM exposure
 * Combines event wrapping and attribute safety filtering in a single pass
 * Converts Hx component props to standard React HTML element props
 * @param props Raw Hx component props
 * @param model Form model object for event handler context
 * @param context Global Hx application context
 * @returns Processed props ready to be spread onto a DOM element
 */
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

/**
 * Internal utility to dynamically inject props into child React elements
 * Applies a transform function to each child element's props
 * Only modifies custom React components, not native HTML elements
 * @param props Transform function that receives original props and returns modified props
 * @param children React children tree to process
 * @returns New children tree with modified props
 */
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

// noinspection JSUnusedGlobalSymbols
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

// noinspection JSUnusedGlobalSymbols
/**
 * Calculate total transition and animation duration for a DOM element
 * Parses computed styles to get the maximum combined duration of all transitions and animations
 * Used to wait for animations/transitions to complete before performing DOM operations
 * @param el Target DOM element to inspect
 * @returns Object containing transition/animation status and total duration in milliseconds
 */
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

export interface RectToGetGapsToEdge {
	top: number;
	bottom: number;
	left: number;
	right: number;
}

export interface GapsToEdge<R extends RectToGetGapsToEdge = RectToGetGapsToEdge> {
	top: number;
	bottom: number;
	left: number;
	right: number;
	rect: R;
}

/**
 * Calculate available space between a rectangle and viewport boundaries
 * Computes how much space is available on each side of the rectangle within the viewport,
 * minus the specified gap to maintain from the edge
 * @param rect Bounding rectangle of the element (from getBoundingClientRect)
 * @param gapToEdge Minimum required gap between element edge and viewport edge
 * @returns Available space on each side and the original rect
 */
export const computeGapToViewportEdges = <R extends RectToGetGapsToEdge>(rect: R, gapToEdge: number): GapsToEdge<R> => {
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

/**
 * Check if element is partially or fully outside its container's bounds
 * Used to determine if an element needs to be scrolled into view
 * @param el Target element to check
 * @param container Container element to test against
 * @returns True if any part of the element is outside the container's viewport
 */
export const intersectWithContainer = (el: HTMLElement, container: HTMLElement): boolean => {
	const parentRect = container.getBoundingClientRect();
	const elRect = el.getBoundingClientRect();
	return parentRect.top > elRect.top || parentRect.bottom < elRect.bottom || parentRect.left > elRect.left || parentRect.right < elRect.right;
};

/**
 * make sure the scroll container is the parent of given dom node
 */
export const scrollIntoViewIfNeed = (dom: HTMLElement | null | undefined, scrollOptions?: boolean | ScrollIntoViewOptions) => {
	if (dom == null) {
		return;
	}
	const container = dom.parentElement;
	if (container == null) {
		return;
	}

	if (intersectWithContainer(dom, container)) {
		// scroll into view only when part of given dom is not visible in scroll viewport
		dom.scrollIntoView(scrollOptions);
	}
};

/**
 * Register global click/focus listeners to detect interactions outside a component
 * Commonly used to close popups/dropdowns when user clicks or focuses outside
 * @param handler Callback function to invoke on outside interaction
 * @returns Cleanup function to remove the event listeners
 */
export const handleFocusClickOfOthers = (handler: (ev: Event) => void): (() => void) => {
	document.addEventListener('focus', handler, {passive: true});
	document.addEventListener('click', handler, {passive: true});
	return () => {
		// @ts-expect-error ignore the options property check
		document.removeEventListener('focus', handler, {passive: true});
		// @ts-expect-error ignore the options property check
		document.removeEventListener('click', handler, {passive: true});
	};
};

/**
 * body is included, document element is not included
 * @param el
 */
export const ancestorsOf = (el: HTMLElement): Array<HTMLElement> => {
	const ancestors: Array<HTMLElement> = [];
	let node = el.parentElement;
	while (node != null) {
		ancestors.push(node);
		node = node.parentElement;
		if (node == document.documentElement) {
			break;
		}
	}
	return ancestors;
};

/**
 * Filter an array of elements to only those that are scrollable
 * Checks overflow properties on both axes to determine scrollability
 * @param elements Array of elements to filter
 * @returns Array of elements with scrollable overflow
 */
export const getScrollableElements = (elements: Array<HTMLElement>): Array<HTMLElement> => {
	return elements.filter(el => {
		const style = window.getComputedStyle(el);
		return [
			style.overflow, style.overflowX, style.overflowY
		].some(overflow => ['auto', 'scroll'].includes(overflow));
	});
};

/**
 * Monitor scroll and resize events across all ancestor scroll containers of an element
 * Automatically handles position updates and visibility checks for components like popups
 * When element is scrolled or resized:
 * 1. First calls moveHandler to update element position
 * 2. Checks if element is more than 10% hidden by any scroll container or viewport
 *
 * @param el Target element to monitor
 * @param moveHandler Callback to execute when position should be updated
 * @param closeHandler Callback to execute when element should be closed due to obscuration
 * @returns Cleanup function to remove all event listeners and observers
 */
export const handleScrollResizeOfAncestors = (
	el: HTMLElement | undefined | null,
	moveHandler: () => void,
	closeHandler: () => void
): (() => void) => {
	if (el == null) {
		return () => {
		};
	}

	let delayHandle: number | undefined = (void 0);
	const handler = (ev?: Event) => {
		const target = ev?.target;
		if (target != null && target !== window && target !== document && target !== document.documentElement) {
			// and not any ancestor of given element, ignore this event
			if (target != el && !(target as HTMLElement).contains(el)) {
				return;
			}
		}
		moveHandler();
		// Use requestAnimationFrame to batch scroll events and avoid layout thrashing
		// Cancels pending frames to ensure only the latest position update is processed
		if (delayHandle != null) {
			cancelAnimationFrame(delayHandle);
		}
		delayHandle = requestAnimationFrame(() => {
			// Calculate visibility threshold: allow maximum 10% of element to be hidden
			// before triggering close handler for better UX
			const elRect = el.getBoundingClientRect();
			const maxHiddenX = elRect.width * 0.1;
			const maxHiddenY = elRect.height * 0.1;
			// First check visibility against browser viewport (fast path for most cases)
			if (elRect.top <= -maxHiddenY
				|| elRect.left <= -maxHiddenX
				|| elRect.bottom >= (window.innerHeight || document.documentElement.clientHeight) + maxHiddenY
				|| elRect.right >= (window.innerWidth || document.documentElement.clientWidth) + maxHiddenX) {
				closeHandler();
			} else {
				// Then check visibility against each nested scrollable ancestor container
				// Breaks early on first obscuration to avoid unnecessary calculations
				const ancestors = ancestorsOf(el);
				const scrollableAncestors = getScrollableElements(ancestors);
				for (const scrollableAncestor of scrollableAncestors) {
					const ancestorRect = scrollableAncestor.getBoundingClientRect();
					if (ancestorRect.top - elRect.top >= maxHiddenY
						|| ancestorRect.left - elRect.left >= maxHiddenX
						|| elRect.bottom - ancestorRect.bottom >= maxHiddenY
						|| elRect.right - ancestorRect.right >= maxHiddenX) {
						closeHandler();
						break;
					}
				}
			}
		});
	};

	const ancestors = ancestorsOf(el);
	const scrollableAncestors = getScrollableElements(ancestors);
	scrollableAncestors.forEach(ancestor => {
		ancestor.addEventListener('scroll', handler, {passive: true});
	});
	document.addEventListener('scroll', handler, {passive: true});
	// TIP: resize is not only for resizing! reflow, relayout also trigger this.
	// anyway, in practice, can be cached and compared
	const resizedObservedNodes: Map<HTMLElement, { width: number, height: number }> = new Map();
	const resizeObserver = new ResizeObserver((entries) => {
		let should = false;
		for (const entry of entries) {
			const target = entry.target as HTMLElement;
			const {offsetWidth: width, offsetHeight: height} = target;
			const cached = resizedObservedNodes.get(target);
			if (width !== cached?.width || height !== cached?.height) {
				should = true;
				// save current size to cache
				resizedObservedNodes.set(target, {width, height});
			}
		}
		if (should) {
			handler(new Event('resize'));
		}
	});
	ancestors.forEach(ancestor => {
		resizedObservedNodes.set(ancestor, {width: ancestor.offsetWidth, height: ancestor.offsetHeight});
		resizeObserver.observe(ancestor);
	});
	window.addEventListener('resize', handler, {passive: true});

	return () => {
		scrollableAncestors.forEach(ancestor => {
			// @ts-expect-error ignore the options property check
			ancestor.removeEventListener('scroll', handler, {passive: true});
		});
		// @ts-expect-error ignore the options property check
		document.removeEventListener('scroll', handler, {passive: true});
		resizeObserver.disconnect();
		// @ts-expect-error ignore the options property check
		window.removeEventListener('resize', handler, {passive: true});
	};
};

export const safeOnTransitionEndOnce = (
	el: HTMLElement | null | undefined,
	onTransitionEnd: (ev: TransitionEvent) => void,
	timeout: number = 1000
) => {
	if (el == null) {
		return;
	}

	el.addEventListener('transitionend', onTransitionEnd, {once: true});
	// guard to clear event listener, to avoid memory leak
	// all transition must be finished in 1s
	// and try to clear the event listener in case of event never triggered for reason
	setTimeout(() => {
		el.removeEventListener('transitionend', onTransitionEnd);
	}, timeout);
};
