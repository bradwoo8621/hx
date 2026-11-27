import {ERO, type ValueChangedEvent} from '@hx/data';
import {useEffect, useRef} from 'react';
import {type InvokeCheckCallbackFunc, useHxContext} from '../../contexts';
import {
	AnyCheckScope,
	type CheckResultWithLevel,
	type CheckScope,
	type HxDataPath,
	ManualCheckField
} from '../../types';
import {HxConsole} from '../../utils';
import {computeMonitorPaths} from './monitor-compute';
import type {DataCheckState, UseCheckMonitorOptions, UseCheckMonitorResult} from './types';

export const useCheckMonitor =
	<T extends object>(options: UseCheckMonitorOptions<T>): UseCheckMonitorResult => {
		const {$model, $check, $supplyOn, elementRef} = options;

		const context = useHxContext();
		const stateRef = useRef<DataCheckState>({});

		useEffect(() => {
			if ($check == null) {
				return;
			}

			const handleFunc = $check.handle;
			if (handleFunc == null) {
				HxConsole.error('Handler function not provided on $check.', $check);
				return;
			}

			const doCheck = (event: ValueChangedEvent): CheckResultWithLevel | undefined => {
				const originState = stateRef.current.error == null
					? {}
					: {error: {...stateRef.current.error}};
				const error = handleFunc(event, $model, context);
				if (error == null) {
					delete stateRef.current.error;
				} else if (typeof error === 'string') {
					stateRef.current.error = {level: 'error', message: error};
				} else {
					stateRef.current.error = error;
				}
				if (originState.error?.level != stateRef.current.error?.level
					|| originState.error?.message !== stateRef.current.error?.message) {
					context.forceUpdate();
				}
				return stateRef.current.error;
			};

			const normalizeToArray = <T extends string>(sth?: T | Array<T> | null): Array<T> => {
				sth = (sth == null || sth.length === 0)
					? []
					: (typeof sth === 'string' ? (sth.length === 0 ? [] : [sth]) : sth);
				// remove null/empty and deduplication
				sth = [...new Set(sth.filter(x => x != null && x.length !== 0))];
				return sth;
			};
			const computeOn = (on?: HxDataPath | Array<HxDataPath> | null): Array<HxDataPath> => {
				return normalizeToArray(on);
			};
			let on = computeOn($check.on);
			if (on.length === 0) {
				on = computeOn($supplyOn);
			}
			let monitorPaths: Array<string> = [];
			if (on.length === 0) {
				HxConsole.warn('Monitor path not provided on $check, and $supplyOn also not provided.', $check);
			} else {
				monitorPaths = [...new Set(computeMonitorPaths(on, $model, $check))];
				// checks on value changed
				monitorPaths.forEach(path => ERO.on($model, path, doCheck));
			}

			// compute the static handler, for manually check invoke
			const computeCheckScopes = (scopes?: CheckScope | Array<CheckScope> | null): Array<CheckScope> => {
				return normalizeToArray(scopes);
			};
			const scopes = computeCheckScopes($check.scopes);
			const manualHandleFunc = (callback: InvokeCheckCallbackFunc) => {
				const error = doCheck(ERO.changeEventOf($model, ManualCheckField, (void 0), (void 0)));
				callback(error ?? (void 0), elementRef);
			};
			let registeredScopes: [CheckScope, ...Array<CheckScope>];
			if (scopes.length === 0 || scopes.includes(AnyCheckScope)) {
				registeredScopes = [AnyCheckScope];
			} else {
				registeredScopes = scopes as [CheckScope, ...Array<CheckScope>];
			}
			context.checks?.register(manualHandleFunc, registeredScopes);

			return () => {
				if (monitorPaths.length !== 0) {
					monitorPaths.forEach(path => ERO.off($model, path, doCheck));
				}
				context.checks?.unregister(manualHandleFunc, registeredScopes);
			};
		}, [$model, $check, $supplyOn, elementRef, context]);

		// eslint-disable-next-line react-hooks/refs
		return {error: stateRef.current.error};
	};
