import type {ModelPath, ReactiveObject} from '@hx/data';

export interface ComponentDataProps<T extends ReactiveObject & object> {
	$model: T,
}

/** sample of single field */
export interface ComponentDataSingleFieldProps<T extends ReactiveObject & object> extends ComponentDataProps<T> {
	$field: ModelPath<T>;
}

/** sample of dual fields */
export interface ComponentDataDualFieldsProps<T extends ReactiveObject & object> extends ComponentDataProps<T> {
	$field1: ModelPath<T>;
	$field2: ModelPath<T>;
}
