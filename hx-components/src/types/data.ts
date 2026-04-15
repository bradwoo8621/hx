import type {ModelPath, ReactiveObject} from '@hx/data';

export type HxObject<O = object> = ReactiveObject & O;
/**
 * a valid relative path could be
 * - "a"
 * - "a.b"
 * - "a.b.[0]",
 * - "a.b.[0].[1]"
 * - "a.b.[0].[1].c"
 */
export type RelativeDataPath = string;
/**
 * a valid do notation path could be
 * - "./a"
 * - "../a"
 * - "././a.b"
 * - "./../a.b"
 * - ".././a.b
 */
export type DotNotationDataPath = `./${RelativeDataPath}` | `../${RelativeDataPath}`;
export type AbsoluteDataPath = `/${RelativeDataPath}`;
export type DataPath = AbsoluteDataPath | DotNotationDataPath | RelativeDataPath;

export interface ComponentDataProps<T extends object> {
	$model: HxObject<T>,
}

/** sample of single field */
export interface ComponentDataSingleFieldProps<T extends object> extends ComponentDataProps<T> {
	/** basically if path is dot notation or absolute, then check is ignored */
	$field: ModelPath<T> | DataPath;
}

/** sample of dual fields */
export interface ComponentDataDualFieldsProps<T extends object> extends ComponentDataProps<T> {
	/** basically if path is dot notation or absolute, then check is ignored */
	$field1: ModelPath<T> | DataPath;
	/** basically if path is dot notation or absolute, then check is ignored */
	$field2: ModelPath<T> | DataPath;
}
