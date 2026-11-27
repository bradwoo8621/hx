// @ts-expect-error import React
import React, {type ReactNode, type RefObject, useContext, useState} from 'react';
import {AnyCheckScope, type CheckResultWithLevel, type CheckScope} from '../../types';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';

/**
 * errors when has error, el is not reliably reached
 *
 * @see InvokeCheckCallbackFunc
 */
export type CheckCallbackErrors = Array<{ error: CheckResultWithLevel, el?: HTMLElement }>;
/**
 * function to tell the caller result of check
 */
export type CheckCallbackFunc = (hasError: boolean, errors?: CheckCallbackErrors) => void;
/**
 * @param result passed only when error checked out
 * @param elRef might be undefined/null.
 *        if the element is created by error itself, and maybe caused by react repaint mechanism,
 *        the ref is not reached in this callback.
 *        e.g. when HxCheckMessage.alwaysKeepMessageDOM is false, the el is null.
 *        so it is an assistant, not reliably reached
 */
export type InvokeCheckCallbackFunc = (result?: CheckResultWithLevel, elRef?: RefObject<HTMLElement>) => void;
/**
 * function to invoke the component check, and will call callback function once the check accomplished.
 */
export type InvokeCheckFunc = (callback: InvokeCheckCallbackFunc) => void;

/**
 * Check registry of a provider and the manual dispatch that runs it.
 * `useCheckMonitor` registers the rule of a component while the component is mounted.
 */
export interface HxWithCheckContext extends HxReactContext {
	/**
	 * Run the registered rules and report the outcome to the callback. Every rule that
	 * runs updates its message, and a rule that passes clears the message it showed.
	 * @param callback - Called right away with `false` when no rule returned a message.
	 * Otherwise called in the next animation frame with `true` and the errors, so that
	 * the messages are already rendered
	 * @param scopes - Check scopes to run. Without it, or with `AnyCheckScope`, every rule
	 * runs. Otherwise a rule runs when it has no `scopes`, or when its `scopes` contains
	 * `AnyCheckScope` or one of the given scopes
	 */
	check(callback: CheckCallbackFunc, scopes?: CheckScope | Array<CheckScope>): void;
	/**
	 * Add a rule so that `check` can run it
	 * @param invoke - Runs the rule and reports its result to the given callback
	 * @param scopes - Check scopes the rule belongs to. A tuple that contains
	 * `AnyCheckScope` makes the rule run on every dispatch
	 */
	register(invoke: InvokeCheckFunc, scopes: [CheckScope, ...Array<CheckScope>]): void;
	/**
	 * Remove a rule that `register` added
	 * @param invoke - The rule to remove
	 * @param scopes - The scopes the rule was registered with
	 */
	unregister(invoke: InvokeCheckFunc, scopes: [CheckScope, ...Array<CheckScope>]): void;
}

/**
 * React Context for the check registry, without a default value
 */
const Context = createHxReactContext<HxWithCheckContext>('HxWithCheckContext');

/**
 * Concrete implementation of HxWithCheckContext
 * Keeps the rules by scope, each bucket in registration order
 */
class HxWithCheckContextImpl extends AbstractHxReactContext implements HxWithCheckContext {
	/** rules by scope, each bucket in registration order */
	private readonly checks = new Map<CheckScope, Map<InvokeCheckFunc, true>>();

	/** the bucket of the scope, undefined when no rule was registered under it */
	private getInvokeFuncMap(scope: CheckScope): Map<InvokeCheckFunc, true> | undefined {
		return this.checks.get(scope);
	}

	/** the bucket of the scope, created when it does not exist yet */
	private getOrCreateInvokeFuncMap(scope: CheckScope): Map<InvokeCheckFunc, true> {
		let map = this.getInvokeFuncMap(scope);
		if (map == null) {
			map = new Map();
			this.checks.set(scope, map);
		}
		return map;
	}

	/** @inheritdoc */
	check(callback: CheckCallbackFunc, scopes?: CheckScope | Array<CheckScope>): void {
		if (scopes == null || scopes.length === 0) {
			// not specified, invoke all
			scopes = [AnyCheckScope];
		} else if (scopes === AnyCheckScope) {
			// any, invoke all
			scopes = [AnyCheckScope];
		} else if (typeof scopes === 'string') {
			// specified scope, and not any. invoke this given scope's
			scopes = [scopes];
		} else if (scopes.includes(AnyCheckScope)) {
			// includes any scope, invoke all
			scopes = [AnyCheckScope];
		}
		scopes = [...new Set(scopes)];

		const invokes = scopes[0] === AnyCheckScope
			// invokes all
			? [...new Set(
				Array.from(this.checks.values()).map(map => Array.from(map.keys())).flat()
			)]
			// invokes any scope and specified scopes
			: [...new Set([
				...Array.from(this.getInvokeFuncMap(AnyCheckScope)?.keys() ?? []),
				...scopes.map(scope => Array.from(this.getInvokeFuncMap(scope)?.keys() ?? [])).flat()
			])];

		let hasError = false;
		const errors: Array<{ error: CheckResultWithLevel, elRef?: RefObject<HTMLElement> }> = [];
		const invokeCallback = (result?: CheckResultWithLevel, elRef?: RefObject<HTMLElement>) => {
			if (result?.message != null) {
				hasError = true;
				errors.push({error: result, elRef});
			}
		};
		for (const invoke of invokes) {
			invoke(invokeCallback);
		}

		if (hasError) {
			// TODO focus the first error, and scroll to viewport
			// the element ref from callback function might not be set yet,
			// maybe the dom node is installed in next react render phase after error checked out.
			// so waiting for next frame
			window.requestAnimationFrame(() => {
				callback(true,
					errors.map(({error, elRef}) => {
						return {error, el: elRef?.current ?? (void 0)};
					}));
			});

		} else {
			callback(false);
		}
	}

	/** @inheritdoc */
	register(invoke: InvokeCheckFunc, scopes: [CheckScope, ...Array<CheckScope>]): void {
		if (scopes.includes(AnyCheckScope)) {
			const map = this.getOrCreateInvokeFuncMap(AnyCheckScope);
			map.set(invoke, true);
		} else {
			for (const scope of new Set(scopes)) {
				const map = this.getOrCreateInvokeFuncMap(scope);
				map.set(invoke, true);
			}
		}
	}

	/** @inheritdoc */
	unregister(invoke: InvokeCheckFunc, scopes: [CheckScope, ...Array<CheckScope>]): void {
		if (scopes.includes(AnyCheckScope)) {
			const map = this.getOrCreateInvokeFuncMap(AnyCheckScope);
			map.delete(invoke);
		} else {
			for (const scope of new Set(scopes)) {
				const map = this.getOrCreateInvokeFuncMap(scope);
				map.delete(invoke);
			}
		}
	}
}

/**
 * Provider component for HxWithCheckContext
 * HxContextProvider mounts it, so a subtree shares one check registry
 * @param props.children - Child components to wrap
 */
export const HxWithCheckProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	const [withCheckContext] = useState<HxWithCheckContext>(() => new HxWithCheckContextImpl());

	return <Context.Provider value={withCheckContext}>
		{children}
	</Context.Provider>;
};

/**
 * React hook to access the check registry
 * @returns HxWithCheckContext instance for dispatching checks, undefined when no provider is above
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useHxWithCheck = () => useContext(Context);
