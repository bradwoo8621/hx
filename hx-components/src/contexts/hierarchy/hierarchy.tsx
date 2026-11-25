// @ts-expect-error import React
import React, {type ReactNode, type RefObject, useContext, useEffect, useState} from 'react';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';

/**
 * Hierarchy wrapper around a component context (tabs, panel, overlay instance, ...).
 * Each {@link HxHierarchyProvider} creates one instance and chains it onto the parent
 * hierarchy context, mirroring the React tree — portal content resolves to its
 * declaration-site ancestors. The wrapper can also bind itself to a DOM element,
 * making the context reachable from the DOM side.
 */
export interface HxHierarchyContext extends HxReactContext {
	/**
	 * Get the wrapped component context
	 * @typeParam R - Expected component context type
	 */
	current<R extends HxReactContext = HxReactContext>(): R;

	/**
	 * Get the registered name of the wrapped component context
	 */
	name(): string;

	/**
	 * Find the nearest component context by registered name, walking up the React-tree chain
	 * @param name - Registered context name (e.g. 'HxPanelContext')
	 * @param includeMyself - Whether this wrapper itself may match, default true
	 * @returns The matching component context, or undefined when nothing matches
	 */
	closest<R extends HxReactContext = HxReactContext>(name: string, includeMyself?: boolean): R | undefined;

	/**
	 * Get the ancestor component contexts of the React-tree chain, nearest first,
	 * excluding this one
	 */
	ancestors(): Array<HxReactContext>;

	/**
	 * Attach this wrapper to a DOM element: writes `data-hx-hierarchy-context` with the
	 * registered name and stores the handle under a symbol key, so the context can be
	 * reached from the element later
	 * @param el - Element to bind, usually the component root
	 */
	bind(el: HTMLElement): void;

	/**
	 * Remove the binding made by {@link bind}
	 * @param el - Previously bound element
	 */
	unbind(el: HTMLElement): void;
}

const Context = createHxReactContext<HxHierarchyContext>('HxHierarchyContext');

interface HxHierarchyContextConstructArgs {
	delegatedContext: HxReactContext;
	delegatedContextName: string;
	parentHierarchyContext?: HxHierarchyContext;
}

const HxHierarchyContextDOMKey = Symbol('HxHierarchyContextDOMKey');

class HxHierarchyContextImpl extends AbstractHxReactContext implements HxHierarchyContext {
	private readonly delegatedContext: HxReactContext;
	private readonly delegatedContextName: string;
	private readonly parentHierarchyContext?: HxHierarchyContext;

	constructor(options: HxHierarchyContextConstructArgs) {
		super();
		this.delegatedContext = options.delegatedContext;
		this.delegatedContextName = options.delegatedContextName;
		this.parentHierarchyContext = options.parentHierarchyContext;
	}

	/** @inheritDoc */
	current<R extends HxReactContext = HxReactContext>(): R {
		return this.delegatedContext as R;
	}

	/** @inheritDoc */
	name(): string {
		return this.delegatedContextName;
	}

	/** @inheritDoc */
	closest<R extends HxReactContext = HxReactContext>(name: string, includeMyself: boolean = true): R | undefined {
		if (includeMyself) {
			if (this.delegatedContextName === name) {
				return this.delegatedContext as R;
			}
		}
		if (this.parentHierarchyContext == null) {
			return (void 0);
		}
		if (this.parentHierarchyContext.name() === name) {
			return this.parentHierarchyContext.current();
		} else {
			return this.parentHierarchyContext.closest(name, false);
		}
	}

	/** @inheritDoc */
	ancestors(): Array<HxReactContext> {
		const parent = this.parentHierarchyContext;
		if (parent == null) {
			return [];
		} else {
			return [parent.current(), ...parent.ancestors()];
		}
	}

	/** @inheritDoc */
	bind(el: HTMLElement): void {
		el.setAttribute('data-hx-hierarchy-context', this.delegatedContextName);
		// @ts-expect-error ignore check
		el[HxHierarchyContextDOMKey] = this;
	}

	/** @inheritDoc */
	unbind(el: HTMLElement): void {
		el.removeAttribute('data-hx-hierarchy-context');
		// @ts-expect-error ignore check
		delete el[HxHierarchyContextDOMKey];
	}
}

/**
 * Wrap a component context into the hierarchy and provide it to the subtree.
 * The created wrapper chains onto the hierarchy context of the enclosing provider,
 * if any, mirroring the React tree.
 * @param props.context - The component context to expose
 * @param props.contextDisplayName - Registered name used by name-based lookups
 * @param props.children - Subtree the hierarchy applies to
 */
