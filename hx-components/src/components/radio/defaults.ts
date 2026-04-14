import type {HxRadioValuePair} from './radio';

/**
 * Global configuration settings for HxRadio component
 */
export interface HxRadioSettings {
	allowUnchecked?: boolean;
	/** Default value pair for checked/unchecked states */
	values?: HxRadioValuePair;
	enterToSwitchValue?: boolean;
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
