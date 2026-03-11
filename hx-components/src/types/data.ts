import type {ModelPath, ReactiveObject} from '@hx/data';

export interface ComponentDataProps<M extends ReactiveObject & object> {
	$model: M,
}

/** sample of single field */
export interface ComponentDataSingleFieldProps<M extends object> extends ComponentDataProps<ReactiveObject & M> {
	$field: ModelPath<M>;
}

/** sample of dual fields */
export interface ComponentDataDualFieldsProps<M extends object> extends ComponentDataProps<ReactiveObject & M> {
	$field1: ModelPath<M>;
	$field2: ModelPath<M>;
}

/**
 * a valid path of could be
 * - "a"
 * - "a.b"
 * - "a.b.[0]",
 * - "a.b.[0].[1]"
 * - "a.b.[0].[1].c"
 */
export type RelativeDataPath = string;
export type AbsoluteDataPath = `/${RelativeDataPath}`;
export type DataPath = AbsoluteDataPath | RelativeDataPath;