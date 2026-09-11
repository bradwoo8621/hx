import type {CheckPropSuppliedOn} from '../../hooks';
import type {HxEditSingleFieldProps} from '../../types';
import type {HxWithCheckCreateOptions} from './types';

export interface HxWithCheckSettings {
	/** Always render the message element even when there is no error, to prevent layout shift (default false) */
	alwaysKeepMessageDOM?: boolean;
}

export const HxWithCheckDefaults: Required<HxWithCheckSettings> = {
	alwaysKeepMessageDOM: false
};

/**
 * Configure global default settings for all HxWithCheck wrapped components.
 * Use this function to set application-wide defaults for validation behavior.
 *
 * @example
 * // Set global default to always keep message DOM
 * ```ts
 * configHxWithCheck({
 *   alwaysKeepMessageDOM: true
 * });
 * ```
 */
export const configHxWithCheck = (settings: HxWithCheckSettings) => {
	HxWithCheckDefaults.alwaysKeepMessageDOM = settings.alwaysKeepMessageDOM ?? HxWithCheckDefaults.alwaysKeepMessageDOM;
};

export const HxWithCheckWithSingleFieldOptions: HxWithCheckCreateOptions<object, HxEditSingleFieldProps<object>> = {
	$supplyOn: (props: HxEditSingleFieldProps<object>): CheckPropSuppliedOn => {
		return props.$field;
	}
};
