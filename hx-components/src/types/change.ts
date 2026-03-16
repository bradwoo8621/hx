import type {ReactiveObject} from '@hx/data';
import type {DataPath} from './data';
import type {MonitorVoidFunc} from './monitor-funcs';

export interface DynamicChange<M extends ReactiveObject & object> {
	on: DataPath | Array<DataPath>;
	handle: MonitorVoidFunc<M>;
}

export type ChangePropValue<M extends ReactiveObject & object> =
	| DynamicChange<M>
	| Array<DynamicChange<M>>;

export interface ChangeProps<M extends ReactiveObject & object> {
	$changeMonitor?: ChangePropValue<M>;
}
