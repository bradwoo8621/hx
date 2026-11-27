import type {ReactNode} from 'react';
import type {HxDataPath, HxRelativeDataPath} from './data';
import type {MonitorFunc} from './monitor-funcs';

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

export type CheckScope = string;
/** this check rule will be invoked on any check scope */
export const AnyCheckScope: CheckScope = '$$AnyCS';
/** field name of manual check's value changed event, since no value changed there */
export const ManualCheckField: HxRelativeDataPath = '$$ManualCheckFakeField';

export interface DynamicCheck<T extends object> {
	/**
	 * - monitor given on paths
	 * - or check the {@link HxWithCheckCreateOptions.$supplyOn} when on is not provided,
	 * - or just declare a check rule which only invoked on manually check stage when no on and $supplyOn
	 */
	on?: HxDataPath | Array<HxDataPath>;
	/**
	 * note the event accepted from manually check by with check context is not same as value changed,
	 * it uses {@link ManualCheckField} as field name, and with old/new value as undefined.
	 */
	handle: MonitorCheckFunc<T>;
	/**
	 * Defines the check scopes. Only manual check dispatches honor this
	 * definition; checks caused by value changes ignore this property.
	 *
	 * e.g.
	 * 1. {@link AnyCheckScope} -> same as not defining it: any manual check
	 * dispatch, whether it specifies scopes or not, invokes this rule
	 * 2. any other string (non-empty) -> a manual check dispatch invokes this
	 * rule only when it includes the same scope
	 *
	 * @see AnyCheckScope
	 */
	scopes?: CheckScope | Array<CheckScope>;
}

export type CheckPropValue<T extends object> = DynamicCheck<T>;

export interface CheckProps<T extends object> {
	$check?: CheckPropValue<T>;
}
