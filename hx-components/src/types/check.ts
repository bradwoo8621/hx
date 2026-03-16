import type {ReactiveObject} from '@hx/data';
import type {DataPath} from './data';
import type {MonitorFunc} from './monitor-funcs';

export interface CheckResultWithLevel {
	level: 'warn' | 'error';
	message: string;
}

/**
 * - undefined means pass the check,
 * - string means error message,
 * - object means message with level (warn or error)
 */
export type CheckResult = CheckResultWithLevel | string | undefined;

/**
 * monitor func which will return boolean, to returned value will be handled automatically.
 * refer to `useDataMonitor`.
 */
export type MonitorCheckFunc<M extends ReactiveObject & object> = MonitorFunc<M, CheckResult>;

export interface DynamicCheck<M extends ReactiveObject & object> {
	on: DataPath | Array<DataPath>;
	handle: MonitorCheckFunc<M>;
}

export type CheckPropValue<M extends ReactiveObject & object> =
	| DynamicCheck<M>
	| Array<DynamicCheck<M>>;

export interface CheckProps<M extends ReactiveObject & object> {
	$check?: CheckPropValue<M>;
}
