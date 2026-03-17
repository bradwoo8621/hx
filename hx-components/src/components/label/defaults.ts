export interface HxLabelSettings {
	/** allow value from model applying i18n or not, default false */
	i18nValueAllowed?: boolean;
}

export const HxLabelDefaults: Required<HxLabelSettings> = {
	i18nValueAllowed: false
};

export const configHxLabel = (settings: HxLabelSettings) => {
	HxLabelDefaults.i18nValueAllowed = settings.i18nValueAllowed ?? HxLabelDefaults.i18nValueAllowed;
};
