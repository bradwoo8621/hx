// @ts-expect-error import React
import React, {type ReactNode, useContext, useState} from 'react';
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
 * @param el might be undefined/null.
 *        if the element is created by error itself, and maybe caused by react repaint mechanism,
 *        the ref is not reached in this callback.
 *        e.g. when HxCheckMessage.alwaysKeepMessageDOM is false, the el is null.
 *        so it is an assistant, not reliably reached
 */
export type InvokeCheckCallbackFunc = (result?: CheckResultWithLevel, el?: HTMLElement) => void;
/**
 * function to invoke the component check, and will call callback function once the check accomplished.
 */
export type InvokeCheckFunc = (callback: InvokeCheckCallbackFunc) => void;

export interface HxWithCheckContext extends HxReactContext {
	check(callback: CheckCallbackFunc, scopes?: CheckScope | Array<CheckScope>): void;
	register(invoke: InvokeCheckFunc, scopes: [CheckScope, ...Array<CheckScope>]): void;
	unregister(invoke: InvokeCheckFunc, scopes: [CheckScope, ...Array<CheckScope>]): void;
}

const Context = createHxReactContext<HxWithCheckContext>('HxWithCheckContext');

class HxWithCheckContextImpl extends AbstractHxReactContext implements HxWithCheckContext {
	private readonly checks = new Map<CheckScope, Map<InvokeCheckFunc, true>>();

	private getInvokeFuncMap(scope: CheckScope): Map<InvokeCheckFunc, true> | undefined {
		return this.checks.get(scope);
	}

	private getOrCreateInvokeFuncMap(scope: CheckScope): Map<InvokeCheckFunc, true> {
		let map = this.getInvokeFuncMap(scope);
		if (map == null) {
			map = new Map();
			this.checks.set(scope, map);
		}
		return map;
	}

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
		const errors: CheckCallbackErrors = [];
		const invokeCallback = (result?: CheckResultWithLevel, el?: HTMLElement) => {
			if (result?.message != null) {
				hasError = true;
				errors.push({error: result, el});
			}
		};
		for (const invoke of invokes) {
			invoke(invokeCallback);
		}

		if (hasError) {
			// TODO focus the first error, and scroll to viewport
			callback(true, errors);
		} else {
			callback(false);
		}
	}

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

export const HxWithCheckProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	const [withCheckContext] = useState<HxWithCheckContext>(() => new HxWithCheckContextImpl());

	return <Context.Provider value={withCheckContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxWithCheck = () => useContext(Context);
