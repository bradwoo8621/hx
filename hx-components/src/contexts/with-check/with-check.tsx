// @ts-expect-error import React
import React, {type ReactNode, useContext, useState} from 'react';
import type {UseCheckMonitorResult} from '../../hooks';
import {type CheckScope} from '../../types';
import {AbstractHxReactContext, createHxReactContext, type HxReactContext} from '../../utils';

export type InvokeCheckFunc = (scopes: Array<CheckScope>, callback: (result: UseCheckMonitorResult, el?: HTMLElement) => void) => void;

export interface HxWithCheckContext extends HxReactContext {
	check(scopes?: CheckScope | Array<CheckScope>): void;
	register(invoke: InvokeCheckFunc, scopes?: CheckScope | Array<CheckScope>): void;
	unregister(invoke: InvokeCheckFunc, scopes?: CheckScope | Array<CheckScope>): void;
}

const Context = createHxReactContext<HxWithCheckContext>('HxWithCheckContext');

class HxWithCheckContextImpl extends AbstractHxReactContext implements HxWithCheckContext {
	private readonly checks = new Map<CheckScope, Map<InvokeCheckFunc, true>>();

	private getInvokeFuncMap(scope: CheckScope): Map<InvokeCheckFunc, true> | undefined {
		return this.checks.get(scope);
	}

	// @ts-expect-error ignore check
	private getOrCreateInvokeFuncMap(scope: CheckScope): Map<InvokeCheckFunc, true> {
		let map = this.getInvokeFuncMap(scope);
		if (map == null) {
			map = new Map();
			this.checks.set(scope, map);
		}
		return map;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	check(_scopes?: CheckScope | Array<CheckScope>): void {
		// let invokes: Array<InvokeCheckFunc>;
		//
		// let hasError = false;
		// // eslint-disable-next-line @typescript-eslint/no-unused-vars
		// const callback = (result: UseCheckMonitorResult, _el?: HTMLElement) => {
		// 	if (result.error != null) {
		// 		hasError = true;
		// 	}
		// };
		// invokes.forEach(invoke => invoke(computedScopes, callback));
		// if (hasError) {
		// 	// TODO, find first error element, scroll to viewport
		// }
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	register(_invoke: InvokeCheckFunc, _scopes?: CheckScope | Array<CheckScope>): void {
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	unregister(_invoke: InvokeCheckFunc, _scopes?: CheckScope | Array<CheckScope>): void {
	}
}

export const HxWithCheckProvider = (props: { children: ReactNode }) => {
	const {children} = props;

	/**
	 * Initialize the tabs context with an event emitter implementation
	 * Uses useState to ensure the context instance is only created once per tabs component
	 */
	const [tabsContext] = useState<HxWithCheckContext>(() => new HxWithCheckContextImpl());

	return <Context.Provider value={tabsContext}>
		{children}
	</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHxWithCheck = () => useContext(Context);
