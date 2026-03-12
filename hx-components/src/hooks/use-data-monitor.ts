import {ERO, type OnChangeEventHandle, type ReactiveObject, type ValueChangedEvent} from '@hx/data';
import {useEffect, useRef} from 'react';
import {useHxContext} from '../contexts';
import type {
	ChangeMonitorProps,
	ChangeMonitorPropValue,
	ComponentDataProps,
	DefaultBoolFunc,
	DisabledProps,
	DisabledPropValue,
	MonitorBoolFunc,
	MonitorVoidFunc,
	ReadonlyProps,
	ReadonlyPropValue,
	VisibleProps,
	VisiblePropValue
} from '../types';
import {useForceUpdate} from './use-force-update';

export type UseDataMonitorOptions<M extends ReactiveObject & object> =
	& ComponentDataProps<M>
	& VisibleProps<M>
	& DisabledProps<M>
	& ReadonlyProps<M>
	& ChangeMonitorProps<M>;

export interface UseDataMonitorResult {
	visible: boolean;
	disabled: boolean;
	readonly: boolean;
}

interface DataMonitorState {
	visible: boolean;
	disabled: boolean;
	readonly: boolean;
}

const computeInitBooleanState = <M extends ReactiveObject & object>(
	$model: M,
	defaultValue: boolean,
	defName: '$visible' | '$disabled' | '$readonly',
	$def?: VisiblePropValue<M> | DisabledPropValue<M> | ReadonlyPropValue<M>
): boolean => {
	let value: boolean = defaultValue;
	if ($def != null) {
		switch (typeof $def) {
			case 'boolean': {
				value = $def;
				break;
			}
			case 'function': {
				try {
					value = $def($model);
				} catch (e) {
					console.error(`Failed to invoke ${defName} function, and value is treated as ${defaultValue}.`, $def, e);
				}
				break;
			}
			case 'object': {
				const {default: defaultFunc} = $def;
				if (defaultFunc != null) {
					const typeOfDefaultFunc = typeof defaultFunc;
					if (typeOfDefaultFunc === 'boolean') {
						value = defaultFunc as boolean;
					} else if (typeOfDefaultFunc !== 'function') {
						console.error(`${defName}.default is not a function, and value is treated as ${defaultValue}.`, $def);
					} else {
						try {
							value = (defaultFunc as DefaultBoolFunc<M>)($model);
						} catch (e) {
							console.error(`Failed to invoke ${defName}.default function, and value is treated as ${defaultValue}.`, $def, e);
						}
					}
				}
				break;
			}
			default: {
				// never happen, treated as true
				console.error(`Type of ${defName} is not supported, and value is treated as ${defaultValue}.`, $def);
				break;
			}
		}
	}
	return value;
};
const computeInitVisibleState =
	<M extends ReactiveObject & object>(
		$model: M,
		$visible?: VisiblePropValue<M>
	): boolean => {
		return computeInitBooleanState($model, true, '$visible', $visible);
	};
const computeInitDisabledState =
	<M extends ReactiveObject & object>(
		$model: M,
		$disabled?: DisabledPropValue<M>
	): boolean => {
		return computeInitBooleanState($model, false, '$disabled', $disabled);
	};
const computeInitReadonlyState =
	<M extends ReactiveObject & object>(
		$model: M,
		$readonly?: ReadonlyPropValue<M>
	): boolean => {
		return computeInitBooleanState($model, false, '$readonly', $readonly);
	};
const computeInitDataMonitorState =
	<M extends ReactiveObject & object>(
		$model: M,
		$visible?: VisiblePropValue<M>,
		$disabled?: DisabledPropValue<M>,
		$readonly?: ReadonlyPropValue<M>
	): DataMonitorState => {
		return {
			visible: computeInitVisibleState($model, $visible),
			disabled: computeInitDisabledState($model, $disabled),
			readonly: computeInitReadonlyState($model, $readonly)
		};
	};

const computeMonitorPaths =
	<M extends ReactiveObject & object>(
		on: string | Array<string>,
		$model: M,
		def: any
	): Array<string> => {
		const paths: Array<string> = [];
		if (typeof on === 'string') {
			if (on.length === 0) {
			} else if (on.startsWith('/')) {
				// starts with "/", it is path to root
				if (on.length === 1) {
					console.error('Path "/" is not accepted, no observer created.', def);
				} else {
					paths.push(on.substring(1));
				}
			} else {
				paths.push(ERO.pathOf($model, on));
			}
		} else if (Array.isArray(on)) {
			on.forEach(on => {
				if (on == null) {
					console.error('Null path is abandoned.', def);
					return;
				}
				// noinspection SuspiciousTypeOfGuard
				if (typeof on !== 'string') {
					console.error('Non-string path is abandoned.', def);
				} else if (on.length === 0) {
					console.error('Empty path is abandoned.', def);
				} else if (on.startsWith('/')) {
					// starts with "/", it is path to root
					if (on.length === 1) {
						console.error('Path "/" is not accepted, no observer created.', def);
					} else {
						paths.push(on.substring(1));
					}
				} else {
					paths.push(ERO.pathOf($model, on));
				}
			});
		}
		if (paths.length === 0) {
			console.error('No monitor path defined, no observer created.', def);
		}
		return paths;
	};
