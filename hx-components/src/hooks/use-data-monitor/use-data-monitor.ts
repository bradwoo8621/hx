import {ERO, type OnChangeEventHandle, type ValueChangedEvent} from '@hx/data';
import {useEffect} from 'react';
import {useHxContext} from '../../contexts';
import type {
	DisabledPropValue,
	MonitorBoolFunc,
	MonitorChangeFunc,
	NextActionOnChange,
	ReadonlyPropValue,
	VisiblePropValue
} from '../../types';
import {useFuncResultRef} from '../use-func-result-ref';
import {computeInitDataMonitorState} from './init-data-compute';
import {computeDataMonitors} from './monitor-compute';
import type {UseDataMonitorOptions, UseDataMonitorResult} from './types';

export const useDataMonitor =
	<T extends object>(options: UseDataMonitorOptions<T>): UseDataMonitorResult => {
		const {
			$model,
			$visible, $disabled, $readonly,
			$change
		} = options;

		const context = useHxContext();
		const stateRef = useFuncResultRef(() => {
			return computeInitDataMonitorState($model, $visible, $disabled, $readonly);
		});

		useEffect(() => {
			if ($model == null) {
				return;
			}

			const monitors: Array<[string, OnChangeEventHandle]> = [];

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
				>
			>);
			Object.keys(map).forEach(path => {
				const handle = (event: ValueChangedEvent) => {
					const originState = {
						visible: stateRef.current.visible ?? true,
						disabled: stateRef.current.disabled ?? false,
						readonly: stateRef.current.readonly ?? false
					};

					const nextOnChange: Array<NextActionOnChange> = [];
					const newState = {
						visible: (void 0) as boolean | undefined,
						disabled: (void 0) as boolean | undefined,
						readonly: (void 0) as boolean | undefined
					};

					const handles = map[path];
					handles.forEach(([type, handle]) => {
						switch (type) {
							case '$visible': {
								// once a handler says it is visible, it is and ignore all other handlers
								newState.visible = newState.visible || (handle(event, $model, context) ?? true);
								break;
							}
							case '$disabled': {
								// once a handler says it is disabled, it is and ignore all other handlers
								newState.disabled = newState.disabled || (handle(event, $model, context) ?? false);
								break;
							}
							case '$readonly': {
								// once a handler says it is readonly, it is and ignore all other handlers
								newState.readonly = newState.readonly || (handle(event, $model, context) ?? false);
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

					stateRef.current.visible = newState.visible ?? originState.visible;
					stateRef.current.disabled = newState.disabled ?? originState.disabled;
					stateRef.current.readonly = newState.readonly ?? originState.readonly;

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

			return () => {
				monitors.forEach(([path, handle]) => ERO.off($model, path, handle));
			};
		}, [$model, $visible, $disabled, $readonly, $change, stateRef, context]);
		useEffect(() => {
			const originState = {
				visible: stateRef.current.visible,
				disabled: stateRef.current.disabled,
				readonly: stateRef.current.readonly
			};
			const {visible, disabled, readonly} = computeInitDataMonitorState($model, $visible, $disabled, $readonly);
			const shouldUseComputedValue = (vdr?: VisiblePropValue<T> | DisabledPropValue<T> | ReadonlyPropValue<T>) => {
				if (vdr == null) {
					// not declared, use new value
					return true;
				}
				switch (typeof vdr) {
					case 'boolean':
					case 'function': {
						// declared as simple value or function value, use new value
						return true;
					}
					case 'object':
					default: {
						// not determined, not use
						// or declared as responsive, not use, keep monitoring
						return false;
					}
				}

			};
			stateRef.current.visible = shouldUseComputedValue($visible) ? visible : originState.visible;
			stateRef.current.disabled = shouldUseComputedValue($disabled) ? disabled : originState.disabled;
			stateRef.current.readonly = shouldUseComputedValue($readonly) ? readonly : originState.readonly;

			if (originState.visible !== stateRef.current.visible
				|| originState.disabled !== stateRef.current.disabled
				|| originState.readonly !== stateRef.current.readonly) {
				context.forceUpdate();
			}
		}, [$model, $visible, $disabled, $readonly, stateRef, context]);

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
