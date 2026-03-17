export interface HxLabelSettings {
	/** use i18n when value from model, or not, default false */
	valueUseI18N?: boolean;
}

export const HxLabelDefaults: Required<HxLabelSettings> = {
	valueUseI18N: false
};

export const configHxLabel = (settings: HxLabelSettings) => {
	HxLabelDefaults.valueUseI18N = settings.valueUseI18N ?? HxLabelDefaults.valueUseI18N;
};
