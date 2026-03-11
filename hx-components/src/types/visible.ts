import type {ReactiveObject} from '@hx/data';
import type {DataPath} from './data';
import type {DefaultBoolFunc, MonitorBoolFunc} from './monitor-funcs';

export interface DynamicVisible<M extends ReactiveObject & object> {
	on: DataPath | Array<DataPath>;
	handle: MonitorBoolFunc<M>;
	default?: boolean | DefaultBoolFunc<M>;
}

export type VisiblePropValue<M extends ReactiveObject & object> =
	| boolean | DefaultBoolFunc<M>
	| DynamicVisible<M>;

export interface VisibleProps<M extends ReactiveObject & object> {
	$visible?: VisiblePropValue<M>;
}
