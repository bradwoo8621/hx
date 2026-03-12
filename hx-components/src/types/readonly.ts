import type {ReactiveObject} from '@hx/data';
import type {DataPath} from './data';
import type {DefaultBoolFunc, MonitorBoolFunc} from './monitor-funcs';

/**
 * - monitor the given paths with "on",
 * - compute readonly by "handle"
 * - default readonly computed by "default"
 */
export interface DynamicReadonly<M extends ReactiveObject & object> {
	on: DataPath | Array<DataPath>;
	handle: MonitorBoolFunc<M>;
	default?: boolean | DefaultBoolFunc<M>;
}

export type ReadonlyPropValue<M extends ReactiveObject & object> =
	| boolean | DefaultBoolFunc<M>
	| DynamicReadonly<M>;

export interface ReadonlyProps<M extends ReactiveObject & object> {
	$readonly?: ReadonlyPropValue<M>;
}
