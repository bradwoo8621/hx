import type {ReactiveObject} from '@hx/data';
import type {ComponentDataDualFieldsProps, ComponentDataSingleFieldProps} from './data';
import type {DisabledProps} from './disabled';
import type {VisibleProps} from './visible';

export interface StdProps<T extends object>
	extends VisibleProps<ReactiveObject & T>, DisabledProps<ReactiveObject & T> {
}

export interface StdSingleFieldProps<T extends object>
	extends ComponentDataSingleFieldProps<T>, StdProps<T> {
}

export interface StdDualFieldsProps<T extends object>
	extends ComponentDataDualFieldsProps<T>, StdProps<T> {
}