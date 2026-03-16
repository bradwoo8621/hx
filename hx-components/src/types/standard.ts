import type {ReactiveObject} from '@hx/data';
import type {ChangeProps} from './change';
import type {ComponentDataDualFieldsProps, ComponentDataSingleFieldProps} from './data';
import type {DisabledProps} from './disabled';
import type {VisibleProps} from './visible';

export interface StdProps<T extends object>
	extends VisibleProps<ReactiveObject & T>, ChangeProps<ReactiveObject & T> {
}

export interface StdSingleFieldProps<T extends object>
	extends ComponentDataSingleFieldProps<T>, StdProps<T> {
}

export interface EditProps<T extends object>
	extends StdProps<T>, DisabledProps<ReactiveObject & T> {
}

export interface EditSingleFieldProps<T extends object>
	extends ComponentDataSingleFieldProps<T>, EditProps<T> {
}

export interface EditDualFieldsProps<T extends object>
	extends ComponentDataDualFieldsProps<T>, EditProps<T> {
}
