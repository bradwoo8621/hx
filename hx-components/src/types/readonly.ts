import type {ReactiveObject} from '@hx/data';
import type {DataPath} from './data';
import type {DefaultBoolFunc, MonitorBoolFunc} from './monitor-funcs.ts';

export interface DynamicReadonly<M extends ReactiveObject & object> {
	on: DataPath | Array<DataPath>;
	handle: MonitorBoolFunc<M>;
	default?: boolean | DefaultBoolFunc<M>;
}

export type ReadonlyPropValue<M extends ReactiveObject & object> =
	| boolean | MonitorBoolFunc<M>
	| DynamicReadonly<M>;

export interface ReadonlyProps<M extends ReactiveObject & object> {
	$readonly?: ReadonlyPropValue<M>;
}