export const HxHierarchyProvider = (props: {
	context: HxReactContext; contextDisplayName: string; children: ReactNode;
}) => {
	const {context, contextDisplayName, children} = props;

	const parentHierarchyContext = useContext(Context);
	// Create event-driven popup context instance once on mount
	const [hxHierarchyContext] = useState<HxHierarchyContext>(() => new HxHierarchyContextImpl({
		delegatedContext: context, delegatedContextName: contextDisplayName,
		parentHierarchyContext
	}));

	return <Context.Provider value={hxHierarchyContext}>
		{children}
	</Context.Provider>;
};

/**
 * Read the hierarchy context of the nearest enclosing provider
 * @returns The hierarchy context, or undefined when there is no provider above
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useHxHierarchy = () => useContext(Context);

/**
 * Bind the nearest hierarchy context to a DOM element for the element's lifetime:
 * binds on mount and unbinds on unmount. Does nothing when there is no provider above.
 * @param ref - Ref of the element to bind, usually the component root
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useHxHierarchyBound = (ref: RefObject<HTMLElement | null | undefined>) => {
	const hierarchyContext = useContext(Context);
	useEffect(() => {
		if (ref.current != null && hierarchyContext != null) {
			const el = ref.current;
			hierarchyContext.bind(el);
			return () => {
				hierarchyContext.unbind(el);
			};
		}
	});
};

/**
 * Read the hierarchy context bound to exactly this element, without climbing ancestors
 * @param el - Element to inspect
 * @returns The bound hierarchy context, or undefined when the element carries none
 */
// eslint-disable-next-line react-refresh/only-export-components
export const findBoundHierarchyContext = (el?: HTMLElement | null): HxHierarchyContext | undefined => {
	if (el == null) {
		return (void 0);
	} else {
		// @ts-expect-error ignore check
		return el[HxHierarchyContextDOMKey] ?? (void 0);
	}
};

/**
 * Read the component context bound to exactly this element, without climbing ancestors
 * @typeParam R - Expected component context type
 * @param el - Element to inspect
 * @returns The bound component context, or undefined when the element carries none
 */
// eslint-disable-next-line react-refresh/only-export-components
export const findBoundHxComponentContext = <R extends HxReactContext>(el?: HTMLElement | null): R | undefined => {
	if (el == null) {
		return (void 0);
	} else {
		// @ts-expect-error ignore check
		return el[HxHierarchyContextDOMKey]?.current() ?? (void 0);
	}
};

/**
 * Find the nearest bound component context by registered name using the DOM tree:
 * a single `closest()` step on `data-hx-hierarchy-context`
 * @typeParam R - Expected component context type
 * @param el - Element to start from (itself included)
 * @param name - Registered context name (e.g. 'HxPanelContext')
 * @returns The matching component context, or undefined when no ancestor carries the name
 */
// eslint-disable-next-line react-refresh/only-export-components
export const closestBoundHxComponentContext = <R extends HxReactContext>(el: HTMLElement | null | undefined, name: string): R | undefined => {
	const node = el?.closest(`[data-hx-hierarchy-context="${name}"]`);
	// @ts-expect-error ignore check
	return node?.[HxHierarchyContextDOMKey]?.current() ?? (void 0);
};

/**
 * Collect every hierarchy context bound on the DOM ancestors of the element,
 * innermost first. Only DOM-bound ancestors are collected; React-tree ancestors
 * beyond them are reachable from each entry through `closest()` / `ancestors()`.
 * @param el - Element to start from (itself included)
 * @returns Bound hierarchy contexts, innermost first; empty when none is bound
 */
// eslint-disable-next-line react-refresh/only-export-components
export const allHierarchyContexts = (el?: HTMLElement | null): Array<HxHierarchyContext> => {
	if (el == null) {
		return [];
	} else {
		const contexts: Array<HxHierarchyContext> = [];
		while (true) {
			const context = findBoundHierarchyContext(el);
			if (context != null) {
				contexts.push(context);
			}
			el = el?.parentElement?.closest('[data-hx-hierarchy-context]');
			if (el == null) {
				break;
			}
		}
		return contexts;
	}
};

/**
 * Collect every component context bound on the DOM ancestors of the element,
 * innermost first — the `current()` values of {@link allHierarchyContexts}
 * @param el - Element to start from (itself included)
 * @returns Bound component contexts, innermost first; empty when none is bound
 */
// eslint-disable-next-line react-refresh/only-export-components
export const allHxComponentContexts = (el?: HTMLElement | null): Array<HxReactContext> => {
	return allHierarchyContexts(el).map(c => c.current());
};