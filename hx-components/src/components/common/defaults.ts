export interface HxCommonSettings {
	modelDateTimeFormat?: string;
	modelDateFormat?: string;
	modelTimeFormat?: string;
}

export const HxModelDateTimeFormat = 'YYYY/MM/DDTHH:mm:ss';
export const HxModelDateFormat = 'YYYY/MM/DD';
export const HxModelTimeFormat = 'HH:mm:ss';

export const HxCommonDefaults: Required<HxCommonSettings> = {
	modelDateTimeFormat: HxModelDateTimeFormat,
	modelDateFormat: HxModelDateFormat,
	modelTimeFormat: HxModelTimeFormat
};

export const configHxCommon = (settings: HxCommonSettings) => {
	HxCommonDefaults.modelDateTimeFormat = settings.modelDateTimeFormat ?? HxCommonDefaults.modelDateTimeFormat;
	HxCommonDefaults.modelDateFormat = settings.modelDateFormat || HxCommonDefaults.modelDateFormat;
	HxCommonDefaults.modelTimeFormat = settings.modelTimeFormat || HxCommonDefaults.modelTimeFormat;
};
