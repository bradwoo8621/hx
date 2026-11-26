import type {ReactNode} from 'react';
import type {HxDataPath} from './data';
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

export type CheckScope = string;
/** this check rule will be invoked on any check scope */
export const AnyCheckScope: CheckScope = '$$AnyCS';
/** this check rule will be invoked on no specified check scope given */
export const UnspecifiedCheckScope: CheckScope = '$$UnsCS';

export interface DynamicCheck<T extends object> {
	/**
	 * monitor itself when on is not given
	 */
	on?: HxDataPath | Array<HxDataPath>;
	handle: MonitorCheckFunc<T>;
	/**
	 * Defines the check scopes. Only manual check dispatches honor this
	 * definition; checks caused by value changes ignore this property.
	 *
	 * e.g.
	 * 1. {@link AnyCheckScope} -> same as not defining it: any manual check
	 * dispatch, whether it specifies scopes or not, invokes this rule
	 * 2. {@link UnspecifiedCheckScope} -> a manual check dispatch invokes this
	 * rule only when it specifies no scope
	 * 3. any other string (non-empty) -> a manual check dispatch invokes this
	 * rule only when it includes the same scope
	 * 4. (2) + (3)
	 *
	 * @see AnyCheckScope
	 * @see UnspecifiedCheckScope
	 */
	scopes?: CheckScope | Array<CheckScope>;
}

export type CheckPropValue<T extends object> = DynamicCheck<T>;

export interface CheckProps<T extends object> {
	$check?: CheckPropValue<T>;
}

export type SuppliedCheckPropValue<T extends object> = WithRequired<DynamicCheck<T>, 'on'>;
