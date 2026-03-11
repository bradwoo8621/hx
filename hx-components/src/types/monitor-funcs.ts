import type {ReactiveObject, ValueChangedEvent} from '@hx/data';

export type DefaultFunc<M extends ReactiveObject & object, R> = (model: M) => R;
export type DefaultBoolFunc<M extends ReactiveObject & object> = DefaultFunc<M, boolean>;

export type MonitorFunc<M extends ReactiveObject & object, R> = (event: ValueChangedEvent, model: M) => R;
export type MonitorBoolFunc<M extends ReactiveObject & object> = MonitorFunc<M, boolean>;
export type MonitorVoidFunc<M extends ReactiveObject & object> = MonitorFunc<M, void>;
