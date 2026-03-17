import type {DefaultBoolFunc, DisabledPropValue, HxObject, ReadonlyPropValue, VisiblePropValue} from '../../types';
import type {DataMonitorState} from './types';

const computeInitBooleanState = <T extends object>(
	$model: HxObject<T>,
	defaultValue: boolean,
	defName: '$visible' | '$disabled' | '$readonly',
	$def?: VisiblePropValue<T> | DisabledPropValue<T> | ReadonlyPropValue<T>
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
							value = (defaultFunc as DefaultBoolFunc<T>)($model);
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
	<T extends object>(
		$model: HxObject<T>,
		$visible?: VisiblePropValue<T>
	): boolean => {
		return computeInitBooleanState($model, true, '$visible', $visible);
	};
const computeInitDisabledState =
	<T extends object>(
		$model: HxObject<T>,
		$disabled?: DisabledPropValue<T>
	): boolean => {
		return computeInitBooleanState($model, false, '$disabled', $disabled);
	};
const computeInitReadonlyState =
	<T extends object>(
		$model: HxObject<T>,
		$readonly?: ReadonlyPropValue<T>
	): boolean => {
		return computeInitBooleanState($model, false, '$readonly', $readonly);
	};
export const computeInitDataMonitorState =
	<T extends object>(
		$model: HxObject<T>,
		$visible?: VisiblePropValue<T>,
		$disabled?: DisabledPropValue<T>,
		$readonly?: ReadonlyPropValue<T>
	): DataMonitorState => {
		return {
			visible: computeInitVisibleState($model, $visible),
			disabled: computeInitDisabledState($model, $disabled),
			readonly: computeInitReadonlyState($model, $readonly)
		};
	};
