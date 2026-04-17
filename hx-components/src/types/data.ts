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
export type HxRelativeDataPath = string;
/**
 * a valid do notation path could be
 * - "./a"
 * - "../a"
 * - "././a.b"
 * - "./../a.b"
 * - ".././a.b
 */
export type HxDotNotationDataPath = `./${HxRelativeDataPath}` | `../${HxRelativeDataPath}`;
export type HxAbsoluteDataPath = `/${HxRelativeDataPath}`;
export type HxDataPath = HxAbsoluteDataPath | HxDotNotationDataPath | HxRelativeDataPath;

export interface HxComponentDataProps<T extends object> {
	$model: HxObject<T>,
}

/** sample of single field */
export interface HxComponentDataSingleFieldProps<T extends object> extends HxComponentDataProps<T> {
	/** basically if path is dot notation or absolute, then check is ignored */
	$field: ModelPath<T> | HxDataPath;
}

/** sample of dual fields */
export interface HxComponentDataDualFieldsProps<T extends object> extends HxComponentDataProps<T> {
	/** basically if path is dot notation or absolute, then check is ignored */
	$field1: ModelPath<T> | HxDataPath;
	/** basically if path is dot notation or absolute, then check is ignored */
	$field2: ModelPath<T> | HxDataPath;
}
