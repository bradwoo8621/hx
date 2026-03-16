import {ERO, type ReactiveObject} from '@hx/data';
import type {
	ChangePropValue,
	DisabledPropValue,
	MonitorBoolFunc,
	MonitorVoidFunc,
	ReadonlyPropValue,
	VisiblePropValue
} from '../../types';

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
			| ['$change', ChangePropValue<M>, MonitorVoidFunc<M>]
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
		$change?: ChangePropValue<M>
	): Array<[Array<string>, '$change', MonitorVoidFunc<M>]> => {
		return computeMonitors<M, ['$change', ChangePropValue<M>, MonitorVoidFunc<M>]>(
			$model, '$change', $change
		).map(([path, handle]) => {
			return [path, '$change', handle];
		});
	};
export const computeDataMonitors =
	<M extends ReactiveObject & object>(
		$model: M,
		$visible?: VisiblePropValue<M>,
		$disabled?: DisabledPropValue<M>,
		$readonly?: ReadonlyPropValue<M>,
		$change?: ChangePropValue<M>
	): Array<
		| [Array<string>, '$visible', MonitorBoolFunc<M>]
		| [Array<string>, '$disabled', MonitorBoolFunc<M>]
		| [Array<string>, '$readonly', MonitorBoolFunc<M>]
		| [Array<string>, '$change', MonitorVoidFunc<M>]
	> => {
		return [
			...computeVisibleMonitors($model, $visible),
			...computeDisabledMonitors($model, $disabled),
			...computeReadonlyMonitors($model, $readonly),
			...computeChangeMonitors($model, $change)
		];
	};
