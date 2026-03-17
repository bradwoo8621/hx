import type {ValueChangedEvent} from '@hx/data';
import type {DispatchWithoutAction} from 'react';
import type {HxContext} from '../contexts';
import type {HxObject} from './data.ts';

/**
 * func to compute default value
 */
export type DefaultFunc<T extends object, R> = (model: HxObject<T>) => R;
/**
 * func to compute default boolean value
 */
export type DefaultBoolFunc<T extends object> = DefaultFunc<T, boolean>;

/**
 * monitor func which will return something, to returned value will be handled automatically.
 * refer to `useDataMonitor`.
 */
export type MonitorFunc<T extends object, R> = (event: ValueChangedEvent, model: HxObject<T>, context: HxContext) => R;
/**
 * monitor func which will return boolean, to returned value will be handled automatically.
 * refer to `useDataMonitor`.
 */
export type MonitorBoolFunc<T extends object> = MonitorFunc<T, boolean>;
/**
 * monitor func when has `forceUpdate` as a parameter, and return void
 */
export type MonitorVoidFunc<T extends object> = (event: ValueChangedEvent, model: HxObject<T>, context: HxContext, forceUpdate: DispatchWithoutAction) => void;