const computeMonitors =
	<
		M extends ReactiveObject & object,
		D extends ['$visible', VisiblePropValue<M>, MonitorBoolFunc<M>]
			| ['$disabled', DisabledPropValue<M>, MonitorBoolFunc<M>]
			| ['$readonly', ReadonlyPropValue<M>, MonitorBoolFunc<M>]
			| ['$changeMonitor', ChangeMonitorPropValue<M>, MonitorVoidFunc<M>]
	>(
		$model: M,
		defName: D[0],
		$def?: D[1]
	): Array<[Array<string>, D[2]]> => {
		const monitors: Array<[Array<string>, D[2]]> = [];
		if ($def != null) {
			switch (typeof $def) {
				case 'boolean':
				case 'function': {
					// for default value, ignore
					break;
				}
				case 'object': {
					const handleDef = (on: string | Array<string>, handle: D[2]) => {
						if (handle == null) {
							console.error('No monitor handler defined, no observer created.', $def);
						} else if (typeof handle !== 'function') {
							console.error('Monitor handler is not a function, no observer created.', $def);
						} else {
							const paths = computeMonitorPaths(on, $model, $def);
							monitors.push([paths, handle]);
						}
					};
					if (Array.isArray($def)) {
						$def.forEach(({on, handle}) => handleDef(on, handle));
					} else {
						handleDef($def.on, $def.handle);
					}
					break;
				}
				default: {
					// never happen, treated as true
					console.error(`Type of ${defName} is not supported, no monitor created.`, $def);
					break;
				}
			}
		}
		return monitors;
	};
const computeVisibleMonitors =
	<M extends ReactiveObject & object>(
		$model: M,
		$visible?: VisiblePropValue<M>
	): Array<[Array<string>, '$visible', MonitorBoolFunc<M>]> => {
		return computeMonitors<M, ['$visible', VisiblePropValue<M>, MonitorBoolFunc<M>]>(
			$model, '$visible', $visible
		).map(([path, handle]) => {
			return [path, '$visible', handle];
		});
	};
const computeDisabledMonitors =
	<M extends ReactiveObject & object>(
		$model: M,
		$disabled?: DisabledPropValue<M>
	): Array<[Array<string>, '$disabled', MonitorBoolFunc<M>]> => {
		return computeMonitors<M, ['$disabled', DisabledPropValue<M>, MonitorBoolFunc<M>]>(
			$model, '$disabled', $disabled
		).map(([path, handle]) => {
			return [path, '$disabled', handle];
		});
	};
const computeReadonlyMonitors =
	<M extends ReactiveObject & object>(
		$model: M,
		$readonly?: ReadonlyPropValue<M>
	): Array<[Array<string>, '$readonly', MonitorBoolFunc<M>]> => {
		return computeMonitors<M, ['$readonly', ReadonlyPropValue<M>, MonitorBoolFunc<M>]>(
			$model, '$readonly', $readonly
		).map(([path, handle]) => {
			return [path, '$readonly', handle];
		});
	};
const computeChangeMonitors =
	<M extends ReactiveObject & object>(
		$model: M,
		$changeMonitor?: ChangeMonitorPropValue<M>
	): Array<[Array<string>, '$changeMonitor', MonitorVoidFunc<M>]> => {
		return computeMonitors<M, ['$changeMonitor', ChangeMonitorPropValue<M>, MonitorVoidFunc<M>]>(
			$model, '$changeMonitor', $changeMonitor
		).map(([path, handle]) => {
			return [path, '$changeMonitor', handle];
		});
	};
const computeDataMonitors =
	<M extends ReactiveObject & object>(
		$model: M,
		$visible?: VisiblePropValue<M>,
		$disabled?: DisabledPropValue<M>,
		$readonly?: ReadonlyPropValue<M>,
		$changeMonitor?: ChangeMonitorPropValue<M>
	): Array<
		| [Array<string>, '$visible', MonitorBoolFunc<M>]
		| [Array<string>, '$disabled', MonitorBoolFunc<M>]
		| [Array<string>, '$readonly', MonitorBoolFunc<M>]
		| [Array<string>, '$changeMonitor', MonitorVoidFunc<M>]
	> => {
		return [
			...computeVisibleMonitors($model, $visible),
			...computeDisabledMonitors($model, $disabled),
			...computeReadonlyMonitors($model, $readonly),
			...computeChangeMonitors($model, $changeMonitor)
		];
	};

export const useDataMonitor =
	<M extends ReactiveObject & object>(options: UseDataMonitorOptions<M>): UseDataMonitorResult => {
		const {
			$model,
			$visible, $disabled, $readonly,
			$changeMonitor
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
				$changeMonitor
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
					| ['$changeMonitor', MonitorVoidFunc<M>]
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
							case '$changeMonitor': {
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
			$changeMonitor
		]);

		return {
			visible: stateRef.current.visible,
			disabled: stateRef.current.disabled,
			readonly: stateRef.current.readonly
		};
	};
