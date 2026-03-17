export interface HxWithCheckSettings {
	/** keep message label or not, when there is no message */
	keepLabel?: boolean;
}

export const HxWithCheckDefaults: Required<HxWithCheckSettings> = {
	keepLabel: false
};

export const configHxWithCheck = (settings: HxWithCheckSettings) => {
	HxWithCheckDefaults.keepLabel = settings.keepLabel ?? HxWithCheckDefaults.keepLabel;
};
