import {ERO, type OnChangeEventHandle, type ReactiveObject, type ValueChangedEvent} from '@hx/data';
import {useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import type {MonitorBoolFunc, MonitorVoidFunc} from '../../types';
import {useForceUpdate} from '../use-force-update';
import {computeInitDataMonitorState} from './init-data-compute';
import {computeDataMonitors} from './monitor-compute';
import type {DataMonitorState, UseDataMonitorOptions, UseDataMonitorResult} from './types';

export const useDataMonitor =
	<M extends ReactiveObject & object>(options: UseDataMonitorOptions<M>): UseDataMonitorResult => {
		const {
			$model,
			$visible, $disabled, $readonly,
			$change
		} = options;

		const context = useHxContext();
		const stateRef = useRef<DataMonitorState>(computeInitDataMonitorState($model, $visible, $disabled, $readonly));
		const forceUpdate = useForceUpdate();

		useEffect(() => {
			// compute data monitors, get a map that
			// - key is monitor absolute path
			// - value is array of monitor type and handle function
			const map = computeDataMonitors(
				$model,
				$visible, $disabled, $readonly,
				$change
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
				Array<
					| ['$visible', MonitorBoolFunc<M>]
					| ['$disabled', MonitorBoolFunc<M>]
					| ['$readonly', MonitorBoolFunc<M>]
					| ['$change', MonitorVoidFunc<M>]
				>
			>);
			const monitors: Array<[string, OnChangeEventHandle]> = [];
			Object.keys(map).forEach(path => {
				const handles = map[path];
				const handle = (event: ValueChangedEvent) => {
					handles.forEach(([type, handle]) => {
						let originState = {
							visible: stateRef.current.visible,
							disabled: stateRef.current.disabled,
							readonly: stateRef.current.readonly
						};
						switch (type) {
							case '$visible': {
								originState.visible = handle(event, $model, context);
								break;
							}
							case '$disabled': {
								originState.disabled = handle(event, $model, context);
								break;
							}
							case '$readonly': {
								originState.readonly = handle(event, $model, context);
								break;
							}
							case '$change': {
								handle(event, $model, context, forceUpdate);
								break;
							}
							default: {
								// do nothing
								break;
							}
						}
						if (originState.visible !== stateRef.current.visible
							|| originState.disabled !== stateRef.current.disabled
							|| originState.readonly !== stateRef.current.readonly) {
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
			$visible, $disabled, $readonly,
			$change
		]);

		return {
			visible: stateRef.current.visible,
			disabled: stateRef.current.disabled,
			readonly: stateRef.current.readonly
		};
	};
