import type {ReactiveObject} from '@hx/data';
import type {DataPath} from './data';
import type {MonitorVoidFunc} from './monitor-funcs.ts';

export interface DynamicChangeMonitor<M extends ReactiveObject & object> {
	on: DataPath | Array<DataPath>;
	handle: MonitorVoidFunc<M>;
}

export type ChangeMonitorPropValue<M extends ReactiveObject & object> = DynamicChangeMonitor<M>;

export interface ChangeMonitorProps<M extends ReactiveObject & object> {
	$changeMonitor?: ChangeMonitorPropValue<M>;
}
