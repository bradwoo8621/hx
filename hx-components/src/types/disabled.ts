import type {DataPath} from './data';
import type {DefaultBoolFunc, MonitorBoolFunc} from './monitor-funcs';

/**
 * - monitor the given paths with "on",
 * - compute enablement by "handle"
 * - default enablement computed by "default"
 */
export interface DynamicDisabled<T extends object> {
	on: DataPath | Array<DataPath>;
	handle: MonitorBoolFunc<T>;
	default?: boolean | DefaultBoolFunc<T>;
}

export type DisabledPropValue<T extends object> =
	| boolean | DefaultBoolFunc<T>
	| DynamicDisabled<T>;

export interface DisabledProps<T extends object> {
	$disabled?: DisabledPropValue<T>;
}
