import {ERO, type OnChangeEventHandle, type ValueChangedEvent} from '@hx/data';
import {useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import type {MonitorBoolFunc, MonitorChangeFunc, MonitorCheckFunc, NextActionOnChange} from '../../types';
import {computeInitDataMonitorState} from './init-data-compute';
import {computeDataMonitors} from './monitor-compute';
import type {DataMonitorState, UseDataMonitorOptions, UseDataMonitorResult} from './types';

export const useDataMonitor =
	<T extends object>(options: UseDataMonitorOptions<T>): UseDataMonitorResult => {
		const {
			$model,
			$visible, $disabled, $readonly,
			$change
		} = options;

		const context = useHxContext();
		const stateRef = useRef<DataMonitorState>((() => {
			return computeInitDataMonitorState($model, $visible, $disabled, $readonly);
		})());

		useEffect(() => {
			const monitors: Array<[string, OnChangeEventHandle]> = [];
			if ($model != null) {
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
						| ['$visible', MonitorBoolFunc<T>]
						| ['$disabled', MonitorBoolFunc<T>]
						| ['$readonly', MonitorBoolFunc<T>]
						| ['$change', MonitorChangeFunc<T>]
						| ['$check', MonitorCheckFunc<T>]
					>
				>);
				Object.keys(map).forEach(path => {
					const handles = map[path];
					const originState = {
						visible: stateRef.current.visible,
						disabled: stateRef.current.disabled,
						readonly: stateRef.current.readonly
					};
					const handle = (event: ValueChangedEvent) => {
						const nextOnChange: Array<NextActionOnChange> = [];
						const newState = {visible: false, disabled: false, readonly: false};

						handles.forEach(([type, handle]) => {
							switch (type) {
								case '$visible': {
									// once a handler says it is visible, it is and ignore all other handlers
									newState.visible = newState.visible || handle(event, $model, context);
									break;
								}
								case '$disabled': {
									// once a handler says it is disabled, it is and ignore all other handlers
									newState.disabled = newState.disabled || handle(event, $model, context);
									break;
								}
								case '$readonly': {
									// once a handler says it is readonly, it is and ignore all other handlers
									newState.readonly = newState.readonly || handle(event, $model, context);
									break;
								}
								case '$change': {
									const next = handle(event, $model, context);
									if (next != null) {
										if (Array.isArray(next)) {
											nextOnChange.push(...next);
										} else {
											nextOnChange.push(next);
										}
									}
									break;
								}
								default: {
									// do nothing
									break;
								}
							}

						});

						stateRef.current.visible = newState.visible;
						stateRef.current.disabled = newState.disabled;
						stateRef.current.readonly = newState.readonly;

						if (originState.visible !== stateRef.current.visible
							|| originState.disabled !== stateRef.current.disabled
							|| originState.readonly !== stateRef.current.readonly
							|| nextOnChange.includes('repaint')) {
							context.forceUpdate();
						}
					};

					monitors.push([path, handle]);
				});
				monitors.forEach(([path, handle]) => ERO.on($model, path, handle));
			}

			return () => {
				monitors.forEach(([path, handle]) => ERO.off($model, path, handle));
			};
		}, [$model, $visible, $disabled, $readonly, $change, context]);
		useEffect(() => {
			const originState = {
				visible: stateRef.current.visible,
				disabled: stateRef.current.disabled,
				readonly: stateRef.current.readonly
			};
			const {visible, disabled, readonly} = computeInitDataMonitorState($model, $visible, $disabled, $readonly);
			stateRef.current.visible = visible;
			stateRef.current.disabled = disabled;
			stateRef.current.readonly = readonly;

			if (originState.visible !== stateRef.current.visible
				|| originState.disabled !== stateRef.current.disabled
				|| originState.readonly !== stateRef.current.readonly) {
				context.forceUpdate();
			}
		}, [$model, $visible, $disabled, $readonly, context]);

		// eslint-disable-next-line react-hooks/refs
		return {
			// eslint-disable-next-line react-hooks/refs
			visible: stateRef.current.visible,
			// eslint-disable-next-line react-hooks/refs
			disabled: stateRef.current.disabled,
			// eslint-disable-next-line react-hooks/refs
			readonly: stateRef.current.readonly
		};
	};
