import type {DataPath} from './data';
import type {DefaultBoolFunc, MonitorBoolFunc} from './monitor-funcs';

/**
 * - monitor the given paths with "on",
 * - compute readonly by "handle"
 * - default readonly computed by "default"
 */
export interface DynamicReadonly<T extends object> {
	on: DataPath | Array<DataPath>;
	handle: MonitorBoolFunc<T>;
	default?: boolean | DefaultBoolFunc<T>;
}

export type ReadonlyPropValue<T extends object> =
	| boolean | DefaultBoolFunc<T>
	| DynamicReadonly<T>;

export interface ReadonlyProps<T extends object> {
	$readonly?: ReadonlyPropValue<T>;
}
