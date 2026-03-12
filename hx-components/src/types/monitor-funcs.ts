import type {ReactiveObject, ValueChangedEvent} from '@hx/data';
import type {DispatchWithoutAction} from 'react';
import type {HxContext} from '../contexts';

export type DefaultFunc<M extends ReactiveObject & object, R> = (model: M) => R;
export type DefaultBoolFunc<M extends ReactiveObject & object> = DefaultFunc<M, boolean>;

export type MonitorBoolFunc<M extends ReactiveObject & object> = (event: ValueChangedEvent, model: M, context: HxContext) => boolean;
export type MonitorVoidFunc<M extends ReactiveObject & object> = (event: ValueChangedEvent, model: M, context: HxContext, forceUpdate: DispatchWithoutAction) => void;
