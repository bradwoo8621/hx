import type {HxCheckboxValuePair} from './types';

/**
 * Global configuration settings for HxCheckbox component
 */
export interface HxCheckboxSettings {
	/** Default value pair for checked/unchecked states */
	values?: HxCheckboxValuePair;
	/** Whether the Enter key toggles the value (default false) */
	enterToSwitchValue?: boolean;
	/** Whether the Space key toggles the value (default true) */
	spaceToSwitchValue?: boolean;
}

/**
 * Default configuration values for HxCheckbox
 */
export const HxCheckboxDefaults: Required<HxCheckboxSettings> = {
	values: [true, false],
	enterToSwitchValue: false,
	spaceToSwitchValue: true
};

/**
 * Configure global default settings for all HxCheckbox instances
 * @param settings - Configuration options to override defaults
 */
export const configHxCheckbox = (settings: HxCheckboxSettings) => {
	HxCheckboxDefaults.values = settings.values ?? HxCheckboxDefaults.values;
	HxCheckboxDefaults.enterToSwitchValue = settings.enterToSwitchValue ?? HxCheckboxDefaults.enterToSwitchValue;
	HxCheckboxDefaults.spaceToSwitchValue = settings.spaceToSwitchValue ?? HxCheckboxDefaults.spaceToSwitchValue;
};
