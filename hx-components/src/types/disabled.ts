import type {ReactiveObject} from '@hx/data';
import type {DataPath} from './data';
import type {DynamicReadonly} from './readonly.ts';
import type {DefaultBoolFunc, MonitorBoolFunc} from './types';

export interface DynamicDisabled<M extends ReactiveObject & object> {
	on: DataPath | Array<DataPath>;
	handle: MonitorBoolFunc<M>;
	default?: boolean | DefaultBoolFunc<M>;
}

export type DisabledPropValue<M extends ReactiveObject & object> =
	| boolean | MonitorBoolFunc<M>
	| DynamicReadonly<M>;

export interface DisabledProps<M extends ReactiveObject & object> {
	$disabled?: DisabledPropValue<M>;
}
