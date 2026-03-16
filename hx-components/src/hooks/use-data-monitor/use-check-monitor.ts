import {ERO, type OnChangeEventHandle, type ReactiveObject, type ValueChangedEvent} from '@hx/data';
import {useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import type {MonitorCheckFunc} from '../../types';
import {useForceUpdate} from '../use-force-update';
import {computeCheckMonitors} from './monitor-compute';
import type {DataCheckState, UseCheckMonitorOptions, UseCheckMonitorResult} from './types';

export const useCheckMonitor =
	<M extends ReactiveObject & object>(options: UseCheckMonitorOptions<M>): UseCheckMonitorResult => {
		const {
			$model,
			$check
		} = options;

		const context = useHxContext();
		const stateRef = useRef<DataCheckState>({});
		const forceUpdate = useForceUpdate();

		useEffect(() => {
			// compute data monitors, get a map that
			// - key is monitor absolute path
			// - value is array of monitor type and handle function
			const map = computeCheckMonitors(
				$model,
				$check
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
				Array<['$check', MonitorCheckFunc<M>]>
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
									delete originState.error;
								} else if (typeof error === 'string') {
									if (originState.error?.level !== 'error' || originState.error?.message !== error) {
										originState.error = {level: 'error', message: error};
									}
								} else if (originState.error?.level !== error.level || originState.error?.message !== error.message) {
									originState.error = error;
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
		}, [
			$model,
			$check
		]);

		return {
			error: stateRef.current.error
		};
	};
