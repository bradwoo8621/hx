export interface HxWithCheckSettings {
	keepLabel?: boolean;
}

export const HxWithCheckDefaults: Required<HxWithCheckSettings> = {
	keepLabel: false
};

export const configHxWithCheck = (settings: HxWithCheckSettings) => {
	HxWithCheckDefaults.keepLabel = settings.keepLabel ?? HxWithCheckDefaults.keepLabel;
};
