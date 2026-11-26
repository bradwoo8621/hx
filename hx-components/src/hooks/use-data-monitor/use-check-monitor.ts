import {ERO, type OnChangeEventHandle, type ValueChangedEvent} from '@hx/data';
import {useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {type CheckPropValue, type MonitorCheckFunc, type SuppliedCheckPropValue} from '../../types';
import {HxConsole} from '../../utils';
import {computeCheckMonitors} from './monitor-compute';
import type {CheckPropSuppliedOn, DataCheckState, UseCheckMonitorOptions, UseCheckMonitorResult} from './types';

const supplyOn =
	<T extends object>($check?: CheckPropValue<T>, $supplyOn ?: CheckPropSuppliedOn): SuppliedCheckPropValue<T> | undefined => {
		if ($check == null) {
			return (void 0);
		}
		if ($supplyOn == null || $supplyOn.length == 0) {
			// return $check as SuppliedCheckPropValue<T>;
			if ($check.on != null && $check.on.length !== 0) {
				return $check as SuppliedCheckPropValue<T>;
			} else {
				HxConsole.error('Monitor path not provided on $check, and $supplyOn also not provided.', $check);
				return (void 0);
			}
		}

		const {on, ...rest} = $check;
		if (on == null || on.length == 0) {
			return {on: $supplyOn, ...rest};
		} else {
			return {on, ...rest};
		}
	};

export const useCheckMonitor =
	<T extends object>(options: UseCheckMonitorOptions<T>): UseCheckMonitorResult => {
		const {$model, $check, $supplyOn} = options;

		const context = useHxContext();
		const stateRef = useRef<DataCheckState>({});

		useEffect(() => {
			// compute data monitors, get a map that
			// - key is monitor absolute path
			// - value is array of monitor type and handle function
			// note the $check cannot be an array, but still use the common logic to build map
			const map = computeCheckMonitors(
				$model,
				supplyOn($check, $supplyOn)
			).reduce((map, [paths, ...rest]) => {
				paths.forEach(path => {
					if (map[path] == null) {
						map[path] = [rest];
					} else {
						map[path].push(rest);
					}
				});
				return map;
			}, {} as Record<string, Array<['$check', MonitorCheckFunc<T>]>>);
			const monitors: Array<[string, OnChangeEventHandle]> = [];
			Object.keys(map).forEach(path => {
				const handles = map[path];
				/** compare with the origin state, force update when they are different */
				const handle = (event: ValueChangedEvent) => {
					const originState = stateRef.current.error == null
						? {}
						: {error: {...stateRef.current.error}};
					let hasError = false;
					for (const [type, handle] of handles) {
						switch (type) {
							case '$check': {
								const error = handle(event, $model, context);
								if (error == null) {
									delete stateRef.current.error;
								} else if (typeof error === 'string') {
									stateRef.current.error = {level: 'error', message: error};
									hasError = true;
								} else {
									stateRef.current.error = error;
									hasError = true;
								}
								break;
							}
							default: {
								// do nothing
								break;
							}
						}
						if (hasError) {
							break;
						}
					}
					if (originState.error?.level != stateRef.current.error?.level
						|| originState.error?.message !== stateRef.current.error?.message) {
						context.forceUpdate();
					}
				};
				monitors.push([path, handle]);
			});
			monitors.forEach(([path, handle]) => ERO.on($model, path, handle));

			// TODO compute the static handlers, for manually check invoke

			return () => {
				monitors.forEach(([path, handle]) => ERO.off($model, path, handle));
			};
		}, [$model, $check, $supplyOn, context]);

		// eslint-disable-next-line react-hooks/refs
		return {error: stateRef.current.error};
	};
