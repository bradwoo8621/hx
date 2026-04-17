import type {ReactNode} from 'react';
import type {HxContext} from '../../contexts';
import type {DisabledPropValue, HxDataPath, HxObject} from '../../types';

/**
 * Single select option item
 * @template V - Type of the option value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface HxSelectOption<V = any, T extends object = object> {
	/** Unique value for this option */
	value: V;
	/** Display label for the option */
	label: ReactNode;
	$disabled?: DisabledPropValue<T>;
}

/**
 * Select options source: can be static array, sync function, or async function
 * @template T - Type of the form model object
 * @template V - Type of the option values
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HxSelectOptions<T extends object, V = any> =
	| Array<HxSelectOption<V>>
	| ((model: HxObject<T> | null | undefined, context: HxContext) => Array<HxSelectOption<V>>)
	| ((model: HxObject<T> | null | undefined, context: HxContext) => Promise<Array<HxSelectOption<V>>>);

export interface HxSelectOptionsProps<T extends object> {
	/** Options data source for the select dropdown */
	options: HxSelectOptions<T>;
	/** Options data needs to be refreshed when any changes occurred on given data paths */
	optionsDependsOn?: HxDataPath | Array<HxDataPath>;
	/**
	 * when options changed (the first loading is not counted)
	 * - clear: clear value to null (remove the value property)
	 * - custom function: use the returned option as new value (or clear if returns undefined)
	 *   nothing happened if the returned option has current value.
	 */
	onOptionsChange?: 'none' | 'clear' | ((options: Array<HxSelectOption>) => HxSelectOption | undefined);
	$model?: HxObject<T>,
}
