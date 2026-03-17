import {ERO} from '@hx/data';
import type {
	ChangePropValue,
	DisabledPropValue,
	HxObject,
	MonitorBoolFunc,
	MonitorCheckFunc,
	MonitorVoidFunc,
	ReadonlyPropValue,
	SuppliedCheckPropValue,
	VisiblePropValue
} from '../../types';

const computeMonitorPaths =
	<T extends object>(
		on: string | Array<string>,
		$model: HxObject<T>,
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
		T extends object,
		D extends ['$visible', VisiblePropValue<T>, MonitorBoolFunc<T>]
			| ['$disabled', DisabledPropValue<T>, MonitorBoolFunc<T>]
			| ['$readonly', ReadonlyPropValue<T>, MonitorBoolFunc<T>]
			| ['$change', ChangePropValue<T>, MonitorVoidFunc<T>]
			| ['$check', SuppliedCheckPropValue<T>, MonitorCheckFunc<T>]
	>(
		$model: HxObject<T>,
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
	<T extends object>(
		$model: HxObject<T>,
		$visible?: VisiblePropValue<T>
	): Array<[Array<string>, '$visible', MonitorBoolFunc<T>]> => {
		return computeMonitors<T, ['$visible', VisiblePropValue<T>, MonitorBoolFunc<T>]>(
			$model, '$visible', $visible
		).map(([path, handle]) => {
			return [path, '$visible', handle];
		});
	};
const computeDisabledMonitors =
	<T extends object>(
		$model: HxObject<T>,
		$disabled?: DisabledPropValue<T>
	): Array<[Array<string>, '$disabled', MonitorBoolFunc<T>]> => {
		return computeMonitors<T, ['$disabled', DisabledPropValue<T>, MonitorBoolFunc<T>]>(
			$model, '$disabled', $disabled
		).map(([path, handle]) => {
			return [path, '$disabled', handle];
		});
	};
const computeReadonlyMonitors =
	<T extends object>(
		$model: HxObject<T>,
		$readonly?: ReadonlyPropValue<T>
	): Array<[Array<string>, '$readonly', MonitorBoolFunc<T>]> => {
		return computeMonitors<T, ['$readonly', ReadonlyPropValue<T>, MonitorBoolFunc<T>]>(
			$model, '$readonly', $readonly
		).map(([path, handle]) => {
			return [path, '$readonly', handle];
		});
	};
const computeChangeMonitors =
	<T extends object>(
		$model: HxObject<T>,
		$change?: ChangePropValue<T>
	): Array<[Array<string>, '$change', MonitorVoidFunc<T>]> => {
		return computeMonitors<T, ['$change', ChangePropValue<T>, MonitorVoidFunc<T>]>(
			$model, '$change', $change
		).map(([path, handle]) => {
			return [path, '$change', handle];
		});
	};
export const computeDataMonitors =
	<T extends object>(
		$model: HxObject<T>,
		$visible?: VisiblePropValue<T>,
		$disabled?: DisabledPropValue<T>,
		$readonly?: ReadonlyPropValue<T>,
		$change?: ChangePropValue<T>
	): Array<
		| [Array<string>, '$visible', MonitorBoolFunc<T>]
		| [Array<string>, '$disabled', MonitorBoolFunc<T>]
		| [Array<string>, '$readonly', MonitorBoolFunc<T>]
		| [Array<string>, '$change', MonitorVoidFunc<T>]
	> => {
		return [
			...computeVisibleMonitors($model, $visible),
			...computeDisabledMonitors($model, $disabled),
			...computeReadonlyMonitors($model, $readonly),
			...computeChangeMonitors($model, $change)
		];
	};
export const computeCheckMonitors =
	<T extends object>(
		$model: HxObject<T>,
		$check?: SuppliedCheckPropValue<T>
	): Array<[Array<string>, '$check', MonitorCheckFunc<T>]> => {
		return computeMonitors<T, ['$check', SuppliedCheckPropValue<T>, MonitorCheckFunc<T>]>(
			$model, '$check', $check
		).map(([path, handle]) => {
			return [path, '$check', handle];
		});
	};
