import type {ModelPath, ReactiveObject} from '@hx/data';

export type HxObject<O = object> = ReactiveObject & O;

export interface ComponentDataProps<T extends object> {
	$model: HxObject<T>,
}

/** sample of single field */
export interface ComponentDataSingleFieldProps<T extends object> extends ComponentDataProps<T> {
	$field: ModelPath<T>;
}

/** sample of dual fields */
export interface ComponentDataDualFieldsProps<T extends object> extends ComponentDataProps<T> {
	$field1: ModelPath<T>;
	$field2: ModelPath<T>;
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
