import type {ChangeProps} from './change';
import type {HxComponentDataDualFieldsProps, HxComponentDataSingleFieldProps} from './data';
import type {DisabledProps} from './disabled';
import type {VisibleProps} from './visible';

export interface HxStdProps<T extends object>
	extends VisibleProps<T>, ChangeProps<T> {
}

export interface HxStdSingleFieldProps<T extends object>
	extends HxComponentDataSingleFieldProps<T>, HxStdProps<T> {
}

export interface HxEditProps<T extends object>
	extends HxStdProps<T>, DisabledProps<T> {
}

export interface HxEditSingleFieldProps<T extends object>
	extends HxComponentDataSingleFieldProps<T>, HxEditProps<T> {
}

// noinspection JSUnusedGlobalSymbols
export interface HxEditDualFieldsProps<T extends object>
	extends HxComponentDataDualFieldsProps<T>, HxEditProps<T> {
}
