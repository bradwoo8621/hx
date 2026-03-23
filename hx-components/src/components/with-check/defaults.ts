export interface HxWithCheckSettings {
	/** always keep message label dom structure or not, when there is no message to presents */
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
 * configHxWithCheck({
 *   alwaysKeepMessageDOM: true
 * });
 */
export const configHxWithCheck = (settings: HxWithCheckSettings) => {
	HxWithCheckDefaults.alwaysKeepMessageDOM = settings.alwaysKeepMessageDOM ?? HxWithCheckDefaults.alwaysKeepMessageDOM;
};
