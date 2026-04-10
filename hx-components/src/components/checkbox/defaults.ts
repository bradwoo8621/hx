import type {HxCheckboxValuePair} from './checkbox';

/**
 * Global configuration settings for HxCheckbox component
 */
export interface HxCheckboxSettings {
	/** Default value pair for checked/unchecked states */
	values?: HxCheckboxValuePair;
}

/**
 * Default configuration values for HxCheckbox
 */
export const HxCheckboxDefaults: Required<HxCheckboxSettings> = {
	values: [true, false]
};

/**
 * Configure global default settings for all HxCheckbox instances
 * @param settings - Configuration options to override defaults
 */
export const configHxCheckbox = (settings: HxCheckboxSettings) => {
	HxCheckboxDefaults.values = settings.values ?? HxCheckboxDefaults.values;
};
