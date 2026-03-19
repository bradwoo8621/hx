export interface HxWithCheckSettings {
	/** always keep message label dom structure or not, when there is no message to presents */
	alwaysKeepMessageDOM?: boolean;
}

export const HxWithCheckDefaults: Required<HxWithCheckSettings> = {
	alwaysKeepMessageDOM: false
};

export const configHxWithCheck = (settings: HxWithCheckSettings) => {
	HxWithCheckDefaults.alwaysKeepMessageDOM = settings.alwaysKeepMessageDOM ?? HxWithCheckDefaults.alwaysKeepMessageDOM;
};
