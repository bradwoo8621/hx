export interface HxOptionsLabelSettings {
	/** i18n translation key for loading state text */
	optionsOnLoadKey?: string;
	/** i18n translation key for empty options state text */
	noOptionsKey?: string;
	/** i18n translation key for option not found state text */
	optionNotFoundKey?: string;
}

export const HxOptionsLabelDefaults: Required<HxOptionsLabelSettings> = {
	optionsOnLoadKey: '~HxCommon.SelectOptionsOnLoad',
	noOptionsKey: '~HxCommon.SelectNoOptions',
	optionNotFoundKey: '~HxCommon.SelectOptionNotFound'
};

export const configHxOptionsLabel = (settings: HxOptionsLabelSettings) => {
	HxOptionsLabelDefaults.optionsOnLoadKey = settings.optionsOnLoadKey?.trim() || HxOptionsLabelDefaults.optionsOnLoadKey;
	HxOptionsLabelDefaults.noOptionsKey = settings.noOptionsKey?.trim() || HxOptionsLabelDefaults.noOptionsKey;
	HxOptionsLabelDefaults.optionNotFoundKey = settings.optionNotFoundKey?.trim() || HxOptionsLabelDefaults.optionNotFoundKey;
};
