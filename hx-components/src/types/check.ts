import type {ReactiveObject} from '@hx/data';
import type {DataPath} from './data';
import type {MonitorVoidFunc} from './monitor-funcs';

export interface DynamicCheck<M extends ReactiveObject & object> {
	on: DataPath | Array<DataPath>;
	handle: MonitorVoidFunc<M>;
}

export type CheckPropValue<M extends ReactiveObject & object> =
	| DynamicCheck<M>
	| Array<DynamicCheck<M>>;

export interface CheckProps<M extends ReactiveObject & object> {
	$check?: CheckPropValue<M>;
}
