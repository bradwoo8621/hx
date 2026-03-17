import type {DataPath} from './data';
import type {MonitorVoidFunc} from './monitor-funcs';

export interface DynamicChange<T extends object> {
	on: DataPath | Array<DataPath>;
	handle: MonitorVoidFunc<T>;
}

export type ChangePropValue<T extends object> =
	| DynamicChange<T>
	| Array<DynamicChange<T>>;

export interface ChangeProps<T extends object> {
	$change?: ChangePropValue<T>;
}
