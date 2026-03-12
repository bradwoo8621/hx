import type {ReactiveObject} from '@hx/data';
import type {DataPath} from './data';
import type {DefaultBoolFunc, MonitorBoolFunc} from './monitor-funcs';

/**
 * - monitor the given paths with "on",
 * - compute enablement by "handle"
 * - default enablement computed by "default"
 */
export interface DynamicDisabled<M extends ReactiveObject & object> {
	on: DataPath | Array<DataPath>;
	handle: MonitorBoolFunc<M>;
	default?: boolean | DefaultBoolFunc<M>;
}

export type DisabledPropValue<M extends ReactiveObject & object> =
	| boolean | DefaultBoolFunc<M>
	| DynamicDisabled<M>;

export interface DisabledProps<M extends ReactiveObject & object> {
	$disabled?: DisabledPropValue<M>;
}
