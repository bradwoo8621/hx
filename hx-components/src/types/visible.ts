import type {DataPath} from './data';
import type {DefaultBoolFunc, MonitorBoolFunc} from './monitor-funcs';

/**
 * - monitor the given paths with "on",
 * - compute visible by "handle"
 * - default visibility computed by "default"
 */
export interface DynamicVisible<T extends object> {
	on: DataPath | Array<DataPath>;
	handle: MonitorBoolFunc<T>;
	default?: boolean | DefaultBoolFunc<T>;
}

export type VisiblePropValue<T extends object> =
	| boolean | DefaultBoolFunc<T>
	| DynamicVisible<T>;

export interface VisibleProps<T extends object> {
	$visible?: VisiblePropValue<T>;
}
