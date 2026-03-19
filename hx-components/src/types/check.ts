import type {ReactNode} from 'react';
import type {DataPath} from './data';
import type {MonitorFunc} from './monitor-funcs';
import type {WithRequired} from './utils';

export interface CheckResultWithLevel {
	level: 'warn' | 'error';
	message: ReactNode;
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
export type MonitorCheckFunc<T extends object> = MonitorFunc<T, CheckResult>;

export interface DynamicCheck<T extends object> {
	/**
	 * monitor itself when on is not given
	 */
	on?: DataPath | Array<DataPath>;
	handle: MonitorCheckFunc<T>;
}

export type CheckPropValue<T extends object> =
	| DynamicCheck<T>
	| Array<DynamicCheck<T>>;

export interface CheckProps<T extends object> {
	$check?: CheckPropValue<T>;
}

export type SuppliedCheckPropValue<T extends object> =
	| WithRequired<DynamicCheck<T>, 'on'>
	| Array<WithRequired<DynamicCheck<T>, 'on'>>
