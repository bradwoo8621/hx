import type {ReactiveObject, ValueChangedEvent} from '@hx/data';
import type {DispatchWithoutAction} from 'react';
import type {HxContext} from '../contexts';

/**
 * func to compute default value
 */
export type DefaultFunc<M extends ReactiveObject & object, R> = (model: M) => R;
/**
 * func to compute default boolean value
 */
export type DefaultBoolFunc<M extends ReactiveObject & object> = DefaultFunc<M, boolean>;

/**
 * monitor func which will return something, to returned value will be handled automatically.
 * refer to `useDataMonitor`.
 */
export type MonitorFunc<M extends ReactiveObject & object, R> = (event: ValueChangedEvent, model: M, context: HxContext) => R;
/**
 * monitor func which will return boolean, to returned value will be handled automatically.
 * refer to `useDataMonitor`.
 */
export type MonitorBoolFunc<M extends ReactiveObject & object> = MonitorFunc<M, boolean>;
/**
 * monitor func when has `forceUpdate` as a parameter, and return void
 */
export type MonitorVoidFunc<M extends ReactiveObject & object> = (event: ValueChangedEvent, model: M, context: HxContext, forceUpdate: DispatchWithoutAction) => void;
