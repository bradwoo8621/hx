import {ERO, type OnChangeEventHandle, type ValueChangedEvent} from '@hx/data';
import {useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import type {CheckPropValue, MonitorCheckFunc, SuppliedCheckPropValue} from '../../types';
import {useForceUpdate} from '../use-force-update';
import {computeCheckMonitors} from './monitor-compute';
import type {CheckPropSuppliedOn, DataCheckState, UseCheckMonitorOptions, UseCheckMonitorResult} from './types';

const supplyOn =
	<T extends object>($check?: CheckPropValue<T>, $supplyOn ?: CheckPropSuppliedOn): SuppliedCheckPropValue<T> | undefined => {
		if ($check == null) {
			return (void 0);
		}
		if ($supplyOn == null || $supplyOn.length == 0) {
			return $check as SuppliedCheckPropValue<T>;
		}

		if (Array.isArray($check)) {
			return $check.map(({on, ...rest}) => {
				if (on == null || on.length == 0) {
					return {on: $supplyOn, ...rest};
				} else {
					return {on, ...rest};
				}
			});
		} else {
			const {on, ...rest} = $check;
			if (on == null || on.length == 0) {
				return {on: $supplyOn, ...rest};
			} else {
				return {on, ...rest};
			}
		}
	};

export const useCheckMonitor =
	<T extends object>(options: UseCheckMonitorOptions<T>): UseCheckMonitorResult => {
		const {$model, $check, $supplyOn} = options;

		const context = useHxContext();
		const stateRef = useRef<DataCheckState>({});
		const forceUpdate = useForceUpdate();

		useEffect(() => {
			// compute data monitors, get a map that
			// - key is monitor absolute path
			// - value is array of monitor type and handle function
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
			}, {} as Record<
				string,
				Array<['$check', MonitorCheckFunc<T>]>
			>);
			const monitors: Array<[string, OnChangeEventHandle]> = [];
			Object.keys(map).forEach(path => {
				const handles = map[path];
				const handle = (event: ValueChangedEvent) => {
					handles.forEach(([type, handle]) => {
						let originState = {
							error: stateRef.current.error
						};
						switch (type) {
							case '$check': {
								const error = handle(event, $model, context);
								if (error == null) {
									delete stateRef.current.error;
								} else if (typeof error === 'string') {
									if (originState.error?.level !== 'error' || originState.error?.message !== error) {
										stateRef.current.error = {level: 'error', message: error};
									}
								} else if (originState.error?.level !== error.level || originState.error?.message !== error.message) {
									stateRef.current.error = error;
								}
								break;
							}
							default: {
								// do nothing
								break;
							}
						}
						if (originState.error?.level !== stateRef.current.error?.level
							|| originState.error?.message !== stateRef.current.error?.message) {
							forceUpdate();
						}
					});
				};
				monitors.push([path, handle]);
			});
			monitors.forEach(([path, handle]) => ERO.on($model, path, handle));

			return () => {
				monitors.forEach(([path, handle]) => ERO.off($model, path, handle));
			};
		}, [$model, $check, $supplyOn]);

		return {
			error: stateRef.current.error
		};
	};
