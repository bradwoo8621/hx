import type {HxRadioValuePair} from './types';

/**
 * Global configuration settings for HxRadio component
 */
export interface HxRadioSettings {
	/** Whether a click or key press on an already checked radio may clear it (default false) */
	allowUnchecked?: boolean;
	/** Default value pair for checked/unchecked states */
	values?: HxRadioValuePair;
	/** Whether the Enter key selects the radio (default false) */
	enterToSwitchValue?: boolean;
	/** Whether the Space key selects the radio (default true) */
	spaceToSwitchValue?: boolean;
}

/**
 * Default configuration values for HxRadio
 */
export const HxRadioDefaults: Required<HxRadioSettings> = {
	allowUnchecked: false,
	values: [true, false],
	enterToSwitchValue: false,
	spaceToSwitchValue: true
};

/**
 * Configure global default settings for all HxRadio instances
 * @param settings - Configuration options to override defaults
 */
export const configHxRadio = (settings: HxRadioSettings) => {
	HxRadioDefaults.allowUnchecked = settings.allowUnchecked ?? HxRadioDefaults.allowUnchecked;
	HxRadioDefaults.values = settings.values ?? HxRadioDefaults.values;
	HxRadioDefaults.enterToSwitchValue = settings.enterToSwitchValue ?? HxRadioDefaults.enterToSwitchValue;
	HxRadioDefaults.spaceToSwitchValue = settings.spaceToSwitchValue ?? HxRadioDefaults.spaceToSwitchValue;
};
