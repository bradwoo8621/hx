import type {ReactiveObject} from '@hx/data';
import type {DefaultBoolFunc, DisabledPropValue, ReadonlyPropValue, VisiblePropValue} from '../../types';
import type {DataMonitorState} from './types';

const computeInitBooleanState = <M extends ReactiveObject & object>(
	$model: M,
	defaultValue: boolean,
	defName: '$visible' | '$disabled' | '$readonly',
	$def?: VisiblePropValue<M> | DisabledPropValue<M> | ReadonlyPropValue<M>
): boolean => {
	let value: boolean = defaultValue;
	if ($def != null) {
		switch (typeof $def) {
			case 'boolean': {
				value = $def;
				break;
			}
			case 'function': {
				try {
					value = $def($model);
				} catch (e) {
					console.error(`Failed to invoke ${defName} function, and value is treated as ${defaultValue}.`, $def, e);
				}
				break;
			}
			case 'object': {
				const {default: defaultFunc} = $def;
				if (defaultFunc != null) {
					const typeOfDefaultFunc = typeof defaultFunc;
					if (typeOfDefaultFunc === 'boolean') {
						value = defaultFunc as boolean;
					} else if (typeOfDefaultFunc !== 'function') {
						console.error(`${defName}.default is not a function, and value is treated as ${defaultValue}.`, $def);
					} else {
						try {
							value = (defaultFunc as DefaultBoolFunc<M>)($model);
						} catch (e) {
							console.error(`Failed to invoke ${defName}.default function, and value is treated as ${defaultValue}.`, $def, e);
						}
					}
				}
				break;
			}
			default: {
				// never happen, treated as true
				console.error(`Type of ${defName} is not supported, and value is treated as ${defaultValue}.`, $def);
				break;
			}
		}
	}
	return value;
};
const computeInitVisibleState =
	<M extends ReactiveObject & object>(
		$model: M,
		$visible?: VisiblePropValue<M>
	): boolean => {
		return computeInitBooleanState($model, true, '$visible', $visible);
	};
const computeInitDisabledState =
	<M extends ReactiveObject & object>(
		$model: M,
		$disabled?: DisabledPropValue<M>
	): boolean => {
		return computeInitBooleanState($model, false, '$disabled', $disabled);
	};
const computeInitReadonlyState =
	<M extends ReactiveObject & object>(
		$model: M,
		$readonly?: ReadonlyPropValue<M>
	): boolean => {
		return computeInitBooleanState($model, false, '$readonly', $readonly);
	};
export const computeInitDataMonitorState =
	<M extends ReactiveObject & object>(
		$model: M,
		$visible?: VisiblePropValue<M>,
		$disabled?: DisabledPropValue<M>,
		$readonly?: ReadonlyPropValue<M>
	): DataMonitorState => {
		return {
			visible: computeInitVisibleState($model, $visible),
			disabled: computeInitDisabledState($model, $disabled),
			readonly: computeInitReadonlyState($model, $readonly)
		};
	};
